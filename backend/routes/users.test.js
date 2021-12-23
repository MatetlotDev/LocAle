var app = require("../app")
var request = require("supertest")

/* ADD NOTE */

test('Ajoute un commentaire', async () => {
    await request(app).post('/users/add-note')
    .send({beer: 'La Champ Libre', token: 15488489, comment: 'incroyable', note: 5})
    .expect(200)
    .expect({message: true})
})

/* SIGN IN */

test('Sign-in email et Mdp ok', async () => {
    await request(app).post('/users/sign-in')
    .send({email: 'mat@gmail', password: 123})
    .expect(200)
    .expect({message: true, user: {}})
})

test('Sign-in email ok et Mdp non', async () => {
    await request(app).post('/users/sign-in')
    .send({email: 'mat@gmail', password: 1234})
    .expect(200)
    .expect({message: false, text: 'mot de passe incorrect'})
})

test('Sign-in email non', async () => {
    await request(app).post('/users/sign-in')
    .send({email: 'mat@gmail4', password: 123})
    .expect(200)
    .expect({message: false, text: 'email incorrect'})
})

/* SIGN UP */

test('Sign-up ok', async () => {
    await request(app).post('/users/sign-up')
    .send({email: 'mat@gmail4', password: 123, pseudo: 'mat'})
    .expect(200)
    .expect({message: true, user: {}})
})

test('Sign-up info manquante', async () => {
    await request(app).post('/users/sign-up')
    .send({password: 123, pseudo: 'mat'})
    .expect(200)
    .expect({message: false, text: 'info manquante'})
})