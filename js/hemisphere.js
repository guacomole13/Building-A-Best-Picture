class Hemisphere {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;

        this.initVis();
    }

    initVis() {
        // Method to initialize the visualization
        let vis = this;

		vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = 300 - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.wrangleData();
    }

    wrangleData() {
        // Method to wrangle the data
        let vis = this;
        console.log("data wrangled");
        console.log(PERCENT_FEMALE_2021);

        vis.updateVis();
    }

    updateVis() {
        // Method to update the visualization
        let vis = this;
        console.log(vis.data);

        /* set up the parliament */
        var parliament = d3.parliament();
        parliament.width(500).height(500).innerRadiusCoef(0.4);
        parliament.enter.fromCenter(true).smallToBig(true);
        parliament.exit.toCenter(false).bigToSmall(true);

        /* register event listeners */
        parliament.on("click", function(d) { alert("You clicked on a seat of " + d.party.name); });
        parliament.on("mouseover", function(d) { console.log("mouse on " + d.party.name); });
        parliament.on("mouseout", function(d) { console.log("mouse out of " + d.party.name); });

        console.log("before")

        /* add the parliament to the page */
        
        vis.svg.datum(vis.data).call(parliament);

        console.log("data updated");
    }
}