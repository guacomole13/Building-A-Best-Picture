// TO-DO: make interactive legend

class Hemisphere {

    constructor(_parentElement, _dataset, _largeBoolean) {
        
        this.parentElement = _parentElement;
        this.largeBoolean = _largeBoolean;
        // Store the initial key and data references
        this.data = _dataset
        // colors for visualizations
        this.colors = ["red", "orange", "yellow", "green", "blue", 
        "indigo", "violet", "pink", "teal",  "black", "brown", 
        "fuchsia", "greenyellow", "NavajoWhite", 
        "coral", "magenta", "blueviolet", "grey"]
        this.colorMapping = {
            "PeopleOfColor": "#8b4513",
            "White": "#e9967a",
            "Women": "#ee86b7",
            "Men": "#93dbf8"
        };                
        // method to help get id from array
        this.getID = (array) => array.map(item => item.id);

        // render vis
        this.initVis();
    }

    initVis() {
        // Method to initialize the visualization
        let vis = this;

        // svg dimensions setup
        var headerHeight = document.getElementById('hemisphere-header').clientHeight; 
		vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
		vis.width = vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = (vis.largeBoolean ? ((window.innerHeight - headerHeight)) - vis.margin.top - vis.margin.bottom : ((window.innerHeight - headerHeight)/2) - vis.margin.top - vis.margin.bottom);

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
            
        // Scale function assigns colors based on array for guild and mapping for others
        vis.scale = d3.scaleOrdinal()
            .domain(vis.getID(vis.data))
            .range(vis.getID(vis.data).map(id => vis.colorMapping[id] || vis.colors[vis.getID(vis.data).indexOf(id)]));

        // creates legend group
        vis.svg.append("g")
            .attr("class", vis.largeBoolean ? "hemisphereLegend large" : "hemisphereLegend small")
            .attr("transform", vis.largeBoolean ? `translate(${vis.width * 0.1},0)` : `translate(${vis.width * 0.39},${vis.height * 0.88})`);

       // renders proper legend text
        vis.legendOrdinal = d3.legendColor()
            .scale(vis.scale)
            .labels(vis.data.map(d => d.name));
    
        // renders legend
        vis.svg.select(".hemisphereLegend")
            .call(vis.legendOrdinal);

        // Parameters for two-column layout
        const legendItemHeight = 20; // Height of each legend item
        const rowSpacing = 4; // Space between rows
        const columnXPositions = [0, 280]; // X positions for the two columns, adjust as needed

        // Reposition legend items for two columns
        if (vis.largeBoolean) {
            vis.svg.select(".hemisphereLegend")
                .selectAll("g.cell")
                .attr("transform", function(d, i) {
                    const x = columnXPositions[i % 2]; // x position based on column
                    const y = Math.floor(i / 2) * (legendItemHeight + rowSpacing); // y position based on row
                    return `translate(${x}, ${y})`;
                });
        }

        // create tooltip
        vis.svg.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "hemisphereTooltip");

        // initialize parliament layout
        vis.parliament = d3.parliament().width(vis.largeBoolean ? vis.width : vis.width * 0.90).height(vis.largeBoolean ? vis.height : vis.height * 0.90).innerRadiusCoef(0.3);
        vis.parliament.enter.fromCenter(true).smallToBig(true);
        vis.parliament.exit.toCenter(false).bigToSmall(true);

        // call parliament layout
        vis.svg.datum(vis.data).call(vis.parliament);

        // moves parliament to center
        vis.svg.selectAll(".parliament")
            .attr("transform", `translate(${vis.width * 0.5},${vis.height})`);

        // event listeners for tooltip
        vis.parliament.on("mouseover", function(event, d) {
            // Highlight the hovered section
            d3.selectAll(`circle.${this.__data__.party.id}`)
                .style('stroke-width', '0.5px')
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
    }
}

