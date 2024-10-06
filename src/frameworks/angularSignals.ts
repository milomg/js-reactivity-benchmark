import { ReactiveFramework } from "../util/reactiveFramework";
import { signal, computed } from "@angular/core";
import { createWatch, Watch } from "@angular/core/primitives/signals";

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
  effect: (fn) => effect(fn),
  withBatch: (fn) => {
    fn();
    flushEffects();
  },
  withBuild: (fn) => fn(),
};

let queue = new Set<Watch>();

/**
 * Wrapper around Angular's core effect primitive `Watch`, decoupled from
 * dependency injection, cleanup, and other unrelated concepts.
 */
function effect(effectFn: () => void): void {
  const w = createWatch(effectFn, queue.add.bind(queue), true);

  // Run effect immediately
  w.run();
}

function flushEffects(): void {
  for (const watch of queue) {
    queue.delete(watch);
    watch.run();
  }
}
