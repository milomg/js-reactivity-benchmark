import type { ReactiveFramework } from "../util/reactiveFramework";

/**
 * Push-Pull R3 - A lazy evaluation variant of the r3 reactivity system
 *
 * This implementation uses a push-pull algorithm for optimal execution counts:
 *
 * PUSH PHASE (on signal write):
 * - Marks direct subscribers as Dirty
 * - Propagates Check flags downstream through the dependency graph
 * - Does NOT eagerly recompute - just marks state
 *
 * PULL PHASE (on read):
 * - Recursively updates dependencies if they have Check/Dirty flags
 * - Only recomputes nodes that are actually read
 * - Handles diamond dependencies correctly by checking if value changed
 *
 * KEY OPTIMIZATIONS:
 * 1. Lazy initialization: Computeds are marked Dirty on creation, computed on first read
 * 2. Diamond dependency handling: If a computed's value doesn't change after recomputing,
 *    its subscribers remain Check (not escalated to Dirty), preventing over-execution
 * 3. Height-based ordering: Maintains topological guarantees through height tracking
 * 4. FirewallSignals: Support for signals created inside computeds with proper ownership
 *
 * TRADE-OFFS:
 * - Minimal execution count (great for virtualized lists, fractional reads)
 * - Read-time overhead (checking flags, potentially recomputing)
 * - No automatic batching benefits (stabilize() is a no-op)
 */

export type Disposable = () => void;

export enum ReactiveFlags {
  None = 0,
  Check = 1 << 0,
  Dirty = 1 << 1,
  RecomputingDeps = 1 << 2,
  InHeap = 1 << 3,
}

export interface Link {
  dep: Signal<unknown> | Computed<unknown>;
  sub: Computed<unknown>;
  nextDep: Link | null;
  prevSub: Link | null;
  nextSub: Link | null;
}

export interface RawSignal<T> {
  subs: Link | null;
  subsTail: Link | null;
  value: T;
}

interface FirewallSignal<T> extends RawSignal<T> {
  owner: Computed<unknown>;
  nextChild: FirewallSignal<unknown> | null;
}

export type Signal<T> = RawSignal<T> | FirewallSignal<T>;

export interface Computed<T> extends RawSignal<T> {
  deps: Link | null;
  depsTail: Link | null;
  flags: ReactiveFlags;
  height: number;
  nextHeap: Computed<unknown> | undefined;
  prevHeap: Computed<unknown>;
  disposal: Disposable | Disposable[] | null;
  fn: () => T;
  child: FirewallSignal<unknown> | null;
}

// let markedHeap = false;
let context: Computed<unknown> | null = null;

// let minDirty = 0;
// let maxDirty = 0;
const dirtyHeap: (Computed<unknown> | undefined)[] = new Array(2000);
export function increaseHeapSize(n: number) {
  if (n > dirtyHeap.length) dirtyHeap.length = n;
}

/* function insertIntoHeap(n: Computed<unknown>) {
  const flags = n.flags;
  if (flags & ReactiveFlags.InHeap) return;
  n.flags = flags | ReactiveFlags.InHeap;
  const height = n.height;
  const heapAtHeight = dirtyHeap[height];
  if (heapAtHeight === undefined) {
    dirtyHeap[height] = n;
  } else {
    const tail = heapAtHeight.prevHeap;
    tail.nextHeap = n;
    n.prevHeap = tail;
    heapAtHeight.prevHeap = n;
  }
  if (height > maxDirty) {
    maxDirty = height;
  }
} */

function deleteFromHeap(n: Computed<unknown>) {
  const flags = n.flags;
  if (!(flags & ReactiveFlags.InHeap)) return;
  n.flags = flags & ~ReactiveFlags.InHeap;
  const height = n.height;
  if (n.prevHeap === n) {
    dirtyHeap[height] = undefined;
  } else {
    const next = n.nextHeap;
    const dhh = dirtyHeap[height]!;
    const end = next ?? dhh;
    if (n === dhh) {
      dirtyHeap[height] = next;
    } else {
      n.prevHeap.nextHeap = next;
    }
    end.prevHeap = n.prevHeap;
  }
  n.prevHeap = n;
  n.nextHeap = undefined;
}

export function computed<T>(fn: () => T): Computed<T> {
  const self: Computed<T> = {
    disposal: null,
    fn: fn,
    value: undefined as T,
    height: 0,
    child: null,
    nextHeap: undefined,
    prevHeap: null as any,
    deps: null,
    depsTail: null,
    subs: null,
    subsTail: null,
    flags: ReactiveFlags.None,
  };
  self.prevHeap = self;

  // Pure lazy evaluation: Always mark as dirty on creation
  // This ensures we never over-execute during graph construction
  // The first read() will trigger computation via updateIfNecessary()
  self.flags = ReactiveFlags.Dirty;

  if (context) {
    self.height = context.height + 1;
    link(self, context);
  }

  return self;
}

export function signal<T>(v: T, firewall: Computed<unknown>): FirewallSignal<T>;
export function signal<T>(v: T): Signal<T>;
export function signal<T>(
  v: T,
  firewall: Computed<unknown> | null = null,
): Signal<T> {
  if (firewall !== null) {
    firewall.child = {
      value: v,
      subs: null,
      subsTail: null,
      owner: firewall,
      nextChild: firewall.child,
    };
    return firewall.child as Signal<T>;
  } else {
    return {
      value: v,
      subs: null,
      subsTail: null,
    };
  }
}

function recompute(el: Computed<unknown>, del: boolean) {
  if (del) {
    deleteFromHeap(el);
  } else {
    el.nextHeap = undefined;
    el.prevHeap = el;
  }

  runDisposal(el);
  const oldcontext = context;
  context = el;
  el.depsTail = null;
  el.flags = ReactiveFlags.RecomputingDeps;
  const value = el.fn();
  context = oldcontext;

  const depsTail = el.depsTail as Link | null;
  let toRemove = depsTail !== null ? depsTail.nextDep : el.deps;
  if (toRemove !== null) {
    do {
      toRemove = unlinkSubs(toRemove);
    } while (toRemove !== null);
    if (depsTail !== null) depsTail.nextDep = null;
    else el.deps = null;
  }

  // CRITICAL: Only mark subscribers dirty if value actually changed
  // This is the key to handling diamond dependencies correctly.
  //
  // In a diamond (A->B->D, A->C->D), when A changes:
  // - B and C are marked Dirty
  // - D is marked Check
  // - When reading D, we check B (recomputes, value changes) and C (recomputes)
  // - If C's value doesn't change, D stays Check (not escalated to Dirty)
  // - D then doesn't need to recompute since its dependencies' values are stable
  if (value !== el.value) {
    el.value = value;

    // Mark subscribers as dirty/check
    for (let s = el.subs; s !== null; s = s.nextSub) {
      const o = s.sub;
      const flags = o.flags;
      if (flags & ReactiveFlags.Check) {
        o.flags = flags | ReactiveFlags.Dirty;
      } else {
        markNode(o, ReactiveFlags.Dirty);
      }
    }
  }

  // Clear flags after recompute
  el.flags = ReactiveFlags.None;
}

function updateIfNecessary(el: Computed<unknown>): void {
  // If marked Check, recursively update dependencies to see if we're actually dirty
  if (el.flags & ReactiveFlags.Check) {
    for (let d = el.deps; d; d = d.nextDep) {
      const dep = d.dep;
      if ("fn" in dep) updateIfNecessary(dep);
      // Early exit if dependency recomputation escalated us to Dirty
      if (el.flags & ReactiveFlags.Dirty) break;
    }
  }

  // Only recompute if we're actually Dirty (not just Check)
  if (el.flags & ReactiveFlags.Dirty) {
    recompute(el, true);
  }

  // Clear flags after checking/recomputing
  // If we were only Check and dependencies didn't escalate us to Dirty,
  // our value is still valid and we didn't need to recompute
  el.flags = ReactiveFlags.None;
}

// https://github.com/stackblitz/alien-signals/blob/v2.0.3/src/system.ts#L100
function unlinkSubs(link: Link): Link | null {
  const dep = link.dep;
  const nextDep = link.nextDep;
  const nextSub = link.nextSub;
  const prevSub = link.prevSub;
  if (nextSub !== null) nextSub.prevSub = prevSub;
  else dep.subsTail = prevSub;

  if (prevSub !== null) {
    prevSub.nextSub = nextSub;
  } else {
    dep.subs = nextSub;
    if (nextSub === null && "fn" in dep) unwatched(dep);
  }
  return nextDep;
}

function unwatched(el: Computed<unknown>) {
  deleteFromHeap(el);
  let dep = el.deps;
  while (dep !== null) dep = unlinkSubs(dep);
  el.deps = null;
  runDisposal(el);
}

// https://github.com/stackblitz/alien-signals/blob/v2.0.3/src/system.ts#L52
function link(
  dep: Signal<unknown> | Computed<unknown>,
  sub: Computed<unknown>,
) {
  const prevDep = sub.depsTail;
  if (prevDep !== null && prevDep.dep === dep) return;
  let nextDep: Link | null = null;
  const isRecomputing = sub.flags & ReactiveFlags.RecomputingDeps;
  if (isRecomputing) {
    nextDep = prevDep !== null ? prevDep.nextDep : sub.deps;
    if (nextDep !== null && nextDep.dep === dep) {
      sub.depsTail = nextDep;
      return;
    }
  }

  const prevSub = dep.subsTail;
  if (
    prevSub !== null &&
    prevSub.sub === sub &&
    (!isRecomputing || isValidLink(prevSub, sub))
  )
    return;
  sub.depsTail = dep.subsTail = {
    dep,
    sub,
    nextDep,
    prevSub,
    nextSub: null,
  };
  const newLink = sub.depsTail;
  if (prevDep !== null) prevDep.nextDep = newLink;
  else sub.deps = newLink;

  if (prevSub !== null) prevSub.nextSub = newLink;
  else dep.subs = newLink;
}

// https://github.com/stackblitz/alien-signals/blob/v2.0.3/src/system.ts#L284
function isValidLink(checkLink: Link, sub: Computed<unknown>): boolean {
  const depsTail = sub.depsTail;
  if (depsTail !== null) {
    let link = sub.deps!;
    do {
      if (link === checkLink) return true;
      if (link === depsTail) break;
      link = link.nextDep!;
    } while (link !== null);
  }
  return false;
}

export function read<T>(el: Signal<T> | Computed<T>): T {
  const owner = "owner" in el ? el.owner : el;

  // PULL: Update if dirty/check
  // This is the "pull" in push-pull - we only compute when actually read
  if (
    "fn" in owner &&
    owner.flags & (ReactiveFlags.Dirty | ReactiveFlags.Check)
  ) {
    updateIfNecessary(owner);
  }

  // Link to current reactive context if any
  if (context) {
    link(el, context);

    if ("fn" in owner) {
      const height = owner.height;
      if (height >= context.height) {
        context.height = height + 1;
      }
    }
  }

  return el.value;
}

export function setSignal(el: Signal<unknown>, v: unknown) {
  if (el.value === v) return;
  el.value = v;

  // PUSH: Mark subscribers as dirty, propagate Check downstream
  // This is the "push" in push-pull - we propagate dirty state but don't compute
  for (let link = el.subs; link !== null; link = link.nextSub) {
    markNode(link.sub, ReactiveFlags.Dirty);
  }
}

function markNode(el: Computed<unknown>, newState = ReactiveFlags.Dirty) {
  const flags = el.flags;
  if ((flags & (ReactiveFlags.Check | ReactiveFlags.Dirty)) >= newState) return;
  el.flags = flags | newState;
  for (let link = el.subs; link !== null; link = link.nextSub)
    markNode(link.sub, ReactiveFlags.Check);
  if (el.child !== null) {
    for (
      let child: FirewallSignal<unknown> | null = el.child;
      child !== null;
      child = child.nextChild
    ) {
      for (let link = child.subs; link !== null; link = link.nextSub)
        markNode(link.sub, ReactiveFlags.Check);
    }
  }
}

/* function markHeap() {
  if (markedHeap) return;
  markedHeap = true;
  for (let i = 0; i <= maxDirty; i++) {
    for (let el = dirtyHeap[i]; el !== undefined; el = el.nextHeap)
      markNode(el);
  }
} */

export function stabilize() {
  // No-op in push-pull mode
  // Unlike the eager r3 algorithm which processes the entire dirty heap here,
  // push-pull mode computes lazily during read() calls
  // This gives us minimal execution count but requires checking flags on every read
}

export function onCleanup(fn: Disposable): Disposable {
  if (!context) return fn;

  const node = context;

  if (!node.disposal) node.disposal = fn;
  else if (Array.isArray(node.disposal)) node.disposal.push(fn);
  else node.disposal = [node.disposal, fn];
  return fn;
}

function runDisposal(node: Computed<unknown>): void {
  if (!node.disposal) return;

  if (Array.isArray(node.disposal)) {
    for (let i = 0; i < node.disposal.length; i++) {
      const callable = node.disposal[i];
      callable.call(callable);
    }
  } else {
    node.disposal.call(node.disposal);
  }

  node.disposal = null;
}

export function getContext(): Computed<unknown> | null {
  return context;
}

const cleanups: (() => void)[] = [];
export const pushPullR3Framework: ReactiveFramework = {
  name: "pushPullR3",
  signal: (initialValue) => {
    const s = signal(initialValue);
    return {
      write: (v) => setSignal(s, v),
      read: () => read(s),
    };
  },
  computed: (fn) => {
    const c = computed(fn);
    return {
      read: () => read(c),
    };
  },
  effect: (fn) => {
    const e = computed(fn);
    read(e);
    cleanups.push(() => unwatched(e));
  },
  withBatch: (fn) => {
    fn();
    stabilize();
  },
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (let i = 0; i < cleanups.length; i++) cleanups[i]();
    cleanups.length = 0;
  },
};
