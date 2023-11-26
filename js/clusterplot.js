class ClusterPlot {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];

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
        vis.radius = vis.height*0.1; // size of circles

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
                Poster: d.Poster
            };
        });

        function getUniqueGenres(data) {
            let allGenres = [];
            data.forEach(d => {
                allGenres.push(...d.Genre);
            });
            let uniqueGenres = [...new Set(allGenres)];
            return uniqueGenres;
        }
        
        let uniqueGenres = getUniqueGenres(vis.displayData);
        console.log(uniqueGenres);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        console.log("updateVis");
    }
}
