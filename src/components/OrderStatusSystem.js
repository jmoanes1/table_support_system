import React, { useState, useEffect } from 'react';

const OrderStatusSystem = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    loadOrders();
    // Set up real-time updates (in real app, this would be WebSocket or polling)
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    // Load orders from localStorage (in real app, this would be from server)
    const qrOrders = JSON.parse(localStorage.getItem('qrOrders') || '[]');
    const tableOrders = JSON.parse(localStorage.getItem('tableOrders') || '[]');
    const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const allOrders = [...qrOrders, ...tableOrders, ...customerOrders];
    setOrders(allOrders);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    );
    
    // Update localStorage (in real app, send to server)
    const qrOrders = updatedOrders.filter(order => order.tableNumber && !order.customerName?.includes('Customer'));
    const tableOrders = updatedOrders.filter(order => !order.tableNumber);
    const customerOrders = updatedOrders.filter(order => order.tableNumber && order.customerName?.includes('Customer'));
    
    localStorage.setItem('qrOrders', JSON.stringify(qrOrders));
    localStorage.setItem('tableOrders', JSON.stringify(tableOrders));
    localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
    
    setOrders(updatedOrders);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'preparing': return '#3b82f6';
      case 'ready': return '#10b981';
      case 'served': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Order Received';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready to Serve';
      case 'served': return 'Served';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🔔';
      case 'served': return '✅';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'served';
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderAge = (timestamp) => {
    const now = new Date();
    const orderTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m ago`;
  };

  return (
    <div className="order-status-container">
      <div className="order-status-header">
        <h2>📋 Order Status System</h2>
        <div className="header-actions">
          <button onClick={loadOrders} className="btn btn-secondary">
            🔄 Refresh
          </button>
          <button onClick={onClose} className="btn btn-secondary">✕</button>
        </div>
      </div>

      <div className="order-status-content">
        {/* Status Filter */}
        <div className="status-filter">
          <label>Filter by Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-control"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending ({orders.filter(o => o.status === 'pending').length})</option>
            <option value="preparing">Preparing ({orders.filter(o => o.status === 'preparing').length})</option>
            <option value="ready">Ready ({orders.filter(o => o.status === 'ready').length})</option>
            <option value="served">Served ({orders.filter(o => o.status === 'served').length})</option>
            <option value="cancelled">Cancelled ({orders.filter(o => o.status === 'cancelled').length})</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📭</div>
              <h3>No Orders Found</h3>
              <p>No orders match the current filter.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-source">
                      {order.tableNumber ? `Table ${order.tableNumber}` : 'Kitchen Order'}
                    </p>
                    <p className="order-time">
                      {formatTime(order.timestamp)} • {getOrderAge(order.timestamp)}
                    </p>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)} {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-items">
                    <h4>Items ({order.items?.length || 0}):</h4>
                    <div className="items-list">
                      {order.items?.map((item, index) => (
                        <div key={index} className="item-row">
                          <span className="item-quantity">{item.quantity}x</span>
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">₱{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      )) || <p>No items available</p>}
                    </div>
                  </div>
                  
                  <div className="order-total">
                    <strong>Total: ₱{order.total?.toLocaleString() || '0'}</strong>
                  </div>
                </div>

                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="btn btn-primary"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="btn btn-success"
                    >
                      Mark as Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'served')}
                      className="btn btn-secondary"
                    >
                      Mark as Served
                    </button>
                  )}
                  {order.status !== 'served' && order.status !== 'cancelled' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="btn btn-danger"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                    className="btn btn-outline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details #{selectedOrder.id}</h3>
              <button 
                onClick={() => setShowOrderDetails(false)} 
                className="btn btn-secondary"
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="detail-section">
                <h4>Order Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span>Order ID:</span>
                    <span>#{selectedOrder.id}</span>
                  </div>
                  <div className="detail-item">
                    <span>Table:</span>
                    <span>{selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : 'Kitchen'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Status:</span>
                    <span 
                      className="status-text"
                      style={{ color: getStatusColor(selectedOrder.status) }}
                    >
                      {getStatusIcon(selectedOrder.status)} {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>Ordered At:</span>
                    <span>{new Date(selectedOrder.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span>Customer:</span>
                    <span>{selectedOrder.customerName || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Order Items</h4>
                <div className="items-detail-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="item-detail-row">
                      <div className="item-info">
                        <span className="item-quantity">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                      </div>
                      <div className="item-pricing">
                        <span className="item-unit-price">₱{item.price.toLocaleString()} each</span>
                        <span className="item-total-price">₱{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  )) || <p>No items available</p>}
                </div>
                <div className="order-total-detail">
                  <strong>Total: ₱{selectedOrder.total?.toLocaleString() || '0'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .order-status-container {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 20px;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .order-status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .order-status-header h2 {
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .status-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .status-filter label {
          font-weight: 600;
          color: #374151;
        }

        .form-control {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          font-size: 14px;
        }

        .orders-list {
          display: grid;
          gap: 16px;
        }

        .order-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .order-info h3 {
          color: #1f2937;
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .order-source {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0 0 4px 0;
        }

        .order-time {
          color: #9ca3af;
          font-size: 0.8rem;
          margin: 0;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .order-details {
          margin-bottom: 16px;
        }

        .order-items h4 {
          color: #374151;
          font-size: 1rem;
          margin: 0 0 8px 0;
        }

        .items-list {
          margin-bottom: 12px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .item-quantity {
          font-weight: 600;
          color: #6b7280;
          min-width: 30px;
        }

        .item-name {
          flex: 1;
          margin: 0 12px;
          color: #374151;
        }

        .item-price {
          font-weight: 600;
          color: #059669;
        }

        .order-total {
          text-align: right;
          font-size: 1.1rem;
          color: #1f2937;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
        }

        .order-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-outline {
          background: transparent;
          color: #3b82f6;
          border: 1px solid #3b82f6;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .no-orders {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .no-orders-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .no-orders h3 {
          margin: 0 0 8px 0;
          color: #374151;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .order-details-modal {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .modal-content {
          padding: 20px;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section h4 {
          color: #374151;
          font-size: 1.1rem;
          margin: 0 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-grid {
          display: grid;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .detail-item span:first-child {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-item span:last-child {
          color: #1f2937;
          font-weight: 600;
        }

        .status-text {
          font-weight: 600;
        }

        .items-detail-list {
          margin-bottom: 16px;
        }

        .item-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .item-detail-row:last-child {
          border-bottom: none;
        }

        .item-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .item-pricing {
          text-align: right;
        }

        .item-unit-price {
          display: block;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .item-total-price {
          display: block;
          color: #059669;
          font-weight: 600;
        }

        .order-total-detail {
          text-align: right;
          font-size: 1.2rem;
          color: #1f2937;
          padding-top: 12px;
          border-top: 2px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .order-status-container {
            margin: 10px;
            padding: 16px;
          }
          
          .order-header {
            flex-direction: column;
            gap: 12px;
          }
          
          .order-actions {
            justify-content: center;
          }
          
          .detail-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderStatusSystem;
