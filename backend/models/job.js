const db = require('../database');
const { v4: uuidv4 } = require('uuid');
const User = require('./user');

class Job {
  static async create(jobData) {
    const { title, description, budget, category, owner_id } = jobData;
    const id = uuidv4();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO jobs (id, title, description, budget, category, owner_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, title, description, budget, category, owner_id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...jobData, status: 'open', freelancer_id: null });
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM jobs WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async getJobDetails(id) {
    const job = await this.findById(id);
    if (!job) return null;

    const owner = await User.findById(job.owner_id);
    const freelancer = job.freelancer_id ? await User.findById(job.freelancer_id) : null;

    return {
      ...job,
      owner: owner ? {
        id: owner.id,
        name: owner.name,
        username: owner.username,
        rating_avg: owner.rating_avg
      } : null,
      freelancer: freelancer ? {
        id: freelancer.id,
        name: freelancer.name,
        username: freelancer.username,
        rating_avg: freelancer.rating_avg
      } : null
    };
  }

  static async search(filters) {
    let query = `SELECT * FROM jobs WHERE 1=1`;
    const params = [];

    if (filters.category) {
      query += ` AND category = ?`;
      params.push(filters.category);
    }

    if (filters.status) {
      query += ` AND status = ?`;
      params.push(filters.status);
    }

    if (filters.min_budget) {
      query += ` AND budget >= ?`;
      params.push(filters.min_budget);
    }

    query += ` ORDER BY created_at DESC`;

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async update(id, updates) {
    const fields = [];
    const params = [];

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = ?`);
      params.push(updates[key]);
    });

    params.push(id);

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE jobs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        params,
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  static async getMyPostings(userId) {
    return new Promise((resolve, reject) => {
      console.log("Runnign get postings")
      db.all(`SELECT * FROM jobs WHERE owner_id = ? ORDER BY created_at DESC`, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async complete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE jobs SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }
}

module.exports = Job;