const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const Proposal = require('../models/Proposal');
const upload = require('../utils/upload');
const logger = require('../utils/logger');

// Get all proposals for user
router.get('/', auth, async (req, res) => {
  logger.info('Fetching all proposals for user', { userId: req.userId });
  try {
    const proposals = await Proposal.find({ user: req.userId });
    res.json(proposals);
  } catch (error) {
    logger.error('Failed to fetch proposals', { error: error.message, stack: error.stack, userId: req.userId });
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new proposal
router.post('/', auth, async (req, res) => {
  logger.info('Creating a new proposal', { userId: req.userId });
  try {
    const proposal = new Proposal({ 
      title: req.body.title || 'Untitled Proposal',
      description: req.body.description || '',
      user: req.userId 
    });
    await proposal.save();
    res.status(201).json(proposal);
  } catch (error) {
    logger.error('Failed to create proposal', { error: error.message, stack: error.stack, userId: req.userId });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single proposal
router.get('/:id', auth, async (req, res) => {
  logger.info('Fetching single proposal', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    }).populate('user', 'email');
    
    if (!proposal) {
      logger.warn('Proposal not found', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  } catch (error) {
    logger.error('Failed to fetch proposal', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Update proposal title
router.patch('/:id/title', auth, async (req, res) => {
  logger.info('Updating proposal title', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title: req.body.title },
      { new: true }
    );

    if (!proposal) {
      logger.warn('Proposal not found for title update', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json(proposal);
  } catch (error) {
    logger.error('Failed to update proposal title', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload files to proposal
router.post('/:id/files', auth, (req, res) => {
  logger.info('Uploading files to proposal', { userId: req.userId, proposalId: req.params.id });
  upload.array('files')(req, res, async (err) => {
    try {
      if (err) {
        logger.warn('File upload error', { error: err.message, userId: req.userId, proposalId: req.params.id });
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds 100MB limit' });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
      }

      const proposal = await Proposal.findOne({ _id: req.params.id, user: req.userId });
      if (!proposal) {
        logger.warn('Proposal not found for file upload', { userId: req.userId, proposalId: req.params.id });
        return res.status(404).json({ error: 'Proposal not found' });
      }

      proposal.files.push(...req.files.map(file => ({
        originalName: file.originalname,
        storageName: file.filename,
        path: file.path,
        size: file.size,
        fileType: file.mimetype
      })));

      await proposal.save();
      res.json(proposal);
    } catch (error) {
      logger.error('Failed to upload files', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Update proposal requirements
router.put('/:id/requirements', auth, async (req, res) => {
  logger.info('Updating proposal requirements', { userId: req.userId, proposalId: req.params.id });
  try {
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { 
        $set: { 
          'requirements.userInput': req.body.requirements,
          status: 'draft' 
        } 
      },
      { new: true }
    );
    
    if (!proposal) {
      logger.warn('Proposal not found for requirements update', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    res.json(proposal);
  } catch (error) {
    logger.error('Failed to update requirements', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Update proposal section
router.patch('/:id/section/:section', auth, async (req, res) => {
  logger.info('Updating proposal section', { userId: req.userId, proposalId: req.params.id, section: req.params.section });
  try {
    const validSections = [
      'executiveSummary', 
      'scopeOfWork',
      'requirements',
      'deliverables',
      'workBreakdown',
      'timeline'
    ];

    if (!validSections.includes(req.params.section)) {
      logger.warn('Invalid section for update', { userId: req.userId, section: req.params.section });
      return res.status(400).json({ error: 'Invalid section' });
    }

    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { 
        [`content.${req.params.section}`]: req.body.value
      },
      { new: true }
    );

    if (!proposal) {
      logger.warn('Proposal not found for section update', { userId: req.userId, proposalId: req.params.id, section: req.params.section });
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json(proposal);
  } catch (error) {
    logger.error('Failed to update section', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id, section: req.params.section });
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Delete proposal
router.delete('/:id', auth, async (req, res) => {
  logger.info('Deleting proposal', { userId: req.userId, proposalId: req.params.id });
  try {
    const result = await Proposal.deleteOne({ _id: req.params.id, user: req.userId });
    if (result.deletedCount === 0) {
      logger.warn('Proposal not found for deletion', { userId: req.userId, proposalId: req.params.id });
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json({ message: 'Proposal deleted' });
  } catch (error) {
    logger.error('Failed to delete proposal', { error: error.message, stack: error.stack, userId: req.userId, proposalId: req.params.id });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;