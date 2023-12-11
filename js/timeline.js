class Timeline {

    // constructor method to initialize Timeline object
    constructor(parentElement, displayData) {
        this.parentElement = parentElement;
        this.displayData = displayData;
        this.parseYear = d3.timeParse('%Y');

        // call method initVis
        this.initVis();
    }

    // init brushVis
    initVis(){
        let vis = this;

        vis.margin = {top: 60, right: 50, bottom: 35, left: 50};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 165 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom + 30)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // clip path
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .append('text')
            .text("Timeline of Best Picture Winners' Critic Ratings on Rotten Tomatoes")
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle');

        // init scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.yAxis = vis.svg.append("g")
            .attr("class", "y-axis axis");

        // init pathGroup
        vis.pathGroup = vis.svg.append('g').attr('class', 'pathGroup');

        // init path
        vis.path = vis.pathGroup
            .append('path')
            .attr("class", "path");

        // init path generator to display critic rating
        vis.area = d3.area()
            .x(function (d) {
                return vis.x(d.OscarYear);
            })
            .y0(vis.y(0))
            .y1(function (d) {
                return vis.y(d.CriticRating);
            });

        // Display the years of the entire dataset before brushing
        vis.dateRange = d3.select("#selectedYears").text("Selected Years: 2010 to 2020");


        // init brushGroup:
        vis.brushGroup = vis.svg.append("g")
            .attr("class", "brush");

        // init brush
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])

            // Limits the brushed selection to a maximum of 25 years
            .on("brush end", function (event) {
                const selectionRange = event.selection.map(vis.x.invert);
                const [startDate, endDate] = selectionRange;

                const maxAllowedYears = 25;

                // Calculate the difference in years between the start and end dates
                const diffYears = endDate.getFullYear() - startDate.getFullYear();

                // Limit the brushed selection to a maximum of 25 years
                if (diffYears > maxAllowedYears) {
                    const newStartDate = new Date(endDate.getFullYear() - maxAllowedYears, endDate.getMonth(), endDate.getDate());
                    vis.brushGroup.call(vis.brush.move, [vis.x(newStartDate), vis.x(endDate)]);
                }

                selectedTimeRange = [startDate, endDate];

                // After the user changes the selection (brush) the selected years should be updated immediately
                vis.dateRange = d3.select("#selectedYears").text("Selected Years: " + dateFormatter(startDate) + " to " + dateFormatter(endDate));

                // Update the consensus plot based on the selectedTimeRange
                myConsensus.wrangleData();
            });

        // Wrangle data
        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        // Update the visualization
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // update domains
        vis.x.domain(d3.extent(vis.displayData, function (d) {
            return d.OscarYear
        }));
        vis.y.domain(d3.extent(vis.displayData, function (d) {
            return d.CriticRating
        }));

        // draw x & y axis
        vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x));
        vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(5).tickFormat(d => d + "%"));

        // Create the linear gradient definition
        vis.svg.append("defs").append("linearGradient")
            .attr("id", "area-gradient") // Assign an ID for the gradient
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0) // Define start point of the gradient (top-left corner)
            .attr("x2", vis.width).attr("y2", 0) // Define end point of the gradient (top-right corner)
            .selectAll("stop")
            .data([
                {offset: "0%", color: "#8D1B18"}, // Start color (red)
                {offset: "50%", color: "#F7632C"}, // End color (red)
                {offset: "100%", color: "#F7C62C"}])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        // Apply the gradient to the area chart
        vis.path.datum(vis.displayData)
            .transition().duration(400)
            .attr("d", vis.area)
            .attr("fill", "url(#area-gradient)") // Apply the gradient fill
            .attr("stroke", "#136D70")
            .attr("clip-path", "url(#clip)");

        // Append a text element for the note
        vis.svg.append("g")
            .append("text")
            .attr("x", vis.width / 2)  // Position the text in the center of the SVG
            .attr("y", vis.height + vis.margin.bottom + 5)  // Adjust the y-coordinate to position the text below the chart
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Note: Select up to a 25-year window to filter through the Rotten Tomatoes ratings plot below. ");


        vis.brushGroup
            .call(vis.brush);
    }
}

