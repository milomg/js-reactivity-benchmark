import { avoidablePropagation } from "./kairo/avoidable";
import { broadPropagation } from "./kairo/broad";
import { deepPropagation } from "./kairo/deep";
import { diamond } from "./kairo/diamond";
import { mux } from "./kairo/mux";
import { repeatedObservers } from "./kairo/repeated";
import { triangle } from "./kairo/triangle";
import { unstable } from "./kairo/unstable";
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
]

export function kairoBench(framework: ReactiveFramework) {
  for (const c of cases) {
    const iter = framework.withBuild(() => {
      const iter = c(framework);
      return iter;
    });

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      iter();
    }
    const end = performance.now();
    console.log(`kairo ${c.name}`, end - start);
  }
}
