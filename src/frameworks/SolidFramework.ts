import { ReactiveFramework } from "../util/ReactiveFramework";
import {
  batch,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from "solid-js/dist/solid.cjs";

export const solidFramework: ReactiveFramework = {
  name: "SolidJS",
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
  run: () => {},
  effect: createEffect,
  withBatch: batch,
  withBuild: createRoot,
};
