import type { ReactiveFramework } from "../util/reactiveFramework";

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

let markedHeap = false;
let context: Computed<unknown> | null = null;

let minDirty = 0;
let maxDirty = 0;
const dirtyHeap: (Computed<unknown> | undefined)[] = new Array(2000);
export function increaseHeapSize(n: number) {
  if (n > dirtyHeap.length) dirtyHeap.length = n;
}

function insertIntoHeap(n: Computed<unknown>) {
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
}

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
  if (context) {
    if (context.depsTail === null) {
      self.height = context.height;
      recompute(self, false);
    } else {
      self.height = context.height + 1;
      insertIntoHeap(self);
    }
    link(self, context);
  } else {
    recompute(self, false);
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
  el.flags = ReactiveFlags.None;
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

  if (value !== el.value) {
    el.value = value;

    for (let s = el.subs; s !== null; s = s.nextSub) {
      const o = s.sub;
      const flags = o.flags;
      if (flags & ReactiveFlags.Check) o.flags = flags | ReactiveFlags.Dirty;
      insertIntoHeap(o);
    }
  }
}

function updateIfNecessary(el: Computed<unknown>): void {
  if (el.flags & ReactiveFlags.Check) {
    for (let d = el.deps; d; d = d.nextDep) {
      const dep = d.dep;
      if ("fn" in dep) updateIfNecessary(dep);
      if (el.flags & ReactiveFlags.Dirty) break;
    }
  }

  if (el.flags & ReactiveFlags.Dirty) recompute(el, true);

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
  if (context) {
    link(el, context);

    const owner = "owner" in el ? el.owner : el;
    if ("fn" in owner) {
      const height = owner.height;
      if (height >= context.height) context.height = height + 1;
      if (
        height >= minDirty ||
        owner.flags & (ReactiveFlags.Dirty | ReactiveFlags.Check)
      ) {
        markHeap();
        updateIfNecessary(owner);
      }
    }
  }
  return el.value;
}

export function setSignal(el: Signal<unknown>, v: unknown) {
  if (el.value === v) return;
  el.value = v;
  for (let link = el.subs; link !== null; link = link.nextSub) {
    markedHeap = false;
    insertIntoHeap(link.sub);
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

function markHeap() {
  if (markedHeap) return;
  markedHeap = true;
  for (let i = 0; i <= maxDirty; i++) {
    for (let el = dirtyHeap[i]; el !== undefined; el = el.nextHeap)
      markNode(el);
  }
}

export function stabilize() {
  for (minDirty = 0; minDirty <= maxDirty; minDirty++) {
    let el = dirtyHeap[minDirty];
    dirtyHeap[minDirty] = undefined;
    while (el !== undefined) {
      const next = el.nextHeap;
      recompute(el, false);
      el = next;
    }
  }
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
export const r3Framework: ReactiveFramework = {
  name: "r3",
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
