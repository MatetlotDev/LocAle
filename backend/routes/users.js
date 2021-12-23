const express = require('express');
const beerModel = require('../model/beers');
const noteModel = require('../model/notes');
const userModel = require('../model/users');
const router = express.Router();
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
var bcrypt = require('bcrypt');
var uid2 = require('uid2');

cloudinary.config({   
 cloud_name: process.env.CLOUD_NAME,
 api_key: process.env.API_KEY,
 api_secret: process.env.API_SECRET 
});


router.post('/add-note', async (req, res) => {

  const user = await userModel.findOne({token: req.body.token}).populate('notes')
  const beer = await beerModel.findById(req.body.beerId).populate('notes')

  const newNote = new noteModel({
    note: req.body.note,
    comment: req.body.comment,
    date: new Date,
    owner: user.id,
    beer: beer.id,
  })
  const savedNote = await newNote.save()
  const saveNote = await noteModel.findById(savedNote.id).populate('owner')

  user.notes.unshift(saveNote.id);
  await user.save()
  beer.notes.unshift(saveNote.id);
  await beer.save()

  res.json({saveNote, beer})
})


router.post('/sign-in', async function(req,res,next){
  
  const email = req.body.email

  const user = await userModel.findOne({email: email.toLowerCase()}).populate('wishlist')
  
    if(user){
      if(bcrypt.compareSync(req.body.password, user.password) 
         || req.body.password === user.password){
        
        res.json({token: user.token, error: '', wishlist: user.wishlist})
      } else res.json({error: 'Mot de passe incorrect.'})      
    } else res.json({error: 'Pas de compte avec cette adresse.'})
})


router.post('/sign-up', async function(req,res,next){

  const email = req.body.email
  
  const user = await userModel.findOne({email: email.toLowerCase()})
  const userByPseudo = await userModel.findOne({pseudo: req.body.pseudo})
  

  if(!user){
    if(!userByPseudo){
      const newUser = new userModel({
        pseudo: req.body.pseudo,
        email: email.toLowerCase(),
        insert_date: new Date(),
        password: bcrypt.hashSync(req.body.password, 10),
        token: uid2(32),
        avatar: req.body.avatar,
      })
      const saveUser = await newUser.save()

      res.json({token: saveUser.token, error: '', password: saveUser.password, email: saveUser.email})
    }else res.json({error: 'Pseudo déjà pris.'})
  }else res.json({error: 'Vous avez déjà un compte.', password: user.password})  
})


router.get('/add-To-Wishlist/:beerId/:token', async (req, res) => {
  const user = await userModel.findOne({token: req.params.token}).populate('wishlist');

  let message = 'Bière ajoutée dans les favorites !';
  let add = false;
  let indice;

  
  user.wishlist.forEach((el, i) => {
    if(el.id === req.params.beerId) {
      add = true;
      indice = i;
    }
  })

  if(add){
    user.wishlist.splice(indice, 1);
    message = 'Bière retirée.';
  }else user.wishlist.push(req.params.beerId)

  await user.save()
  res.json({message, wishlist: user.wishlist})
})



router.get('/get-user-infos', async (req, res) => {
  //récupération des infos de l'utilisateur en BDD
  let userInfos = await userModel.findOne({token: req.query.token}).populate({path: 'notes', populate: {path:'beer'} });

  userInfos ?
      res.json({ message: true, user: userInfos, userNotes: userInfos.notes }) :
      res.json({ message: false })
})


router.post('/edit-pseudo', async (req, res) => {
  let user = await userModel.updateOne({token: req.body.token}, {pseudo: req.body.pseudo})
  user ?
  res.json({message: true, user}) :
  res.json({message: false})
})


router.post('/update-picture', async (req, res) => {
  //recoit le chemin vers l'image ajoutée par l'utilisateur
  //la sauvegarde dans un dossier temporaire en local
  //lui crée un nom d'image unique
  const imagePath = `./tmp/${uniqid()}.jpg`;
  let resultCopy = await req.files.avatar.mv(imagePath);

  if(!resultCopy) {
    //envoie sur cloudinary pour heberger l'image 
    const cloudResult = await cloudinary.uploader.upload(imagePath, {folder: 'LocAleUser'});
    //suppression du fichier dans le dossier temporaire
    fs.unlinkSync(imagePath);
    //ajout de l'url de l'image en BDD de l'user
    let userToken = req.files.avatar.name;
    let user = await userModel.updateOne({token: userToken}, {avatar: cloudResult.url});
    let userInfos =  await userModel.findOne({avatar: cloudResult.url})
    
    res.json({result: true, user: userInfos});      
  } else {
    res.json({result: false, message: resultCopy} );
  }

})


module.exports = router;

