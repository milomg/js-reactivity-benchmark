import { Counter, makeGraph, runGraph } from "./util/dependencyGraph";
import { expect, test, vi } from "vitest";
import { FrameworkInfo, TestConfig } from "./util/frameworkTypes";
import { frameworkInfo } from "./config";

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
    framework.withBuild(() => {
      const s = framework.signal(2);
      const c = framework.computed(() => s.read() * 2);

      expect(c.read()).toEqual(4);
    });
  });

  test(`${name} | simple write`, () => {
    framework.withBuild(() => {
      const s = framework.signal(2);
      const c = framework.computed(() => s.read() * 2);
      expect(s.read()).toEqual(2);
      expect(c.read()).toEqual(4);

      s.write(3);
      expect(s.read()).toEqual(3);
      expect(c.read()).toEqual(6);
    });
  });

  test(`${name} | static graph`, () => {
    const config = makeConfig();
    const counter = new Counter();
    const graph = makeGraph(framework, config, counter);
    const sum = runGraph(graph, 2, 1, framework);
    expect(sum).toEqual(16);
    if (testPullCounts) {
      expect(counter.count).toEqual(11);
    } else {
      expect(counter.count).toBeGreaterThanOrEqual(11);
    }
  });

  test(`${name} | static graph, read 2/3 of leaves`, () => {
    framework.withBuild(() => {
      const config = makeConfig();
      config.readFraction = 2 / 3;
      config.iterations = 10;
      const counter = new Counter();
      const graph = makeGraph(framework, config, counter);
      const sum = runGraph(graph, 10, 2 / 3, framework);

      expect(sum).toEqual(73);
      if (testPullCounts) {
        expect(counter.count).toEqual(41);
      } else {
        expect(counter.count).toBeGreaterThanOrEqual(41);
      }
    });
  });

  test(`${name} | dynamic graph`, () => {
    framework.withBuild(() => {
      const config = makeConfig();
      config.staticFraction = 0.5;
      config.width = 4;
      config.totalLayers = 2;
      const counter = new Counter();
      const graph = makeGraph(framework, config, counter);
      const sum = runGraph(graph, 10, 1, framework);

      expect(sum).toEqual(72);
      if (testPullCounts) {
        expect(counter.count).toEqual(22);
      } else {
        expect(counter.count).toBeGreaterThanOrEqual(22);
      }
    });
  });

  test(`${name} | withBuild`, () => {
    const r = framework.withBuild(() => {
      const s = framework.signal(2);
      const c = framework.computed(() => s.read() * 2);

      expect(c.read()).toEqual(4);
      return c.read();
    });

    expect(r).toEqual(4);
  });

  test(`${name} | effect`, () => {
    const spy = vi.fn();

    framework.withBuild(() => {
      const s = framework.signal(2);
      const c = framework.computed(() => s.read() * 2);

      framework.effect(() => spy(c.read()));
      framework.withBatch(() => {
        s.write(3);
      });

      expect(s.read()).toEqual(3);
      expect(c.read()).toEqual(6);
    });

    expect(spy.mock.calls.length).toBe(2);
  });
}
