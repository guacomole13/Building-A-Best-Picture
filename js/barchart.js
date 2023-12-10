class BarChart {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];
        this.colors = ["#ffd700", "#1d632f", "#ffb14e", "#ea5f94", 
        "#fa8775", "#cd34b5", "#9d02d7", "#0000ff", "#df2020", 
        "#b67c58", "#ff00f2", "#3cd42f", "#35e2d9", "#89a7be", 
        "#1096ff", "#bb8ff3", "#ff91fd", "#b9ff77", 
        "#071c54", "#74001b", "#c0c918", "#b8fffe"]

        this.initVis();
    }

    initVis(){
        let vis = this;

		vis.margin = {top: 5, right: 5, bottom: 5, left: 5};	
        vis.width = document.getElementById(vis.parentElement+"-dims").getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement+"-dims").getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Academy Award Movies by Genre")
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // scales and axes
		vis.x = d3.scaleLinear()
        .range([vis.margin.left, vis.width - vis.margin.right]);
    
        vis.y = d3.scaleBand()
            .rangeRound([vis.margin.top, vis.height - vis.margin.bottom])
            .paddingInner(0.1);
        
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);
        
        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        // (Filter, aggregate, modify data)
        vis.wrangleData();

    }

    wrangleData(){

    }

    updateVis(){

    }

}