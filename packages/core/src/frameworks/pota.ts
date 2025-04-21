import { ReactiveFramework } from "../util/reactiveFramework";
import {
  batch,
  effect as createEffect,
  memo as createMemo,
  root as createRoot,
  signal as createSignal,
} from "pota";

export const potaFramework: ReactiveFramework = {
  name: "Pota",
  signal: (initialValue) => {
    const [getter, setter] = createSignal(initialValue);
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
  effect: (fn) => createEffect(fn),
  withBatch: (fn) => batch(fn),
  withBuild: (fn) =>
    createRoot((dispose) => {
      potaFramework.cleanup = dispose;
      return fn();
    }),
  cleanup: () => {},
};

