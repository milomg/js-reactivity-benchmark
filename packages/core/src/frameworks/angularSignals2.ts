import { ReactiveFramework } from "../util/reactiveFramework";
import {
  signal,
  computed,
  effect,
  Injector,
  ɵChangeDetectionScheduler,
  ɵEffectScheduler,
  untracked,
} from "@angular/core";

interface SchedulableEffect {
  run(): void;
}
export class ArrayEffectScheduler implements ɵEffectScheduler {
  private queue = new Set<SchedulableEffect>();

  schedule(handle: SchedulableEffect): void {
    this.queue.add(handle);
  }

  add(e: SchedulableEffect): void {
    this.queue.add(e);
  }

  remove(handle: SchedulableEffect): void {
    if (!this.queue.has(handle)) {
      return;
    }

    this.queue.delete(handle);
  }

  flush(): void {
    for (const handle of this.queue) {
      handle.run();
    }
    this.queue.clear();
  }
}

const scheduler = new ArrayEffectScheduler();

const createInjector = () => ({
  injector: Injector.create({
    providers: [
      { provide: ɵChangeDetectionScheduler, useValue: { notify() {} } },
      { provide: ɵEffectScheduler, useValue: scheduler },
    ],
  }),
});

let injectorObj = createInjector();

export const angularFramework: ReactiveFramework = {
  name: "Angular Signals",
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
  effect: (fn) => {
    effect(fn, injectorObj);
  },
  withBatch: (fn) => {
    fn();
    scheduler.flush();
  },
  withBuild: <T>(fn: () => T) => {
    let res: T;
    effect(() => {
      res = untracked(fn);
    }, injectorObj);
    scheduler.flush();
    return res!;
  },
  cleanup: () => {
    injectorObj.injector.destroy();
    injectorObj = createInjector();
  },
};
