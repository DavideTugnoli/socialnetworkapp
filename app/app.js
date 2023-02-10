const express = require('express');

const db = require('./db.js'); // recupera l'esportazione del file db.js
const app = express();
var cookieParser = require("cookie-parser");
const {isAuthenticated} = require('./check-auth');
require("dotenv").config();
const path = require('path');

const authApi = require("./routes/auth.js");
const followersApi = require("./routes/followers.js");
const likesApi = require("./routes/like.js");
const messagesApi = require("./routes/messages.js");
const socialApi = require("./routes/social.js");

app.use(express.static('public'));
app.use(cookieParser());
app.use(isAuthenticated);
app.use(express.json());

app.get('/message/:userId/:msgId', async function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/profile/:userId', async function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use("/api/social/like", likesApi);
app.use("/api/auth", authApi);
app.use("/api/social/messages", messagesApi);
app.use("/api/social/followers", followersApi);
app.use("/api/social", socialApi);

app.use((req, res, next) => {
  res.status(404).redirect('/');
});


app.listen(3000 , async () => { 
  console.log('Server avviato e funzionante!');
  await  db.connect(); // connessione al db (aspetta finchè non è connesso/valorizzato il db)
  console.log("Connesso a MongoDB");
});

