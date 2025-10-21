import React, { useState } from 'react';
import { beerMenu, getAllMenuItems } from '../data/beerMenu';

const BeerMenu = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const menuItems = getAllMenuItems();

  const categories = [
    { key: 'all', name: 'All Items', icon: '🍺' },
    { key: 'Domestic', name: 'Domestic', icon: '🇵🇭' },
    { key: 'Import', name: 'Import', icon: '🌍' },
    { key: 'Craft', name: 'Craft', icon: '🍺' },
    { key: 'Bucket', name: 'Buckets', icon: '🪣' },
    { key: 'Special', name: 'Specials', icon: '⭐' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const formatCurrency = (amount) => `₱${amount.toLocaleString()}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal beer-menu-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🍺 Beer Menu & Pricing</h2>
          <button onClick={onClose} className="btn btn-secondary">✕</button>
        </div>

        <div className="beer-menu-content">
          {/* Category Filter */}
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`category-btn ${selectedCategory === category.key ? 'active' : ''}`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="menu-items">
            {filteredItems.map((item, index) => (
              <div key={index} className={`menu-item ${item.category.toLowerCase()}`}>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <span className="category-badge">{item.category}</span>
                </div>
                <div className="item-price">
                  <span className="price">{formatCurrency(item.price)}</span>
                  {item.category === 'Bucket' && (
                    <span className="bucket-info">(6 bottles)</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Special Offers */}
          <div className="special-offers">
            <h3>🎉 Special Offers</h3>
            <div className="offers-grid">
              <div className="offer-card">
                <h4>Happy Hour</h4>
                <p>4:00 PM - 6:00 PM</p>
                <span className="offer-price">₱90 per bottle</span>
              </div>
              <div className="offer-card">
                <h4>Weekend Special</h4>
                <p>Friday - Sunday</p>
                <span className="offer-price">₱100 per bottle</span>
              </div>
              <div className="offer-card">
                <h4>Game Day</h4>
                <p>During Sports Events</p>
                <span className="offer-price">₱95 per bottle</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="menu-footer">
            <p>Table Support - Quality Service, Great Times!</p>
            <p>All prices subject to change. Please ask staff for current specials.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeerMenu;
