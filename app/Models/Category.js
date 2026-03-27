class Category {
    constructor(db) {
        this.db = db;
    }

    async getAll() {
        const [rows] = await this.db.query(`
            SELECT
                genre_id AS id,
                genre_name AS name
            FROM genres
            `);
        
        return rows;
    }
}

module.exports = Category;