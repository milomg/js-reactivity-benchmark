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

<table style="width: 1100px; font-family: sans-serif; font-size: 12px;"><colgroup><col style="width: 200px;"><col style="width: 100px;"><col style="width: 800px;"></colgroup><tbody><tr><td colspan="3" style="display: none;">000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000</td></tr><tr><td rowspan="7">avoidablePropagation</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 46px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 78px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 114px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 190px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 457px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 198px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 776px; height: 20px;"></td></tr><tr><td rowspan="7">broadPropagation</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 120px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 162px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 165px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 391px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 247px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 374px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 610px; height: 20px;"></td></tr><tr><td rowspan="7">deepPropagation</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 51px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 72px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 95px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 154px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 123px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 136px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 314px; height: 20px;"></td></tr><tr><td rowspan="7">diamond</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 71px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 118px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 108px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 250px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 267px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 197px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 576px; height: 20px;"></td></tr><tr><td rowspan="7">mux</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 119px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 140px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 136px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 233px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 180px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 275px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 401px; height: 20px;"></td></tr><tr><td rowspan="7">repeatedObservers</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 7px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 19px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 29px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 76px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 41px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 54px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 63px; height: 20px;"></td></tr><tr><td rowspan="7">triangle</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 33px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 42px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 38px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 101px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 64px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 66px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 162px; height: 20px;"></td></tr><tr><td rowspan="7">unstable</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 23px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 30px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 71px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 104px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 68px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 110px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 195px; height: 20px;"></td></tr><tr><td rowspan="7">molBench</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 266px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 268px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 270px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 333px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 277px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 277px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 288px; height: 20px;"></td></tr><tr><td rowspan="7">createSignals</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 6px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 4px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 21px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 5px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 1px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 3px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 52px; height: 20px;"></td></tr><tr><td rowspan="7">createComputations</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 47px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 33px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 124px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 92px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 80px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 231px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 570px; height: 20px;"></td></tr><tr><td rowspan="7">updateSignals</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 35px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 28px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 4px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 40px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 21px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 42px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 28px; height: 20px;"></td></tr><tr><td rowspan="7">cellx1000</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 8px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 11px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 10px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 15px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 13px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 38px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 16px; height: 20px;"></td></tr><tr><td rowspan="7">2-10x5 - lazy80%</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 166px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 186px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 179px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 800px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 327px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 300px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 771px; height: 20px;"></td></tr><tr><td rowspan="7">6-10x10 - dyn25% - lazy80%</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 120px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 141px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 110px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 290px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 121px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 163px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 360px; height: 20px;"></td></tr><tr><td rowspan="7">4-1000x12 - dyn5%</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 243px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 319px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 219px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 495px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 247px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 384px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 692px; height: 20px;"></td></tr><tr><td rowspan="7">25-1000x5</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 317px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 435px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 252px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 625px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 268px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 400px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 782px; height: 20px;"></td></tr><tr><td rowspan="7">3-5x500</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 78px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 92px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 73px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 176px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 88px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 123px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 267px; height: 20px;"></td></tr><tr><td rowspan="7">6-100x15 - dyn50%</td><td>Alien Signals</td><td><img src="pngs/d53e4f.png" style="width: 156px; height: 20px;"></td></tr><tr><td>Preact Signals</td><td><img src="pngs/fc8d59.png" style="width: 178px; height: 20px;"></td></tr><tr><td>Reactively</td><td><img src="pngs/fee08b.png" style="width: 138px; height: 20px;"></td></tr><tr><td>SolidJS</td><td><img src="pngs/ffffbf.png" style="width: 296px; height: 20px;"></td></tr><tr><td>Svelte v5</td><td><img src="pngs/e6f598.png" style="width: 146px; height: 20px;"></td></tr><tr><td>amadeus-it-group/tansu</td><td><img src="pngs/99d594.png" style="width: 206px; height: 20px;"></td></tr><tr><td>x-reactivity</td><td><img src="pngs/3288bd.png" style="width: 418px; height: 20px;"></td></tr></tbody></table>
