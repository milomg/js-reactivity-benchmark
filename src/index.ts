import { dynamicBench } from "./dynamicBench";
// import { cellxbench } from "./cellxBench";
import { sbench } from "./sBench";
import { frameworkInfo } from "./config";
import { logPerfResult, perfReportHeaders } from "./util/perfLogging";
import { molBench } from "./molBench";
import { kairoBench } from "./kairoBench";

async function main() {
  logPerfResult(perfReportHeaders());
  (globalThis as any).__DEV__ = true;

  for (const { framework } of frameworkInfo) {
    await kairoBench(framework);
  }

  // for (const { framework } of frameworkInfo) {
  //   await molBench(framework);
  // }

  // for (const { framework } of frameworkInfo) {
  //   sbench(framework);
  // }

  // MobX, Vue, and Valtio all fail this test currently, so disabling it for now.
  // @see https://github.com/vuejs/core/issues/11928
  // for (const { framework } of frameworkInfo) {
  //   cellxbench(framework);
  // }

  // for (const frameworkTest of frameworkInfo) {
  //   await dynamicBench(frameworkTest);
  // }
}

main();
