class GenreBar {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = {};
        // same order as clusterplot for easier color matching
        this.genres = ["Drama", "Romance", "War", "Sport", "Comedy", 
            "History", "Biography", "Western", "Crime", 
            "Thriller", "Adventure", "Music", "Action", 
            "Musical", "Fantasy", "Film-Noir", "Mystery", 
            "Family", "Animation", "Sci-Fi", "Horror"]
        this.colors = ["#ffd700",
        "#1d632f",
        "#ffb14e",
        "#ea5f94",
        "#fa8775",
        "#3cd42f",
        "#9d02d7",
        "#0000ff",
        "#df2020",
        "#b67c58",
        "#a6233f",
        "#cd34b5",
        "#35e2d9",
        "#1096ff",
        "#bb8ff3",
        "#c8fa96",
        "#175676",
        "#74001b",
        "#89a7be",
        "#b8fffe",
        "#ff91fd",
        "#ff00f2"]

        this.initVis();
    }

    initVis(){
        let vis = this;

		vis.margin = {top: 30, right: 5, bottom: 5, left: 72};	
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = window.innerHeight - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // scales and axes
		vis.x = d3.scaleLinear()
            .range([0, vis.width]);
    
        vis.y = d3.scaleBand()
            .domain(vis.genres)
            .rangeRound([vis.margin.top, vis.height - vis.margin.bottom])
            .paddingInner(0.1);

        vis.color = d3.scaleOrdinal()
            .domain(vis.genres)
            .range(vis.colors);
        
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);
        
        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        // tooltip
        vis.svg.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // (Filter, aggregate, modify data)
        vis.wrangleData();

    }

    wrangleData(){
        let vis = this;
        console.log(vis.data);
        
        // Create a function that creates a JavaScript dict where each element represents a genre
        // Each genre element has properties for the total number of movies and the number of winners in that genre
        vis.data.forEach(movie => {
            movie.Genre.split(', ').forEach(genre => {
                if (!vis.displayData[genre]) {
                    vis.displayData[genre] = { total: 0, winners: 0 };
                }
                vis.displayData[genre].total++;
                if (movie.winner) {
                    vis.displayData[genre].winners++;
                }
            });
        });

        console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        console.log(Object.values(vis.displayData));
        console.log(Object.entries(vis.displayData));
        vis.x.domain([0, d3.max(Object.values(vis.displayData), d => d.total)]).nice();


        // sorts data by winners
        let sortedData = Object.entries(vis.displayData).sort((a, b) => b[1].winners - a[1].winners);
        console.log(sortedData);

        // Update the domain of the y-scale to reflect the sorted order
        vis.y.domain(sortedData.map(d => d[0]));

        // Draw the total movies bar
        vis.svg.append("g")
            .selectAll("rect.total")
            .data(sortedData)
            .join("rect")
                .attr("class", d => `${d[0]} total`)
                .attr("fill", d => vis.color(d[0]))
                .attr("x", 0)
                .attr("y", d => vis.y(d[0]))
                .attr("width", d => vis.x(d[1].total))
                .attr("height", vis.y.bandwidth())
                .on("mouseover", function(event, d) {
                    // Highlight the hovered section
                    d3.selectAll(`rect.${this.__data__[0]}`)
                        .style('stroke-width', '2px')
                        .style("stroke", "#000000")
                    // Turn all other rects, labels, circles to light grey
                    d3.selectAll(`text.genre-label:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    d3.selectAll(`rect:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    d3.selectAll(`circle:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    // increase stroke width of circles
                    d3.selectAll(`circle.${this.__data__[0]}`)
                        .style('stroke', 'black')
                        .style('stroke-width', '2px')
                    vis.svg.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY - 50 + "px")
                        .html(`
                            <div style="border: thin solid grey; border-radius: 5px; background: #F1E5AC; padding: 3px">
                                <h5>${this.__data__[0]}</h5>
                                <table>
                                    <tr>
                                        <td style="text-align: right">${this.__data__[1].total} films</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: right">${this.__data__[1].winners} winners</td>
                                    </tr>
                                </table>
                            </div>`);
                })
                .on("mouseout", function(event, d) {
                    // Reset the color of the hovered section
                    d3.selectAll(`rect.${this.__data__[0]}`)
                        .style('stroke-width', '0px')
                        .style("stroke", "none");

                    // Reset the colors and strokes of all rects and circles
                    d3.selectAll("text.genre-label")
                        .style("opacity", 1);
                    d3.selectAll("rect")
                        .style("opacity", 1);
                    d3.selectAll("circle")
                        .style("opacity", 1)
                        .style('stroke-width', '0px')
                        .style("stroke", "none");

                    // Re-apply necessary styles to winner circles
                    d3.selectAll("circle.winner")
                        .style('stroke', "#000000")
                        .style('stroke-width', "1.5px");

                    // Reset the tooltip
                    vis.svg.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                })

        // Draw the winners bar
        vis.svg.append("g")
            .selectAll("rect.winners")
            .data(sortedData)
            .join("rect")
                .attr("class", d => `${d[0]} winners`)
                .attr("fill", "#E3AE00") // Use a different color for winners
                .attr("x", 0) // Start at the same x-coordinate as the total bar
                .attr("y", d => vis.y(d[0]))
                .attr("width", d => d[1].winners > 0 ? vis.x(d[1].winners) : 0) // Width based on winners count, 0 if winners are 0
                .attr("height", vis.y.bandwidth())
                .on("mouseover", function(event, d) {
                    // Highlight the hovered section
                    d3.selectAll(`rect.${this.__data__[0]}`)
                        .style('stroke-width', '2px')
                        .style("stroke", "#000000")
                    // Turn all other rects, labels, circles to light grey
                    d3.selectAll(`text.genre-label:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    d3.selectAll(`rect:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    d3.selectAll(`circle:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    // increase stroke width of circles
                    d3.selectAll(`circle.${this.__data__[0]}`)
                        .style('stroke', 'black')
                        .style('stroke-width', '2px')
                    vis.svg.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY - 50 + "px")
                        .html(`
                        <div style="border: thin solid grey; border-radius: 5px; background: #F1E5AC; padding: 3px">
                            <h5>${this.__data__[0]}</h5>
                            <table>
                                <tr>
                                    <td style="text-align: right">${this.__data__[1].total} films</td>
                                </tr>
                                <tr>
                                    <td style="text-align: right">${this.__data__[1].winners} winners</td>
                                </tr>
                            </table>
                        </div>`);
                })
                .on("mouseout", function(event, d) {
                    // Reset the color of the hovered section
                    d3.selectAll(`rect.${this.__data__[0]}`)
                        .style('stroke-width', '0px')
                        .style("stroke", "none");

                    // Reset the colors and strokes of all rects and circles
                    d3.selectAll("text.genre-label")
                        .style("opacity", 1);
                    d3.selectAll("rect")
                        .style("opacity", 1);
                    d3.selectAll("circle")
                        .style("opacity", 1)
                        .style('stroke-width', '0px')
                        .style("stroke", "none");

                    // Re-apply necessary styles to winner circles
                    d3.selectAll("circle.winner")
                        .style('stroke', "#000000")
                        .style('stroke-width', "1.5px");

                    // Reset the tooltip
                    vis.svg.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                });

        vis.yAxisGroup.call(vis.yAxis);
        vis.yAxisGroup.selectAll(".tick text")
            .attr("class", (d) => `genre-label ${d}`)
            .attr("font-size", "12px")
            .on("mouseover", function(event, d) {
                // Highlight the hovered section
                d3.selectAll(`rect.${d}`)
                    .style('stroke-width', '2px')
                    .style("stroke", "#000000")
                // Turn all other rects, labels, circles to light grey
                d3.selectAll(`text.genre-label:not(.${d})`)
                    .style("opacity", 0.25);
                d3.selectAll(`rect:not(.${d})`)
                    .style("opacity", 0.25);
                d3.selectAll(`circle:not(.${d})`)
                    .style("opacity", 0.25);
                // increase stroke width of circles
                d3.selectAll(`circle.${d}`)
                    .style('stroke', 'black')
                    .style('stroke-width', '2px')
                vis.svg.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 50 + "px")
                    .html(
                        `<div style="border: thin solid grey; border-radius: 5px; background: #F1E5AC; padding: 3px">
                            <h5>${d}</h5>
                            <table>
                                <tr>
                                    <td style="text-align: right">${sortedData.find(item => item[0] === d)[1].total} films</td>
                                </tr>
                                <tr>
                                    <td style="text-align: right">${sortedData.find(item => item[0] === d)[1].winners} winners</td>
                                </tr>
                            </table>
                        </div>`);         
            })
            .on("mouseout", function(event, d) {
                // Reset the color of the hovered section
                d3.selectAll(`rect.${d}`)
                    .style('stroke-width', '0px')
                    .style("stroke", "none");

                // Reset the colors and strokes of all rects, text, and circles
                d3.selectAll("text.genre-label")
                    .style("opacity", 1);
                d3.selectAll("rect")
                    .style("opacity", 1);
                d3.selectAll("circle")
                    .style("opacity", 1)
                    .style('stroke-width', '0px')
                    .style("stroke", "none");

                // Re-apply necessary styles to winner circles
                d3.selectAll("circle.winner")
                    .style('stroke', "#000000")
                    .style('stroke-width', "1.5px");

                // Reset the tooltip
                vis.svg.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });   
    }
}
