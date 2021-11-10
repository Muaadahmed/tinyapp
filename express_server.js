const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

function generateRandomString() {
  let alphanumerics = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomChar = '';
  for (let i = 0; i < 6; i++) {
    let randomNumber = Math.floor(Math.random() * alphanumerics.length - 0);
    randomChar += alphanumerics[randomNumber];
  }
  return randomChar;
};

app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const templateVars  = { urls: urlDatabase, username: req.cookies['username'], };
  res.render('urls_index.ejs', templateVars);
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  let randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = req.body.longURL;  // Log the POST request body to the console
  res.redirect(`/urls/${randomShortURL}`);   // Respond with 'Ok' (we will replace this)    
  console.log(urlDatabase)
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars  = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`] };
  res.render('urls_show.ejs', templateVars);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const urlShortHand = req.params.shortURL;
  delete urlDatabase[urlShortHand];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});