const mongoose = require('mongoose');

// Ensure Patient and Doctor models are registered
require('./Patient');
require('./Doctor');

const documentItemSchema = new mongoose.Schema({
  documentId: { type: String },
  filename: { type: String },
  fileType: { type: String },
  fileUrl: { type: String },
  extractedText: { type: String },
  confidence: { type: Number, default: 0.95 }
}, { _id: false });

const followupItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  slotId: { type: String, required: true },
  slotLabel: { type: String, required: true },
  queueNumber: { type: Number, required: true },
  date: { type: String, required: true },
  problem: { type: String, required: true },
  followupAnswers: [followupItemSchema],
  documents: [documentItemSchema],
  clinicalFacts: {
    safeFacts: { type: mongoose.Schema.Types.Mixed },
    prioritizedFacts: { type: mongoose.Schema.Types.Mixed },
    rxnormValidations: { type: mongoose.Schema.Types.Mixed }
  },
  aiSummary: { type: String, default: '' },
  summarySource: { 
    type: String, 
    enum: ['DEMO', 'MODULE_2', 'MANUAL'], 
    default: 'DEMO' 
  },
  status: { 
    type: String, 
    enum: ['CONFIRMED', 'IN_QUEUE', 'SOLVED', 'NO_ATTEMPT', 'REMOVED', 'RESCHEDULED'], 
    default: 'CONFIRMED' 
  },
  statusMessage: { type: String, default: '' },
  rescheduledFromSlot: { type: String, default: null },
  rescheduledFromQueueNumber: { type: Number, default: null },
  solvedAt: { type: Date },
  removedAt: { type: Date },
  rescheduledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
