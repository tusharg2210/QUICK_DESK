const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email configuration not found. Email notifications will be disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  ticketCreated: (ticket, user) => ({
    subject: `New Ticket Created: ${ticket.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">New Support Ticket Created</h2>
        <p>Hello ${user.name},</p>
        <p>Your support ticket has been created successfully.</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Ticket Details</h3>
          <p><strong>Ticket ID:</strong> #${ticket._id.toString().slice(-6)}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Status:</strong> ${ticket.status}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Category:</strong> ${ticket.category?.name || 'N/A'}</p>
        </div>
        
        <p>We'll get back to you as soon as possible.</p>
        
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/tickets/${ticket._id}" 
             style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Ticket
          </a>
        </p>
        
        <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
          This is an automated email from QuickDesk Support System.
        </p>
      </div>
    `
  }),

  ticketUpdated: (ticket, user, updatedBy) => ({
    subject: `Ticket Updated: ${ticket.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Ticket Updated</h2>
        <p>Hello ${user.name},</p>
        <p>Your support ticket has been updated by ${updatedBy.name}.</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Ticket Details</h3>
          <p><strong>Ticket ID:</strong> #${ticket._id.toString().slice(-6)}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Status:</strong> <span style="color: ${getStatusColor(ticket.status)};">${ticket.status}</span></p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          ${ticket.assignedTo ? `<p><strong>Assigned to:</strong> ${ticket.assignedTo.name}</p>` : ''}
        </div>
        
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/tickets/${ticket._id}" 
             style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Ticket
          </a>
        </p>
        
        <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
          This is an automated email from QuickDesk Support System.
        </p>
      </div>
    `
  }),

  commentAdded: (ticket, user, comment, commentAuthor) => ({
    subject: `New Comment on Ticket: ${ticket.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">New Comment Added</h2>
        <p>Hello ${user.name},</p>
        <p>${commentAuthor.name} has added a new comment to your ticket.</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Ticket: ${ticket.subject}</h3>
          <p><strong>Ticket ID:</strong> #${ticket._id.toString().slice(-6)}</p>
        </div>
        
        <div style="background-color: #FFFFFF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0;">
          <p><strong>${commentAuthor.name} wrote:</strong></p>
          <p style="margin: 10px 0;">${comment.text}</p>
        </div>
        
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/tickets/${ticket._id}" 
             style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Ticket & Reply
          </a>
        </p>
        
        <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
          This is an automated email from QuickDesk Support System.
        </p>
      </div>
    `
  }),

  ticketAssigned: (ticket, agent) => ({
    subject: `Ticket Assigned: ${ticket.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">New Ticket Assigned</h2>
        <p>Hello ${agent.name},</p>
        <p>A new ticket has been assigned to you.</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Ticket Details</h3>
          <p><strong>Ticket ID:</strong> #${ticket._id.toString().slice(-6)}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Created by:</strong> ${ticket.createdBy.name}</p>
          <p><strong>Category:</strong> ${ticket.category?.name || 'N/A'}</p>
        </div>
        
        <div style="background-color: #FFFFFF; border-left: 4px solid #6B7280; padding: 15px; margin: 20px 0;">
          <p><strong>Description:</strong></p>
          <p>${ticket.description.substring(0, 200)}${ticket.description.length > 200 ? '...' : ''}</p>
        </div>
        
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/tickets/${ticket._id}" 
             style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Ticket
          </a>
        </p>
        
        <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
          This is an automated email from QuickDesk Support System.
        </p>
      </div>
    `
  })
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Open': return '#3B82F6';
    case 'In Progress': return '#F59E0B';
    case 'Resolved': return '#10B981';
    case 'Closed': return '#6B7280';
    default: return '#6B7280';
  }
};

// Send email function
const sendEmail = async (to, template, data) => {
  if (!transporter) {
    console.log('Email not sent - transporter not configured');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const emailContent = emailTemplates[template](data.ticket, data.user, data.updatedBy || data.commentAuthor);
    
    const mailOptions = {
      from: `QuickDesk Support <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully' 
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Notification functions
const notifications = {
  ticketCreated: async (ticket, user) => {
    if (user.notificationPreferences?.email) {
      return await sendEmail(user.email, 'ticketCreated', { ticket, user });
    }
    return { success: false, message: 'Email notifications disabled for user' };
  },

  ticketUpdated: async (ticket, user, updatedBy) => {
    if (user.notificationPreferences?.ticketUpdates && user.notificationPreferences?.email) {
      return await sendEmail(user.email, 'ticketUpdated', { ticket, user, updatedBy });
    }
    return { success: false, message: 'Ticket update notifications disabled for user' };
  },

  commentAdded: async (ticket, user, comment, commentAuthor) => {
    if (user.notificationPreferences?.email && user._id.toString() !== commentAuthor._id.toString()) {
      return await sendEmail(user.email, 'commentAdded', { ticket, user, comment, commentAuthor });
    }
    return { success: false, message: 'Comment notifications disabled or user is comment author' };
  },

  ticketAssigned: async (ticket, agent) => {
    if (agent.notificationPreferences?.email) {
      return await sendEmail(agent.email, 'ticketAssigned', { ticket, user: agent });
    }
    return { success: false, message: 'Assignment notifications disabled for agent' };
  }
};

module.exports = {
  sendEmail,
  notifications,
  transporter
};