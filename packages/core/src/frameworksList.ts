import type { FrameworkInfo } from "./util/frameworkTypes";
import { alienFramework } from "./frameworks/alienSignals";
import { angularFramework as angularFramework2 } from "./frameworks/angularSignals2";
// import { causeEffectFramework } from "./frameworks/causeEffect";
import { cfxFramework } from "./frameworks/cfx";
// import { compostateFramework } from "./frameworks/inactive/compostate";
// import { mobxFramework } from "./frameworks/inactive/mobx";
import { preactSignalFramework } from "./frameworks/preactSignals";
// import { pushPullR3Framework } from "./frameworks/pushPullR3";
// import { r3Framework } from "./frameworks/r3";
// import { reactivelyFramework } from "./frameworks/reactively";
// import { sFramework } from "./frameworks/inactive/s";
import { solidFramework } from "./frameworks/solid";
// import { potaFramework } from "./frameworks/pota";
import { svelteFramework } from "./frameworks/svelte";
// import { tansuFramework } from "./frameworks/tansu";
// import { usignalFramework } from "./frameworks/inactive/uSignal";
import { vueReactivityFramework } from "./frameworks/inactive/vueReactivity";
// import { xReactivityFramework } from "./frameworks/xReactivity";

// Currently failing kairoBench tests
// import { molWireFramework } from "./frameworks/molWire";

// Disabled until cleanup performance is fixed
// import { tc39SignalsFramework } from "./frameworks/tc39signals";

// Currently failing cellx tests
// import { obyFramework } from "./frameworks/inactive/oby";

export const frameworkInfo: FrameworkInfo[] = [
  { framework: alienFramework, testPullCounts: true },
  { framework: angularFramework2, testPullCounts: true },
  // { framework: causeEffectFramework, testPullCounts: true },
  { framework: cfxFramework, testPullCounts: true },
  // { framework: compostateFramework, testPullCounts: true },
  // { framework: mobxFramework, testPullCounts: true },
  { framework: preactSignalFramework, testPullCounts: true },
  // { framework: pushPullR3Framework, testPullCounts: true },
  // { framework: r3Framework, testPullCounts: false },
  // { framework: reactivelyFramework, testPullCounts: true },
  // { framework: sFramework },
  { framework: solidFramework }, // solid can't testPullCounts because batch executes all leaf nodes even if unread
  // { framework: potaFramework },
  { framework: svelteFramework, testPullCounts: true },
  // { framework: tansuFramework, testPullCounts: true },
  { framework: vueReactivityFramework, testPullCounts: true },
  // { framework: xReactivityFramework, testPullCounts: true },
];

export const allFrameworks: FrameworkInfo[] = [
  { framework: alienFramework, testPullCounts: true },
  { framework: angularFramework2, testPullCounts: true },
  // { framework: causeEffectFramework, testPullCounts: true },
  { framework: cfxFramework, testPullCounts: true },
  // { framework: compostateFramework, testPullCounts: true },
  // { framework: mobxFramework, testPullCounts: true },
  // { framework: molWireFramework, testPullCounts: true },
  // { framework: obyFramework, testPullCounts: true },
  { framework: preactSignalFramework, testPullCounts: true },
  // { framework: pushPullR3Framework, testPullCounts: true },
  // { framework: r3Framework, testPullCounts: false },
  // { framework: reactivelyFramework, testPullCounts: true },
  // { framework: sFramework },
  { framework: solidFramework }, // solid can't testPullCounts because batch executes all leaf nodes even if unread
  // { framework: potaFramework },
  { framework: svelteFramework, testPullCounts: true },
  // { framework: tansuFramework, testPullCounts: true },
  // { framework: tc39SignalsFramework, testPullCounts: true },
  // { framework: usignalFramework, testPullCounts: true },
  { framework: vueReactivityFramework, testPullCounts: true },
  // { framework: xReactivityFramework, testPullCounts: true },
];
