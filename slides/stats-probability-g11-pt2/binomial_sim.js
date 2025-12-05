import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Inputs } from "https://cdn.jsdelivr.net/npm/@observablehq/inputs@0.10/+esm";

export function plotBinomial(sampleSize, n, p) {
  const samples = Array.from({ length: sampleSize }, () => {
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
  stdDev = Math.sqrt(n * p * (1 - p));

  const width = 960;
  const height = 580;
  const margin = { top: 140, right: 50, bottom: 70, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("background", "#0a0a0a")
    .style("border-radius", "12px")
    .style("box-shadow", "0 0 25px rgba(88, 196, 221, 0.4)")
    .style("font-family", "'JetBrains Mono', monospace");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear()
    .domain([Math.max(0, mean - 4 * stdDev), Math.min(n, mean + 4 * stdDev)])
    .range([0, innerWidth]);

  const maxFreq = d3.max(data, d => d.frequency);
  const yScale = d3.scaleLinear()
    .domain([0, maxFreq * 1.15])
    .range([innerHeight, 0]);

  const barWidth = innerWidth / (n + 3) * 0.9;
  g.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("x", d => xScale(d.successes) - barWidth / 2)
      .attr("y", d => yScale(d.frequency))
      .attr("width", barWidth)
      .attr("height", d => innerHeight - yScale(d.frequency))
      .attr("fill", "#58c4dd")
      .attr("opacity", 0.8)
      .attr("stroke", "#58c4dd");

  if (n >= 8 && stdDev > 0.5) {
    const normalData = d3.range(mean - 4 * stdDev, mean + 4 * stdDev, 0.15)
      .filter(x => x >= 0 && x <= n ? {x, y: sampleSize * (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean)/stdDev)**2)} : null)
      .filter(d => d !== null);

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
  
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(12))
    .selectAll("text")
      .style("fill", "#58c4dd")
      .style("font-size", "13px");

  g.append("g")
    .call(d3.axisLeft(yScale).ticks(8))
    .selectAll("text")
      .style("fill", "#58c4dd")
      .style("font-size", "13px");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .attr("fill", "#83c167")
    .style("font-size", "18px")
    .text("Number of Successes");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("fill", "#83c167")
    .style("font-size", "18px")
    .text("Frequency");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .attr("fill", "#c9a0dc")
    .style("font-size", "22px")
    .style("font-weight", "bold")
    .text(`Binomial(n=${n}, p=${p.toFixed(2)}) → Normal(μ=${mean.toFixed(2)}, σ=${stdDev.toFixed(2)})`);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 70)
    .attr("text-anchor", "middle")
    .attr("fill", "#ffff88")
    .style("font-size", "18px")
    .text("What happens when you increase the number of trials n?");

  const controls = svg.append("foreignObject")
    .attr("width", width - 100)
    .attr("height", 100)
    .attr("x", 50)
    .attr("y", 8);

  const container = controls.append("xhtml:div")
    .style("width", "100%")
    .style("height", "100%")
    .style("background", "rgba(10, 10, 10, 0.92)")
    .style("backdrop-filter", "blur(4px)")
    .style("border", "2px solid #58c4dd")
    .style("border-radius", "12px")
    .style("padding", "12px")
    .style("box-shadow", "0 0 20px rgba(88, 196, 221, 0.5)")
    .style("color", "#c9a0dc")
    .style("font-family", "'JetBrains Mono', monospace")
    .style("font-size", "14px");

  container.append("xhtml:div")
    .style("text-align", "center")
    .style("margin-bottom", "10px")
    .style("color", "#83c167")
    .style("font-weight", "bold")
    .text("Controls");

  const grid = container.append("xhtml:div")
    .style("display", "grid")
    .style("grid-template-columns", "1fr 1fr 1fr") 
    .style("gap", "8px 12px")
    .style("align-items", "center");

  grid.append("xhtml:label").text("Sample Size").style("color", "#83c167");
  grid.append("xhtml:div").append(() => 
    Inputs.select([100, 1000, 5000, 10000], { value: sampleSize })
  );
  grid.append("xhtml:div"); 

  // Number of trials
  grid.append("xhtml:label").text("Trials (n)").style("color", "#83c167");
  grid.append("xhtml:div").append(() => 
    Inputs.range([1, 200], { value: n, step: 1, style: "width:100%" })
  );
  grid.append("xhtml:div"); 

  // Probability p
  grid.append("xhtml:label").text("p").style("color", "#83c167");
  grid.append("xhtml:div").append(() => 
    Inputs.range([0.01, 0.99], { value: p, step: 0.01, style: "width:100%" })
  );
  grid.append("xhtml:div").append(() => 
    Inputs.button("Reset", { 
      reduce: () => ({ sampleSize: 1000, n: 30, p: 0.5 }) 
    })
    .style("background", "#fc6255")
    .style("color", "white")
    .style("border", "none")
    .style("padding", "6px 12px")
    .style("border-radius", "6px")
    .style("cursor", "pointer")
  );

  return svg.node();
}
