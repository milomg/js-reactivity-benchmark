import { ReactiveFramework } from "../util/reactiveFramework";
import { writable, computed, batch } from "@amadeus-it-group/tansu";

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
  effect: (fn) => computed(fn).subscribe(() => {}),
  withBatch: (fn) => batch(fn),
  withBuild: (fn) => fn(),
  cleanup: () => {
    // No-op?
  },
};
