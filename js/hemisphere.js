class Hemisphere {

    constructor(_parentElement, _initialKey, _datasets) {
        this.parentElement = _parentElement;
        // Store the initial key and data references
        this.key = _initialKey;
        this.datasets = _datasets;
        this.data = this.getDataByKey(this.key);

        //render vis
        this.initVis();
    }

    // updates data based on dropdown menu
    getDataByKey(key) {
        // Return the dataset associated with the current key or empty array
        return this.datasets[key] || []; 
    }

    initVis() {
        // Method to initialize the visualization
        let vis = this;

        // svg dimensions
		vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };
		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = 800 - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // initialize parliament layout
        vis.parliament = d3.parliament().width(850).height(500).innerRadiusCoef(0.4);
        vis.parliament.enter.fromCenter(true).smallToBig(true);
        vis.parliament.exit.toCenter(false).bigToSmall(true);

        // call parliament layout
        vis.svg.datum(vis.getDataByKey(vis.key)).call(vis.parliament);

        vis.svg.selectAll(".parliament")
            .attr("transform", `translate(${vis.width * 0.75},${vis.height * 0.75})`);
        
        // helpers to get ID and legend
        vis.getID = (array) => array.map(item => item.id);

        // colors for visualization
        vis.colors = ["red", "orange", "yellow", "green", "blue", 
        "indigo", "violet", "pink", "teal",  "black", "brown", 
        "fuchsia", "greenyellow", "NavajoWhite", 
        "coral", "magenta", "blueviolet", "grey"]
        
        // create legend

        // generates scale
        vis.scale = d3.scaleOrdinal()
            .domain(vis.getID(vis.data))
            .range(vis.colors)

        // creates legend group
        vis.svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(0,20)");

       // renders proper legend text
        vis.legendOrdinal = d3.legendColor()
            .scale(vis.scale)
            .labels(vis.data.map(d => d.legend));

        // calls & renders legend
        vis.svg.select(".legendOrdinal")
            .call(vis.legendOrdinal);
            
        vis.updateVis();
    }

    updateVis() {
        // Method to update the visualization
        let vis = this;
        let currentData = vis.getDataByKey(vis.key);
        
        // update data based on selection
        vis.svg.datum(currentData).call(vis.parliament);

        // Update legend
        vis.scale.domain(vis.getID(currentData))
            .range(vis.colors.slice(0, currentData.length));
        vis.legendOrdinal.labels(currentData.map(d => d.legend));
        
        vis.svg.select(".legendOrdinal").call(vis.legendOrdinal);

        setTimeout(() => {
            // Select all the circle elements and update fill
            vis.svg.selectAll("circle.seat")
                // .attr("class", function() {
                //     // Get the current circle's class (which contains its 'id')
                //     let currentClass = d3.select(this).attr("class");
                //     let currentId = currentClass.split(" ")[1]; // Assuming 'seat Actors' format
                //     // Return the updated class
                //     return `seat ${currentId}`;
                // })
                .transition()
                .duration(500)
                .style("fill", function() {
                    // Get the current circle's class to find the 'id'
                    let currentClass = d3.select(this).attr("class");
                    let currentId = currentClass.split(" ")[1]; // Assuming 'seat Actors' format
                    // Return the color based on the 'id'
                    return vis.scale(currentId);
                });
        }, 0);

        // TO-DO: Highlight all circles in a group on hover
    }
}