const db = require('../database');

class Platform {
  static async getStats() {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM jobs WHERE status = 'open') AS active_jobs,
          COALESCE((SELECT SUM(budget) FROM jobs WHERE status IN ('in_progress', 'completed')), 0) AS total_value_moved
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = Platform;