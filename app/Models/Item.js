class Item {
    constructor(db) {
        this.db = db;
    }

    /**
     * Get a specific item by its ID with joined details
     */
    async getById(id) {
        const rows = await this.db.query(`
            SELECT 
                mi.item_id AS id, 
                mi.title, 
                mi.description, 
                mi.item_condition, 
                mi.author_artist, 
                mi.isbn_album_title,
                mi.owner_id AS user_id, 
                u.username,
                g.genre_name AS category,
                mt.type_name AS media_type
            FROM media_items mi
            JOIN users u ON mi.owner_id = u.user_id
            LEFT JOIN genres g ON mi.genre_id = g.genre_id
            LEFT JOIN media_types mt ON mi.type_id = mt.type_id
            WHERE mi.item_id = ?
        `, [id]);
        return rows[0];
    }

    /**
     * Get all items for the main listings page
     */
    async getAll() {
        const rows = await this.db.query(`
            SELECT 
                mi.item_id AS id, 
                mi.title, 
                mi.item_condition,
                g.genre_name AS category,
                mt.type_name AS media_type
            FROM media_items mi
            LEFT JOIN genres g ON mi.genre_id = g.genre_id
            LEFT JOIN media_types mt ON mi.type_id = mt.type_id
        `);
        return rows;
    }

    /**
     * NEW METHOD: Get items filtered by a specific category ID
     * This fixes the issue where all items were shown instead of one category
     */
    async getByCategory(categoryId) {
        const rows = await this.db.query(`
            SELECT 
                mi.item_id AS id, 
                mi.title, 
                mi.item_condition,
                g.genre_name AS category,
                mt.type_name AS media_type
            FROM media_items mi
            LEFT JOIN genres g ON mi.genre_id = g.genre_id
            LEFT JOIN media_types mt ON mi.type_id = mt.type_id
            WHERE mi.genre_id = ?
        `, [categoryId]);
        return rows;
    }

    /**
     * Get all items owned by a specific user for their profile page
     */
    async getByUser(userId) {
        return await this.db.query(`
            SELECT 
                item_id AS id, 
                title, 
                item_condition 
            FROM media_items 
            WHERE owner_id = ?
        `, [userId]);
    }
}

module.exports = Item;