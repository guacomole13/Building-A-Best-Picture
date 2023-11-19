// (1) Load data with promises

let promises = [
    d3.json("data/movies_list.json"),
    d3.csv("data/oscars_df.csv")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(data) {    
    let movieList = data[0];
    let oscarsDF = data[1];

    console.log(data);
    // Create visualization instances
    let hemisphere = new Hemisphere("hemisphere");

}
