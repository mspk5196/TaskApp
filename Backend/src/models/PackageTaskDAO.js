const pool = require('../config/db');

class PackageTaskDAO {
  // Create a package task with subtasks
  static async createPackage({ parentTaskId, subtasks }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update parent task to mark it as a package
      await connection.execute(
        `UPDATE tasks SET task_type = 'PACKAGE' WHERE id = ?`,
        [parentTaskId]
      );

      // Create subtasks with dependencies
      for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        const [result] = await connection.execute(
          `INSERT INTO tasks (parent_task_id, title, description, owner_id, task_type, score, status, closing_criteria)
           VALUES (?, ?, ?, ?, ?, ?, 'CREATED', ?)`,
          [parentTaskId, subtask.title, subtask.description, subtask.owner_id, subtask.type || 'FIXED', subtask.score || 0, subtask.closing_criteria || 'MANUAL']
        );

        // Create dependency if not first task
        if (i > 0) {
          const previousSubtaskId = subtasks[i - 1].id || result.insertId - 1;
          await connection.execute(
            `INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type)
             VALUES (?, ?, 'SEQUENTIAL')`,
            [result.insertId, previousSubtaskId]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get package tasks with subtasks
  static async getPackageWithSubtasks(packageId) {
    const [subtasks] = await pool.execute(
      `SELECT t.*, td.depends_on_task_id 
       FROM tasks t
       LEFT JOIN task_dependencies td ON t.id = td.task_id
       WHERE t.parent_task_id = ?
       ORDER BY t.id ASC`,
      [packageId]
    );
    return subtasks;
  }

  // Check if next subtask can be activated
  static async checkAndActivateNext(completedTaskId) {
    // Find tasks that depend on this completed task
    const [dependentTasks] = await pool.execute(
      `SELECT t.* FROM tasks t
       JOIN task_dependencies td ON t.id = td.task_id
       WHERE td.depends_on_task_id = ? AND t.status = 'CREATED'`,
      [completedTaskId]
    );

    // Activate the next task (change status to PENDING_ACCEPTANCE)
    for (const task of dependentTasks) {
      await pool.execute(
        `UPDATE tasks SET status = 'PENDING_ACCEPTANCE' WHERE id = ?`,
        [task.id]
      );

      // Assign to the designated assignee
      const [assignments] = await pool.execute(
        `SELECT assignee_id FROM task_assignments WHERE task_id = ?`,
        [task.id]
      );

      if (assignments.length > 0) {
        // Trigger notification
        await pool.execute(
          `INSERT INTO notifications (user_id, message, reference_id, is_read)
           VALUES (?, ?, ?, FALSE)`,
          [assignments[0].assignee_id, `Next task in package is ready: ${task.title}`, task.id]
        );
      }
    }

    return dependentTasks.length;
  }
}

module.exports = PackageTaskDAO;
