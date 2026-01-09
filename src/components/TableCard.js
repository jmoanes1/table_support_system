import React from 'react';

const TableCard = ({ table, onEdit, onDelete, onMarkAsPaid }) => {
  // Format time in a more readable, professional format
  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    // Show relative time for recent orders
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    // For older orders, show formatted date and time
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format full date and time when needed
  const formatFullTime = (timeString) => {
    if (!timeString) return 'Not set';
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = () => {
    if (!table.isOccupied) return 'available';
    return table.paymentStatus === 'paid' ? 'paid' : 'unpaid';
  };

  const getStatusText = () => {
    if (!table.isOccupied) return 'Available';
    return table.paymentStatus === 'paid' ? 'Paid' : 'Unpaid';
  };

  return (
    <div className={`table-card ${table.isOccupied ? 'occupied' : 'available'}`}>
      <div className="table-header">
        <div className="table-number">
          Table #{table.tableNumber}
        </div>
        <div className={`payment-status ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      {table.isOccupied ? (
        <>
          <div className="table-details">
            {/* Customer Information */}
            <div className="detail-item">
              <div className="detail-icon">👤</div>
              <div className="detail-content">
                <span className="detail-label">Customer Name</span>
                <span className="detail-value">{table.customerName || 'Not specified'}</span>
              </div>
            </div>

            {/* Beer Order Information */}
            <div className="detail-item">
              <div className="detail-icon">🍺</div>
              <div className="detail-content">
                <span className="detail-label">Beer Ordered</span>
                <span className="detail-value">{table.beerOrdered || 'Not specified'}</span>
                {table.quantity > 1 && (
                  <span className="detail-badge">×{table.quantity}</span>
                )}
              </div>
            </div>

            {/* Custom Order if exists */}
            {table.customOrder && (
              <div className="detail-item">
                <div className="detail-icon">📝</div>
                <div className="detail-content">
                  <span className="detail-label">Special Request</span>
                  <span className="detail-value detail-special">{table.customOrder}</span>
                </div>
              </div>
            )}

            {/* Order Time */}
            <div className="detail-item">
              <div className="detail-icon">🕐</div>
              <div className="detail-content">
                <span className="detail-label">Order Time</span>
                <span className="detail-value" title={formatFullTime(table.timeOfOrder)}>
                  {formatTime(table.timeOfOrder)}
                </span>
              </div>
            </div>

            {/* Staff Information */}
            {table.handledByName && (
              <div className="detail-item">
                <div className="detail-icon">👨‍💼</div>
                <div className="detail-content">
                  <span className="detail-label">Handled By</span>
                  <span className="detail-value detail-staff">{table.handledByName}</span>
                </div>
              </div>
            )}

            {/* Total Cost */}
            {table.totalCost > 0 && (
              <div className="detail-item detail-item-total">
                <div className="detail-icon">💰</div>
                <div className="detail-content">
                  <span className="detail-label">Total Cost</span>
                  <span className="detail-value detail-total">₱{table.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            {/* Finished Time */}
            {table.timeFinished && (
              <div className="detail-item">
                <div className="detail-icon">✅</div>
                <div className="detail-content">
                  <span className="detail-label">Completed</span>
                  <span className="detail-value" title={formatFullTime(table.timeFinished)}>
                    {formatTime(table.timeFinished)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="table-actions">
            {table.paymentStatus === 'unpaid' && (
              <button
                onClick={() => onMarkAsPaid(table.id)}
                className="btn btn-success"
                style={{ fontSize: '12px', padding: '6px 10px' }}
              >
                ✅ Mark Paid
              </button>
            )}
            
            <button
              onClick={() => onEdit(table)}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              ✏️ Edit
            </button>
            
            <button
              onClick={() => onDelete(table.id)}
              className="btn btn-danger"
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              🗑️ Clear
            </button>
          </div>
        </>
      ) : (
        <div className="table-details table-details-empty">
          <div className="empty-state">
            <div className="empty-icon">🪑</div>
            <p className="empty-text">This table is available</p>
            <p className="empty-subtext">Ready for new customers</p>
          </div>
        </div>
      )}

      <div className="table-actions">
        <button
          onClick={() => onEdit(table)}
          className="btn btn-primary"
          style={{ fontSize: '12px', padding: '6px 10px', width: '100%' }}
        >
          {table.isOccupied ? '✏️ Edit Order' : '➕ Add Order'}
        </button>
      </div>
    </div>
  );
};

export default TableCard;
