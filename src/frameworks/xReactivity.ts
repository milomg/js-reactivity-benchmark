import { ReactiveFramework } from "../util/reactiveFramework";
import {
  flushSync,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from "@solidjs/reactivity";

export const xReactivityFramework: ReactiveFramework = {
  name: "x-reactivity",
  signal: (initialValue) => {
    const [getter, setter] = createSignal(initialValue);
    return {
      write: setter,
      read: getter,
    };
  },
  computed: (fn) => {
    const memo = createMemo(fn);
    return {
      read: memo,
    };
  },
  effect: createEffect,
  withBatch: (fn) => {
    fn();
    flushSync();
  },
  withBuild: createRoot,
};
