const express = require('express');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/categoryController');

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name').notEmpty().trim().isLength({ min: 1, max: 50 }).withMessage('Category name must be 1-50 characters'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
];

// Get all categories (accessible to all authenticated users)
router.get('/', authenticateToken, getAllCategories);

// Get category statistics (Admin only)
router.get('/stats', 
  authenticateToken, 
  checkRole(['admin']), 
  getCategoryStats
);

// Get category by ID (Admin only)
router.get('/:id', 
  authenticateToken, 
  checkRole(['admin']), 
  getCategoryById
);

// Create category (Admin only)
router.post('/',
  authenticateToken,
  checkRole(['admin']),
  categoryValidation,
  createCategory
);

// Update category (Admin only)
router.put('/:id',
  authenticateToken,
  checkRole(['admin']),
  [
    body('name').optional().trim().isLength({ min: 1, max: 50 }),
    body('description').optional().trim().isLength({ max: 200 }),
    body('color').optional().isHexColor(),
    body('isActive').optional().isBoolean()
  ],
  updateCategory
);

// Delete category (Admin only)
router.delete('/:id',
  authenticateToken,
  checkRole(['admin']),
  deleteCategory
);

module.exports = router;