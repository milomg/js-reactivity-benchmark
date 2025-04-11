import { avoidablePropagation } from "./kairo/avoidable";
import { broadPropagation } from "./kairo/broad";
import { deepPropagation } from "./kairo/deep";
import { diamond } from "./kairo/diamond";
import { mux } from "./kairo/mux";
import { repeatedObservers } from "./kairo/repeated";
import { triangle } from "./kairo/triangle";
import { unstable } from "./kairo/unstable";
import { nextTick } from "../util/asyncUtil";
import { fastestTest } from "../util/benchRepeat";
import { ReactiveFramework } from "../util/reactiveFramework";
import { PerfResultCallback } from "../util/perfLogging";

const cases = [
  { name: "avoidablePropagation", fn: avoidablePropagation },
  { name: "broadPropagation", fn: broadPropagation },
  { name: "deepPropagation", fn: deepPropagation },
  { name: "diamond", fn: diamond },
  { name: "mux", fn: mux },
  { name: "repeatedObservers", fn: repeatedObservers },
  { name: "triangle", fn: triangle },
  { name: "unstable", fn: unstable },
];

export async function kairoBench(
  framework: ReactiveFramework,
  logPerfResult: PerfResultCallback,
) {
  for (const c of cases) {
    const iter = framework.withBuild(() => {
      const iter = c.fn(framework);
      return iter;
    });

    iter();
    iter();

    await nextTick();
    iter();

    const { timing } = await fastestTest(5, () => {
      for (let i = 0; i < 1000; i++) {
        iter();
      }
    });

    framework.cleanup();
    if (globalThis.gc) gc!(), gc!();

    logPerfResult({
      framework: framework.name,
      test: c.name,
      time: timing.time,
    });
  }
}
