// User Roles and Permissions System
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff'
};

export const PERMISSIONS = {
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
    'backup_restore'
  ],
  [USER_ROLES.STAFF]: [
    'view_dashboard',
    'add_orders',
    'mark_paid',
    'view_history'
  ]
};

export const hasPermission = (userRole, permission) => {
  return PERMISSIONS[userRole]?.includes(permission) || false;
};

// Default users (in a real app, this would be in a database)
export const defaultUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: USER_ROLES.ADMIN,
    isActive: true
  },
  {
    id: 2,
    email: 'staff@example.com',
    password: 'staff123',
    name: 'Staff Member',
    role: USER_ROLES.STAFF,
    isActive: true
  }
];

// Session timeout settings (in minutes)
export const SESSION_TIMEOUT = 15;
export const INACTIVITY_WARNING = 5; // Warning 5 minutes before timeout
