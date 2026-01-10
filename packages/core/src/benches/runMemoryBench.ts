import { frameworkInfo } from "../frameworksList";
import { formatPerfResult } from "../util/perfLogging";
import { dynamicBench } from "./reactively/dynamicBench";

function formatMemory(mb: number | undefined): string {
  if (mb === undefined) return "N/A";
  return `${mb.toFixed(2)} MB`;
}

function formatTime(ms: number | undefined): string {
  if (ms === undefined) return "N/A";
  return `${ms.toFixed(2)} ms`;
}

async function runMemoryBenchmarks() {
  console.log("=".repeat(120));
  console.log("Memory Usage Benchmark - JS Reactivity Frameworks");
  console.log("=".repeat(120));
  console.log();
  console.log(
    "Running with --expose-gc flag for accurate memory measurements...",
  );
  console.log();

  if (!globalThis.gc) {
    console.warn("⚠️  WARNING: GC not exposed! Run with --expose-gc flag:");
    console.warn("   bun --bun --expose-gc src/runMemoryBench.ts");
    console.warn("   OR: node --expose-gc src/runMemoryBench.ts");
    console.warn("");
  }

  const results: Array<{
    framework: string;
    test: string;
    time: number;
    memoryUsed?: number;
    heapUsed?: number;
    gcTime?: number;
  }> = [];

  await dynamicBench(
    frameworkInfo,
    (result) => {
      results.push(result);

      // Format and print result immediately
      const row = {
        framework: result.framework,
        test: result.test,
        time: `${result.time.toFixed(2)} ms`,
        memoryUsed: formatMemory(result.memoryUsed),
        heapUsed: formatMemory(result.heapUsed),
        gcTime: formatTime(result.gcTime),
      };

      console.log(formatPerfResult(row));
    },
    3, // Run each test 3 times and take the fastest
  );

  console.log();
  console.log("=".repeat(120));
  console.log("Summary by Framework");
  console.log("=".repeat(120));

  // Group results by framework
  const byFramework = new Map<
    string,
    {
      totalTime: number;
      totalMemory: number;
      totalHeap: number;
      totalGC: number;
      count: number;
    }
  >();

  for (const result of results) {
    if (!byFramework.has(result.framework)) {
      byFramework.set(result.framework, {
        totalTime: 0,
        totalMemory: 0,
        totalHeap: 0,
        totalGC: 0,
        count: 0,
      });
    }
    const stats = byFramework.get(result.framework)!;
    stats.totalTime += result.time;
    stats.totalMemory += result.memoryUsed || 0;
    stats.totalHeap += result.heapUsed || 0;
    stats.totalGC += result.gcTime || 0;
    stats.count++;
  }

  console.log();
  console.log(
    "Framework         | Avg Time  | Total Memory | Avg Heap   | Total GC  ",
  );
  console.log("-".repeat(80));

  const sortedFrameworks = Array.from(byFramework.entries()).sort(
    (a, b) => a[1].totalTime - b[1].totalTime,
  );

  for (const [framework, stats] of sortedFrameworks) {
    const avgTime = stats.totalTime / stats.count;
    const avgHeap = stats.totalHeap / stats.count;

    console.log(
      `${framework.padEnd(17)} | ` +
        `${avgTime.toFixed(2).padStart(7)} ms | ` +
        `${formatMemory(stats.totalMemory).padStart(12)} | ` +
        `${formatMemory(avgHeap).padStart(10)} | ` +
        `${formatTime(stats.totalGC).padStart(9)}`,
    );
  }

  console.log();
  console.log("=".repeat(120));
  console.log("Memory Efficiency Ranking (Lower is Better)");
  console.log("=".repeat(120));

  const byMemory = Array.from(byFramework.entries())
    .filter(([_, stats]) => stats.totalMemory > 0)
    .sort((a, b) => a[1].totalMemory - b[1].totalMemory);

  console.log();
  console.log("Rank | Framework         | Total Memory | Avg Heap per Test");
  console.log("-".repeat(70));

  let rank = 1;
  for (const [framework, stats] of byMemory) {
    const avgHeap = stats.totalHeap / stats.count;
    console.log(
      `${String(rank).padStart(4)} | ` +
        `${framework.padEnd(17)} | ` +
        `${formatMemory(stats.totalMemory).padStart(12)} | ` +
        `${formatMemory(avgHeap).padStart(17)}`,
    );
    rank++;
  }

  console.log();
  console.log("=".repeat(120));
  console.log("Key Insights");
  console.log("=".repeat(120));
  console.log();
  console.log("Memory Usage:");
  console.log("  - Total Memory: Overall memory footprint across all tests");
  console.log(
    "  - Heap Used: JavaScript heap memory (objects, closures, etc.)",
  );
  console.log("  - GC Time: Time spent in garbage collection");
  console.log();
  console.log("Lower values indicate:");
  console.log("  ✓ More memory-efficient data structures");
  console.log("  ✓ Better object pooling or reuse");
  console.log("  ✓ Less GC pressure");
  console.log();
}

// Run the benchmarks
runMemoryBenchmarks().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
