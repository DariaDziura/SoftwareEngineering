const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

// --------------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------------

const db = require("./services/db");

// --------------------------------------------------
// MODELS
// --------------------------------------------------

const User = require("./Models/User");
const Item = require("./Models/Item");
const Category = require("./Models/Category");

const userModel = new User(db);
const itemModel = new Item(db);
const categoryModel = new Category(db);

// --------------------------------------------------
// VIEW ENGINE
// --------------------------------------------------

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(express.static("static"));

app.use(express.urlencoded({
    extended: true
}));

app.use(session({
    secret: "vinyl-swap-secret",
    resave: false,
    saveUninitialized: false
}));

// Makes logged-in user available in every Pug view
app.use(function(req, res, next) {
    res.locals.user = req.session.user || null;
    next();
});

// Middleware for protected routes
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    next();
}

// --------------------------------------------------
// HOME PAGE
// --------------------------------------------------

app.get("/", function(req, res) {
    res.render("index", {
        title: "Home"
    });
});

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

app.get("/login", function(req, res) {
    res.render("login", {
        title: "Login"
    });
});

app.post("/login", async function(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send(
                "Please enter a username and password."
            );
        }

        const user = await userModel.getByUsername(username);

        if (!user) {
            return res.status(401).send("User not found");
        }

        // Temporary plain-text password check
        if (password !== user.password_hash) {
            return res.status(401).send("Incorrect password");
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        return res.redirect("/dashboard");
    } catch (err) {
        console.error(err);

        res.status(500).send(
            "Login error: " + err.message
        );
    }
});

// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

app.get("/dashboard", requireLogin, function(req, res) {
    res.render("index", {
        title: "Dashboard",
        user: req.session.user
    });
});

// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

app.get("/logout", function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.error(err);
            return res.redirect("/");
        }

        res.redirect("/");
    });
});

// --------------------------------------------------
// ALL LISTINGS
// --------------------------------------------------

app.get("/listings", async function(req, res) {
    try {
        const listings = await itemModel.getAll();

        res.render("listings", {
            title: "All Listings",
            listings
        });
    } catch (err) {
        console.error(err);

        res.status(500).send(
            "Error fetching listings: " + err.message
        );
    }
});

// --------------------------------------------------
// SWAP HISTORY
// --------------------------------------------------

app.get("/swaps", requireLogin, async function(req, res) {
    try {
        const currentUserId = req.session.user.id;

        const swaps = await db.query(
            `
            SELECT
                st.swap_id AS id,
                st.item_id,
                mi.title AS item_title,
                requester.username AS requester_name,
                owner.username AS owner_name,
                st.requester_id,
                st.owner_id,
                LOWER(st.status) AS status,
                st.created_at
            FROM swap_transactions st
            JOIN media_items mi
                ON st.item_id = mi.item_id
            JOIN users requester
                ON st.requester_id = requester.user_id
            JOIN users owner
                ON st.owner_id = owner.user_id
            WHERE st.requester_id = ?
               OR st.owner_id = ?
            ORDER BY st.created_at DESC
            `,
            [currentUserId, currentUserId]
        );

        res.render("swaps", {
            title: "Swap History",
            swaps,
            currentUserId
        });
    } catch (err) {
        console.error(err);

        res.status(500).send(
            "Error loading swaps: " + err.message
        );
    }
});

// --------------------------------------------------
// REQUEST SWAP
// --------------------------------------------------

app.post(
    "/swaps/request/:itemId",
    requireLogin,
    async function(req, res) {
        try {
            const itemId = Number(req.params.itemId);
            const requesterId = Number(req.session.user.id);

            if (!Number.isInteger(itemId) || itemId <= 0) {
                return res.status(400).send("Invalid item ID.");
            }

            const items = await db.query(
                `
                SELECT
                    item_id,
                    owner_id,
                    is_available
                FROM media_items
                WHERE item_id = ?
                `,
                [itemId]
            );

            if (!items || items.length === 0) {
                return res.status(404).send("Item not found.");
            }

            const item = items[0];
            const ownerId = Number(item.owner_id);

            if (ownerId === requesterId) {
                return res.status(400).send(
                    "You cannot request a swap for your own item."
                );
            }

            if (!item.is_available) {
                return res.status(400).send(
                    "This item is no longer available."
                );
            }

            const existingRequests = await db.query(
                `
                SELECT swap_id
                FROM swap_transactions
                WHERE requester_id = ?
                  AND item_id = ?
                  AND status = 'Pending'
                `,
                [requesterId, itemId]
            );

            if (existingRequests.length > 0) {
                return res.status(400).send(
                    "You have already requested this item."
                );
            }

            await db.query(
                `
                INSERT INTO swap_transactions (
                    requester_id,
                    owner_id,
                    item_id,
                    status
                )
                VALUES (?, ?, ?, 'Pending')
                `,
                [requesterId, ownerId, itemId]
            );

            res.redirect("/swaps");
        } catch (err) {
            console.error(err);

            res.status(500).send(
                "Error creating swap request: " + err.message
            );
        }
    }
);

// --------------------------------------------------
// ACCEPT SWAP
// --------------------------------------------------

app.post(
    "/swaps/accept/:swapId",
    requireLogin,
    async function(req, res) {
        try {
            const swapId = Number(req.params.swapId);
            const currentUserId = Number(req.session.user.id);

            if (!Number.isInteger(swapId) || swapId <= 0) {
                return res.status(400).send("Invalid swap ID.");
            }

            const swaps = await db.query(
                `
                SELECT
                    swap_id,
                    item_id,
                    owner_id,
                    status
                FROM swap_transactions
                WHERE swap_id = ?
                `,
                [swapId]
            );

            if (!swaps || swaps.length === 0) {
                return res.status(404).send(
                    "Swap request not found."
                );
            }

            const swap = swaps[0];

            if (Number(swap.owner_id) !== currentUserId) {
                return res.status(403).send(
                    "You do not have permission to accept this request."
                );
            }

            if (swap.status !== "Pending") {
                return res.status(400).send(
                    "This swap request has already been processed."
                );
            }

            await db.query(
                `
                UPDATE swap_transactions
                SET status = 'Accepted'
                WHERE swap_id = ?
                  AND owner_id = ?
                  AND status = 'Pending'
                `,
                [swapId, currentUserId]
            );

            await db.query(
                `
                UPDATE media_items
                SET is_available = FALSE
                WHERE item_id = ?
                `,
                [swap.item_id]
            );

            await db.query(
                `
                UPDATE swap_transactions
                SET status = 'Declined'
                WHERE item_id = ?
                  AND swap_id != ?
                  AND status = 'Pending'
                `,
                [swap.item_id, swapId]
            );

            res.redirect("/swaps");
        } catch (err) {
            console.error(err);

            res.status(500).send(
                "Error accepting swap: " + err.message
            );
        }
    }
);

// --------------------------------------------------
// DECLINE SWAP
// --------------------------------------------------

app.post(
    "/swaps/decline/:swapId",
    requireLogin,
    async function(req, res) {
        try {
            const swapId = Number(req.params.swapId);
            const currentUserId = Number(req.session.user.id);

            if (!Number.isInteger(swapId) || swapId <= 0) {
                return res.status(400).send("Invalid swap ID.");
            }

            const result = await db.query(
                `
                UPDATE swap_transactions
                SET status = 'Declined'
                WHERE swap_id = ?
                  AND owner_id = ?
                  AND status = 'Pending'
                `,
                [swapId, currentUserId]
            );

            if (!result || result.affectedRows === 0) {
                return res.status(403).send(
                    "Swap request not found, already processed, or you do not have permission."
                );
            }

            res.redirect("/swaps");
        } catch (err) {
            console.error(err);

            res.status(500).send(
                "Error declining swap: " + err.message
            );
        }
    }
);

// --------------------------------------------------
// CATEGORY FILTER
// --------------------------------------------------

app.get("/category/:id", async function(req, res) {
    try {
        const categoryId = req.params.id;

        const category = await categoryModel.getById(categoryId);

        if (!category) {
            return res.status(404).send(
                "Category not found"
            );
        }

        const listings =
            await itemModel.getByCategory(categoryId);

        res.render("listings", {
            title: `Category: ${category.category_name}`,
            listings
        });
    } catch (err) {
        console.error(err);

        res.status(500).send(
            "Error filtering category: " + err.message
        );
    }
});

// --------------------------------------------------
// ADD NEW LISTING PAGE
// --------------------------------------------------

app.get(
    "/listings/new",
    requireLogin,
    async function(req, res) {
        try {
            const genres = await db.query(
                `
                SELECT
                    genre_id,
                    genre_name,
                    type_id
                FROM genres
                ORDER BY genre_name
                `
            );

            const mediaTypes = await db.query(
                `
                SELECT
                    type_id,
                    type_name
                FROM media_types
                ORDER BY type_name
                `
            );

            res.render("new-listing", {
                title: "Add New Listing",
                genres,
                mediaTypes,
                error: null,
                formData: {}
            });
        } catch (err) {
            console.error(err);

            res.status(500).send(
                "Error loading form: " + err.message
            );
        }
    }
);

// --------------------------------------------------
// SAVE NEW LISTING
// --------------------------------------------------

app.post(
    "/listings/new",
    requireLogin,
    async function(req, res) {
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

            if (
                !title ||
                !item_condition ||
                !type_id ||
                !genre_id
            ) {
                const genres = await db.query(
                    `
                    SELECT
                        genre_id,
                        genre_name,
                        type_id
                    FROM genres
                    ORDER BY genre_name
                    `
                );

                const mediaTypes = await db.query(
                    `
                    SELECT
                        type_id,
                        type_name
                    FROM media_types
                    ORDER BY type_name
                    `
                );

                return res.status(400).render(
                    "new-listing",
                    {
                        title: "Add New Listing",
                        genres,
                        mediaTypes,
                        error:
                            "Please complete all required fields.",
                        formData: req.body
                    }
                );
            }

            const owner_id = req.session.user.id;

            const newItemId = await itemModel.create({
                owner_id,
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
            });

            res.redirect(`/details/${newItemId}`);
        } catch (err) {
            console.error(err);

            res.status(500).send(
                "Error creating listing: " + err.message
            );
        }
    }
);

// --------------------------------------------------
// EDIT LISTING PAGE
// --------------------------------------------------

app.get(
    "/listings/:id/edit",
    requireLogin,
    async function(req, res) {
        try {
            const currentUserId = req.session.user.id;

            const item = await itemModel.getByIdAndOwner(
                req.params.id,
                currentUserId
            );

            if (!item) {
                return res.status(403).send(
                    "Listing not found or you do not have permission to edit it."
                );
            }

            const genres = await db.query(
                `
                SELECT
                    genre_id,
                    genre_name,
                    type_id
                FROM genres
                ORDER BY genre_name
                `
            );

            const mediaTypes = await db.query(
                `
                SELECT
                    type_id,
                    type_name
                FROM media_types
                ORDER BY type_name
                `
            );

            res.render("edit-listing", {
                title: "Edit Listing",
                item,
                genres,
                mediaTypes,
                error: null
            });
        } catch (err) {
            console.error(err);

            res.status(500).send(
                "Error loading listing: " + err.message
            );
        }
    }
);

// --------------------------------------------------
// UPDATE LISTING
// --------------------------------------------------

app.post(
    "/listings/:id/edit",
    requireLogin,
    async function(req, res) {
        try {
            const currentUserId = req.session.user.id;

            const {
                title,
                description,
                item_condition,
                author_artist,
                isbn_album_title,
                type_id,
                genre_id
            } = req.body;

            if (
                !title ||
                !item_condition ||
                !type_id ||
                !genre_id
            ) {
                const genres = await db.query(
                    `
                    SELECT
                        genre_id,
                        genre_name,
                        type_id
                    FROM genres
                    ORDER BY genre_name
                    `
                );

                const mediaTypes = await db.query(
                    `
                    SELECT
                        type_id,
                        type_name
                    FROM media_types
                    ORDER BY type_name
                    `
                );

                return res.status(400).render(
                    "edit-listing",
                    {
                        title: "Edit Listing",
                        item: {
                            id: req.params.id,
                            ...req.body
                        },
                        genres,
                        mediaTypes,
                        error:
                            "Please complete all required fields."
                    }
                );
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
            console.error(err);

            res.status(500).send(
                "Error updating listing: " + err.message
            );
        }
    }
);

// --------------------------------------------------
// DELETE LISTING
// --------------------------------------------------

app.post(
    "/listings/:id/delete",
    requireLogin,
    async function(req, res) {
        try {
            const currentUserId = req.session.user.id;

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
    }
);

// --------------------------------------------------
// ITEM DETAILS PAGE
// --------------------------------------------------

app.get("/details/:id", async function(req, res) {
    try {
        const item = await itemModel.getById(
            req.params.id
        );

        if (!item) {
            return res.status(404).send(
                "Item not found"
            );
        }

        res.render("details", {
            title: item.title,
            item
        });
    } catch (err) {
        console.error(err);

        res.status(500).send(err.message);
    }
});

// --------------------------------------------------
// CATEGORIES
// --------------------------------------------------

app.get("/categories", async function(req, res) {
    try {
        const categories =
            await categoryModel.getAll();

        res.render("categories", {
            title: "Categories",
            categories
        });
    } catch (err) {
        console.error(err);

        res.status(500).send(err.message);
    }
});

// --------------------------------------------------
// COMMUNITY / USERS
// --------------------------------------------------

app.get("/users", async function(req, res) {
    try {
        const users = await userModel.getAll();

        res.render("users", {
            title: "Community",
            users
        });
    } catch (err) {
        console.error(err);

        res.status(500).send(err.message);
    }
});

// --------------------------------------------------
// USER PROFILE
// --------------------------------------------------

app.get("/users/:id", async function(req, res) {
    try {
        const profileUser = await userModel.getById(
            req.params.id
        );

        if (!profileUser) {
            return res.status(404).send(
                "User not found"
            );
        }

        const listings = await itemModel.getByUser(
            req.params.id
        );

        res.render("profile", {
            title: profileUser.username,
            user: profileUser,
            listings
        });
    } catch (err) {
        console.error(err);

        res.status(500).send(err.message);
    }
});

// --------------------------------------------------
// DATABASE TEST
// --------------------------------------------------

app.get("/db_test", async function(req, res) {
    try {
        const rows = await db.query(
            "SELECT * FROM users"
        );

        res.json(rows);
    } catch (err) {
        console.error(err);

        res.status(500).send(
            "Database connection failed: " +
                err.message
        );
    }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT = 3000;

app.listen(PORT, function() {
    console.log(
        `MediaSwap running at http://localhost:${PORT}`
    );
});