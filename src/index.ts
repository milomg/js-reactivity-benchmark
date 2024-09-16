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

  for (const frameworkTest of frameworkInfo) {
    const { framework } = frameworkTest;

    await kairoBench(framework);
    await molBench(framework);
    sbench(framework);

    // MobX and Valtio both fail this test currently, so disabling it for now.
    // @see https://github.com/mobxjs/mobx/issues/3926
    // cellxbench(framework);

    await dynamicBench(frameworkTest);
  }
}

main();
