class ClusterPlot {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.clusters = [];
        this.displayData = [];
        this.colors = ["#ffd700", "#ffb14e", "#ea5f94", "#fa8775",
        "#cd34b5", "#9d02d7", "#0000ff", "#df2020", "#b67c58",
        "#3cd42f", "#35e2d9", "#89a7be", "#1096ff", "#bb8ff3",
        "#ff91fd", "#c8fa96", "#175676", "#74001b", "#fbf5af",
        "#b8fffe", "#ff00f2"]

        this.initVis();
    }

    initVis() {
        let vis = this;
        console.log("initVis");

        // svg dimensions
		vis.margin = { top: 40, right: 40, bottom: 60, left: 60 };
		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = 600 - vis.margin.top - vis.margin.bottom;
        vis.padding = 1.5; // separation b/w same color circles
        vis.clusterPadding = 30; // separation b/w diff color circles
        vis.constantRadius = vis.height*0.1; // size of circles

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        console.log(vis.data);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'cluster-title')
            .append('text')
            .text('Oscar-Nominated Films by Genre')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // TO-DO - tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "clusterTooltip")

        // TO-DO - color scale
        vis.scale = d3.scaleOrdinal()
            .range(vis.colors);

        // create legend group (need to update with genres later)
        vis.legend = vis.svg.append("g")
            .attr('class', 'legendOrdinal')
            .attr('transform', `translate(${vis.width * 2.5 / 4}, ${vis.height*0.9})`)

        // draw initial cluster of dots - ???

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        // simplifies data into properties that will be used for tooltip and clusters 
        vis.displayData = vis.data.map(d => {
            return {
                Title: d.Title,
                Year: d.Year,
                Winner: d.winner,
                Genre: d.Genre.split(', '),
                Director: d.Director,
                Plot: d.Plot,
                Poster: d.Poster,
                radius: d.winner === true ? vis.constantRadius * 3 : vis.constantRadius // triples size of the radius if a winner
            };
        });

        // returns object with indexed, unique genres
        function getGenreIndex (data) {
            let allGenres = [];
            data.forEach(d => {
                allGenres.push(...d.Genre);
            });
            let uniqueGenres = [...new Set(allGenres)];
            let indexedGenres = {}
            uniqueGenres.forEach((genre, index) => {
                indexedGenres[genre] = index + 1;
            });
            
            return indexedGenres;
        }
        
        vis.indexedGenres = getGenreIndex(vis.displayData);

        // assigns clusters
        vis.displayData.forEach(d => {
            if (d.Genre.length > 0) {
                // Find the first genre in the indexedGenres mapping
                var genreClusterId = vis.indexedGenres[d.Genre[0]];
                // If the genre is found in the mapping, assign the corresponding cluster ID
                if (genreClusterId !== undefined) {
                    d.cluster = genreClusterId;
                }
            }
        });

        console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.scale.domain(vis.uniqueGenres);

        vis.force = d3.layout.force()
            .nodes(vis.displayData)
            .size([vis.width, vis.width])
            .gravity(.02)
            .charge(0)
            .on("tick", tick)
            .start();

        vis.circles = vis.svg.append('g')
            .datum(vis.displayData)
            .enter()
            .append("circle")
            .attr("r", (d) => d.radius)
            .style("fill", (d) => vis.scale(d.genre))
            .call(vis.force.drag);

        function tick(e) {
            circle
                .each(cluster(10 * e.alpha * e.alpha))
                .each(collide(.5))
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
        }

        // move d to be adjacent to cluster node

        console.log("updateVis");
    }
}
