const pool = require('../config/db');
const crypto = require('crypto');

class ClosureDAO {
  // Generate OTP for task closure
  static async generateOTP(taskId, userId) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.execute(
      `INSERT INTO task_closures (task_id, user_id, closure_type, closure_data, expires_at)
       VALUES (?, ?, 'OTP', ?, ?)
       ON DUPLICATE KEY UPDATE closure_data = ?, expires_at = ?`,
      [taskId, userId, JSON.stringify({ otp }), expiresAt, JSON.stringify({ otp }), expiresAt]
    );

    return otp;
  }

  // Verify OTP
  static async verifyOTP(taskId, userId, otp) {
    const [rows] = await pool.execute(
      `SELECT * FROM task_closures 
       WHERE task_id = ? AND user_id = ? AND closure_type = 'OTP' 
       AND expires_at > NOW()`,
      [taskId, userId]
    );

    if (rows.length === 0) return false;

    const data = JSON.parse(rows[0].closure_data);
    return data.otp === otp;
  }

  // Store QR code data
  static async storeQRCode(taskId, qrData) {
    await pool.execute(
      `INSERT INTO task_closures (task_id, closure_type, closure_data)
       VALUES (?, 'QR', ?)`,
      [taskId, JSON.stringify({ qr: qrData })]
    );
  }

  // Verify QR scan
  static async verifyQRScan(taskId, scannedData) {
    const [rows] = await pool.execute(
      `SELECT * FROM task_closures WHERE task_id = ? AND closure_type = 'QR'`,
      [taskId]
    );

    if (rows.length === 0) return false;

    const data = JSON.parse(rows[0].closure_data);
    return data.qr === scannedData;
  }

  // Store photo proof
  static async storePhotoProof(taskId, userId, photoUrl) {
    await pool.execute(
      `INSERT INTO task_closures (task_id, user_id, closure_type, closure_data, verified)
       VALUES (?, ?, 'PHOTO', ?, FALSE)`,
      [taskId, userId, JSON.stringify({ url: photoUrl })]
    );
  }

  // Verify photo (admin approval)
  static async verifyPhoto(taskId, approved) {
    await pool.execute(
      `UPDATE task_closures SET verified = ? WHERE task_id = ? AND closure_type = 'PHOTO'`,
      [approved, taskId]
    );
    return approved;
  }

  // Check if task can be closed
  static async canClose(taskId) {
    // Get task closure criteria
    const [tasks] = await pool.execute(
      `SELECT closing_criteria FROM tasks WHERE id = ?`,
      [taskId]
    );

    if (tasks.length === 0) return false;

    const criteria = tasks[0].closing_criteria;

    if (criteria === 'MANUAL') return true;

    // Check if closure requirement met
    const [closures] = await pool.execute(
      `SELECT * FROM task_closures WHERE task_id = ? AND verified = TRUE`,
      [taskId]
    );

    return closures.length > 0;
  }
}

module.exports = ClosureDAO;
