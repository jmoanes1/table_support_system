import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomerRoute from './components/CustomerRoute';
import StaffRegistration from './components/StaffRegistration';
import { getCurrentUser, clearCurrentUser, logStaffActivity } from './data/staffUsers';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCustomerRoute, setIsCustomerRoute] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    // Check if this is a customer route
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get('table');
    
    if (table) {
      setIsCustomerRoute(true);
      return;
    }

    // Check if registration route is requested (/admin)
    if (window.location.pathname === '/admin') {
      setShowRegistration(true);
      return;
    }

    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
    }
  }, []);

  // Listen for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === '/admin') {
        setShowRegistration(true);
      } else {
        setShowRegistration(false);
      }
    };

    // Listen to popstate for browser back/forward
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    // Log logout activity
    if (currentUser) {
      logStaffActivity('logout', {
        username: currentUser.username,
        role: currentUser.role
      });
    }
    
    setIsAuthenticated(false);
    setCurrentUser(null);
    clearCurrentUser();
    toast.info('Logged out successfully');
  };

  const handleBackToLogin = () => {
    setShowRegistration(false);
    // Navigate back to root/login
    window.history.pushState({}, '', '/');
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    // Navigate back to root/login after successful registration
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {isCustomerRoute ? (
        <CustomerRoute />
      ) : showRegistration ? (
        <StaffRegistration 
          onBack={handleBackToLogin}
          onRegistrationComplete={handleRegistrationComplete}
        />
      ) : !isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard currentUser={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
