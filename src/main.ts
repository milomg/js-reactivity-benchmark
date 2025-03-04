import { frameworkInfo } from "./frameworksList";
import {
  formatPerfResult,
  formatPerfResultStrings,
  PerfResult,
  perfResultHeaders,
  runTests,
} from "./index";

const pre = document.querySelector("pre")!;
function logLine(line: string): void {
  pre.innerText += line + "\n";
}

function logPerfResult(result: PerfResult): void {
  logLine(formatPerfResult(result));
}

async function main() {
  logLine(formatPerfResultStrings(perfResultHeaders()));
  await runTests(frameworkInfo, logPerfResult);
}

(window as any).main = main;
