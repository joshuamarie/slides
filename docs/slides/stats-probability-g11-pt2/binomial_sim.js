import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import {Inputs, html} from "https://cdn.jsdelivr.net/npm/@observablehq/inputs@0.10/+esm";

export function plotBinomial(sampleSize, n, p) {
  const samples = Array.from({length: sampleSize}, () => {
    let s = 0;
    for (let i = 0; i < n; i++) if (Math.random() < p) s++;
    return s;
  });

  const counts = d3.rollup(samples, v => v.length, d => d);
  const data = Array.from(counts, ([successes, frequency]) => ({successes, frequency}));

  const mean = n * p;
  const stdDev = Math.sqrt(n * p * (1 - p));

  const width = 1000;
  const height = 600;
  const margin = {top: 130, right: 60, bottom: 70, left: 70};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("background", "#0a0a0a")
    .style("border-radius", "16px")
    .style("box-shadow", "0 0 30px rgba(88, 196, 221, 0.5)")
    .style("font-family", "'JetBrains Mono', monospace");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear()
    .domain([Math.max(0, mean - 4*stdDev), Math.min(n, mean + 4*stdDev)])
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.frequency) * 1.2])
    .range([innerHeight, 0]);

  const barWidth = innerWidth / (n + 2) * 0.9;
  g.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("x", d => xScale(d.successes) - barWidth/2)
      .attr("y", d => yScale(d.frequency))
      .attr("width", barWidth)
      .attr("height", d => innerHeight - yScale(d.frequency))
      .attr("fill", "#58c4dd")
      .attr("opacity", 0.85)
      .attr("stroke", "#58c4dd")
      .attr("stroke-width", 1.5);

  if (n >= 10 && stdDev > 0.5) {
    const curveData = d3.range(mean - 4*stdDev, mean + 4*stdDev, 0.2)
      .map(x => {
        const z = (x - mean) / stdDev;
        const pdf = Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI));
        return {x, y: pdf * sampleSize};
      });

    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", "#ffff00")
      .attr("stroke-width", 4.5)
      .attr("d", line)
      .style("filter", "drop-shadow(0 0 12px #ffff00)");
  }

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(10))
    .selectAll("text")
      .style("fill", "#58c4dd")
      .style("font-size", "14px");

  g.append("g")
    .call(d3.axisLeft(yScale).ticks(6))
    .selectAll("text")
      .style("fill", "#58c4dd")
      .style("font-size", "14px");

  svg.append("text")
    .attr("x", width/2)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .attr("fill", "#83c167")
    .style("font-size", "18px")
    .text("Number of Successes");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height/2)
    .attr("y", 28)
    .attr("text-anchor", "middle")
    .attr("fill", "#83c167")
    .style("font-size", "18px")
    .text("Frequency");

  svg.append("text")
    .attr("x", width/2)
    .attr("y", 44)
    .attr("text-anchor", "middle")
    .attr("fill", "#c9a0dc")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text(`Binomial(n=${n}, p=${p.toFixed(2)}) → Normal(μ=${mean.toFixed(2)}, σ=${stdDev.toFixed(2)})`);

  svg.append("text")
    .attr("x", width/2)
    .attr("y", 74)
    .attr("text-anchor", "middle")
    .attr("fill", "#ffff88")
    .style("font-size", "18px")
    .text("What happens when you increase n?");

  const controlPanel = svg.append("foreignObject")
    .attr("width", width - 120)
    .attr("height", 100)
    .attr("x", 60)
    .attr("y", 10);

  const panel = controlPanel.append("xhtml:div")
    .style("background", "rgba(10, 10, 10, 0.96)")
    .style("border", "2px solid #58c4dd")
    .style("border-radius", "14px")
    .style("padding", "16px")
    .style("box-shadow", "0 0 20px rgba(88, 196, 221, 0.4)")
    .style("backdrop-filter", "blur(4px)")
    .style("color", "#c9a0dc");

  const grid = panel.append("xhtml:div")
    .style("display", "grid")
    .style("grid-template-columns", "auto 1fr")
    .style("gap", "10px 16px")
    .style("align-items", "center")
    .style("font-size", "14px");

  // Sample Size
  grid.append("xhtml:div").text("Sample Size").style("color", "#83c167");
  grid.append("xhtml:div").append(() => 
    Inputs.select([100, 1000, 5000, 10000], {value: sampleSize})
  );

  // n
  grid.append("xhtml:div").text("Trials (n)").style("color", "#83c167");
  grid.append("xhtml:div").append(() => 
    Inputs.range([1, 200], {value: n, step: 1})
  );

  // p
  grid.append("xhtml:div").text("Success prob. (p)").style("color", "#83c167");
  grid.append("xhtml:div").append(() => 
    Inputs.range([0.01, 0.99], {value: p, step: 0.01})
  );

  return svg.node();
}
