import { ReactiveFramework } from "../util/reactiveFramework";
import { proxy } from "valtio/vanilla";
import { watch } from "valtio/utils";

type WatchGet = <T extends object>(proxyObject: T) => T;

// stack of watch getters because Valtio doesn't auto-track dependency reads
let watchGet: Array<WatchGet> = [];

export const valtioFramework: ReactiveFramework = {
  name: "Valtio",
  signal: (initialValue) => {
    const s = proxy({ value: initialValue });
    return {
      write: (v) => (s.value = v),
      read: () => {
        const get = watchGet.at(-1);
        if (get) {
          return get(s).value;
        } else {
          return s.value;
        }
      },
    };
  },
  computed: (fn) => {
    const c = proxy({
      get value() {
        return fn();
      },
    });
    return {
      read: () => {
        const get = watchGet.at(-1);
        if (get) {
          return get(c).value;
        } else {
          return c.value;
        }
      },
    };
  },
  effect: (fn) => {
    return watch(
      (get) => {
        watchGet.push(get);
        fn();
        watchGet.pop();
      },
      {
        sync: true,
      }
    );
  },
  withBatch: (fn) => fn(),
  withBuild: (fn) => fn(),
};
