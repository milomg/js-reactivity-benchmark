import {
  frameworkInfo,
  formatPerfResult,
  formatPerfResultStrings,
  PerfResult,
  perfResultHeaders,
  runTests,
} from "js-reactivity-benchmark/src/index";

function logLine(line: string): void {
  console.log(line);
}

function logPerfResult(result: PerfResult): void {
  logLine(formatPerfResult(result));
}

async function main() {
  logLine(formatPerfResultStrings(perfResultHeaders()));
  await runTests(frameworkInfo, logPerfResult);
}

main();
