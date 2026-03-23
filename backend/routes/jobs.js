const express = require('express');
const Job = require('../models/job');
const Review = require('../models/review');
const Proposal = require('../models/proposal');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Search jobs
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const { category, status, min_budget } = req.body;
    const jobs = await Job.search({ category, status, min_budget });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, budget, category } = req.body;

    if (!title || !description || !budget || !category) {
      return res.status(400).json({ message: 'Title, description, budget, and category are required' });
    }

    const job = await Job.create({ title, description, budget, category, owner_id: req.user.id });
    res.status(201).json({ job_id: job.id, id: job.id, message: 'Job created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get job details
router.get('/:jobId', authenticateToken, async (req, res) => {
  try {
    const job = await Job.getJobDetails(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update job
router.patch('/:jobId', authenticateToken, async (req, res) => {
  try {
    const { title, description, budget, category, status } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (budget) updates.budget = budget;
    if (category) updates.category = category;
    if (status) updates.status = status;

    const success = await Job.update(req.params.jobId, updates);
    if (!success) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job updated successfully', id: req.params.jobId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get my postings
router.get('/my-postings', authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.getMyPostings(req.user.id);
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Complete job
router.patch('/:jobId/complete', authenticateToken, async (req, res) => {
  try {
    const success = await Job.complete(req.params.jobId);
    if (!success) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job completed successfully', id: req.params.jobId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit review
router.post('/:jobId/reviews', authenticateToken, async (req, res) => {
  try {
    const { target_id, rating, comment } = req.body;

    if (!target_id || !rating) {
      return res.status(400).json({ message: 'Target ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Reviews can only be submitted for completed jobs' });
    }

    // Check if reviewer is owner or freelancer
    if (req.user.id !== job.owner_id && req.user.id !== job.freelancer_id) {
      return res.status(403).json({ message: 'Only job participants can submit reviews' });
    }

    // Check if target is the other participant
    if (target_id !== job.owner_id && target_id !== job.freelancer_id) {
      return res.status(400).json({ message: 'Invalid target user' });
    }

    if (target_id === req.user.id) {
      return res.status(400).json({ message: 'Cannot review yourself' });
    }

    const review = await Review.create({
      job_id: req.params.jobId,
      reviewer_id: req.user.id,
      target_id,
      rating,
      comment
    });

    res.status(201).json({ review_id: review.id, id: review.id, message: 'Review submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit proposal
router.post('/:jobId/proposals', authenticateToken, async (req, res) => {
  try {
    const { price, cover_letter, message } = req.body; // message might be used for something else, but cover_letter is the main

    if (!price) {
      return res.status(400).json({ message: 'Price is required' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open for proposals' });
    }

    const proposal = await Proposal.create({
      job_id: req.params.jobId,
      freelancer_id: req.user.id,
      price,
      cover_letter: cover_letter || message
    });

    res.status(201).json({ proposal_id: proposal.id, id: proposal.id, message: 'Proposal submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get job proposals
router.get('/:jobId/proposals', authenticateToken, async (req, res) => {
  try {
    const proposals = await Proposal.findByJobId(req.params.jobId);
    res.json(proposals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;