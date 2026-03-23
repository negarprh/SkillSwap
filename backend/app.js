require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
require('./database'); // Initialize database

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/jobs', require('./routes/jobs'));
app.use('/reviews', require('./routes/reviews')); 
app.use('/proposals', require('./routes/proposals')); 
app.use('/platform', require('./routes/platform'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SkillSwap API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;