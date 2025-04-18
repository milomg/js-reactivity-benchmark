import { computed, effect, EffectScope, effectScope, ReactiveEffect, shallowRef } from "@vue/reactivity";
import { ReactiveFramework } from "../../util/reactiveFramework";

let scheduled = [] as ReactiveEffect[];
let scope: EffectScope | null = null;
export const vueReactivityFramework: ReactiveFramework = {
  name: "Vue",
  signal: (initial) => {
    const data = shallowRef(initial);
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
  },
  withBatch: (fn) => {
    fn();
    flushEffects();
  },
  withBuild: (fn) => {
    scope = effectScope();
    return scope.run(fn)!;
  },
  cleanup: () => {
    scope!.stop();
    scope = null;
  },
};

function flushEffects() {
  while (scheduled.length) {
    scheduled.pop()!.run();
  }
}
