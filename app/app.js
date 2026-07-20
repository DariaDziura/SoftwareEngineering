const express = require("express");
const app = express();
const path = require("path");

// 1. Setup Database Connection 
const db = require("./services/db"); 

// 2. Import Models
const User = require("./Models/User");
const Item = require("./Models/Item");
const Category = require("./Models/Category");

// 3. Require session
const session = require("express-session");

// Initialize Model Instances
const userModel = new User(db);
const itemModel = new Item(db);
const categoryModel = new Category(db);


// 3. Setup View Engine (Pug)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, Images)
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

// Ensuring Express can read form values
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "vinyl-swap-secret",
    resave: false,
    saveUninitialised: false
}));

// Make logged-in user available in every Pug file
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
});



// --- ROUTES ---

// Home Page
app.get("/", function(req, res) {
    res.render("index", {
        title: "Home",
     });
});

//login Page
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async function(req, res) {
    try {
        const { username, password } = req.body;

        const user = await userModel.getByUsername(username);

        if (!user) {
            return res.send("User not found");
        }

        // temporary plain-text check
        if (password !== user.password_hash) {
            return res.send("Incorrect password");
        }

        // Save user in session
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        // Everyone goes to the same dashboard
        return res.redirect("/dashboard");

    } catch (err) {
        res.status(500).send("Login error: " + err.message);
    }
});

// login route
app.get("/dashboard", function(req, res) {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.render("index", {
        user: req.session.user
    });

});

// logout route
app.get("/logout", function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            return res.redirect("/");
        }

        res.redirect("/");
    });
});

// All Listings Page
app.get("/listings", async function(req, res) {
    try {
        const listings = await itemModel.getAll();
        res.render("listings", { title: "All Listings", listings });
    } catch (err) {
        res.status(500).send("Error fetching listings: " + err.message);
    }
});// Swap History Page
app.get("/swaps", async function(req, res) {
    try {
        const swaps = [];

        res.render("swaps", {
            title: "Swap History",
            swaps
        });

    } catch (err) {
        res.status(500).send("Error loading swaps: " + err.message);
    }
});

// Filtered Category Page - FIX: This route handles the category filtering
app.get("/category/:id", async function(req, res) {
    try {
        const categoryId = req.params.id;
        
        // Fetch the category name for the page title
        const category = await categoryModel.getById(categoryId);
        if (!category) return res.status(404).send("Category not found");

        // Fetch only items belonging to this specific category
        const listings = await itemModel.getByCategory(categoryId);

        res.render("listings", { 
            title: `Category: ${category.category_name}`, 
            listings 
        });
    } catch (err) {
        res.status(500).send("Error filtering category: " + err.message);
    }
});

// Add New Listing Page
app.get("/listings/new", async function(req, res) {
    try {
        const genres = await db.query(`
            SELECT genre_id, genre_name, type_id
            FROM genres
            ORDER BY genre_name
        `);

        const mediaTypes = await db.query(`
            SELECT type_id, type_name
            FROM media_types
            ORDER BY type_name
        `);

        res.render("new-listing", {
            title: "Add New Listing",
            genres,
            mediaTypes,
            error: null,
            formData: {}
        });
    } catch (err) {
        res.status(500).send("Error loading form: " + err.message);
    }
});

// Save New Listing
app.post("/listings/new", async function(req, res) {
    try {
        const {
            title,
            description,
            item_condition,
            author_artist,
            isbn_album_title,
            type_id,
            genre_id
        } = req.body;

        if (!title || !item_condition || !type_id || !genre_id) {
            const genres = await db.query(`
                SELECT genre_id, genre_name, type_id
                FROM genres
                ORDER BY genre_name
            `);

            const mediaTypes = await db.query(`
                SELECT type_id, type_name
                FROM media_types
                ORDER BY type_name
            `);

            return res.status(400).render("new-listing", {
                title: "Add New Listing",
                genres,
                mediaTypes,
                error: "Please complete all required fields.",
                formData: req.body
            });
        }

        // Temporary owner until login/session integration is completed
        const owner_id = req.session.user.id;

        const newItemId = await itemModel.create({
            owner_id,
            type_id,
            genre_id,
            title: title.trim(),
            description: description ? description.trim() : null,
            item_condition,
            author_artist: author_artist ? author_artist.trim() : null,
            isbn_album_title: isbn_album_title
                ? isbn_album_title.trim()
                : null
        });

        res.redirect(`/details/${newItemId}`);
    } catch (err) {
        res.status(500).send("Error creating listing: " + err.message);
    }
});

// Edit Listing Page
app.get("/listings/:id/edit", async function(req, res) {
    try {
        // Temporary user until login/session integration is completed
        const currentUserId = 1;

        const item = await itemModel.getByIdAndOwner(
            req.params.id,
            currentUserId
        );

        if (!item) {
            return res.status(403).send(
                "Listing not found or you do not have permission to edit it."
            );
        }

        const genres = await db.query(`
            SELECT genre_id, genre_name, type_id
            FROM genres
            ORDER BY genre_name
        `);

        const mediaTypes = await db.query(`
            SELECT type_id, type_name
            FROM media_types
            ORDER BY type_name
        `);

        res.render("edit-listing", {
            title: "Edit Listing",
            item,
            genres,
            mediaTypes,
            error: null
        });
    } catch (err) {
        res.status(500).send(
            "Error loading listing: " + err.message
        );
    }
});

// Update Listing
app.post("/listings/:id/edit", async function(req, res) {
    try {
        // Temporary user until login/session integration is completed
        const currentUserId = 1;

        const {
            title,
            description,
            item_condition,
            author_artist,
            isbn_album_title,
            type_id,
            genre_id
        } = req.body;

        if (!title || !item_condition || !type_id || !genre_id) {
            const genres = await db.query(`
                SELECT genre_id, genre_name, type_id
                FROM genres
                ORDER BY genre_name
            `);

            const mediaTypes = await db.query(`
                SELECT type_id, type_name
                FROM media_types
                ORDER BY type_name
            `);

            return res.status(400).render("edit-listing", {
                title: "Edit Listing",
                item: {
                    id: req.params.id,
                    ...req.body
                },
                genres,
                mediaTypes,
                error: "Please complete all required fields."
            });
        }

        const affectedRows = await itemModel.update(
            req.params.id,
            currentUserId,
            {
                type_id,
                genre_id,
                title: title.trim(),
                description: description
                    ? description.trim()
                    : null,
                item_condition,
                author_artist: author_artist
                    ? author_artist.trim()
                    : null,
                isbn_album_title: isbn_album_title
                    ? isbn_album_title.trim()
                    : null
            }
        );

        if (affectedRows === 0) {
            return res.status(403).send(
                "Listing not found or you do not have permission to edit it."
            );
        }

        res.redirect(`/details/${req.params.id}`);
    } catch (err) {
        res.status(500).send(
            "Error updating listing: " + err.message
        );
    }
});

// Delete Listing
app.post("/listings/:id/delete", async function(req, res) {
    try {
        // Temporary user until login/session integration is completed
        const currentUserId = 1;

        const affectedRows = await itemModel.delete(
            req.params.id,
            currentUserId
        );

        if (affectedRows === 0) {
            return res.status(403).send(
                "Listing not found or you do not have permission to delete it."
            );
        }

        res.redirect("/listings");
    } catch (err) {
        console.error(err);

        res.status(500).send(
            "Error deleting listing: " + err.message
        );
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

// Categories Overview Page
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
app.get("/db_test", async function(req, res) {
    try {
        const rows = await db.query("SELECT * FROM Users");
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