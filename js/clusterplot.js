class ClusterPlot {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
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
		vis.margin = { top: 60, right: 40, bottom: 60, left: 80 };
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

        console.log(vis.moviesbyGenre);
        console.log(vis.groupedData);
        console.log(vis.flattenedNodes);

        /// Define the pack layout
        vis.pack = d3.pack()
            .size([vis.width, vis.height])
            .padding(1);

        // Create hierarchical data
        let root = d3.hierarchy({ children: vis.flattenedNodes })
            .sum(d => d.radius);  

        // Apply the pack layout to the hierarchical data
        vis.pack(root);

        // Extract the leaves
        vis.nodes = root.leaves();
        console.log(vis.nodes);

        vis.updateVis();
    }

    forceCluster(nodes) {
        let vis = this;
        const strength = 2;
      
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
        const padding1 = 0.5; // separation between same-color nodes
        const padding2 = 4; // separation between different-color nodes
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

    forceBoundingCircle(nodes) {
        let vis = this;
        let radius = 150; // Radius of the bounding circle
        function force(alpha) {
            for (let node of nodes) {
                let center = vis.centers.get(node.data.currentGenre);
                let dx = node.x - center.x;
                let dy = node.y - center.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let strength = alpha * 0.1;
    
                if (distance > radius) {
                    node.vx -= dx / distance * strength;
                    node.vy -= dy / distance * strength;
                }
            }
        }
    
        force.initialize = function(_) {
            nodes = _;
        };
    
        return force;
    }

    updateVis() {
        let vis = this;

        console.log(vis.uniqueGenres);
        vis.scale.domain(vis.uniqueGenres);

        const simulation = d3.forceSimulation(vis.nodes)
            .force("x", d3.forceX((vis.width + vis.margin.left) / 2).strength(0.01))
            .force("y", d3.forceY((vis.height + vis.margin.top) / 2).strength(0.07))
            .force("cluster", vis.forceCluster(vis.nodes))
            .force("collide", vis.forceCollide(vis.nodes))
            .force("bounding", vis.forceBoundingCircle(vis.nodes));

        const drag = simulation => {
  
                function dragstarted(event, d) {
                  if (!event.active) simulation.alphaTarget(0.3).restart();
                  d.fx = d.x;
                  d.fy = d.y;
                }
                
                function dragged(event, d) {
                  d.fx = event.x;
                  d.fy = event.y;
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
            .attr("class", "node")
            .attr("id", (d) => `movie_${d.data.MovieId}`)
            .attr('r', (d) => d.radius)
            .attr('fill', (d) => vis.scale(d.data.currentGenre))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .call(drag(simulation));        
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

        vis.node.transition()
            .delay((d, i) => Math.random() * 500)
            .duration(500)
            .attrTween("r", d => {
                const i = d3.interpolate(0, d.r);
                return t => d.r = i(t);
            });
        
        
        simulation.on("tick", () => {
            vis.node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        });

        //invalidation.then(() => simulation.stop());

        console.log("updateVis");
    }
}
