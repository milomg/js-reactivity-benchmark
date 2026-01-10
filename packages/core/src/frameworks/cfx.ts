import type { ReactiveFramework } from "../util/reactiveFramework";

// biome-ignore lint/suspicious/noExplicitAny: explicitly allow any Signal
type UnknownSignal = Signal<any>;

type MemoCallback<T> = (oldValue: T) => T;
// type TaskCallback<T> = (oldValue: T, signal: AbortSignal) => Promise<T>;

let activeWatcher: UnknownSignal | undefined;
let currentSources: UnknownSignal[] | null = null;
let currentIndex = 0;

// WeakMap to store cleanup functions for each signal (better encapsulation than public property)
const signalCleanups = new WeakMap<UnknownSignal, Array<() => void>>();

/**
 * Register a cleanup function to be called when the current reactive context is disposed.
 * Must be called within a computed or effect context.
 */
export function onCleanup(fn: () => void): void {
  if (!activeWatcher) {
    throw new Error("onCleanup must be called within a reactive context");
  }
  let cleanups = signalCleanups.get(activeWatcher);
  if (!cleanups) {
    cleanups = [];
    signalCleanups.set(activeWatcher, cleanups);
  }
  cleanups.push(fn);
}

// A list of non-clean effect nodes that will be updated when flush() is called
const pendingEffects: UnknownSignal[] = [];

let effectToRun: ((effect: UnknownSignal) => void) | undefined; // Function to call if there are dirty effect nodes

export const CACHE_CLEAN = 0; // Signal value is valid, no need to recompute
export const CACHE_CHECK = 1; // Signal value might be stale, check parent nodes to decide whether to recompute
export const CACHE_DIRTY = 2; // Signal value is invalid, parents have changed, value needs to be recomputed

export type CacheFlag =
  | typeof CACHE_CLEAN
  | typeof CACHE_CHECK
  | typeof CACHE_DIRTY;
type CacheNonClean = typeof CACHE_CHECK | typeof CACHE_DIRTY;

export class Signal<T extends {}> {
  protected value: T;
  protected effect: boolean;
  protected callback?: MemoCallback<T>;
  protected equals = (a: T, b: T) => a === b;

  protected flag: CacheFlag;
  protected watchers: UnknownSignal[] = []; // Nodes that have us as sources (down links)
  protected sources: UnknownSignal[] | null = null; // Sources in reference order, not deduplicated (up links)
  protected disposed: boolean = false;

  constructor(fnOrValue: MemoCallback<T> | T, effect?: boolean) {
    if (typeof fnOrValue === "function") {
      this.callback = fnOrValue as MemoCallback<T>;
      // biome-ignore lint/suspicious/noExplicitAny: temporarily undefined
      this.value = undefined as any;
      this.effect = effect || false;
      this.flag = CACHE_DIRTY;
      if (effect) {
        pendingEffects.push(this);
        effectToRun?.(this);
      }
    } else {
      this.callback = undefined;
      this.value = fnOrValue;
      this.flag = CACHE_CLEAN;
      this.effect = false;
    }
  }

  /**
   * Get current value.
   *
   * @returns {T} - Current value.
   */
  get(): T {
    if (activeWatcher) {
      if (!currentSources && activeWatcher.sources?.[currentIndex] === this) {
        currentIndex++;
      } else {
        if (!currentSources) currentSources = [this];
        else currentSources.push(this);
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
        this.unlinkSources(0);
        this.sources = null;
        this.callback = undefined;
      }
      const value = fnOrValue as T;
      if (!this.equals(this.value, value)) {
        this.value = value;
        for (let i = 0; i < this.watchers.length; i++)
          this.watchers[i].markStale(CACHE_DIRTY);
      }
    }
  }

  /**
   * Dispose this signal and clean up all dependencies.
   * Removes all watchers and sources links to prevent memory leaks.
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    // Run cleanup functions from WeakMap
    const cleanups = signalCleanups.get(this);
    if (cleanups) {
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
      signalCleanups.delete(this);
    }

    // Unlink from all sources
    if (this.sources) {
      this.unlinkSources(0);
      this.sources = null;
    }

    // Clear all watchers (they should unlink themselves, but be safe)
    this.watchers.length = 0;

    // Clear callback to allow GC
    this.callback = undefined;
  }

  /**
   * Get cleanup function.
   *
   * @returns {() => void} Cleanup function.
   */
  get cleanup(): () => void {
    return () => this.dispose();
  }

  /**
   * Push stale state to watchers (direction downstream in signal graph).
   *
   * @param state - The cache state to mark watching nodes.
   */
  protected markStale(state: CacheNonClean): void {
    if (this.flag < state) {
      // If we were previously clean, then we know that we may need to update to get the new value
      if (this.flag === CACHE_CLEAN && this.effect) {
        pendingEffects.push(this);
        effectToRun?.(this);
      }

      this.flag = state;
      for (let i = 0; i < this.watchers.length; i++)
        this.watchers[i].markStale(CACHE_CHECK);
    }
  }

  /**
   * Remove all old sources' .watchers links to us (direction upstream in signal graph).
   *
   * @param {number} index - The index of the source to invalidate.
   * @returns {void}
   */
  protected unlinkSources(index: number): void {
    if (!this.sources) return;
    for (let i = index; i < this.sources.length; i++) {
      // We don't actually delete sources here because we're replacing the entire array soon
      const watchers: UnknownSignal[] = this.sources[i].watchers;
      const watcherIndex = watchers.indexOf(this);
      if (watcherIndex !== -1) {
        watchers[watcherIndex] = watchers[watchers.length - 1];
        watchers.pop();
      }
    }
  }

  /**
   * Main function to update the value of the signal.
   */
  protected run(): void {
    if (!this.callback) return;

    const oldValue = this.value;

    // Evalute the reactive function body, dynamically capturing any other signals used
    const prevReaction = activeWatcher;
    const prevGets = currentSources;
    const prevIndex = currentIndex;

    activeWatcher = this;
    // biome-ignore lint/suspicious/noExplicitAny: temporarily null
    currentSources = null as any; // prevent TS from thinking CurrentGets is null below
    currentIndex = 0;

    try {
      // Run and clear cleanup functions from WeakMap
      const cleanups = signalCleanups.get(this);
      if (cleanups?.length) {
        for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
        cleanups.length = 0;
      }

      this.value = this.callback(this.value);

      // Update source & watcher links after a change in this node (both directions).
      if (currentSources) {
        // Remove all old sources' .watchers links to us
        this.unlinkSources(currentIndex);
        // Update source up links
        if (currentIndex && this.sources) {
          this.sources.length = currentIndex + currentSources.length;
          for (let i = 0; i < currentSources.length; i++)
            this.sources[currentIndex + i] = currentSources[i];
        } else {
          this.sources = currentSources;
        }

        // Add ourselves to the end of the parent .watchers array
        for (let i = currentIndex; i < this.sources.length; i++)
          this.sources[i].watchers.push(this);
      } else if (this.sources && currentIndex < this.sources.length) {
        // Remove all old sources' .watchers links to us
        this.unlinkSources(currentIndex);
        this.sources.length = currentIndex;
      }
    } finally {
      currentSources = prevGets;
      activeWatcher = prevReaction;
      currentIndex = prevIndex;
    }

    // Handles diamond dependencies if we're the parent of a diamond
    if (!this.equals(oldValue, this.value)) {
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
    if (this.flag === CACHE_CHECK && this.sources) {
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

// Run all pending effect nodes
export const flush = (): void => {
  for (let i = 0; i < pendingEffects.length; i++) pendingEffects[i].get();
  pendingEffects.length = 0;
};

/**
 * Create an effect that runs immediately and re-runs when dependencies change.
 * Returns a dispose function to stop the effect.
 */
export const createEffect = (fn: () => void): (() => void) => {
  const effect = new Signal(fn, true);
  return () => effect.dispose();
};

/* === Test Framework === */

const cleanups: (() => void)[] = [];
export const cfxFramework: ReactiveFramework = {
  name: "cfx",
  // @ts-expect-error ReactiveFramework doesn't have non-nullable signals
  signal: <T extends {}>(initialValue: T) => {
    const s = new Signal(initialValue);
    return {
      write: (v) => s.set(v as any),
      read: () => s.get(),
    };
  },
  // @ts-expect-error ReactiveFramework doesn't have non-nullable signals
  computed: <T extends {}>(fn: () => T) => {
    const c = new Signal(fn);
    return {
      read: () => c.get(),
    };
  },
  effect: (fn) => {
    const e = new Signal(fn, true);
    cleanups.push(() => e.dispose());
  },
  withBatch: (fn) => {
    fn();
    flush();
  },
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (let i = 0; i < cleanups.length; i++) cleanups[i]();
    cleanups.length = 0;
  },
};
