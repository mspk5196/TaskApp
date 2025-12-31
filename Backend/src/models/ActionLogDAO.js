const pool = require('../config/db');

class ActionLogDAO {
  static async log({ user_id, entity_type, entity_id, action, metadata = {} }) {
    await pool.execute(
      `INSERT INTO action_logs (user_id, entity_type, entity_id, action, metadata) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, entity_type, entity_id, action, JSON.stringify(metadata)]
    );
  }
}

module.exports = ActionLogDAO;
