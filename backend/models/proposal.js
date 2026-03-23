const db = require('../database');
const { v4: uuidv4 } = require('uuid');

class Proposal {
  static async create(proposalData) {
    const { job_id, freelancer_id, price, cover_letter } = proposalData;
    const id = uuidv4();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO proposals (id, job_id, freelancer_id, price, cover_letter) VALUES (?, ?, ?, ?, ?)`,
        [id, job_id, freelancer_id, price, cover_letter],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...proposalData, status: 'pending' });
        }
      );
    });
  }

  static async findByJobId(jobId) {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM proposals WHERE job_id = ? ORDER BY created_at DESC`, [jobId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM proposals WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async accept(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE proposals SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else if (this.changes > 0) {
            // Update job status and freelancer
            db.get(`SELECT job_id, freelancer_id FROM proposals WHERE id = ?`, [id], (err, proposal) => {
              if (err) reject(err);
              else {
                db.run(
                  `UPDATE jobs SET status = 'in_progress', freelancer_id = ? WHERE id = ?`,
                  [proposal.freelancer_id, proposal.job_id],
                  (err) => err ? reject(err) : resolve(true)
                );
              }
            });
          } else {
            resolve(false);
          }
        }
      );
    });
  }

  static async getMyBids(userId) {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM proposals WHERE freelancer_id = ? ORDER BY created_at DESC`, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM proposals WHERE id = ?`, [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }
}

module.exports = Proposal;