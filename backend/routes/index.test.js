var app = require("../app")
var request = require("supertest")

/* GET BREWERIES */

test("Récupère les brasseries en fonction de sa position, utilisateur ok", async () => {
    await request(app).get('/get-breweries')
        .query({token: 15115, position: {lat: 43.2333, long: 120.5222}}) 
        .expect(200)
        .expect({message: true, breweries: [], user: {}, text: 'utilisateur déjà connecté'});
});

test("Récupère les brasseries en fonction de sa position, utilisateur non", async () => {
    await request(app).get('/get-breweries')
        .query({position: {lat: 43.2333, long: 120.5222}}) 
        .expect(200)
        .expect({message: true, breweries: [], text: "pas d'utilisateur"});
});

test("Geoloc non acceptée", async () => {
    await request(app).get('/get-breweries')
        .expect(200)
        .expect({message: false, text: "geoloc non acceptée"});
});

/* GET BEERS */

test('Récupère les bières de la brasserie en question', async () => {
    await request(app).get('/get-beers')
    .query({brewery: 'Brasserie la Demi-lune'})
    .expect(200)
    .expect({message: true, beers: [], notes: []});
})

/* GET SELLERS */

test('Récupère les revendeurs de la bière en question', async () => {
    await request(app).get('/get-sellers')
    .query({position: {lat: 43.2333, long: 120.5222}, beer: 'La Champ Libre'})
    .expect(200)
    .expect({message: true, sellers: []})
})

/* GET BEERS AND NOTES */

test('Récupérer les bières et notes', async () => {
    await request(app).get('/get-beers-n-notes')
    .expect(200)
    .expect({message: true, beers: [], notes: []})
})




