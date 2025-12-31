const pool = require('../config/db');

class NotificationDAO {
  static async create({ userId, message, referenceId, type = 'TASK' }) {
    await pool.execute(
      `INSERT INTO notifications (user_id, message, reference_id, is_read) 
       VALUES (?, ?, ?, FALSE)`,
      [userId, message, referenceId]
    );
  }

  static async findByUser(userId) {
      const [rows] = await pool.execute(
          `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
          [userId]
      );
      return rows;
  }

  static async markAsRead(notificationId) {
      await pool.execute(
          `UPDATE notifications SET is_read = TRUE WHERE id = ?`,
          [notificationId]
      );
  }
}

module.exports = NotificationDAO;
