import React, { useState, useEffect } from 'react';
import { getAllMenuItems } from '../data/beerMenu';

const CustomerOrdering = ({ tableNumber, onClose }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderStatus, setOrderStatus] = useState('browsing'); // browsing, ordering, submitted, tracking
  const [orderId, setOrderId] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    const items = getAllMenuItems();
    setMenuItems(items);
    loadOrderHistory();
    
    // Check for existing order for this table
    checkExistingOrder();
  }, [tableNumber]);

  const loadOrderHistory = () => {
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const tableOrders = orders.filter(order => order.tableNumber === tableNumber);
    setOrderHistory(tableOrders);
  };

  const checkExistingOrder = () => {
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const activeOrder = orders.find(order => 
      order.tableNumber === tableNumber && 
      ['pending', 'preparing', 'ready'].includes(order.status)
    );
    
    if (activeOrder) {
      setCurrentOrder(activeOrder);
      setOrderId(activeOrder.id);
      setOrderStatus('tracking');
    }
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const submitOrder = () => {
    const order = {
      id: Date.now(),
      tableNumber,
      items: cart,
      total: getTotalPrice(),
      status: 'pending',
      timestamp: new Date().toISOString(),
      customerName: `Table ${tableNumber} Customer`,
      estimatedTime: new Date(Date.now() + 20 * 60000).toISOString() // 20 minutes from now
    };

    // Store order in localStorage
    const existingOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const updatedOrders = [...existingOrders, order];
    localStorage.setItem('customerOrders', JSON.stringify(updatedOrders));

    // Also store in the main orders system
    const mainOrders = JSON.parse(localStorage.getItem('qrOrders') || '[]');
    mainOrders.push(order);
    localStorage.setItem('qrOrders', JSON.stringify(mainOrders));

    setOrderId(order.id);
    setCurrentOrder(order);
    setOrderStatus('tracking');
    setCart([]);
    loadOrderHistory();
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
      case 'preparing': return 'Preparing Your Order';
      case 'ready': return 'Ready for Pickup';
      case 'served': return 'Order Completed';
      case 'cancelled': return 'Order Cancelled';
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

  // Auto-refresh order status every 5 seconds
  useEffect(() => {
    if (orderStatus === 'tracking' && currentOrder) {
      const interval = setInterval(() => {
        const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
        const updatedOrder = orders.find(order => order.id === currentOrder.id);
        if (updatedOrder) {
          setCurrentOrder(updatedOrder);
          if (updatedOrder.status === 'served') {
            setOrderStatus('completed');
          }
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [orderStatus, currentOrder]);

  if (orderStatus === 'tracking' && currentOrder) {
    return (
      <div className="customer-ordering-container">
        <div className="customer-header">
          <h2>🍽️ Table {tableNumber} - Order Tracking</h2>
          <button onClick={onClose} className="btn btn-secondary">✕</button>
        </div>
        
        <div className="order-tracking">
          <div className="order-status-card">
            <div className="status-icon" style={{ color: getStatusColor(currentOrder.status) }}>
              {getStatusIcon(currentOrder.status)}
            </div>
            <h3 style={{ color: getStatusColor(currentOrder.status) }}>
              {getStatusText(currentOrder.status)}
            </h3>
            <p className="order-id">Order #{currentOrder.id}</p>
            <p className="order-time">
              Placed at {formatTime(currentOrder.timestamp)} • {getOrderAge(currentOrder.timestamp)}
            </p>
          </div>

          <div className="order-details">
            <h4>Your Order:</h4>
            <div className="order-items">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span className="item-quantity">{item.quantity}x</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">₱{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="order-total">
              <strong>Total: ₱{currentOrder.total.toLocaleString()}</strong>
            </div>
          </div>

          <div className="tracking-actions">
            <button 
              onClick={() => setOrderStatus('browsing')} 
              className="btn btn-primary"
            >
              Place Another Order
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderStatus === 'completed') {
    return (
      <div className="customer-ordering-container">
        <div className="customer-header">
          <h2>🍽️ Table {tableNumber} - Order Complete</h2>
          <button onClick={onClose} className="btn btn-secondary">✕</button>
        </div>
        
        <div className="order-complete">
          <div className="success-icon">✅</div>
          <h3>Order Completed!</h3>
          <p>Thank you for your order. We hope you enjoyed your meal!</p>
          <div className="order-summary">
            <p><strong>Order #{currentOrder?.id}</strong></p>
            <p><strong>Total: ₱{currentOrder?.total.toLocaleString()}</strong></p>
          </div>
          <div className="complete-actions">
            <button 
              onClick={() => {
                setOrderStatus('browsing');
                setCurrentOrder(null);
                setOrderId(null);
              }} 
              className="btn btn-primary"
            >
              Place New Order
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-ordering-container">
      <div className="customer-header">
        <h2>🍽️ Table {tableNumber} - Digital Menu</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowCart(!showCart)} 
            className="btn btn-primary cart-btn"
          >
            🛒 Cart ({cart.length})
          </button>
          <button onClick={onClose} className="btn btn-secondary">✕</button>
        </div>
      </div>

      <div className="customer-content">
        {!showCart ? (
          <div className="menu-section">
            <h3>🍺 Beer Menu</h3>
            <div className="menu-grid">
              {menuItems.map(item => (
                <div key={item.id} className="menu-item">
                  <div className="item-image">
                    <div className="placeholder-image">🍺</div>
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p className="item-description">{item.description}</p>
                    <div className="item-price">₱{item.price.toLocaleString()}</div>
                    <button 
                      onClick={() => addToCart(item)}
                      className="btn btn-primary add-to-cart"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cart-section">
            <h3>🛒 Your Order</h3>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <button 
                  onClick={() => setShowCart(false)} 
                  className="btn btn-primary"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p>₱{item.price.toLocaleString()} each</p>
                      </div>
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="btn btn-sm btn-secondary"
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="btn btn-sm btn-secondary"
                        >
                          +
                        </button>
                      </div>
                      <div className="item-total">
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <div className="total-line">
                    <span>Total:</span>
                    <span className="total-amount">₱{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="cart-actions">
                    <button 
                      onClick={() => setShowCart(false)} 
                      className="btn btn-secondary"
                    >
                      Back to Menu
                    </button>
                    <button 
                      onClick={submitOrder}
                      className="btn btn-success"
                    >
                      Submit Order
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .customer-ordering-container {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 20px;
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 80vh;
        }

        .customer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .customer-header h2 {
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

        .cart-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cart-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .menu-item {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .menu-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .item-image {
          text-align: center;
          margin-bottom: 16px;
        }

        .placeholder-image {
          font-size: 48px;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .item-details h4 {
          color: #1f2937;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .item-description {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .item-price {
          color: #059669;
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .add-to-cart {
          width: 100%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-to-cart:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .cart-section {
          max-height: 500px;
          overflow-y: auto;
        }

        .cart-items {
          margin-bottom: 20px;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .item-info {
          flex: 1;
        }

        .item-info h4 {
          margin: 0 0 4px 0;
          color: #1f2937;
          font-size: 1rem;
        }

        .item-info p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quantity {
          font-weight: 600;
          color: #1f2937;
          min-width: 20px;
          text-align: center;
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 0.8rem;
          border-radius: 4px;
        }

        .item-total {
          font-weight: 700;
          color: #059669;
          min-width: 80px;
          text-align: right;
        }

        .cart-summary {
          border-top: 2px solid #e5e7eb;
          padding-top: 20px;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 20px;
        }

        .total-amount {
          color: #059669;
        }

        .cart-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .order-tracking {
          text-align: center;
          padding: 40px 20px;
        }

        .order-status-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .status-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .order-status-card h3 {
          font-size: 1.5rem;
          margin: 0 0 8px 0;
        }

        .order-id {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0 0 4px 0;
        }

        .order-time {
          color: #9ca3af;
          font-size: 0.8rem;
          margin: 0;
        }

        .order-details {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          text-align: left;
        }

        .order-details h4 {
          margin: 0 0 16px 0;
          color: #374151;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .order-item:last-child {
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
          padding-top: 12px;
          border-top: 2px solid #e5e7eb;
          margin-top: 12px;
        }

        .tracking-actions, .complete-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .order-complete {
          text-align: center;
          padding: 40px 20px;
        }

        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .order-complete h3 {
          color: #059669;
          font-size: 1.5rem;
          margin-bottom: 12px;
        }

        .order-summary {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          text-align: left;
        }

        .order-summary p {
          margin: 8px 0;
          color: #374151;
        }

        .empty-cart {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
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

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .customer-ordering-container {
            margin: 10px;
            padding: 16px;
          }
          
          .menu-grid {
            grid-template-columns: 1fr;
          }
          
          .cart-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .quantity-controls {
            align-self: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerOrdering;
