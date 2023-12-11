class StudioBubbles {
    constructor(_parentElement, data) {
        this.parentElement = _parentElement;
        this.data = data;
        this.simulationTimer = null;
        this.previousData = JSON.stringify(data);

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width;
        vis.height = 600;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        vis.simulation = d3.forceSimulation()
            .force("collide", d3.forceCollide().radius(5))
            .force("x", d3.forceX().strength(0.1).x(vis.width / 2)) // Center horizontally
            .force("y", d3.forceY().strength(0.1).y(vis.height / 2)); // Center vertically
            // .on("tick", () => vis.updateVis());

        vis.sliderContainer = d3.select("#" + vis.parentElement).append("div")
            .attr("class", "slider-container");

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // setTimeout(() => {
        //     vis.simulation.stop();
        // }, 1500);

        // vis.simulation.alphaDecay(2);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // this.slider();

                // vis.data.forEach(function(movie) {
        //     if (movie.distributor === "United Artists") {
        //         movie.distributor = "Metro-Goldwyn-Mayer";
        //     }
        // });

        vis.studioCounts = d3.rollup(
            vis.data,
            v => d3.sum(v, d => 1),
            d => d.distributor
        );

        vis.sortedStudios = Array.from(vis.studioCounts, ([studio, count]) => ({ studio, count }))
            .sort((a, b) => b.count - a.count)
            .map(d => d.studio);

        vis.topStudios = vis.sortedStudios.slice(0, 5);
        vis.otherStudios = vis.sortedStudios.slice(5);
        vis.topStudios.push("Other");

        vis.filteredData = vis.data.filter(d => vis.topStudios.includes(d.distributor) || vis.otherStudios.includes(d.distributor));

        vis.nodes = [];
        let clusterId = 0;

        // Calculate the number of studios in each bank
        const bank1Studios = vis.topStudios.slice(0, 3);
        const bank2Studios = vis.topStudios.slice(3);

        bank1Studios.forEach((studio, index) => {
            vis.studioData = vis.filteredData.filter(d => d.distributor === studio);
            vis.studioData.forEach((film, i) => {
                vis.nodes.push({
                    id: clusterId + i,
                    studio: studio,
                    film: film,
                    radius: 4,
                    index: index,
                    x: (index + 1) * (vis.width / 4), // Adjust the denominator as needed
                    y: vis.height / 4
                });
            });
            clusterId += vis.studioData.length;
        });

        clusterId = 0; // Reset clusterId for the second bank

        bank2Studios.forEach((studio, index) => {
            vis.studioData = vis.filteredData.filter(d => d.distributor === studio);
            vis.studioData.forEach((film, i) => {
                vis.nodes.push({
                    id: clusterId + i,
                    studio: studio,
                    film: film,
                    radius: 4,
                    index: index,
                    x: (index + 1) * (vis.width / 4), // Adjust the denominator as needed
                    y: vis.height * 11 / 16 // Adjust the vertical position
                });
            });
            clusterId += vis.studioData.length;
        });

        vis.otherData = vis.filteredData.filter(d => vis.otherStudios.includes(d.distributor));
        vis.otherData.forEach((film, i) => {
            vis.nodes.push({
                id: clusterId + i,
                studio: "Other",
                film: film,
                radius: 4,
                index: 2,
                x: vis.width * 3 / 4,
                y: vis.height * 11 / 16
            });
        });

        // Define x positions for each studio in the first and second bank
        const xPositionsBank1 = bank1Studios.map((_, index) => (index + 1) * (vis.width / 4));
        const xPositionsBank2 = bank2Studios.map((_, index) => (index + 1) * (vis.width / 4)); // Starting from 4th position

        // Update x position in nodes based on studio
        vis.nodes.forEach(node => {
            if (bank1Studios.includes(node.studio)) {
                node.x = xPositionsBank1[bank1Studios.indexOf(node.studio)];
            } else if (bank2Studios.includes(node.studio)) {
                node.x = xPositionsBank2[bank2Studios.indexOf(node.studio)];
            } else if (node.studio === "Other") {
                node.x = vis.width * 3 / 4; // Position for "Other"
            }
        });

        // Update the forceX force based on studio
        vis.simulation.force("x", d3.forceX().strength(0.1).x(d => {
            if (bank1Studios.includes(d.studio)) {
                return xPositionsBank1[bank1Studios.indexOf(d.studio)];
            } else if (bank2Studios.includes(d.studio)) {
                return xPositionsBank2[bank2Studios.indexOf(d.studio)];
            } else if (d.studio === "Other") {
                return vis.width * 3 / 4;
            }
        }));
        // vis.simulation.force("x", d3.forceX().strength(0.1).x(d => {
        //     return (d.index + 1) * (vis.width / 4)
        // }));

        // Update the forceY force based on studio
        vis.simulation.force("y", d3.forceY().strength(0.1).y(d => {
            if (d.studio === "Other") {
                return (vis.height * 11) / 16;
            } else if (bank1Studios.includes(d.studio)) {
                return vis.height * 2 / 8;
            } else if (bank2Studios.includes(d.studio)) {
                return (vis.height * 11) / 16;
            }
        }));


        // vis.simulation.nodes(vis.nodes)

        // Start the simulation with an initial alpha value
        // vis.simulation.alpha(1).restart();
        vis.assignInitialPositions();


        // if (vis.isDataChanged()) {
        //     vis.restartSimulation();
        // }
        vis.restartSimulation();

        // Set the alpha decay rate for the initial 100 milliseconds
        // setTimeout(() => {
        //     vis.simulation.alphaDecay(0.75); // 0.25 times the default speed
        // }, 1500); // Change the duration as needed (100 milliseconds)

        // Add a condition to stop the simulation when it settles (e.g., when alpha reaches a small value)
        vis.simulation.on('tick', () => {
            if (vis.simulation.alpha() < 0.01) {
                vis.simulation.alpha(0); // Stop the simulation
                vis.stopSimulationTimer(); // Call the function to stop the timer
            }
            vis.updateVis();
        });

        // Start the timer to stop the simulation after a prescribed amount of time (e.g., 5000 milliseconds)
        vis.startSimulationTimer(2000); // Adjust the time as needed (5000 milliseconds = 5 seconds)
    }

    updateVis() {
        let vis = this;

        let bubbles = vis.svg.selectAll('.bubble')
            .data(vis.nodes, d => d.id);

        // Enter + update
        bubbles.enter().append('circle')
            .attr('class', 'bubble')
            .attr('r', d => d.radius)
            .attr('fill', d => (d.film.winner ? 'red' : 'gray'))
            // Merge the new elements with the existing ones
            .merge(bubbles)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('opacity', d => (d.film.winner ? 1 : 0.25))
            // Attach mouseover and mouseout event listeners
            .on("mouseover", function(event, d) {
                d3.select(this).transition()
                    .duration(200)
                    .attr('r', d.radius * 2)
                    .style('stroke-width', '2px')
                    .style("stroke", "#000000");
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                vis.tooltip.html("Data: " + d.film.winner)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");

            })
            .on("mouseout", function(event, d) {
                d3.select(this).transition()
                    .duration(500)
                    .attr('r', d.radius)
                    .style('stroke-width', '0px')
                    .style("stroke", "#000000");
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        bubbles.exit().remove();


        // let bubbles = vis.svg.selectAll('.bubble')
        //     .data(vis.nodes, d => d.id);
        //
        // bubbles.enter().append('circle')
        //     .attr('class', 'bubble')
        //     .attr('r', d => d.radius)
        //     .attr('fill', d => (d.film.winner ? 'red' : 'gray'))
        //     .merge(bubbles)
        //     .attr('cx', d => d.x)
        //     .attr('cy', d => d.y)
        //     .attr('opacity', d => (d.film.winner ? 1 : 0.25));
        //
        //
        // bubbles.exit().remove();

        let labels = vis.svg.selectAll('.label')
            .data([...new Set(vis.nodes.map(d => d.studio))]);

        labels.enter().append('text')
            .attr('class', 'label')
            .attr('text-anchor', 'middle')
            .attr("font-size", 15)
            .merge(labels)
            .text(d => d)
            .attr('x', (d, i) => {
                if (i < 3) {
                    return (i + 1) * (vis.width / 4);
                } else {
                    return (i - 2) * (vis.width / 4);
                }
            })
            .attr('y', (d, i) => {
                if (i < 3) {
                    return vis.height / 8;
                } else {
                    return (vis.height) / 2;
                }
            });

        labels.exit().remove();

        // vis.simulation.nodes(vis.nodes);
        // vis.restartSimulation();

        // Set the alpha decay rate for the initial 100 milliseconds
        // setTimeout(() => {
        //     vis.simulation.alphaDecay(1-0.25); // 0.25 times the default speed
        // }, 4000);

        // vis.simulation.on('tick', () => {
        //     if (vis.simulation.alpha() < 0.025) {
        //         vis.simulation.alpha(0); // Stop the simulation
        //         vis.stopSimulationTimer(); // Call the function to stop the timer
        //     }
        //     vis.updateVis();
        // });

//         vis.node = vis.svg
//             .selectAll('.circle')
//             .data(vis.nodes)
//             // .attr('r', (d) => d.radius)
//             // .style('fill', (d) => vis.scale(d.data.currentGenre))
//             // .style('stroke', (d) => d.data.Winner ? '#000000' : 'none')
//             // .style('stroke-width', (d) => d.data.Winner ? '1.5px' : '0px')
//             // .attr("cx", d => d.x)
//             // .attr("cy", d => d.y)
//             .on("mouseover", function(event, d) {
//                 vis.tooltip.transition()
//                     .duration(200)
//                     .style("opacity", .9);
//                 vis.tooltip.html("Data: " + d.film.year)
//                     .style("left", (event.pageX) + "px")
//                     .style("top", (event.pageY - 28) + "px");
//                 // console.log(d.data);
// //                 // change colors
// //                 d3.selectAll(`#movie_${d.data.MovieId}`)
// //                     .attr("r", d.r * 2)
// //                     .style('stroke-width', '2px')
// //                     .style("stroke", "#000000")
// //                     .style("fill", d => (d.film.winner ? 'red' : 'gray'));
// //                 vis.svg.tooltip
// //                     .style("opacity", 1)
// //                     .style("left", event.pageX + 20 + "px")
// //                     .style("top", event.pageY + "px")
// //                     .html(`
// //                     <div style="display: flex; flex-direction: row; align-items: center; border: thin solid grey; border-radius: 5px; background: ${d.data.Winner ? 'linear-gradient(#c5b358, #FCF6BA, #d4af37, #FBF5B7)' : '#841b2d'}; padding: 7.5px; width: 600px;">
// // <!--                        // <img src="${d.data.Poster}" style="max-width: 300px; max-height: 300px; object-fit: contain; margin-right: 10px;"></img>-->
// //                         <div style="text-align: center; ${d.data.Winner ? '' : 'color: white;'}">
// //                             <h3>${d.data.Title} (${d.data.year})</h3>
// //                             <h4>Genres: ${d.data.Genre.join(', ')}</h4>
// //                             <h6>Director: ${d.data.Director}</h6>
// //                             <p>Plot: ${d.data.Plot}</p>
// //                         </div>
// //                     </div>`)
//             })
//             .on("mouseout", function(event, d) {
//                     vis.tooltip.transition()
//                         .duration(500)
//                         .style("opacity", 0);
//                 // d3.selectAll(`#movie_${d.data.MovieId}`)
//                 //     .transition()
//                 //     .duration(350)
//                 //     .attr("r", d.r)
//                 //     .style("stroke", "none")
//                 //     .style("fill", (d) => vis.scale(d.data.currentGenre));
//                 // vis.svg.tooltip
//                 //     .style("opacity", 0)
//                 //     .style("left", 0)
//                 //     .style("top", 0)
//                 //     .html(``);
//             });

        // Start the timer to stop the simulation after a prescribed amount of time (e.g., 1000 milliseconds)
        vis.startSimulationTimer(1000);
    }

    assignInitialPositions() {
        let vis = this;
        // let columns = Math.ceil(Math.sqrt(vis.nodes.length)); // Determine number of columns for a grid layout
        let columns = 3;
        let rows = 2;
            // Math.ceil(vis.nodes.length / columns); // Determine number of rows
        let gridSpacingX = vis.width / (columns + 1); // Horizontal spacing
        let gridSpacingY = vis.height / (rows + 1); // Vertical spacing

        vis.nodes.forEach((node, index) => {
            let col = index % columns;
            let row = Math.floor(index / columns);
            node.x = gridSpacingX * (col + 1); // Initial x position
            node.y = gridSpacingY * (row + 1); // Initial y position
        });
    }

    isDataChanged(newData) {
        // Convert the new data to a string and compare it with the previous data
        let newDataString = JSON.stringify(newData);
        if (this.previousData !== newDataString) {
            this.previousData = newDataString; // Update the previous data
            return true; // Data has changed
        }
        return false; // No significant change in data
    }

    ticked() {
        let vis = this;

        // Update node positions in your visualization
        vis.svg.selectAll('.bubble')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        // Stop the simulation when it's sufficiently cooled down
        if (vis.simulation.alpha() < 0.01) {
            vis.simulation.stop();
        }
    }


    restartSimulation() {
        let vis = this;

        vis.simulation
            .nodes(vis.nodes)
            .alpha(1.5) // Restart the simulation with full alpha
            .alphaDecay(0.02) // Set a slower alpha decay
            .on('tick', () => vis.ticked()) // Adjusted tick function
            .restart();
    }

    startSimulationTimer(duration) {
        const vis = this;
        // Clear any existing timer
        if (vis.simulationTimer) {
            clearTimeout(vis.simulationTimer);
        }
        // Start a new timer
        vis.simulationTimer = setTimeout(() => {
            vis.simulation.alphaDecay(1-0.25); // Slow down the simulation
            vis.simulation.stop(); // Stop the simulation
        }, duration);
    }

    stopSimulationTimer() {
        const vis = this;
        if (vis.simulationTimer) {
            clearTimeout(vis.simulationTimer);
            vis.simulationTimer = null;
        }
    }

    stopSimulation() {
        const vis = this;
        vis.simulation.alphaDecay(1-0.25); // 0.25 times the default speed
        vis.simulation.stop(); // Stop the simulation
        vis.updateVis(); // Update the visualization to fix bubble positions
    }

    // updateSliderAnnotation(values) {
    //     const startElement = document.getElementById("sliderlabel1");
    //     const endElement = document.getElementById("sliderlabel2");
    //     let startdate1 = new Date(values[0]);
    //     let enddate1 = new Date(values[1]);
    //     let startyear = startdate1.getFullYear();
    //     let endyear = enddate1.getFullYear();
    //     startElement.innerText = startyear;
    //     endElement.innerText =  endyear;
    // }
    // slider() {
    //     let vis = this;
    //
    //     // This gets the slider from the document
    //     let slider = document.getElementById("slider");
    //
    //     // This creates the slider
    //     noUiSlider.create(slider, {
    //         start: [d3.min(vis.originaldata, d => d.year), d3.max(vis.originaldata, d => d.year)],
    //         connect: true,
    //         behaviour: "drag",
    //         step: 4,
    //         margin: 4,
    //         range: {
    //             'min': d3.min(vis.data, d => d.year), // Use integer values
    //             'max': d3.max(vis.data, d => d.year)  // Use integer values
    //         }
    //     });
    //
    //     // This makes the slider listen for new events
    //     slider.noUiSlider.on('slide', function (values, handle) {
    //         let daterange = slider.noUiSlider.get(true);
    //         vis.data = vis.originaldata.filter((entry) =>
    //             // This clarifies that the year must be a valid year
    //             entry.year >= new Date(daterange[0]) && entry.year <= new Date(daterange[1])
    //         );
    //         vis.updateVis(); // Call the new updateVisualization method
    //         vis.updateSliderAnnotation(daterange);
    //     });
    //
    //     const initialDateRange = slider.noUiSlider.get(true);
    //     vis.updateSliderAnnotation(initialDateRange);
    // }


// // This is where the slider is built
//     slider() {
//         let vis = this();
//         // This gets the slider from the document
//         let slider = document.getElementById("slider");
//
//         // This creates the slider
//         noUiSlider.create(slider, {
//             start: [d3.min(vis.data, d => d.YEAR).getTime(), d3.max(vis.data, d => d.YEAR).getTime()],
//             connect: true,
//             behaviour: "drag",
//             step: 4,
//             margin: 4,
//             range: {
//                 'min': d3.min(data, d => d.YEAR).getTime(),
//                 'max': d3.max(data, d => d.YEAR).getTime()
//             }
//         });
//
//         // This makes the slider listen for new events
//         slider.noUiSlider.on('slide', function (values, handle) {
//             let daterange = slider.noUiSlider.get(true);
//             vis.newdata = vis.data.filter((entry) =>
//                 // This clarifies that the year must be a valid year
//                 entry.YEAR >= new Date(daterange[0]) && entry.YEAR <= new Date(daterange[1])
//             );
//             // console.log(data);
//             updateVisualization();
//             updateSliderAnnotation(daterange);
//         });
//         const initialDateRange = slider.noUiSlider.get(true);
//         updateSliderAnnotation(initialDateRange);
//     }
}






// class StudioBubbles {
//     constructor(_parentElement, data) {
//         this.parentElement = _parentElement;
//         this.data = data;
//         this.simulationTimer = null;
//
//         this.initVis();
//     }
//
//     initVis() {
//         let vis = this;
//
//         vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width;
//         vis.height = 600;
//
//         vis.svg = d3.select("#" + vis.parentElement).append("svg")
//             .attr("width", vis.width)
//             .attr("height", vis.height);
//
//         vis.simulation = d3.forceSimulation()
//             .force("collide", d3.forceCollide().radius(3.5))
//             .force("x", d3.forceX().strength(0.1).x(vis.width / 2)) // Center horizontally
//             .force("y", d3.forceY().strength(0.1).y(vis.height / 2)) // Center vertically
//             .on("tick", () => vis.updateVis());
//
//         vis.wrangleData();
//     }
//
//     wrangleData() {
//         let vis = this;
//
//         // vis.data.forEach(function(movie) {
//         //     if (movie.distributor === "United Artists") {
//         //         movie.distributor = "Metro-Goldwyn-Mayer";
//         //     }
//         // });
//
//         vis.studioCounts = d3.rollup(
//             vis.data,
//             v => d3.sum(v, d => 1),
//             d => d.distributor
//         );
//
//         vis.sortedStudios = Array.from(vis.studioCounts, ([studio, count]) => ({ studio, count }))
//             .sort((a, b) => b.count - a.count)
//             .map(d => d.studio);
//
//         vis.topStudios = vis.sortedStudios.slice(0, 5);
//         vis.otherStudios = vis.sortedStudios.slice(5);
//         vis.topStudios.push("Other");
//
//         vis.filteredData = vis.data.filter(d => vis.topStudios.includes(d.distributor) || vis.otherStudios.includes(d.distributor));
//
//         vis.nodes = [];
//         let clusterId = 0;
//
//         // Calculate the number of studios in each bank
//         const bank1Studios = vis.topStudios.slice(0, 3);
//         const bank2Studios = vis.topStudios.slice(3);
//
//         bank1Studios.forEach((studio, index) => {
//             vis.studioData = vis.filteredData.filter(d => d.distributor === studio);
//             vis.studioData.forEach((film, i) => {
//                 vis.nodes.push({
//                     id: clusterId + i,
//                     studio: studio,
//                     film: film,
//                     radius: 3,
//                     index: index,
//                     x: (index + 1) * (vis.width / 4), // Adjust the denominator as needed
//                     y: vis.height / 4
//                 });
//             });
//             clusterId += vis.studioData.length;
//         });
//
//         clusterId = 0; // Reset clusterId for the second bank
//
//         bank2Studios.forEach((studio, index) => {
//             vis.studioData = vis.filteredData.filter(d => d.distributor === studio);
//             vis.studioData.forEach((film, i) => {
//                 vis.nodes.push({
//                     id: clusterId + i,
//                     studio: studio,
//                     film: film,
//                     radius: 3,
//                     index: index,
//                     x: (index + 1) * (vis.width / 4), // Adjust the denominator as needed
//                     y: vis.height * 13 / 16 // Adjust the vertical position
//                 });
//             });
//             clusterId += vis.studioData.length;
//         });
//
//         vis.otherData = vis.filteredData.filter(d => vis.otherStudios.includes(d.distributor));
//         vis.otherData.forEach((film, i) => {
//             vis.nodes.push({
//                 id: clusterId + i,
//                 studio: "Other",
//                 film: film,
//                 radius: 3,
//                 index: 2,
//                 x: vis.width * 3 / 4,
//                 y: vis.height * 13 / 16
//             });
//         });
//
//         // Define x positions for each studio in the first and second bank
//         const xPositionsBank1 = bank1Studios.map((_, index) => (index + 1) * (vis.width / 4));
//         const xPositionsBank2 = bank2Studios.map((_, index) => (index + 1) * (vis.width / 4)); // Starting from 4th position
//
//         // Update x position in nodes based on studio
//         vis.nodes.forEach(node => {
//             if (bank1Studios.includes(node.studio)) {
//                 node.x = xPositionsBank1[bank1Studios.indexOf(node.studio)];
//             } else if (bank2Studios.includes(node.studio)) {
//                 node.x = xPositionsBank2[bank2Studios.indexOf(node.studio)];
//             } else if (node.studio === "Other") {
//                 node.x = vis.width * 3 / 4; // Position for "Other"
//             }
//         });
//
//         // Update the forceX force based on studio
//         vis.simulation.force("x", d3.forceX().strength(0.1).x(d => {
//             if (bank1Studios.includes(d.studio)) {
//                 return xPositionsBank1[bank1Studios.indexOf(d.studio)];
//             } else if (bank2Studios.includes(d.studio)) {
//                 return xPositionsBank2[bank2Studios.indexOf(d.studio)];
//             } else if (d.studio === "Other") {
//                 return vis.width * 3 / 4;
//             }
//         }));
//         // vis.simulation.force("x", d3.forceX().strength(0.1).x(d => {
//         //     return (d.index + 1) * (vis.width / 4)
//         // }));
//
//         // Update the forceY force based on studio
//         vis.simulation.force("y", d3.forceY().strength(0.1).y(d => {
//             if (d.studio === "Other") {
//                 return (vis.height * 7) / 8;
//             } else if (bank1Studios.includes(d.studio)) {
//                 return vis.height * 3 / 8;
//             } else if (bank2Studios.includes(d.studio)) {
//                 return (vis.height * 7) / 8;
//             }
//         }));
//
//         // vis.simulation.nodes(vis.nodes);
//         //
//         // vis.simulation.alpha(0.2).restart();
//         //
//         // // Set the alpha decay rate for the initial 100 milliseconds
//         // setTimeout(() => {
//         //     vis.simulation.alphaDecay(1 - 0.25); // 0.25 times the default speed
//         // }, 500); // Change the duration as needed (100 milliseconds)
//         //
//         // // Add a condition to stop the simulation when it settles (e.g., when alpha reaches a small value)
//         // vis.simulation.on('tick', () => {
//         //     if (vis.simulation.alpha() < 0.01) {
//         //         vis.simulation.alpha(0); // Stop the simulation
//         //         vis.stopSimulationTimer(); // Call the function to stop the timer
//         //     }
//         //     vis.updateVis();
//         // });
//         //
//         // // Start the timer to stop the simulation after a prescribed amount of time (e.g., 5000 milliseconds)
//         // vis.startSimulationTimer(5000); // Adjust the time as needed (5000 milliseconds = 5 seconds)
//         vis.updateVis()
//     }
//
//         // vis.simulation.alpha(0.05).restart();
//
//         // Add a condition to stop the simulation when it settles (e.g., when alpha reaches a small value)
//         // vis.simulation.on('tick', () => {
//         //     if (vis.simulation.alpha() < 0.2) {
//         //         vis.simulation.stop(); // Stop the simulation
//         //     }
//         //     vis.updateVis();
//         // });
//         // vis.simulation.on('tick', () => {
//         //     if (vis.simulation.alpha() < 0.01) {
//         //         vis.simulation.alpha(0); // Stop the simulation
//         //         vis.stopSimulationTimer(); // Call the function to stop the timer
//         //     }
//         //     vis.updateVis();
//         // });
//         //
//         // vis.simulation.alpha(0.2).restart();
//         //
//         // // Set the alpha decay rate for the initial 100 milliseconds
//         // setTimeout(() => {
//         //     vis.simulation.alphaDecay(1 - 0.25); // 0.25 times the default speed
//         // }, 100); // Change the duration as needed (100 milliseconds)
//
//         // Start the timer to stop the simulation after a prescribed amount of time (e.g., 5000 milliseconds)
//         // vis.startSimulationTimer(2500);
//
//         // vis.updateVis();
//     // }
//
//     updateVis() {
//         let vis = this;
//
//         let bubbles = vis.svg.selectAll('.bubble')
//             .data(vis.nodes, d => d.id);
//
//         bubbles.enter().append('circle')
//             .attr('class', 'bubble')
//             .attr('r', d => d.radius)
//             .attr('fill', d => (d.film.winner ? 'red' : 'gray'))
//             .merge(bubbles)
//             .attr('cx', d => d.x)
//             .attr('cy', d => d.y)
//             .attr('opacity', d => (d.film.winner ? 1 : 0.25));
//
//
//         bubbles.exit().remove();
//
//         let labels = vis.svg.selectAll('.label')
//             .data([...new Set(vis.nodes.map(d => d.studio))]);
//
//         labels.enter().append('text')
//             .attr('class', 'label')
//             .attr('text-anchor', 'middle')
//             .attr("font-size", 15)
//             .merge(labels)
//             .text(d => d)
//             .attr('x', (d, i) => {
//                 if (i < 3) {
//                     return (i + 1) * (vis.width / 4);
//                 } else {
//                     return (i - 2) * (vis.width / 4);
//                 }
//             })
//             .attr('y', (d, i) => {
//                 if (i < 3) {
//                     return vis.height / 8;
//                 } else {
//                     return (vis.height * 5) / 8;
//                 }
//             });
//
//         labels.exit().remove();
//
//
//
//         vis.simulation.nodes(vis.nodes);
//         vis.simulation.alpha(0.05).restart();
//         vis.simulation.on('tick', () => {
//             if (vis.simulation.alpha() < 0.025) {
//                 vis.simulation.alpha(0); // Stop the simulation
//                 vis.stopSimulationTimer(); // Call the function to stop the timer
//             }
//             vis.updateVis();
//         });
//
//         // Start the timer to stop the simulation after a prescribed amount of time (e.g., 5000 milliseconds)
//         vis.startSimulationTimer(1000);
//
//
//     }
//     startSimulationTimer(duration) {
//         const vis = this;
//         vis.simulationTimer = setTimeout(() => {
//             vis.stopSimulation();
//         }, duration);
//     }
//
//     stopSimulationTimer() {
//         const vis = this;
//         if (vis.simulationTimer) {
//             clearTimeout(vis.simulationTimer);
//             vis.simulationTimer = null;
//         }
//     }
//
//     // stopSimulation() {
//     //     const vis = this;
//     //     vis.simulation.stop(); // Stop the simulation
//     //     vis.updateVis(); // Update the visualization to fix bubble positions
//     // }
//     stopSimulation() {
//         const vis = this;
//         vis.simulation.alphaDecay(1 - 0.25); // 0.25 times the default speed
//         vis.simulation.stop(); // Stop the simulation
//         vis.updateVis(); // Update the visualization to fix bubble positions
//     }
// }
//