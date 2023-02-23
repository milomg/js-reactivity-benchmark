import { makePerfList } from "./util/AllPerfTests";
import { logPerfResultHeaders } from "./util/PerfLogging";
import { benchmarkTest } from "./NodeBenchmark";

main();

async function main() {
  const tests = makePerfList();

  logPerfResultHeaders();
  for (const t of tests) {
    await benchmarkTest(t);
  }
}
