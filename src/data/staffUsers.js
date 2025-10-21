// Multi-Staff User Management System
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff'
};

export const STAFF_USERS = [
  {
    id: 1,
    username: 'anna',
    password: 'staff123',
    name: 'Anna Santos',
    role: USER_ROLES.STAFF,
    isActive: true,
    avatar: '👩‍💼'
  },
  {
    id: 2,
    username: 'jake',
    password: 'staff123',
    name: 'Jake Ramirez',
    role: USER_ROLES.STAFF,
    isActive: true,
    avatar: '👨‍💼'
  },
  {
    id: 3,
    username: 'kim',
    password: 'staff123',
    name: 'Kim Dela Cruz',
    role: USER_ROLES.STAFF,
    isActive: true,
    avatar: '👩‍💼'
  },
  {
    id: 4,
    username: 'admin',
    password: 'admin123',
    name: 'Manager',
    role: USER_ROLES.ADMIN,
    isActive: true,
    avatar: '👨‍💻'
  }
];

// Staff permissions
export const STAFF_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'view_dashboard',
    'add_orders',
    'edit_orders',
    'delete_orders',
    'mark_paid',
    'export_data',
    'view_analytics',
    'manage_users',
    'view_history',
    'backup_restore',
    'view_all_orders',
    'manage_staff'
  ],
  [USER_ROLES.STAFF]: [
    'view_dashboard',
    'add_orders',
    'edit_orders',
    'mark_paid',
    'view_history',
    'view_own_orders'
  ]
};

export const hasStaffPermission = (userRole, permission) => {
  return STAFF_PERMISSIONS[userRole]?.includes(permission) || false;
};

// Authentication functions
export const authenticateStaff = (username, password) => {
  const user = STAFF_USERS.find(
    u => u.username === username && u.password === password && u.isActive
  );
  
  if (user) {
    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};

export const getStaffById = (id) => {
  const user = STAFF_USERS.find(u => u.id === id);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const getStaffByName = (name) => {
  const user = STAFF_USERS.find(u => u.name === name);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

// Session management
export const saveCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify({
    ...user,
    loginTime: new Date().toISOString()
  }));
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const clearCurrentUser = () => {
  localStorage.removeItem('currentUser');
};

export const isUserLoggedIn = () => {
  return getCurrentUser() !== null;
};

// Staff activity tracking
export const logStaffActivity = (activity, details = {}) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const activityLog = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    staffId: currentUser.id,
    staffName: currentUser.name,
    activity,
    details
  };

  const existingLogs = JSON.parse(localStorage.getItem('staffActivityLogs') || '[]');
  existingLogs.push(activityLog);
  
  // Keep only last 1000 logs
  if (existingLogs.length > 1000) {
    existingLogs.splice(0, existingLogs.length - 1000);
  }
  
  localStorage.setItem('staffActivityLogs', JSON.stringify(existingLogs));
  return activityLog;
};

export const getStaffActivityLogs = (staffId = null) => {
  const logs = JSON.parse(localStorage.getItem('staffActivityLogs') || '[]');
  
  if (staffId) {
    return logs.filter(log => log.staffId === staffId);
  }
  
  return logs;
};
