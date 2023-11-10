import { dynamicBench } from "./dynamicBench";
import { cellxbench } from "./cellxBench";
import { sbench } from "./sBench";
import { frameworkInfo } from "./config";
import { logPerfResult, perfReportHeaders } from "./util/perfLogging";
import { molBench } from "./molBench";
import { kairoBench } from "./kairoBench";
import { gcBench } from "./gcBench";

async function main() {
  logPerfResult(perfReportHeaders());

  for (const { framework } of frameworkInfo) {
    await kairoBench(framework);
  }

  for (const { framework } of frameworkInfo) {
    await molBench(framework);
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

  for (const { framework } of frameworkInfo) {
    await gcBench(framework);
  }
}

main();
