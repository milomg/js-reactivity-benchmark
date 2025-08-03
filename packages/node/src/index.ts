import {
  frameworkInfo,
  formatPerfResult,
  PerfResult,
  perfResultHeaders,
  runTests,
} from "js-reactivity-benchmark/src/index";

function logLine(line: string): void {
  console.log(line);
}

function logPerfResult(result: PerfResult): void {
  logLine(
    formatPerfResult({
      framework: result.framework,
      test: result.test,
      time: result.time.toFixed(2),
    }),
  );
}

async function main() {
  logLine(formatPerfResult(perfResultHeaders()));
  await runTests(frameworkInfo, logPerfResult);
}

main();
