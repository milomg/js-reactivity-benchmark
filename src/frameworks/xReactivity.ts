import { ReactiveFramework } from "../util/reactiveFramework";
import {
  flushSync,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from "@solidjs/signals";

export const xReactivityFramework: ReactiveFramework = {
  name: "x-reactivity",
  signal: (initialValue) => {
    const [getter, setter] = createSignal(initialValue as any);
    return {
      write: (v) => setter(v as any),
      read: () => getter(),
    };
  },
  computed: (fn) => {
    const memo = createMemo(fn);
    return {
      read: () => memo(),
    };
  },
  effect: (fn) => createEffect(fn, () => {}),
  withBatch: (fn) => {
    fn();
    flushSync();
  },
  withBuild: (fn) => createRoot(fn),
};
