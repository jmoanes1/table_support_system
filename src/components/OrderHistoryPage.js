import React, { useState, useEffect } from 'react';

const OrderHistoryPage = ({ onClose, inline = false }) => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrderHistory();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orderHistory, selectedFilter, searchTerm]);

  const loadOrderHistory = () => {
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    setOrderHistory(history);
  };

  const filterOrders = () => {
    let filtered = [...orderHistory];

    // Filter by date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.timestamp);
          return orderDate >= today;
        });
        break;
      case 'week':
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.timestamp);
          return orderDate >= weekStart;
        });
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.timestamp);
          return orderDate >= monthStart;
        });
        break;
      default:
        // Show all
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.beerOrdered?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tableNumber?.toString().includes(searchTerm)
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredOrders(filtered);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#27ae60';
      case 'unpaid': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all order history? This action cannot be undone.')) {
      localStorage.removeItem('orderHistory');
      setOrderHistory([]);
      setFilteredOrders([]);
    }
  };

  const content = (
    <div className="history-page-content">
          {/* Filters */}
          <div className="history-filters">
            <div className="filter-group">
              <label>Time Period:</label>
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="form-control"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer, beer, or table..."
                className="form-control"
              />
            </div>

            <button onClick={clearHistory} className="btn btn-danger">
              🗑️ Clear History
            </button>
          </div>

          {/* Order History Table */}
          <div className="order-history-table-container">
            {filteredOrders.length > 0 ? (
              <table className="order-history-table">
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>Customer</th>
                    <th>Order</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Status</th>
                    <th>Handled By</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={order.id || index}>
                      <td className="table-number">#{order.tableNumber}</td>
                      <td className="customer-name">{order.customerName || 'N/A'}</td>
                      <td className="order-details">
                        {order.beerOrdered || 'N/A'}
                        {order.quantity > 1 && (
                          <span className="quantity-badge">x{order.quantity}</span>
                        )}
                        {order.customOrder && (
                          <div className="custom-order">{order.customOrder}</div>
                        )}
                      </td>
                      <td className="time-in">{formatTime(order.timeIn)}</td>
                      <td className="time-out">{formatTime(order.timeOut)}</td>
                      <td className="status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.paymentStatus) }}
                        >
                          {order.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="handled-by">
                        <span className="staff-name">
                          {order.handledByName || 'N/A'}
                        </span>
                      </td>
                      <td className="total-cost">₱{order.totalCost?.toLocaleString() || '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-orders">
                <p>No orders found for the selected criteria.</p>
                {selectedFilter !== 'all' && (
                  <button 
                    onClick={() => setSelectedFilter('all')} 
                    className="btn btn-primary"
                  >
                    Show All Orders
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          {filteredOrders.length > 0 && (
            <div className="history-summary">
              <h3>📊 Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Total Orders:</span>
                  <strong>{filteredOrders.length}</strong>
                </div>
                <div className="summary-item">
                  <span>Total Revenue:</span>
                  <strong>₱{filteredOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0).toLocaleString()}</strong>
                </div>
                <div className="summary-item">
                  <span>Paid Orders:</span>
                  <strong>{filteredOrders.filter(order => order.paymentStatus === 'paid').length}</strong>
                </div>
                <div className="summary-item">
                  <span>Unpaid Orders:</span>
                  <strong>{filteredOrders.filter(order => order.paymentStatus === 'unpaid').length}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal order-history-page" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Order History</h2>
          <button onClick={onClose} className="btn btn-secondary">✕</button>
        </div>
        {content}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
