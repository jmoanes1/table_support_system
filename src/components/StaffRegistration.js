import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { registerStaff, USER_ROLES } from '../data/staffUsers';

const StaffRegistration = ({ onBack, onRegistrationComplete }) => {
  const [registrationData, setRegistrationData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: USER_ROLES.STAFF,
    avatar: '👤'
  });
  const [registrationErrors, setRegistrationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (registrationErrors[name]) {
      setRegistrationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateRegistration = () => {
    const errors = {};

    if (!registrationData.username.trim()) {
      errors.username = 'Username is required';
    } else if (registrationData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(registrationData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!registrationData.password) {
      errors.password = 'Password is required';
    } else if (registrationData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (registrationData.password !== registrationData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!registrationData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (registrationData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    setRegistrationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (!validateRegistration()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = registerStaff({
      username: registrationData.username,
      password: registrationData.password,
      name: registrationData.name,
      role: registrationData.role,
      avatar: registrationData.avatar
    });

    if (result.success) {
      toast.success(`Staff member "${registrationData.name}" registered successfully!`);
      // Reset registration form
      setRegistrationData({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: USER_ROLES.STAFF,
        avatar: '👤'
      });
      setRegistrationErrors({});
      
      // Navigate back to login after a short delay
      setTimeout(() => {
        if (onRegistrationComplete) {
          onRegistrationComplete();
        } else if (onBack) {
          onBack();
        }
      }, 1500);
    } else {
      toast.error(result.error || 'Failed to register staff member');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Staff Registration</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          Register a new staff member
        </p>
        
        <form onSubmit={handleRegistration} className="login-form">
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            borderRadius: '10px',
            border: '2px solid rgba(102, 126, 234, 0.3)'
          }}>
            <h3 style={{ 
              margin: '0 0 10px 0',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '1.25rem',
              fontWeight: '700'
            }}>
              👤 New Staff Account
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Fill in the details to create a new staff account
            </p>
          </div>

          <div className={`form-group ${registrationErrors.name ? 'has-error' : ''}`}>
            <label htmlFor="reg-name">Full Name *</label>
            <input
              type="text"
              id="reg-name"
              name="name"
              value={registrationData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              disabled={isLoading}
            />
            {registrationErrors.name && (
              <>
                <span className="error">{registrationErrors.name}</span>
                <span className="error-icon">⚠️</span>
              </>
            )}
          </div>

          <div className={`form-group ${registrationErrors.username ? 'has-error' : ''}`}>
            <label htmlFor="reg-username">Username *</label>
            <input
              type="text"
              id="reg-username"
              name="username"
              value={registrationData.username}
              onChange={handleChange}
              placeholder="Enter username (min 3 characters)"
              required
              disabled={isLoading}
            />
            {registrationErrors.username && (
              <>
                <span className="error">{registrationErrors.username}</span>
                <span className="error-icon">⚠️</span>
              </>
            )}
          </div>

          <div className={`form-group ${registrationErrors.password ? 'has-error' : ''}`}>
            <label htmlFor="reg-password">Password *</label>
            <input
              type="password"
              id="reg-password"
              name="password"
              value={registrationData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              required
              disabled={isLoading}
            />
            {registrationErrors.password && (
              <>
                <span className="error">{registrationErrors.password}</span>
                <span className="error-icon">⚠️</span>
              </>
            )}
          </div>

          <div className={`form-group ${registrationErrors.confirmPassword ? 'has-error' : ''}`}>
            <label htmlFor="reg-confirm-password">Confirm Password *</label>
            <input
              type="password"
              id="reg-confirm-password"
              name="confirmPassword"
              value={registrationData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              disabled={isLoading}
            />
            {registrationErrors.confirmPassword && (
              <>
                <span className="error">{registrationErrors.confirmPassword}</span>
                <span className="error-icon">⚠️</span>
              </>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-role">Role</label>
            <select
              id="reg-role"
              name="role"
              value={registrationData.role}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value={USER_ROLES.STAFF}>Staff</option>
              <option value={USER_ROLES.ADMIN}>Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reg-avatar">Avatar</label>
            <select
              id="reg-avatar"
              name="avatar"
              value={registrationData.avatar}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="👤">👤 Default</option>
              <option value="👨‍💼">👨‍💼 Male Staff</option>
              <option value="👩‍💼">👩‍💼 Female Staff</option>
              <option value="👨‍💻">👨‍💻 Admin</option>
              <option value="👩‍💻">👩‍💻 Admin (F)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onBack}
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              Back to Login
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              {isLoading ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                  Registering...
                </>
              ) : (
                'Register Staff'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffRegistration;

