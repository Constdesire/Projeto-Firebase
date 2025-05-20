const express = require("express")
const app = express()
const exphbs = require("express-handlebars")
const bodyParser = require("body-parser")
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

const serviceAccount = require('./projetoweb-84177-firebase-adminsdk-fbsvc-d52bb33cf8.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    eq: function (a, b) {
      return a === b;
    }
  }
});

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.listen(8081, function(){
    console.log('Servidor Ativo!')
})

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.post('/cadastrar', async function(req, res){
    try {
      await db.collection('posts').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
      });
      res.redirect('/');
    } catch (erro) {
      res.send('Erro ao criar o post: ' + erro);
    }
  });
  

  app.get('/consulta', async (req, res) => {
    try {
        const snapshot = await db.collection('posts').get();
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.render('consulta', { posts });
    } catch (error) {
        res.send('Erro ao consultar posts: ' + error.message);
    }
});

  
  app.get('/editar/:id', async function(req, res){
    try {
      const doc = await db.collection('posts').doc(req.params.id).get();
      if (!doc.exists) {
        return res.send('Post não encontrado!');
      }
      res.render('editar', { post: { id: doc.id, ...doc.data() } });
    } catch (erro) {
      res.send('Erro ao buscar o post: ' + erro);
    }
  });
  

  

app.post('/atualizar/:id', async function(req, res){
    try {
      await db.collection('posts').doc(req.params.id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
      });
      res.redirect('/consulta');
    } catch (erro) {
      res.send('Erro ao atualizar o post: ' + erro);
    }
  });
  

  
  app.get('/excluir/:id', async function(req, res){
    try {
      await db.collection('posts').doc(req.params.id).delete();
      res.redirect('/consulta');
    } catch (erro) {
      res.send('Erro ao excluir o post: ' + erro);
    }
  });