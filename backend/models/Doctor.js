const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, trim: true },
  doctorId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  password: { type: String, required: true },
  department: { 
    type: String, 
    required: true, 
    enum: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Dermatology'] 
  },
  specialization: { type: String, default: 'General Specialist' },
  hospital: { type: String, default: 'AIIMS Metro Hospital' },
  isDemo: { type: Boolean, default: true },
  noticeAccepted: { type: Boolean, default: false },
  noticeAcceptedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
