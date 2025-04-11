import { ReactiveFramework } from "../util/reactiveFramework";
import { batch, computed, effect, signal } from "@preact/signals";

let toCleanup: (() => void)[] = [];
export const preactSignalFramework: ReactiveFramework = {
  name: "Preact Signals",
  signal: (initialValue) => {
    const s = signal(initialValue);
    return {
      write: (v) => (s.value = v),
      read: () => s.value,
    };
  },
  computed: (fn) => {
    const c = computed(fn);
    return {
      read: () => c.value,
    };
  },
  effect: (fn) => toCleanup.push(effect(fn)),
  withBatch: (fn) => batch(fn),
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup();
    }
    toCleanup = [];
  },
};
