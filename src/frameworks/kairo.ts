import { ReactiveFramework } from "../util/reactiveFramework";
import { batch, computed, effect, mutValue } from "kairo";
import { collectScope } from "kairo";

export const kairoFramework: ReactiveFramework = {
  name: "kairo",
  signal: (initialValue) => {
    const [get, write] = mutValue(initialValue);
    return {
      read: () => get.value,
      write,
    };
  },
  computed: (fn) => {
    const c = computed(() => {
      return fn();
    });
    return {
      read: () => c.value,
    };
  },
  effect: effect,
  withBatch: batch,
  withBuild: (fn) => {
    const endCollectScope = collectScope();
    let out = fn();
    endCollectScope();
    return out;
  },
};
