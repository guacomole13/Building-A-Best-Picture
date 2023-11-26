
class ConsensusPlot {

    constructor(parentElement, displayData) {
        this.parentElement = parentElement;
        this.displayData = displayData;

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        // Define svg
        vis.margin = {top: 40, right: 40, bottom: 100, left: 250}; // Adjust margins to allow axes / labels to fit

        // Set width based on the dimensions of the parent element
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 1700 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleLinear()
            .domain([0, 100])
            .range([ 0, vis.width]);

        // Y-axis should be the names of the films
        vis.y = d3.scaleBand()
            .range([ 0, vis.height ])
            .domain(vis.displayData.map(d => d.Film))
            .padding(1);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .tickFormat(d => d + "%");   // Append "%" symbol to the tick values

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // X-axis label
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 0.5 * vis.margin.bottom )
            .style("text-anchor", "middle")
            .text("Difference between Rotten Tomatoes audience and critic ratings");

        // Graph title
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.margin.top - 60) // Adjust height of title
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Is there consensus between Best Picture winners’ critic and audience ratings on Rotten Tomatoes?");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;



        // Update the visualization
        vis.updateVis();
    }


    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        // Lines connecting the 2 dots for each movie
        vis.svg.selectAll(".line")
            .data(vis.displayData)
            .enter()
            .append("line")
            .attr("class", "line")
            .attr("x1", d => vis.x(d.CriticRating))
            .attr("x2", d => vis.x(d.AudienceRating))
            .attr("y1", d => vis.y(d.Film))
            .attr("y2", d => vis.y(d.Film))
            .attr("stroke", "black")
            .attr("stroke-width", "1px");

        // Icons for critic reviews
        vis.svg.selectAll(".criticIcon")
            .data(vis.displayData)
            .enter()
            .append("svg:image")
            .attr("class", "criticIcon")
            .attr("xlink:href", function(d) {
                // Check if the CriticRating is fresh or rotten and use the appropriate icon/image path
                return d.CriticRating >= 60 ? "img/fresh_critic.png" : "img/rotten_critic.png";
            })
            .attr("x", d => vis.x(d.CriticRating) - 2) // Adjust horizontal position of icon
            .attr("y", d => vis.y(d.Film) - 6) // Adjust vertical position of icon
            .attr("width", 13) // Width of the icon
            .attr("height", 13); // Height of the icon

        // Icons for audience reviews
        vis.svg.selectAll(".audienceIcon")
            .data(vis.displayData)
            .enter()
            .append("svg:image")
            .attr("class", "audienceIcon")
            .attr("xlink:href", function(d) {
                // Check if the AudienceRating is fresh or rotten and use the appropriate icon/image path
                return d.AudienceRating >= 60 ? "img/fresh_audience.png" : "img/rotten_audience.png";
            })
            .attr("x", d => vis.x(d.AudienceRating) - 2) // Adjust horizontal position of icon
            .attr("y", d => vis.y(d.Film) - 6) // Adjust vertical position of icon
            .attr("width", 13) // Width of the icon
            .attr("height", 13); // Height of the icon

        // Call axis function
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

    }
}