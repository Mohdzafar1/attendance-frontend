// ============================================
// DATE AND TIME HELPERS WITH TIMEZONE SUPPORT
// ============================================

// Get user's local timezone
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Convert UTC to Local for display
export const utcToLocal = (utcDate) => {
  if (!utcDate) return null;
  const date = new Date(utcDate);
  if (isNaN(date.getTime())) return null;
  return date;
};

// Format Date (without time)
export const formatDate = (date, useUTC = false) => {
  if (!date) return '-';
  
  let d;
  if (useUTC && typeof date === 'string') {
    // If date is a string and we want UTC, treat it as UTC
    d = new Date(date + 'T00:00:00Z');
  } else {
    d = new Date(date);
  }
  
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: useUTC ? 'UTC' : getUserTimezone()
  });
};

// Format Time only
export const formatTime = (date, useUTC = false) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: useUTC ? 'UTC' : getUserTimezone()
  });
};

// Format DateTime (Date + Time)
export const formatDateTime = (date, useUTC = false) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  // For correction requests, always display in local time
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: getUserTimezone()
  });
};

// Format for API (send as UTC ISO string)
export const toUTCISO = (localDate) => {
  if (!localDate) return null;
  const date = new Date(localDate);
  return date.toISOString();
};

// Format for datetime-local input
export const toDateTimeLocal = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Parse datetime-local input to UTC for API
export const fromDateTimeLocalToUTC = (localDateTime) => {
  if (!localDateTime) return null;
  const date = new Date(localDateTime);
  return date.toISOString();
};

// Get current date in YYYY-MM-DD format
export const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get current time in HH:MM format
export const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Get current datetime in ISO format
export const getCurrentDateTime = () => {
  return new Date().toISOString();
};

// Display relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

// Status Helpers
export const getAttendanceStatus = (record) => {
  if (!record) return 'not_started';
  if (record.clock_in_time && !record.clock_out_time) return 'working';
  if (record.clock_out_time) return 'completed';
  return 'not_started';
};

export const getStatusColor = (status) => {
  const colors = {
    present: '#28a745',
    absent: '#dc3545',
    late: '#ffc107',
    half_day: '#fd7e14',
    holiday: '#17a2b8',
    pending: '#ffc107',
    approved: '#28a745',
    rejected: '#dc3545',
    working: '#28a745',
    completed: '#28a745',
    not_started: '#ffc107'
  };
  return colors[status] || '#6c757d';
};

export const getStatusBadgeClass = (status) => {
  const classes = {
    present: 'status-present',
    absent: 'status-absent',
    late: 'status-late',
    pending: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected'
  };
  return classes[status] || 'status-present';
};

// Duration Helpers
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = (end - start) / (1000 * 60 * 60);
  return Math.round(duration * 100) / 100;
};

export const formatDuration = (hours) => {
  if (!hours) return '0 hrs';
  const hrs = Math.floor(hours);
  const mins = Math.round((hours - hrs) * 60);
  if (hrs === 0) return `${mins} mins`;
  if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min${mins > 1 ? 's' : ''}`;
};

// Validation Helpers
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
};

// Formatting Helpers
export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Local Storage Helpers
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Table Pagination Helpers
export const paginate = (items, pageNumber, pageSize) => {
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return items.slice(startIndex, endIndex);
};

// Export to CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  // Download file
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${getCurrentDate()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Chart Data Helpers
export const prepareAttendanceChartData = (attendanceRecords) => {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }
  
  return last7Days.map(date => {
    const record = attendanceRecords.find(r => r.attendance_date === date);
    return {
      date: formatDate(date),
      present: record ? 1 : 0,
      hours: record?.total_hours || 0,
      status: record?.status || 'absent'
    };
  });
};

// Form Validation Helpers
export const validateClockIn = (location) => {
  const errors = {};
  if (!location || location.trim() === '') {
    errors.location = 'Location is required';
  }
  return errors;
};

export const validateCorrectionRequest = (data) => {
  const errors = {};
  if (!data.request_type) {
    errors.request_type = 'Request type is required';
  }
  if (!data.request_date) {
    errors.request_date = 'Request date is required';
  }
  if (!data.corrected_time) {
    errors.corrected_time = 'Corrected time is required';
  }
  if (!data.reason || data.reason.trim() === '') {
    errors.reason = 'Reason is required';
  }
  if (data.reason && data.reason.length < 10) {
    errors.reason = 'Reason must be at least 10 characters';
  }
  return errors;
};

// Notification Helpers
export const shouldNotifyClocking = (lastClockInTime) => {
  if (!lastClockInTime) return true;
  const lastClock = new Date(lastClockInTime);
  const now = new Date();
  const hoursDiff = (now - lastClock) / (1000 * 60 * 60);
  return hoursDiff >= 24;
};

// Role Helpers
export const getUserRoleLabel = (role) => {
  const roles = {
    admin: 'Administrator',
    hr: 'HR Manager',
    employee: 'Employee'
  };
  return roles[role] || role;
};

export const hasAccess = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

// Time Calculation Helpers
export const calculateWorkingHours = (clockIn, clockOut, breakMinutes = 60) => {
  if (!clockIn || !clockOut) return 0;
  const start = new Date(clockIn);
  const end = new Date(clockOut);
  const workingMs = end - start - (breakMinutes * 60 * 1000);
  const workingHours = workingMs / (1000 * 60 * 60);
  return Math.max(0, Math.round(workingHours * 100) / 100);
};

export const calculateOvertime = (clockOut, standardEndTime) => {
  if (!clockOut || !standardEndTime) return 0;
  const out = new Date(clockOut);
  const standardEnd = new Date();
  const [hours, minutes] = standardEndTime.split(':');
  standardEnd.setHours(parseInt(hours), parseInt(minutes), 0);
  
  if (out > standardEnd) {
    const overtimeMs = out - standardEnd;
    const overtimeHours = overtimeMs / (1000 * 60 * 60);
    return Math.round(overtimeHours * 100) / 100;
  }
  return 0;
};

// Color Helpers
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// URL Helpers
export const buildQueryParams = (params) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  return query.toString();
};

// Error Message Helpers
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Default export
const helpers = {
  formatDate,
  formatTime,
  formatDateTime,
  getCurrentDate,
  getCurrentTime,
  getCurrentDateTime,
  getUserTimezone,
  utcToLocal,
  toUTCISO,
  toDateTimeLocal,
  fromDateTimeLocalToUTC,
  getRelativeTime,
  getAttendanceStatus,
  getStatusColor,
  getStatusBadgeClass,
  calculateDuration,
  formatDuration,
  isValidEmail,
  isValidDate,
  isWeekend,
  isSameDay,
  capitalizeFirstLetter,
  truncateText,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  paginate,
  exportToCSV,
  prepareAttendanceChartData,
  validateClockIn,
  validateCorrectionRequest,
  shouldNotifyClocking,
  getUserRoleLabel,
  hasAccess,
  calculateWorkingHours,
  calculateOvertime,
  getRandomColor,
  buildQueryParams,
  getErrorMessage
};

export default helpers;