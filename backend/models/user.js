const db = require('../database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(userData) {
    const { name, username, email, password, bio, skills } = userData;
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (id, name, username, email, password_hash, bio) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, username, email, passwordHash, bio],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Insert skills
            if (skills && skills.length > 0) {
              const skillInserts = skills.map(skill => {
                return new Promise((res, rej) => {
                  db.run(
                    `INSERT INTO user_skills (user_id, skill) VALUES (?, ?)`,
                    [id, skill],
                    (err) => err ? rej(err) : res()
                  );
                });
              });
              Promise.all(skillInserts).then(() => resolve({ id, ...userData, rating_avg: 0, completed_jobs: 0 })).catch(reject);
            } else {
              resolve({ id, name, username, email, bio, skills: [], rating_avg: 0, completed_jobs: 0 });
            }
          }
        }
      );
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async getSkills(userId) {
    return new Promise((resolve, reject) => {
      db.all(`SELECT skill FROM user_skills WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.skill));
      });
    });
  }

  static async updateRating(userId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT AVG(rating) as avg_rating, COUNT(*) as count
        FROM reviews
        WHERE target_id = ?
      `, [userId], (err, row) => {
        if (err) reject(err);
        else {
          const ratingAvg = row.avg_rating || 0;
          const completedJobs = row.count || 0;
          db.run(
            `UPDATE users SET rating_avg = ?, completed_jobs = ? WHERE id = ?`,
            [ratingAvg, completedJobs, userId],
            (err) => err ? reject(err) : resolve()
          );
        }
      });
    });
  }

  static async getPublicProfile(username) {
    const user = await this.findByUsername(username);
    if (!user) return null;
    const skills = await this.getSkills(user.id);
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      skills,
      rating_avg: user.rating_avg,
      completed_jobs: user.completed_jobs
    };
  }
}

module.exports = User;