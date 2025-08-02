import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Ticket, 
  FolderOpen, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, enduser: 0, agent: 0, admin: 0 },
    tickets: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 },
    categories: { total: 0, active: 0 }
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data concurrently
      const [usersResponse, ticketsResponse, categoriesResponse] = await Promise.all([
        api.get('/users/stats'),
        api.get('/tickets?limit=10&sortBy=createdAt&sortOrder=desc'),
        api.get('/categories/stats')
      ]);

      if (usersResponse.data.success) {
        setStats(prev => ({ ...prev, users: usersResponse.data.stats }));
      }

      if (ticketsResponse.data.success) {
        setRecentTickets(ticketsResponse.data.tickets);
        
        // Calculate ticket stats
        const ticketStats = ticketsResponse.data.tickets.reduce((acc, ticket) => {
          acc.total++;
          acc[ticket.status.toLowerCase().replace(' ', '')] = 
            (acc[ticket.status.toLowerCase().replace(' ', '')] || 0) + 1;
          return acc;
        }, { total: 0, open: 0, inprogress: 0, resolved: 0, closed: 0 });
        
        setStats(prev => ({ ...prev, tickets: ticketStats }));
      }

      if (categoriesResponse.data.success) {
        setStats(prev => ({ ...prev, categories: categoriesResponse.data.stats }));
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.users.total}</p>
              <p className="text-xs text-gray-500">
                {stats.users.enduser} End Users, {stats.users.agent} Agents
              </p>
            </div>
          </div>
        </div>

        {/* Tickets Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Ticket className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.tickets.total}</p>
              <p className="text-xs text-gray-500">
                {stats.tickets.open} Open, {stats.tickets.inprogress} In Progress
              </p>
            </div>
          </div>
        </div>

        {/* Categories Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.categories.total}</p>
              <p className="text-xs text-gray-500">
                {stats.categories.active} Active
              </p>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.tickets.total > 0 
                  ? Math.round((stats.tickets.resolved / stats.tickets.total) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-gray-500">
                {stats.tickets.resolved} Resolved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Users className="h-10 w-10 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
              <p className="text-sm text-gray-600">Manage user roles and permissions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/categories"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <FolderOpen className="h-10 w-10 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Categories</h3>
              <p className="text-sm text-gray-600">Manage ticket categories</p>
            </div>
          </div>
        </Link>

        <Link
          to="/agent"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Ticket className="h-10 w-10 text-green-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Ticket Queue</h3>
              <p className="text-sm text-gray-600">View and manage all tickets</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No recent tickets</p>
            </div>
          ) : (
            recentTickets.slice(0, 5).map((ticket) => (
              <div key={ticket._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        ticket.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        #{ticket._id.slice(-6)}
                      </span>
                    </div>
                    
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600"
                    >
                      {ticket.subject}
                    </Link>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      By {ticket.createdBy.name} • {ticket.category?.name}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {ticket.assignedTo ? (
                      <span className="text-xs text-gray-500">
                        Assigned to {ticket.assignedTo.name}
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-600">Unassigned</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {recentTickets.length > 5 && (
          <div className="px-6 py-3 bg-gray-50 border-t">
            <Link
              to="/agent"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all tickets →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;