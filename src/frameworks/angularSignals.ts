import { ReactiveFramework } from "../util/reactiveFramework";
import { signal, computed, effect, Injector, EffectManager } from "@angular/core";

const effectManager = new EffectManager();
const injector = Injector.create({
  providers: [
    {
      provide: EffectManager,
      useValue: effectManager,
    },
  ],
});

export const angularFramework: ReactiveFramework = {
  name: "@angular/signals",
  signal: (initialValue) => {
    const s = signal(initialValue);
    return {
      write: (v) => s.set(v),
      read: () => s(),
    };
  },
  computed: (fn) => {
    const c = computed(fn);
    return {
      read: () => c(),
    };
  },
  effect: (fn) => effect(fn, { injector }),
  withBatch: (fn) => {
    fn();
    effectManager.flush();
  },
  withBuild: (fn) => fn(),
};
