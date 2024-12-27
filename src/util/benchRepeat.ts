import { nextTick } from "./asyncUtil";
import { TimingResult } from "./perfTests";
import { runTimed } from "./perfUtil";

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
  let out = runTimed(fn);
  const { result, time } = out;
  return { result, timing: { time } };
}
