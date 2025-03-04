import { makeGraph, runGraph } from "./benches/reactively/dependencyGraph";
import { expect, test } from "vitest";
import { FrameworkInfo, TestConfig } from "./util/frameworkTypes";
import { frameworkInfo } from "./frameworksList";

frameworkInfo.forEach((frameworkInfo) => frameworkTests(frameworkInfo));

function makeConfig(): TestConfig {
  return {
    width: 3,
    totalLayers: 3,
    staticFraction: 1,
    nSources: 2,
    readFraction: 1,
    expected: {},
    iterations: 1,
  };
}

/** some basic tests to validate the reactive framework
 * wrapper works and can run performance tests.
 */
function frameworkTests({ framework, testPullCounts }: FrameworkInfo) {
  const name = framework.name;
  test(`${name} | simple dependency executes`, () => {
    const s = framework.signal(2);
    const c = framework.computed(() => s.read() * 2);

    expect(c.read()).toEqual(4);
  });

  test(`${name} | static graph`, () => {
    const config = makeConfig();
    const { graph, counter } = makeGraph(framework, 1, config);
    const sum = runGraph(graph, 2, framework);
    expect(sum).toEqual(16);
    expect(counter.count).toEqual(11);
  });

  test(`${name} | static graph, read 2/3 of leaves`, () => {
    const config = makeConfig();
    config.readFraction = 2 / 3;
    config.iterations = 10;
    const { counter, graph } = makeGraph(framework, 2 / 3, config);
    const sum = runGraph(graph, 10, framework);

    expect(sum).toEqual(72);
    if (testPullCounts) {
      expect(counter.count).toEqual(41);
    }
  });

  test(`${name} | dynamic graph`, () => {
    const config = makeConfig();
    config.staticFraction = 0.5;
    config.width = 4;
    config.totalLayers = 2;
    const { graph, counter } = makeGraph(framework, 1, config);
    const sum = runGraph(graph, 10, framework);

    expect(sum).toEqual(72);
    expect(counter.count).toEqual(22);
  });
}
