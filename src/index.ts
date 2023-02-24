import { dynamicBench } from "./dynamicBench";
import { cellxbench } from "./cellxBench";
import { sbench } from "./sBench";
import { frameworkInfo } from "./config";
import { logPerfResult, perfReportHeaders } from "./util/perfLogging";
import { molBench } from "./molBench";
import { kairoBench } from "./kairoBench";

async function main() {
  logPerfResult(perfReportHeaders())

  for (const { framework } of frameworkInfo) {
    kairoBench(framework);
  }

  for (const { framework } of frameworkInfo) {
    molBench(framework);
  }

  for (const { framework } of frameworkInfo) {
    sbench(framework);
  }

  for (const { framework } of frameworkInfo) {
    cellxbench(framework);
  }

  for (const frameworkTest of frameworkInfo) {
    await dynamicBench(frameworkTest);
  }
}

main();
