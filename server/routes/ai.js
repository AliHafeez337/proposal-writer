const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Proposal = require('../models/Proposal');
const { analyzeScopeAndDeliverables, generateFullProposal } = require('../services/aiService');
const { extractText } = require('../utils/fileParser');
const { parseWorkBreakdown, cleanDeliverables } = require('../utils/aiHelper');
const logger = require('../utils/logger');

// Process uploaded files with AI
router.post('/:id/process', auth, async (req, res) => {
  logger.info('Starting AI processing for proposal', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

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
    const requirements = proposal.requirements?.userInput || '';

    logger.info('Analyzing scope and deliverables', { proposalId: req.params.id });
    const analysis = await analyzeScopeAndDeliverables(description, requirements);

    if (analysis.deliverables) {
      logger.info('Cleaning deliverables', { proposalId: req.params.id });
      analysis.deliverables = cleanDeliverables(analysis.deliverables);
    }
    
    proposal.content = analysis;
    proposal.status = 'generating';
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
      status: 'generating' // Ensure first pass completed
    });

    if (!proposal) {
      logger.warn('Proposal not found or not ready for generation', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found or not ready' });
    }

    logger.info('Generating full proposal content', { proposalId: req.params.id });
    const fullProposal = await generateFullProposal(
      proposal.content.scopeOfWork,
      proposal.content.deliverables,
      proposal.requirements?.userInput || ''
    );

    if (fullProposal.workBreakdown) {
      logger.info('Parsing work breakdown', { proposalId: req.params.id });
      fullProposal.workBreakdown = parseWorkBreakdown(fullProposal.workBreakdown);
    }

    proposal.content = { 
      ...proposal.content, // Keep scope/deliverables
      ...fullProposal      // Add new sections
    };
    proposal.status = 'complete';
    await proposal.save();

    logger.info('Full proposal generation completed successfully', { proposalId: req.params.id });
    res.json(proposal);
  } catch (error) {
    logger.error('Full generation error', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'Full generation failed' });
  }
});

module.exports = router;