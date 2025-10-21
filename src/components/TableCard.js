import React from 'react';

const TableCard = ({ table, onEdit, onDelete, onMarkAsPaid }) => {
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleString();
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
            <p><strong>Customer:</strong> {table.customerName}</p>
            <p><strong>Beer Ordered:</strong> {table.beerOrdered}</p>
            <p><strong>Order Time:</strong> {formatTime(table.timeOfOrder)}</p>
            {table.handledByName && (
              <p><strong>Handled By:</strong> <span style={{ color: '#00d4ff', fontWeight: '600' }}>{table.handledByName}</span></p>
            )}
            {table.timeFinished && (
              <p><strong>Finished:</strong> {formatTime(table.timeFinished)}</p>
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
        <div className="table-details">
          <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
            This table is available for new customers
          </p>
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
