import React, { useState, useEffect } from 'react';
import CustomerOrdering from './CustomerOrdering';

const CustomerRoute = () => {
  const [tableNumber, setTableNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get table number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get('table');
    
    if (table) {
      setTableNumber(parseInt(table));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="customer-loading">
        <div className="loading-spinner"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  if (!tableNumber) {
    return (
      <div className="customer-error">
        <div className="error-icon">❌</div>
        <h2>Invalid Table Access</h2>
        <p>Please scan a valid QR code to access the menu.</p>
        <div className="error-instructions">
          <h3>How to access the menu:</h3>
          <ol>
            <li>Look for the QR code on your table</li>
            <li>Open your phone's camera</li>
            <li>Point it at the QR code</li>
            <li>Tap the notification to open the menu</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-route-container">
      <CustomerOrdering 
        tableNumber={tableNumber} 
        onClose={() => {
          // In a real app, this might redirect to a thank you page
          window.close();
        }} 
      />
      
      <style jsx>{`
        .customer-route-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .customer-loading {
          text-align: center;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .customer-error {
          text-align: center;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 500px;
          margin: 0 auto;
        }

        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .customer-error h2 {
          font-size: 2rem;
          margin: 0 0 16px 0;
        }

        .customer-error p {
          font-size: 1.1rem;
          margin: 0 0 32px 0;
          opacity: 0.9;
        }

        .error-instructions {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
          text-align: left;
        }

        .error-instructions h3 {
          margin: 0 0 16px 0;
          font-size: 1.2rem;
        }

        .error-instructions ol {
          margin: 0;
          padding-left: 20px;
        }

        .error-instructions li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default CustomerRoute;
