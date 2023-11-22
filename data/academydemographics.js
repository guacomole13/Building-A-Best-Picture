// source: https://www.latimes.com/entertainment-arts/story/2021-07-01/film-academy-invites-395-new-members-including-steven-yeun-laverne-cox-issa-rae-and-robert-pattinson
const PERCENT_FEMALE_2021 = 0.33;
const PERCENT_URM_2021 = 0.19;
// source: https://www.vanityfair.com/hollywood/2022/03/awards-insider-who-votes-for-the-oscars & https://www.thewrap.com/academy-membership-grows-oscar-voters-9500/
const NUMBER_VOTERS_2022 = 9579;
const NUMBER_VOTERS_2012 = 5765;
// source: https://www.thewrap.com/academy-membership-grows-oscar-voters-9500/ 
let branchsizes_2022 = [
    {"id": "Actors", "seats": 1302, "legend": "Actors", "name": "Actors"},
    {"id": "CastingDirectors", "seats": 154, "legend": "Casting Directors", "name": "Casting Directors"},
    {"id": "Cinematographers", "seats": 290, "legend": "Cinematographers", "name": "Cinematographers"},
    {"id": "CostumeDesigners", "seats": 169, "legend": "Costume Designers", "name": "Costume Designers"},
    {"id": "Directors", "seats": 573, "legend": "Directors", "name": "Directors"},
    {"id": "Documentary", "seats": 648, "legend": "Documentary", "name": "Documentary"},
    {"id": "Executives", "seats": 694, "legend": "Executives", "name": "Executives"},
    {"id": "FilmEditors", "seats": 376, "legend": "Film Editors", "name": "Film Editors"},
    {"id": "MakeupArtists", "seats": 236, "legend": "Makeup Artists and Hairstylists", "name": "Makeup Artists and Hairstylists"},
    {"id": "MarketingPR", "seats": 614, "legend": "Marketing and Public Relations", "name": "Marketing and Public Relations"},
    {"id": "Music", "seats": 388, "legend": "Music", "name": "Music"},
    {"id": "Producers", "seats": 648, "legend": "Producers", "name": "Producers"},
    {"id": "ProductionDesign", "seats": 390, "legend": "Production Design", "name": "Production Design"},
    {"id": "ShortFilms", "seats": 867, "legend": "Short Films and Feature Animation", "name": "Short Films and Feature Animation"},
    {"id": "Sound", "seats": 549, "legend": "Sound", "name": "Sound"},
    {"id": "VisualEffects", "seats": 615, "legend": "Visual Effects", "name": "Visual Effects"},
    {"id": "Writers", "seats": 510, "legend": "Writers", "name": "Writers"},
    {"id": "MembersAtLarge", "seats": 556, "legend": "Members-at-Large", "name": "Members-at-Large"}
];

let genderproportions_2022 = [
    {"id": "Women", "seats": 3161, "legend": "Women", "name": "Women"}, //9579 * 0.33 rounded down
    {"id": "Men", "seats": 6418, "legend": "Men", "name": "Men"}
];

let raceproportions_2022 = [
    {"id": "PeopleOfColor", "seats": 1820, "legend": "People of Color", "name": "People of Color"}, //9579 * 0.19 rounded down
    {"id": "White", "seats": 7759, "legend": "White", "name": "White"}
];

let parliamentDatasets = {
    "guild": branchsizes_2022,
    "gender": genderproportions_2022,
    "race": raceproportions_2022
};