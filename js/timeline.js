
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
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.height = 165 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
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
        // vis.xAxis = vis.svg.append("g")
        //     .attr("class", "axis axis--x")
        //     .attr("transform", "translate(0," + vis.height + ")");
        // vis.yAxis = vis.svg.append("g")
        //     .attr("class", "axis axis--y");

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

            // // No limit on brushed selection
            // .on("brush end", function (event) {
            //     selectedTimeRange = [vis.x.invert(event.selection[0]), vis.x.invert(event.selection[1])];
            //
            //     // brushing should trigger wrangleData() method for the consensus plot
            //     myConsensus.wrangleData();
            // });

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

        // // Loop through the displayData array and convert OscarYear to Date objects
        // vis.displayData.forEach(d => {
        //     // Convert OscarYear integer to a Date object
        //     d.OscarYear = vis.parseYear(`${d.OscarYear}`);
        // });

        // // Convert OscarYear to Date objects
        // vis.displayData.forEach(d => {
        //     // Convert the float to an integer representing the year and create a Date object for January 1 of that year
        //     d.OscarYear = new Date(Math.floor(d.OscarYear), 0, 1);
        // });

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

        // draw path (area chart)
        vis.path.datum(vis.displayData)
            .transition().duration(400)
            .attr("d", vis.area)
            .attr("fill", "#428A8D")
            .attr("stroke", "#136D70")
            .attr("clip-path", "url(#clip)");


        vis.brushGroup
            .call(vis.brush);
    }
}
