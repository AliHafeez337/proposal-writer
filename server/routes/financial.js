const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Proposal = require('../models/Proposal');
const logger = require('../utils/logger');

// Update pricing
router.post('/:id/pricing', auth, async (req, res) => {
  logger.info('Updating pricing for proposal', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { 
        'pricing.items': req.body.items,
        'pricing.total': req.body.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
      },
      { new: true }
    );

    if (!proposal) {
      logger.warn('Proposal not found for pricing update', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found' });
    }

    logger.info('Pricing updated successfully', { proposalId: req.params.id });
    res.json(proposal);
  } catch (error) {
    logger.error('Failed to update pricing', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment schedule
router.post('/:id/payments', auth, async (req, res) => {
  logger.info('Updating payment schedule for proposal', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { 
        'pricing.milestones': req.body.milestones,
        'pricing.total': req.body.total // Optional: Update total if needed
      },
      { new: true }
    );

    if (!proposal) {
      logger.warn('Proposal not found for payment schedule update', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found' });
    }

    logger.info('Payment schedule updated successfully', { proposalId: req.params.id });
    res.json(proposal);
  } catch (error) {
    logger.error('Failed to update payment schedule', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;