export interface TimedResult<T> {
  result: T;
  time: number;
}

/** run a function, recording how long it takes */
export async function runTimed<T>(fn: () => T): Promise<TimedResult<T>> {
  const start = performance.now();
  const result = await fn();
  const time = performance.now() - start;
  return { result, time };
}
