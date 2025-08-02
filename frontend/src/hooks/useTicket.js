import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useTickets = (filters = {}) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/tickets?${params}`);
      
      if (response.data.success) {
        setTickets(response.data.tickets);
        setPagination(response.data.pagination || pagination);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tickets';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTicket = async (ticketData) => {
    try {
      const response = await api.post('/tickets', ticketData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        toast.success('Ticket created successfully');
        fetchTickets(); // Refresh the list
        return response.data.ticket;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create ticket';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateTicket = async (ticketId, updates) => {
    try {
      const response = await api.put(`/tickets/${ticketId}`, updates);
      
      if (response.data.success) {
        toast.success('Ticket updated successfully');
        fetchTickets(); // Refresh the list
        return response.data.ticket;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update ticket';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      const response = await api.delete(`/tickets/${ticketId}`);
      
      if (response.data.success) {
        toast.success('Ticket deleted successfully');
        fetchTickets(); // Refresh the list
        return true;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete ticket';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    error,
    pagination,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    refetch: fetchTickets
  };
};

export default useTickets;