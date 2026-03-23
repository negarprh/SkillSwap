const db = require('../database');
const { v4: uuidv4 } = require('uuid');
const User = require('./user');

class Review {
  static async create(reviewData) {
    const { job_id, reviewer_id, target_id, rating, comment } = reviewData;
    const id = uuidv4();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO reviews (id, job_id, reviewer_id, target_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, job_id, reviewer_id, target_id, rating, comment],
        async function(err) {
          if (err) reject(err);
          else {
            // Update user ratings
            await User.updateRating(target_id);
            resolve({ id, ...reviewData });
          }
        }
      );
    });
  }

  static async getUserReviews(userId) {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM reviews WHERE target_id = ? ORDER BY created_at DESC`, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Review;