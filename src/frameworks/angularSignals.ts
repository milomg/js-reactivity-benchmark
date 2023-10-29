import { ReactiveFramework } from "../util/reactiveFramework";
import { signal, computed } from "@angular/core";
import { createWatch, Watch } from "@angular/core/primitives/signals";

let queue = new Set<Watch>();

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
  /**
   * Wrapper around Angular's core effect primitive `Watch`, decoupled from dependency injection,
   * cleanup, and other unrelated concepts.
   */
  effect: (fn) => {
    const w = createWatch(fn, queue.add.bind(queue), true);

    // Effects start dirty.
    w.notify();
  },
  withBatch: (fn) => {
    fn();
    flushEffects();
  },
  withBuild: (fn) => fn(),
};

function flushEffects(): void {
  for (const watch of queue) {
    queue.delete(watch);
    watch.run();
  }
}
