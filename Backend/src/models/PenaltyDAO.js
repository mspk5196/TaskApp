const pool = require('../config/db');

class PenaltyDAO {
  // Calculate and apply penalties for overdue tasks
  static async calculatePenalties() {
    // Find all overdue tasks
    const [overdueTasks] = await pool.execute(
      `SELECT t.id, t.owner_id, ta.assignee_id, t.created_at, ttr.end_date, ttr.fixed_end_time
       FROM tasks t
       LEFT JOIN task_assignments ta ON t.id = ta.task_id
       LEFT JOIN task_time_rules ttr ON t.id = ttr.task_id
       WHERE t.status IN ('ACCEPTED', 'STARTED', 'IN_PROGRESS')
       AND (
         (ttr.end_date IS NOT NULL AND ttr.end_date < CURDATE()) OR
         (ttr.fixed_end_time IS NOT NULL AND CONCAT(ttr.end_date, ' ', ttr.fixed_end_time) < NOW())
       )`
    );

    for (const task of overdueTasks) {
      // Calculate hours overdue
      const deadline = task.fixed_end_time 
        ? new Date(`${task.end_date} ${task.fixed_end_time}`)
        : new Date(task.end_date);
      
      const now = new Date();
      const hoursOverdue = Math.floor((now - deadline) / (1000 * 60 * 60));

      if (hoursOverdue > 0) {
        // Apply penalty (e.g., -1 point per hour)
        const penaltyPoints = hoursOverdue * -1;

        await pool.execute(
          `INSERT INTO penalty_history (user_id, task_id, penalty_points, reason, created_at)
           VALUES (?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE penalty_points = ?, updated_at = NOW()`,
          [task.assignee_id, task.id, penaltyPoints, `Task overdue by ${hoursOverdue} hours`, penaltyPoints]
        );

        // Update user score
        await pool.execute(
          `UPDATE users SET score = score + ? WHERE id = ?`,
          [penaltyPoints, task.assignee_id]
        );

        // Mark task as overdue
        await pool.execute(
          `UPDATE tasks SET status = 'OVERDUE' WHERE id = ?`,
          [task.id]
        );
      }
    }

    return overdueTasks.length;
  }

  // Get penalty history for user
  static async getUserPenalties(userId) {
    const [rows] = await pool.execute(
      `SELECT ph.*, t.title as task_title 
       FROM penalty_history ph
       JOIN tasks t ON ph.task_id = t.id
       WHERE ph.user_id = ?
       ORDER BY ph.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // Waive penalty (admin action)
  static async waivePenalty(penaltyId, reason) {
    const [penalty] = await pool.execute(
      `SELECT * FROM penalty_history WHERE id = ?`,
      [penaltyId]
    );

    if (penalty.length === 0) return false;

    // Reverse the penalty
    await pool.execute(
      `UPDATE users SET score = score - ? WHERE id = ?`,
      [penalty[0].penalty_points, penalty[0].user_id]
    );

    // Mark as waived
    await pool.execute(
      `UPDATE penalty_history SET waived = TRUE, waive_reason = ? WHERE id = ?`,
      [reason, penaltyId]
    );

    return true;
  }
}

module.exports = PenaltyDAO;
