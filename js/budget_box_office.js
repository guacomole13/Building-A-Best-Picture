class RankChart {

    constructor(_parentElement, data2) {
        this.parentElement = _parentElement;
        this.data = data2

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
            // .text('Box Office and Budget Rank of Winners vs Nominees')
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr("font-size", 20)
            .attr('text-anchor', 'middle');

        // Graph title
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.margin.top - 60) // Adjust height of title
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "16px")
            // .text("What is the typical box office performance of Best Picture winners?");

        // Graph Info
        vis.svg.append("text")
            .attr("x", vis.width * 3 / 7)
            .attr("y", vis.height - 100) // Adjust height of title
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-color", "white")
            .style("font-size", "14px")
            .text("Note: Only 5 Movies Were Nominated Annually from 1945 to 2008");

        vis.tooltip = d3.select(".tooltip");
        if (vis.tooltip.empty()) {
            vis.tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
        }

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

        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");
            // .call(d3.axisBottom(vis.xScale)
                // .tickFormat(d3.format("d"))
            // );

        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(vis.yScale));

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
            .text("Rank vs. Nominee Pool");


        vis.xAxis.call(d3.axisBottom(vis.xScale).tickFormat(d3.format("d")));
        vis.yAxis.call(d3.axisLeft(vis.yScale));

        // Create line generators for each category
        const boxOfficeLine = d3.line()
            .x(d => vis.xScale(d.Year))
            .y(d => vis.yScale(d.BoxOffice_Rank));

        const budgetLine = d3.line()
            .x(d => vis.xScale(d.Year))
            .y(d => vis.yScale(d.Budget_Rank));

        vis.svg.selectAll('.rank-line')
            .data(vis.filteredWinnersData)
            .enter()
            .append('line')
            .attr('class', 'rank-line')
            .attr('x1', d => vis.xScale(d.Year))
            .attr('y1', d => vis.yScale(d.BoxOffice_Rank))
            .attr('x2', d => vis.xScale(d.Year))
            .attr('y2', d => vis.yScale(d.Budget_Rank))
            .attr('stroke', 'gray')
            .attr('stroke-width', 1);


        // Bind data to circles for each point
        vis.svg
            .selectAll('.boxoffice-circle')
            .data(vis.filteredWinnersData)
            .enter()
            .append('circle')
            .attr('class', 'boxoffice-circle')
            .attr('cx', d => vis.xScale(d.Year))
            .attr('cy', d => vis.yScale(d.BoxOffice_Rank))
            .attr('r', 5)
            .attr('fill', 'steelblue')
            // Add mouseover and mouseout event listeners for the circles
            .on("mouseover", function(event, d) {
                event.stopPropagation();
                d3.select(this).transition()
                    .duration(200)
                    .attr('r', 8); // Increase the radius for highlight
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                vis.tooltip.html(
                    "Title: " + d.Title + "<br/>" +
                    "Year: " + d.Year + "<br/>" +
                    "Box Office Rank: " + d.BoxOffice_Rank + "<br/>" +
                    "Budget Rank: " + d.Budget_Rank
                )
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                event.stopPropagation();
                d3.select(this).transition()
                    .duration(500)
                    .attr('r', 5); // Reset the radius
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


        vis.svg
            .selectAll('.budget-circle')
            .data(vis.filteredWinnersData)
            .enter()
            .append('circle')
            .attr('class', 'budget-circle')
            .attr('cx', d => vis.xScale(d.Year))
            .attr('cy', d => vis.yScale(d.Budget_Rank))
            .attr('r', 4)
            .attr('fill', 'darkred')
            // Add mouseover and mouseout event listeners for the circles
            .on("mouseover", function(event, d) {
                d3.select(this).transition()
                    .duration(400)
                    .attr('r', 8); // Increase the radius for highlight
                vis.tooltip.transition()
                    .duration(400)
                    .style("opacity", .9);
                vis.tooltip.html(
                    "Title: " + d.Title + "<br/>" +
                    "Year: " + d.Year + "<br/>" +
                    "Box Office Rank: " + d.BoxOffice_Rank + "<br/>" +
                    "Budget Rank: " + d.Budget_Rank
                )
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).transition()
                    .duration(500)
                    .attr('r', 4); // Reset the radius
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add vertical lines between BoxOfficeRank and BudgetRank


        let legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (vis.width+20) + "," + 40 + ")"); // Adjust the translation as needed

        legend.append("text")
            .attr("x", 0)
            .attr("y", -15)
            .style("font-weight", "bold")
            .text("Legend:");

        // Add legend items
        legend.append("circle")
            .attr("radius", 5)
            .attr("fill", "steelblue"); // Adjust color as needed

        legend.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .text("Box Office Rank"); // Adjust text and position as needed

        legend.append("circle")
            .attr("radius", 4)
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



    }
}
