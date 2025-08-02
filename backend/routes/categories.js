const express = require('express');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const Category = require('../models/Category');

const router = express.Router();

// Get all active categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name description color')
      .sort({ name: 1 });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Create category (Admin only)
router.post('/',
  authenticateToken,
  checkRole(['admin']),
  [
    body('name').notEmpty().trim().isLength({ min: 1, max: 50 }),
    body('description').optional().trim().isLength({ max: 200 }),
    body('color').optional().isHexColor()
  ],
  async (req, res) => {
    try {
      const { name, description, color } = req.body;

      const category = new Category({
        name,
        description,
        color: color || '#6B7280',
        createdBy: req.user._id
      });

      await category.save();

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }
  }
);

// Update category (Admin only)
router.put('/:id',
  authenticateToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { name, description, color, isActive } = req.body;

      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      if (name) category.name = name;
      if (description !== undefined) category.description = description;
      if (color) category.color = color;
      if (isActive !== undefined) category.isActive = isActive;

      await category.save();

      res.json({
        success: true,
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    }
  }
);

// Delete category (Admin only)
router.delete('/:id',
  authenticateToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Soft delete by setting isActive to false
      category.isActive = false;
      await category.save();

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message
      });
    }
  }
);

module.exports = router;