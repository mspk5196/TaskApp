const pool = require('../config/db');

class TaskDAO {
  static async createTask({ title, description, owner_id, type = 'FIXED', score = 0, closing_criteria = 'MANUAL' }) {
    // 1. Insert Task
    const [result] = await pool.execute(
      `INSERT INTO tasks (title, description, owner_id, task_type, score, closing_criteria, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'CREATED')`, // Initial status CREATED
      [title, description, owner_id, type, score, closing_criteria]
    );
    return result.insertId;
  }

  static async assignTask(taskId, assigneeId) {
      await pool.execute(
          `INSERT INTO task_assignments (task_id, assignee_id, status) VALUES (?, ?, 'PENDING')`,
          [taskId, assigneeId]
      );
      // Update task status to SENT or PENDING_ACCEPTANCE if it's the first assignment
      await pool.execute(
          `UPDATE tasks SET status = 'PENDING_ACCEPTANCE' WHERE id = ?`,
          [taskId]
      );

      // Trigger Notification (Mocking a require here or handling via a Service layer would be better, 
      // but for DAO simplicity we insert directly or rely on Controller. 
      // Let's rely on Controller to keep DAO pure, BUT existing code calls DAO directly in create task loop.
      // So we will insert notification here directly.)
      await pool.execute(
        `INSERT INTO notifications (user_id, message, reference_id, is_read) VALUES (?, ?, ?, FALSE)`,
        [assigneeId, `You have been assigned task #${taskId}`, taskId]
      );
  }

  static async updateTaskStatus(taskId, status) {
      await pool.execute(
          `UPDATE tasks SET status = ? WHERE id = ?`,
          [status, taskId]
      );
  }

  static async updateAssignmentStatus(taskId, assigneeId, status, reason = null) {
      await pool.execute(
          `UPDATE task_assignments SET status = ?, response_reason = ?, responded_at = NOW() 
           WHERE task_id = ? AND assignee_id = ?`,
          [status, reason, taskId, assigneeId]
      );
  }

  static async findPendingTasksForUser(userId) {
      // Find tasks assigned to user
      const [rows] = await pool.execute(
          `SELECT t.*, ta.status as assignment_status 
           FROM tasks t
           JOIN task_assignments ta ON t.id = ta.task_id
           WHERE ta.assignee_id = ? 
           AND ta.status != 'REJECTED'
           ORDER BY t.created_at DESC`,
          [userId]
      );
      return rows;
  }

  static async createTaskTimeRules({ taskId, startDate, endDate, fixedStartTime, fixedEndTime, dailyQuotaMinutes }) {
      await pool.execute(
          `INSERT INTO task_time_rules (task_id, start_date, end_date, fixed_start_time, fixed_end_time, daily_quota_minutes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [taskId, startDate, endDate, fixedStartTime, fixedEndTime, dailyQuotaMinutes]
      );
  }

  static async findByOwnerId(ownerId) {
    const [rows] = await pool.execute(
      `SELECT * FROM tasks WHERE owner_id = ? ORDER BY created_at DESC`,
      [ownerId]
    );
    return rows;
  }

  static async findAllTasksForUser(userId) {
     // This would need to join with task_assignments for a real implementation
     // For now, return tasks owned + tasks assigned
     const [rows] = await pool.execute(
         `SELECT DISTINCT t.* FROM tasks t
          LEFT JOIN task_assignments ta ON t.id = ta.task_id
          WHERE t.owner_id = ? OR ta.assignee_id = ?`,
          [userId, userId]
     );
     return rows;
  }

  static async updateOverdueTasks() {
      await pool.execute(
          `UPDATE tasks t
           JOIN task_time_rules ttr ON t.id = ttr.task_id
           SET t.status = 'OVERDUE'
           WHERE t.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED', 'OVERDUE')
           AND ttr.end_date < CURDATE()` 
      );
  }
}

module.exports = TaskDAO;
