const express = require('express');
const router = express.Router();
const { solveAppointment, noAttemptAppointment, removeAppointment } = require('../controllers/actionController');
const { protectDoctor } = require('../middleware/authMiddleware');

router.post('/solve/:appointmentId', protectDoctor, solveAppointment);
router.post('/no-attempt/:appointmentId', protectDoctor, noAttemptAppointment);
router.post('/remove/:appointmentId', protectDoctor, removeAppointment);

module.exports = router;
