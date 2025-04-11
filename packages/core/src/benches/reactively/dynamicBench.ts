import { makeGraph, runGraph } from "./dependencyGraph";
import { verifyBenchResult } from "../../util/perfTests";
import { FrameworkInfo, TestConfig } from "../../util/frameworkTypes";
import { perfTests } from "../../config";
import { fastestTest } from "../../util/benchRepeat";
import { PerfResultCallback } from "../../util/perfLogging";

function percent(n: number): string {
  return Math.round(n * 100) + "%";
}

export function makeTitle(config: TestConfig): string {
  const { width, totalLayers, staticFraction, nSources, readFraction } = config;
  const dyn = staticFraction < 1 ? " - dyn" + percent(1 - staticFraction) : "";
  const read = readFraction < 1 ? ` - lazy${percent(1 - readFraction)}` : "";
  return `${nSources}-${width}x${totalLayers}${dyn}${read}`;
}

/** benchmark a single test under single framework.
 * The test is run multiple times and the fastest result is logged to the console.
 */
export async function dynamicBench(
  frameworkTest: FrameworkInfo,
  logPerfResult: PerfResultCallback,
  testRepeats = 5,
): Promise<void> {
  const { framework } = frameworkTest;
  for (const config of perfTests) {
    const { iterations, readFraction } = config;

    const { graph, counter } = makeGraph(framework, readFraction, config);

    function runOnce(): number {
      return runGraph(graph, iterations, framework);
    }

    // warm up
    runOnce();
    runOnce();
    runOnce();

    const timedResult = await fastestTest(testRepeats, () => {
      counter.count = 0;
      const sum = runOnce();
      return { sum, count: counter.count };
    });

    framework.cleanup();
    if (globalThis.gc) gc!(), gc!();

    logPerfResult({
      framework: framework.name,
      test: makeTitle(config) + (config.name ? ` (${config.name})` : ""),
      time: timedResult.timing.time,
    });
    verifyBenchResult(frameworkTest, config, timedResult);
  }
}
