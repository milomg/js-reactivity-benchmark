# JS Reactivity Benchmark

```
$ pnpm bench
```

## Features

- Configurable dependency graph: graph shape, density, read rate are all adjustable
- Easily add new benchmarks and frameworks
- Supports dynamic reactive nodes
- Framework agnostic. Simple API to test new reactive frameworks
- Forces garbage collection between each test
- Outputs a csv file for easy integration with other tools

Current reactivity benchmarks ([S.js](https://github.com/adamhaile/S/blob/master/bench/bench.js), [CellX](https://github.com/Riim/cellx/blob/master/perf/perf.html)) are focused on creation time, and update time for a static graph. Additionally, existing benchmarks aren't very configurable, and don't test for dynamic dependencies. We've created a new benchmark that allows library authors to compare their frameworks against each other, and against the existing benchmarks, as well as against a new configurable benchmark with dynamically changing sources.

We're also working on enabling consistent logging and efficient tracking of GC time across all benchmarks.

## Frameworks

- [Angular Signals](https://angular.dev/guide/signals/)
- [Compostate](https://github.com/lxsmnsyc/compostate)
- [Kairo](https://github.com/3Shain/kairo)
- [MobX](https://mobx.js.org) (not included in the average benchmark results because it fails to run some tests)
- [mol wire](https://www.npmjs.com/package/mol_wire_lib)
- [Oby](https://github.com/vobyjs/oby)
- [Preact Signals](https://github.com/preactjs/signals)
- [Reactively](https://github.com/milomg/reactively)
- [S.js](https://github.com/adamhaile/S)
- [Signia](https://github.com/tldraw/signia)
- [Solid](https://github.com/solidjs/solid)
- [TC39 Signals Proposal](https://github.com/tc39/proposal-signals) [polyfill](https://github.com/proposal-signals/signal-polyfill)
- [uSignal](https://github.com/WebReflection/usignal)
- [Valtio](https://github.com/pmndrs/valtio)
- [Vue Reactivity](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [x-reactivity](https://www.npmjs.com/package/@solidjs/reactivity)

## Results

<p align='center'>
	<img src="https://github.com/user-attachments/assets/4621879c-fb20-4056-8fd8-f7daa31a07e3" alt="Framework average benchmark results">
	<a href="https://github.com/user-attachments/files/16992605/reactivity-bench.csv">Raw results CSV</a> (<em>lower times are better</em>)
</p>

Note that MobX and Valtio are not included in the average results summary because they fail to run some of the benchmark tests.

These results were last updated _September 2024_ on an M3 Macbook Pro.

<details>
<summary>
Old results
</summary>

The frameworks are all plenty fast for typical applications. The charts report the run time of the test in milliseconds on an M1 laptop, and are made using [Tableau](https://public.tableau.com/). Typical applications will do much more work than a framework benchmark, and at these speeds the frameworks are unlikely to bottleneck overall performance.

That said, there's learning here to improve performance of all the frameworks.

![Performance Results](https://user-images.githubusercontent.com/14153763/221107379-51a93eab-95ac-4c89-9a74-7a1527fc4a03.png)

![Raw](https://user-images.githubusercontent.com/14153763/222212050-5b651e4d-6e71-4667-94e7-eb94b7030bc1.png)

</details>
