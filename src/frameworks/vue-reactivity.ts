import { ReactiveFramework } from "../util/reactiveFramework";
import {
  computed,
  shallowRef,
  effect
} from "@vue/reactivity";

export function createSignal<T>(value: T): [() => T, typeof set] {
  const r = shallowRef(value)
  const get = () => r.value as T
  const set = (v: T) => {
    r.value = typeof v === 'function' ? v(r.value) : v
  }
  return [get, set]
}

export const vueFramework: ReactiveFramework = {
  name: "Vue Reactivity",
  signal: (initialValue) => {
    const [getter, setter] = createSignal(initialValue);
    return {
      write: setter,
      read: getter,
    };
  },
  computed: (fn) => {
    const memo = computed(fn);
    return {
      read: () => memo.value,
    };
  },
  run: () => { },
  effect,
  withBatch: (fn) => fn(),
  withBuild: (fn) => fn(),
};
