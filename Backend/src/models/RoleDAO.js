const pool = require('../config/db');

class RoleDAO {
  static async assignRole({ roleId, assigneeId, ownerId }) {
    // roleId here refers to the 'users' table ID of the Role Entity
    await pool.execute(
      `INSERT INTO user_roles (role_user_id, owner_user_id, status)
       VALUES (?, ?, 'PENDING')`,
      [roleId, assigneeId]
    );
  }

  static async updateAssignmentStatus(roleId, assigneeId, status) {
     await pool.execute(
       `UPDATE user_roles SET status = ?, accepted_at = NOW()
        WHERE role_user_id = ? AND owner_user_id = ?`,
       [status, roleId, assigneeId]
     );
  }
}

module.exports = RoleDAO;
