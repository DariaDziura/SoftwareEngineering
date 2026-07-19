class Item {
    constructor(db) {
        this.db = db;
    }

    /**
     * Get all listings
     */
    async getAll() {
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
            JOIN users u
                ON mi.owner_id = u.user_id
            LEFT JOIN genres g
                ON mi.genre_id = g.genre_id
            LEFT JOIN media_types mt
                ON mi.type_id = mt.type_id
            ORDER BY mi.item_id DESC
        `);

        return rows;
    }

    /**
     * Get one listing by ID
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
            JOIN users u
                ON mi.owner_id = u.user_id
            LEFT JOIN genres g
                ON mi.genre_id = g.genre_id
            LEFT JOIN media_types mt
                ON mi.type_id = mt.type_id
            WHERE mi.item_id = ?
        `, [id]);

        return rows[0];
    }

    /**
     * Get listings filtered by category
     */
    async getByCategory(categoryId) {
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
            JOIN users u
                ON mi.owner_id = u.user_id
            LEFT JOIN genres g
                ON mi.genre_id = g.genre_id
            LEFT JOIN media_types mt
                ON mi.type_id = mt.type_id
            WHERE mi.genre_id = ?
            ORDER BY mi.item_id DESC
        `, [categoryId]);

        return rows;
    }

    /**
     * Get all listings owned by one user
     */
    async getByUser(userId) {
        const rows = await this.db.query(`
            SELECT
                mi.item_id AS id,
                mi.title,
                mi.description,
                mi.item_condition,
                mi.author_artist,
                mi.isbn_album_title,
                mi.owner_id AS user_id,
                g.genre_name AS category,
                mt.type_name AS media_type
            FROM media_items mi
            LEFT JOIN genres g
                ON mi.genre_id = g.genre_id
            LEFT JOIN media_types mt
                ON mi.type_id = mt.type_id
            WHERE mi.owner_id = ?
            ORDER BY mi.item_id DESC
        `, [userId]);

        return rows;
    }

    /**
     * Create a new listing
     */
    async create(item) {
        const result = await this.db.query(`
            INSERT INTO media_items
            (
                owner_id,
                type_id,
                genre_id,
                title,
                description,
                item_condition,
                author_artist,
                isbn_album_title
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            item.owner_id,
            item.type_id,
            item.genre_id,
            item.title,
            item.description,
            item.item_condition,
            item.author_artist,
            item.isbn_album_title
        ]);

        return result.insertId;
    }

    /**
     * Get one listing only when it belongs to the specified owner
     */
    async getByIdAndOwner(itemId, ownerId) {
        const rows = await this.db.query(`
            SELECT
                item_id AS id,
                owner_id,
                type_id,
                genre_id,
                title,
                description,
                item_condition,
                author_artist,
                isbn_album_title
            FROM media_items
            WHERE item_id = ?
            AND owner_id = ?
        `, [itemId, ownerId]);

        return rows[0];
    }

    /**
     * Update a listing only when it belongs to the specified owner
     */
    async update(itemId, ownerId, item) {
        const result = await this.db.query(`
            UPDATE media_items
            SET
                type_id = ?,
                genre_id = ?,
                title = ?,
                description = ?,
                item_condition = ?,
                author_artist = ?,
                isbn_album_title = ?
            WHERE item_id = ?
            AND owner_id = ?
        `, [
            item.type_id,
            item.genre_id,
            item.title,
            item.description,
            item.item_condition,
            item.author_artist,
            item.isbn_album_title,
            itemId,
            ownerId
        ]);

        return result.affectedRows;
    }

    /**
    * Delete a listing only when it belongs to the specified owner
    */
    async delete(itemId, ownerId) {
        const result = await this.db.query(`
         DELETE FROM media_items
            WHERE item_id = ?
            AND owner_id = ?
        `, [itemId, ownerId]);

        return result.affectedRows;
    }
}

module.exports = Item;