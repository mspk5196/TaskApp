const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const socialAuthController = require('../controllers/socialAuthController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', socialAuthController.googleLogin);

module.exports = router;
