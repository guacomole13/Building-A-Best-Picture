// source: https://www.latimes.com/entertainment-arts/story/2021-07-01/film-academy-invites-395-new-members-including-steven-yeun-laverne-cox-issa-rae-and-robert-pattinson
const PERCENT_FEMALE_2021 = 0.33;
const PERCENT_URM_2021 = 0.19;
// source: https://www.vanityfair.com/hollywood/2022/03/awards-insider-who-votes-for-the-oscars
const NUMBER_VOTERS_2022 = 9579;
const NUMBER_VOTERS_2012 = 5765;
// source: https://www.thewrap.com/academy-membership-grows-oscar-voters-9500/ 
let branchsizes_2022 = [
    {"id": "Actors", "seats": 1302},
    {"id": "Casting Directors", "seats": 154},
    {"id": "Cinematographers", "seats": 290},
    {"id": "Costume Designers", "seats": 169},
    {"id": "Directors", "seats": 573},
    {"id": "Documentary", "seats": 648},
    {"id": "Executives", "seats": 694},
    {"id": "Film Editors", "seats": 376},
    {"id": "Makeup Artists and Hairstylists", "seats": 236},
    {"id": "Marketing and Public Relations", "seats": 614},
    {"id": "Music", "seats": 388},
    {"id": "Producers", "seats": 648},
    {"id": "Production Design", "seats": 390},
    {"id": "Short Films and Feature Animation", "seats": 867},
    {"id": "Sound", "seats": 549},
    {"id": "Visual Effects", "seats": 615},
    {"id": "Writers", "seats": 510},
    {"id": "Members-at-Large", "seats": 556}
];

let genderproportions_2022 = [
    {"id": "Women", "seats": 3161}, //9579 * 0.33 rounded down
    {"id": "Men", "seats": 6418}
]

let raceproportions_2022 = [
    {"id": "People of Color", "seats": 1820}, //9579 * 0.19 rounded down
    {"id": "White", "seats": 6418}
]