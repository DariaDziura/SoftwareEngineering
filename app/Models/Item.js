class Item {
    constructor(db) {
        this.db = db;
    }

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

    async getByUser(userId) {
        return await this.db.query("SELECT item_id AS id, title, item_condition FROM media_items WHERE owner_id = ?", [userId]);
    }
}
module.exports = Item;