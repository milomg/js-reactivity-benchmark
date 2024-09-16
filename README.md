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
- [MobX](https://mobx.js.org)
- [mol wire](https://www.npmjs.com/package/mol_wire_lib)
- [Oby](https://github.com/vobyjs/oby)
- [Preact Signals](https://github.com/preactjs/signals)
- [Reactively](https://github.com/milomg/reactively)
- [S.js](https://github.com/adamhaile/S)
- [Signia](https://github.com/tldraw/signia)
- [Solid](https://github.com/solidjs/solid)
- [Svelte v5](https://svelte.dev/blog/runes)
- [TC39 Signals Proposal](https://github.com/tc39/proposal-signals) [polyfill](https://github.com/proposal-signals/signal-polyfill)
- [uSignal](https://github.com/WebReflection/usignal)
- [Valtio](https://github.com/pmndrs/valtio)
- [Vue Reactivity](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [x-reactivity](https://www.npmjs.com/package/@solidjs/reactivity)

## Results

<p align='center'>
  <img src="https://github.com/user-attachments/assets/f6d041a1-d5da-4b30-8e60-b4c815ac70bc" alt="Average benchmark results across frameworks">
  (<em>lower times are better</em>)
</p>

These results were last updated _September 2024_ on an M3 Macbook Pro using Node.js v22.4.1.
