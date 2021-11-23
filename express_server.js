const express = require("express");
const app = express();

const PORT = 8080;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['sadkasdjkajds', 'key2']
}));
const bcrypt = require('bcryptjs');

app.set("view engine", "ejs");

const { getUserByEmail } = require('./helpers');

const generateRandomString = function() {
  let alphanumerics = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomChar = '';

  for (let i = 0; i < 6; i++) {
    let randomNumber = Math.floor(Math.random() * alphanumerics.length - 0);
    randomChar += alphanumerics[randomNumber];
  }

  return randomChar;
};

//returns object of shortURLs that match the sessions user ID

const urlsForUser = (id) => {
  let userUrlObject = {};

  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrlObject[shortURL] = urlDatabase[shortURL];
    }
  }

  return userUrlObject;
};

//Identify user credentials

const users = {};

// Identify user url ownership

const urlDatabase = {};

app.get('/', (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  if (user) {
    res.redirect('/urls');
    return;
  }

  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  console.log('get urls userID', userId);
  console.log(user);
  if (!user) {
    res.status(403).send('<html><body><b>User is not Logged in</b></body></html>');
    return;
  }

  const userUrlObject = urlsForUser(userId);
  const templateVars  = { urls: userUrlObject, user };
  res.render('urls_index.ejs', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  const templateVars  = { user };

  if (!user) {
    return res.redirect('/login');
  }

  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let randomShortURL = generateRandomString();
  const userId = req.session['user_id'];
  const user = users[userId];

  if (!user) {
    res.status(403).send('<html><body><b>User must be Logged in to create url</b></body></html>');
    return;
  }

  urlDatabase[randomShortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  console.log(urlDatabase);
  res.redirect(`/urls/${randomShortURL}`);
});

app.get('/u/:shortURL', (req, res) => {
  const shortUrlVal = req.params.shortURL;

  //Makes sure that the url is an existing url

  if (!urlDatabase[shortUrlVal]) {
    res.status(400).send('<html><body><b>shortURL Doesn\'t Exist</b></body></html>');
    return;
  }

  const longURLWebsite = urlDatabase[shortUrlVal]['longURL'];
  longURLWebsite.includes('https://') ? res.redirect(longURLWebsite) :
    res.redirect(`https://${longURLWebsite}`);
});

app.get('/urls/:shortURL', (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  const templateVars  = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userID: req.session.user_id, user };

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('<html><body><b>shortURL Doesn\'t Exist</b></body></html>');
  }

  // Excludes the two urls that are already in database

  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.send('<html><body><b>shortURL Doesn\'t belong to user</b></body></html>');
  }

  res.render('urls_show.ejs', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const urlShortHand = req.params.shortURL;

  if (urlDatabase[urlShortHand].userID === req.session.user_id) {
    delete urlDatabase[urlShortHand];
  }

  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const urlShortHand = req.params.shortURL;
  const urlLongHand = req.body.longURL;

  if (urlDatabase[urlShortHand].userID === req.session.user_id) {
    urlDatabase[urlShortHand].longURL = urlLongHand;
  }

  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { email } = req.body;
  const { data, error } = getUserByEmail(users, email);

  if (!error) {
    req.session.user_id = data.id;
    return res.redirect('/urls');
  }
  
  res.status(403).send(`<html><body><b>${error}</b></body></html>`);
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  const templateVars = { user };

  if (user) {
    res.redirect('/urls');
    return;
  }
  res.render('register_form', templateVars);
});


app.post('/register', (req, res) => {

  //Checks that the user entered email and password.

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('<html><body><b>Please Enter Email and Password</b></body></html>');
    return;
  }

  //Makes sure user isn't registering with an already created email.

  for (let key in users) {
    if (users[key].email === req.body.email) {
      res.status(400);
      res.send('<html><body><b>400 user already registered</b></body></html>');
      return;
    }
  }
  
  let randomShortURL = generateRandomString();
  const { email, password } = req.body;

  //Registers user

  users[randomShortURL] = {
    id: randomShortURL,
    email,
    password: bcrypt.hashSync(password, 10)
  };

  req.session.user_id = randomShortURL;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  const templateVars = { user };

  if (user) {
    res.redirect('/urls');
    return;
  }
  
  res.render('login_form', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});