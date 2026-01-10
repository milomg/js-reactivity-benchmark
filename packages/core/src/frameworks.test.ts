import { expect, test } from "vitest";
import { makeGraph, runGraph } from "./benches/reactively/dependencyGraph";
import { frameworkInfo } from "./frameworksList";
import type { FrameworkInfo, TestConfig } from "./util/frameworkTypes";

frameworkInfo.forEach((frameworkInfo) => {
  frameworkTests(frameworkInfo);
});

function makeConfigs(): Record<string, TestConfig> {
  return {
    "static graph": {
      width: 3,
      totalLayers: 3,
      staticFraction: 1,
      nSources: 2,
      readFraction: 1,
      iterations: 2,
      expected: {
        sum: 16,
        count: 11,
      },
    },
    "static graph, read 2/3 of leaves": {
      width: 3,
      totalLayers: 3,
      staticFraction: 1,
      nSources: 2,
      readFraction: 2 / 3,
      iterations: 10,
      expected: {
        sum: 72,
        count: 41,
      },
    },
    "dynamic graph": {
      width: 4,
      totalLayers: 2,
      staticFraction: 0.5,
      nSources: 2,
      readFraction: 1,
      iterations: 10,
      expected: {
        sum: 72,
        count: 22,
      },
    },
    "600000 iterations": {
      width: 10, // can't change for decorator tests
      staticFraction: 1, // can't change for decorator tests
      nSources: 2, // can't change for decorator tests
      totalLayers: 5,
      readFraction: 0.2,
      iterations: 600000,
      expected: {
        sum: 19199968,
        count: 3480019,
      },
    },
    "dynamic graph, read 3/4 of leaves": {
      width: 10,
      totalLayers: 10,
      staticFraction: 3 / 4,
      nSources: 6,
      readFraction: 0.2,
      iterations: 15000,
      expected: {
        sum: 302310782860,
        count: 1155004,
      },
    },
    "width 1000": {
      width: 1000,
      totalLayers: 12,
      staticFraction: 0.95,
      nSources: 4,
      readFraction: 1,
      iterations: 7000,
      expected: {
        sum: 29355933696000,
        count: 1473791,
      },
    },
    "25 sources": {
      width: 1000,
      totalLayers: 5,
      staticFraction: 1,
      nSources: 25,
      readFraction: 1,
      iterations: 3000,
      expected: {
        sum: 1171484375000,
        count: 735756,
      },
    },
    "500 layers deep": {
      width: 5,
      totalLayers: 500,
      staticFraction: 1,
      nSources: 3,
      readFraction: 1,
      iterations: 500,
      expected: {
        sum: 3.0239642676898464e241,
        count: 1246502,
      },
    },
    "100 x 15, read 1/2 of leaves": {
      width: 100,
      totalLayers: 15,
      staticFraction: 0.5,
      nSources: 6,
      readFraction: 1,
      iterations: 2000,
      expected: {
        sum: 15664996402790400,
        count: 1078673, // 1078849,
      },
    },
  };
}

/** some basic tests to validate the reactive framework
 * wrapper works and can run performance tests.
 */
function frameworkTests({ framework, testPullCounts }: FrameworkInfo) {
  test(`${framework.name} | simple dependency executes`, () => {
    const s = framework.signal(2);
    const c = framework.computed(() => s.read() * 2);

    expect(c.read()).toEqual(4);
  });

  const configs = makeConfigs();
  for (const [testName, config] of Object.entries(configs)) {
    test(`${framework.name} | ${testName}`, () => {
      const { graph, counter } = makeGraph(
        framework,
        config.readFraction,
        config,
      );
      const sum = runGraph(graph, config.iterations, framework);
      expect(sum).toEqual(config.expected.sum);
      if (testPullCounts) {
        expect(counter.count).toEqual(config.expected.count);
      }
    });
  }
}
