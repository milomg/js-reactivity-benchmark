import { TestConfig, FrameworkInfo } from "./util/frameworkTypes";

import { angularFramework } from "./frameworks/angularSignals";
import { mobxFramework } from "./frameworks/mobx";
import { tc39SignalsProposalStage0 } from "./frameworks/tc39-proposal-signals-stage-0";
import { molWireFramework } from "./frameworks/molWire";
import { obyFramework } from "./frameworks/oby";
import { preactSignalFramework } from "./frameworks/preactSignals";
import { reactivelyFramework } from "./frameworks/reactively";
import { signiaFramework } from "./frameworks/signia";
import { solidFramework } from "./frameworks/solid";
import { sFramework } from "./frameworks/s";
import { usignalFramework } from "./frameworks/uSignal";
import { vueReactivityFramework } from "./frameworks/vueReactivity";
import { xReactivityFramework } from "./frameworks/xReactivity";
// import { compostateFramework } from "./frameworks/compostate";
// import { valtioFramework } from "./frameworks/valtio";

export const frameworkInfo: FrameworkInfo[] = [
  { framework: preactSignalFramework, testPullCounts: true },
  { framework: tc39SignalsProposalStage0, testPullCounts: true },
  { framework: reactivelyFramework, testPullCounts: true },
  { framework: sFramework },
  { framework: angularFramework, testPullCounts: true },
  { framework: molWireFramework, testPullCounts: true },
  { framework: obyFramework, testPullCounts: true },
  { framework: signiaFramework, testPullCounts: true },
  { framework: solidFramework },
  { framework: usignalFramework, testPullCounts: true },
  { framework: xReactivityFramework, testPullCounts: true },
  // // NOTE: Vue currently hangs on some of the `dynamic` tests and `cellx` tests, so disable it if you want to run them. https://github.com/vuejs/core/issues/11928
  { framework: vueReactivityFramework, testPullCounts: true },
  // NOTE: MobX currently hangs on some of the `dynamic` tests and `cellx` tests, so disable it if you want to run them. (https://github.com/mobxjs/mobx/issues/3926)
  { framework: mobxFramework, testPullCounts: false },

  // --- Disabled frameworks ---
  // NOTE: the compostate adapter is currently broken and unused.
  // { framework: compostateFramework },
  // NOTE: the kairo adapter is currently broken and unused.
  // { framework: kairoFramework, testPullCounts: true },
  // NOTE: Valtio currently hangs on some of the `dynamic` tests, so disable it if you want to run them. (https://github.com/pmndrs/valtio/discussions/949)
  // { framework: valtioFramework },
];

export const perfTests: TestConfig[] = [
  {
    name: "simple component",
    width: 10, // can't change for decorator tests
    staticFraction: 1, // can't change for decorator tests
    nSources: 2, // can't change for decorator tests
    totalLayers: 5,
    readFraction: 0.2,
    iterations: 600000,
    expected: {
      sum: 19199832,
      count: 2640004,
    },
  },
  {
    name: "dynamic component",
    width: 10,
    totalLayers: 10,
    staticFraction: 3 / 4,
    nSources: 6,
    readFraction: 0.2,
    iterations: 15000,
    expected: {
      sum: 302310477864,
      count: 1125003,
    },
  },
  {
    name: "large web app",
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
  {
    name: "wide dense",
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
  {
    name: "deep",
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
  // Several frameworks hang on this test, so disabling it for now.
  // @see https://github.com/vuejs/core/issues/11928
  // {
  //   name: "very dynamic",
  //   width: 100,
  //   totalLayers: 15,
  //   staticFraction: 0.5,
  //   nSources: 6,
  //   readFraction: 1,
  //   iterations: 2000,
  //   expected: {
  //     sum: 15664996402790400,
  //     count: 1078671,
  //   },
  // },
];
