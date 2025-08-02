const Ticket = require('../models/Ticket');
const { validationResult } = require('express-validator');

const createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { subject, description, category, priority = 'Medium' } = req.body;
    
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    })) : [];

    const ticket = new Ticket({
      subject,
      description,
      category,
      priority,
      createdBy: req.user._id,
      attachments
    });

    await ticket.save();
    await ticket.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'category', select: 'name color' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: error.message
    });
  }
};

const getTickets = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      search,
      sortBy = 'lastActivityAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Role-based filtering
    if (req.user.role === 'enduser') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'agent') {
      // Agents can see all tickets or assigned to them
      if (req.query.assigned === 'me') {
        query.assignedTo = req.user._id;
      }
    }
    // Admins see all tickets (no additional filter)

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('category', 'name color')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(query);

    res.json({
      success: true,
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email photoURL')
      .populate('assignedTo', 'name email photoURL')
      .populate('category', 'name color')
      .populate('comments.author', 'name email photoURL');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === 'enduser' && 
        ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      ticket
    });

  } catch (error) {
    res.status(500).json({
            success: false,
      message: 'Failed to fetch ticket',
      error: error.message
    });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.body;
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === 'enduser' && 
        ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only agents and admins can change status and assignment
    if (req.user.role !== 'enduser') {
      if (status) {
        ticket.status = status;
        if (status === 'Resolved' || status === 'Closed') {
          ticket.resolvedAt = new Date();
        }
      }
      if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
      if (priority) ticket.priority = priority;
    }

    ticket.lastActivityAt = new Date();
    await ticket.save();
    
    await ticket.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'category', select: 'name color' }
    ]);

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
      error: error.message
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { text, isInternal = false } = req.body;
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === 'enduser' && 
        ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const comment = {
      text,
      author: req.user._id,
      isInternal: req.user.role === 'enduser' ? false : isInternal
    };

    ticket.comments.push(comment);
    ticket.lastActivityAt = new Date();
    await ticket.save();

    await ticket.populate('comments.author', 'name email photoURL');

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: ticket.comments[ticket.comments.length - 1]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

const voteTicket = async (req, res) => {
  try {
    const { type } = req.body; // 'up' or 'down'
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const userId = req.user._id;
    
    // Remove existing votes
    ticket.votes.upvotes = ticket.votes.upvotes.filter(id => !id.equals(userId));
    ticket.votes.downvotes = ticket.votes.downvotes.filter(id => !id.equals(userId));
    
    // Add new vote
    if (type === 'up') {
      ticket.votes.upvotes.push(userId);
    } else if (type === 'down') {
      ticket.votes.downvotes.push(userId);
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      votes: {
        upvotes: ticket.votes.upvotes.length,
        downvotes: ticket.votes.downvotes.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record vote',
      error: error.message
    });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
  voteTicket
};