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

    proposal.pricing.total = proposal.pricing.items.reduce((sum, item) => {
      const deliverable = proposal.content.deliverables.id(item.deliverableId);
      return sum + (item.unitPrice * (deliverable?.count || 0));
    }, 0);

    // we also want to edit milestones...
    if (proposal.content.timeline && proposal.content.timeline.length > 0) {
      if (proposal.content.timeline[0].milestones && proposal.content.timeline[0].milestones.length > 0) { // if milestones exist, update them
        proposal.content.timeline.forEach(phase => {
          phase.milestones.forEach(milestone => {
            milestone.paymentAmount = Number(milestone.percentage * proposal.pricing.total / 100);
          });
        });
      } else {
        // generate default milestones if they don't exist
        let percentage = 100 / proposal.content.timeline.length;
        proposal.content.timeline.forEach(phase => {
          phase.milestones = [{
            phaseId: phase._id,
            name: "Initial",
            percentage: percentage,
            paymentAmount: Number(percentage * proposal.pricing.total / 100),
            dueDate: phase.endDate,
          }];
        })
      }
    }

    await proposal.save(); // Auto-calculates total

    logger.info('Deliverable prices updated successfully', { proposalId: req.params.id });
    res.json(proposal);
  } catch (error) {
    logger.error('Failed to update deliverable prices', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'Failed to update pricing', error });
  }
});

module.exports = router;