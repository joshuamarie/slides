export function plotEmpiricalRule(mu, sigma, rule) {
    const width = 900;
    const height = 500;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    
    // Calculate dynamic range based on current mu and sigma
    const xMin = mu - 4 * sigma;
    const xMax = mu + 4 * sigma;
    
    // Generate normal distribution data
    const data = [];
    for (let x = xMin; x <= xMax; x += (xMax - xMin) / 1000) {
        const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
                  Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
        data.push({x, y});
    }
    
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
    
    // Scales update with current mu and sigma
    const xScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([margin.left, width - margin.right]);
    
    const yMax = (1 / (sigma * Math.sqrt(2 * Math.PI)));
    const yScale = d3.scaleLinear()
        .domain([0, yMax * 1.1])
        .range([height - margin.bottom, margin.top]);
    
    // Helper function to create area
    const createArea = (sigma_mult, color) => {
        const areaData = data.filter(d => 
            d.x >= mu - sigma_mult * sigma && 
            d.x <= mu + sigma_mult * sigma
        );
        
        const area = d3.area()
            .x(d => xScale(d.x))
            .y0(height - margin.bottom)
            .y1(d => yScale(d.y));
        
        svg.append("path")
            .datum(areaData)
            .attr("fill", color)
            .attr("opacity", 0.3)
            .attr("d", area);
    };
    
    // Draw shaded areas based on selected rule
    if (rule === 3 || rule === 4) {
        createArea(3, "#C73E1D");
    }
    if (rule === 2 || rule === 4) {
        createArea(2, "#F18F01");
    }
    if (rule === 1 || rule === 4) {
        createArea(1, "#A23B72");
    }
    
    // Draw main curve
    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));
    
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#2E86AB")
        .attr("stroke-width", 2.5)
        .attr("d", line);
    
    // Draw vertical lines
    const drawVLine = (x, color, dasharray = "5,5") => {
        svg.append("line")
            .attr("x1", xScale(x))
            .attr("x2", xScale(x))
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom)
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", dasharray);
    };
    
    // Mean line
    drawVLine(mu, "red", "5,5");
    
    // Standard deviation lines
    if (rule === 1 || rule === 4) {
        drawVLine(mu - sigma, "#A23B72", "3,3");
        drawVLine(mu + sigma, "#A23B72", "3,3");
    }
    if (rule === 2 || rule === 4) {
        drawVLine(mu - 2 * sigma, "#F18F01", "3,3");
        drawVLine(mu + 2 * sigma, "#F18F01", "3,3");
    }
    if (rule === 3 || rule === 4) {
        drawVLine(mu - 3 * sigma, "#C73E1D", "3,3");
        drawVLine(mu + 3 * sigma, "#C73E1D", "3,3");
    }
    
    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(10))
        .style("font-size", "14px");
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(6))
        .style("font-size", "14px");
    
    // Labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Value");
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Density");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Normal Distribution with Empirical Rule");
    
    return svg.node();
}
