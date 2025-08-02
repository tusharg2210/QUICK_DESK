import api from './api';

export const ticketService = {
  // Get all tickets with filters
  getTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/tickets?${params}`);
    return response.data;
  },

  // Get single ticket
  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update ticket
  updateTicket: async (id, updates) => {
    const response = await api.put(`/tickets/${id}`, updates);
    return response.data;
  },

  // Add comment
  addComment: async (id, comment) => {
    const response = await api.post(`/tickets/${id}/comments`, comment);
    return response.data;
  },

  // Vote on ticket
  voteTicket: async (id, type) => {
    const response = await api.post(`/tickets/${id}/vote`, { type });
    return response.data;
  },

  // Get ticket statistics
  getStats: async () => {
    const response = await api.get('/tickets/stats');
    return response.data;
  }
};