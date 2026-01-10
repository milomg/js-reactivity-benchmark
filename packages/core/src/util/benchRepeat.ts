import { nextTick } from "./asyncUtil";
import { TimingResult } from "./perfTests";

export interface MemorySnapshot {
  heapUsed: number; // bytes
  heapTotal: number; // bytes
  external: number; // bytes
}

export interface MemoryResult {
  memoryUsed: number; // MB - total memory increase
  heapUsed: number; // MB - heap memory used
  gcTime?: number; // ms - time spent in GC
}

function getMemoryUsage(): MemorySnapshot | null {
  if (typeof process !== "undefined" && process.memoryUsage) {
    const mem = process.memoryUsage();
    return {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
    };
  }
  // Bun also supports process.memoryUsage
  return null;
}

function forceGC(): void {
  if (globalThis.gc) {
    gc!();
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
    const run = runTimed(fn);
    results.push(run);
  }
  const fastest = results.reduce((a, b) => (a.time < b.time ? a : b));

  return fastest;
}

/** benchmark a function with memory tracking */
export async function benchmarkWithMemory<T>(
  times: number,
  fn: () => T,
): Promise<TimingResult<T> & { memory?: MemoryResult }> {
  // Force GC and wait to settle
  forceGC();
  forceGC();
  await nextTick();
  await nextTick();

  const memBefore = getMemoryUsage();
  let peakHeap = 0;
  let peakTotal = 0;

  // Run tests and track peak memory
  const results: TimingResult<T>[] = [];
  for (let i = 0; i < times; i++) {
    await nextTick();

    // Measure before run
    const beforeRun = getMemoryUsage();
    const run = runTimed(fn);
    const afterRun = getMemoryUsage();

    // Track peak usage during this run
    if (afterRun && beforeRun) {
      const heapUsed = afterRun.heapUsed;
      const totalUsed = afterRun.heapTotal + afterRun.external;
      if (heapUsed > peakHeap) peakHeap = heapUsed;
      if (totalUsed > peakTotal) peakTotal = totalUsed;
    }

    results.push(run);
  }

  const fastest = results.reduce((a, b) => (a.time < b.time ? a : b));

  // Measure GC time
  const gcStart = performance.now();
  forceGC();
  const gcTime = performance.now() - gcStart;

  await nextTick();
  const memAfter = getMemoryUsage();

  let memory: MemoryResult | undefined;
  if (memBefore && memAfter) {
    // Use peak values if available, otherwise use deltas
    const heapUsed =
      peakHeap > 0
        ? peakHeap - memBefore.heapUsed
        : memAfter.heapUsed - memBefore.heapUsed;
    const totalUsed =
      peakTotal > 0
        ? peakTotal - (memBefore.heapTotal + memBefore.external)
        : memAfter.heapTotal +
          memAfter.external -
          (memBefore.heapTotal + memBefore.external);

    memory = {
      memoryUsed: totalUsed / (1024 * 1024), // Convert to MB
      heapUsed: heapUsed / (1024 * 1024), // Convert to MB
      gcTime: gcTime,
    };
  }

  return { ...fastest, memory };
}

export interface TimedResult<T> {
  result: T;
  time: number;
}

/** run a function, recording how long it takes */
export function runTimed<T>(fn: () => T): TimedResult<T> {
  const start = performance.now();
  const result = fn();
  const time = performance.now() - start;
  return { result, time };
}
