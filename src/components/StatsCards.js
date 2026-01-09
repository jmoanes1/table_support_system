import React from 'react';

const StatsCards = ({ stats }) => {
  return (
    <div className="dashboard-stats">
      <div className="stat-card total-tables">
        <span className="stat-card-icon">🪑</span>
        <h3>{stats.totalTables}</h3>
        <p>Total Tables</p>
      </div>
      
      <div className="stat-card available-tables">
        <span className="stat-card-icon">✅</span>
        <h3>{stats.availableTables}</h3>
        <p>Available Tables</p>
      </div>
      
      <div className="stat-card occupied-tables">
        <span className="stat-card-icon">⏱️</span>
        <h3>{stats.occupiedTables}</h3>
        <p>Occupied Tables</p>
      </div>
      
      <div className="stat-card paid-customers">
        <span className="stat-card-icon">💰</span>
        <h3>{stats.paidCustomers}</h3>
        <p>Paid Customers</p>
      </div>
      
      <div className="stat-card unpaid-customers">
        <span className="stat-card-icon">⚠️</span>
        <h3>{stats.unpaidCustomers}</h3>
        <p>Unpaid Customers</p>
      </div>
      
      <div className="stat-card total-orders">
        <span className="stat-card-icon">📝</span>
        <h3>{stats.totalOrdersToday}</h3>
        <p>Total Orders Today</p>
      </div>
    </div>
  );
};

export default StatsCards;