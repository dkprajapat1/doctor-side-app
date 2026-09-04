const express = require('express');
const router = express.Router();
const { 
  getQueue, 
  getPatientDetail, 
  getEmergencies, 
  resolveEmergency, 
  getPublicDoctors 
} = require('../controllers/doctorController');
const { protectDoctor } = require('../middleware/authMiddleware');

router.get('/public-list', getPublicDoctors);
router.get('/queue', protectDoctor, getQueue);
router.get('/patient/:appointmentId', protectDoctor, getPatientDetail);
router.get('/emergencies', protectDoctor, getEmergencies);
router.post('/emergencies/:id/resolve', protectDoctor, resolveEmergency);

module.exports = router;
