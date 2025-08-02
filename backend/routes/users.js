const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserStats
} = require('../controllers/userController');

const router = express.Router();

// Get all users (Admin only)
router.get('/', 
  authenticateToken, 
  checkRole(['admin']), 
  getAllUsers
);

// Get user statistics (Admin only)
router.get('/stats', 
  authenticateToken, 
  checkRole(['admin']), 
  getUserStats
);

// Get user by ID (Admin only)
router.get('/:id', 
  authenticateToken, 
  checkRole(['admin']), 
  getUserById
);

// Update user role (Admin only)
router.put('/:id/role', 
  authenticateToken,
  checkRole(['admin']),
  [
    body('role').isIn(['enduser', 'agent', 'admin']).withMessage('Invalid role')
  ],
  updateUserRole
);

// Toggle user status (Admin only)
router.put('/:id/status', 
  authenticateToken,
  checkRole(['admin']),
  [
    body('isActive').isBoolean().withMessage('isActive must be a boolean')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const User = require('../models/User');
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.isActive = req.body.isActive;
      await user.save();

      res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: error.message
      });
    }
  }
);

// Delete user (Admin only) - Soft delete
router.delete('/:id', 
  authenticateToken, 
  checkRole(['admin']), 
  deleteUser
);

module.exports = router;