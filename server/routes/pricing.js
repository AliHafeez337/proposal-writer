const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Proposal = require('../models/Proposal');
const logger = require('../utils/logger');

// Update deliverable prices
router.post('/:id/items', auth, async (req, res) => {
  logger.info('Updating deliverable prices', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      user: req.userId,
      status: 'complete' // Only allow pricing after generation
    });

    if (!proposal) {
      logger.warn('Proposal not found for pricing update', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Validate all deliverableIds exist
    const invalidIds = req.body.items.filter(item => 
      !proposal.content.deliverables.some(d => d._id.equals(item.deliverableId))
    );
    if (invalidIds.length > 0) {
      logger.warn('Invalid deliverable IDs provided', { userId: req.userId, proposalId: req.params.id, invalidIds });
      return res.status(400).json({ 
        error: 'Invalid deliverable IDs', 
        invalidIds 
      });
    }

    // Replace all pricing items
    proposal.pricing.items = req.body.items;
    await proposal.save(); // Auto-calculates total

    logger.info('Deliverable prices updated successfully', { proposalId: req.params.id });
    res.json(proposal);
  } catch (error) {
    logger.error('Failed to update deliverable prices', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'Failed to update pricing' });
  }
});

// Update milestones (formerly paymentSchedule)
router.post('/:id/milestones', auth, async (req, res) => {
  logger.info('Updating milestones for proposal', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!proposal) {
      logger.warn('Proposal not found for milestone update', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found' });
    }
    if (!proposal.pricing.total) {
      logger.warn('Pricing not calculated before milestone update', { userId: req.userId, proposalId: req.params.id });
      return res.status(400).json({ error: 'Calculate pricing first' });
    }

    // Simple existence check first
    if (!proposal.content?.timeline) {
      logger.warn('Proposal timeline not generated yet', { userId: req.userId, proposalId: req.params.id });
      return res.status(400).json({ error: 'Proposal timeline not generated yet' });
    }

    // Validate milestones
    const errors = [];
    const validMilestones = req.body.milestones.map(milestone => {
      const phase = proposal.content.timeline.id(milestone.phaseId);
      
      if (!phase) {
        logger.warn('Invalid milestone phase ID', { userId: req.userId, proposalId: req.params.id, phaseId: milestone.phaseId });
        errors.push({
          milestone,
          error: `Phase ${milestone.phaseId} not found`
        });
        return null;
      }

      return {
        phaseId: milestone.phaseId,
        percentage: milestone.percentage,
        dueDate: milestone.dueDate,
        // paymentAmount will be auto-calculated in pre-save
      };
    }).filter(Boolean);

    if (errors.length > 0) {
      logger.warn('Invalid milestones provided', { userId: req.userId, proposalId: req.params.id, errors });
      return res.status(400).json({
        error: 'Invalid milestones',
        details: errors
      });
    }

    proposal.pricing.milestones = validMilestones;
    await proposal.save();

    logger.info('Milestones updated successfully', { proposalId: req.params.id });
    res.json(proposal);
  } catch (error) {
    logger.error('Failed to update milestones', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;