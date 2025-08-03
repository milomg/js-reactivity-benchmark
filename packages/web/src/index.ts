import {
  formatPerfResult,
  PerfResult,
  perfResultHeaders,
  runTests,
  frameworkInfo,
} from "js-reactivity-benchmark/src/index";

let data: PerfResult[] = [];

const pre = document.querySelector("pre")!;
function logLine(line: string): void {
  pre.innerText += line + "\n";
}

function logPerfResult(result: PerfResult): void {
  data.push(result);
  logLine(
    formatPerfResult({
      framework: result.framework,
      test: result.test,
      time: result.time.toString(),
    }),
  );
}

function graph() {
  console.log(data);

  document.querySelector("table")?.remove();

  const tests = [...new Set(data.map((d) => d.test))];
  const frameworks = [...new Set(data.map((d) => d.framework))];

  const table = document.createElement("table");
  table.style.width = "1100px";
  table.style.fontFamily = "sans-serif";
  table.style.fontSize = "12px";

  const colgroup = document.createElement("colgroup");
  {
    const col = document.createElement("col");
    col.style.width = "200px";
    colgroup.appendChild(col);
  }
  {
    const col = document.createElement("col");
    col.style.width = "100px";
    colgroup.appendChild(col);
  }
  {
    const col = document.createElement("col");
    col.style.width = "800px";
    colgroup.appendChild(col);
  }

  table.appendChild(colgroup);
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  const colors = [
    "fb2c36", // red-500
    "ff6900", // orange-500
    "fd9a00", // amber-500
    "efb100", // yellow-500
    "7ccf00", // lime-500
    "00c951", // green-500
    "00bc7d", // emerald-500
    "00bba7", // teal-500
    "00b8db", // cyan-500
    "00a6f4", // sky-500
    "2b7fff", // blue-500
    "615fff", // indigo-500
    "8e51ff", // violet-500
    "ad46ff", // purple-500
    "e12afb", // fuchsia-500
    "f6339a", // pink-500
    "ff2056", // rose-500
  ];

  const maxTime = Math.max(...data.map((x) => x.time));

  const groupedData: {
    [key: string]: {
      [key: string]: number;
    };
  } = {};
  for (const row of data) {
    if (!groupedData[row.test]) {
      groupedData[row.test] = {};
    }
    groupedData[row.test][row.framework] = row.time;
  }
  {
    // github markdown allows scrolling tables if we have a long string of text with no wrapping
    // so we just create a bunch of 0s in a row
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.innerText = "0".repeat(150);
    td.colSpan = 3;
    td.style.display = "none";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  for (const test of tests) {
    let first = true;
    for (const frameworkIndex in frameworks) {
      const framework = frameworks[frameworkIndex];
      const tr = document.createElement("tr");
      if (first) {
        const td = document.createElement("td");
        td.rowSpan = frameworks.length;
        td.innerText = test;
        tr.appendChild(td);
        first = false;
      }
      {
        const td = document.createElement("td");
        td.innerText = framework;
        tr.appendChild(td);
      }
      {
        const td = document.createElement("td");
        const time = groupedData[test][framework] ?? 0;
        const img = document.createElement("img");
        img.src = `pngs/${colors[frameworkIndex]}.png`;
        img.style.width = Math.floor((800 * time) / maxTime) + "px";
        img.style.height = "20px";
        td.appendChild(img);
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }
  }
  pre.after(table);
}

async function main() {
  logLine(formatPerfResult(perfResultHeaders()));
  await runTests(frameworkInfo, logPerfResult);
}

(window as any).main = main;
(window as any).graph = graph;
