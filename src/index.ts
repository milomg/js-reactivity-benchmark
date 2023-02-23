import { benchmarkTest } from "./NodeBenchmark";
import { cellxbench } from "./Cellx-bench";
import { sbench } from "./S-bench";
import { frameworkInfo, perfTests } from "./perfConfigs";
import { logPerfResultHeaders } from "./util/PerfLogging";

async function main() {
  const tests = frameworkInfo.flatMap((perfFramework) =>
    perfTests.map((config) => ({
      config,
      perfFramework,
    }))
  );

  logPerfResultHeaders();
  for (const t of tests) {
    await benchmarkTest(t);
  }

  for (const { framework } of frameworkInfo) {
    console.log("------------------");
    console.log("Running S-bench for", framework.name);
    sbench(framework);
  }

  for (const { framework } of frameworkInfo) {
    console.log("------------------");
    console.log("Running Cellx-bench for", framework.name);
    cellxbench(framework);
  }
}

main();
