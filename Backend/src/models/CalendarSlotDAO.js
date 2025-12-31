const pool = require('../config/db');

class CalendarSlotDAO {
  static async createSlot({ user_id, task_id, start_time, end_time, type, status = 'RESERVED' }) {
    // 1. Check conflicts
    const conflicts = await this.findConflicts(user_id, start_time, end_time);
    if (conflicts.length > 0) {
      throw new Error(`Conflict detected with slot IDs: ${conflicts.map(c => c.id).join(', ')}`);
    }

    // 2. Insert
    const [result] = await pool.execute(
      `INSERT INTO calendar_slots (user_id, task_id, start_time, end_time, slot_type, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, task_id, start_time, end_time, type, status]
    );
    return result.insertId;
  }

  static async checkConflict(userId, startTime, endTime) {
      const [rows] = await pool.execute(
          `SELECT * FROM calendar_slots 
           WHERE user_id = ? 
           AND status = 'RESERVED'
           AND (
               (start_time < ? AND end_time > ?) OR
               (start_time >= ? AND start_time < ?)
           )`,
          [userId, endTime, startTime, startTime, endTime]
      );
      return rows.length > 0;
  }

  static async findConflicts(userId, startTime, endTime) {
    const [rows] = await pool.execute(
      `SELECT * FROM calendar_slots 
       WHERE user_id = ? 
         AND status IN ('RESERVED', 'ACTIVE')
         AND (
           (start_time < ? AND end_time > ?) OR
           (start_time >= ? AND start_time < ?) OR
           (end_time > ? AND end_time <= ?)
         )`,
      [userId, endTime, startTime, startTime, endTime, startTime, endTime]
    );
    return rows;
  }

  static async getSlotsForDay(userId, dateString) { // dateString YYYY-MM-DD
    const [rows] = await pool.execute(
      `SELECT cs.*, t.title as task_title 
       FROM calendar_slots cs
       JOIN tasks t ON cs.task_id = t.id
       WHERE cs.user_id = ? 
         AND DATE(cs.start_time) = ?
       ORDER BY cs.start_time ASC`,
      [userId, dateString]
    );
    return rows;
  }
}

module.exports = CalendarSlotDAO;
