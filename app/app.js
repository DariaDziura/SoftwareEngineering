/**
 * MEDIASWAP - Main Application File
 * Module: Software Engineering (CMP-N204-0)
 * * This file handles the routing and server configuration for the 
 * MediaSwap "gift economy" platform.
 */

const express = require("express");
const path = require("path");
const app = express();

// 1. MIDDLEWARE & STATIC ASSETS
// Serves CSS, client-side JS, and images from the 'static' folder
app.use(express.static("static"));

// 2. DATABASE & MODELS
// Import the centralized database service
const db = require('./services/db');

// Initialize Models for Sprint 3 functionality
const Item = require("./Models/Item");
const itemModel = new Item(db);

const User = require("./Models/User");
const userModel = new User(db);

const Category = require("./Models/Category");
const categoryModel = new Category(db);

// 3. VIEW ENGINE SETUP
// Configures PUG as the templating engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// --------------------------------------------------------
// 4. ROUTES - LISTINGS & CATEGORIES
// --------------------------------------------------------

// Root Route: Redirects to the main listings page
app.get("/", function(req, res) {
    res.redirect("/listings");
});

// Listings Page: Displays all books and records or filters by category
// Requirement: "Listing page"
app.get("/listings", async function(req, res) {
    try {
        const categoryId = req.query.category;
        const listings = categoryId
            ? await itemModel.getByCategory(categoryId)
            : await itemModel.getAll();

        res.render("listings", { listings });
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Item Detail Page: Shows specific info for a book or record
// Requirement: "Detail page"
app.get("/listings/:id", async function(req, res) {
    try {
        const itemId = req.params.id;
        const item = await itemModel.getById(itemId);
        if (!item) return res.status(404).send("Item not found");

        res.render("item_detail", { item });
    } catch (err) {
        console.error("Error fetching item details:", err);
        res.status(500).send("Error loading item details");
    }
});

// Category List: Shows all available genres for filtering
app.get("/categories", async function(req, res) {
    try {
        const categories = await categoryModel.getAll();
        res.render("categories", { categories });
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).send("Error loading categories");
    }
});

// --------------------------------------------------------
// 5. ROUTES - USERS & PROFILES
// --------------------------------------------------------

// Users List: Displays all community members
// Requirement: "Users list page"
app.get("/users", async function(req, res) {
    try {
        const users = await userModel.getAll();
        res.render("users", { users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).send("Error loading users");
    }
});

// User Profile: Displays user info and their specific listings
// Requirement: "User profile page"
app.get("/users/:id", async function(req, res) {
    try {
        const userId = req.params.id;
        const user = await userModel.getById(userId);
        const listings = await itemModel.getByUser(userId);

        if (!user) return res.status(404).send("User not found");
        res.render("profile", { user, listings });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).send("Error loading profile");
    }
});

// --------------------------------------------------------
// 6. UTILITY & TEST ROUTES
// --------------------------------------------------------

// Database Connection Test
// Verifies connection to the 'softwareeng' database
app.get("/db_test", async function(req, res) {
    try {
        // Updated from 'test_table' to 'users' to match current schema
        const sql = 'SELECT username, email FROM users LIMIT 5';
        const results = await db.query(sql);
        res.json(results);
    } catch (err) {
        res.status(500).send("Database connection failed: " + err.message);
    }
});

app.get("/goodbye", function(req, res) {
    res.send("Goodbye from MediaSwap!");
});

// --------------------------------------------------------
// 7. SERVER START
// --------------------------------------------------------
app.listen(3000, function() {
    console.log(`MediaSwap running at http://localhost:3000/`);
});
