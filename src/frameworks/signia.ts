import { ReactiveFramework } from "../util/reactiveFramework";
import { atom, computed, react, transact } from "signia";

export const signiaFramework: ReactiveFramework = {
  name: "Signia",
  signal: (initialValue) => {
    const s = atom("s", initialValue);
    return {
      write: (v) => s.set(v),
      read: () => s.value,
    };
  },
  computed: (fn) => {
    const c = computed("c", fn);
    return {
      read: () => c.value,
    };
  },
  effect: (fn) => react("r", fn),
  withBatch: (fn) => transact(fn),
  withBuild: (fn) => fn(),
};
