const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({ // Proposal Schema
  title: { type: String, required: true }, // Proposal title
  description: { type: String, required: false }, // Proposal description
  createdAt: { type: Date, default: Date.now }, // Date of creation
  updatedAt: { type: Date, default: Date.now }, // Date of last update
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who created the proposal
  status: {
    type: String,
    enum: ['draft', 'generating', 'complete'],
    default: 'draft'
  },
  files: [{
    originalName: String,
    storageName: String,
    path: String,
    size: Number,
    fileType: String,  // Add this line
    uploadDate: { type: Date, default: Date.now }
  }],
  requirements: {
    userInput: String,  // Text area content
    extractedRequirements: [String]  // For AI-processed requirements
  },
  content: {            // Extracted text from files
    executiveSummary: String,
    scopeOfWork: String,
    requirements: [String], // AI-extracted requirements
    deliverables: [{
      item: String,
      unit: String,
      count: {
        type: Number,
        default: 1,
        min: 1,
        validate: {
          validator: Number.isInteger,
          message: 'Count must be a whole number'
        }
      },
      description: String
    }],
    workBreakdown: [{
      task: String,
      duration: {
        type: Number, // Duration in days
        min: 1,
        validate: {
          validator: Number.isInteger,
          message: 'Duration must be whole days'
        }
      },
      dependencies: [String] // task IDs
    }],
    timeline: [{
      phase: String,
      startDate: Date,
      endDate: Date,
      tasks: [String] // task IDs from workBreakdown
    }]
  },
  pricing: {  
    items: [{
      deliverableId: mongoose.Schema.Types.ObjectId, // Reference to content.deliverables._id
      unitPrice: Number,
      notes: String // Optional field for pricing specifics
    }],
    // Auto-calculated fields
    total: {
      type: Number,
      default: 0 // Initialize as 0
    },
    milestones: [{
      phaseId: mongoose.Schema.Types.ObjectId,
      percentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100
      },
      dueDate: {
        type: Date,
        required: true,
        validate: {
          validator: function(v) {
            if (!this.parent().content?.timeline) return false;
            const phase = this.parent().content.timeline.id(this.phaseId);
            if (!phase) return false;
            return v >= phase.startDate && v <= phase.endDate;
          },
          message: props => `Due date must be within the phase's timeline`
        }
      },
      paymentAmount: {
        type: Number,
        default: function() {
          const proposal = this.parent().parent();
          return (proposal.pricing.total * this.percentage) / 100;
        }
      }
    }]
  }
}, { timestamps: true });

// Virtual for easy frontend access
ProposalSchema.virtual('pricing.itemsWithDetails').get(function() {
  return this.pricing.items.map(item => ({
    ...item.toObject(),
    deliverable: this.content.deliverables.id(item.deliverableId)
  }));
});

ProposalSchema.pre('save', function(next) {
  // Ensure all deliverableIds exist
  this.pricing.items.forEach(item => {
    if (!this.content.deliverables.id(item.deliverableId)) {
      throw new Error(`Deliverable ${item.deliverableId} not found`);
    }
  });

  // Calculate total whenever items change
  if (this.isModified('pricing.items')) {
    this.pricing.total = this.pricing.items.reduce((sum, item) => {
      const deliverable = this.content.deliverables.id(item.deliverableId);
      return sum + (item.unitPrice * (deliverable?.count || 0));
    }, 0);
  }
  
  // Auto-calculate payment amounts
  if (this.isModified('pricing.milestones') || this.isModified('pricing.total')) {
    this.pricing.milestones.forEach(milestone => {
      milestone.paymentAmount = (this.pricing.total * milestone.percentage) / 100;
    });
  }

  // Validate percentages
  const totalPercent = this.pricing.milestones.reduce((sum, m) => sum + m.percentage, 0);
  if (totalPercent > 100) {
    throw new Error('Total milestone percentages exceed 100%');
  }

  this.updatedAt = Date.now(); // Update timestamp

  next();
});

ProposalSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() }); // Update timestamp
});

ProposalSchema.pre('updateOne', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('Proposal', ProposalSchema);