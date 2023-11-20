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
		vis.height = 800 - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.getIds = (array) => array.map(item => item.id);
        vis.colors = ["#cccccc", "#f0ede5", "#849eaf", "#d9c193", "#232323",
        "#444444", "#7a52ad", "#352557", "#876c56", "#d7b498", "#6e4747", "#3a2b2b",
        "#b0251a", "#e77b25", "#ff8d08", "#ffd400", "#93252a", "#076767"]
        
        // create legend
        vis.scale = d3.scaleOrdinal()
            .domain(vis.getIds(vis.data))
            .range(vis.colors)

        vis.svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(0,20)");

        vis.legendOrdinal = d3.legendColor()
            .scale(vis.scale);
            
        vis.svg.select(".legendOrdinal")
            .call(vis.legendOrdinal);
        
          
        vis.wrangleData();
    }

    wrangleData() {
        // Method to wrangle the data
        let vis = this;

        // TO DO *****
        // turns display data into whatever is selected by the menu
        vis.displayData = vis.data;

        console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        // Method to update the visualization
        let vis = this;

        /* set up the parliament */
        var parliament = d3.parliament();
        parliament.width(850).height(500).innerRadiusCoef(0.4);
        parliament.enter.fromCenter(true).smallToBig(true);
        parliament.exit.toCenter(false).bigToSmall(true);

        /* register event listeners */
        // parliament.on("click", function(d) { alert("You clicked on a seat of " + d ); });
        // parliament.on("mouseover", function(d) { console.log("mouse on " + d ); });
        // parliament.on("mouseout", function(d) { console.log("mouse out of " + d ); });

        console.log("before")

        /* add the parliament to the page */
        
        vis.svg.datum(vis.displayData).call(parliament);
        vis.svg.selectAll(".parliament")
            .attr("transform", `translate(${vis.width * 0.6},${vis.height*0.66})`);

        console.log(vis.scale.domain())

        // create a loop to color all
        vis.scale.domain().forEach((element, index) => {
            vis.svg.selectAll("." + element).style("fill", vis.scale.range()[index])            
        });

        console.log("after");
    }
}