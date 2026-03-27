// Import express.js
const express = require("express");
const path = require("path");
// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

const Item = require("./Models/Item");
const itemModel = new Item(db);

const User = require("./Models/User");
const userModel = new User(db);

const Category = require("./Models/Category");
const categoryModel = new Category(db);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Create a route for root/ listings - /
app.get("/", async function(req, res) {
  try {
    const listings = await itemModel.getAll();
    console.log("Listings:", listings);
    res.render("listings", { listings });
  } catch (err) {
    console.error("Route error:", err);
    res.status(500).send(err.message);
  }
});

//Create route for details
app.get("/users/:id", async function(req, res) {
  try {
    const userId = req.params.id;
    const user = await userModel.getById(userId);
    const listings = await itemModel.getByUser(userId);

    res.render("profile", { user, listings });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//route for users' list
app.get("/users", async function(req, res) {
  try {
    const users = await userModel.getAll();
    res.render("users", { users });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.get("/users", async function(req, res) {
  try {
    const users = await userModel.getAll();
    res.render("users", { users });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.get("/categories", async function(req, res) {
  try {
    const categories = await categoryModel.getAll();
    res.render("categories", { categories });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.get("/listings", async function(req, res) {
  try {
    const categoryId = req.query.category;
    const listings = categoryId
      ? await itemModel.getByCategory(categoryId)
      : await itemModel.getAll();

    res.render("listings", { listings });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results)
    });
});

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});