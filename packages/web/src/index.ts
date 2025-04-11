import {
  frameworkInfo,
  formatPerfResult,
  formatPerfResultStrings,
  PerfResult,
  perfResultHeaders,
  runTests,
} from "js-reactivity-benchmark/src/index";
import * as d3 from "d3";

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

  document.querySelector("svg")?.remove();

  const width = 928;
  const marginRight = 10;
  const marginBottom = 20;
  const marginLeft = 120;

  const tests = new Set(data.map((d) => d.test));
  const frameworks = new Set(data.map((d) => d.framework));

  const rawMargin = 10;
  const marginTop = rawMargin + frameworks.size * 20;
  const testGroupHeight = frameworks.size * 20 + 10;
  const height = marginTop + tests.size * testGroupHeight + marginBottom;

  const fy = d3
    .scaleBand()
    .domain(tests)
    .rangeRound([marginTop, height - marginBottom])
    .paddingInner(0.1);

  const y = d3
    .scaleBand()
    .domain(frameworks)
    .rangeRound([0, fy.bandwidth()])
    .padding(0.05);

  const color = d3
    .scaleOrdinal<string>()
    .domain(frameworks)
    .range(d3.schemeSpectral[Math.max(frameworks.size, 3)])
    .unknown("#ccc");

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.time)!])
    .nice()
    .rangeRound([marginLeft, width - marginRight]);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;");

  svg
    .selectAll()
    .data(d3.group(data, (d) => d.test))
    .join("g")
    .attr("transform", ([test]) => `translate(0,${fy(test)})`)
    .selectAll()
    .data(([, d]) => d)
    .join("rect")
    .attr("x", x(0)!)
    .attr("y", (d) => y(d.framework)!)
    .attr("width", (d) => x(d.time)! - x(0)!)
    .attr("height", y.bandwidth())
    .attr("fill", (d) => color(d.framework));

  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(width / 80, "s"))
    .call((g) => g.select(".domain").remove());

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(fy).tickSizeOuter(0))
    .call((g) => g.selectAll(".domain").remove());

     const legend = svg
     .append("g")
     .attr("transform", `translate(${marginLeft}, ${rawMargin})`);
 
   legend
     .selectAll()
     .data(frameworks)
     .join("g")
     .attr("transform", (d, i) => `translate(0, ${i * 20})`)
     .attr("font-size", 10)
     .attr("font-family", "sans-serif")
     .call((g) =>
       g
         .append("rect")
         .attr("width", 18)
         .attr("height", 18)
         .attr("fill", color)
     )
     .call((g) =>
       g
         .append("text")
         .attr("x", 24)
         .attr("y", 9)
         .attr("dy", "0.35em")
         .text((d) => d)
     );

  pre.after(svg.node()!);
}

async function main() {
  logLine(formatPerfResultStrings(perfResultHeaders()));
  await runTests(frameworkInfo, logPerfResult);
}

(window as any).main = main;
(window as any).graph = graph;
