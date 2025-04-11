import {
  frameworkInfo,
  formatPerfResult,
  formatPerfResultStrings,
  PerfResult,
  perfResultHeaders,
  runTests,
} from "js-reactivity-benchmark/src/index";

let data: PerfResult[] = [];

const pre = document.querySelector("pre")!;
function logLine(line: string): void {
  pre.innerText += line + "\n";
}

function logPerfResult(result: PerfResult): void {
  data.push(result);
  logLine(formatPerfResult(result));
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

  // prettier-ignore
  const schemeSpectral = [
    ["fc8d59","ffffbf","99d594"],
    ["d7191c","fdae61","abdda4","2b83ba"],
    ["d7191c","fdae61","ffffbf","abdda4","2b83ba"],
    ["d53e4f","fc8d59","fee08b","e6f598","99d594","3288bd"],
    ["d53e4f","fc8d59","fee08b","ffffbf","e6f598","99d594","3288bd"],
    ["d53e4f","f46d43","fdae61","fee08b","e6f598","abdda4","66c2a5","3288bd"],
    ["d53e4f","f46d43","fdae61","fee08b","ffffbf","e6f598","abdda4","66c2a5","3288bd"],
    ["9e0142","d53e4f","f46d43","fdae61","fee08b","e6f598","abdda4","66c2a5","3288bd","5e4fa2"],
    ["9e0142","d53e4f","f46d43","fdae61","fee08b","ffffbf","e6f598","abdda4","66c2a5","3288bd","5e4fa2"]
  ]
  const colors = schemeSpectral[Math.max(frameworks.length, 3) - 3];
  console.log(colors);

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
    td.innerText = "0".repeat(120);
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
  logLine(formatPerfResultStrings(perfResultHeaders()));
  await runTests(frameworkInfo, logPerfResult);
}

(window as any).main = main;
(window as any).graph = graph;
