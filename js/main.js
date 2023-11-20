

var parliament = d3.parliament().width(600).innerRadiusCoef(0.4);
parliament.enter.fromCenter(true).smallToBig(true);
parliament.exit.toCenter(true).bigToSmall(true);
parliament.on("click", function(e) { console.log(e); });

var setData = function(d) {
    d3.select("svg").datum(d).call(parliament);
};

d3.json("data/european.json", setData);

setTimeout(function() { d3.json("data/french.json", setData); }, 5000)


let consensus;

// load csv data
d3.csv("data/oscars_df.csv").then(data => {

    console.log(data);

    //  Convert strings to date objects
    // data.forEach(d => {
    //     d.survey = parseDate(d.survey);
    // });


    //  New consensus plot object
    consensus = new ConsensusPlot("consensus", data)

});