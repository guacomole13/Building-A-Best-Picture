// source: https://www.latimes.com/entertainment-arts/story/2021-07-01/film-academy-invites-395-new-members-including-steven-yeun-laverne-cox-issa-rae-and-robert-pattinson
const PERCENT_FEMALE_2021 = 0.33;
const PERCENT_URM_2021 = 0.19;
// source: https://www.vanityfair.com/hollywood/2022/03/awards-insider-who-votes-for-the-oscars & https://www.thewrap.com/academy-membership-grows-oscar-voters-9500/
const NUMBER_VOTERS_2022 = 9579;
const NUMBER_VOTERS_2012 = 5765;
// source: https://www.thewrap.com/academy-membership-grows-oscar-voters-9500/ 
let branchsizes_2022 = [
    {"id": "Actors", "seats": 1302, "legend": "Professionals in acting for film.", "name": "Actors"},
    {"id": "CastingDirectors", "seats": 154, "legend": "Specialists in film cast selection.", "name": "Casting Directors"},
    {"id": "Cinematographers", "seats": 290, "legend": "Experts in film cinematography.", "name": "Cinematographers"},
    {"id": "CostumeDesigners", "seats": 169, "legend": "Designers of film costumes.", "name": "Costume Designers"},
    {"id": "Directors", "seats": 573, "legend": "Overseers of film direction.", "name": "Directors"},
    {"id": "Documentary", "seats": 648, "legend": "Creators of documentary films.", "name": "Documentary"},
    {"id": "Executives", "seats": 694, "legend": "Senior film production and distribution professionals.", "name": "Executives"},
    {"id": "FilmEditors", "seats": 376, "legend": "Specialists in film editing.", "name": "Film Editors"},
    {"id": "MakeupArtists", "seats": 236, "legend": "Experts in film makeup and hairstyling.", "name": "Makeup Artists and Hairstylists"},
    {"id": "MarketingPR", "seats": 614, "legend": "Professionals in film marketing and PR.", "name": "Marketing and Public Relations"},
    {"id": "Music", "seats": 388, "legend": "Creators of film music.", "name": "Music"},
    {"id": "Producers", "seats": 648, "legend": "Managers of film production.", "name": "Producers"},
    {"id": "ProductionDesign", "seats": 390, "legend": "Designers of film set and location aesthetics.", "name": "Production Design"},
    {"id": "ShortFilms", "seats": 867, "legend": "Professionals in short and animated films.", "name": "Short Films and Feature Animation"},
    {"id": "Sound", "seats": 549, "legend": "Experts in film sound design.", "name": "Sound"},
    {"id": "VisualEffects", "seats": 615, "legend": "Specialists in film visual effects.", "name": "Visual Effects"},
    {"id": "Writers", "seats": 510, "legend": "Creators of film scripts and narratives.", "name": "Writers"},
    {"id": "MembersAtLarge", "seats": 556, "legend": "Various film industry professionals.", "name": "Members-at-Large"}
];

let genderproportions_2022 = [
    {"id": "Women", "seats": 3161, "name": "Women"}, //9579 * 0.33 rounded down
    {"id": "Men", "seats": 6418, "name": "Men"}
];

let raceproportions_2022 = [
    {"id": "PeopleOfColor", "seats": 1820, "name": "People of Color"}, //9579 * 0.19 rounded down
    {"id": "White", "seats": 7759, "name": "White"}
];

let parliamentDatasets = {
    "guild": branchsizes_2022,
    "gender": genderproportions_2022,
    "race": raceproportions_2022
};