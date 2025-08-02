import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/enduser/Dashboard';
import CreateTicket from './pages/enduser/CreateTicket';
import TicketDetail from './pages/enduser/TicketDetail';
import Profile from './pages/enduser/Profile';
import AgentDashboard from './pages/agent/AgentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* End User Routes */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tickets/new" element={<CreateTicket />} />
              <Route path="tickets/:id" element={<TicketDetail />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Agent Routes */}
              <Route path="agent" element={
                <ProtectedRoute allowedRoles={['agent', 'admin']}>
                  <AgentDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="admin/categories" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CategoryManagement />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;