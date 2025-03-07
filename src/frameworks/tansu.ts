import { ReactiveFramework } from "../util/reactiveFramework";
import { writable, computed, batch } from "@amadeus-it-group/tansu";

let toCleanup: (() => void)[] = [];
export const tansuFramework: ReactiveFramework = {
  name: "@amadeus-it-group/tansu",
  signal: (initialValue) => {
    const w = writable(initialValue);
    return {
      write: (v) => w.set(v),
      read: () => w(),
    };
  },
  computed: (fn) => {
    const c = computed(fn);
    return {
      read: () => c(),
    };
  },
  effect: (fn) => toCleanup.push(computed(fn).subscribe(() => {})),
  withBatch: (fn) => batch(fn),
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup();
    }
    toCleanup = [];
  },
};
