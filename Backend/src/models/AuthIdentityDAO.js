const pool = require('../config/db');
const bcrypt = require('bcrypt');

class AuthIdentityDAO {
  static async createIdentity({ user_id, provider, provider_uid, email, is_primary = false }) {
    const [result] = await pool.execute(
      `INSERT INTO auth_identities (user_id, provider, provider_uid, email, is_primary) VALUES (?, ?, ?, ?, ?)`,
      [user_id, provider, provider_uid, email, is_primary]
    );
    return result.insertId;
  }

  static async createPassword({ identity_id, password }) {
    const hash = await bcrypt.hash(password, 10);
    await pool.execute(
      `INSERT INTO auth_passwords (identity_id, password_hash) VALUES (?, ?)`,
      [identity_id, hash]
    );
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT ai.*, u.name, u.user_type, u.subtype 
       FROM auth_identities ai 
       JOIN users u ON ai.user_id = u.id 
       WHERE ai.email = ?`,
      [email]
    );
    return rows[0];
  }

  static async verifyPassword(identity_id, password) {
    const [rows] = await pool.execute(
      `SELECT password_hash FROM auth_passwords WHERE identity_id = ?`,
      [identity_id]
    );
    if (rows.length === 0) return false;
    return await bcrypt.compare(password, rows[0].password_hash);
  }
}

module.exports = AuthIdentityDAO;
