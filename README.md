# JS Reactivity Benchmark

Current reactivity benchmarks ([S.js](https://github.com/adamhaile/S/blob/master/bench/bench.js), [CellX](https://github.com/Riim/cellx/blob/master/perf/perf.html)) are focused on creation time, and update time for a static graph. Additionally, existing benchmarks aren't very configurable, and don't test for dynamic dependencies.

We've created a new and more flexible benchmark that allows library authors to create a graph with a given number of layers of nodes and connections between each node, with a certain fraction of the graph dynamically changing sources, and record both execution time and GC time.

The frameworks are all plenty fast for typical applications. The charts report the number of updated reactive elements per millisecond on an M1 laptop. Typical applications will do much more work than a framework benchmark, and at these speeds the frameworks are unlikely to bottleneck overall performance. Most important is that the framework not run any user code unnecessarily.

That said, there's learning here to improve performance of all the frameworks.

## Results

(WIP)
