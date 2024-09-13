import {
  computed,
  effectScope,
  shallowRef,
  effect,
  ReactiveEffect,
} from "@vue/reactivity";
import { ReactiveFramework } from "../util/reactiveFramework";

let scheduled = [] as ReactiveEffect[];
let batching = false;

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
  // withBatch: (fn) => fn(),
  withBatch: (fn) => {
    if (batching) {
      fn();
    } else {
      batching = true;
      fn();
      while (scheduled.length) {
        scheduled.pop()!.run();
      }
      batching = false;
    }
  },
  // withBuild: (fn) => fn()
  withBuild: (fn) => {
    const e = effectScope();
    const r = e.run(fn)!;
    e.stop();
    return r;
  },
};
