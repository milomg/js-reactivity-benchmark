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
    this.enqueue(handle);
  }

  remove(handle: SchedulableEffect): void {
    if (!this.queue.has(handle)) {
      return;
    }

    this.queue.delete(handle);
  }

  private enqueue(handle: SchedulableEffect): void {
    if (this.queue.has(handle)) {
      return;
    }
    this.queue.add(handle);
  }

  flush(): void {
    for (const handle of this.queue) {
      this.queue.delete(handle);

      handle.run();
    }
  }
}

const scheduler = new ArrayEffectScheduler();
const injector = Injector.create({
  providers: [
    { provide: ɵChangeDetectionScheduler, useValue: { notify() {} } },
    { provide: ɵEffectScheduler, useValue: scheduler },
  ],
});

const injectorObj = { injector };

export const angularFramework: ReactiveFramework = {
  name: "@angular/signal2",
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
};
