import { cfxFramework } from "../frameworks/cfx";
import { pushPullR3Framework } from "../frameworks/pushPullR3";
import { r3Framework } from "../frameworks/r3";
import { reactivelyFramework } from "../frameworks/reactively";
import { benchmarkWithMemory } from "../util/benchRepeat";
import type { TestConfig } from "../util/frameworkTypes";
import { makeGraph, runGraph } from "./reactively/dependencyGraph";

const frameworks = [
  { framework: cfxFramework, testPullCounts: true },
  { framework: reactivelyFramework, testPullCounts: true },
  { framework: pushPullR3Framework, testPullCounts: true },
  { framework: r3Framework, testPullCounts: false },
];

const testConfigs: TestConfig[] = [
  {
    name: "Small graph, high iterations",
    width: 10,
    totalLayers: 5,
    staticFraction: 1,
    nSources: 2,
    readFraction: 0.2,
    iterations: 600000,
    expected: { sum: 19199968, count: 3480019 },
  },
  {
    name: "Large graph, deep",
    width: 1000,
    totalLayers: 12,
    staticFraction: 0.95,
    nSources: 4,
    readFraction: 1,
    iterations: 7000,
    expected: { sum: 29355933696000, count: 1473791 },
  },
  {
    name: "Many sources",
    width: 1000,
    totalLayers: 5,
    staticFraction: 1,
    nSources: 25,
    readFraction: 1,
    iterations: 3000,
    expected: { sum: 1171484375000, count: 735756 },
  },
  {
    name: "Very deep",
    width: 5,
    totalLayers: 500,
    staticFraction: 1,
    nSources: 3,
    readFraction: 1,
    iterations: 500,
    expected: { sum: 3.0239642676898464e241, count: 1246502 },
  },
];

interface BenchResult {
  framework: string;
  test: string;
  time: number;
  memoryUsed: number;
  heapUsed: number;
  gcTime: number;
}

async function runComparison() {
  console.log("=".repeat(120));
  console.log("MEMORY COMPARISON: cfx vs Reactively vs pushPullR3 vs r3");
  console.log("=".repeat(120));
  console.log();

  if (!globalThis.gc) {
    console.warn(
      "⚠️  WARNING: Run with --expose-gc for accurate measurements!",
    );
    console.warn("   bun --bun --expose-gc src/runMemoryComparison.ts");
    console.warn();
  }

  const results: BenchResult[] = [];

  for (const config of testConfigs) {
    console.log(`\n${"=".repeat(120)}`);
    console.log(`Test: ${config.name}`);
    console.log(
      `Configuration: ${config.width}×${config.totalLayers}, ${config.nSources} sources, ${config.iterations} iterations`,
    );
    console.log(`${"=".repeat(120)}\n`);

    for (const { framework } of frameworks) {
      const { graph, counter } = makeGraph(
        framework,
        config.readFraction,
        config,
      );

      function runOnce(): number {
        return runGraph(graph, config.iterations, framework);
      }

      // Warm up
      runOnce();
      runOnce();

      const result = await benchmarkWithMemory(3, () => {
        counter.count = 0;
        return runOnce();
      });

      framework.cleanup();
      if (globalThis.gc) {
        gc!();
        gc!();
      }

      const benchResult: BenchResult = {
        framework: framework.name,
        test: config.name || "unnamed",
        time: result.time,
        memoryUsed: result.memory?.memoryUsed || 0,
        heapUsed: result.memory?.heapUsed || 0,
        gcTime: result.memory?.gcTime || 0,
      };

      results.push(benchResult);

      console.log(
        `${framework.name.padEnd(20)} | ` +
          `Time: ${result.time.toFixed(2).padStart(8)} ms | ` +
          `Heap: ${(result.memory?.heapUsed || 0).toFixed(2).padStart(8)} MB | ` +
          `GC: ${(result.memory?.gcTime || 0).toFixed(2).padStart(6)} ms`,
      );
    }
  }

  // Print comprehensive comparison
  console.log(`\n${"=".repeat(120)}`);
  console.log("DETAILED COMPARISON");
  console.log("=".repeat(120));

  // Group by test
  const byTest = new Map<string, BenchResult[]>();
  for (const result of results) {
    if (!byTest.has(result.test)) {
      byTest.set(result.test, []);
    }
    byTest.get(result.test)!.push(result);
  }

  for (const [testName, testResults] of byTest) {
    console.log(`\n${testName}:`);
    console.log("-".repeat(100));

    const sorted = [...testResults].sort((a, b) => a.time - b.time);
    const fastest = sorted[0];

    for (const result of sorted) {
      const timeRatio = (result.time / fastest.time).toFixed(2);
      const indicator = result.framework === fastest.framework ? "⚡" : "  ";

      console.log(
        `${indicator} ${result.framework.padEnd(20)} | ` +
          `${result.time.toFixed(2).padStart(8)} ms (${timeRatio}×) | ` +
          `Heap: ${result.heapUsed.toFixed(2).padStart(8)} MB | ` +
          `GC: ${result.gcTime.toFixed(2).padStart(6)} ms`,
      );
    }
  }

  // Overall statistics
  console.log(`\n${"=".repeat(120)}`);
  console.log("OVERALL STATISTICS");
  console.log("=".repeat(120));

  const byFramework = new Map<
    string,
    {
      totalTime: number;
      totalHeap: number;
      totalGC: number;
      count: number;
    }
  >();

  for (const result of results) {
    if (!byFramework.has(result.framework)) {
      byFramework.set(result.framework, {
        totalTime: 0,
        totalHeap: 0,
        totalGC: 0,
        count: 0,
      });
    }
    const stats = byFramework.get(result.framework)!;
    stats.totalTime += result.time;
    stats.totalHeap += result.heapUsed;
    stats.totalGC += result.gcTime;
    stats.count++;
  }

  console.log(
    "\nFramework         | Avg Time    | Avg Heap    | Total GC   | Total Time",
  );
  console.log("-".repeat(85));

  const sortedByTime = Array.from(byFramework.entries()).sort(
    (a, b) => a[1].totalTime - b[1].totalTime,
  );

  for (const [framework, stats] of sortedByTime) {
    console.log(
      `${framework.padEnd(17)} | ` +
        `${(stats.totalTime / stats.count).toFixed(2).padStart(9)} ms | ` +
        `${(stats.totalHeap / stats.count).toFixed(2).padStart(9)} MB | ` +
        `${stats.totalGC.toFixed(2).padStart(8)} ms | ` +
        `${stats.totalTime.toFixed(2).padStart(9)} ms`,
    );
  }

  // Key comparisons
  console.log(`\n${"=".repeat(120)}`);
  console.log("KEY COMPARISONS");
  console.log("=".repeat(120));

  const cfxStats = byFramework.get("cfx");
  const reactivelyStats = byFramework.get("Reactively");
  const pushPullR3Stats = byFramework.get("pushPullR3");
  const r3Stats = byFramework.get("r3");

  if (cfxStats && reactivelyStats) {
    const speedup = (reactivelyStats.totalTime / cfxStats.totalTime).toFixed(2);
    const heapDiff = (
      ((cfxStats.totalHeap - reactivelyStats.totalHeap) /
        reactivelyStats.totalHeap) *
      100
    ).toFixed(1);
    console.log(`\ncfx vs Reactively (both push-pull):`);
    console.log(`  Speed: cfx is ${speedup}× faster`);
    console.log(
      `  Heap: cfx uses ${heapDiff}% ${heapDiff.startsWith("-") ? "more" : "less"} heap memory`,
    );
  }

  if (pushPullR3Stats && reactivelyStats) {
    const speedup = (
      reactivelyStats.totalTime / pushPullR3Stats.totalTime
    ).toFixed(2);
    console.log(`\npushPullR3 vs Reactively (both push-pull):`);
    console.log(
      `  Speed: pushPullR3 is ${speedup}× ${speedup > "1" ? "faster" : "slower"}`,
    );
  }

  if (r3Stats && pushPullR3Stats) {
    const speedup = (r3Stats.totalTime / pushPullR3Stats.totalTime).toFixed(2);
    console.log(`\nr3 (eager) vs pushPullR3 (lazy):`);
    console.log(
      `  Speed: r3 is ${speedup}× ${speedup > "1" ? "faster" : "slower"} overall`,
    );
    console.log(`  Note: Performance depends heavily on readFraction`);
  }

  console.log(`\n${"=".repeat(120)}`);
  console.log("INSIGHTS");
  console.log("=".repeat(120));
  console.log(`
Data Structure Impact:
  • Array-based (cfx) vs Linked-list (pushPullR3, r3) affects cache locality
  • Heap usage reflects object allocation patterns

Algorithm Impact:
  • Eager (r3): Better when most nodes are read
  • Lazy (pushPullR3, cfx, Reactively): Better for partial reads

GC Pressure:
  • Higher GC time indicates more object churn
  • Important for long-running applications
  `);
}

runComparison().catch((err) => {
  console.error("Comparison failed:", err);
  process.exit(1);
});
