import { computed, observable, autorun, transaction, action } from "mobx";
import { ReactiveFramework } from "../util/reactiveFramework";

export const mobxFramework: ReactiveFramework = {
  name: "MobX",
  signal(initial) {
    const s = observable.box(initial);
    return {
      read: () => s.get(),
      write: (x) => action(() => s.set(x)),
    };
  },
  computed: (fn) => {
    const read = computed(fn);
    return {
      read: () => read.get(),
    };
  },
  effect: (fn) => {
    const disposer = autorun(fn);
    return () => {
      disposer();
    };
  },
  withBatch: (fn) => {
    transaction(fn);
  },
  withBuild: (fn) => {
    return fn();
  },
};
