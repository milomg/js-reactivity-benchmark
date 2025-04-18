import {
  computed,
  effect,
  endBatch,
  signal,
  startBatch,
  effectScope
} from "alien-signals/esm";
import { ReactiveFramework } from "../util/reactiveFramework";

let scope: (() => void) | null = null;

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
  effect: (fn) => effect(fn),
  withBatch: (fn) => {
    startBatch();
    fn();
    endBatch();
  },
  withBuild: <T>(fn: () => T) => {
    let out!: T;
    scope = effectScope(() => {
      out = fn();
    });
    return out;
  },
  cleanup: () => {
    scope!();
    scope = null;
  },
};
