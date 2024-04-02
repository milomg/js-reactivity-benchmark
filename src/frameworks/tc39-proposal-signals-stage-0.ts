import { ReactiveFramework } from "../util/reactiveFramework";
import { Signal } from "signal-polyfill";


export const tc39SignalsProposalStage0: ReactiveFramework = {
  name: "TC39 Signals Proposal: Stage 0",
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
