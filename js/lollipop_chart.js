class LollipopChart {

    constructor(parentElement, imdbData) {
        this.parentElement = parentElement;
        this.imdbData = imdbData;

        this.initVis();
    }

    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */
    initVis() {
        let vis = this;

        // Define svg
        vis.margin = { top: 40, right: 180, bottom: 100, left: 100 }; // Adjust margins to allow axes / labels to fit

        // Set width based on the dimensions of the parent element
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom; // Adjust as needed

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .padding(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

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
            .attr("class", "lollipop-text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 0.5 * vis.margin.bottom)
            .style("text-anchor", "middle")
            .text("Decades");

        // Y-axis label
        vis.svg.append("text")
            .attr("class", "lollipop-text")
            .attr("transform", "rotate(-90)")
            .attr("y", 40 - vis.margin.left) // Adjusted y-coordinate
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("IMDB Rating");

        // Graph title
        vis.svg.append("text")
            .attr('class', 'title lollipop-text')
            .attr("x", vis.width / 2)
            .attr("y", vis.margin.top - 60) // Adjust height of title
            .style("text-anchor", "middle")
            .text("How do average IMDB ratings for Best Picture winners vs. nominees compare throughout the years?");

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

        // Group the data by decade
        const nestedDataMap = d3.group(vis.imdbData, d => {
            const year = Math.floor(d.OscarYear / 10) * 10; // convert the OscarYear into a decade format
            return `${year}s`;
        });

        // Calculate the average IMDB ratings for winners and nominees for each decade
        vis.nestedData = Array.from(nestedDataMap, ([key, value]) => {
            const winners = value.filter(item => item.Award === "Winner");
            const nominees = value.filter(item => item.Award === "Nominee");

            const winnerAvg = d3.mean(winners, item => +item['IMDBRating']);
            const nomineeAvg = d3.mean(nominees, item => +item['IMDBRating']);

            return { key, value: { winnerAvg, nomineeAvg } };
        });

        // Log the final nestedData to check calculated averages
        // console.log('Nested Data with Averages:', vis.nestedData);

        // Update the visualization
        vis.updateVis();
    }

    /*
     * Tooltip function
     */

    displayTooltip(element, data, awardType) {
        let vis = this;

        // Store original width and height as attributes when element is created
        d3.select(element)
            .attr("original-width", d3.select(element).attr("width"))
            .attr("original-height", d3.select(element).attr("height"))
            .attr("original-x", d3.select(element).attr("x"));

        element.addEventListener('mouseover', function (event) {
            let originalWidth = +d3.select(this).attr("original-width");
            let originalHeight = +d3.select(this).attr("original-height");
            let originalX = +d3.select(this).attr("original-x");

            d3.select(this)
                .transition()
                .duration(100)
                .attr("width", originalWidth * 1.3) // Expand width to 1.2 times
                .attr("height", originalHeight * 1.3) // Expand height to 1.2 times
                .attr("x", originalX - 2); // Shift the element 2 units to the left

            // Get the decade and average ratings from the nested data
            const decade = data.key;
            const winnerAvg = data.value.winnerAvg;
            const nomineeAvg = data.value.nomineeAvg;

            let averageRating = awardType === 'winner' ? winnerAvg : nomineeAvg;

            // Show tooltip with updated content
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY - 20 + "px")
                .html(`
        <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
            <h3>${decade} Best Picture ${awardType === 'winner' ? 'Winners' : 'Nominees'}</h3>
            <h4>Average IMDB Rating: ${averageRating.toFixed(1)} out of 10 </h4>
        </div>`
                );
        });

        element.addEventListener('mouseout', function (event) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr("width", d3.select(this).attr("original-width")) // Revert to original width
                .attr("height", d3.select(this).attr("original-height")) // Revert to original height
                .attr("x", d3.select(this).attr("original-x")); // Revert to original x-coordinate

            // Hide tooltip
            vis.tooltip.style("opacity", 0);
        });
    }


    /*
     * The drawing function
     */
    updateVis() {
        let vis = this;

        // Define the width of each line (bar) and the padding between winner and nominee lines
        const barWidth = vis.x.bandwidth() / 11;
        const padding = 15; // Adjust the space in between the winner and nominee lines

        // Update scales with the new data
        vis.x.domain(vis.nestedData.map(d => d.key));
        vis.y.domain([0, d3.max(vis.nestedData, d => Math.max(d.value.winnerAvg, d.value.nomineeAvg))]);

        // Update axes
        vis.svg.select(".x-axis")
            .call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        vis.svg.select(".y-axis")
            .call(vis.yAxis);

        // Create the mask element
        vis.svg.append("mask")
            .attr("id", "clip-mask")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("fill", "white"); // Change to black to hide, white to show

        // make a rectangle the size of the SVG (vis.width and vis.height) and use it to
        // hide the parts of the image of the lines that extend beyond its boundaries
        vis.svg.append("rect")
            .attr("x", -vis.margin.left)
            .attr("y", -vis.margin.top)
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("fill", "url(#clip-mask)");

        // Winner Squiggle
        vis.svg.selectAll(".winnerSquiggle")
            .data(vis.nestedData)
            .join("image")
            .attr("class", "winnerSquiggle")
            .attr("xlink:href", "img/winner_squiggles.png")
            .attr("x", d => vis.x(d.key) + barWidth / 2 - padding - 7) // Position image
            .attr("y", d => vis.y(d.value.winnerAvg) - 3) // Adjust image position based on star image dimensions
            .attr("width", 14) // Adjust image width
            .attr("height", vis.y(0)) // Adjust image height dynamically
            .attr("mask", "url(#clip-mask)");

        // Nominee Squiggle
        vis.svg.selectAll(".nomineeSquiggle")
            .data(vis.nestedData)
            .join("image")
            .attr("class", "nomineeSquiggle")
            .attr("xlink:href", "img/nominee_squiggles.png")
            .attr("x", d => vis.x(d.key) + barWidth / 2 + padding - 5) // Position image
            .attr("y", d => vis.y(d.value.nomineeAvg) - 1) // Adjust image position based on star image dimensions
            .attr("width", 13) // Adjust image width
            .attr("height", vis.y(0)) // Adjust image height dynamically
            .attr("mask", "url(#clip-mask)");

        // Winner Stars
        vis.svg.selectAll(".winnerStar")
            .data(vis.nestedData)
            .join("image")
            .attr("class", "winnerStar")
            .attr("xlink:href", "img/winner_star.png")
            .attr("x", d => vis.x(d.key) + barWidth / 2 - padding - 12) // Adjust image position based on star image dimensions
            .attr("y", d => vis.y(d.value.winnerAvg) - 10) // Adjust image position based on star image dimensions
            .attr("width", 25) // Adjust image width
            .attr("height", 25); // Adjust image height

        // Nominee Stars
        vis.svg.selectAll(".nomineeStar")
            .data(vis.nestedData)
            .join("image")
            .attr("class", "nomineeStar")
            .attr("xlink:href", "img/nominee_star.png")
            .attr("x", d => vis.x(d.key) + barWidth / 2 + padding - 12) // Adjust image position based on star image dimensions
            .attr("y", d => vis.y(d.value.nomineeAvg) - 8) // Adjust image position based on star image dimensions
            .attr("width", 25) // Adjust image width
            .attr("height", 25); // Adjust image height

        // Apply tooltip functionality to the winner squiggles
        vis.svg.selectAll(".winnerSquiggle").each(function(d) {
            vis.displayTooltip(this, d, 'winner');
        });

        // Apply tooltip functionality to the nominee squiggles
        vis.svg.selectAll(".nomineeSquiggle").each(function(d) {
            vis.displayTooltip(this, d, 'nominee');
        });

        // Apply tooltip functionality to the winner stars
        vis.svg.selectAll(".winnerStar").each(function(d) {
            vis.displayTooltip(this, d, 'winner');
        });

        // Apply tooltip functionality to the nominee stars
        vis.svg.selectAll(".nomineeStar").each(function(d) {
            vis.displayTooltip(this, d, 'nominee');
        });

        // Append a text element for the note
        vis.svg.append("text")
            .attr("class", "lollipop-text")
            .attr("x", vis.width / 2)  // Position the text in the center of the SVG
            .attr("y", vis.height + vis.margin.bottom - 20)  // Adjust the y-coordinate to position the text below the chart
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Note: Each decade captures 10 years of Academy Awards ceremonies. Year of ceremony is the year displayed, not the year in which the movie was released.");

        //////// ADD LEGEND ////////

        // Append a group element for the legend
        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width + 20}, 20)`); // Position the legend to the right of the graph

        // Append a rectangle as the background for the legend box
        const legendBox = legend.append("rect")
            .attr("width", 110) // Width of the legend box
            .attr("height", 115) // Height of the legend box
            .attr("fill", "white") // Background color of the legend box
            .attr("stroke", "black"); // Border color of the legend box

        // Append text as the title of the legend
        legend.append("text")
            .attr("x", 10) // Adjust title position within the legend box
            .attr("y", 30) // Adjust title position within the legend box
            .text("Legend")
            .style("font-weight", "bold"); // Style the title text

        // Append winner star image in the legend
        legend.append("image")
            .attr("xlink:href", "img/winner_star.png")
            .attr("x", 10) // Adjust position within the legend box
            .attr("y", 50) // Adjust position within the legend box
            .attr("width", 20)
            .attr("height", 20);

        // Append text label for winner star
        legend.append("text")
            .attr("x", 35) // Adjust label position relative to the star image
            .attr("y", 65) // Adjust label position relative to the star image
            .text("Winners");

        // Append nominee star image in the legend
        legend.append("image")
            .attr("xlink:href", "img/nominee_star.png")
            .attr("x", 10) // Adjust position within the legend box
            .attr("y", 80) // Adjust position within the legend box
            .attr("width", 20)
            .attr("height", 20);

        // Append text label for nominee star
        legend.append("text")
            .attr("x", 35) // Adjust label position relative to the star image
            .attr("y", 95) // Adjust label position relative to the star image
            .text("Nominees");
    }
}
