class StudioBubbles {
    constructor(_parentElement, data) {
        this.parentElement = _parentElement;
        this.data = data;

        this.initVis();
    }

    // initVis() {
    //     let vis = this;
    //
    //     // Set up SVG and layout
    //     vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width;
    //     vis.height = 500;
    //
    //     vis.svg = d3.select("#" + vis.parentElement).append("svg")
    //         .attr("width", vis.width)
    //         .attr("height", vis.height);
    //
    //     // Set up force simulation
    //     vis.simulation = d3.forceSimulation()
    //         .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
    //         .force("charge", d3.forceManyBody().strength(5))
    //         .force("collide", d3.forceCollide().radius(10))
    //         .force("x", d3.forceX().strength(0.1).x(vis.width / 2))
    //         .force("y", d3.forceY().strength(0.1).y(vis.height / 2))
    //         .on("tick", () => vis.updateVis());
    //
    //     vis.wrangleData();
    // }
    initVis() {
        let vis = this;

        // Set up SVG and layout
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width;
        vis.height = 500;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // Set up force simulation
        // vis.simulation = d3.forceSimulation()
        //     .on("tick", () => vis.updateVis());
        vis.simulation = d3.forceSimulation()
            .force("collide", d3.forceCollide().radius(2))  // Adjust the collide force radius
            .on("tick", () => vis.updateVis());

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Calculate the total number of films for each studio
        vis.studioCounts = d3.rollup(
            vis.data,
            v => d3.sum(v, d => 1),
            d => d.distributor
        );

        // Sort the studios based on the total number of films
        vis.sortedStudios = Array.from(vis.studioCounts, ([studio, count]) => ({ studio, count }))
            .sort((a, b) => b.count - a.count)
            .map(d => d.studio);

        // Identify the top 5 studios
        vis.topStudios = vis.sortedStudios.slice(0, 5);

        // Add "Other" category
        vis.otherStudios = vis.sortedStudios.slice(5);
        vis.topStudios.push("Other");

        // Filter the data for the top 5 studios and "Other"
        vis.filteredData = vis.data.filter(d => vis.topStudios.includes(d.distributor) || vis.otherStudios.includes(d.distributor));

        vis.nodes = [];
        let clusterId = 0;



        vis.topStudios.forEach((studio, index) => {
            vis.studioData = vis.filteredData.filter(d => d.distributor === studio);
            vis.studioData.forEach((film, i) => {
                vis.nodes.push({
                    id: clusterId + i,
                    studio: studio,
                    film: film,
                    radius: 3,
                    x: vis.width / (vis.topStudios.length + 1) * (index + 1),
                    y: vis.height / 2
                });
            });
            clusterId += vis.studioData.length;
        });

        // Create "Other" cluster
        vis.otherData = vis.filteredData.filter(d => vis.otherStudios.includes(d.distributor));
        vis.otherData.forEach((film, i) => {
            vis.nodes.push({
                id: clusterId + i,
                studio: "Other",
                film: film,
                radius: 3,
                x: vis.width / (vis.topStudios.length + 1) * (vis.topStudios.length + 1),
                y: vis.height / 2
            });
        });

        // vis.nodes.push({
        //     id: clusterId + i,
        //     studio: studio,
        //     film: film,
        //     radius: 5,  // Adjust the radius to make the circles smaller
        //     x: vis.width / (vis.topStudios.length + 1) * (index + 1),
        //     y: vis.height / 2
        // });

        // In your initVis function

        vis.simulation.nodes(vis.nodes);

        vis.updateVis();
        // Create nodes for each data point
//         vis.nodes = [];
//         let clusterId = 0;
//
//         vis.topStudios.forEach((studio, index) => {
//             vis.studioData = vis.filteredData.filter(d => d.distributor === studio);
//             vis.studioData.forEach((film, i) => {
//                 vis.nodes.push({
//                     id: clusterId + i,
//                     studio: studio,
//                     film: film,
//                     radius: 10,
//                     x: vis.width / 2 + (Math.random() - 0.5) * 100 * (index + 1),  // Spread out x position
//                     y: vis.height / 2 + (Math.random() - 0.5) * 100 * (index + 1)  // Spread out y position
//                 });
//             });
//             clusterId += vis.studioData.length;
//         });
//
// // Create "Other" cluster
//         vis.otherData = vis.filteredData.filter(d => vis.otherStudios.includes(d.distributor));
//         vis.otherData.forEach((film, i) => {
//             vis.nodes.push({
//                 id: clusterId + i,
//                 studio: "Other",
//                 film: film,
//                 radius: 10,
//                 x: vis.width / 2 + (Math.random() - 0.5) * 100 * (vis.topStudios.length + 1),  // Spread out x position
//                 y: vis.height / 2 + (Math.random() - 0.5) * 100 * (vis.topStudios.length + 1)  // Spread out y position
//             });
//         });
//
//         vis.simulation.nodes(vis.nodes);
//
//         vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Bind data to circles
        let bubbles = vis.svg.selectAll('.bubble')
            .data(vis.nodes, d => d.id);

        // Enter selection
        bubbles.enter().append('circle')
            .attr('class', 'bubble')
            .attr('r', d => d.radius)
            .attr('fill', d => (d.film.winner ? 'red' : 'gray'))
            .merge(bubbles) // Enter + Update selection
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        // Exit selection
        bubbles.exit().remove();

        // Bind data to labels
        let labels = vis.svg.selectAll('.label')
            .data([...new Set(vis.nodes.map(d => d.studio))]);

        // Enter selection
        labels.enter().append('text')
            .attr('class', 'label')
            .attr('text-anchor', 'middle')
            .merge(labels) // Enter + Update selection
            .text(d => d)
            .attr('x', (d, i) => vis.width / 6 + (i * vis.width / 7))
            .attr('y', (d, i) => vis.height / 15 + i * 20);
            // .attr('transform', 'rotate(-45)');
            // .attr('transform', 'rotate(-45)')  // Rotate the labels by -45 degrees
        ;

        // Exit selection
        labels.exit().remove();

        // Update force simulation
        vis.simulation.nodes(vis.nodes);
        vis.simulation.alpha(0.3).restart();
    }
}



// // class StudioBubbles {
// //
// //     constructor(_parentElement, data1) {
// //         this.parentElement = _parentElement;
// //         this.data = data1
// //
// //         // this.initVis();
// //     }}
//
// class StudioBubbles {
//     constructor(_parentElement, data) {
//         this.parentElement = _parentElement;
//         this.data = data;
//
//         this.initVis();
//     }
//
//     initVis() {
//         let vis = this;
//
//         // Set up SVG and layout
//         // vis.margin = {top: 40, right: 10, bottom: 80, left: 60};
//
//         vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width*5/6;
//         vis.height = 500;
//
//         vis.svg = d3.select("#" + vis.parentElement).append("svg")
//             .attr("width", vis.width)
//             .attr("height", vis.height);
//
//         // Set up force simulation
//         vis.simulation = d3.forceSimulation()
//             .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
//             .force("charge", d3.forceManyBody().strength(5))
//             .force("collide", d3.forceCollide().radius(20))
//             .on("tick", () => vis.updateVis());
//
//         vis.wrangleData();
//     }
//
//     wrangleData() {
//         let vis = this;
//
//         // Extract unique studio names
//         vis.studioNames = Array.from(new Set(vis.data.map(d => d.distributor)));
//
//         // Create nodes for each data point
//         vis.nodes = vis.studioNames.map((studio, i) => {
//             return { id: i, studio: studio, radius: 10, x: vis.width / 2, y: vis.height / 2 };
//         });
//
//         vis.simulation.nodes(vis.nodes);
//
//         vis.updateVis();
//     }
//
//     updateVis() {
//         let vis = this;
//
//         // Bind data to circles
//         let bubbles = vis.svg.selectAll('.bubble')
//             .data(vis.nodes, d => d.id);
//
//         // Enter selection
//         bubbles.enter().append('circle')
//             .attr('class', 'bubble')
//             .attr('r', d => d.radius)
//             .attr('fill', 'gray')
//             .merge(bubbles) // Enter + Update selection
//             .attr('cx', d => d.x)
//             .attr('cy', d => d.y);
//
//         // Exit selection
//         bubbles.exit().remove();
//
//         // Update force simulation
//         vis.simulation.nodes(vis.nodes);
//         vis.simulation.alpha(0.3).restart();
//     }
// }