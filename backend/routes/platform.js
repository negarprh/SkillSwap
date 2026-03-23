const express = require('express');
const Platform = require('../models/platform');

const router = express.Router();

// Get platform stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Platform.getStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;