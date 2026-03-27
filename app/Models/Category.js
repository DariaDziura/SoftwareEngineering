/**
 * Category Model
 * Handles database operations for Genres/Categories.
 */
class Category {
    constructor(db) {
        this.db = db;
    }

    async getAll() {
        // Updated query to JOIN with media_types so the user knows 
        // if the genre belongs to a 'Book' or a 'Record'.
        const rows = await this.db.query(`
            SELECT 
                g.genre_id AS id, 
                g.genre_name AS name,
                t.type_name AS type
            FROM genres g
            JOIN media_types t ON g.type_id = t.type_id
            ORDER BY t.type_name, g.genre_name
        `);
        
        return rows;
    }
}

module.exports = Category;