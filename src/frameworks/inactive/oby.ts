import { ReactiveFramework } from "../../util/reactiveFramework";
import $ from "oby";

let toCleanup: (() => void)[] = [];
export const obyFramework: ReactiveFramework = {
  name: "Oby",
  signal: (initialValue) => {
    const observable = $(initialValue);
    return {
      write: (v) => observable(v),
      read: () => observable(),
    };
  },
  computed: (fn) => {
    const memo = $.memo(fn);
    return {
      read: () => memo(),
    };
  },
  effect: (fn) => toCleanup.push($.effect(fn)),
  withBatch: (fn) => {
    fn();
    $.tick();
  },
  withBuild: (fn) => $.root(fn),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup();
    }
    toCleanup = [];
  },
};
