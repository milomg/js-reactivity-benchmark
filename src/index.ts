import { dynamicBench } from "./dynamicBench";
import { cellxbench } from "./cellxBench";
import { sbench } from "./sBench";
import { frameworkInfo } from "./config";
import { logPerfResult, perfReportHeaders } from "./util/perfLogging";
import { molBench } from "./molBench";
import { kairoBench } from "./kairoBench";

async function main() {
  logPerfResult(perfReportHeaders());

  for (const frameworkTest of frameworkInfo) {
    const { framework } = frameworkTest;

    await kairoBench(framework);
    await molBench(framework);
    sbench(framework);

    cellxbench(framework);

    await dynamicBench(frameworkTest);

    globalThis.gc?.();
  }
}

main();
