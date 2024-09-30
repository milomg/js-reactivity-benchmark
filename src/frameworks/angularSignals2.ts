import { ReactiveFramework } from "../util/reactiveFramework";
import {
  createComputed,
  createSignal,
  createWatch,
  SIGNAL,
  signalSetFn,
  Watch,
} from "@angular/core/primitives/signals";

let queue: Array<Watch> = [];

export const angularFramework: ReactiveFramework = {
  name: "@angular/signal2",
  signal: (initialValue) => {
    const s = createSignal(initialValue);
    return {
      write: (v) => signalSetFn(s[SIGNAL], v),
      read: () => s(),
    };
  },
  computed: (fn) => {
    const c = createComputed(fn);
    return {
      read: () => c(),
    };
  },
  /**
   * Wrapper around Angular's core effect primitive `Watch`, decoupled from dependency injection,
   * cleanup, and other unrelated concepts.
   */
  effect: (fn) => {
    const w = createWatch(fn, queue.push.bind(queue), true);

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
    watch.run();
  }
  queue.length = 0;
}
