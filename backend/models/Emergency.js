const mongoose = require('mongoose');

require('./Patient');
require('./Doctor');

const emergencySchema = new mongoose.Schema({
  emergencyId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'RESOLVED', 'CANCELLED'], 
    default: 'ACTIVE' 
  },
  severity: { 
    type: String, 
    enum: ['CRITICAL', 'HIGH', 'MEDIUM'], 
    default: 'CRITICAL' 
  },
  reason: { 
    type: String, 
    default: 'Emergency assistance requested by patient.' 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  resolvedAt: { 
    type: Date 
  },
  resolvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor' 
  }
}, { timestamps: true });

module.exports = mongoose.models.Emergency || mongoose.model('Emergency', emergencySchema);
