import React, { useState, useEffect } from 'react';
import { calculateAnalytics, generateSalesReport } from '../utils/analytics';
import { getAllMenuItems } from '../data/beerMenu';

const AnalyticsDashboard = ({ tables, orderHistory, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    const analyticsData = calculateAnalytics(tables, orderHistory);
    const report = generateSalesReport(tables, orderHistory, selectedPeriod);
    
    setAnalytics(analyticsData);
    setSalesReport(report);
  }, [tables, orderHistory, selectedPeriod]);

  if (!analytics) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => `₱${amount.toLocaleString()}`;
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Analytics Dashboard</h2>
          <button onClick={onClose} className="btn btn-secondary">✕</button>
        </div>

        <div className="analytics-content">
          {/* Period Selector */}
          <div className="period-selector">
            <label>Report Period:</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="form-control"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>{formatCurrency(analytics.totalSales)}</h3>
              <p>Total Sales</p>
            </div>
            <div className="metric-card">
              <h3>{analytics.totalOrdersToday}</h3>
              <p>Orders Today</p>
            </div>
            <div className="metric-card">
              <h3>{formatDuration(analytics.averageStayTime)}</h3>
              <p>Avg Stay Time</p>
            </div>
            <div className="metric-card">
              <h3>{analytics.occupancyRate.toFixed(1)}%</h3>
              <p>Occupancy Rate</p>
            </div>
          </div>

          {/* Sales Breakdown */}
          <div className="sales-breakdown">
            <h3>💰 Sales Breakdown</h3>
            <div className="breakdown-grid">
              <div className="breakdown-item">
                <span>Current Sales:</span>
                <strong>{formatCurrency(analytics.currentSales)}</strong>
              </div>
              <div className="breakdown-item">
                <span>Today's Sales:</span>
                <strong>{formatCurrency(analytics.todaySales)}</strong>
              </div>
              <div className="breakdown-item">
                <span>Week's Sales:</span>
                <strong>{formatCurrency(analytics.weekSales)}</strong>
              </div>
              <div className="breakdown-item">
                <span>Payment Rate:</span>
                <strong>{analytics.paymentCompletionRate.toFixed(1)}%</strong>
              </div>
            </div>
          </div>

          {/* Top Selling Beers */}
          <div className="top-beers">
            <h3>🍺 Top Selling Beers</h3>
            {analytics.topSellingBeer.length > 0 ? (
              <div className="beer-list">
                {analytics.topSellingBeer.map(([beer, count], index) => (
                  <div key={beer} className="beer-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="beer-name">{beer}</span>
                    <span className="count">{count} sold</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No sales data available</p>
            )}
          </div>

          {/* Table Status */}
          <div className="table-status">
            <h3>🪑 Table Status</h3>
            <div className="status-grid">
              <div className="status-item available">
                <span className="status-indicator"></span>
                <span>{analytics.availableTables} Available</span>
              </div>
              <div className="status-item occupied">
                <span className="status-indicator"></span>
                <span>{analytics.occupiedTables} Occupied</span>
              </div>
              <div className="status-item paid">
                <span className="status-indicator"></span>
                <span>{analytics.paidCustomers} Paid</span>
              </div>
              <div className="status-item unpaid">
                <span className="status-indicator"></span>
                <span>{analytics.unpaidCustomers} Unpaid</span>
              </div>
            </div>
          </div>

          {/* Sales Report */}
          {salesReport && (
            <div className="sales-report">
              <h3>📈 Sales Report - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</h3>
              <div className="report-grid">
                <div className="report-item">
                  <span>Total Orders:</span>
                  <strong>{salesReport.totalOrders}</strong>
                </div>
                <div className="report-item">
                  <span>Total Revenue:</span>
                  <strong>{formatCurrency(salesReport.totalRevenue)}</strong>
                </div>
                <div className="report-item">
                  <span>Average Order Value:</span>
                  <strong>{formatCurrency(salesReport.averageOrderValue)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
