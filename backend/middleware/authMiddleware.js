const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const protectDoctor = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: true, message: 'Not authorized, doctor token missing' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'sih_2026_super_secret_jwt_key_doctor';
    const decoded = jwt.verify(token, secret);
    const doctor = await Doctor.findById(decoded.id).select('-password');

    if (!doctor) {
      return res.status(401).json({ error: true, message: 'Doctor account not found' });
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Token verification failed or token expired' });
  }
};

module.exports = { protectDoctor };
