// Inspired by https://github.com/solidjs/solid/blob/main/packages/solid/bench/bench.cjs

import { PerfResultCallback } from "../util/perfLogging";
import { Computed, ReactiveFramework, Signal } from "../util/reactiveFramework";

const COUNT = 1e5;

type Reader = () => number;
export function sbench(
  framework: ReactiveFramework,
  logPerfResult: PerfResultCallback
) {
  bench("createSignals", createSignals, COUNT, COUNT);
  bench("create0to1", create0to1, COUNT, 0);
  bench("create1to1", create1to1, COUNT, COUNT);
  bench("create2to1", create2to1, COUNT / 2, COUNT);
  bench("create4to1", create4to1, COUNT / 4, COUNT);
  bench("create1000to1", create1000to1, COUNT / 1000, COUNT);
  bench("create1to2", create1to2, COUNT, COUNT / 2);
  bench("create1to4", create1to4, COUNT, COUNT / 4);
  bench("create1to8", create1to8, COUNT, COUNT / 8);
  bench("create1to1000", create1to1000, COUNT, COUNT / 1000);
  bench("update1to1", update1to1, COUNT * 4, 1);
  bench("update2to1", update2to1, COUNT * 2, 2);
  bench("update4to1", update4to1, COUNT, 4);
  bench("update1000to1", update1000to1, COUNT / 100, 1000);
  bench("update1to2", update1to2, COUNT * 4, 1);
  bench("update1to4", update1to4, COUNT * 4, 1);
  bench("update1to1000", update1to1000, COUNT * 4, 1);

  function bench(
    name: string,
    fn: (n: number, sources: any[]) => void,
    count: number,
    scount: number
  ) {
    const { time } = run(fn, count, scount);
    logPerfResult({
      framework: framework.name,
      test: name,
      time: time,
    });
  }

  function run(
    fn: (n: number, sources: Computed<number>[]) => void,
    n: number,
    scount: number
  ) {
    // prep n * arity sources
    let start = 0;
    let end = 0;

    framework.withBuild(() => {
      if (globalThis.gc) gc!(), gc!();

      // run 3 times to warm up
      let sources: Computed<number>[] | null = createSignals(scount, []);
      fn(n / 100, sources);
      sources = createSignals(scount, []);
      fn(n / 100, sources);
      sources = createSignals(scount, []);
      fn(n / 100, sources);
      sources = createSignals(scount, []);
      for (let i = 0; i < scount; i++) {
        sources[i].read();
        sources[i].read();
        sources[i].read();
      }

      // start GC clean
      if (globalThis.gc) gc!(), gc!();

      start = performance.now();

      fn(n, sources);

      // end GC clean
      sources = null;
      if (globalThis.gc) gc!(), gc!();
      end = performance.now();
    });

    return { time: end - start };
  }

  function createSignals(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      sources[i] = framework.signal(i);
    }
    return sources;
  }

  function create0to1(n: number, _sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      createComputation0(i);
    }
  }

  function create1to1000(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n / 1000; i++) {
      const { read: get } = sources[i];
      for (let j = 0; j < 1000; j++) {
        createComputation1(get);
      }
    }
  }

  function create1to8(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n / 8; i++) {
      const { read: get } = sources[i];
      createComputation1(get);
      createComputation1(get);
      createComputation1(get);
      createComputation1(get);
      createComputation1(get);
      createComputation1(get);
      createComputation1(get);
      createComputation1(get);
    }
  }

  function create1to4(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n / 4; i++) {
      const { read: get } = sources[i];
      createComputation1(get);
      createComputation1(get);
      createComputation1(get);
      createComputation1(get);
    }
  }

  function create1to2(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n / 2; i++) {
      const { read: get } = sources[i];
      createComputation1(get);
      createComputation1(get);
    }
  }

  function create1to1(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      const { read: get } = sources[i];
      createComputation1(get);
    }
  }

  function create2to1(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      createComputation2(sources[i * 2].read, sources[i * 2 + 1].read);
    }
  }

  function create4to1(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      createComputation4(
        sources[i * 4].read,
        sources[i * 4 + 1].read,
        sources[i * 4 + 2].read,
        sources[i * 4 + 3].read
      );
    }
  }

  // only create n / 100 computations, as otherwise takes too long
  function create1000to1(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      createComputation1000(sources, i * 1000);
    }
  }

  function createComputation0(i: number) {
    framework.computed(() => i);
  }

  function createComputation1(s1: Reader) {
    framework.computed(() => s1());
  }
  function createComputation2(s1: Reader, s2: Reader) {
    framework.computed(() => s1() + s2());
  }

  function createComputation4(s1: Reader, s2: Reader, s3: Reader, s4: Reader) {
    framework.computed(() => s1() + s2() + s3() + s4());
  }

  function createComputation1000(ss: Computed<number>[], offset: number) {
    framework.computed(() => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += ss[offset + i].read();
      }
      return sum;
    });
  }

  function update1to1(n: number, sources: Signal<number>[]) {
    let { read: get1, write: set1 } = sources[0];
    framework.computed(() => get1());
    for (let i = 0; i < n; i++) {
      set1(i);
    }
  }

  function update2to1(n: number, sources: Signal<number>[]) {
    let { read: get1, write: set1 } = sources[0],
      { read: get2 } = sources[1];
    framework.computed(() => get1() + get2());
    for (let i = 0; i < n; i++) {
      set1(i);
    }
  }

  function update4to1(n: number, sources: Signal<number>[]) {
    let { read: get1, write: set1 } = sources[0],
      { read: get2 } = sources[1],
      { read: get3 } = sources[2],
      { read: get4 } = sources[3];
    framework.computed(() => get1() + get2() + get3() + get4());
    for (let i = 0; i < n; i++) {
      set1(i);
    }
  }

  function update1000to1(n: number, sources: Signal<number>[]) {
    let { write: set1 } = sources[0];
    framework.computed(() => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += sources[i].read();
      }
      return sum;
    });
    for (let i = 0; i < n; i++) {
      set1(i);
    }
  }

  function update1to2(n: number, sources: Signal<number>[]) {
    let { read: get1, write: set1 } = sources[0];
    framework.computed(() => get1());
    framework.computed(() => get1());
    for (let i = 0; i < n / 2; i++) {
      set1(i);
    }
  }

  function update1to4(n: number, sources: Signal<number>[]) {
    let { read: get1, write: set1 } = sources[0];
    framework.computed(() => get1());
    framework.computed(() => get1());
    framework.computed(() => get1());
    framework.computed(() => get1());
    for (let i = 0; i < n / 4; i++) {
      set1(i);
    }
  }

  function update1to1000(n: number, sources: Signal<number>[]) {
    const { read: get1, write: set1 } = sources[0];
    for (let i = 0; i < 1000; i++) {
      framework.computed(() => get1());
    }
    for (let i = 0; i < n / 1000; i++) {
      set1(i);
    }
  }
}
