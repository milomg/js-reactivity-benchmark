import {
  computed,
  effect,
  endBatch,
  signal,
  startBatch,
} from "alien-signals/esm";
import { ReactiveFramework } from "../util/reactiveFramework";

let toCleanup: (() => void)[] = [];

export const alienFramework: ReactiveFramework = {
  name: "Alien Signals",
  signal: (initial) => {
    const data = signal(initial);
    return {
      read: () => data(),
      write: (v) => data(v),
    };
  },
  computed: (fn) => {
    const c = computed(fn);
    return {
      read: () => c(),
    };
  },
  effect: (fn) => toCleanup.push(effect(fn)),
  withBatch: (fn) => {
    startBatch();
    fn();
    endBatch();
  },
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup();
    }
    toCleanup = [];
  },
};
