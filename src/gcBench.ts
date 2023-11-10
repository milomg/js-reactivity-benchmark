import v8 from "v8-natives";
import { fastestTest } from "./util/benchRepeat";
import { logPerfResult } from "./util/perfLogging";
import { Computed, ReactiveFramework } from "./util/reactiveFramework";
import { promiseDelay } from "./util/asyncUtil";

const cases = [
  collectDynamicSources,
  collectDynamicSourcesAfterUpdate,
  collectOutOfScopeConsumers,
];

export async function gcBench(framework: ReactiveFramework) {
  for (const c of cases) {
    const iter = framework.withBuild(() => c(framework));

    const { timing } = await fastestTest(1, async () => {
      for (let i = 0; i < 1; i++) {
        await iter();
      }
    });

    logPerfResult({
      framework: framework.name,
      test: `gc-${c.name}`,
      time: timing.time.toFixed(2),
      gcTime: timing.gcTime?.toFixed(2),
    });
  }
}

/**
 * Ensures old inactive dynamic sources get collected
 */
function collectDynamicSourcesAfterUpdate(framework: ReactiveFramework) {
  const head = framework.signal(1);
  let dynamic = framework.signal(0);
  const tail = framework.computed(() => {
    return dynamic.read() + head.read();
  });

  const weakOldDynamic = new WeakRef(dynamic);

  // Create connection to first dynamic
  tail.read();

  // Swap dynamic for new
  dynamic = framework.signal(1);

  // Trigger update to force invalidation of tail
  head.write(-1);

  return async () => {
    let didCollect = false;

    // Async GC loop to allow time for frameworks with scheduled cleanups
    for (let i = 0; i < 200; i++) {
      await promiseDelay();
      v8.collectGarbage();

      if (weakOldDynamic.deref() === undefined) {
        didCollect = true;
        break;
      }
    }

    console.assert(tail.read() === 0, "tail is not 0");

    console.assert(didCollect, "Failed to collect inactive dynamic sources");
  };
}

/**
 * Ensures old inactive dynamic sources get collected
 */
function collectDynamicSources(framework: ReactiveFramework) {
  const head = framework.signal(1);
  let dynamic = framework.signal(0);
  const tail = framework.computed(() => {
    return dynamic.read() + head.read();
  });

  const weakOldDynamic = new WeakRef(dynamic);

  // Create connection to first dynamic
  tail.read();

  // Swap dynamic for new
  dynamic = framework.signal(1);

  return async () => {
    let didCollect = false;

    // Async GC loop to allow time for frameworks with scheduled cleanups
    for (let i = 0; i < 200; i++) {
      await promiseDelay();
      v8.collectGarbage();

      if (weakOldDynamic.deref() === undefined) {
        didCollect = true;
        break;
      }
    }

    console.assert(tail.read() === 1, "tail is not 1");

    console.assert(didCollect, "Failed to collect inactive dynamic sources");
  };
}

/**
 * Ensures out of scope (computed) consumers get collected
 */
function collectOutOfScopeConsumers(framework: ReactiveFramework) {
  const head = framework.signal(0);
  let tail: Computed<number> = head;
  const weakRefs: WeakRef<Computed<number>>[] = [];

  for (let i = 0; i < 5; i++) {
    const oldTail = tail;
    tail = framework.computed(() => {
      return oldTail.read() + 1;
    });
    tail.read();
    weakRefs.push(new WeakRef(tail));
  }

  return async () => {
    let activeRefCount = 0;

    // Async GC loop to allow time for frameworks with scheduled cleanups
    for (let i = 0; i < 200; i++) {
      await promiseDelay();
      v8.collectGarbage();

      activeRefCount = 0;
      for (const ref of weakRefs) {
        if (ref.deref()) {
          activeRefCount++;
        }
      }
      if (activeRefCount === 0) {
        break;
      }
    }

    console.assert(head.read() === 0);

    console.assert(
      activeRefCount === 0,
      `Found ${activeRefCount} active references when there should be none`
    );
  };
}
