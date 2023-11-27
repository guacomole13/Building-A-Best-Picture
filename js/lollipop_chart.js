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
        vis.margin = { top: 40, right: 40, bottom: 100, left: 50 }; // Adjust margins to allow axes / labels to fit

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
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 0.5 * vis.margin.bottom)
            .style("text-anchor", "middle")
            .text("Decades");

        // Y-axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - vis.margin.left)
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("IMDB Rating");

        // Graph title
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.margin.top - 60) // Adjust height of title
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text("How do average IMDB ratings for Best Picture winners vs. nominees compare throughout the years?");

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
        console.log('Nested Data with Averages:', vis.nestedData);

        // Update the visualization
        vis.updateVis();
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

        // Append images of lines for winner lollipops
        vis.svg.selectAll(".winnerLollipop")
            .data(vis.nestedData)
            .join("image")
            .attr("class", "winnerLollipop")
            .attr("xlink:href", "img/winner_squiggles.png")
            .attr("x", d => vis.x(d.key) + barWidth / 2 - padding) // Position image
            .attr("y", d => vis.y(0) - 65)
            .attr("width", 7)
            .attr("height", 100);

        // Append images for nominee lollipops
        vis.svg.selectAll(".nomineeLollipop")
            .data(vis.nestedData)
            .join("image")
            .attr("class", "nomineeLollipop")
            .attr("xlink:href", "img/nominee_squiggles.png")
            .attr("x", d => vis.x(d.key) + barWidth / 2 + padding) // Position image
            .attr("y", d => vis.y(0) - 65)
            .attr("width", 7)
            .attr("height", 100);

        // // Winner Lines
        // vis.svg.selectAll(".winnerLine")
        //     .data(vis.nestedData)
        //     .join("line")
        //     .attr("class", "winnerLine")
        //     .attr("x1", d => vis.x(d.key) + barWidth / 2 - padding) // Start line (from x position)
        //     .attr("x2", d => vis.x(d.key) + barWidth / 2 - padding) // End line (to x position)
        //     .attr("y1", d => vis.y(d.value.winnerAvg)) // Y-position at winner average
        //     .attr("y2", d => vis.y(0)) // Connect line to x-axis
        //     .attr("stroke", "green")
        //     .attr("stroke-width", 2);

        // // Nominee Lines
        // vis.svg.selectAll(".nomineeLine")
        //     .data(vis.nestedData)
        //     .join("line")
        //     .attr("class", "nomineeLine")
        //     .attr("x1", d => vis.x(d.key) + barWidth / 2 + padding) // Start line (from x position)
        //     .attr("x2", d => vis.x(d.key) + barWidth / 2 + padding) // End line (to x position)
        //     .attr("y1", d => vis.y(d.value.nomineeAvg)) // Y-position at nominee average
        //     .attr("y2", d => vis.y(0)) // Connect line to x-axis
        //     .attr("stroke", "blue")
        //     .attr("stroke-width", 2);

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

        // Append a text element for the note
        vis.svg.append("text")
            .attr("x", vis.width / 2)  // Position the text in the center of the SVG
            .attr("y", vis.height + vis.margin.bottom - 20)  // Adjust the y-coordinate to position the text below the chart
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Note: Each decade captures 10 years of Academy Awards ceremonies. Year of ceremony is the year displayed, not the year in which the movie was released.");

        // TODO: ADD LEGEND

        // TODO: ADD TOOLTIP ON HOVER
    }
}
