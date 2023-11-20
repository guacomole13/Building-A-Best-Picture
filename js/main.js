// (1) Load data with promises

let promises = [
    d3.json("data/movies_list.json"),
    d3.csv("data/oscars_df.csv"),
    d3.csv("data/film_budget_data.csv"),
    d3.json("data/cleanerdata.json")
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
    let budgetData = data[2]
    let squeakyCleanData = data[3]

    console.log(data);
    // Create visualization instances
    let hemisphere = new Hemisphere("hemisphere");
    let rankchart = new RankChart("rankchart", budgetData, movieList, squeakyCleanData);

}
