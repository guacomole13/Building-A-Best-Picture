class ClusterPlot {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data

        this.initVis()
    }

    initVis() {
        let vis = this;
        console.log("initVis");
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        console.log("wrangleData");
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        console.log("updateVis");
    }
}
