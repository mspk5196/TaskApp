const pool = require('../config/db');

class RecurringTaskDAO {
  // Create recurring task rule
  static async createRecurringRule({ taskId, frequency, interval, daysOfWeek, endDate }) {
    await pool.execute(
      `INSERT INTO recurring_task_instances (task_id, frequency, interval_value, days_of_week, end_date)
       VALUES (?, ?, ?, ?, ?)`,
      [taskId, frequency, interval, JSON.stringify(daysOfWeek), endDate]
    );
  }

  // Generate instances for recurring tasks
  static async generateInstances() {
    // Find all active recurring tasks
    const [recurringTasks] = await pool.execute(
      `SELECT t.*, rti.frequency, rti.interval_value, rti.days_of_week, rti.end_date, rti.last_generated
       FROM tasks t
       JOIN recurring_task_instances rti ON t.id = rti.task_id
       WHERE t.task_type = 'RECURRING' AND t.status = 'ACTIVE'
       AND (rti.end_date IS NULL OR rti.end_date >= CURDATE())`
    );

    for (const task of recurringTasks) {
      const lastGenerated = task.last_generated ? new Date(task.last_generated) : new Date();
      const now = new Date();
      const endDate = task.end_date ? new Date(task.end_date) : new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead

      let currentDate = new Date(lastGenerated);
      const instances = [];

      while (currentDate <= endDate && currentDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        // Generate next instance based on frequency
        if (task.frequency === 'DAILY') {
          currentDate.setDate(currentDate.getDate() + (task.interval_value || 1));
        } else if (task.frequency === 'WEEKLY') {
          const daysOfWeek = JSON.parse(task.days_of_week || '[]');
          // Find next matching day
          currentDate.setDate(currentDate.getDate() + 1);
          while (!daysOfWeek.includes(currentDate.getDay())) {
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else if (task.frequency === 'MONTHLY') {
          currentDate.setMonth(currentDate.getMonth() + (task.interval_value || 1));
        }

        // Create instance
        const [result] = await pool.execute(
          `INSERT INTO tasks (parent_task_id, title, description, owner_id, task_type, score, status, closing_criteria)
           VALUES (?, ?, ?, ?, 'FIXED', ?, 'CREATED', ?)`,
          [task.id, task.title, task.description, task.owner_id, task.score, task.closing_criteria]
        );

        instances.push(result.insertId);
      }

      // Update last generated date
      await pool.execute(
        `UPDATE recurring_task_instances SET last_generated = NOW() WHERE task_id = ?`,
        [task.id]
      );
    }

    return instances.length;
  }
}

module.exports = RecurringTaskDAO;
