import { signal, computed, syncEffect, batch, createRoot } from "compostate";
import { ReactiveFramework } from "../../util/reactiveFramework";

let toCleanup: (() => void)[] = [];
export const compostateFramework: ReactiveFramework = {
  name: "Compostate",
  signal: (initialValue) => {
    const [get, set] = signal(initialValue);
    return {
      write: (v) => set(v),
      read: () => get(),
    };
  },
  computed: (fn) => {
    const get = computed(fn);
    return {
      read: () => get(),
    };
  },
  effect: (fn) => toCleanup.push(syncEffect(fn)),
  withBatch: (fn) => batch(fn),
  withBuild: (fn) => createRoot(fn),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup();
    }
    toCleanup = [];
  },
};
