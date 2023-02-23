import v8 from "v8-natives";
import { makeGraph, runGraph } from "./util/dependencyGraph";
import { logPerfResult } from "./util/perfLogging";
import { runTimed } from "./util/perfUtil";
import { TimingResult, verifyBenchResult } from "./util/perfTests";
import { GarbageTrack } from "./util/garbageTracking";
import { TestWithFramework } from "./util/frameworkTypes";

/** benchmark a single test under single framework.
 * The test is run multiple times and the fastest result is logged to the console.
 */
export async function benchmarkTest(
  frameworkTest: TestWithFramework,
  testRepeats = 5
): Promise<void> {
  const { config, perfFramework } = frameworkTest;
  const { framework } = perfFramework;
  const { iterations, readFraction } = config;

  const { graph, counter } = makeGraph(frameworkTest);

  function runOnce(): number {
    return runGraph(graph, iterations, readFraction, framework);
  }

  // warm up
  v8.optimizeFunctionOnNextCall(runOnce);
  runOnce();

  const timedResult = await fastestTest(testRepeats, () => {
    counter.count = 0;
    const sum = runOnce();
    return { sum, count: counter.count };
  });

  logPerfResult(frameworkTest, timedResult);
  verifyBenchResult(frameworkTest, timedResult);
}

/** benchmark a function n times, returning the fastest result and associated timing */
async function fastestTest<T>(
  times: number,
  fn: () => T
): Promise<TimingResult<T>> {
  const results: TimingResult<T>[] = [];
  for (let i = 0; i < times; i++) {
    const run = await runTracked(fn);
    results.push(run);
  }
  const fastest = results.reduce((a, b) =>
    a.timing.time < b.timing.time ? a : b
  );

  return fastest;
}

/** run a function, reporting the wall clock time and garbage collection time. */
async function runTracked<T>(fn: () => T): Promise<TimingResult<T>> {
  v8.collectGarbage();
  const gcTrack = new GarbageTrack();
  const { result: wrappedResult, trackId } = gcTrack.watch(() => runTimed(fn));
  const gcTime = await gcTrack.gcDuration(trackId);
  const { result, time } = wrappedResult;
  gcTrack.destroy();
  return { result, timing: { time, gcTime } };
}
