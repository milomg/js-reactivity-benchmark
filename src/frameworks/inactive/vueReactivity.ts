import { computed, ref, effect, ReactiveEffect } from "@vue/reactivity";
import { ReactiveFramework } from "../../util/reactiveFramework";

let scheduled = [] as ReactiveEffect[];
let toCleanup: ReactiveEffect<unknown>[] = [];
export const vueReactivityFramework: ReactiveFramework = {
  name: "Vue",
  signal: (initial) => {
    const data = ref(initial);
    return {
      read: () => data.value as any,
      write: (v) => (data.value = v as any),
    };
  },
  computed: (fn) => {
    const c = computed(fn);
    return {
      read: () => c.value,
    };
  },
  effect: (fn) => {
    let t = effect(fn, {
      scheduler: () => {
        scheduled.push(t.effect);
      },
    });
    toCleanup.push(t.effect);
  },
  withBatch: (fn) => {
    fn();
    flushEffects();
  },
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup.stop();
    }
    toCleanup = [];
  },
};

function flushEffects() {
  while (scheduled.length) {
    scheduled.pop()!.run();
  }
}
