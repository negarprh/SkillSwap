const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'skillswap.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
const createTables = () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      bio TEXT,
      rating_avg REAL DEFAULT 0.0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
      completed_jobs INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS user_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      skill TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, skill)
    )`,
    `CREATE TABLE IF NOT EXISTS job_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      budget REAL NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
      owner_id TEXT NOT NULL,
      freelancer_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      freelancer_id TEXT NOT NULL,
      price REAL NOT NULL,
      cover_letter TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      accepted_at DATETIME,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(job_id, freelancer_id)
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      reviewer_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS auth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  tables.forEach(sql => {
    db.run(sql, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      }
    });
  });

  // Insert default job categories
  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Data Analysis',
    'Content Writing',
    'Marketing',
    'QA Testing',
    'Tutoring',
    'General'
  ];

  categories.forEach(category => {
    db.run(
      `INSERT OR IGNORE INTO job_categories (name) VALUES (?)`,
      [category],
      (err) => {
        if (err) {
          console.error('Error inserting category:', err);
        }
      }
    );
  });

  console.log('Database tables created.');
};

createTables();

module.exports = db;