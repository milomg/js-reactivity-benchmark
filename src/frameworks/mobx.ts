import { computed, observable, autorun, runInAction } from "mobx";
import { ReactiveFramework } from "../util/reactiveFramework";

export const mobxFramework: ReactiveFramework = {
  name: "MobX",
  signal(initial) {
    const s = observable.box(initial, { deep: false });
    return {
      read: () => s.get(),
      write: (x) => s.set(x),
    };
  },
  computed: (fn) => {
    const read = computed(fn);
    return {
      read: () => read.get(),
    };
  },
  effect: (fn) => autorun(fn),
  withBatch: (fn) => runInAction(fn),
  withBuild: (fn) => fn(),
};
