const express = require('express');
const Proposal = require('../models/proposal');
const Job = require('../models/job');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Accept proposal
router.patch('/:proposalId/accept', authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const job = await Job.findById(proposal.job_id);
    if (job.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Only job owner can accept proposals' });
    }

    const success = await Proposal.accept(req.params.proposalId);
    if (!success) {
      return res.status(400).json({ message: 'Failed to accept proposal' });
    }

    res.json({ message: 'Proposal accepted successfully', id: req.params.proposalId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get my bids
router.get('/my-bids', authenticateToken, async (req, res) => {
  try {
    const proposals = await Proposal.getMyBids(req.user.id);
    res.json(proposals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Withdraw proposal
router.delete('/:proposalId', authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    if (proposal.freelancer_id !== req.user.id) {
      return res.status(403).json({ message: 'Only proposal owner can withdraw' });
    }

    const success = await Proposal.delete(req.params.proposalId);
    if (!success) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    res.json({ message: 'Proposal withdrawn successfully', id: req.params.proposalId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;