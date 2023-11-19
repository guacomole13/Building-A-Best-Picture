class Hemisphere {

    constructor(_parentElement) {
        this.parentElement = _parentElement;

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
        console.log("data updated");
    }
}