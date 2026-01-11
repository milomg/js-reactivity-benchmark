import type { ReactiveFramework } from "../util/reactiveFramework";

/**
 * Based on @reactively/core
 *
 * @see https://github.com/milomg/reactively/tree/main
 * @license MIT
 *
 * Copyright (c) 2023 modderme123
 */

/* === Types === */

// biome-ignore lint/suspicious/noExplicitAny: explicitly allow any Signal
type UnknownSignal = Signal<any>;

/**
 * Public API types.
 *
 * These are compile-time contracts used by the framework layer:
 * - `State<T>` exposes `get()` and `set()`
 * - `Computed<T>` exposes only `get()`
 * - `Effect` exposes `get()` (run) and `dispose()` (stop)
 *
 * Runtime-wise, all of them are instances of the single `Signal` class.
 */
type Effect = Pick<UnknownSignal, "get" | "dispose">;

type MemoCallback<T> = (oldValue: T) => T;

type Disposer = () => void;

export type Scope = {
  /**
   * Run a function within this scope (similar to a framework's `withBuild`).
   *
   * Effects created while running in this scope will be registered and kept alive
   * until the scope is disposed.
   */
  run<T>(fn: () => T): T;
  /**
   * Dispose this scope, disposing all effects created within it.
   */
  dispose(): void;
};

/**
 * Effect callback.
 *
 * It may optionally return a cleanup function. Cleanup functions are executed:
 * - before the next re-run of the same effect, and
 * - when the effect is disposed.
 */
// biome-ignore lint/suspicious/noConfusingVoidType: optional dispose function
type EffectCallback = () => (() => void) | void;

type CacheFlag = typeof CACHE_CLEAN | typeof CACHE_CHECK | typeof CACHE_DIRTY;
type CacheStale = typeof CACHE_CHECK | typeof CACHE_DIRTY;

type EffectStatus =
  | typeof EFFECT_NONE
  | typeof EFFECT_READY
  | typeof EFFECT_QUEUED
  | typeof EFFECT_DISPOSED;

/* === Constants === */

const TYPE_STATE = "State";
const TYPE_COMPUTED = "Computed";
const TYPE_EFFECT = "Effect";

const CACHE_CLEAN = 0; // Signal value is valid, no need to recompute
const CACHE_CHECK = 1; // Signal value might be stale, check parent nodes to decide whether to recompute
const CACHE_DIRTY = 2; // Signal value is invalid, parents have changed, value needs to be recomputed

/**
 * Effect status state machine:
 * - NONE: not an effect
 * - READY: effect exists and may be queued
 * - QUEUED: effect is already queued in `pendingEffects`
 * - DISPOSED: effect disposed; must never be queued or run again
 */
const EFFECT_NONE = 0;
const EFFECT_DISPOSED = 1;
const EFFECT_READY = 2;
const EFFECT_QUEUED = 3;

/* === Internal === */

let activeWatcher: UnknownSignal | undefined;
let capturedSources: UnknownSignal[] | null = null;
let sourceCursor = 0;

// Effect scope stack. If a scope is active, effects created will register their disposer here.
let activeScope: Disposer[] | null = null;

// A list of queued effect nodes that will be executed when flush() is called
const pendingEffects: UnknownSignal[] = [];

// Function to call if there are queued effect nodes
let onEffectQueued: ((effect: Effect) => void) | undefined;

// WeakMap to store cleanup functions for each signal (better encapsulation than public property)
const signalCleanups = new WeakMap<UnknownSignal, Array<() => void>>();

let batchDepth = 0;

/* === Class === */

/**
 * Base `Signal` class.
 *
 * This library uses a *single* runtime class for:
 * - **State**: holds a mutable value (`get()` + `set(value)`)
 * - **Computed**: derives a value from other signals (`get()` only)
 * - **Effect**: runs side effects and is scheduled via the effect queue (`get()` + `dispose()`)
 *
 * The framework layer enforces the public API via the `State`, `Computed`, and `Effect` TypeScript types.
 *
 * Notes:
 * - Calling `get()` outside of a reactive context is always valid and returns the latest value.
 * - `dispose()` is meaningful for effects. It exists on the class for implementation reasons, and the
 *   framework/type layer should ensure only effects are disposed by user code.
 *
 * @since 0.17.4
 * @param {MemoCallback<T> | T} fnOrValue - Function or value to initialize the signal.
 * @param {boolean} effect - Whether this signal is an effect.
 */
class Signal<T extends {}> {
  protected value: T;
  protected callback?: MemoCallback<T>;
  protected equals = (a: T, b: T) => a === b;

  protected flag: CacheFlag;
  protected effect: EffectStatus = EFFECT_NONE;
  protected watchers: UnknownSignal[] | null = null; // Nodes that have us as sources (down links)
  protected sources: UnknownSignal[] | null = null; // Sources in reference order, not deduplicated (up links)

  constructor(fnOrValue: MemoCallback<T> | T, effect?: boolean) {
    if (typeof fnOrValue === "function") {
      this.callback = fnOrValue as MemoCallback<T>;
      // biome-ignore lint/suspicious/noExplicitAny: temporarily undefined
      this.value = undefined as any;
      this.flag = CACHE_DIRTY;
      if (effect) {
        this.effect = EFFECT_QUEUED;
        pendingEffects.push(this);
        onEffectQueued?.(this as unknown as Effect);
      }
    } else {
      this.callback = undefined;
      this.value = fnOrValue;
      this.flag = CACHE_CLEAN;
    }
  }

  /**
   * Get the type of signal as a string tag.
   */
  get [Symbol.toStringTag](): string {
    return this.effect
      ? TYPE_EFFECT
      : this.callback
        ? TYPE_COMPUTED
        : TYPE_STATE;
  }

  /**
   * Get current value.
   *
   * @returns {T} - Current value.
   */
  get(): T {
    if (activeWatcher) {
      // If we're re-reading the same dependency sequence, just advance cursor
      if (!capturedSources && activeWatcher.sources?.[sourceCursor] === this) {
        sourceCursor++;
      } else {
        // Otherwise capture into a new list
        if (!capturedSources) capturedSources = [this];
        else capturedSources.push(this);
      }
    }
    if (this.callback) this.updateIfNeeded();
    return this.value;
  }

  /**
   * Set value or function.
   *
   * @param {T | MemoCallback<T>} fnOrValue - Value or function to set.
   */
  set(fnOrValue: T | MemoCallback<T>): void {
    if (typeof fnOrValue === "function") {
      const fn = fnOrValue as MemoCallback<T>;
      if (fn !== this.callback) {
        this.callback = fn;
        this.markStale(CACHE_DIRTY);
      }
    } else {
      if (this.callback) {
        this.unlinkSourcesFrom(0);
        this.sources = null;
        this.callback = undefined;
      }
      const value = fnOrValue as T;
      if (!this.equals(this.value, value)) {
        this.value = value;
        if (this.watchers?.length) {
          for (let i = 0; i < this.watchers.length; i++)
            this.watchers[i].markStale(CACHE_DIRTY);
        }
      }
    }
  }

  /**
   * Dispose an effect.
   *
   * This stops the effect from being scheduled again and runs any registered cleanups.
   *
   * Although this method exists on the base class (single-class runtime), it is only
   * intended to be called for **effects**. The framework/type layer should prevent
   * calling `dispose()` on state/computed signals.
   */
  dispose(): void {
    // `dispose()` is only meaningful for effects.
    // For state/computed signals this is a no-op by contract (framework/type layer should prevent it).
    if (this.effect < EFFECT_READY) return;

    // Mark as disposed (no future queueing/runs)
    this.effect = EFFECT_DISPOSED;

    // Run cleanup functions
    const cleanups = signalCleanups.get(this);
    if (cleanups?.length) {
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
      signalCleanups.delete(this);
    }

    // Detach from all sources so this effect doesn't keep the graph alive
    if (this.sources) {
      this.unlinkSourcesFrom(0);
      this.sources = null;
    }

    // Clear watchers (downlinks) to release references; watchers should re-evaluate if needed
    if (this.watchers) this.watchers.length = 0;

    // Clear callback to allow GC
    this.callback = undefined;
  }

  /**
   * Transition a queued effect back to READY before running.
   * This allows the effect to re-queue itself during execution if needed.
   *
   * Internal: used by `flush()` to avoid writing to the protected `effect` field directly.
   */
  dequeue(): boolean {
    const queued = this.effect === EFFECT_QUEUED;
    if (queued) this.effect = EFFECT_READY;
    return queued;
  }

  /**
   * Push stale flag to watchers (direction downstream in signal graph).
   *
   * @param {CacheStale} flag - The cache flag to mark watching nodes.
   */
  protected markStale(flag: CacheStale): void {
    if (this.flag < flag) {
      // If we were previously clean, queue this effect once.
      if (this.flag === CACHE_CLEAN && this.effect === EFFECT_READY) {
        this.effect = EFFECT_QUEUED;
        pendingEffects.push(this);
        onEffectQueued?.(this as unknown as Effect);
      }

      this.flag = flag;
      if (this.watchers?.length) {
        for (let i = 0; i < this.watchers.length; i++)
          this.watchers[i].markStale(CACHE_CHECK);
      }
    }
  }

  /**
   * Remove all old sources' `.watchers` links to us (direction upstream in signal graph).
   *
   * While unlinking, if any source becomes unobserved (its watcher list becomes empty),
   * it will auto-detach from its own sources to avoid keeping upstream nodes alive.
   *
   * @param {number} index - The index of the source to invalidate.
   * @returns {void}
   */
  protected unlinkSourcesFrom(index: number): void {
    if (!this.sources) return;
    for (let i = index; i < this.sources.length; i++) {
      // Remove from watchers array, swap with last element and pop
      const watchers: UnknownSignal[] | null = this.sources[i].watchers;
      if (!watchers) continue;
      const swap = watchers.findIndex((v: UnknownSignal) => v === this);
      if (swap === -1) continue;
      watchers[swap] = watchers[watchers.length - 1];
      watchers.pop();
    }
  }

  /**
   * Main function to update the value of the signal.
   */
  protected run(): void {
    if (!this.callback) return;

    const oldValue = this.value;

    // Evalute the reactive function body, dynamically capturing any other signals used
    const prevWatcher = activeWatcher;
    const prevSources = capturedSources;
    const prevCursor = sourceCursor;

    activeWatcher = this;
    // biome-ignore lint/suspicious/noExplicitAny: temporarily null
    capturedSources = null as any; // prevent TS from thinking capturedSources is null below
    sourceCursor = 0;

    try {
      // 1) Run and clear cleanup functions from WeakMap
      const cleanups = signalCleanups.get(this);
      if (cleanups?.length) {
        for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
        cleanups.length = 0;
      }

      // 2) Execute under dependency tracking
      this.value = this.callback(this.value);

      // 3) Reconcile sources/watchers
      if (capturedSources) {
        // Remove all old sources' .watchers links to us
        this.unlinkSourcesFrom(sourceCursor);
        // Update source up links
        if (sourceCursor && this.sources) {
          this.sources.length = sourceCursor + capturedSources.length;
          for (let i = 0; i < capturedSources.length; i++)
            this.sources[sourceCursor + i] = capturedSources[i];
        } else {
          this.sources = capturedSources;
        }

        // Add ourselves to the end of the parent .watchers array (lazy init)
        for (let i = sourceCursor; i < this.sources.length; i++) {
          const source = this.sources[i];
          if (source.watchers) source.watchers.push(this);
          else source.watchers = [this];
        }
      } else if (this.sources && sourceCursor < this.sources.length) {
        // Remove all old sources' .watchers links to us
        this.unlinkSourcesFrom(sourceCursor);
        this.sources.length = sourceCursor;
      }
    } finally {
      capturedSources = prevSources;
      activeWatcher = prevWatcher;
      sourceCursor = prevCursor;
    }

    // 4) Diamond: if value changed, force children DIRTY
    if (this.watchers?.length && !this.equals(oldValue, this.value)) {
      // We've changed value, so mark our children as dirty so they'll reevaluate
      for (let i = 0; i < this.watchers.length; i++)
        this.watchers[i].flag = CACHE_DIRTY;
    }

    this.flag = CACHE_CLEAN;
  }

  /**
   * Pull updated source values (upstream in signal graph).
   */
  protected updateIfNeeded(): void {
    // If we are potentially dirty, see if we have a parent who has actually changed value
    if (this.flag === CACHE_CHECK && this.sources?.length) {
      for (let i = 0; i < this.sources.length; i++) {
        this.sources[i].updateIfNeeded(); // updateIfNeeded() can change this.state
        if ((this.flag as CacheFlag) === CACHE_DIRTY) break;
      }
    }

    // If we were already dirty or marked dirty by the step above, update.
    if (this.flag === CACHE_DIRTY) this.run();

    // By now, we're clean
    this.flag = CACHE_CLEAN;
  }
}

/* === Functions === */

/**
 * Flush pending effects.
 *
 * Runs each queued effect at most once per flush. Disposed effects are skipped.
 */
const flush = (): void => {
  for (let i = 0; i < pendingEffects.length; i++) {
    const effect = pendingEffects[i];
    if (effect.dequeue()) effect.get();
  }
  pendingEffects.length = 0;
};

/**
 * Create a scope that collects effect disposers.
 *
 * Any effects created while `run()` is executing are kept alive by this scope
 * until `dispose()` is called.
 */
const createScope = /*#__PURE__*/ (): Scope => {
  let disposed = false;
  const scope = [] as Disposer[];

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    for (let i = scope.length - 1; i >= 0; i--) scope[i]();
    scope.length = 0;
  };

  const run = <T>(fn: () => T): T => {
    if (disposed) return fn();
    const prev = activeScope;
    activeScope = scope;
    try {
      const result = fn();
      // Ensure initial runs of effects created during build happen before returning.
      flush();
      return result;
    } finally {
      activeScope = prev;
    }
  };

  return { run, dispose };
};

/**
 * Batch multiple updates.
 *
 * @param {() => void} fn - Function to execute within the batch.
 */
const batch = (fn: () => void): void => {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) flush();
  }
};

/**
 * Create an effect.
 *
 * The callback runs immediately (via the effect queue) and re-runs whenever any of its
 * tracked dependencies change.
 *
 * The callback may return a cleanup function. Cleanup functions are executed:
 * - before the next re-run of the same effect, and
 * - when the effect is disposed.
 *
 * @since 0.1.0
 * @param {EffectCallback} fn - Effect callback.
 * @returns {() => void} - Dispose function for the effect.
 */
const createEffect = /*#__PURE__*/ (fn: EffectCallback): (() => void) => {
  const effect = new Signal(fn, true);
  const dispose = () => effect.dispose();
  activeScope?.push(dispose);
  return dispose;
};

/* === Test Framework === */

const cleanups = new Set<() => void>();
let currentScope: ReturnType<typeof createScope> | null = null;

export const cfxFramework: ReactiveFramework = {
  name: "cfx",
  // @ts-expect-error ReactiveFramework doesn't have non-nullable signals
  signal: <T extends {}>(initialValue: T) => {
    const s = new Signal(initialValue);
    return {
      // biome-ignore lint/suspicious/noExplicitAny: we suport updater functions in .set()
      write: (v) => s.set(v as any),
      read: () => s.get(),
    };
  },
  // @ts-expect-error ReactiveFramework doesn't have non-nullable signals
  computed: <T extends {}>(fn: () => T) => {
    const c = new Signal<T>((_old: T) => fn());
    return {
      read: () => c.get(),
    };
  },
  effect: (fn) => {
    // biome-ignore lint/suspicious/noExplicitAny: we support returning a disposer
    const dispose = createEffect(fn as any);
    if (!currentScope) cleanups.add(dispose);
  },
  withBatch: (fn) => batch(fn),
  withBuild: (fn) => {
    const scope = createScope();
    const prevScope = currentScope;
    currentScope = scope;
    try {
      const result = scope.run(fn);
      cleanups.add(() => scope.dispose());
      return result;
    } finally {
      currentScope = prevScope;
    }
  },
  cleanup: () => {
    for (const dispose of cleanups) dispose();
    cleanups.clear();
  },
};
