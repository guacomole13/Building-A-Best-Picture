
class ConsensusPlot {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;

        this.filteredData = this.data;

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
        vis.height = 200 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // Scales and axes
        vis.x = d3.scaleLinear()
            .domain([-1, 10]) // TODO: CHANGE THE DOMAIN TO REFLECT THE BOUNDS OF OUR VARIABLE
            .range([ 0, vis.width]);

        // TODO: MAKE THE Y-AXIS REFLECT THE NAMES OF THE MOVIES
        vis.y = d3.scaleBand()
            .range([ 0, vis.height ])
            .domain(data.map(function(d) { return d.group; }))
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

        // Axis title
        vis.svg.append("text") // TODO: CHECK IF NEED TO KEEP / EDIT AXIS TITLE
            .attr("x", -50)
            .attr("y", -8)
            .text("Movies");

        // TODO: add x-axis label: "difference between Rotten Tomatoes audience and critic ratings"


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
        svg.selectAll(".line")
            .data(vis.data)
            .join("line")
            .attr("x1", function(d) { return x(d.value1); }) // TODO: EDIT DATASET SO THAT VALUE1, VALUE2, AND GROUP HAVE MEANING
            .attr("x2", function(d) { return x(d.value2); })
            .attr("y1", function(d) { return y(d.group); })
            .attr("y2", function(d) { return y(d.group); })
            .attr("stroke", "black")
            .attr("stroke-width", "1px")

        // Circles for Critic Ratings
        svg.selectAll(".criticCircle")
            .data(data)
            .enter().append("circle")
            .attr("class", "criticCircle")
            .attr("cx", function(d) { return x(parseFloat(d.TomatometerRating)); }) // TODO: Replace TomatometerRating with appropriate field
            .attr("cy", function(d) { return y(d.Film); }) // TODO: Replace with movie title field
            .attr("r", "6")
            .style("fill", "green"); // TODO: make this reflect whether it was a rotten or fresh rating using tomatoes

        // Circles for Audience Ratings
        svg.selectAll(".audienceCircle")
            .data(data)
            .enter().append("circle")
            .attr("class", "audienceCircle")
            .attr("cx", function(d) { return x(parseFloat(d.AudienceRating)); }) // TODO: Replace AudienceRating with appropriate field
            .attr("cy", function(d) { return y(d.Film); }) // TODO: Replace with  movie title field
            .attr("r", "6")
            .style("fill", "blue"); // TODO: make this reflect whether it was a good or bad rating using spilled/upright popcorn

        // TODO: add "if" conditions to handle when to use what icons representing good/bad critic and audience reviews

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