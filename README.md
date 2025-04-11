# JS Reactivity Benchmark

```
$ pnpm bench
```

## Features

- Configurable dependency graph: graph shape, density, read rate are all adjustable.
- Easily add new benchmarks and frameworks
- Supports dynamic reactive nodes
- Framework agnostic. Simple API to test new reactive frameworks.
- Uses v8 intrinsics to warmup and cleanup
- Tracks garbage collection overhead per test
- Outputs a csv file for easy integration with other tools.

Current reactivity benchmarks ([S.js](https://github.com/adamhaile/S/blob/master/bench/bench.js), [CellX](https://github.com/Riim/cellx/blob/master/perf/perf.html)) are focused on creation time, and update time for a static graph. Additionally, existing benchmarks aren't very configurable, and don't test for dynamic dependencies. We've created a new benchmark that allows library authors to compare their frameworks against each other, and against the existing benchmarks, as well as against a new configurable benchmark with dynamically changing sources.

We're also working on enabling consistent logging and efficient tracking of GC time across all benchmarks.

The frameworks are all plenty fast for typical applications. The charts report the run time of the test in milliseconds on an M1 laptop, and are made using [Tableau](https://public.tableau.com/). Typical applications will do much more work than a framework benchmark, and at these speeds the frameworks are unlikely to bottleneck overall performance.

That said, there's learning here to improve performance of all the frameworks.

<table style="width: 1100px; max-width: 1100px; font-family: sans-serif; font-size: 12px;"><colgroup><col style="width: 200px;"><col style="width: 100px;"><col style="width: 800px;"></colgroup><tbody><tr><td colspan="3">000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000</td></tr><tr><td rowspan="2">avoidablePropagation</td><td>Alien Signals</td><td><img src="pngs/fc8d59.png" style="width: 146px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/ffffbf.png" style="width: 357px; height: 20px;"></td></tr><tr><td rowspan="2">broadPropagation</td><td>Alien Signals</td><td><img src="pngs/fc8d59.png" style="width: 358px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/ffffbf.png" style="width: 514px; height: 20px;"></td></tr><tr><td rowspan="2">deepPropagation</td><td>Alien Signals</td><td><img src="pngs/fc8d59.png" style="width: 147px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/ffffbf.png" style="width: 272px; height: 20px;"></td></tr><tr><td rowspan="2">diamond</td><td>Alien Signals</td><td><img src="pngs/fc8d59.png" style="width: 230px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/ffffbf.png" style="width: 337px; height: 20px;"></td></tr><tr><td rowspan="2">mux</td><td>Alien Signals</td><td><img src="pngs/fc8d59.png" style="width: 346px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/ffffbf.png" style="width: 416px; height: 20px;"></td></tr><tr><td rowspan="2">repeatedObservers</td><td>Alien Signals</td><td><img src="pngs/fc8d59.png" style="width: 25px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/ffffbf.png" style="width: 85px; height: 20px;"></td></tr><tr><td rowspan="2">triangle</td><td>Alien Signals</td><td><img src="pngs/fc8d59.png" style="width: 108px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/ffffbf.png" style="width: 117px; height: 20px;"></td></tr><tr><td rowspan="2">unstable</td><td>Alien Signals</td><td><img src="pngs/fc8d59.png" style="width: 74px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/ffffbf.png" style="width: 201px; height: 20px;"></td></tr><tr><td rowspan="2">molBench</td><td>Alien Signals</td><td><img src="pngs/fc8d59.png" style="max-width: 800px; width: 800px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/ffffbf.png" style="width: 0px; height: 20px;"></td></tr></tbody></table>
