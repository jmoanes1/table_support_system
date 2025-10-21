// Activity Logging System
export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  ADD_ORDER: 'add_order',
  EDIT_ORDER: 'edit_order',
  DELETE_ORDER: 'delete_order',
  MARK_PAID: 'mark_paid',
  EXPORT_DATA: 'export_data',
  SESSION_TIMEOUT: 'session_timeout'
};

export const logActivity = (type, details = {}, userId = null) => {
  const activity = {
    id: Date.now() + Math.random(),
    type,
    timestamp: new Date().toISOString(),
    userId,
    details,
    ip: 'localhost' // In a real app, this would be the actual IP
  };

  // Get existing logs
  const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  
  // Add new log
  existingLogs.push(activity);
  
  // Keep only last 1000 logs to prevent storage bloat
  if (existingLogs.length > 1000) {
    existingLogs.splice(0, existingLogs.length - 1000);
  }
  
  // Save to localStorage
  localStorage.setItem('activityLogs', JSON.stringify(existingLogs));
  
  return activity;
};

export const getActivityLogs = (filter = {}) => {
  const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  
  if (filter.type) {
    return logs.filter(log => log.type === filter.type);
  }
  
  if (filter.userId) {
    return logs.filter(log => log.userId === filter.userId);
  }
  
  if (filter.dateRange) {
    const { start, end } = filter.dateRange;
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= new Date(start) && logDate <= new Date(end);
    });
  }
  
  return logs;
};

export const clearActivityLogs = () => {
  localStorage.removeItem('activityLogs');
};
