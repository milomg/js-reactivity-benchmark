import { dynamicBench } from "./dynamicBench";
import { cellxbench } from "./cellxBench";
import { sbench } from "./sBench";
import { frameworkInfo } from "./config";
import { logPerfResult, perfReportHeaders } from "./util/perfLogging";
import { molBench } from "./molBench";
import { kairoBench } from "./kairoBench";
import { promiseDelay } from "./util/asyncUtil";

async function main() {
  logPerfResult(perfReportHeaders());

  await promiseDelay(0);

  for (const { framework } of frameworkInfo) {
    await kairoBench(framework);
    await promiseDelay(2000);
  }

  for (const { framework } of frameworkInfo) {
    await molBench(framework);
    await promiseDelay(2000);
  }

  for (const { framework } of frameworkInfo) {
    sbench(framework);
    await promiseDelay(2000);
  }

  for (const { framework } of frameworkInfo) {
    cellxbench(framework);
    await promiseDelay(2000);
  }

  for (const frameworkTest of frameworkInfo) {
    await dynamicBench(frameworkTest);
    await promiseDelay(2000);
  }
}

(window as any).main = main;
