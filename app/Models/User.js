class User {
    constructor(db) {
        this.db = db;
    }

    async getById(id) {
        const rows = await this.db.query(`
            SELECT
                user_id AS id,
                username,
                email,
                first_name AS firstName,
                last_name AS lastName,
                city,
                rating_score AS rating
            FROM users
            WHERE user_id = ?
        `, [id]);
        return rows[0];   
    }

    async getAll() {
        const rows = await this.db.query(`
            SELECT 
                user_id AS id, 
                username, 
                first_name AS firstName, 
                last_name AS lastName, 
                city 
            FROM users
        `);
        return rows;
    }

    async getByUsername(username) {
        const sql = "SELECT * FROM Users WHERE username = ?";
        const rows = await this.db.query(sql, [username]);
        return rows[0];
    }

    // finding user by username
    static async findByUsername(username) {
        const sql = 'SELECT id, username, password, role From users WHERE username = ? LIMIT 1';

        const [rows] = await db.querry(sql, [username]);

        return rows[0] || null;
    }
}
module.exports = User;