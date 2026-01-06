const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');
const { authenticateToken } = require('../middleware/auth');

// Authentication routes
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/google-login', authController.googleLogin);

// Authenticated profile route
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
