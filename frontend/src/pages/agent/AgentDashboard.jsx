import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    assigned: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned');

  useEffect(() => {
    fetchAgentData();
  }, [activeTab]);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      const params = activeTab === 'assigned' ? '?assigned=me' : '';
      const response = await api.get(`/tickets${params}`);
      
      if (response.data.success) {
        setTickets(response.data.tickets);
        calculateStats(response.data.tickets);
      }
    } catch (error) {
      console.error('Failed to fetch agent data:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketList) => {
    const newStats = ticketList.reduce((acc, ticket) => {
      acc.assigned++;
      if (ticket.status === 'Open') acc.open++;
      if (ticket.status === 'In Progress') acc.inProgress++;
      if (ticket.status === 'Resolved') acc.resolved++;
      return acc;
    }, { assigned: 0, open: 0, inProgress: 0, resolved: 0 });
    
    setStats(newStats);
  };

  const assignTicket = async (ticketId) => {
    try {
      const response = await api.put(`/tickets/${ticketId}`, {
        assignedTo: 'self'
      });
      
      if (response.data.success) {
        toast.success('Ticket assigned successfully');
        fetchAgentData();
      }
    } catch (error) {
      toast.error('Failed to assign ticket');
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
        <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="text-gray-600">Manage and respond to support tickets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.assigned}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assigned'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Tickets ({stats.assigned})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Tickets
            </button>
          </nav>
        </div>

        {/* Tickets List */}
        <div className="divide-y divide-gray-200">
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'assigned' 
                  ? 'No tickets are currently assigned to you.'
                  : 'No tickets are available.'
                }
              </p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <StatusBadge status={ticket.status} />
                      <span className="text-sm text-gray-500">
                        #{ticket._id.slice(-6)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Priority: {ticket.priority}
                      </span>
                    </div>
                    
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="text-lg font-medium text-gray-900 hover:text-primary-600"
                    >
                      {ticket.subject}
                    </Link>
                    
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                      <span>By {ticket.createdBy.name}</span>
                      <span>
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </span>
                      {ticket.comments.length > 0 && (
                        <span>{ticket.comments.length} comments</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!ticket.assignedTo && activeTab === 'all' && (
                      <button
                        onClick={() => assignTicket(ticket._id)}
                        className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100"
                      >
                        Assign to Me
                      </button>
                    )}
                    
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;