import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Plus, 
  Ticket, 
  Users, 
  Settings, 
  BarChart3,
  Folder,
  Menu,
  X,
  User,
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      roles: ['enduser', 'agent', 'admin'] 
    },
    { 
      name: 'Create Ticket', 
      href: '/tickets/new', 
      icon: Plus, 
      roles: ['enduser', 'agent', 'admin'] 
    },
    { 
      name: 'Agent Dashboard', 
      href: '/agent', 
      icon: Ticket, 
      roles: ['agent', 'admin'] 
    },
    { 
      name: 'Admin Dashboard', 
      href: '/admin', 
      icon: BarChart3, 
      roles: ['admin'] 
    },
    { 
      name: 'User Management', 
      href: '/admin/users', 
      icon: Users, 
      roles: ['admin'] 
    },
    { 
      name: 'Categories', 
      href: '/admin/categories', 
      icon: Folder, 
      roles: ['admin'] 
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User, 
      roles: ['enduser', 'agent', 'admin'] 
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 py-4">
        <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">QD</span>
        </div>
        <span className="ml-2 text-lg font-semibold text-gray-900">QuickDesk</span>
      </div>
      
      {/* Navigation */}
      <div className="mt-5 flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-1">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-5 w-5"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Info */}
      <div className="flex-shrink-0 px-2 py-2">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center">
            <img
              className="h-8 w-8 rounded-full"
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
              alt={user?.name}
            />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <div className="flex items-center">
                <Shield className="h-3 w-3 text-gray-400 mr-1" />
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 bg-white shadow-md"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;