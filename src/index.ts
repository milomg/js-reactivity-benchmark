import { dynamicBench } from "./dynamicBench";
import { cellxbench } from "./cellxBench";
import { sbench } from "./sBench";
import { frameworkInfo } from "./config";
import { logPerfResult, perfReportHeaders } from "./util/perfLogging";
import { molBench } from "./molBench";
import { kairoBench } from "./kairoBench";

async function main() {
  logPerfResult(perfReportHeaders());
  // (globalThis as any).__DEV__ = true;

  for (const { framework } of frameworkInfo) {
    await kairoBench(framework);
  }

  for (const { framework } of frameworkInfo) {
    await molBench(framework);
  }

  for (const { framework } of frameworkInfo) {
    sbench(framework);
  }

  // NOTE: Several of the frameworks hang on this benchmark, so disabling it for now.
  // for (const { framework } of frameworkInfo) {
  //   cellxbench(framework);
  // }

  for (const frameworkTest of frameworkInfo) {
    await dynamicBench(frameworkTest);
  }
}

main();
