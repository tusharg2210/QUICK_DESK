const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { validationResult } = require('express-validator');

const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      search,
      isActive = true,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Apply filters
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-firebaseUid')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get ticket counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const ticketCount = await Ticket.countDocuments({ createdBy: user._id });
        const assignedTicketCount = user.role !== 'enduser' 
          ? await Ticket.countDocuments({ assignedTo: user._id })
          : 0;

        return {
          ...user.toObject(),
          stats: {
            ticketsCreated: ticketCount,
            ticketsAssigned: assignedTicketCount
          }
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-firebaseUid');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const stats = {
      ticketsCreated: await Ticket.countDocuments({ createdBy: user._id }),
      ticketsAssigned: user.role !== 'enduser' 
        ? await Ticket.countDocuments({ assignedTo: user._id }) 
        : 0,
      openTickets: await Ticket.countDocuments({ 
        createdBy: user._id, 
        status: { $in: ['Open', 'In Progress'] } 
      }),
      resolvedTickets: await Ticket.countDocuments({ 
        $or: [
          { createdBy: user._id, status: 'Resolved' },
          { assignedTo: user._id, status: 'Resolved' }
        ]
      })
    };

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        stats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated from ${oldRole} to ${role}`,
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
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete by deactivating the user
        // Soft delete by deactivating the user
    user.isActive = false;
    await user.save();

    // Optionally, you might want to reassign their tickets or handle them differently
    // For now, we'll just deactivate the user
    await Ticket.updateMany(
      { assignedTo: user._id, status: { $in: ['Open', 'In Progress'] } },
      { $unset: { assignedTo: 1 } } // Remove assignment from active tickets
    );

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    const endUsers = await User.countDocuments({ role: 'enduser', isActive: true });
    const agents = await User.countDocuments({ role: 'agent', isActive: true });
    const admins = await User.countDocuments({ role: 'admin', isActive: true });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });

    // Get most active users (by tickets created)
    const mostActiveUsers = await User.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'tickets'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          ticketCount: { $size: '$tickets' }
        }
      },
      { $sort: { ticketCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalUsers,
        active: activeUsers,
        byRole: {
          enduser: endUsers,
          agent: agents,
          admin: admins
        },
        recentRegistrations,
        mostActiveUsers
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserStats
};