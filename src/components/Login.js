import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authenticateStaff, saveCurrentUser, logStaffActivity } from '../data/staffUsers';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Authenticate staff
    const user = authenticateStaff(formData.username, formData.password);
    
    if (user) {
      // Save current user session
      saveCurrentUser(user);
      
      // Log login activity
      logStaffActivity('login', {
        username: user.username,
        role: user.role
      });
      
      onLogin(user);
      toast.success(`Welcome back, ${user.name}!`);
    } else {
      toast.error('Invalid username or password. Please check your credentials.');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Table Support</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          Management System
        </p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
