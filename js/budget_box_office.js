class RankChart {

    constructor(_parentElement, data1, data2, data3) {
        this.parentElement = _parentElement;
        this.budgetdata = data1
        this.imdbdata = data2
        this.data = data3

        this.initVis();
    }

    initVis() {
        // Method to initialize the visualization
        let vis = this;

        vis.margin = { top: 40, right: 150, bottom: 40, left: 40 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width*5/6 - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

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
            .text('Box Office and Budget Rank of Winners vs Nominees')
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr("font-size", 20)
            .attr('text-anchor', 'middle');



        // // init scales
        // vis.xScale = d3.scaleLinear()
        //     .domain([d3.min(vis.data, d => d.Year), d3.max(vis.data, d => d.Year)])
        //     .range([0, vis.width]);
        //
        // vis.yScale = d3.scaleLinear()
        //     .domain([10, 1])
        //     .range([vis.height, 0]);
        //
        // // init x & y axis
        // // vis.xAxis = vis.svg.append("g")
        // //     .attr("class", "axis axis--x")
        // //     .attr("transform", "translate(0," + vis.height + ")");
        // // vis.yAxis = vis.svg.append("g")
        // //     .attr("class", "axis axis--y");
        //
        // vis.xAxis = vis.svg.append("g")
        //     .attr("class", "axis axis--x")
        //     .attr("transform", "translate(0," + vis.height + ")")
        //     .call(d3.axisBottom(vis.xScale));
        //
        // vis.yAxis = vis.svg.append("g")
        //     .attr("class", "axis axis--y")
        //     .call(d3.axisLeft(vis.yScale));
        //
        // // flip axis
        // // vis.svg.selectAll('.axis--y .tick text')
        // //     .attr('dy', '-0.7em');
        //
        // vis.BOline = d3.line()
        //     .x(d => vis.xScale(d.Year))
        //     .y(d => vis.yScale(d.BoxOffice_Rank));
        //
        // vis.BUline = d3.line()
        //     .x(d => vis.xScale(d.Year))
        //     .y(d => vis.yScale(d.Budget_Rank));
        //
        // vis.svg.append("text")
        //     .attr("transform", "translate(" + (vis.width / 2) + " ," + (vis.height + vis.margin.top + 20) + ")")
        //     .style("text-anchor", "middle")
        //     .text("Year");
        //
        // // Add y-axis label
        // vis.svg.append("text")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", 0 - vis.margin.left)
        //     .attr("x", 0 - (vis.height / 2))
        //     .attr("dy", "1em")
        //     .style("text-anchor", "middle")
        //     .text("Rank");

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
        vis.winnersData = vis.data.filter(d => d.winner === true);

        // vis.winnersData = vis.data.filter(d => d.winner === true);

        // console.log(vis.data);
        // console.log(vis.budgetdata);
        // vis.winnersData = vis.data.filter(d => d.true);
        console.log(vis.winnersData);
        console.log("the winners!")
        vis.filteredWinnersData = vis.winnersData.filter(d => !isNaN(d.BoxOffice_Rank) && !isNaN(d.Budget_Rank));

        vis.filteredWinnersData = vis.filteredWinnersData.sort((a, b) => a.year - b.year);



        console.log(vis.filteredWinnersData)
        console.log("the filtered winners!")


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
        let vis = this;

        vis.svg.append("rect")
            .attr("x", vis.width*0.06172839506) // 5/81, the amount moved over in the x-axis
            .attr("y", vis.height/(2))
            .attr("width", vis.width*0.77777777777) // 63/81, the number of years with 5 movies (1945-2009)
            .attr("height", vis.height/(2))
            .attr("fill", "black")
            .attr("opacity", 0.5);

        // init scales
        vis.xScale = d3.scaleLinear()
            .domain([d3.min(vis.filteredWinnersData, d => d.Year), d3.max(vis.filteredWinnersData, d => d.Year)])
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([10, 1])
            .range([vis.height, 0]);

        // init x & y axis
        // vis.xAxis = vis.svg.append("g")
        //     .attr("class", "axis axis--x")
        //     .attr("transform", "translate(0," + vis.height + ")");
        // vis.yAxis = vis.svg.append("g")
        //     .attr("class", "axis axis--y");

        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");
            // .call(d3.axisBottom(vis.xScale)
                // .tickFormat(d3.format("d"))
            // );

        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(vis.yScale));

        // vis.xAxis.selectAll(".tick text")
        //     .text(d => d3.format("")(d));

        // flip axis
        // vis.svg.selectAll('.axis--x .tick')
        //     .tickFormat(d3.format("d"));
            // .attr('dy', '-0.7em');

        vis.BOline = d3.line()
            .x(d => vis.xScale(d.Year))
            .y(d => vis.yScale(d.BoxOffice_Rank));

        vis.BUline = d3.line()
            .x(d => vis.xScale(d.Year))
            .y(d => vis.yScale(d.Budget_Rank));

        vis.svg.append("text")
            .attr("transform", "translate(" + (vis.width / 2) + " ," + (vis.height + vis.margin.bottom-5) + ")")
            .style("text-anchor", "middle")
            .text("Year");

        // Add y-axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - vis.margin.left)
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Rank");


        vis.xAxis.call(d3.axisBottom(vis.xScale).tickFormat(d3.format("d")));
        vis.yAxis.call(d3.axisLeft(vis.yScale));

        // Create line generators for each category
        const boxOfficeLine = d3.line()
            .x(d => vis.xScale(d.Year))
            .y(d => vis.yScale(d.BoxOffice_Rank));

        const budgetLine = d3.line()
            .x(d => vis.xScale(d.Year))
            .y(d => vis.yScale(d.Budget_Rank));

        // Bind data to circles for each point
        vis.svg.selectAll('.boxoffice-circle')
            .data(vis.filteredWinnersData)
            .enter()
            .append('circle')
            .attr('class', 'boxoffice-circle')
            .attr('cx', d => vis.xScale(d.Year))
            .attr('cy', d => vis.yScale(d.BoxOffice_Rank))
            .attr('r', 4)
            .attr('fill', 'steelblue');

        vis.svg.selectAll('.budget-circle')
            .data(vis.filteredWinnersData)
            .enter()
            .append('circle')
            .attr('class', 'budget-circle')
            .attr('cx', d => vis.xScale(d.Year))
            .attr('cy', d => vis.yScale(d.Budget_Rank))
            .attr('r', 4)
            .attr('fill', 'darkred');

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
            .attr("fill", "steelblue"); // Adjust color as needed

        legend.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .text("Box Office Rank"); // Adjust text and position as needed

        legend.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("y", 20)
            .attr("fill", "darkred"); // Adjust color as needed

        legend.append("text")
            .attr("x", 15)
            .attr("y", 30)
            .text("Budget Rank"); // Adjust text and position as needed

        legend.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("y", 40)
            .attr("fill", "black")
            .attr("opacity", 0.5); // Adjust color as needed

        legend.append("text")
            .attr("x", 15)
            .attr("y", 50)
            .text("Ineligible Ranks"); // Adjust text and position as needed


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
    }
}
