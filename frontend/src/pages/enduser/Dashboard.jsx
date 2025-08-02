import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Filter, Ticket } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'lastActivityAt',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/tickets?${params}`);
      
      if (response.data.success) {
        setTickets(response.data.tickets);
        
        // Calculate stats
        const ticketStats = response.data.tickets.reduce((acc, ticket) => {
          acc.total++;
          acc[ticket.status.toLowerCase().replace(' ', '')] = 
            (acc[ticket.status.toLowerCase().replace(' ', '')] || 0) + 1;
          return acc;
        }, { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
        
        setStats(ticketStats);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Manage your support tickets</p>
        </div>
        
        <Link
          to="/tickets/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Ticket className="h-8 w-8 text-gray-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="ml-4">
            <p className="text-sm font-medium text-blue-600">Open</p>
            <p className="text-2xl font-semibold text-blue-900">{stats.open}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="ml-4">
            <p className="text-sm font-medium text-yellow-600">In Progress</p>
            <p className="text-2xl font-semibold text-yellow-900">{stats.inProgress}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="ml-4">
            <p className="text-sm font-medium text-green-600">Resolved</p>
            <p className="text-2xl font-semibold text-green-900">{stats.resolved}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Closed</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.closed}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
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
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
          >
            <option value="lastActivityAt-desc">Latest Activity</option>
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="subject-asc">Subject A-Z</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white shadow-sm rounded-lg border">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status 
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first ticket.'
              }
            </p>
            {!filters.search && !filters.status && (
              <div className="mt-6">
                <Link
                  to="/tickets/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/tickets/${ticket._id}`}
                className="block hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <StatusBadge status={ticket.status} />
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
                            {ticket.category.name}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="mt-1 text-sm font-medium text-gray-900 truncate">
                        {ticket.subject}
                      </h3>
                      
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
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
                    
                    <div className="flex flex-col items-end space-y-1">
                      {ticket.assignedTo && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span>Assigned to {ticket.assignedTo.name}</span>
                        </div>
                      )}
                      
                      {ticket.votes && (
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-green-600">
                            ↑ {ticket.votes.upvotes?.length || 0}
                          </span>
                          <span className="text-red-600">
                            ↓ {ticket.votes.downvotes?.length || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;