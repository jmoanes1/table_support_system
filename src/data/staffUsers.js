// Multi-Staff User Management System
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff'
};

// Default staff users (can be overridden by localStorage)
const DEFAULT_STAFF_USERS = [
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

// Get staff users from localStorage or use default
export const getStaffUsers = () => {
  const storedUsers = localStorage.getItem('staffUsers');
  if (storedUsers) {
    try {
      return JSON.parse(storedUsers);
    } catch (e) {
      console.error('Error parsing staff users:', e);
      return DEFAULT_STAFF_USERS;
    }
  }
  // Initialize with default users
  saveStaffUsers(DEFAULT_STAFF_USERS);
  return DEFAULT_STAFF_USERS;
};

// Save staff users to localStorage
export const saveStaffUsers = (users) => {
  localStorage.setItem('staffUsers', JSON.stringify(users));
};

// Get current STAFF_USERS (for backward compatibility)
export const STAFF_USERS = getStaffUsers();

// Register a new staff member
export const registerStaff = (staffData) => {
  const users = getStaffUsers();
  
  // Check if username already exists
  if (users.some(u => u.username === staffData.username)) {
    return { success: false, error: 'Username already exists' };
  }
  
  // Generate new ID
  const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
  const newStaff = {
    id: maxId + 1,
    username: staffData.username,
    password: staffData.password,
    name: staffData.name,
    role: staffData.role || USER_ROLES.STAFF,
    isActive: true,
    avatar: staffData.avatar || '👤'
  };
  
  users.push(newStaff);
  saveStaffUsers(users);
  
  return { success: true, staff: newStaff };
};

// Update staff member
export const updateStaff = (staffId, updates) => {
  const users = getStaffUsers();
  const index = users.findIndex(u => u.id === staffId);
  
  if (index === -1) {
    return { success: false, error: 'Staff member not found' };
  }
  
  users[index] = { ...users[index], ...updates };
  saveStaffUsers(users);
  
  return { success: true, staff: users[index] };
};

// Delete staff member
export const deleteStaff = (staffId) => {
  const users = getStaffUsers();
  const filteredUsers = users.filter(u => u.id !== staffId);
  
  if (filteredUsers.length === users.length) {
    return { success: false, error: 'Staff member not found' };
  }
  
  saveStaffUsers(filteredUsers);
  return { success: true };
};

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
  const users = getStaffUsers();
  const user = users.find(
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
  const users = getStaffUsers();
  const user = users.find(u => u.id === id);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const getStaffByName = (name) => {
  const users = getStaffUsers();
  const user = users.find(u => u.name === name);
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
