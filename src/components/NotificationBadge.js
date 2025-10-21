import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const NotificationBadge = ({ unpaidCustomers = [] }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when there are no unpaid customers
  useEffect(() => {
    if (unpaidCustomers.length === 0) {
      setIsDropdownOpen(false);
    }
  }, [unpaidCustomers.length]);

  const handleBellClick = () => {
    if (unpaidCustomers.length > 0) {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right
        });
      }
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const unpaidCount = unpaidCustomers.length;

  return (
    <div 
      className="notification-badge-container" 
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
            zIndex: 99999
      }}
    >
      {/* Bell Icon with Badge */}
      <button
        ref={buttonRef}
        onClick={handleBellClick}
        className="notification-bell"
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          transition: 'background-color 0.2s ease',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '36px',
          minHeight: '36px'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        🔔
        {/* Red Badge */}
        {unpaidCount > 0 && (
          <span
            className="notification-badge"
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: '#ff4444',
              color: 'white',
              borderRadius: '50%',
              minWidth: '18px',
              height: '18px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              animation: 'pulse 2s infinite'
            }}
          >
            {unpaidCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu - Portal */}
      {isDropdownOpen && unpaidCount > 0 && createPortal(
        <div
          ref={dropdownRef}
          className="notification-dropdown"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e0e0e0',
            minWidth: '200px',
            maxWidth: '300px',
            width: 'max-content',
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Dropdown Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px 8px 0 0'
            }}
          >
            <h4 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
              Unpaid Customers ({unpaidCount})
            </h4>
          </div>

          {/* Customer List */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {unpaidCustomers.map((customer, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 16px',
                  borderBottom: index < unpaidCustomers.length - 1 ? '1px solid #f0f0f0' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '16px' }}>🧍</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                    {customer.name}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    {customer.table}
                    {customer.totalOwed && customer.totalOwed > 0 && (
                      <span style={{ color: '#e74c3c', fontWeight: '600', marginLeft: '8px' }}>
                        — ₱{customer.totalOwed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dropdown Footer */}
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '0 0 8px 8px',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '12px', color: '#666' }}>
              Click outside to close
            </span>
          </div>
        </div>,
        document.body
      )}

      {/* CSS Animations and Responsive Styles */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        /* Ensure dropdown appears above all other elements */
        .notification-badge-container {
          z-index: 99999 !important;
          position: relative !important;
        }
        
        .notification-dropdown {
          z-index: 99999 !important;
          position: fixed !important;
          isolation: isolate !important;
        }

        /* Force the dropdown to appear above everything */
        .notification-dropdown * {
          z-index: 99999 !important;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .notification-dropdown {
            right: -10px !important;
            left: auto !important;
            min-width: 180px !important;
            max-width: 250px !important;
          }
        }

        @media (max-width: 480px) {
          .notification-dropdown {
            right: -20px !important;
            min-width: 160px !important;
            max-width: 200px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationBadge;
