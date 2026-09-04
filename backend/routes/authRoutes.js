const express = require('express');
const router = express.Router();
const { loginDoctor, getMe, acceptNotice } = require('../controllers/authController');
const { protectDoctor } = require('../middleware/authMiddleware');

router.post('/login', loginDoctor);
router.get('/me', protectDoctor, getMe);
router.post('/accept-notice', protectDoctor, acceptNotice);

module.exports = router;
