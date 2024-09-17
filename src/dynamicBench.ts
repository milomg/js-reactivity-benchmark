import { Counter, makeGraph, runGraph } from "./util/dependencyGraph";
import { logPerfResult, perfRowStrings } from "./util/perfLogging";
import { verifyBenchResult } from "./util/perfTests";
import { FrameworkInfo } from "./util/frameworkTypes";
import { perfTests } from "./config";
import { fastestTest } from "./util/benchRepeat";

/** benchmark a single test under single framework.
 * The test is run multiple times and the fastest result is logged to the console.
 */
export async function dynamicBench(
  frameworkTest: FrameworkInfo,
  testRepeats = 1
): Promise<void> {
  const { framework } = frameworkTest;
  for (const config of perfTests) {
    const { iterations, readFraction } = config;

    let counter = new Counter();

    function runOnce(): number {
      // Create a new graph from scratch for each run to ensure they're independent
      // from each other.
      try {
        const graph = makeGraph(framework, config, counter);
        const res = runGraph(graph, iterations, readFraction, framework);
        globalThis.gc?.();
        return res;
      } catch (err: any) {
        console.warn(`Error dynamicBench "${framework.name}":`, err);
        return -1;
      }
    }

    // warm up
    runOnce();

    const timedResult = await fastestTest(testRepeats, () => {
      counter.count = 0;
      const sum = runOnce();
      return { sum, count: counter.count };
    });

    logPerfResult(perfRowStrings(framework.name, config, timedResult));
    verifyBenchResult(frameworkTest, config, timedResult);
  }
}
