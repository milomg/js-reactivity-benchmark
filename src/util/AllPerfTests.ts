import { makeGraph as doMakeGraph } from "./DependencyGraph";
import {
  FrameworkInfo,
  frameworkInfo,
  perfTests,
  TestConfig,
} from "./PerfConfigurations";

export interface TestWithFramework {
  config: TestConfig;
  perfFramework: PerfFramework;
}

export type PerfFramework = FrameworkInfo &
  Required<Pick<FrameworkInfo, "makeGraph">>;

const allFrameworks: PerfFramework[] = makeFrameworks(frameworkInfo);

/** return a list of all benchmarks  */
export function makePerfList(): TestWithFramework[] {
  return allFrameworks.flatMap((perfFramework) =>
    perfTests.map((config) => ({
      config,
      perfFramework,
    }))
  );
}

function makeFrameworks(infos: FrameworkInfo[]): PerfFramework[] {
  return infos.map((frameworkInfo) => {
    const {
      framework,
      testPullCounts = false,
      makeGraph = doMakeGraph,
    } = frameworkInfo;

    return {
      framework,
      testPullCounts,
      makeGraph,
    };
  });
}
