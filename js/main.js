// Variable for the visualization instance
let consensus;
let lollipop;

// Load csv data
d3.csv("data/oscars_df.csv").then(data => {

    console.log(data);

    // Filter the data to get only the movies that are winners of Best Picture Award
    const winners = data.filter(movie => movie.Award === "Winner");

    // Initialize an empty array to store the display data
    let displayData = [];

    // Populate the displayData array with movie names, Tomatometer Rating, and Audience Rating
    displayData = winners.reduce((result, movie) => {
        // Push an object with required fields into the result array
        result.push({
            Film: movie.Film, // Movie Name
            CriticRating: movie['Tomatometer Rating'], // Tomatometer (Critic) Rating
            AudienceRating: movie['Audience Rating'] // Audience Rating
        });
        return result;
    }, []);


    // Insert the missing Tomatometer Rating and Audience Rating values
    displayData[2].CriticRating = 90;
    displayData[2].AudienceRating = 90;

    displayData[10].CriticRating = 95;
    displayData[10].AudienceRating = 88;

    displayData[11].CriticRating = 90;
    displayData[11].AudienceRating = 92;

    displayData[12].CriticRating = 98;
    displayData[12].AudienceRating = 92;

    displayData[37].CriticRating = 95;
    displayData[37].AudienceRating = 90;

    displayData[47].CriticRating = 96;
    displayData[47].AudienceRating = 97;

    displayData[62].CriticRating = 85;
    displayData[62].AudienceRating = 81;

    displayData[63].CriticRating = 87;
    displayData[63].AudienceRating = 87;

    displayData[82].CriticRating = 97;
    displayData[82].AudienceRating = 84;

    displayData[87].CriticRating = 91;
    displayData[87].AudienceRating = 78;

    displayData[92].CriticRating = 99;
    displayData[92].AudienceRating = 90;


    // Change string value numbers for critic and audience ratings to integers
    displayData.forEach(movie => {
        movie.CriticRating = parseInt(movie.CriticRating, 10);
        movie.AudienceRating = parseInt(movie.AudienceRating, 10);
    });

    // TODO: ONLY DISPLAY THE MOST RECENT BEST PICTURE WINNERS? GRAPH DISPLAYS TOO MANY MOVIES TO FIT ON SCREEN

    // Output the updated array
    console.log(displayData);

    // New consensus plot object
    consensus = new ConsensusPlot("consensus", displayData);


    // Create empty array to store IMDB data
    const imdbData = [];

    data.forEach((movie) => {
        // Extract 'Award', 'Oscar Year', and 'IMDB Rating' columns
        const { Film, Award, 'Oscar Year': OscarYear, 'IMDB Rating': IMDBRating } = movie;

        // Push an object with the extracted values to imdbData array
        imdbData.push({ Film, Award, OscarYear, IMDBRating });
    });

    // Change string value numbers to floats
    imdbData.forEach(movie => {
        movie.OscarYear = parseFloat(movie.OscarYear) + 1;
        movie.IMDBRating = parseFloat(movie.IMDBRating);
    });

    console.log(imdbData); // Check the content of imdbData array

    // New lollipop chart object
    lollipop = new LollipopChart("lollipop", imdbData);

});