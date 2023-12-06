// TO-DO:, rearrange, each dot corresponds to a voter, title

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

        // colors for guild visualization
        vis.colors = ["red", "orange", "yellow", "green", "blue", 
        "indigo", "violet", "pink", "teal",  "black", "brown", 
        "fuchsia", "greenyellow", "NavajoWhite", 
        "coral", "magenta", "blueviolet", "grey"]
        
        // colors for other visualizations
        let colorMapping = {
            "People of Color": "brown",
            "White": "white",
            "Women": " ee86b7",
            "Men": "#93dbf8"
        };
        
        // Scale function assigns colors based on array for guild and mapping for others
        vis.scale = d3.scaleOrdinal()
            .domain(vis.getID(vis.data))
            .range(vis.getID(vis.data).map(id => colorMapping[id] || vis.colors[vis.getID(vis.data).indexOf(id)]));

        // creates legend group
        vis.svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(0,20)");

       // renders proper legend text
        vis.legendOrdinal = d3.legendColor()
            .scale(vis.scale)
            .labels(vis.data.map(d => d.name));

        // create tooltip
        vis.svg.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "hemisphereTooltip");

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
        
        // event listeners
        vis.parliament.on("mouseover", function(event, d) {
            // Highlight the hovered section
            console.log(this.__data__)
            d3.selectAll(`circle.${this.__data__.party.id}`)
                .style('stroke-width', '2px')
                .style("stroke", "#000000")
                .style("fill", "#FFD700");
            // Turn all other circles to light grey
            d3.selectAll(`circle:not(.${this.__data__.party.id})`)
                .style("opacity", 0.5);
            vis.svg.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                    <div style="border: thin solid grey; border-radius: 5px; background: #F1E5AC; padding: 7.5px">
                        <h5>${this.__data__.party.name} - ${d3.format(".0%")(this.__data__.party.seats / 9579)}</h5>
                        <p>${this.__data__.party.seats} out of 9579 seats</p>
                        ${this.__data__.party.legend ? `<p>${this.__data__.party.legend}</p>` : ''}
                    </div>`);
        });
        vis.parliament.on("mouseout", function(event, d) {
            // Reset the color of the hovered section
            d3.selectAll(`circle.${this.__data__.party.id}`)
                .style('stroke-width', '0px')
                .style("stroke", "none")
                .style("fill", vis.scale(this.__data__.party.id));
            // Reset the color of all other circles
            d3.selectAll(`circle:not(.${this.__data__.party.id})`)
                .style("opacity", 1);
            vis.svg.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        });

        // Update legend
        vis.scale.domain(vis.getID(currentData))
            .range(vis.colors.slice(0, currentData.length));
        vis.legendOrdinal.labels(currentData.map(d => d.name));
        
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
                .duration(400)
                .style("fill", function() {
                    // Get the current circle's class to find the 'id'
                    let currentClass = d3.select(this).attr("class");
                    let currentId = currentClass.split(" ")[1]; // Assuming 'seat Actors' format
                    // Return the color based on the 'id'
                    return vis.scale(currentId);
                })
                .style("stroke-width", "0px")
                // .on("mouseout", function(event,d){
                //     // resets bar and map
                //     d3.select(`#bar-${d.properties.name.replace(/\s/g, '-')}`)
                //         .attr('stroke-width', '0px')
                //         .attr("stroke", "#818589")
                //         .style("fill", "#96DED1");
                //     d3.select(this)
                //         .attr('stroke-width', '1px')
                //         .attr("stroke", "#818589")
                //         .style("fill", "#E5E4E2");
                //     mapObject.tooltip
                //         .style("opacity", 0)
                //         .style("left", 0)
                //         .style("top", 0)
                //         .html(``);
        }, 0);
    }
}

