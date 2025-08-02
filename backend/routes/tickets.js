const express = require('express');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
  voteTicket
} = require('../controllers/ticketController');

const router = express.Router();

// Validation rules
const createTicketValidation = [
  body('subject').notEmpty().trim().isLength({ min: 5, max: 200 }),
  body('description').notEmpty().trim().isLength({ min: 10 }),
  body('category').isMongoId()
];

const commentValidation = [
  body('text').notEmpty().trim().isLength({ min: 1, max: 1000 })
];

// Routes
router.post('/', 
  authenticateToken,
  upload.array('attachments', 5),
  createTicketValidation,
  createTicket
);

router.get('/', authenticateToken, getTickets);

router.get('/:id', authenticateToken, getTicketById);

router.put('/:id', 
  authenticateToken,
  checkRole(['agent', 'admin']),
  updateTicket
);

router.post('/:id/comments',
  authenticateToken,
  commentValidation,
  addComment
);

router.post('/:id/vote',
  authenticateToken,
  voteTicket
);

module.exports = router;