class Item {
    constructor(db) {
        this.db = db;
    }

    async getById(id) {
        const [rows] = await this.db.query(`
            SELECT
                mi.item_id AS id,
                mi.title,
                mi.decription,
                mi.item_condition,
                mi.owner_id AS user_id,
                u.username,
                g.genre_name AS category
            FROM media_items mi
            JOIN users u ON mi.owner_id = u.user_id
            LEFT JOIN genres g ON mi.genre_id = g.genre_id
            WHERE mi.item_id =?
            `, [id]);
        
        return rows[0];
    }

    async getAll() {
        const [rows] = await this.db.query(`
            SELECT
                mi.item_id AS id,
                mi.title,
                g.genre_name AS category
            FROM media_items mi
            LEFT JOIN genres g ON mi.genre_id = g.genre_id
            `);
        
        return rows;
    }

    }

module.exports = Item;