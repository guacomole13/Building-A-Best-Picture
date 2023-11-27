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
        vis.constantRadius = vis.height*0.01; // size of circles

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
            vis.uniqueGenres = uniqueGenres;
            let indexedGenres = {}
            uniqueGenres.forEach((genre, index) => {
                indexedGenres[genre] = index + 1;
            });
            
            return indexedGenres;
        }
        
        vis.indexedGenres = getGenreIndex(vis.displayData);

        // assigns clusters and random x, y starting points  
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

        // updates clusters array to keep track of largest node(s) in each cluster
        vis.displayData.forEach(node => {
            if (!vis.clusters[node.cluster] || node.radius > vis.clusters[node.cluster].radius) {
                vis.clusters[node.cluster] = node;
            }
            node.x = Math.random() * vis.width;
            node.y = Math.random() * vis.height;
        });

        console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        console.log(vis.uniqueGenres);
        vis.scale.domain(vis.uniqueGenres);

        vis.circles = vis.svg.append('g')
            .datum(vis.displayData)
            .selectAll('.circle')
            .data(d => d)
            .enter().append('circle')
            .attr('r', (d) => d.radius)
            .attr('fill', (d) => vis.scale(d.cluster))
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
        // // add tooltips to each circle
        // .on("mouseover", function(d) {
        //     div.transition()    
        //         .duration(200)    
        //         .style("opacity", .9);    
        //     div.html("Director:" + d.Director + "</br>" + "Genre:" + d.Genre)  
        //         .style("left", (d3.event.pageX) + "px")   
        //         .style("top", (d3.event.pageY - 28) + "px");  
        //     })          
        // .on("mouseout", function(d) {   
        //     div.transition()    
        //         .duration(500)    
        //         .style("opacity", 0); 
        // });

         // create the clustering/collision force simulation
        vis.simulation = d3.forceSimulation(vis.displayData)
            .velocityDecay(0.2)
            .force("x", d3.forceX(vis.width / 2).strength(0.05))
            .force("y", d3.forceY(vis.height / 2).strength(0.05))
            .force("collide", d3.forceCollide().radius((d) => d.radius + vis.padding).iterations(2))
            .force("charge", d3.forceManyBody().strength(-30))
            .on("tick", ticked);

        function ticked() {
            vis.circles
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y);
        }

        // Drag functions used for interactivity
        function dragstarted(d) {
            if (!d3.event.active) vis.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) vis.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // These are implementations of the custom forces.
        function clustering(alpha) {
            vis.displayData.forEach(function(d) {
                var cluster = vis.clusters[d.cluster];
                if (cluster === d) return;
                var x = d.x - cluster.x,
                    y = d.y - cluster.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + cluster.radius;
                if (l !== r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    cluster.x += x;
                    cluster.y += y;
                }
            });
        }

        function collide(alpha) {
            var quadtree = d3.quadtree()
                .x((d) => d.x)
                .y((d) => d.y)
                .addAll(vis.displayData);

            vis.displayData.forEach(function(d) {
                var r = d.radius + vis.constantRadius + Math.max(vis.padding, vis.clusterPadding),
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function(quad, x1, y1, x2, y2) {

                    if (quad.data && (quad.data !== d)) {
                        var x = d.x - quad.data.x,
                            y = d.y - quad.data.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.radius + quad.data.r + (d.cluster === quad.data.cluster ? vis.padding : vis.clusterPadding);
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.data.x += x;
                            quad.data.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            });
        }

        console.log("updateVis");
    }
}
