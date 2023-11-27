class StudioVis {

    constructor(_parentElement, data1) {
        this.parentElement = _parentElement;
        this.data = data1

        this.initVis();
    }

    initVis() {
        // Method to initialize the visualization
        let vis = this;

        vis.margin = {top: 40, right: 10, bottom: 80, left: 60};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width * 5 / 6 - vis.margin.left - vis.margin.right;
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


        // vis.xScale = d3.scaleLinear()
        // .domain([10, 1])
        // .range([0, vis.height]);

        // init x & y axis
        // vis.xAxis = vis.svg.append("g")
        //     .attr("class", "axis axis--x")
        //     .attr("transform", "translate(0," + vis.height + ")");
        // vis.yAxis = vis.svg.append("g")
        //     .attr("class", "axis axis--y");

        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");
        // .call(d3.axisBottom(vis.xScale));

        // vis.yAxis = vis.svg.append("g")
        //     .attr("class", "axis axis--y");

        vis.yScale = d3.scaleLinear()
            .domain([d3.min(vis.data, d => d.Year), d3.max(vis.data, d => d.Year)])
            .range([vis.margin.top, vis.height]);

        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(vis.yScale).tickFormat(d3.format("d")));
        // .call(d3.axisLeft(vis.yScale));

        // flip axis
        // vis.svg.selectAll('.axis--y .tick text')
        //     .attr('dy', '-0.7em');

        // vis.BOline = d3.line()
        //     .x(d => vis.xScale(d.Year))
        //     .y(d => vis.yScale(d.BoxOffice_Rank));

        // vis.BUline = d3.line()
        //     .x(d => vis.xScale(d.Year))
        //     .y(d => vis.yScale(d.Budget_Rank));

        vis.svg.append("text")
            .attr("transform", "translate(" + (vis.width / 2) + " ," + (vis.height + vis.margin.bottom-5) + ")")
            .style("text-anchor", "middle")
            .text("Studio");

        // Add y-axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - vis.margin.left)
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Year");

        // Filter data to include only winners


        // // init pathGroup
        // vis.pathGroup = vis.svg.append('g').attr('class', 'pathGroup');
        //
        // // init path one (average)
        // vis.pathOne = vis.pathGroup
        //     .append('path')
        //     .attr("class", "pathOne");
        //
        // // init path two (single state)
        // vis.pathTwo = vis.pathGroup
        //     .append('path')
        //     .attr("class", "pathTwo");


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

        vis.filteredData = vis.data.filter(d => vis.sortedStudios.includes(d.distributor));

        console.log(vis.filteredData);

        // vis.winnersData = vis.data.filter(d => d.winner === true);
        //
        // // vis.winnersData = vis.data.filter(d => d.winner === true);
        //
        // // console.log(vis.data);
        // // console.log(vis.budgetdata);
        // // vis.winnersData = vis.data.filter(d => d.true);
        // console.log(vis.winnersData);
        // console.log("the winners!")
        // vis.filteredWinnersData = vis.winnersData.filter(d => !isNaN(d.BoxOffice_Rank) && !isNaN(d.Budget_Rank));
        //
        // vis.filteredWinnersData = vis.filteredWinnersData.sort((a, b) => a.year - b.year);
        //
        //
        //
        // console.log(vis.filteredWinnersData)
        // console.log("the filtered winners!")


        vis.updateVis();
    }

    // updateVis() {
    //     // Method to update the visualization
    //     let vis = this;
    //
    //     vis.xAxis.call(d3.axisBottom(vis.xScale));
    //     vis.yAxis.call(d3.axisLeft(vis.yScale))
    //
    //     // Bind data to line elements
    //     vis.svg.selectAll('.boxoffice-line')
    //         .data([vis.filteredWinnersData])
    //         .enter()
    //         .append('path')
    //         .attr('class', 'boxoffice-line')
    //         .attr('d', vis.BOline)
    //         .attr('fill', 'none')
    //         .attr('stroke', 'steelblue');
    //     // console.log("data updated");
    //
    //     vis.svg.selectAll('.budget-line')
    //         .data([vis.filteredWinnersData])
    //         .enter()
    //         .append('path')
    //         .attr('class', 'budget-line')
    //         .attr('d', vis.BUline)
    //         .attr('fill', 'none')
    //         .attr('stroke', 'gray');
    //     // console.log("data updated");
    // }
    updateVis() {
        // Method to update the visualization
        // let vis = this;
        //
        // // vis.xAxis.call(d3.axisBottom(vis.xScale));
        // // vis.yAxis.call(d3.axisLeft(vis.yScale));
        // vis.xScale = d3.scaleBand()
        //     .domain(vis.sortedStudios)
        //     .range([0, vis.width])
        //     .padding(0.1);
        //
        // // init scales
        // vis.yScale = d3.scaleLinear()
        //     .domain([d3.min(vis.data, d => d.Year), d3.max(vis.data, d => d.Year)])
        //     .range([0, vis.width]);
        //
        // vis.xAxis.call(d3.axisBottom(vis.xScale));
        // vis.yAxis.call(d3.axisLeft(vis.yScale));
        //
        // // Create line generators for each category
        // // const boxOfficeLine = d3.line()
        // //     .x(d => vis.xScale(d.Year))
        // //     .y(d => vis.yScale(d.BoxOffice_Rank));
        // //
        // // const budgetLine = d3.line()
        // //     .x(d => vis.xScale(d.Year))
        // //     .y(d => vis.yScale(d.Budget_Rank));
        //
        // // Bind data to circles for each point
        // // vis.svg.selectAll('.boxoffice-circle')
        // //     .data(vis.filteredWinnersData)
        // //     .enter()
        // //     .append('circle')
        // //     .attr('class', 'boxoffice-circle')
        // //     .attr('cx', d => vis.xScale(d.Year))
        // //     .attr('cy', d => vis.yScale(d.BoxOffice_Rank))
        // //     .attr('r', 4)
        // //     .attr('fill', 'steelblue');
        // //
        // // vis.svg.selectAll('.budget-circle')
        // //     .data(vis.filteredWinnersData)
        // //     .enter()
        // //     .append('circle')
        // //     .attr('class', 'budget-circle')
        // //     .attr('cx', d => vis.xScale(d.Year))
        // //     .attr('cy', d => vis.yScale(d.Budget_Rank))
        // //     .attr('r', 4)
        // //     .attr('fill', 'gray');
        //
        // vis.svg.selectAll('circle')
        //     .data(vis.data)
        //     .enter().append('circle')
        //     .attr('cx', d => vis.xScale(d.distributor) + vis.xScale.bandwidth() / 2)
        //     .attr('cy', d => vis.yScale(d.year))
        //     .attr('r', 5)  // Adjust the radius as needed
        //     .attr('fill', d => d.winner ? 'red' : 'gray');
        //
        // // Add a class 'black' if the studio had both winner=true and winner=false
        // vis.svg.selectAll('circle')
        //     .filter(d => vis.data.some(e => e.distributor === d.distributor && e.year === d.year && e.winner !== d.winner))
        //     .attr('class', 'black');

        // Draw lines connecting the points for each category
        // vis.svg.append('path')
        //     .datum(vis.filteredWinnersData)
        //     .attr('class', 'boxoffice-line')
        //     .attr('d', boxOfficeLine)
        //     .attr('fill', 'none')
        //     .attr('stroke', 'steelblue');
        //
        // vis.svg.append('path')
        //     .datum(vis.filteredWinnersData)
        //     .attr('class', 'budget-line')
        //     .attr('d', budgetLine)
        //     .attr('fill', 'none')
        //     .attr('stroke', 'gray');

        let vis = this;

        vis.xScale = d3.scaleBand()
            .domain(vis.sortedStudios)
            .range([0, vis.width])
            .padding(0.1);

        // vis.yScale = d3.scaleLinear()
        //     .domain([d3.min(vis.filteredData, d => d.year), d3.max(vis.filteredData, d => d.year)])
        //     .range([0, vis.height]);

        vis.xAxis.call(d3.axisBottom(vis.xScale))
            .selectAll('text')  // Select all the text elements for styling
            .attr('transform', 'rotate(-45)')  // Rotate the labels by -45 degrees
            .style('text-anchor', 'end');  // Adjust text anchor to end

        // vis.yAxis.call(d3.axisLeft(vis.yScale));

        // vis.svg.selectAll('circle')
        //     .data(vis.data)
        //     .enter().append('circle')
        //     .attr('cx', d => vis.xScale(d.distributor) + vis.xScale.bandwidth() / 2)
        //     .attr('cy', d => vis.yScale(d.year))
        //     .attr('r', 5)  // Adjust the radius as needed
        //     .attr('fill', d => d.winner ? 'red' : 'gray');
        // vis.svg.selectAll('circle')  // Select all existing circles
        //     .data(vis.filteredData)
        //     .enter()  // Enter selection for new data points
        //     .append('circle')  // Append new circles
        //     .attr('cx', d => vis.xScale(d.distributor) + vis.xScale.bandwidth() / 2)
        //     .attr('cy', d => vis.yScale(d.Year))
        //     .attr('r', 5)  // Adjust the radius as needed
        //     .attr('fill', d => d.winner ? 'red' : 'gray')
        //     .attr('class', d => {
        //         // Add a class 'black' if the studio had both winner=true and winner=false
        //         return vis.filteredData.some(e => e.distributor === d.distributor && e.year === d.year && e.winner !== d.winner) ? 'black' : '';
        //     });

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


        // vis.svg.selectAll('circle')
        //     .filter(d => vis.filteredData.some(e => e.distributor === d.distributor && e.year === d.year && e.winner !== d.winner))
        //     .attr('class', 'black');

    }
}
