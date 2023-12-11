class GenreBar {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = {};
        // same order as clusterplot for easier color matching
        this.genres = {
            "Drama": "Should contain numerous consecutive scenes of characters portrayed to effect a serious narrative throughout the title, usually involving conflicts and emotions. This can be exaggerated upon to produce melodrama.",
            "Romance": "Should contain numerous inter-related scenes of a character and their personal life with emphasis on emotional attachment or involvement with other characters, especially those characterized by a high level of purity and devotion.",
            "War": "Should contain numerous scenes and/or a narrative that pertains to a real war (i.e., past or current). Note: for titles that portray fictional war, please submit it as a keyword only.",
            "Sport": "Focus is on sports or a sporting event, either fictional or actual. This includes fictional stories focused on a particular sport or event. In a fictional film, the sport itself can also be fictional, but it should be the primary focus of the film.",
            "Comedy": "Virtually all scenes should contain characters participating in humorous or comedic experiences. The comedy can be exclusively for the viewer, at the expense of the characters in the title, or be shared with them.",
            "History": "Primary focus is on real-life events of historical significance featuring real-life characters.",
            "Biography": "Primary focus is on the depiction of activities and personality of a real person or persons, for some or all of their lifetime. Events in their life may be reenacted, or described in a documentary style. If re-enacted, they should generally follow reasonably close to the factual record, within the limitations of dramatic necessity.",
            "Western": "Should contain numerous scenes and/or a narrative where the portrayal is similar to that of frontier life in the American West during 1600s to contemporary times.",
            "Crime": "Whether the protagonists or antagonists are criminals this should contain numerous consecutive and inter-related scenes of characters participating, aiding, abetting, and/or planning criminal behavior or experiences usually for an illicit goal.",
            "Thriller": "Should contain numerous sensational scenes or a narrative that is sensational or suspenseful.",
            "Adventure": "Should contain numerous consecutive and inter-related scenes of characters participating in hazardous or exciting experiences for a specific goal. Often include searches or expeditions for lost continents and exotic locales, characters embarking in treasure hunt or heroic journeys, travels, and quests for the unknown.",
            "Music": "Contains significant music-related elements while not actually being a Musical; this may mean a concert, or a story about a band (either fictional or documentary).",
            "Action": "Should contain numerous scenes where action is spectacular and usually destructive.",
            "Musical": "Should contain several scenes of characters bursting into song aimed at the viewer (this excludes songs performed for the enjoyment of other characters that may be viewing) while the rest of the time, usually but not exclusively, portraying a narrative that alludes to another Genre.",
            "Fantasy": "Should contain numerous consecutive scenes of characters portrayed to effect a magical and/or mystical narrative throughout the title. Usually has elements of magic, supernatural events, mythology, folklore, or exotic fantasy worlds.",
            "Film-Noir": "Typically features dark, brooding characters, corruption, detectives, and the seedy side of the big city. Almost always shot in black and white, American, and set in contemporary times (relative to shooting date).",
            "Mystery": "Should contain numerous inter-related scenes of one or more characters endeavoring to widen their knowledge of anything pertaining to themselves or others.",
            "Family": "Should be universally accepted viewing for a younger audience. e.g., aimed specifically for the education and/or entertainment of children or the entire family. Often features children or relates to them in the context of home and family.",
            "Animation": "Over 75% of the title's running time should have scenes that are wholly, or part-animated. Any form of animation is acceptable, e.g., hand-drawn, computer-generated, stop-motion, etc. Puppetry does not count as animation, unless a form of animation such as stop-motion is also applied.",
            "Sci-Fi": "Numerous scenes, and/or the entire background for the setting of the narrative, should be based on speculative scientific discoveries or developments, environmental changes, space travel, or life on other planets.",
            "Horror": "Should contain numerous consecutive scenes of characters effecting a terrifying and/or repugnant narrative throughout the title."
        };
        this.colors = ["#ffd700",
        "#74001b",
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
        "#1d632f",
        "#89a7be",
        "#b8fffe",
        "#ff91fd",
        "#ff00f2"]

        this.initVis();
    }

    initVis(){
        let vis = this;
        var headerHeight = document.getElementById('clusterHeader').clientHeight; 
		vis.margin = {top: 5, right: 5, bottom: 5, left: 72};	
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = window.innerHeight - vis.margin.top - vis.margin.bottom - headerHeight;
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
            .domain(Object.keys(vis.genres))
            .rangeRound([vis.margin.top, vis.height - vis.margin.bottom])
            .paddingInner(0.1);

        vis.color = d3.scaleOrdinal()
            .domain(Object.keys(vis.genres))
            .range(vis.colors);
        
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);
        
        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        // tooltip
        vis.svg.tooltip = d3.select("#clusterMovieInformation");

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
                    d3.selectAll(`text.genre-label.${this.__data__[0]}`)
                        .style("font-weight", "bold");
                    // Turn all other rects, labels, circles to light black
                    d3.selectAll(`text.genre-label:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    d3.selectAll(`rect:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    d3.selectAll(`circle.node:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    // increase stroke width of circles
                    d3.selectAll(`circle.${this.__data__[0]}`)
                        .style('stroke', 'black')
                        .style('stroke-width', '2px')
                    vis.svg.tooltip        
                        .html(`
                            <div style="display: flex; flex-direction: column; align-items: center; border: thin solid black; border-radius: 5px; background: #F1E5AC; padding: 7.5px; width: 100%; text-align: center;">
                                <h3><b>${this.__data__[0]}</b></h3>
                                <p>${vis.genres[this.__data__[0]]}</p>
                                <h5>${this.__data__[1].total} films</h5>
                                <h5>${this.__data__[1].winners} winners</h5>
                            </div>`);
                })
                .on("mouseout", function(event, d) {
                    // Reset the boldness of the hovered section
                    d3.selectAll(`rect.${this.__data__[0]}`)
                        .style('stroke-width', '0px')
                        .style("stroke", "none");

                    // Reset the colors and strokes of all rects and circles
                    d3.selectAll("text.genre-label")
                        .style("opacity", 1)
                        .style("font-weight", "normal");
                    d3.selectAll("rect")
                        .style("opacity", 1);
                    d3.selectAll("circle.node")
                        .style("opacity", 1)
                        .style('stroke-width', '0px')
                        .style("stroke", "none");

                    // Re-apply necessary styles to winner circles
                    d3.selectAll("circle.winner")
                        .style('stroke', "#000000")
                        .style('stroke-width', "1.5px");

                    // Reset the tooltip
                    vis.svg.tooltip
                        .html(`<h3><b>Hover/drag a bubble to display film information!</b></h3>
                            <h3><b>Hover over a bar to display genre stats!</b></h3>`);
                })

        // Draw the winners bar
        vis.svg.append("g")
            .selectAll("rect.winners")
            .data(sortedData)
            .join("rect")
                .attr("class", d => `${d[0]} winners`)
                .attr("fill", "#C79F27") // Use a different color for winners
                .attr("x", 0) // Start at the same x-coordinate as the total bar
                .attr("y", d => vis.y(d[0]))
                .attr("width", d => d[1].winners > 0 ? vis.x(d[1].winners) : 0) // Width based on winners count, 0 if winners are 0
                .attr("height", vis.y.bandwidth())
                .on("mouseover", function(event, d) {
                    // Highlight the hovered section
                    d3.selectAll(`rect.${this.__data__[0]}`)
                        .style('stroke-width', '2px')
                        .style("stroke", "#000000")
                    d3.selectAll(`text.genre-label.${this.__data__[0]}`)
                        .style("font-weight", "bold");
                    // Turn all other rects, labels, circles to light black
                    d3.selectAll(`text.genre-label:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    d3.selectAll(`rect:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    d3.selectAll(`circle.node:not(.${this.__data__[0]})`)
                        .style("opacity", 0.25);
                    // increase stroke width of circles
                    d3.selectAll(`circle.${this.__data__[0]}`)
                        .style('stroke', 'black')
                        .style('stroke-width', '2px')
                    vis.svg.tooltip
                        .html(`
                            <div style="display: flex; flex-direction: column; align-items: center; border: thin solid black; border-radius: 5px; background: #F1E5AC; padding: 7.5px; width: 100%; text-align: center;">
                                <h3><b>${this.__data__[0]}</b></h3>
                                <p>${vis.genres[this.__data__[0]]}</p>
                                <h5>${this.__data__[1].total} films</h5>
                                <h5>${this.__data__[1].winners} winners</h5>
                            </div>`);
                })
                .on("mouseout", function(event, d) {
                    // Reset the color of the hovered section
                    d3.selectAll(`rect.${this.__data__[0]}`)
                        .style('stroke-width', '0px')
                        .style("stroke", "none");

                    // Reset the colors and strokes of all rects and circles
                    d3.selectAll("text.genre-label")
                        .style("font-weight", "normal")
                        .style("opacity", 1);
                    d3.selectAll("rect")
                        .style("opacity", 1);
                    d3.selectAll("circle.node")
                        .style("opacity", 1)
                        .style('stroke-width', '0px')
                        .style("stroke", "none");

                    // Re-apply necessary styles to winner circles
                    d3.selectAll("circle.winner")
                        .style('stroke', "#000000")
                        .style('stroke-width', "1.5px");

                    // Reset the tooltip
                    vis.svg.tooltip
                        .html(`<h3><b>Hover/drag a bubble to display film information!</b></h3>
                            <h3><b>Hover over a bar to display genre stats!</b></h3>`);
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
                d3.selectAll(`text.genre-label.${d}`)
                    .style("font-weight", "bold");
                // Turn all other rects, labels, circles to light black
                d3.selectAll(`text.genre-label:not(.${d})`)
                    .style("opacity", 0.25);
                d3.selectAll(`rect:not(.${d})`)
                    .style("opacity", 0.25);
                d3.selectAll(`circle.node:not(.${d})`)
                    .style("opacity", 0.25);
                // increase stroke width of circles
                d3.selectAll(`circle.${d}`)
                    .style('stroke', 'black')
                    .style('stroke-width', '2px')
                vis.svg.tooltip
                    .html(
                        `<div style="display: flex; flex-direction: column; align-items: center; border: thin solid black; border-radius: 5px; background: #F1E5AC; padding: 7.5px; width: 100%; text-align: center;">
                        <h3><b>${d}</b></h3>
                        <p>${vis.genres[d]}</p>
                        <h5>${sortedData.find(item => item[0] === d)[1].total} films</h5>
                        <h5>${sortedData.find(item => item[0] === d)[1].winners} winners</h5>
                    </div>`);         
            })
            .on("mouseout", function(event, d) {
                // Reset the color of the hovered section
                d3.selectAll(`rect.${d}`)
                    .style('stroke-width', '0px')
                    .style("stroke", "none");

                // Reset the colors and strokes of all rects, text, and circles
                d3.selectAll("text.genre-label")
                    .style("font-weight", "normal")
                    .style("opacity", 1);
                d3.selectAll("rect")
                    .style("opacity", 1);
                d3.selectAll("circle.node")
                    .style("opacity", 1)
                    .style('stroke-width', '0px')
                    .style("stroke", "none");

                // Re-apply necessary styles to winner circles
                d3.selectAll("circle.winner")
                    .style('stroke', "#000000")
                    .style('stroke-width', "1.5px");

                // Reset the tooltip
                vis.svg.tooltip
                    .html(`
                    <h3><b>Hover/drag a bubble to display film information!</b></h3>
                    <h3><b>Hover over a bar to display genre stats!</b></h3>`);
            }); 
        
    }
}
