const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  age: { type: Number, default: 30 },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  bloodType: { type: String, default: 'O+' },
  medicalHistory: [{ type: String }],
  declarationAccepted: { type: Boolean, default: false },
  declarationAcceptedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
