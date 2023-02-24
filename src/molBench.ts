import { logPerfResult } from "./util/perfLogging";
import { ReactiveFramework } from "./util/reactiveFramework";

function fib(n: number): number {
  if (n < 2) return 1;
  return fib(n - 1) + fib(n - 2);
}

function hard(n: number, log: string) {
  return n + fib(16);
}

const numbers = Array.from({ length: 5 }, (_, i) => i);

export function molBench(framework: ReactiveFramework) {
  let res = [];
  const A = framework.signal(0);
  const B = framework.signal(0);
  const C = framework.computed(() => (A.read() % 2) + (B.read() % 2));
  const D = framework.computed(() =>
    numbers.map((i) => ({ x: i + (A.read() % 2) - (B.read() % 2) }))
  );
  const E = framework.computed(() =>
    hard(C.read() + A.read() + D.read()[0].x, "E")
  );
  const F = framework.computed(() => hard(D.read()[2].x || B.read(), "F"));
  const G = framework.computed(
    () => C.read() + (C.read() || E.read() % 2) + D.read()[4].x + F.read()
  );
  const H = framework.effect(() => res.push(hard(G.read(), "H")));
  const I = framework.effect(() => res.push(G.read()));
  const J = framework.effect(() => res.push(hard(F.read(), "J")));

  let start = performance.now();
  for (let i = 0; i < 1e4; i++) {
    res.length = 0;
    framework.withBatch(() => {
      B.write(1);
      A.write(1 + i * 2);
    });
    framework.withBatch(() => {
      A.write(2 + i * 2);
      B.write(2);
    });
  }
  let end = performance.now();
  logPerfResult({
    framework: framework.name,
    test: "molBench",
    time: (end - start).toFixed(2),
  });
}
