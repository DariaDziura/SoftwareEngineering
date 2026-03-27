class User {
    constructor(db) {
        this.db = db;
    }

    async getById(id) {
        const rows = await this.db.query(`
            SELECT
                user_id AS id,
                username,
                email
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
                last_name AS lastName
                FROM users
            `);

    return rows;
}
}

module.exports = User;