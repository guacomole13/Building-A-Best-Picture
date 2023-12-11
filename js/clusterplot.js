class ClusterPlot {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];
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

    initVis() {
        let vis = this;
        // svg dimension
        var headerHeight = document.getElementById('clusterHeader').clientHeight; 
		vis.margin = { top: 5, right: 5, bottom: 15, left: 5 };
		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = window.innerHeight - vis.margin.top - vis.margin.bottom - headerHeight;
        vis.padding = 1.5; // separation b/w same color circles
        vis.clusterPadding = 45; // separation b/w diff color circles
        vis.constantRadius = vis.width*0.01; // size of circles

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // tooltip
        vis.svg.tooltip = d3.select("#clusterMovieInformation")

        // color scale
        vis.scale = d3.scaleOrdinal()
            .range(vis.colors);

        // create legend group (need to update with genres later)
        vis.svg.legend = vis.svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", `translate(${vis.width * 0.1}, ${vis.height * 0.9})`);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        // simplifies data into properties 
        vis.displayData = vis.data.map((d, index) => {
            return {
                MovieId: index,
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

        // Grouping movies by each of their genres
        vis.moviesByGenre = new Map();
        vis.displayData.forEach(movie => {
            movie.Genre.forEach(genre => {
                if (!vis.moviesByGenre.has(genre)) {
                    vis.moviesByGenre.set(genre, []);
                }
                vis.moviesByGenre.get(genre).push(movie);
            });
        });

        // Forming the structured data with genre names as keys
        vis.groupedData = Array.from(vis.moviesByGenre, ([genre, movies]) => ({ [genre]: movies }));

        // create list of unique genres for domain
        let allGenres = vis.groupedData.map(genreObject => Object.keys(genreObject)[0]);
        vis.uniqueGenres = [...new Set(allGenres)];

        // Flattening the data so each movie is represented with a movie-genre pair
        vis.flattenedNodes = [];
        vis.groupedData.forEach(genreGroup => {
            let genre = Object.keys(genreGroup)[0]; // get genre name
            genreGroup[genre].forEach(movie => {
                vis.flattenedNodes.push({...movie, currentGenre: genre}) // get genre within this group
            });
        });

        // Example of initializing node positions based on group
        vis.flattenedNodes.forEach(node => {
            // Position nodes based on their group
            // This is a simplistic example; you might need a more complex positioning logic
            let groupIndex = vis.uniqueGenres.indexOf(node.currentGenre);
            node.x = groupIndex * 125; // Spacing nodes out based on their group
            node.y = groupIndex * 125;
        });

        /// Define the pack layout
        vis.pack = d3.pack()
            .size([vis.width * 0.6, vis.height * 0.85])
            .padding(1);

        // Create hierarchical data
        vis.root = d3.hierarchy({ children: vis.flattenedNodes })
            .sum(d => d.radius);  

        // Apply the pack layout to the hierarchical data
        vis.pack(vis.root);

        // Extract the leaves
        vis.nodes = vis.root.leaves();

        vis.updateVis();
    }

    forceCluster(nodes) {
        let vis = this;
        const strength = 1.75;
      
        function force(alpha) {
          const centroids = d3.rollup(nodes, vis.centroid, d => d.data.currentGenre);
          const l = alpha * strength;
          for (const d of nodes) {
            const {x: cx, y: cy} = centroids.get(d.data.currentGenre);
            d.vx -= (d.x - cx) * l * 0.5;
            d.vy -= (d.y - cy) * l;
          }
        }
      
        force.initialize = _ => nodes = _;

        // calculates centers of clusters
        vis.centers = new Map();
        vis.uniqueGenres.forEach(genre => {
            let genreNodes = vis.nodes.filter(d => d.data.currentGenre === genre);
            let x = d3.mean(genreNodes, d => d.x);
            let y = d3.mean(genreNodes, d => d.y);
            vis.centers.set(genre, {x: x, y: y});
        });
      
        return force;
    }

    forceCollide(nodes) {
        const alpha = 0.4; // fixed for greater rigidity!
        const padding1 = 0.3; // separation between same-color nodes
        const padding2 = 4.75; // separation between different-color nodes
        let maxRadius;
      
        function force() {
          const quadtree = d3.quadtree(nodes, d => d.x, d => d.y);
          for (const d of nodes) {
            const r = d.r + maxRadius;
            const nx1 = d.x - r, ny1 = d.y - r;
            const nx2 = d.x + r, ny2 = d.y + r;
            quadtree.visit((q, x1, y1, x2, y2) => {
              if (!q.length) do {
                if (q.data !== d) {
                  const r = d.r + q.data.r + (d.data.currentGenre === q.data.currentGenre ? padding1 : padding2);
                  let x = d.x - q.data.x, y = d.y - q.data.y, l = Math.hypot(x, y);
                  if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l, d.y -= y *= l;
                    q.data.x += x, q.data.y += y;
                  }
                }
              } while (q = q.next);
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
          }
        }
      
        force.initialize = _ => maxRadius = d3.max(nodes = _, d => d.r) + Math.max(padding1, padding2);
      
        return force;
    }

    centroid(nodes) {
        let x = 0;
        let y = 0;
        let z = 0;
        for (const d of nodes) {
          let k = d.r ** 2;
          x += d.x * k;
          y += d.y * k;
          z += k;
        }
        return {x: x / z, y: y / z};
    }

    updateVis() {
        let vis = this;

        vis.scale.domain(vis.uniqueGenres);

        const simulation = d3.forceSimulation(vis.nodes)
            .force("x", d3.forceX((vis.width + vis.margin.left) * 0.25).strength(0.04))
            .force("y", d3.forceY((vis.height + vis.margin.top) * 0.25).strength(0.09))
            .force("cluster", vis.forceCluster(vis.nodes))
            .force("collide", vis.forceCollide(vis.nodes))
            .force("center", d3.forceCenter(vis.width/2, vis.height/2).strength(0.015));

        const drag = simulation => {
  
                function dragstarted(event, d) {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
                
                function dragged(event, d) {
                    // Update the fixed position of the dragged node
                    d.fx = event.x;
                    d.fy = event.y;

                    // Calculate the delta (change) in x and y
                    let dx = event.x - d.x;
                    let dy = event.y - d.y;

                    // Update the position of all other nodes based on the delta, maintaining their relative positions
                    vis.nodes.forEach(node => {
                        if (node !== d) {
                            node.x += dx;
                            node.y += dy;
                        }
                    });
                }                
                
                function dragended(event, d) {
                  if (!event.active) simulation.alphaTarget(0);
                  d.fx = null;
                  d.fy = null;
                }
                
                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);
            }    

        vis.node = vis.svg.append('g')
            .selectAll('.circle')
            .data(vis.nodes)
            .join("circle")
            .attr("class", (d) => `node ${d.data.currentGenre} ${d.data.Winner ? 'winner' : ''}`)
            .attr("id", (d) => `movie_${d.data.MovieId}`)
            .attr("r", d => d.r)
            .style('fill', (d) => vis.scale(d.data.currentGenre))
            .style('stroke', (d) => d.data.Winner ? '#000000' : 'none')
            .style('stroke-width', (d) => d.data.Winner ? '1.5px' : '0px')
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .on("mouseover", function(event, d) {
                // moves to front
                d3.selectAll(`#movie_${d.data.MovieId}`).raise();
                // change colors
                d3.selectAll(`#movie_${d.data.MovieId}`)
                    .attr("r", 15)
                    .style('stroke-width', '2px')
                    .style("stroke", "#000000")
                    .style("fill", "#C79F27");
                // select related bars
                d3.selectAll("rect, text.genre-label")
                    .style("opacity", 0.25)
                    .classed("active", false);
                d.data.Genre.forEach(genre => {
                    d3.selectAll(`rect.${genre}`)
                        .style("stroke", "#000000")
                        .style('stroke-width', '2px')
                        .style("opacity", 1);
            
                    d3.selectAll(`text.genre-label.${genre}`)
                        .classed("active", true) // Add bold class
                        .style("opacity", 1);
                });
                vis.svg.tooltip
                    .html(`
                    <div style="display: flex; flex-direction: column; align-items: center; border: thin solid black; border-radius: 5px; background: ${d.data.Winner ? 'linear-gradient(#c5b358, #FCF6BA, #d4af37, #FBF5B7)' : '#841b2d'}; padding: 7.5px;">    
                        ${d.data.Winner ? '<h3 style="text-align: center; color: red; font-size: 2.5rem; margin-bottom: 0rem;">WINNER</h3>' : ''}
                        <img src="${d.data.Poster}" style="max-width: 250px; max-height: 250px; object-fit: contain; margin-bottom: 10px;"></img>
                        <div style="text-align: center; ${d.data.Winner ? '' : 'color: white;'}">
                            <h3><b>${d.data.Title} (${d.data.Year})</b></h3>
                            <h4>Genres: ${d.data.Genre.join(', ')}</h4>
                            <h5>Director: ${d.data.Director}</h6>
                            <p>Plot: ${d.data.Plot}</p>
                        </div>
                    </div>`)
            })
            .on("click", function (event, d) {
                console.log("I clicked" + d.data)
            })
            .on("mouseout", function(event, d) {
                d3.selectAll(`#movie_${d.data.MovieId}`)
                    .transition()  
                    .duration(350)  
                    .attr("r", d.r)  
                    .style('stroke', (d) => d.data.Winner ? '#000000' : 'none')
                    .style('stroke-width', (d) => d.data.Winner ? '1.5px' : '0px')
                    .style("fill", (d) => vis.scale(d.data.currentGenre));
                // Reset the styles for all rectangles and texts
                d3.selectAll("rect, text")
                    .style("stroke", "none") 
                    .style('stroke-width', '1px') 
                    .style("font-weight", "normal") 
                    .classed("active", false)
                    .style("opacity", 1); 
                vis.svg.tooltip
                    .html(`
                    <h3><b>Each nominee or winner has a bubble for each of its genres.</b></h3>
                    <h3><b>Hover/drag a bubble to display a film's information!</b></h3>
                    <h3><b>Hover over a bar to display a genre's stats!</b></h3>`);
            })
            .call(drag(simulation));        

        vis.node.transition()
            .delay((d, i) => Math.random() * 350)
            .duration(350)
            .attrTween("r", d => {
                const i = d3.interpolate(0, d.r);
                return t => d.r = i(t);
            });
        
        simulation.on("tick", () => {
            vis.node
                .attr("cx", d => Math.max(d.r + vis.clusterPadding, Math.min(vis.width - (d.r + vis.clusterPadding), d.x)))
                .attr("cy", d => Math.max(d.r + vis.clusterPadding, Math.min(vis.height - (d.r + vis.clusterPadding), d.y)));
        });

        // renders legend 
        vis.svg.legend
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 4.635863675090555)
            .style("fill", "#FFFFFF")
            .style("stroke-width", "0.5px")
            .style("stroke", "#000000");

        vis.svg.legend
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 25)
            .attr("r", 8.029551422219816)
            .attr("class", "legendCircle winner")
            .style("fill", "#FFFFFF")
            .style("stroke-width", "1.5px")
            .style("stroke", "#000000");

        vis.svg.legend
            .append("text")
            .attr("x", 15)
            .attr("y", 1.5)
            .attr("class", "legendText")
            .text("Nominee")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle");

        vis.svg.legend
            .append("text")
            .attr("x", 15)
            .attr("y", 27)
            .attr("class", "legendText")
            .text("Winner")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle");                          
    }
}