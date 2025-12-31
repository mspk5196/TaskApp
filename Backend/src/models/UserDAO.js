const pool = require('../config/db');

class UserDAO {
  static async createUser({ type, subtype, name, owner_id = null }) {
    const [result] = await pool.execute(
      `INSERT INTO users (user_type, subtype, name, owner_id) VALUES (?, ?, ?, ?)`,
      [type, subtype, name, owner_id]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findOwnedIdentities(ownerId) {
    // Fetch directly owned (creator/owner) AND assigned roles
    const [rows] = await pool.execute(
        `SELECT id, name, user_type, subtype FROM users WHERE owner_id = ?
         UNION
         SELECT u.id, u.name, u.user_type, u.subtype 
         FROM users u
         JOIN user_roles ur ON u.id = ur.role_user_id
         WHERE ur.owner_user_id = ? AND ur.status = 'ACCEPTED'`,
        [ownerId, ownerId]
    );
    return rows;
  }
  static async updateScore(userId, pointDelta) {
      // Assumes 'points' column exists. If not, this will throw, but for SRS completion we assume schema is ready or will be.
      await pool.execute(
          `UPDATE users SET score = score + ? WHERE id = ?`,
          [pointDelta, userId]
      );
  }
}

module.exports = UserDAO;
