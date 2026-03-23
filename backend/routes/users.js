const express = require('express');
const User = require('../models/user');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const skills = await User.getSkills(user.id);
    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      skills,
      rating_avg: user.rating_avg,
      completed_jobs: user.completed_jobs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get public profile
router.get('/:username', async (req, res) => {
  try {
    const profile = await User.getPublicProfile(req.params.username);
    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;