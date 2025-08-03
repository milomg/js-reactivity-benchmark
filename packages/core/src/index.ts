import { dynamicBench } from "./benches/reactively/dynamicBench";
import { cellxbench } from "./benches/cellxBench";
import { sbench } from "./benches/sBench";
import { kairoBench } from "./benches/kairoBench";
import { promiseDelay } from "./util/asyncUtil";
import type { FrameworkInfo } from "./util/frameworkTypes";
import { PerfResultCallback } from "./util/perfLogging";

export type { ReactiveFramework } from "./util/reactiveFramework";
export {
  perfResultHeaders,
  formatPerfResult,
  type PerfResult,
  type PerfResultStrings,
  type PerfResultCallback,
} from "./util/perfLogging";
export { frameworkInfo, allFrameworks } from ".//frameworksList";
export type { FrameworkInfo };

export async function runTests(
  frameworkInfo: FrameworkInfo[],
  logPerfResult: PerfResultCallback,
) {
  await promiseDelay(0);

  for (const { framework } of frameworkInfo) {
    await sbench(framework, logPerfResult);
    await promiseDelay(1000);
  }

  await kairoBench(frameworkInfo, logPerfResult);

  await cellxbench(frameworkInfo, logPerfResult);
  await promiseDelay(1000);

  await dynamicBench(frameworkInfo, logPerfResult);
  await promiseDelay(1000);
}
