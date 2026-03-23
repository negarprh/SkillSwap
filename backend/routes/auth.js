const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, bio, skills } = req.body;

    // Validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Name, username, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email) || await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }

    const user = await User.create({ name, username, email, password, bio, skills });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const skills = await User.getSkills(user.id);
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        skills,
        rating_avg: user.rating_avg,
        completed_jobs: user.completed_jobs
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;