const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'sih_2026_super_secret_jwt_key_doctor';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

// @desc    Doctor Login
// @route   POST /api/auth/login
const loginDoctor = async (req, res) => {
  try {
    const { hospitalId, doctorId, password } = req.body;

    if (!hospitalId || !doctorId || !password) {
      return res.status(400).json({ error: true, message: 'Please provide Hospital ID, Doctor ID, and Password.' });
    }

    const doctor = await Doctor.findOne({
      hospitalId: hospitalId.trim(),
      doctorId: doctorId.trim()
    });

    if (!doctor) {
      return res.status(401).json({ error: true, message: 'Invalid Hospital ID or Doctor ID.' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ error: true, message: 'Invalid credentials.' });
    }

    const token = generateToken(doctor._id);

    return res.json({
      success: true,
      token,
      doctor: {
        id: doctor._id,
        hospitalId: doctor.hospitalId,
        doctorId: doctor.doctorId,
        name: doctor.name,
        email: doctor.email,
        department: doctor.department,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
        isDemo: doctor.isDemo,
        noticeAccepted: doctor.noticeAccepted
      }
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// @desc    Get authenticated doctor info
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      doctor: req.doctor
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// @desc    Acknowledge first entry AI notice
// @route   POST /api/auth/accept-notice
const acceptNotice = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor._id);
    if (!doctor) {
      return res.status(404).json({ error: true, message: 'Doctor not found.' });
    }

    doctor.noticeAccepted = true;
    doctor.noticeAcceptedAt = new Date();
    await doctor.save();

    return res.json({
      success: true,
      noticeAccepted: true,
      message: 'AI usage notice acknowledged.'
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  loginDoctor,
  getMe,
  acceptNotice
};
