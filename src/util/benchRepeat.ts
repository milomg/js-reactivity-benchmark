import { GarbageTrack } from "./garbageTracking";
import { nextTick } from "./asyncUtil";
import { TimingResult } from "./perfTests";
import { runTimed } from "./perfUtil";

declare global {
  interface Performance {
    memory?: {
      totalJSHeapSize: number;
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

/** benchmark a function n times, returning the fastest result and associated timing */
export async function fastestTest<T>(
  times: number,
  fn: () => T,
): Promise<TimingResult<T>> {
  const results: TimingResult<T>[] = [];
  for (let i = 0; i < times; i++) {
    await nextTick();
    const run = await runTracked(fn);
    results.push(run);
  }
  const fastest = results.reduce((a, b) =>
    a.timing.time < b.timing.time ? a : b,
  );

  return fastest;
}

/** run a function, reporting the wall clock time and garbage collection time. */
async function runTracked<T>(fn: () => T): Promise<TimingResult<T>> {
  if (window.gc) gc!(), gc!();
  let before = window.performance.memory?.usedJSHeapSize ?? 0;
  let out = runTimed(fn);
  let after = window.performance.memory?.usedJSHeapSize ?? 0;
  const { result, time } = out;
  let gcMemoryUsed = after - before;
  return { result, timing: { time, memory: gcMemoryUsed / 1000 } };
}
