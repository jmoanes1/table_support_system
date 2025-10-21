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
            <label>
              <input
                type="checkbox"
                name="isOccupied"
                checked={formData.isOccupied}
                onChange={handleChange}
                style={{ marginRight: '10px' }}
              />
              Table is occupied
            </label>
          </div>

          {formData.isOccupied && (
            <>
              <div className="form-group">
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
                  <span style={{ color: '#e74c3c', fontSize: '14px' }}>
                    {errors.customerName}
                  </span>
                )}
              </div>

              <div className="form-group">
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
                  <span style={{ color: '#e74c3c', fontSize: '14px' }}>
                    {errors.beerOrdered}
                  </span>
                )}
              </div>

              <div className="form-group">
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
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Order Summary</h4>
                  <p style={{ margin: '5px 0', color: '#555' }}>
                    <strong>Item:</strong> {formData.beerOrdered}
                  </p>
                  <p style={{ margin: '5px 0', color: '#555' }}>
                    <strong>Quantity:</strong> {formData.quantity}
                  </p>
                  <p style={{ margin: '5px 0', color: '#555' }}>
                    <strong>Price per item:</strong> ₱{formData.price}
                  </p>
                  <p style={{ margin: '5px 0', color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}>
                    <strong>Total Cost:</strong> ₱{formData.totalCost}
                  </p>
                  {formData.customOrder && (
                    <p style={{ margin: '5px 0', color: '#555' }}>
                      <strong>Special Request:</strong> {formData.customOrder}
                    </p>
                  )}
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
