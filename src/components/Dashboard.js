import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import TableCard from './TableCard';
import TableModal from './TableModal';
import StatsCards from './StatsCards';
import SearchFilters from './SearchFilters';
import ExportButtons from './ExportButtons';
import AnalyticsDashboard from './AnalyticsDashboard';
import BeerMenu from './BeerMenu';
import BackupRestore from './BackupRestore';
import OrderHistory from './OrderHistory';
import OrderHistoryPage from './OrderHistoryPage';
import NotificationBadge from './NotificationBadge';
import PoolTableTracker from './PoolTableTracker';
import { calculateAnalytics } from '../utils/analytics';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import { sessionManager } from '../utils/sessionManager';
import { logStaffActivity, getCurrentUser } from '../data/staffUsers';

const Dashboard = ({ currentUser, onLogout }) => {
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBeerMenu, setShowBeerMenu] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [showPoolTracker, setShowPoolTracker] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [poolUnpaidCustomers, setPoolUnpaidCustomers] = useState([]);

  // Initialize tables on component mount
  useEffect(() => {
    initializeTables();
    loadOrderHistory();
    setupSessionManagement();
  }, []);

  const setupSessionManagement = () => {
    sessionManager.onTimeout = () => {
      toast.error('Session expired due to inactivity. Please log in again.');
      onLogout();
    };
    
    sessionManager.onWarning = () => {
      setSessionWarning(true);
      toast.warning('Session will expire in 5 minutes due to inactivity.');
    };
    
    sessionManager.start(currentUser.id);
  };

  const loadOrderHistory = () => {
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    setOrderHistory(history);
  };

  // Filter tables when search term or filter changes
  useEffect(() => {
    filterTables();
  }, [tables, searchTerm, filterStatus]);

  const initializeTables = () => {
    setIsLoading(true);
    
    // Check if tables exist in localStorage
    const storedTables = localStorage.getItem('barTables');
    
    if (storedTables) {
      const parsedTables = JSON.parse(storedTables);
      setTables(parsedTables);
    } else {
      // Initialize with 15 empty tables
      const initialTables = Array.from({ length: 15 }, (_, index) => ({
        id: index + 1,
        tableNumber: index + 1,
        customerName: '',
        beerOrdered: '',
        paymentStatus: 'unpaid',
        timeOfOrder: null,
        timeFinished: null,
        timeIn: null,
        timeOut: null,
        duration: null,
        quantity: 1,
        price: 0,
        totalCost: 0,
        isOccupied: false,
        handledBy: null,
        handledByName: null
      }));
      setTables(initialTables);
      saveTablesToStorage(initialTables);
    }
    
    setIsLoading(false);
  };

  const saveTablesToStorage = (tablesToSave) => {
    localStorage.setItem('barTables', JSON.stringify(tablesToSave));
  };

  const filterTables = () => {
    let filtered = tables;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(table => 
        table.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.tableNumber.toString().includes(searchTerm) ||
        table.beerOrdered.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === 'occupied') {
      filtered = filtered.filter(table => table.isOccupied);
    } else if (filterStatus === 'available') {
      filtered = filtered.filter(table => !table.isOccupied);
    } else if (filterStatus === 'unpaid') {
      filtered = filtered.filter(table => table.isOccupied && table.paymentStatus === 'unpaid');
    } else if (filterStatus === 'paid') {
      filtered = filtered.filter(table => table.isOccupied && table.paymentStatus === 'paid');
    }

    setFilteredTables(filtered);
  };

  const handleAddTable = () => {
    setEditingTable(null);
    setShowModal(true);
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setShowModal(true);
  };

  const handleSaveTable = (tableData) => {
    if (editingTable) {
      const oldTable = editingTable;
      const isNewOrder = !oldTable.isOccupied && tableData.isOccupied;
      const isOrderCompleted = oldTable.isOccupied && !tableData.isOccupied;
      
      // Update existing table
      const updatedTables = tables.map(table => 
        table.id === editingTable.id 
          ? { 
              ...table, 
              ...tableData,
              timeOfOrder: tableData.isOccupied && !table.isOccupied ? new Date().toISOString() : table.timeOfOrder,
              timeFinished: !tableData.isOccupied && table.isOccupied ? new Date().toISOString() : table.timeFinished,
              timeIn: tableData.isOccupied && !table.isOccupied ? new Date().toISOString() : table.timeIn,
              timeOut: !tableData.isOccupied && table.isOccupied ? new Date().toISOString() : table.timeOut,
              handledBy: currentUser.id,
              handledByName: currentUser.name
            }
          : table
      );
      
      setTables(updatedTables);
      saveTablesToStorage(updatedTables);
      
      // Log activity
      if (isNewOrder) {
        logActivity(ACTIVITY_TYPES.ADD_ORDER, {
          tableNumber: editingTable.tableNumber,
          customerName: tableData.customerName,
          beerOrdered: tableData.beerOrdered,
          totalCost: tableData.totalCost
        }, currentUser.id);
        
        logStaffActivity('add_order', {
          tableNumber: editingTable.tableNumber,
          customerName: tableData.customerName,
          beerOrdered: tableData.beerOrdered,
          totalCost: tableData.totalCost
        });
      } else if (isOrderCompleted) {
        logActivity(ACTIVITY_TYPES.DELETE_ORDER, {
          tableNumber: editingTable.tableNumber,
          customerName: oldTable.customerName,
          duration: tableData.timeOut ? new Date(tableData.timeOut) - new Date(tableData.timeIn) : null
        }, currentUser.id);
        
        logStaffActivity('complete_order', {
          tableNumber: editingTable.tableNumber,
          customerName: oldTable.customerName,
          duration: tableData.timeOut ? new Date(tableData.timeOut) - new Date(tableData.timeIn) : null
        });
        
        // Add to order history
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          tableNumber: editingTable.tableNumber,
          customerName: oldTable.customerName,
          beerOrdered: oldTable.beerOrdered,
          quantity: oldTable.quantity,
          totalCost: oldTable.totalCost,
          paymentStatus: oldTable.paymentStatus,
          timeIn: oldTable.timeIn,
          timeOut: tableData.timeOut,
          duration: tableData.timeOut ? new Date(tableData.timeOut) - new Date(oldTable.timeIn) : null,
          customOrder: oldTable.customOrder,
          handledBy: oldTable.handledBy,
          handledByName: oldTable.handledByName
        };
        
        const updatedHistory = [...orderHistory, historyEntry];
        setOrderHistory(updatedHistory);
        localStorage.setItem('orderHistory', JSON.stringify(updatedHistory));
      } else {
        logActivity(ACTIVITY_TYPES.EDIT_ORDER, {
          tableNumber: editingTable.tableNumber,
          customerName: tableData.customerName,
          beerOrdered: tableData.beerOrdered
        }, currentUser.id);
        
        logStaffActivity('edit_order', {
          tableNumber: editingTable.tableNumber,
          customerName: tableData.customerName,
          beerOrdered: tableData.beerOrdered
        });
      }
      
      toast.success('Table updated successfully!');
    } else {
      // Add new table (this shouldn't happen as we have fixed 15 tables)
      toast.error('Cannot add new tables. Please edit existing ones.');
    }
    setShowModal(false);
    setEditingTable(null);
  };

  const handleDeleteTable = (tableId) => {
    const updatedTables = tables.map(table => 
      table.id === tableId 
        ? { 
            ...table, 
            customerName: '',
            beerOrdered: '',
            paymentStatus: 'unpaid',
            timeOfOrder: null,
            timeFinished: null,
            isOccupied: false
          }
        : table
    );
    setTables(updatedTables);
    saveTablesToStorage(updatedTables);
    toast.success('Table cleared successfully!');
  };

  const handleMarkAsPaid = (tableId) => {
    const updatedTables = tables.map(table => 
      table.id === tableId 
        ? { ...table, paymentStatus: 'paid' }
        : table
    );
    setTables(updatedTables);
    saveTablesToStorage(updatedTables);
    
    // Log activity
    const table = tables.find(t => t.id === tableId);
    logActivity(ACTIVITY_TYPES.MARK_PAID, {
      tableNumber: table?.tableNumber,
      customerName: table?.customerName,
      totalCost: table?.totalCost
    }, currentUser.id);
    
    logStaffActivity('mark_paid', {
      tableNumber: table?.tableNumber,
      customerName: table?.customerName,
      totalCost: table?.totalCost
    });
    
    toast.success('Payment marked as completed!');
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

  // Calculate statistics
  const stats = {
    totalTables: 15,
    occupiedTables: tables.filter(table => table.isOccupied).length,
    availableTables: tables.filter(table => !table.isOccupied).length,
    paidCustomers: tables.filter(table => table.isOccupied && table.paymentStatus === 'paid').length,
    unpaidCustomers: tables.filter(table => table.isOccupied && table.paymentStatus === 'unpaid').length,
    totalOrdersToday: tables.filter(table => table.isOccupied).length
  };

  // Get unpaid customers data for notification badge (combine table and pool customers)
  const tableUnpaidCustomers = tables
    .filter(table => table.isOccupied && table.paymentStatus === 'unpaid')
    .map(table => ({
      name: table.customerName,
      table: `Table ${table.tableNumber}`,
      totalOwed: table.totalCost || 0
    }));

  const allUnpaidCustomers = [...tableUnpaidCustomers, ...poolUnpaidCustomers];
  
  // Debug logging
  console.log('Dashboard - Table unpaid customers:', tableUnpaidCustomers);
  console.log('Dashboard - Pool unpaid customers:', poolUnpaidCustomers);
  console.log('Dashboard - All unpaid customers:', allUnpaidCustomers);

  // Test data for demonstration (uncomment to test notification badge)
  // const testUnpaidCustomers = [
  //   { name: "John", table: 7 },
  //   { name: "Anna", table: 3 },
  //   { name: "Jake", table: 1 },
  // ];
  // Replace unpaidCustomers with testUnpaidCustomers to test the notification badge

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>Shooter Bar System</h1>
          <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>
            Management System
          </p>
        </div>
        <div className="admin-info" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          {/* Notification Badge */}
          <NotificationBadge unpaidCustomers={allUnpaidCustomers} />
          
          <span className="staff-info" style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {currentUser.avatar} {currentUser.name}
            </span>
            <span style={{ color: '#7f8c8d', fontSize: '12px' }}>
              — {currentUser.role.toUpperCase()}
            </span>
          </span>
          <button onClick={onLogout} className="btn btn-secondary">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Responsive CSS for mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          .header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }
          
          .admin-info {
            width: 100% !important;
            justify-content: space-between !important;
            flex-wrap: nowrap !important;
          }
          
          .staff-info {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 5px !important;
          }
        }
        
        @media (max-width: 480px) {
          .admin-info {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
        }
      `}</style>

      {/* Statistics Cards */}
      <StatsCards stats={stats} />

      {/* Search and Filters */}
      <SearchFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
      />

      {/* Export Buttons */}
      <ExportButtons tables={tables} />

      {/* New Dashboard Buttons */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '15px', 
        padding: '20px', 
        marginBottom: '30px', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>🎯 Advanced Features</h3>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAnalytics(true)} className="btn btn-primary">
            📊 Analytics Dashboard
          </button>
          <button onClick={() => setShowBeerMenu(true)} className="btn btn-warning">
            🍺 Beer Menu & Prices
          </button>
          <button onClick={() => setShowHistory(true)} className="btn btn-success">
            📋 Order History
          </button>
          <button onClick={() => setShowHistoryPage(true)} className="btn btn-primary">
            📊 History Table View
          </button>
          <button onClick={() => setShowBackup(true)} className="btn btn-secondary">
            💾 Backup & Restore
          </button>
          <button onClick={() => setShowPoolTracker(true)} className="btn btn-primary">
            🎱 Pool Table Tracker
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="tables-grid">
        {filteredTables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            onEdit={handleEditTable}
            onDelete={handleDeleteTable}
            onMarkAsPaid={handleMarkAsPaid}
          />
        ))}
      </div>

      {/* Add Table Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={handleAddTable} className="btn btn-primary">
          ➕ Add New Order
        </button>
      </div>

      {/* Modals */}
      {showModal && (
        <TableModal
          table={editingTable}
          onSave={handleSaveTable}
          onClose={() => {
            setShowModal(false);
            setEditingTable(null);
          }}
        />
      )}

      {showAnalytics && (
        <AnalyticsDashboard
          tables={tables}
          orderHistory={orderHistory}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {showBeerMenu && (
        <BeerMenu
          onClose={() => setShowBeerMenu(false)}
        />
      )}

      {showHistory && (
        <OrderHistory
          onClose={() => setShowHistory(false)}
        />
      )}

      {showHistoryPage && (
        <OrderHistoryPage
          onClose={() => setShowHistoryPage(false)}
        />
      )}

      {showBackup && (
        <BackupRestore
          onClose={() => setShowBackup(false)}
        />
      )}

      {showPoolTracker && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>🎱 Pool Table Game & Rent Tracker</h2>
              <button 
                onClick={() => setShowPoolTracker(false)} 
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 12px' }}
              >
                ✕ Close
              </button>
            </div>
            <PoolTableTracker onUnpaidCustomersUpdate={setPoolUnpaidCustomers} />
          </div>
        </div>
      )}

      {/* Session Warning Modal */}
      {sessionWarning && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <h2>⚠️ Session Warning</h2>
            <p>Your session will expire in 5 minutes due to inactivity.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  sessionManager.extend();
                  setSessionWarning(false);
                  toast.success('Session extended!');
                }} 
                className="btn btn-primary"
              >
                Extend Session
              </button>
              <button 
                onClick={() => {
                  setSessionWarning(false);
                  onLogout();
                }} 
                className="btn btn-secondary"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
