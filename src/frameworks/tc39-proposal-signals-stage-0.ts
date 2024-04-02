import { ReactiveFramework } from "../util/reactiveFramework";
import { Signal } from "signal-polyfill";


export const tc39SignalsProposalStage0: ReactiveFramework = {
  name: "@angular/signals",
  signal: (initialValue) => {
    const s = new Signal.State(initialValue);
    return {
      write: s.set,
      read: s.get,
    };
  },
  computed: (fn) => {
    const c = new Signal.Computed(fn);
    return {
      read: c.get,
    };
  },
  effect: (fn) => effect(fn),
  withBatch: (fn) => {
    fn();
    processPending();
  },
  withBuild: (fn) => fn(),
};

let needsEnqueue = false;

const w = new Signal.subtle.Watcher(() => {
  if (needsEnqueue) {
    needsEnqueue = false;
    queueMicrotask.enqueue(processPending);
  }
});

function processPending() {
  needsEnqueue = true;

  for (const s of w.getPending()) {
    s.get();
  }

  w.watch();
}

export function effect(callback) {
  let cleanup;

  const computed = new Signal.Computed(() => {
    typeof cleanup === "function" && cleanup();
    cleanup = callback();
  });

  w.watch(computed);
  computed.get();

  return () => {
    w.unwatch(computed);
    typeof cleanup === "function" && cleanup();
  };
}
