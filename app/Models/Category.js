class Category {
    constructor(db) {
        this.db = db;
    }

    // Fetches all categories for the sidebar/list
    async getAll() {
        const sql = "SELECT genre_id AS id, genre_name AS name FROM genres";
        return await this.db.query(sql);
    }

    // Fetches a single category by ID
    async getById(id) {
    // FIX: Removed the word "ALL" from the start of the string
    const sql = "SELECT genre_id AS id, genre_name AS name FROM genres WHERE genre_id = ?";
    const rows = await this.db.query(sql, [id]);
    return rows[0];
}
}

module.exports = Category;