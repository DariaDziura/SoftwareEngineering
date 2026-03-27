const express = require("express");
const app = express();
const path = require("path");

// 1. Setup Database Connection 
// (We go up one level to services/db because we are already in the app folder)
const db = require("./services/db"); 

// 2. Import Models
const User = require("./Models/User");
const Item = require("./Models/Item");
const Category = require("./Models/Category");

// Initialize Model Instances
const userModel = new User(db);
const itemModel = new Item(db);
const categoryModel = new Category(db);

// 3. Setup View Engine (Pug)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, Images)
app.use(express.static("static"));

// --- ROUTES ---

// Home Page
app.get("/", function(req, res) {
    res.render("index", { title: "Home" });
});

// All Listings Page
app.get("/listings", async function(req, res) {
    try {
        const listings = await itemModel.getAll();
        res.render("listings", { title: "All Listings", listings });
    } catch (err) {
        res.status(500).send("Error fetching listings: " + err.message);
    }
});

// Item Details Page
app.get("/details/:id", async function(req, res) {
    try {
        const item = await itemModel.getById(req.params.id);
        if (!item) return res.status(404).send("Item not found");
        res.render("details", { title: item.title, item });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Categories Page
app.get("/categories", async function(req, res) {
    try {
        const categories = await categoryModel.getAll();
        res.render("categories", { title: "Categories", categories });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Community / Users Page
app.get("/users", async function(req, res) {
    try {
        const users = await userModel.getAll();
        res.render("users", { title: "Community", users });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Individual User Profile
app.get("/users/:id", async function(req, res) {
    try {
        const user = await userModel.getById(req.params.id);
        if (!user) return res.status(404).send("User not found");
        const listings = await itemModel.getByUser(req.params.id);
        res.render("profile", { title: user.username, user, listings });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- DATABASE TEST ROUTE ---
// Use this to verify your SQL script loaded John Villa correctly
app.get("/db_test", async function(req, res) {
    try {
        const rows = await db.query("SELECT * FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).send("Database connection failed: " + err.message);
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`MediaSwap running at http://localhost:${PORT}`);
});
