// binomial_sim_improved.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function plotBinomialImproved(sampleSize, n, p) {
  const samples = Array.from({length: sampleSize}, () => {
    let successes = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < p) successes++;
    }
    return successes;
  });

  const counts = {};
  for (let i = 0; i <= n; i++) counts[i] = 0;
  samples.forEach(s => counts[s]++);

  const data = Object.keys(counts).map(k => ({
    successes: +k,
    frequency: counts[k]
  }));

  const mean = n * p;
  const stdDev = Math.sqrt(n * p * (1 - p));

  // === D3 Setup ===
  const width = 960;
  const height = 540;
  const margin = {top: 20, right: 40, bottom: 60, left: 60};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("background", "#0a0a0a")
      .style("border-radius", "12px")
      .style("box-shadow", "0 0 25px rgba(88, 196, 221, 0.4)");

  const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3.scaleLinear()
      .domain([Math.max(0, mean - 4*stdDev), Math.min(n, mean + 4*stdDev)])
      .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency) * 1.15])
      .range([innerHeight, 0]);

  // Histogram bars
  const barWidth = innerWidth / (n + 2) * 0.9;
  g.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("x", d => xScale(d.successes) - barWidth/2)
      .attr("y", d => yScale(d.frequency))
      .attr("width", barWidth)
      .attr("height", d => innerHeight - yScale(d.frequency))
      .attr("fill", "#58c4dd")
      .attr("opacity", 0.75)
      .attr("stroke", "#58c4dd");

  // Normal density curve (now perfectly aligned!)
  if (n >= 5 && stdDev > 0.3) {
    const normalData = d3.range(
      Math.max(0, mean - 4*stdDev),
      Math.min(n, mean + 4*stdDev) + 0.2,
      0.2
    ).map(x => {
      const z = (x - mean) / stdDev;
      const pdf = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      return {x, y: pdf * sampleSize}; // <-- this is the key: multiply by sampleSize!
    });

    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", "#ffff00")
      .attr("stroke-width", 4)
      .attr("d", line)
      .style("filter", "drop-shadow(0 0 10px #ffff00)");
  }

  // Axes
  g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .selectAll("text").style("fill", "#58c4dd");

  g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
      .selectAll("text").style("fill", "#58c4dd");

  // Labels
  g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45)
      .attr("text-anchor", "middle")
      .attr("fill", "#83c167")
      .style("font-size", "16px")
      .text("Number of Successes");

  g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .attr("fill", "#83c167")
      .style("font-size", "16px")
      .text("Frequency");

  // Title
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#c9a0dc")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(`Binomial(n=${n}, p=${p.toFixed(2)}) → Normal(μ=${mean.toFixed(1)}, σ=${stdDev.toFixed(2)})`);

  return svg.node();
}
