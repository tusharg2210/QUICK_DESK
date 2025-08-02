import { format, formatDistanceToNow, isValid } from 'date-fns';

export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  if (!date) return '';
  const dateObj = new Date(date);
  return isValid(dateObj) ? format(dateObj, formatString) : '';
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : '';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimetype) => {
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype.includes('pdf')) return '📄';
  if (mimetype.includes('word')) return '📝';
  if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
  if (mimetype.includes('zip')) return '🗜️';
  return '📎';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const generateTicketId = (id) => {
  return `#${id.slice(-6).toUpperCase()}`;
};

export const getPriorityColor = (priority) => {
  const colors = {
    Low: 'text-green-600 bg-green-100 border-green-200',
    Medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    High: 'text-orange-600 bg-orange-100 border-orange-200',
    Critical: 'text-red-600 bg-red-100 border-red-200'
  };
  return colors[priority] || 'text-gray-600 bg-gray-100 border-gray-200';
};

export const getStatusColor = (status) => {
  const colors = {
    'Open': 'text-blue-600 bg-blue-100 border-blue-200',
    'In Progress': 'text-yellow-600 bg-yellow-100 border-yellow-200',
    'Resolved': 'text-green-600 bg-green-100 border-green-200',
    'Closed': 'text-gray-600 bg-gray-100 border-gray-200'
  };
  return colors[status] || 'text-gray-600 bg-gray-100 border-gray-200';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return 'An unexpected error occurred';
  }
};

export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};