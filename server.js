// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const cookieSession = require("cookie-session")
const app        = express();
const morgan     = require('morgan');

//A user session can be stored in two main ways with cookies: on the server or on the client
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

const database = require('./routes/database')
// // PG database client/connection setup
// const { Pool } = require('pg');
// const dbParams = require('./lib/db.js');
// const db = new Pool(dbParams);
// db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/usersRoutes");
const widgetsRoutes = require("./routes/widgets");
const resourceRoutes = require("./routes/resourceRoutes");


// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(database));
app.use("/api/widgets", widgetsRoutes(database));
app.use("/api/resources", resourceRoutes(database));

// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  const userId = req.session.userId;
  database.getAllResources()
  .then(data => {
    console.log('some data', data)
    let revData = data.reverse()
    database.getUserById(userId)
    .then(userInfo => {
      res.render("index", { userId, revData, userInfo });
    })
  })
  .catch(err => {
    res
    .status(500)
    .json({ error: err.message });
  });

});

app.get("/myResources", (req, res) => {
  res.redirect('/api/resources/myResources')
})


app.listen(PORT, () => {
  console.log(`Taktivity app listening on port ${PORT}🇨🇦`);
});
