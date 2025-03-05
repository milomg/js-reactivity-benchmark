import { FrameworkInfo } from "./util/frameworkTypes";
import { angularFramework as angularFramework2 } from "./frameworks/angularSignals2";
// import { compostateFramework } from "./frameworks/inactive/compostate";
// import { kairoFramework } from "./frameworks/inactive/kairo";
// import { mobxFramework } from "./frameworks/inactive/mobx";
import { molWireFramework } from "./frameworks/molWire";
// import { obyFramework } from "./frameworks/inactive/oby";
import { preactSignalFramework } from "./frameworks/preactSignals";
import { reactivelyFramework } from "./frameworks/reactively";
// import { sFramework } from "./frameworks/inactive/s";
import { solidFramework } from "./frameworks/solid";
// import { usignalFramework } from "./frameworks/inactive/uSignal";
// import { vueReactivityFramework } from "./frameworks/inactive/vueReactivity";
// import { xReactivityFramework } from "./frameworks/inactive/xReactivity";
import { alienFramework } from "./frameworks/alienSignals";
import { svelteFramework } from "./frameworks/svelte";
import { tansuFramework } from "./frameworks/tansu";
// import { tc39SignalsFramework } from "./frameworks/tc39signals";

export const frameworkInfo: FrameworkInfo[] = [
  { framework: alienFramework, testPullCounts: true },
  { framework: angularFramework2, testPullCounts: true },
  // { framework: angularFramework, testPullCounts: true },
  // { framework: compostateFramework, testPullCounts: true },
  // { framework: kairoFramework, testPullCounts: true },
  // { framework: mobxFramework, testPullCounts: true },
  { framework: molWireFramework, testPullCounts: true },
  // { framework: obyFramework, testPullCounts: true },
  { framework: preactSignalFramework, testPullCounts: true },
  { framework: reactivelyFramework, testPullCounts: true },
  // { framework: sFramework },
  { framework: solidFramework }, // solid can't testPullCounts because batch executes all leaf nodes even if unread
  { framework: svelteFramework, testPullCounts: true },
  { framework: tansuFramework, testPullCounts: true },
  // { framework: tc39SignalsFramework, testPullCounts: true },
  // { framework: usignalFramework, testPullCounts: true },
  // { framework: vueReactivityFramework, testPullCounts: true },
  // { framework: xReactivityFramework, testPullCounts: true },
];
