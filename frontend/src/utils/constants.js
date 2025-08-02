export const USER_ROLES = {
  END_USER: 'enduser',
  AGENT: 'agent',
  ADMIN: 'admin'
};

export const TICKET_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};

export const TICKET_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

export const PRIORITY_COLORS = {
  Low: 'text-green-600 bg-green-100',
  Medium: 'text-yellow-600 bg-yellow-100',
  High: 'text-orange-600 bg-orange-100',
  Critical: 'text-red-600 bg-red-100'
};

export const STATUS_COLORS = {
  Open: 'text-blue-600 bg-blue-100',
  'In Progress': 'text-yellow-600 bg-yellow-100',
  Resolved: 'text-green-600 bg-green-100',
  Closed: 'text-gray-600 bg-gray-100'
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  TICKETS: '/tickets',
  USERS: '/users',
  CATEGORIES: '/categories'
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip'
  ]
};

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TICKETS: '/tickets',
  CREATE_TICKET: '/tickets/new',
  AGENT_DASHBOARD: '/agent',
  ADMIN_DASHBOARD: '/admin',
  USER_MANAGEMENT: '/admin/users',
  CATEGORY_MANAGEMENT: '/admin/categories',
  PROFILE: '/profile'
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};