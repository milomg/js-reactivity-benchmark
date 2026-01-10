import { batch, createEffect, Memo, State } from "@zeix/cause-effect";
import type { ReactiveFramework } from "../util/reactiveFramework";

let cleanups: (() => void)[] = [];
export const causeEffectFramework: ReactiveFramework = {
  name: "Cause & Effect",
  // @ts-expect-error ReactiveFramework doesn't have non-nullable signals
  signal: <T extends {}>(initialValue: T) => {
    const state = new State(initialValue);
    return {
      write: (v) => state.set(v as any),
      read: () => state.get(),
    };
  },
  // @ts-expect-error ReactiveFramework doesn't have non-nullable signals
  computed: <T extends {}>(fn: () => T) => {
    const memo = new Memo(fn);
    return {
      read: () => memo.get(),
    };
  },
  effect: (fn) => {
    cleanups.push(createEffect(fn));
  },
  withBatch: (fn) => batch(fn),
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of cleanups) cleanup();
    cleanups = [];
  },
};
