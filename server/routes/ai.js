const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Proposal = require('../models/Proposal');
const { analyzeScopeAndDeliverables, analyzeScopeAndDeliverablesWithFeedback, generateFullProposal } = require('../services/aiService');
const { extractText } = require('../utils/fileParser');
const { parseWorkBreakdown, cleanDeliverables } = require('../utils/aiHelper');
const logger = require('../utils/logger');

function sendAIError(res, error, fallbackMessage) {
  // openai@4 throws APIError with .status and a human-readable .message
  const status = Number(error?.status) || Number(error?.response?.status);
  const messageFromProvider =
    error?.error?.message ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.error ||
    error?.message;

  if (status === 401) {
    return res.status(401).json({
      error: 'OpenAI authentication failed. Check OPENAI_API_KEY.',
      details: messageFromProvider,
    });
  }

  if (status === 429) {
    return res.status(429).json({
      error: 'OpenAI quota/rate limit exceeded. Check your OpenAI plan and billing. Shifting to MOCK AI.',
      details: messageFromProvider,
    });
  }

  if (status && status >= 400 && status < 600) {
    return res.status(status).json({ error: fallbackMessage, details: messageFromProvider });
  }

  return res.status(500).json({ error: fallbackMessage, details: messageFromProvider });
}

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
    
    const validFiles = [];
    const fileContents = [];
    let filesRemoved = false;

    for (const file of proposal.files) {
      try {
        const text = await extractText(file.path, file.fileType);
        fileContents.push(text);
        validFiles.push(file);
      } catch (error) {
        if (error.code === 'FILE_NOT_FOUND') {
          logger.warn('File missing from storage during AI processing. Removing reference.', { 
            proposalId: req.params.id, 
            filePath: file.path 
          });
          filesRemoved = true;
          continue; // Skip this file and remove its reference later
        }
        throw error; // Rethrow other parsing errors
      }
    }

    // If some files were missing, update the proposal to remove their references
    if (filesRemoved) {
      proposal.files = validFiles;
      await proposal.save();
    }

    const description = [
      ...fileContents
    ].join('\n\n');
    const requirements = proposal.userRequirements || '';

    if (!description.trim() && !requirements.trim()) {
      return res.status(400).json({ 
        error: 'No content to analyze. File uploads are temporary and have been cleared from our server. Please re-upload your documents or provide text requirements to continue.' 
      });
    }

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
    return sendAIError(res, error, 'AI processing failed');
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
    return sendAIError(res, error, 'AI processing failed');
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
    return sendAIError(res, error, 'Full generation failed');
  }
});

module.exports = router;