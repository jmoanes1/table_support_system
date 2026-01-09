import React, { useState, useEffect } from 'react';
import { getAllMenuItems, getPriceByName, calculateTotalCost } from '../data/beerMenu';

const TableModal = ({ table, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    beerOrdered: '',
    paymentStatus: 'unpaid',
    isOccupied: false,
    quantity: 1,
    price: 0,
    totalCost: 0,
    customOrder: '',
    timeIn: null,
    timeOut: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (table) {
      setFormData({
        customerName: table.customerName || '',
        beerOrdered: table.beerOrdered || '',
        paymentStatus: table.paymentStatus || 'unpaid',
        isOccupied: table.isOccupied || false,
        quantity: table.quantity || 1,
        price: table.price || 0,
        totalCost: table.totalCost || 0,
        customOrder: table.customOrder || '',
        timeIn: table.timeIn || null,
        timeOut: table.timeOut || null
      });
    }
  }, [table]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };
      
      // Auto-calculate price and total when beer or quantity changes
      if (name === 'beerOrdered' || name === 'quantity') {
        const price = getPriceByName(updated.beerOrdered);
        const quantity = parseInt(updated.quantity) || 1;
        const totalCost = calculateTotalCost(updated.beerOrdered, quantity);
        
        updated.price = price;
        updated.totalCost = totalCost;
      }
      
      return updated;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.isOccupied) {
      if (!formData.customerName.trim()) {
        newErrors.customerName = 'Customer name is required';
      }
      if (!formData.beerOrdered.trim()) {
        newErrors.beerOrdered = 'Beer order is required';
      }
      if (formData.quantity < 1 || formData.quantity > 20) {
        newErrors.quantity = 'Quantity must be between 1 and 20';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // If not occupied, clear all data
    const dataToSave = formData.isOccupied ? {
      ...formData,
      timeIn: formData.timeIn || (table && !table.isOccupied ? new Date().toISOString() : formData.timeIn)
    } : {
      customerName: '',
      beerOrdered: '',
      paymentStatus: 'unpaid',
      isOccupied: false,
      quantity: 1,
      price: 0,
      totalCost: 0,
      customOrder: '',
      timeIn: null,
      timeOut: null
    };

    onSave(dataToSave);
  };

  const beerOptions = getAllMenuItems();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {table ? `Edit Table #${table.tableNumber}` : 'Add New Order'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="isOccupied"
                checked={formData.isOccupied}
                onChange={handleChange}
              />
              Table is occupied
            </label>
          </div>

          {formData.isOccupied && (
            <>
              <div className={`form-group ${errors.customerName ? 'has-error' : ''}`}>
                <label htmlFor="customerName">Customer Name *</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
                {errors.customerName && (
                  <>
                    <span className="error">{errors.customerName}</span>
                    <span className="error-icon">⚠️</span>
                  </>
                )}
              </div>

              <div className={`form-group ${errors.beerOrdered ? 'has-error' : ''}`}>
                <label htmlFor="beerOrdered">Beer Ordered *</label>
                <select
                  id="beerOrdered"
                  name="beerOrdered"
                  value={formData.beerOrdered}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a beer</option>
                  {beerOptions.map(beer => (
                    <option key={beer.name} value={beer.name}>
                      {beer.name} - ₱{beer.price}
                    </option>
                  ))}
                </select>
                {errors.beerOrdered && (
                  <>
                    <span className="error">{errors.beerOrdered}</span>
                    <span className="error-icon">⚠️</span>
                  </>
                )}
              </div>

              <div className={`form-group ${errors.quantity ? 'has-error' : ''}`}>
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  max="20"
                />
                {errors.quantity && (
                  <>
                    <span className="error">{errors.quantity}</span>
                    <span className="error-icon">⚠️</span>
                  </>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="customOrder">Custom Order (Optional)</label>
                <input
                  type="text"
                  id="customOrder"
                  name="customOrder"
                  value={formData.customOrder}
                  onChange={handleChange}
                  placeholder="Special requests or modifications"
                />
              </div>

              {formData.beerOrdered && (
                <div className="order-summary">
                  <h4>
                    <span className="summary-icon">📋</span>
                    Order Summary
                  </h4>
                  <div className="order-summary-content">
                    <div className="order-summary-item">
                      <div className="order-summary-item-header">
                        <span className="order-summary-icon">🍺</span>
                        <span className="order-summary-label">Beer Item</span>
                      </div>
                      <span className="order-summary-value">{formData.beerOrdered}</span>
                    </div>
                    <div className="order-summary-item">
                      <div className="order-summary-item-header">
                        <span className="order-summary-icon">🔢</span>
                        <span className="order-summary-label">Quantity</span>
                      </div>
                      <span className="order-summary-value">{formData.quantity} {formData.quantity === 1 ? 'piece' : 'pieces'}</span>
                    </div>
                    <div className="order-summary-item">
                      <div className="order-summary-item-header">
                        <span className="order-summary-icon">💵</span>
                        <span className="order-summary-label">Price per Item</span>
                      </div>
                      <span className="order-summary-value">₱{formData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {formData.customOrder && (
                      <div className="order-summary-item order-summary-item-special">
                        <div className="order-summary-item-header">
                          <span className="order-summary-icon">📝</span>
                          <span className="order-summary-label">Special Request</span>
                        </div>
                        <span className="order-summary-value order-summary-special">{formData.customOrder}</span>
                      </div>
                    )}
                    <div className="order-summary-item order-summary-item-total">
                      <div className="order-summary-item-header">
                        <span className="order-summary-icon">💰</span>
                        <span className="order-summary-label">Total Cost</span>
                      </div>
                      <span className="order-summary-total">₱{formData.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="paymentStatus">Payment Status</label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {table ? 'Update Order' : 'Add Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableModal;