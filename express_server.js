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

const urlsForUser = (id) => {
  let userUrlObject = {};
  for (let shortURL in urlDatabase) {
    console.log('urlsForUser shortURL: ',shortURL);
    if (urlDatabase[shortURL].userID === id) {
      userUrlObject[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrlObject;
};

app.use(cookieParser());

app.set("view engine", "ejs");

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const users = {};

// The purpose of this function was to get the email and password
// and authenticate them

const emailPassAuthentication = (userDB, email, password) => {
  console.log('emailPassAuthentication: ', userDB);
  console.log('emailPassAuth: ', email);
  for (let id in userDB) {
    let user = userDB[id];
    if (user && user.password === password) {
      return {data: user, error: null};
    }
    // if (!user) {
    //   return {data: null, error: 'Not Valid Email'};
    // }
  
  }
  // let user = userDB[];
  // let userPass = userDB[id][password];
  // if (!user) {
  //   return {data: null, error: 'Not Valid Email'};
  // }

  // if (!userPass) {
  //   return {data: null, error: 'Not Valid Password'};
  // }

  // // if (!user) {
  //   return {data: null, error: 'Not Valid Email'};
  // }

  // return {data: user[id], error: null};
  //Include password with hashing later
  return {data: null, error: 'Not Valid Login'};
}

const urlDatabase = {
  b6UTxQ: {
      longURL: "www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "www.google.ca",
      userID: "aJ48lW"
  }
};


app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  console.log('user Object /urls', req.cookies.user_id);
  const userId = req.cookies['user_id'];
  const user = users[userId];
  if (!user) {
    res.status(403).send('User is not Logged in');
  }
  console.log('userId', userId);
  let userUrlObject = urlsForUser(userId);
  
  const urlDataBaseShortUrls = Object.keys(urlDatabase);
  // const templateVars  = { DBKeys: urlDatabase, shortURL: urlDataBaseShortUrls, urls: userUrlObject, user};
  const templateVars  = { urls: userUrlObject, user, userDB: urlDatabase, shortURL: urlDataBaseShortUrls,};
  console.log(templateVars);
  res.render('urls_index.ejs', templateVars);
})

app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id'];
  console.log('url_new id check: ', req.cookies.user_id);
  console.log('users object on url_new', users);
  const user = users[userId];
  console.log(user);
  const templateVars  = { user };
  if (!user) {
    return res.redirect('/login');
  } 
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let randomShortURL = generateRandomString();
  //urlDatabase[randomShortURL] = req.body.longURL;  // Log the POST request body to the console
  urlDatabase[randomShortURL] = {longURL: req.body.longURL, userID: req.cookies.user_id}; 
  console.log('user_id', req.body.user_id);
  console.log('urlDatabase', urlDatabase);
  res.redirect(`/urls/${randomShortURL}`);   // Respond with 'Ok' (we will replace this)    
});

app.get('/u/:shortURL', (req, res) => {
  const shortUrlVal = req.params.shortURL;
  console.log('shorURL: ', shortUrlVal);
  if (!urlDatabase[shortUrlVal]) {
    return res.status(400).send('shortURL Doesn\'t Exist');
  }
  console.log('longURL before setting value: ', urlDatabase[shortUrlVal]['longURL']);
  console.log('shorURL object: ', urlDatabase[shortUrlVal]);
  const longURLWebsite = urlDatabase[shortUrlVal]['longURL'];
  console.log('longURL: ', longURLWebsite);
  //const longURL = urlDatabase[req.params.shortURL]// ????????
  res.redirect(`https://${longURLWebsite}`);
});

app.get('/urls/:shortURL', (req, res) => {
  //const templateVars  = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`] }
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const templateVars  = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userID: req.cookies.user_id, user };
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('shortURL Doesn\'t Exist');
  }
  if (Object.keys(urlDatabase).length > 2 && urlDatabase[req.params.shortURL].userID !== req.cookies.user_id) {
    res.send('shortURL Doesn\'t belong to user');
  }
  console.log('req: ', req.cookies.user_id);
  res.render('urls_show.ejs', templateVars);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const urlShortHand = req.params.shortURL;
  // Deleting the whole object ??
  //console.log('user ID in urls/short/delete: ', req.cookies.user_id);
  if (urlDatabase[urlShortHand].userID === req.cookies.user_id) {
    delete urlDatabase[urlShortHand];
  }
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const urlShortHand = req.params.shortURL;
  const urlLongHand = req.body.longURL;
  console.log('url short hand:', urlShortHand);
  if (urlDatabase[urlShortHand].userID === req.cookies.user_id) {
    urlDatabase[urlShortHand].longURL = urlLongHand;
  }
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  console.log('what user sent back; email and password', req.body, 'cookies', req.cookies);
  const { email, password } = req.body;
  const { data, error } = emailPassAuthentication(users, email, password);
  if (!error) {
    res.cookie('user_id', data.id);
    return res.redirect('/urls');
  }
  res.status(403);
  res.send(error);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  res.render('register_form');
});
// when we type '/register' in the url the req.body will give us back the
// form information that the user typed so the email and the password
// is given back as an object(body parser parses the info to give us back the email and password) when we type req.body().
// User Id is not contained in here, because we are registering, we are setting 
// the userId so we cannot access it.
app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    return;
  } else {
    for (let key in users) {
      if (users[key].email === req.body.email) {
        res.status(400);
        res.send('400 user already registered');
        return;
      }
    }
    let randomShortURL = generateRandomString();
    const { email, password } = req.body;
    users[randomShortURL] = {
      id: randomShortURL,
      email,
      password
    };
    res.cookie('user_id', randomShortURL);
    console.log(users);
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  res.render('login_form');
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