const pool = require('../config/db');

class HierarchyDAO {
  // Get the direct boss
  static async getReportingManager(userId) {
      const [rows] = await pool.execute(
          `SELECT u.* FROM users u
           JOIN users subordinate ON subordinate.reports_to = u.id
           WHERE subordinate.id = ?`,
          [userId]
      );
      return rows[0];
  }

  // Get full upward chain (for escalation)
  static async getEscalationChain(userId) {
      // Recursive CTE (Common Table Expression) heavily preferred here, but strict SQL for simplicity
      // MySQL 8.0 supports Recursive CTEs.
      // If we assume a designated depth, we can loop in JS, but CTE is better.
      // Let's implement a simple loop in JS for portability if MySQL version varies, 
      // but CTE is cleaner. I'll use a JS loop to be safe against older MySQL versions if unsure.
      
      let chain = [];
      let currentId = userId;
      
      while(true) {
          const [rows] = await pool.execute(
              `SELECT reports_to FROM users WHERE id = ?`,
              [currentId]
          );
          if (rows.length === 0 || !rows[0].reports_to) break;
          
          currentId = rows[0].reports_to;
          
          // Fetch details
          const [details] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [currentId]);
          chain.push(details[0]);
          
          if (chain.length > 10) break; // Safety break
      }
      return chain;
  }
}

module.exports = HierarchyDAO;
