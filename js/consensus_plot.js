
class ConsensusPlot {

    constructor(parentElement, displayData) {
        this.parentElement = parentElement;
        this.displayData = displayData;
        this.parseYear = d3.timeParse('%Y');

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        // Define svg
        vis.margin = {top: 40, right: 320, bottom: 100, left: 300}; // Adjust margins to allow axes / labels to fit

        // Set width based on the dimensions of the parent element
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 520 - vis.margin.top - vis.margin.bottom;


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
            .text("Rotten Tomatoes audience and critic ratings (%)");

        // Graph title
        vis.svg.append('g')
            .attr('class', 'title')
            .append('text')
            .text("Is there consensus between Best Picture winners’ critic and audience ratings on Rotten Tomatoes?")
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle');

        // Append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'consensusTooltip')
            .style("opacity", 0);

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        // Check if there's a brushed selection
        if (selectedTimeRange.length === 2) {
            // Extract the year part from the selectedTimeRange
            const startYear = selectedTimeRange[0].getFullYear();
            const endYear = selectedTimeRange[1].getFullYear();

            // Filter the displayData based on the year part of OscarYear
            vis.filteredData = vis.displayData.filter(d => {
                const filmYear = d.OscarYear.getFullYear();
                return filmYear >= startYear && filmYear <= endYear;
            });

        } else {
            // Set the default year range for the consensus plot prior to brushing as 2010 to 2020
            vis.filteredData = vis.displayData.filter(d => {
                const filmYear = d.OscarYear.getFullYear();
                return filmYear >= 2010 && filmYear <= 2020;
            });
        }

        // Update the visualization
        vis.updateVis();
    }

    /*
     * Tooltip function
     */

    displayTooltip(element, data) {
        let vis = this;

        element.addEventListener('mouseover', function (event) {
            d3.select(this)
                .attr('stroke-width', '2px')
                .attr('stroke', 'black')
                .transition()
                .duration(100)
                .attr("width", 19)
                .attr("height", 19);

            // Show tooltip
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY - 20 + "px")
                .html(`
            <div style="border: thin solid grey; border-radius: 5px; background: #FFF5C8; padding: 20px">
                <h3>${data.Film}</h3>
                <h4>Oscar Year: ${data.OscarYear.getFullYear()}</h4>
                <h4>Critic Rating: ${data.CriticRating}%</h4>
                <h4>Audience Rating: ${data.AudienceRating}%</h4>
                <h4>Rating Difference: ${Math.abs(data.CriticRating - data.AudienceRating)}%</h4>
            </div>`
                );
        });

        element.addEventListener('mouseout', function (event) {
            d3.select(this)
                .attr('stroke-width', '1px') // Reset stroke width to 1px
                .attr("stroke", "black")
                .transition()
                .duration(100)
                .attr("width", 13)
                .attr("height", 13);

            // Hide tooltip
            vis.tooltip.style("opacity", 0);
        });
    }


    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        // Update the x domain based on filteredData
        vis.x.domain([
            d3.min(vis.filteredData, d => Math.min(d.CriticRating, d.AudienceRating)) - 10,
            d3.max(vis.filteredData, d => Math.max(d.CriticRating, d.AudienceRating))
        ]);

        // Update the x-axis scale
        vis.svg.select(".x-axis")
            .transition().duration(400)
            .call(vis.xAxis);

        // Update the y domain based on filteredData
        vis.y.domain(vis.filteredData.map(d => d.Film)); // Update domain with the films in filteredData

        // Update the y-axis scale
        vis.svg.select(".y-axis")
            .transition().duration(400)
            .call(vis.yAxis);

        // Select all existing lines and bind filteredData
        let lines = vis.svg.selectAll(".consensus-line")
            .data(vis.filteredData, d => d.Film);

        // Remove lines that don't have data anymore
        lines.exit().remove();

        // Append new lines for new data
        let linesEnter = lines.enter()
            .append("line")
            .attr("class", "consensus-line")
            .merge(lines) // Merge enter and update selections
            .attr("x1", d => vis.x(d.CriticRating))
            .attr("x2", d => vis.x(d.AudienceRating))
            .attr("y1", d => vis.y(d.Film))
            .attr("y2", d => vis.y(d.Film))
            .attr("stroke", "black")
            .attr("stroke-width", "1px");

        // Transition the lines to their new positions
        linesEnter.transition()
            .duration(800)
            .attr("x2", d => vis.x(d.AudienceRating))
            .attr("y2", d => vis.y(d.Film));

        // Select all existing critic icons and bind filteredData
        let criticIcons = vis.svg.selectAll(".criticIcon")
            .data(vis.filteredData, d => d.Film);

        // Remove icons that don't have data anymore
        criticIcons.exit().remove();

        // Append new critic icons for new data
        criticIcons.enter()
            .append("svg:image")
            .attr("class", "criticIcon")
            .attr("opacity", 0) // Set initial opacity to 0 for a smooth fade-in effect
            .merge(criticIcons) // Merge enter and update selections
            .attr("xlink:href", d => d.CriticRating >= 60 ? "img/fresh_critic.png" : "img/rotten_critic.png")
            .attr("x", d => vis.x(d.CriticRating) - 2)
            .attr("y", d => vis.y(d.Film) - 6)
            .attr("width", 13)
            .attr("height", 13)
            .transition().duration(800)
            .attr("opacity", 1); // Fade in the icons by changing the opacity from 0 to 1


        // Select all existing audience icons and bind filteredData
        let audienceIcons = vis.svg.selectAll(".audienceIcon")
            .data(vis.filteredData, d => d.Film);

        // Remove icons that don't have data anymore
        audienceIcons.exit().remove();

        // Append new audience icons for new data
        audienceIcons.enter()
            .append("svg:image")
            .attr("class", "audienceIcon")
            .attr("opacity", 0) // Set initial opacity to 0 for a smooth fade-in effect
            .merge(audienceIcons) // Merge enter and update selections
            .attr("xlink:href", d => d.AudienceRating >= 60 ? "img/fresh_audience.png" : "img/rotten_audience.png")
            .attr("x", d => vis.x(d.AudienceRating) - 2)
            .attr("y", d => vis.y(d.Film) - 6)
            .attr("width", 13)
            .attr("height", 13)
            .transition().duration(800)
            .attr("opacity", 1); // Fade in the icons by changing the opacity from 0 to 1

        // Apply tooltip functionality to the critic icons
        vis.svg.selectAll(".criticIcon").each(function(d) {
            vis.displayTooltip(this, d);
        });

        // Apply tooltip functionality to the lines
        vis.svg.selectAll(".consensus-line").each(function(d) {
            vis.displayTooltip(this, d);
        });

        // Apply tooltip functionality to the audience icons
        vis.svg.selectAll(".audienceIcon").each(function(d) {
            vis.displayTooltip(this, d);
        });

        // Update axes
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

        // Append a text element for the note
        vis.svg.append("text")
            .attr("x", vis.width / 2)  // Position the text in the center of the SVG
            .attr("y", vis.height + vis.margin.bottom - 20)  // Adjust the y-coordinate to position the text below the chart
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Note: Each line connecting the icons denotes the difference between a film's Rotten Tomatoes critic rating and Rotten Tomatoes audience rating.");


        //////// ADD 2 SEPARATE LEGENDS ////////

        // Append a group element for the critic ratings legend
        const criticLegend = vis.svg.append("g")
            .attr("class", "criticLegend")
            .attr("transform", `translate(${vis.width + 35}, 20)`); // Position the critic ratings legend

        // Append a rectangle as the background for the critic ratings legend box
        const criticLegendBox = criticLegend.append("rect")
            .attr("width", 180) // Width of the critic ratings legend box
            .attr("height", 110) // Height of the critic ratings legend box
            .attr("fill", "white") // Background color of the critic ratings legend box
            .attr("stroke", "black"); // Border color of the critic ratings legend box

        // Append text as the title of the critic ratings legend
        criticLegend.append("text")
            .attr("x", 90) // Adjust title position within the critic ratings legend box
            .attr("y", 30) // Adjust title position within the critic ratings legend box
            .style("text-anchor", "middle")
            .text("Critic Ratings:")
            .style("font-weight", "bold"); // Style the title text

        // Append fresh critic icon in the legend
        criticLegend.append("image")
            .attr("xlink:href", "img/fresh_critic.png")
            .attr("x", 20) // Adjust position within the legend box
            .attr("y", 50) // Adjust position within the legend box
            .attr("width", 20)
            .attr("height", 20);

        // Append text label for fresh critic rating
        criticLegend.append("text")
            .attr("x", 45) // Adjust label position relative to the image
            .attr("y", 65) // Adjust label position relative to the image
            .text("Fresh (>= 60%)");

        // Append rotten critic icon in the legend
        criticLegend.append("image")
            .attr("xlink:href", "img/rotten_critic.png")
            .attr("x", 20) // Adjust position within the legend box
            .attr("y", 80) // Adjust position within the legend box
            .attr("width", 20)
            .attr("height", 20);

        // Append text label for rotten critic rating
        criticLegend.append("text")
            .attr("x", 45) // Adjust label position relative to the image
            .attr("y", 95) // Adjust label position relative to the image
            .text("Rotten (<60%)");

        // Append a group element for the audience ratings legend
        const audienceLegend = vis.svg.append("g")
            .attr("class", "audienceLegend")
            .attr("transform", `translate(${vis.width + 35}, 170)`); // Position the audience ratings legend

        // Append a rectangle as the background for the audience ratings legend box
        const audienceLegendBox = audienceLegend.append("rect")
            .attr("width", 180) // Width of the audience ratings legend box
            .attr("height", 110) // Height of the audience ratings legend box
            .attr("fill", "white") // Background color of the audience ratings legend box
            .attr("stroke", "black"); // Border color of the audience ratings legend box

        // Append text as the title of the audience ratings legend
        audienceLegend.append("text")
            .attr("x", 90) // Adjust title position within the audience ratings legend box
            .attr("y", 30) // Adjust title position within the audience ratings legend box
            .style("text-anchor", "middle")
            .text("Audience Ratings:")
            .style("font-weight", "bold"); // Style the title text

        // Append fresh audience icon in the legend
        audienceLegend.append("image")
            .attr("xlink:href", "img/fresh_audience.png")
            .attr("x", 20) // Adjust position within the legend box
            .attr("y", 50) // Adjust position within the legend box
            .attr("width", 20)
            .attr("height", 20);

        // Append text label for fresh audience rating
        audienceLegend.append("text")
            .attr("x", 45) // Adjust label position relative to the image
            .attr("y", 65) // Adjust label position relative to the image
            .text("Fresh (>=60%)");

        // Append rotten audience icon in the legend
        audienceLegend.append("image")
            .attr("xlink:href", "img/rotten_audience.png")
            .attr("x", 20) // Adjust position within the legend box
            .attr("y", 80) // Adjust position within the legend box
            .attr("width", 20)
            .attr("height", 20);

        // Append text label for rotten audience rating
        audienceLegend.append("text")
            .attr("x", 45) // Adjust label position relative to the image
            .attr("y", 95) // Adjust label position relative to the image
            .text("Rotten (<60%)");
    }
}