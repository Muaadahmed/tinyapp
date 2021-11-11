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

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const users = {};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const templateVars  = { urls: urlDatabase, user };
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

app.get('/register', (req, res) => {
  res.render('register_form');
});
// when we type '/register' in the url the req.body will give us back the
// form information that the user typed so the email and the password
// is given back as an object(body parser parses the info to give us back the email and password) when we type req.body(). 
app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.statusCode = 404;
    res.send(res.statusCode);
  } else {
    for (let key in users) {
      if (key === req.cookies.user_id) {
        res.statusCode = 404;
        res.send(res.statusCode);
      }
    }
    let randomShortURL = generateRandomString();
    users[randomShortURL] = {
      id: randomShortURL,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', randomShortURL);
    console.log(users);
    res.redirect('/urls');
  }
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