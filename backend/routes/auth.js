const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const {
  registerOrLogin,
  getProfile,
  updateProfile
} = require('../controllers/authController');

const router = express.Router();

// Register or login with Firebase token
router.post('/login', 
  [
    body('firebaseToken').notEmpty().withMessage('Firebase token is required')
  ],
  registerOrLogin
);

// Get current user profile
router.get('/profile', authenticateToken, getProfile);

// Update user profile
router.put('/profile', 
  authenticateToken,
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('notificationPreferences.email').optional().isBoolean(),
    body('notificationPreferences.ticketUpdates').optional().isBoolean()
  ],
  updateProfile
);

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      photoURL: req.user.photoURL
    }
  });
});

module.exports = router;