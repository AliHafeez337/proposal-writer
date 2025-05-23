const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Proposal = require('../models/Proposal');
const { analyzeScopeAndDeliverables, analyzeScopeAndDeliverablesWithFeedback, generateFullProposal } = require('../services/aiService');
const { extractText } = require('../utils/fileParser');
const { parseWorkBreakdown, cleanDeliverables } = require('../utils/aiHelper');
const logger = require('../utils/logger');

// Process uploaded files with AI
router.post('/:id/process', auth, async (req, res) => {
  logger.info('Starting AI processing for proposal', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { 
        $set: { 
          'userRequirements': req.body.userRequirements || '',
        } 
      },
      { new: true }
    );

    if (!proposal) {
      logger.warn('Proposal not found for AI processing', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found' });
    }

    logger.info('Extracting text from proposal files', { proposalId: req.params.id });
    const fileContents = await Promise.all(
      proposal.files.map(async (file) => {
        return await extractText(file.path, file.fileType);
      })
    );

    const description = [
      ...fileContents
    ].join('\n\n');
    const requirements = proposal.userRequirements || '';

    logger.info('Analyzing scope and deliverables', { proposalId: req.params.id });
    const analysis = await analyzeScopeAndDeliverables(description, requirements); // AI analysis

    if (analysis.deliverables) {
      logger.info('Cleaning deliverables', { proposalId: req.params.id });
      analysis.deliverables = cleanDeliverables(analysis.deliverables); // Clean deliverables for count field
    }
    
    proposal.content = analysis;
    proposal.status = 'initial_analysis';
    await proposal.save();

    logger.info('AI processing completed successfully', { proposalId: req.params.id });
    res.json(proposal);
  } catch (error) {
    logger.error('AI processing error', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// Process uploaded files with AI
router.post('/:id/analyze', auth, async (req, res) => {
  logger.info('Analyzing again with the feeback', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { 
        $set: { 
          'userFeedback': req.body.userFeedback || '',
        } 
      },
      { new: true }
    );

    if (!proposal) {
      logger.warn('Proposal not found for AI processing', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found' });
    }

    logger.info('Generating full proposal content', { proposalId: req.params.id });
    const analysis = await analyzeScopeAndDeliverablesWithFeedback(
      proposal.content.scopeOfWork,
      proposal.content.deliverables,
      proposal.userRequirements || '',
      proposal.userFeedback || '',
    ); // AI analysis

    if (analysis.deliverables) {
      logger.info('Cleaning deliverables', { proposalId: req.params.id });
      analysis.deliverables = cleanDeliverables(analysis.deliverables); // Clean deliverables for count field
    }
    
    proposal.content = analysis;
    proposal.status = 'reviewing';
    await proposal.save();

    logger.info('AI processing completed successfully', { proposalId: req.params.id });
    res.json(proposal);
  } catch (error) {
    logger.error('AI processing error', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// Generate full proposal using AI
router.post('/:id/generate', auth, async (req, res) => {
  logger.info('Starting full proposal generation', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOne({ 
      _id: req.params.id, 
      user: req.userId,
      $or: [
        { status: 'initial_analysis' },
        { status: 'reviewing' },
      ]
    });

    if (!proposal) {
      logger.warn('Proposal not found or not ready for generation', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found or not ready' });
    }

    logger.info('Generating full proposal content', { proposalId: req.params.id });
    const fullProposal = await generateFullProposal(
      proposal.content.scopeOfWork,
      proposal.content.deliverables,
      proposal.userRequirements || '',
      proposal.userFeedback || '',
    ); // AI generation

    if (fullProposal.workBreakdown) {
      logger.info('Parsing work breakdown', { proposalId: req.params.id });
      fullProposal.workBreakdown = parseWorkBreakdown(fullProposal.workBreakdown); // Parse work breakdown for days field
    }

    proposal.content = { 
      ...proposal.content, // Keep scope/deliverables
      ...fullProposal      // Add new sections
    };
    proposal.status = 'generated';
    await proposal.save();

    logger.info('Full proposal generation completed successfully', { proposalId: req.params.id });
    res.json(proposal);
  } catch (error) {
    logger.error('Full generation error', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'Full generation failed' });
  }
});

module.exports = router;