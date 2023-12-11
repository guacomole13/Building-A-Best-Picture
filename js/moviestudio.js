class StudioVis {

    constructor(_parentElement, data1, onDataFilteredCallback) {
        this.parentElement = _parentElement;
        this.data = data1;
        this.onDataFilteredCallback = onDataFilteredCallback;

        this.initVis();
    }

    notifyDataFiltered(filteredData) {
        if (this.onDataFilteredCallback) {
            this.onDataFilteredCallback(filteredData);
        }
    }

    initVis() {
        // Method to initialize the visualization
        let vis = this;

        vis.margin = {top: 40, right: 250, bottom: 95, left: 60};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width * 5 / 6;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // clip path
        vis.svg.append('g')
            .attr('class', 'title')
            .append('text')
            .text('Top Studios Consistently Win Oscars')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.yScale = d3.scaleLinear()
            .domain([d3.min(vis.data, d => d.Year), d3.max(vis.data, d => d.Year)])
            .range([vis.height, vis.margin.top]);

        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(vis.yScale).tickFormat(d3.format("d")));

        vis.svg.append("text")
            .attr("transform", "translate(" + (vis.width / 2) + " ," + (vis.height + vis.margin.bottom - 5) + ")")
            .style("text-anchor", "middle")
            .text("'Big Five' Studios");

        // Add y-axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - vis.margin.left)
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Year");

        // vis.brushGroup = vis.svg.append("g")
        //     .attr("class", "brush");

        // init brush
        vis.brush = d3.brushY()
            .extent([[0, vis.margin.top], [vis.width, vis.height]])
            .on("brush end", function (event) {
                if (!event.selection) return; // Ignore empty selections

                const selectionRange = event.selection.map(vis.yScale.invert);
                const [endYear, startYear] = selectionRange
                const minYears = 5;
                const diffYears = endYear - startYear;
                if (diffYears < minYears) {
                    const newStartYear = endYear-5;
                    vis.brushGroup.call(vis.brush.move, [vis.y(newStartYear), vis.y(endYear)]);
                }

                console.log(startYear);

                // Filter the data based on the selected range
                const filteredData = vis.data.filter(d => d.Year >= startYear && d.Year <= endYear);

                // Notify StudioBubbles with the filtered data
                vis.notifyDataFiltered(filteredData);
            });


        vis.brushGroup = vis.svg.append("g")
            .attr("class", "brush")
            .call(vis.brush);

        vis.wrangleData();

    }

    wrangleData() {
        // Method to wrangle the data
        let vis = this;

        console.log(vis.data);
        vis.studioCounts = d3.rollup(
            vis.data,
            v => d3.sum(v, d => d.winner ? 2 : 1),  // 2 for winner=true, 1 for winner=false
            d => d.distributor,
            d => d.year
        );

        // Extract the top 5 studios for each year
        vis.topStudios = new Map();
        vis.studioCounts.forEach((yearData, distributor) => {
            vis.total = d3.sum(yearData.values());
            vis.topStudios.set(distributor, vis.total);
        });

        vis.sortedStudios = Array.from(vis.topStudios.keys()).sort((a, b) => vis.topStudios.get(b) - vis.topStudios.get(a)).slice(0, 5);

        // vis.filteredData = vis.data.filter(d => vis.sortedStudios.includes(d.distributor));

        vis.sortedStudios.push("Other");

        // Modify dataset: replace all studios not in topStudios with "Other"
        vis.filteredData = vis.data.map(d => {
            if (!vis.sortedStudios.includes(d.distributor)) {
                return {...d, distributor: "Other"};
            }
            return d;
        });



        console.log(vis.filteredData);

        vis.updateVis();
    }

    updateVis() {

        let vis = this;

        vis.xScale = d3.scaleBand()
            .domain(vis.sortedStudios)
            .range([0, vis.width])
            .padding(0.1);

        vis.xAxis.call(d3.axisBottom(vis.xScale))
            .selectAll('text')  // Select all the text elements for styling
            .attr('transform', 'rotate(-45)')  // Rotate the labels by -45 degrees
            .style('text-anchor', 'end');  // Adjust text anchor to end

        vis.svg.selectAll('.gray-circle')
            .data(vis.filteredData)
            .enter()
            .append('circle')
            .attr('class', 'gray-circle')
            .attr('cx', d => vis.xScale(d.distributor) + vis.xScale.bandwidth() / 2)
            .attr('cy', d => vis.yScale(d.Year))
            .attr('r', 5)
            .attr('fill', 'gray')
            .attr('opacity', 0.5);

        // Plot red circles on top
        vis.svg.selectAll('.red-circle')
            .data(vis.filteredData.filter(d => d.winner))
            .enter()
            .append('circle')
            .attr('class', 'red-circle')
            .attr('cx', d => vis.xScale(d.distributor) + vis.xScale.bandwidth() / 2)
            .attr('cy', d => vis.yScale(d.Year))
            .attr('r', 5)
            .attr('fill', 'red');

        let legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (vis.width+20) + "," + 40 + ")"); // Adjust the translation as needed

        legend.append("text")
            .attr("x", 0)
            .attr("y", -15)
            .style("font-weight", "bold")
            .text("Legend:");

        // Add legend items
        legend.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "red"); // Adjust color as needed

        legend.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .text("Best Picture Winners"); // Adjust text and position as needed

        legend.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("y", 20)
            .attr("fill", "Gray"); // Adjust color as needed

        legend.append("text")
            .attr("x", 15)
            .attr("y", 30)
            .text("Best Picture Nominees"); // Adjust text and position as needed

    }
}
