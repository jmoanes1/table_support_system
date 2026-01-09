import React, { useState, useEffect } from 'react';

const CustomerQRGenerator = ({ onClose }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [customerLink, setCustomerLink] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    // Generate table list (in real app, this would come from props or API)
    const tableList = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      isOccupied: false
    }));
    setTables(tableList);
  }, []);

  const generateQRCode = (tableNumber) => {
    // Generate a URL that opens the customer ordering interface for that table
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/customer?table=${tableNumber}`;
    setCustomerLink(url);
    
    // Using a QR code API (in production, use a proper QR code library)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    setQrCodeUrl(qrApiUrl);
    setShowQRCode(true);
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `table-${selectedTable}-customer-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printQRCode = () => {
    if (qrCodeUrl) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Table ${selectedTable} Customer QR Code</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
              }
              .qr-container {
                max-width: 400px;
                margin: 0 auto;
              }
              .qr-code {
                width: 300px;
                height: 300px;
                margin: 20px auto;
                border: 2px solid #ddd;
                border-radius: 8px;
              }
              .table-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .instructions {
                margin-top: 20px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>Table ${selectedTable} - Customer Ordering</h2>
              <div class="table-info">
                <h3>Scan to Order</h3>
                <p>Customers can scan this QR code to access the digital menu and place orders</p>
              </div>
              <img src="${qrCodeUrl}" alt="QR Code for Table ${selectedTable}" class="qr-code" />
              <div class="instructions">
                <p><strong>Instructions for Customers:</strong></p>
                <p>1. Open your phone's camera</p>
                <p>2. Point it at the QR code</p>
                <p>3. Tap the notification to open the menu</p>
                <p>4. Browse and place your order</p>
                <p>5. Track your order status in real-time</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="customer-qr-generator-container">
      <div className="customer-qr-generator-header">
        <h2>📱 Customer QR Code Generator</h2>
        <button onClick={onClose} className="btn btn-secondary">✕</button>
      </div>

      <div className="customer-qr-generator-content">
        {!showQRCode ? (
          <div className="table-selection">
            <h3>Select Table to Generate Customer QR Code</h3>
            <p>Choose a table to generate a QR code that customers can scan to access the digital menu and place orders.</p>
            
            <div className="tables-grid">
              {tables.map(table => (
                <div 
                  key={table.id} 
                  className={`table-card ${table.isOccupied ? 'occupied' : 'available'} ${selectedTable === table.number ? 'selected' : ''}`}
                  onClick={() => setSelectedTable(table.number)}
                >
                  <div className="table-number">Table {table.number}</div>
                  <div className="table-status">
                    {table.isOccupied ? '🟡 Occupied' : '🟢 Available'}
                  </div>
                </div>
              ))}
            </div>

            {selectedTable && (
              <div className="selected-table-actions">
                <h4>Selected: Table {selectedTable}</h4>
                <button 
                  onClick={() => generateQRCode(selectedTable)}
                  className="btn btn-primary"
                >
                  Generate Customer QR Code
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="qr-display">
            <div className="qr-header">
              <h3>Table {selectedTable} - Customer QR Code</h3>
              <button 
                onClick={() => setShowQRCode(false)}
                className="btn btn-secondary"
              >
                ← Back to Tables
              </button>
            </div>

            <div className="qr-content">
              <div className="qr-code-container">
                <img 
                  src={qrCodeUrl} 
                  alt={`Customer QR Code for Table ${selectedTable}`}
                  className="qr-code-image"
                />
                <div className="qr-info">
                  <h4>Customer Ordering QR Code</h4>
                  <p>Customers can scan this code to access the digital menu for Table {selectedTable}</p>
                  {customerLink && (
                    <div className="direct-link">
                      <strong>Direct Link:</strong>
                      <div className="link-row">
                        <span className="link-text">{customerLink}</span>
                        <button 
                          className="btn btn-outline"
                          onClick={() => {
                            navigator.clipboard.writeText(customerLink);
                            alert('Customer link copied to clipboard!');
                          }}
                        >
                          📋 Copy Link
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="features-list">
                    <div className="feature-item">📱 Mobile-friendly ordering</div>
                    <div className="feature-item">🛒 Shopping cart functionality</div>
                    <div className="feature-item">📊 Real-time order tracking</div>
                    <div className="feature-item">🔔 Order status notifications</div>
                  </div>
                </div>
              </div>

              <div className="qr-actions">
                <button 
                  onClick={downloadQRCode}
                  className="btn btn-primary"
                >
                  📥 Download QR Code
                </button>
                <button 
                  onClick={printQRCode}
                  className="btn btn-success"
                >
                  🖨️ Print QR Code
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(qrCodeUrl);
                    alert('QR Code URL copied to clipboard!');
                  }}
                  className="btn btn-outline"
                >
                  📋 Copy URL
                </button>
              </div>

              <div className="qr-instructions">
                <h4>How to Use:</h4>
                <ol>
                  <li>Print or display this QR code at Table {selectedTable}</li>
                  <li>Customers scan the code with their phone camera</li>
                  <li>They'll be taken to the digital menu for that table</li>
                  <li>Customers can browse, order, and track their order status</li>
                  <li>Orders are automatically sent to the kitchen system</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .customer-qr-generator-container {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 20px;
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .customer-qr-generator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .customer-qr-generator-header h2 {
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .table-selection h3 {
          color: #1f2937;
          font-size: 1.3rem;
          margin: 0 0 8px 0;
        }

        .table-selection p {
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .table-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .table-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .table-card.available {
          border-color: #10b981;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .table-card.occupied {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .table-card.selected {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          transform: scale(1.05);
        }

        .table-number {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .table-status {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .selected-table-actions {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .selected-table-actions h4 {
          color: #1f2937;
          margin: 0 0 16px 0;
        }

        .qr-display {
          text-align: center;
        }

        .qr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .qr-header h3 {
          color: #1f2937;
          font-size: 1.3rem;
          margin: 0;
        }

        .qr-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .qr-code-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .qr-code-image {
          width: 300px;
          height: 300px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .qr-info h4 {
          color: #1f2937;
          font-size: 1.1rem;
          margin: 0 0 8px 0;
        }

        .qr-info p {
          color: #6b7280;
          margin: 0 0 16px 0;
        }

        .direct-link {
          background: #f3f4f6;
          border-radius: 8px;
          padding: 12px;
          margin: 12px 0 0 0;
        }

        .link-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }

        .link-text {
          font-size: 0.9rem;
          color: #1f2937;
          background: white;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          max-width: 520px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .features-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          margin-top: 16px;
        }

        .feature-item {
          background: #f3f4f6;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #374151;
        }

        .qr-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .qr-instructions {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          max-width: 500px;
        }

        .qr-instructions h4 {
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .qr-instructions ol {
          color: #6b7280;
          margin: 0;
          padding-left: 20px;
        }

        .qr-instructions li {
          margin-bottom: 8px;
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

        .btn-outline {
          background: transparent;
          color: #3b82f6;
          border: 1px solid #3b82f6;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .customer-qr-generator-container {
            margin: 10px;
            padding: 16px;
          }
          
          .tables-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
          }
          
          .qr-code-image {
            width: 250px;
            height: 250px;
          }
          
          .qr-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .qr-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerQRGenerator;
