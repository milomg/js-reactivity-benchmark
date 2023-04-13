import { ReactiveFramework } from "../util/reactiveFramework";
import $ from "oby";

export const obyFramework: ReactiveFramework = {
  name: "Oby",
  signal: (initialValue) => {
    const observable = $(initialValue);
    return {
      write: observable,
      read: observable,
    };
  },
  computed: (fn) => {
    const memo = $.memo(fn);
    return {
      read: memo,
    };
  },
  effect: $.effect,
  withBatch: (fn) => {
    fn();
    $.tick();
  },
  withBuild: $.root,
};
