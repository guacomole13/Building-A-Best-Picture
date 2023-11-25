
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
        vis.margin = {top: 15, right: 35, bottom: 15, left: 50};

        // Set width based on the dimensions of the parent element
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 1000 - vis.margin.top - vis.margin.bottom;

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
            .scale(vis.x);

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
            .attr("y", vis.height + vis.margin.bottom)
            .style("text-anchor", "middle")
            .text("Difference between Rotten Tomatoes audience and critic ratings");

        // Graph title
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", -vis.margin.top)
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

        // vis.svg.selectAll(".line")
        //     .data(vis.displayData)
        //     .join("line")
        //     .attr("x1", function(d) { return vis.x(d.value1); })
        //     .attr("x2", function(d) { return vis.x(d.value2); })
        //     .attr("y1", function(d) { return vis.y(d.group); })
        //     .attr("y2", function(d) { return vis.y(d.group); })
        //     .attr("stroke", "black")
        //     .attr("stroke-width", "1px")

        // TODO: UPDATE THE X1 AND X2 ATTRIBUTES TO REMOVE THE SUBTRACTION?
        vis.svg.selectAll(".line")
            .data(vis.displayData)
            .enter()
            .append("line")
            .attr("class", "line")
            .attr("x1", d => vis.x(d.CriticRating - d.AudienceRating))
            .attr("x2", d => vis.x(d.CriticRating - d.AudienceRating))
            .attr("y1", d => vis.y(d.Film))
            .attr("y2", d => vis.y(d.Film))
            .attr("stroke", "black")
            .attr("stroke-width", "1px");


        // Circles for Critic Ratings
        vis.svg.selectAll(".criticCircle")
            .data(vis.displayData)
            .enter()
            .append("circle")
            .attr("class", "criticCircle")
            .attr("cx", d => vis.x(d.CriticRating))
            .attr("cy", d => vis.y(d.Film))
            .attr("r", "6")
            .style("fill", "green"); // TODO: make this reflect whether it was a rotten or fresh rating using tomatoes

        // Circles for Audience Ratings
        vis.svg.selectAll(".audienceCircle")
            .data(vis.displayData)
            .enter()
            .append("circle")
            .attr("class", "audienceCircle")
            .attr("cx", d => vis.x(d.AudienceRating))
            .attr("cy", d => vis.y(d.Film))
            .attr("r", "6")
            .style("fill", "blue"); // TODO: make this reflect whether it was a good or bad rating using spilled/upright popcorn

        // TODO: add conditions to handle when to use what icons representing good/bad critic and audience reviews

        // Call axis function
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);



        // // TODO: adjust axis labels
        // vis.svg.select(".x-axis").call(vis.xAxis)
        //     .selectAll("text")
        //     .text(function(d, i){
        //         return (i+1) + ") " + vis.metaData["choices"][100 + i]
        //     })
        //     .style("text-anchor", "end")
        //     .attr("dx", "-.8em")
        //     .attr("dy", ".15em")
        //     .attr("transform", function (d) {
        //         return "rotate(-45)"
        //     });

    }
}