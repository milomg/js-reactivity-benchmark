import { ReactiveFramework } from "../util/reactiveFramework";
import { Signal } from "signal-polyfill";

let toCleanup: (() => void)[] = [];

export const tc39SignalsFramework: ReactiveFramework = {
  name: "TC39 Signals Polyfill",
  signal: (initialValue) => {
    const s = new Signal.State(initialValue);
    return {
      write: (v) => s.set(v),
      read: () => s.get(),
    };
  },
  computed: (fn) => {
    const c = new Signal.Computed(fn);
    return {
      read: () => c.get(),
    };
  },
  effect: (fn) => effect(fn),
  withBatch: (fn) => {
    fn();
    processPending();
  },
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup();
    }
    toCleanup = [];
  },
};

let needsEnqueue = false;

const w = new Signal.subtle.Watcher(() => {
  if (needsEnqueue) {
    needsEnqueue = false;
    (async () => {
      await Promise.resolve();
      // next micro queue
      processPending();
    })();
  }
});

function processPending() {
  needsEnqueue = true;

  for (const s of w.getPending()) {
    s.get();
  }

  w.watch();
}

export function effect(callback: any) {
  const computed = new Signal.Computed(() => callback());

  w.watch(computed);
  computed.get();

  toCleanup.push(() => w.unwatch(computed));
}
