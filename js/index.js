/* jshint esversion: 6 */

///////////////////////////////////////////////////////////////////////////////
//// Initial Set Up ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Global variables
const margin = {top: 40, right: 20, bottom: 20, left: 80},
			width = 960 - margin.left - margin.right,
			height = 480 - margin.top - margin.bottom;

let baseTemperature;

const monthMap = {
	1: "January",
	2: "February",
	3: "March",
	4: "April",
	5: "May",
	6: "June",
	7: "July",
	8: "August",
	9: "Semptember",
	10: "October",
	11: "November",
	12: "December"
};

///////////////////////////////////////////////////////////////////////////////
// Scales

const x = d3.scaleBand()
		.range([0, width]);

const y = d3.scaleBand()
		.range([0, height]);

const color = d3.scaleSequential(d3.interpolateRdBu);

///////////////////////////////////////////////////////////////////////////////
// SVG containers

const svg = d3.select("#svg")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);

const tooltip = d3.select("#tooltip")
		.style("position", "absolute")
		.style("pointer-events", "none");

// Legend center lines up with the center of the heat map
const legendG = svg
		.append("g")
		.attr("transform", `translate(${(width - 40 * 12) / 2 + margin.left}, ${0})`);

///////////////////////////////////////////////////////////////////////////////
//// Load Data ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
d3.json("data/global-temperature.json", (error, data) => {
	if (error) throw error;

	baseTemperature = data.baseTemperature;
	const monthlyVariance = data.monthlyVariance;

	/////////////////////////////////////////////////////////////////////////////
	//// Bubble Chart ///////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////

	x.domain(d3.range(
		d3.min(monthlyVariance, d => d.year),
		d3.max(monthlyVariance, d => d.year) + 1));

	y.domain(d3.range(
		d3.min(monthlyVariance, d => d.month),
		d3.max(monthlyVariance, d => d.month) + 1));

	color.domain(d3.extent(monthlyVariance, d => d.variance).reverse());

	/////////////////////////////////////////////////////////////////////////////
	// Axes
	g.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0, ${height})`)
			.call(customXAxis);

	g.append("g")
			.attr("class", "y axis")
			.call(customYAxis);

	/////////////////////////////////////////////////////////////////////////////
	// Grid
	g.selectAll("rect")
		.data(monthlyVariance)
		.enter()
		.append("rect")
			.attr("x", d => x(d.year))
			.attr("y", d => y(d.month))
			.attr("width", d => x.bandwidth())
			.attr("height", d => y.bandwidth())
			.attr("fill", d => color(d.variance))
			.on("mouseover", showTooltip)
			.on("mouseout", hideTooltip);

	/////////////////////////////////////////////////////////////////////////////
	//// Legend /////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////

	const legend = legendG.selectAll(".legend")
		.data(color.ticks().reverse())
		.enter()
		.append("g")
			.attr("class", "legend")
			.attr("transform", (d, i) => `translate(${40 * i}, 0)`);

	legend.append("rect")
		.attr("width", 40)
		.attr("height", 10)
		.attr("fill", color);

	legend.append("text")
		.attr("class", "legend-text")
		.attr("x", 20)
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.text((d, i) => i ? d : d + "℃");

});

///////////////////////////////////////////////////////////////////////////////
//// Tooltip //////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function showTooltip(d) {
	tooltip.transition()
			.duration(50)
			.style("opacity", 1)
			.style("left", d3.event.pageX - document.getElementById("tooltip").offsetWidth / 2+ "px")
			.style("top", d3.event.pageY - 80 + "px");
	tooltip.html(`<span id="tooltip-year">${d.year}</span>
			 - <span id="tooltip-month">${monthMap[d.month]}</span><br>
			 <span id="tooltip-variance">${d.variance}</span><br>
			 <span id="tooltip-temperature">${Math.floor((d.variance + baseTemperature) * 1000) / 1000}</span>`);
}

function hideTooltip() {
	tooltip.transition()
			.duration(50)
			.style("opacity", 0);
}

///////////////////////////////////////////////////////////////////////////////
//// Helper Functions /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function customXAxis(g) {
	g.call(d3.axisBottom(x));
	g.select(".domain").remove();
	g.selectAll(".tick")
		.style("display", d => d % 10 === 0 ? "" : "none");
}

function customYAxis(g) {
	g.call(d3.axisLeft(y));
	g.select(".domain").remove();
	g.selectAll(".tick text")
		.text(d => monthMap[d]);
}