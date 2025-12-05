import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function plotBinomial(sampleSize, n, p) {
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
  
  const data = Object.entries(counts).map(([k, v]) => ({
    successes: +k,
    frequency: v,
    proportion: v / sampleSize
  }));
  
  const mean = n * p;
  const stdDev = Math.sqrt(n * p * (1 - p));
  
  const binWidth = 1; 
  const normalData = Array.from({length: 500}, (_, i) => {
    const x = (i / 499) * n;
    const z = (x - mean) / stdDev;
    const density = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    const y = density * sampleSize * binWidth;
    return {x, y};
  });
  
  const width = 1400;
  const height = 600;
  const margin = {top: 120, right: 40, bottom: 80, left: 80}; 
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const container = d3.create("div")
    .style("width", `${width}px`)
    .style("background", "#0a0a0a")
    .style("border", "2px solid #58c4dd")
    .style("border-radius", "8px")
    .style("box-shadow", "0 0 20px rgba(88, 196, 221, 0.3)")
    .style("padding", "20px")
    .style("box-sizing", "border-box");
  
  const controls = container.append("div")
    .style("display", "flex")
    .style("justify-content", "space-around")
    .style("align-items", "center")
    .style("margin-bottom", "20px")
    .style("padding", "15px")
    .style("background", "rgba(88, 196, 221, 0.1)")
    .style("border-radius", "6px");
  
  const sampleControl = controls.append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center");
  
  sampleControl.append("label")
    .style("color", "#83c167")
    .style("font-family", "JetBrains Mono, monospace")
    .style("font-size", "14px")
    .style("margin-bottom", "5px")
    .text("Sample Size");
  
  const sampleSelect = sampleControl.append("select")
    .style("background", "#1a1a1a")
    .style("color", "#58c4dd")
    .style("border", "1px solid #58c4dd")
    .style("padding", "5px 10px")
    .style("border-radius", "4px")
    .style("font-family", "JetBrains Mono, monospace")
    .style("font-size", "14px");
  
  [100, 1000, 10000].forEach(val => {
    sampleSelect.append("option")
      .attr("value", val)
      .property("selected", val === sampleSize)
      .text(val);
  });
  
  const nControl = controls.append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center");
  
  nControl.append("label")
    .style("color", "#83c167")
    .style("font-family", "JetBrains Mono, monospace")
    .style("font-size", "14px")
    .style("margin-bottom", "5px")
    .text(`Number of Trials (n): ${n}`);
  
  nControl.append("input")
    .attr("type", "range")
    .attr("min", 1)
    .attr("max", 200)
    .attr("value", n)
    .style("width", "200px");
  
  const pControl = controls.append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center");
  
  pControl.append("label")
    .style("color", "#83c167")
    .style("font-family", "JetBrains Mono, monospace")
    .style("font-size", "14px")
    .style("margin-bottom", "5px")
    .text(`Probability of Success (p): ${p.toFixed(2)}`);
  
  pControl.append("input")
    .attr("type", "range")
    .attr("min", 0.001)
    .attr("max", 0.999)
    .attr("step", 0.01)
    .attr("value", p)
    .style("width", "200px");
  
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height - 100)
    .style("display", "block");
  
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top - 80})`);
  
  const xScale = d3.scaleLinear()
    .domain([0, n])
    .range([0, innerWidth]);
  
  const maxFreq = d3.max(data, d => d.frequency);
  const yScale = d3.scaleLinear()
    .domain([0, maxFreq * 1.1])
    .range([innerHeight, 0]);
  
  const xAxis = g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(Math.min(n, 20)))
    .style("font-family", "JetBrains Mono, monospace")
    .style("font-size", "14px");
  
  xAxis.selectAll("text")
    .style("fill", "#58c4dd");
  
  xAxis.selectAll("line")
    .style("stroke", "#58c4dd");
  
  xAxis.select(".domain")
    .style("stroke", "#58c4dd");
  
  const yAxis = g.append("g")
    .call(d3.axisLeft(yScale))
    .style("font-family", "JetBrains Mono, monospace")
    .style("font-size", "14px");
  
  yAxis.selectAll("text")
    .style("fill", "#58c4dd");
  
  yAxis.selectAll("line")
    .style("stroke", "#58c4dd");
  
  yAxis.select(".domain")
    .style("stroke", "#58c4dd");
  
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 50)
    .style("text-anchor", "middle")
    .style("fill", "#83c167")
    .style("font-family", "JetBrains Mono, monospace")
    .style("font-size", "18px")
    .text("Number of Successes");
  
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -55)
    .style("text-anchor", "middle")
    .style("fill", "#83c167")
    .style("font-family", "JetBrains Mono, monospace")
    .style("font-size", "18px")
    .text("Frequency");
  
  const barWidth = Math.max(2, innerWidth / (n + 1) * 0.8);
  
  g.selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.successes) - barWidth / 2)
    .attr("y", d => yScale(d.frequency))
    .attr("width", barWidth)
    .attr("height", d => innerHeight - yScale(d.frequency))
    .attr("fill", "#58c4dd")
    .attr("opacity", 0.7)
    .attr("stroke", "#58c4dd")
    .attr("stroke-width", 1);
  
  if (n >= 10 && stdDev > 0) {
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", "#ffff00")
      .attr("stroke-width", 3)
      .attr("d", line)
      .style("filter", "drop-shadow(0 0 8px rgba(255, 255, 0, 0.6))");
  }
  
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", -15)
    .style("text-anchor", "middle")
    .style("fill", "#c9a0dc")
    .style("font-family", "JetBrains Mono, monospace")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text(`Binomial Distribution: n=${n}, p=${p.toFixed(2)} | μ=${mean.toFixed(2)}, σ=${stdDev.toFixed(2)}`);
  
  return container.node();
}
