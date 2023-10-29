import { dynamicBench } from "./dynamicBench";
import { cellxbench } from "./cellxBench";
import { sbench } from "./sBench";
import { frameworkInfo } from "./config";
import { logPerfResult, perfReportHeaders } from "./util/perfLogging";
import { molBench } from "./molBench";
import { kairoBench } from "./kairoBench";

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

async function main() {
  logPerfResult(perfReportHeaders());

  await nextTick();

  for (const { framework } of frameworkInfo) {
    await kairoBench(framework);
    await nextTick();
  }

  for (const { framework } of frameworkInfo) {
    await molBench(framework);
    await nextTick();
  }

  for (const { framework } of frameworkInfo) {
    sbench(framework);
    await nextTick();
  }

  for (const { framework } of frameworkInfo) {
    cellxbench(framework);
    await nextTick();
  }

  for (const frameworkTest of frameworkInfo) {
    await dynamicBench(frameworkTest);
    await nextTick();
  }
}

(window as any).main = main;
