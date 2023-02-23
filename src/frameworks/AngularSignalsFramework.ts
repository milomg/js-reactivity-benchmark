import { ReactiveFramework } from "../util/ReactiveFramework";
import { signal, computed, effect, runWatchQueue } from "@angular/core";

export const angularFramework: ReactiveFramework = {
  name: "@angular/signals",
  signal: (initialValue) => {
    const s = signal(initialValue);
    return {
      write: (v) => s.set(v),
      read: () => s(),
    };
  },
  computed: (fn) => {
    const c = computed(fn);
    return {
      read: () => c(),
    };
  },
  run: () => {},
  effect,
  withBatch: (fn) => {
    fn();
    runWatchQueue();
  },
  withBuild: (fn) => fn(),
};
