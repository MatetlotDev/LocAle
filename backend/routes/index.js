var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const beerModel = require('../model/beers');
const userModel = require('../model/users');
const sellerModel = require('../model/sellers');
const noteModel = require('../model/notes');



function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


router.get('/get-breweries', async (req, res) => {
  console.log('requete')

  const user = await userModel.findOne({token: req.query.token}).populate('wishlist');

  //récupération de la position de l'utilisateur depuis le front
  let position = JSON.parse(req.query.position);
  if (position) {
    //récupération des brasseries de la base de données
    let breweries = await sellerModel.find({ type: "brewery" });
    let localBreweries = [];
    // calcul des brasseries à moins de 20 kms de l'utilisateur
    for (let i = 0; i < breweries.length; i++) {
      const d = getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude, breweries[i].latitude, breweries[i].longitude);
      if (d <= 26) {
        localBreweries.push({brewerie: breweries[i], distance: d});
      }
    };
    //tri du tableau des brasseries de la plus proche à la moins proche
    localBreweries.sort((a, b) => a.distance - b.distance);

    // ci-dessous condition token à modifier lors de l'intégration de la connection de l'utilisateur
    
    user ?
      res.json({ message: true, breweries : localBreweries, user: user, text: 'utilisateur connecté' }) :
      res.json({ message: true, breweries : localBreweries, text: "pas d'utilisateur" })
  } else res.json({ message: false, text: 'geoloc non acceptée' })
})


router.get('/get-beers/:breweryId', async (req, res) => {
  let breweryId = req.params.breweryId
  
  let sellers = await sellerModel.find({type: 'brewery'}).populate('stock');
  let beers = await beerModel.find().populate({path: 'notes', populate: {path:'owner'} });

  let stock;
  sellers.forEach(el => {
    if(el.id === breweryId) stock = el.stock
  })

  const beerWithNote = [];
  beers.forEach(el => {
    stock.forEach(e => {
      if(e.id === el.id) beerWithNote.push(el)
    })
  })

  res.json({beers: beerWithNote})
})


router.get('/get-sellers/:position/:id', async (req, res) => {

  const position = JSON.parse(req.params.position)
  const sellerOk = [];
  const sellers = await sellerModel.find().populate('stock').exec();

  for (let i = 0; i < sellers.length; i++) {
    const d = getDistanceFromLatLonInKm(position.latitude, position.longitude, sellers[i].latitude, sellers[i].longitude)

    if(d <= 26){ // si c'est à moins de 20 km
      sellers[i].stock.forEach(el => {
        if (el.id === req.params.id) sellerOk.push(sellers[i])
      })
    }    
  }

  res.json({ sellers: sellerOk })
})


router.get('/get-beers-n-notes', async (req, res) => {

  const breweries = await sellerModel.find({type: 'brewery'}).populate('stock');
  const beers = await beerModel.find().populate('notes');

  let datas = [];
  breweries.forEach((el, i) => datas.push({key: i, id: el.id, name: el.name, icon: ""}))
  beers.forEach((el, i) => {
    let brewery;
    breweries.forEach(e => {
      e.stock.forEach(ele => {
        if(ele.id === el.id) brewery = e.name;
      })
    })
    let avg = 0;
    el.notes.forEach(e => avg += e.note);
    if(el.notes !== 0) avg = avg / el.notes.length;
    datas.push({key: (i + breweries.length), id: el.id, name: el.name, icon: "", note: avg, brewery: brewery});
  })

  res.json(datas)
})


// récupère uniquement une bière via son ID 
router.get('/get-beer/:id', async (req, res) => {
  const beer = await beerModel.findById(req.params.id).populate({path: 'notes', populate: {path:'owner'} });
  res.json(beer);
})

// récupère uniquement une brasserie via son ID
router.get('/get-brewery/:id', async (req, res) => {
  const brewery = await sellerModel.findById(req.params.id);
  res.json(brewery)
})

// récupérer la brasserie qui a cette bière en stock 
// (quand on revient de la page bière vers la page liste)
router.get('/get-brewery-from-beer/:beerId', async (req, res) => {
  const brewery = await sellerModel.find({type: 'brewery'}).populate('stock')
  let selectBrewery;
  brewery.forEach(el => {
    el.stock.forEach(e => {
      if(e.id === req.params.beerId) selectBrewery = el
    })
  })
  
  res.json(selectBrewery)
})



// --- ROUTE POUR AJOUTER EN DB --- //

// router.get('/deletenote', async (req, res) => {
//   const note = await noteModel.findById('61bb258244645e0b2dcb0c62').populate('owner').populate('beer')
//   const beer = await beerModel.findById(note.beer.id).populate('notes')
//   const owner = await userModel.findById(note.owner.id).populate('notes')

  
//   beer.notes.forEach((el, i) => {
//     if(el.id === note.id) beer.notes.splice(i, 1)
//   })

//   owner.notes.forEach((el, i) => {
//     if(el.id === note.id) owner.notes.splice(i, 1)
//   })

//   await beer.save()
//   await owner.save()
//   await noteModel.findByIdAndDelete(note.id)
  
//   res.json({beer: beer.notes, owner: owner.notes, note: note})
// })

// router.get('/update-brewery', async (req, res) => {
//   const seller = await sellerModel.findOne({name: 'DEMI-LUNE Brasserie'});
//   const beers = await beerModel.find();
//   beers.forEach(el => seller.stock.push(el.id))
//   await seller.save();
//   res.json({seller})
// })

// router.get('/add-note', async (req, res) => {
//   const user = await userModel.findOne({pseudo: 'Matetlot'})
//   const beer = await beerModel.findOne({name: 'Promenade des Tuileries'})

//   const newNote = new noteModel({
//     note: 3, 
//     comment: 'Une super bière de caractère.',
//     owner: user.id,
//     beer: beer.id,
//   })
//   user.notes.push(newNote.id)
//   beer.notes.push(newNote.id)

//   await user.save();
//   await beer.save();
//   await newNote.save();

//   res.json({newNote})
// })

// router.get('/add-user', async (req, res) => {
//   const newUser = new userModel({
//     pseudo: 'Matetlot',
//     token: uid2(32),
//     email: 'mat@gmail.com',
//     password: bcrypt.hashSync('admin', 10),
//     insert_date: new Date,
//   })
//   const user = newUser.save()
//   res.json({user})
// })

// router.get('/add-beer', async (req, res) => {
//   const newBeer = new beerModel({
//     name: "Bali Balo",
//     slogan: "Les IPA-lovers apprécieront le mariage de ses trois houblons, qui apportent une amertume et des arômes soulignés par l’ajout de riz.",
//     alcool: 5.8,
//     type: 'Indian Pale Ale',
//     picture: 'https://lachenou.fr/wp-content/uploads/2019/10/20200409_112714..jpg'
//   })
//   const beer = await newBeer.save()
//   res.json({beer})
// })

// router.get('/add-brewery', async (req, res) => {
//   const beer1 = await beerModel.findById('61bb0dddc8fe41bf1a72db5d')
//   const beer2 = await beerModel.findById('61bb0d644c8ea03fd90a7e3f')
//   const beer3 = await beerModel.findById('61bb0aee4c440943fb7fd24d')
//   const beer4 = await beerModel.findById('61bb0a0e6d7f0fff8876cc3d')
//   const beer5 = await beerModel.findById('61bb095180b7ddf602f33b78')
//   const beer6 = await beerModel.findById('61bb07e4333e324a33190a2f')
//   // const beer7 = await beerModel.findById('61ba099072f6ea2832a60635')
//   // const beer8 = await beerModel.findById('61ba09e30083d24b9927a5f7')
//   const newSeller = new sellerModel({
//     type: 'restaurant',
//     name: "Kitchen Garden",
//     description: "",
//     adress: "14 Pl. Docteurs Charles et Christophe Mérieux, 69007 Lyon",
//     latitude: 45.7319043,
//     longitude: 4.8259058,
//     website: 'http://restaurantkitchengarden.com/',
//     stock: [beer1.id, beer2.id, beer3.id, beer4.id, beer5.id, beer6.id],
//     pictures: [],
//     hours: [
//       {
//         day: 0,
//         openings: 'Fermé'
//       },
//       {
//         day: 1,
//         openings: '12h - 14h'
//       },
//       {
//         day: 2,
//         openings: '12h - 14h'
//       },
//       {
//         day: 3,
//         openings: '12h - 14h'
//       },
//       {
//         day: 4,
//         openings: '12h - 14h'
//       },
//       {
//         day: 5,
//         openings: '12h - 14h'
//       },
//       {
//         day: 6,
//         openings: 'Fermé'
//       },
//     ]
//   })
//   const seller = await newSeller.save();
//   res.json({seller})
// })



module.exports = router;
