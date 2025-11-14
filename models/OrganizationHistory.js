const mongoose = require('mongoose');

const organizationHistorySchema = new mongoose.Schema({
  organizationId: { 
    type: String, 
    required: true,
    index: true 
  },
  version: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed
  },
  changedBy: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  collection: 'organization_history'
});

// Compound index for efficient queries
organizationHistorySchema.index({ organizationId: 1, version: -1 });

module.exports = mongoose.model('OrganizationHistory', organizationHistorySchema);
