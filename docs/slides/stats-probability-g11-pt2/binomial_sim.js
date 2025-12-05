import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

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
  const stdDev = Math.sqrt(n * p * (1 - p));

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
      .filter(x => x >= 0 && x <= n)
      .map(x => {
        const z = (x - mean) / stdDev;
        const pdf = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
        return { x, y: pdf * sampleSize }; 
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
    .attr("height", 120)
    .attr("x", 50)
    .attr("y", 10);

  const body = controls.append("xhtml:div")
    .style("background", "rgba(26,26,26,0.95)")
    .style("padding", "18px")
    .style("border-radius", "12px")
    .style("border", "2px solid #58c4dd")
    .style("color", "#c9a0dc");

  body.append("xhtml:h3")
    .style("margin", "0 0 15px 0")
    .style("color", "#83c167")
    .style("text-align", "center")
    .text("Controls");

  const div = body.append("xhtml:div")
    .style("display", "grid")
    .style("gap", "12px")
    .style("grid-template-columns", "1fr 1fr");

  // Sample Size
  div.append("xhtml:div")
    .call(d3.attachTooltip)
    .append(() => Inputs.select([100, 1000, 5000, 10000], {
      label: "Sample Size",
      value: sampleSize
    }));

  // Number of trials n
  div.append("xhtml:div")
    .append(() => Inputs.range([1, 200], {
      label: "Number of Trials (n)",
      value: n,
      step: 1
    }));

  // Probability p
  div.append("xhtml:div")
    .append(() => Inputs.range([0.01, 0.99], {
      label: "Probability p",
      value: p,
      step: 0.01
    }));

  return svg.node();
}