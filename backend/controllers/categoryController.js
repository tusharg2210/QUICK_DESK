const Category = require('../models/Category');
const Ticket = require('../models/Ticket');
const { validationResult } = require('express-validator');

const getAllCategories = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;
    
    const query = includeInactive === 'true' ? {} : { isActive: true };
    
    const categories = await Category.find(query)
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    // Get ticket count for each category
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const ticketCount = await Ticket.countDocuments({ 
          category: category._id,
          status: { $ne: 'Closed' }
        });
        
        const totalTickets = await Ticket.countDocuments({ category: category._id });

        return {
          ...category.toObject(),
          stats: {
            activeTickets: ticketCount,
            totalTickets
          }
        };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithStats
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get category statistics
    const stats = {
      totalTickets: await Ticket.countDocuments({ category: category._id }),
      openTickets: await Ticket.countDocuments({ 
        category: category._id, 
        status: 'Open' 
      }),
      inProgressTickets: await Ticket.countDocuments({ 
        category: category._id, 
        status: 'In Progress' 
      }),
      resolvedTickets: await Ticket.countDocuments({ 
        category: category._id, 
        status: 'Resolved' 
      }),
      closedTickets: await Ticket.countDocuments({ 
        category: category._id, 
        status: 'Closed' 
      })
    };

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        stats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, color } = req.body;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      color: color || '#6B7280',
      createdBy: req.user._id
    });

    await category.save();
    await category.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, color, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: category._id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description?.trim();
    if (color) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    await category.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has active tickets
    const activeTicketsCount = await Ticket.countDocuments({ 
      category: category._id,
      status: { $in: ['Open', 'In Progress'] }
    });

    if (activeTicketsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${activeTicketsCount} active ticket(s). Please resolve or reassign these tickets first.`
      });
    }

    // Soft delete by setting isActive to false
    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: 'Category deactivated successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

const getCategoryStats = async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments({ isActive: true });
    const inactiveCategories = await Category.countDocuments({ isActive: false });

    // Get categories with most tickets
    const categoryStats = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'category',
          as: 'tickets'
        }
      },
      {
        $project: {
          name: 1,
          color: 1,
          ticketCount: { $size: '$tickets' },
          activeTickets: {
            $size: {
              $filter: {
                input: '$tickets',
                cond: { $in: ['$$this.status', ['Open', 'In Progress']] }
              }
            }
          }
        }
      },
      { $sort: { ticketCount: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalCategories,
        inactive: inactiveCategories,
        categoryBreakdown: categoryStats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
};