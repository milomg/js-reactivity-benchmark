# JS Reactivity Benchmark

```
$ pnpm bench
```

## Features

- Configurable dependency graph: graph shape, density, read rate are all adjustable.
- Supports dynamic reactive nodes
- Framework agnostic. Simple API to test new reactive frameworks.
- Runs benchmarks under nodeJs for convenience and continuous integration.
- Uses v8 intrinsics to warmup and cleanup
- Tracks garbage collection overhead per test
- Outputs a csv file for easy integration with other tools.


Current reactivity benchmarks ([S.js](https://github.com/adamhaile/S/blob/master/bench/bench.js), [CellX](https://github.com/Riim/cellx/blob/master/perf/perf.html)) are focused on creation time, and update time for a static graph. Additionally, existing benchmarks aren't very configurable, and don't test for dynamic dependencies. We've created a new benchmark that allows library authors to compare their frameworks against each other, and against the existing benchmarks, as well as against a new configurable benchmark with dynamically changing sources.

We're also working on enabling consistent logging and efficient tracking of GC time accross all benchmarks.

The frameworks are all plenty fast for typical applications. The charts report the number of updated reactive elements per millisecond on an M1 laptop. Typical applications will do much more work than a framework benchmark, and at these speeds the frameworks are unlikely to bottleneck overall performance.

That said, there's learning here to improve performance of all the frameworks.

<table>
  <tr>
    <td> 
      <img width="400" alt="Screen Shot 2022-11-16 at 10 34 09 AM" src="https://user-images.githubusercontent.com/63816/202264375-04f15400-bb36-424c-8bb3-ac149491d4ac.png">
    </td>
    <td>
      <img width="400" alt="image" src="https://user-images.githubusercontent.com/63816/202264535-e181bf3b-4444-43d8-8d06-afd56a1297e7.png">
    </td>
  </tr>
</table>
