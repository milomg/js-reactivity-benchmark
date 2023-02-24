import v8 from "v8-natives";
import { avoidablePropagation } from "./kairo/avoidable";
import { broadPropagation } from "./kairo/broad";
import { deepPropagation } from "./kairo/deep";
import { diamond } from "./kairo/diamond";
import { mux } from "./kairo/mux";
import { repeatedObservers } from "./kairo/repeated";
import { triangle } from "./kairo/triangle";
import { unstable } from "./kairo/unstable";
import { fastestTest } from "./util/benchRepeat";
import { logPerfResult } from "./util/perfLogging";
import { ReactiveFramework } from "./util/reactiveFramework";

const cases = [
  avoidablePropagation,
  broadPropagation,
  deepPropagation,
  diamond,
  mux,
  repeatedObservers,
  triangle,
  unstable,
];

export async function kairoBench(framework: ReactiveFramework) {
  for (const c of cases) {
    const iter = framework.withBuild(() => {
      const iter = c(framework);
      return iter;
    });

    v8.optimizeFunctionOnNextCall(iter);
    iter();

    const { timing } = await fastestTest(10, () => {
      for (let i = 0; i < 1000; i++) {
        iter();
      }
    });

    logPerfResult({
      framework: framework.name,
      test: c.name,
      time: timing.time.toFixed(2),
      gcTime: timing.gcTime?.toFixed(2),
    });
  }
}
