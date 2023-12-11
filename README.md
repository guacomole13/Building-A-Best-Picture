![Oscars Logo](img/oscars-logo.png)
# BUILDING A BEST PICTURE

by The Academy </br>
Authors: Timothy Fargiano (team leader), Michael Omole, and Libby Wu

## SUBMISSION LINKS

**Website:** to be added </br>
**Video:** to be added

## FILE WALKTHROUGH

Items related to libraries will be *italicized*.

1. README.md - Guides readers through our project and files; containss links to our website and video
2. [index.html](index.html) - Our website page, home to our story and visualizations
3. [.gitignore](.gitignore) - File we used to store things we did not want to push (currently empty)
5. [css](css) - Contains all our project style sheets
    - *fullpage.css* - Necessary components for fullpage.js, a module we used to help smooth transitions between visualizations
    - *fullpage.min.css* - See above
    - *fullpage.min.css.map* - See above
    - [css/style.css](style.css) - Contains all of our custom CSS
6. [data](data) - Contains all the data used to make our visualizations
    - academydemographics.js - [Link](data/academydemographics.js),  JavaScript dictionaries for our hemisphere visualization pre-wrangled to work with d3-parliament and minimize loading/slowdown
    - cleanestdata.json - [Link](data/cleanestdata.json), OMdb API dataset cleaned to make sure no fields are missing. Used for genrebar.js and clusterplot.js
    - cleanestdata2.json - [Link](data/cleanestdata2.json), Augmented cleanestdata.json with scraped distributor data from Wikipedia. Used for studiobubbbles.js and budget_box_office.js
    - oscars_df.csv - [Link](data/oscars_df.csv). Dataset with every Best Picture nominee. Used by lollipop_chart.js and consenusplot.js
7. [img](img) - Contains most images we use for our website (Movie posters in clusterplot.js obtained through hreference).
8. [js](js) - Contains all of the JavaScript files used for our individual visualizations 
    - [bower_components](*js/bower_components*) - Necessary functions for d3-parliament, a module used to create one of our visualizations
        - *d3* - See above
        - *d3-parliament* - See above
    - [fullpage](*js/fullpage*) - Necessary functions for d3-parliament, a module used for our visual storytelling and slidemaking.
    - budget_box_office.js - Creates chart of budget and box office ranks for each winner vs. its nominee pool.
    - clusterplot.js - Shows every Best Picture nominee and each genre they fall under. Linked to genrebar.js.
    - consensusplot.js  - Shows spread between Rotten Tomatoes critic score and audience score. Linked to timeline.js.
    - genrebar.js - Shows which genres have the most Best Picture winners. Linked to clusterplot.js
    - hemisphere.js - Uses d3-parliament to render hemispheres showing Academy voter demographics.
    - lollipop_chart.js - Shows difference in IMDb rating for Best Picture Winners.
    - main.js - Contains core website functionality including loading data, storing variables linking to visualizations, and clalling visualizations to be rendered.
    - moviestudio.js - Creates timeline of winners and nominees for major movie studio. Linked to studiobubbles.js.
    - studiobubbles.js - Creates bubbles visually representing the number of winners and nominees for each studio.
    - textreveal.js - Custom function to stagger text reveal to aid visual storytelling.
    - timeline.js - Brushable timeline linked to consensusplot.js

## SITE WALKTHROUGH

to be added
