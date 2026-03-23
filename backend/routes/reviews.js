const express = require('express');
const Review = require('../models/review');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user reviews
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const reviews = await Review.getUserReviews(req.params.userId);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;