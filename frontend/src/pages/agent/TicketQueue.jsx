import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, User, Tag } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TicketQueue = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: '',
    assigned: 'all'
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          if (key === 'assigned' && value === 'me') {
            params.append('assigned', 'me');
          } else if (key !== 'assigned') {
            params.append(key, value);
          }
        }
      });

      const response = await api.get(`/tickets?${params}`);
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const assignTicket = async (ticketId) => {
    try {
      const response = await api.put(`/tickets/${ticketId}`, {
        assignedTo: 'self'
      });
      
      if (response.data.success) {
        toast.success('Ticket assigned successfully');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to assign ticket');
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const response = await api.put(`/tickets/${ticketId}`, { status });
      
      if (response.data.success) {
        toast.success(`Ticket marked as ${status}`);
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ticket Queue</h1>
        <p className="text-gray-600">Manage and respond to support tickets</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Assignment Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={filters.assigned}
            onChange={(e) => handleFilterChange('assigned', e.target.value)}
          >
            <option value="all">All Tickets</option>
            <option value="me">My Tickets</option>
            <option value="unassigned">Unassigned</option>
          </select>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white shadow-sm rounded-lg border">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters to see more tickets.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Ticket Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <StatusBadge status={ticket.status} />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-sm text-gray-500">
                        #{ticket._id.slice(-6)}
                      </span>
                      {ticket.category && (
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: `${ticket.category.color}20`,
                            color: ticket.category.color 
                          }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {ticket.category.name}
                        </span>
                      )}
                    </div>
                    
                    {/* Ticket Title */}
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="text-lg font-medium text-gray-900 hover:text-primary-600 block mb-1"
                    >
                      {ticket.subject}
                    </Link>
                    
                    {/* Ticket Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {ticket.description}
                    </p>
                    
                    {/* Ticket Meta */}
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {ticket.createdBy.name}
                      </span>
                      <span>
                        Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </span>
                      {ticket.lastActivityAt !== ticket.createdAt && (
                        <span>
                          Updated {formatDistanceToNow(new Date(ticket.lastActivityAt), { addSuffix: true })}
                        </span>
                      )}
                      {ticket.comments.length > 0 && (
                        <span>
                          {ticket.comments.length} comment{ticket.comments.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {ticket.assignedTo ? (
                      <div className="text-xs text-gray-500">
                        Assigned to {ticket.assignedTo.name}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => assignTicket(ticket._id)}
                      >
                        Assign to Me
                      </Button>
                    )}
                    
                    <div className="flex space-x-2">
                      {ticket.status === 'Open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTicketStatus(ticket._id, 'In Progress')}
                        >
                          Start Work
                        </Button>
                      )}
                      
                      {ticket.status === 'In Progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTicketStatus(ticket._id, 'Resolved')}
                        >
                          Resolve
                        </Button>
                      )}
                      
                      <Link to={`/tickets/${ticket._id}`}>
                        <Button size="sm" variant="primary">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketQueue;