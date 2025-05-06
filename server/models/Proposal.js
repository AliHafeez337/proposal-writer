const mongoose = require('mongoose');
const { deleteFileFromStorage } = require('../utils/file'); // Import file deletion utility

const ProposalSchema = new mongoose.Schema({ // Proposal Schema
  title: { type: String, required: true }, // Proposal title
  description: { type: String, required: false }, // Proposal description
  createdAt: { type: Date, default: Date.now }, // Date of creation
  updatedAt: { type: Date, default: Date.now }, // Date of last update
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who created the proposal
  status: {
    type: String,
    enum: ['draft', 'initial_analysis', 'reviewing', 'generated', 'complete'],
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
  userRequirements: String,
  userFeedback: String,
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
      dependencies: [String]
    }],
    timeline: [{
      phase: String,
      startDate: Date,
      endDate: Date,
      tasks: [String],
      milestones: [{
        name: String,
        percentage: {
          type: Number,
          required: true,
          min: 1,
          max: 100
        },
        dueDate: {
          type: Date,
          required: false,
          validate: {
            validator: function(v) {
              // Get the parent phase (this is the milestone document)
              const phase = this.parent();
              // Ensure we have valid dates to compare against
              if (!phase.startDate && !phase.endDate) { // both not returned by AI
                return true;
              }
              if (!phase.startDate || !phase.endDate) {
                return false;
              }
              
              // Convert all dates to timestamps for comparison
              const dueDate = new Date(v).getTime();
              const startDate = new Date(phase.startDate).getTime();
              const endDate = new Date(phase.endDate).getTime();
              
              return dueDate >= startDate && dueDate <= endDate;
            },
            message: props => `Milestone due date (${new Date(props.value).toLocaleDateString()}) must be between phase start (${this.startDate.toLocaleDateString()}) and end (${this.endDate.toLocaleDateString()}) dates`
          }
        },
        paymentAmount: {
          type: Number,
          default: function() {
            const proposal = this.parent().parent().parent(); // timeline -> proposal -> pricing
            return (proposal.pricing.total * this.percentage) / 100;
          }
        }
      }]
    }]
  },
  pricing: {  
    items: [{
      deliverableId: mongoose.Schema.Types.ObjectId, // Reference to content.deliverables._id
      unitPrice: {
        type: Number,
        required: true,
        min: 0.01
      },
      notes: String // Optional field for pricing specifics
    }],
    // Auto-calculated fields
    total: {
      type: Number,
      default: 0 // Initialize as 0
    }
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
  //// not handling the case where items exists even before deliverables are created (when you have already generated a proposal and you go back to do initial_analysis...) in which case we should delete the items and user should recreate them...
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
    this.content.timeline?.milestones?.forEach(milestone => {
      milestone.paymentAmount = (this.pricing.total * milestone.percentage) / 100;
    });
  }

  // Validate percentages
  let totalPercent = 0;
  this.pricing.content?.timeline.forEach(phase => {
    phase.milestones.forEach(milestone => {
      totalPercent += milestone.percentage;
    });
  });
  if (totalPercent > 100) {
    throw new Error('Total milestone percentages exceed 100%');
  }

  this.updatedAt = Date.now(); // Update timestamp

  next();
});

// Update timestamp before updating
ProposalSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() }); // Update timestamp
});

// Update timestamp before updating
ProposalSchema.pre('updateOne', function() {
  this.set({ updatedAt: new Date() });
});

// Remove files when proposal is deleted
ProposalSchema.pre('remove', async function(next) {
  // Delete all associated files when proposal is deleted
  try {
    await Promise.all(
      this.files.map(file => deleteFileFromStorage(file.path))
    );
    next();
  } catch (error) {
    next(error);
  }
});

// Data to be returned to the frontend
ProposalSchema.methods.toJSON = function() {
  const proposal = this.toObject();
  proposal.content?.deliverables.forEach(deliverable => {
    let pricedItem = proposal.pricing.items.find(item => item.deliverableId.toString() === deliverable._id.toString());
    if (pricedItem && pricedItem.unitPrice) {
      deliverable.unitPrice = pricedItem.unitPrice;
    }
  });
  delete proposal.__v; // Remove version key
  return proposal;
}

module.exports = mongoose.model('Proposal', ProposalSchema);