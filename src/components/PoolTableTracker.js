import React, { useState, useEffect, useRef } from 'react';

const PoolTableTracker = ({ onUnpaidCustomersUpdate }) => {
  // Default initial tables
  const defaultTables = [
    {
      id: 1,
      name: "Pool Table 1",
      players: [
        { id: 1, name: "John", losses: 2, hours: 2, rate: 120, status: "Unpaid", total: 300 },
      ],
    },
    {
      id: 2,
      name: "Pool Table 2", 
      players: [
        { id: 2, name: "Anna", losses: 1, hours: 3, rate: 120, status: "Unpaid", total: 390 },
      ],
    },
  ];

  // Load tables from localStorage or use defaults
  const loadTables = () => {
    const storedTables = localStorage.getItem('poolTables');
    if (storedTables) {
      try {
        return JSON.parse(storedTables);
      } catch (e) {
        console.error('Error parsing pool tables:', e);
        return defaultTables;
      }
    }
    return defaultTables;
  };

  // Save tables to localStorage
  const saveTables = (tablesToSave) => {
    localStorage.setItem('poolTables', JSON.stringify(tablesToSave));
  };

  const [tables, setTables] = useState(loadTables);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const notificationRef = useRef(null);

  // Save tables to localStorage whenever tables change
  useEffect(() => {
    saveTables(tables);
  }, [tables]);

  // Calculate total owed for each player
  const calculateTotal = (player) => {
    const total = player.losses * 30 + player.hours * player.rate;
    console.log(`Calculating total for ${player.name}: ${player.losses} losses * 30 + ${player.hours} hours * ${player.rate} = ${total}`);
    return total;
  };

  // Update totals when losses or hours change
  useEffect(() => {
    setTables(prevTables => 
      prevTables.map(table => ({
        ...table,
        players: table.players.map(player => ({
          ...player,
          total: calculateTotal(player)
        }))
      }))
    );
  }, []); // Only run once on mount to initialize totals

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Send unpaid customers to parent component
  useEffect(() => {
    if (onUnpaidCustomersUpdate) {
      const unpaidCustomers = tables
        .flatMap(table => 
          table.players
            .filter(player => player.total > 0 && player.status === "Unpaid")
            .map(player => ({
              name: player.name,
              table: `Pool Table ${table.id}`,
              totalOwed: player.total
            }))
        );
      
      console.log('Pool Tracker - Sending unpaid customers:', unpaidCustomers);
      onUnpaidCustomersUpdate(unpaidCustomers);
    }
  }, [tables, onUnpaidCustomersUpdate]);

  const addLoss = (tableId, playerId) => {
    console.log(`Adding loss for player ${playerId} in table ${tableId}`);
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? {
              ...table,
              players: table.players.map(player =>
                player.id === playerId
                  ? { 
                      ...player, 
                      losses: player.losses + 1,
                      total: calculateTotal({ ...player, losses: player.losses + 1 })
                    }
                  : player
              )
            }
          : table
      )
    );
  };

  const addHour = (tableId, playerId) => {
    console.log(`Adding hour for player ${playerId} in table ${tableId}`);
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? {
              ...table,
              players: table.players.map(player =>
                player.id === playerId
                  ? { 
                      ...player, 
                      hours: player.hours + 1,
                      total: calculateTotal({ ...player, hours: player.hours + 1 })
                    }
                  : player
              )
            }
          : table
      )
    );
  };

  const markAsPaid = (tableId, playerId) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? {
              ...table,
              players: table.players.map(player =>
                player.id === playerId
                  ? { ...player, status: "Paid", losses: 0, hours: 0, total: 0 }
                  : player
              )
            }
          : table
      )
    );
  };

  const markAsUnpaid = (tableId, playerId) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? {
              ...table,
              players: table.players.map(player =>
                player.id === playerId
                  ? { ...player, status: "Unpaid" }
                  : player
              )
            }
          : table
      )
    );
  };

  const resetPlayer = (tableId, playerId) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? {
              ...table,
              // If player is paid, remove them completely. Otherwise, just reset their values.
              players: table.players
                .filter(player => {
                  // If this is the player being reset and they are paid, remove them
                  if (player.id === playerId && player.status === "Paid") {
                    return false; // Remove paid player when reset
                  }
                  return true; // Keep all other players
                })
                .map(player =>
                  player.id === playerId && player.status !== "Paid"
                    ? { 
                        ...player, 
                        losses: 0, 
                        hours: 0, 
                        total: 0, 
                        status: "Unpaid" 
                      }
                    : player
                )
            }
          : table
      )
    );
  };

  const resetAll = () => {
    setTables(prevTables =>
      prevTables.map(table => ({
        ...table,
        players: table.players.map(player => ({
          ...player,
          losses: 0,
          hours: 0,
          total: 0,
          status: "Unpaid"
        }))
      }))
    );
  };

  const addNewPlayer = (tableId, playerName) => {
    if (playerName.trim()) {
      const newPlayer = {
        id: Date.now(),
        name: playerName.trim(),
        losses: 0,
        hours: 0,
        rate: 120,
        status: "Unpaid",
        total: 0
      };
      
      setTables(prevTables =>
        prevTables.map(table =>
          table.id === tableId
            ? { ...table, players: [...table.players, newPlayer] }
            : table
        )
      );
    }
  };

  const removePlayer = (tableId, playerId) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? { ...table, players: table.players.filter(p => p.id !== playerId) }
          : table
      )
    );
  };

  // Calculate unpaid customers for Pool Tracker notification
  const unpaidCustomers = tables
    .flatMap(table => 
      table.players.filter(player => player.total > 0 && player.status === "Unpaid")
    );

  return (
    <div className="pool-tracker-container">
      {/* Header */}
      <div className="pool-tracker-header">
        <div className="pool-tracker-title-section">
          <h2 className="pool-tracker-title">
            🎱 Shooter Bar Pool Tracker
          </h2>
          <span className="pool-tracker-subtitle">
            Track game losses (₱30 each) and table rent (₱120/hr)
          </span>
        </div>

        <div className="pool-tracker-controls">
          {/* Outstanding Total */}
          <div className="outstanding-total">
            <div className="outstanding-label">
              Outstanding
            </div>
            <div className="outstanding-amount">
              ₱{tables.flatMap(t => t.players).filter(p => p.total > 0 && p.status === "Unpaid").reduce((sum, player) => sum + player.total, 0)}
            </div>
          </div>

          {/* Pool Tracker Notification Badge */}
          <div className="notification-container" ref={notificationRef}>
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="notification-bell"
            >
              🔔
              {/* Red Badge */}
              {unpaidCustomers.length > 0 && (
                <span className="notification-badge">
                  {unpaidCustomers.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationDropdown && unpaidCustomers.length > 0 && (
              <div className="notification-dropdown">
                {/* Dropdown Header */}
                <div className="dropdown-header">
                  <h4 className="dropdown-title">
                    Unpaid Pool Players ({unpaidCustomers.length})
                  </h4>
                </div>

                {/* Player List */}
                <div className="player-list">
                  {unpaidCustomers.map((player, index) => (
                    <div
                      key={player.id}
                      className="player-item"
                    >
                      <span className="player-icon">🧍</span>
                      <div className="player-info">
                        <div className="player-name">
                          {player.name}
                        </div>
                        <div className="player-details">
                          Pool Table {tables.find(t => t.players.includes(player))?.id || ''} — ₱{player.total}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dropdown Footer */}
                <div className="dropdown-footer">
                  <span className="footer-text">
                    Click outside to close
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowTables(!showTables)}
            className="btn btn-primary pool-tracker-btn"
          >
            {showTables ? '📋 Hide Tables' : '➕ Add New Order'}
          </button>

          <button
            onClick={resetAll}
            className="btn btn-warning pool-tracker-btn"
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      {/* Pool Tables - Only show when showTables is true */}
      {!showTables && (
        <div className="pool-status-card">
          <div className="pool-icon">🎱</div>
          <h3 className="pool-status-title">
            Pool Tables Ready
          </h3>
          <p className="pool-status-description">
            Click "Add New Order" to start managing pool table games and rentals
          </p>
          <div className="status-metrics">
            <div className="status-metric">
              <div className="metric-label">
                Unpaid Players
              </div>
              <div className="metric-value">
                {unpaidCustomers.length}
              </div>
            </div>
            <div className="status-metric">
              <div className="metric-label">
                Outstanding
              </div>
              <div className="metric-value">
                ₱{tables.flatMap(t => t.players).filter(p => p.total > 0 && p.status === "Unpaid").reduce((sum, player) => sum + player.total, 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTables && tables.map((table) => (
        <div key={table.id} className="pool-table-card">
          {/* Table Header */}
          <div className="table-header">
            <h3 className="table-title">
              🏓 {table.name}
            </h3>
            <div className="add-player-section">
              <input
                type="text"
                placeholder="Add player..."
                className="player-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addNewPlayer(table.id, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector(`input[placeholder="Add player..."]`);
                  if (input) {
                    addNewPlayer(table.id, input.value);
                    input.value = '';
                  }
                }}
                className="btn btn-primary add-player-btn"
              >
                ➕ Add
              </button>
            </div>
          </div>

          {/* Players Table */}
          <div className="table-container">
            <table className="players-table">
              <thead>
                <tr className="table-header-row">
                  <th className="table-header-cell">Player</th>
                  <th className="table-header-cell">Losses</th>
                  <th className="table-header-cell">Hours</th>
                  <th className="table-header-cell">Rate/hr</th>
                  <th className="table-header-cell">Total</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {table.players.map((player, index) => (
                  <tr key={player.id} className="table-row">
                    <td className="player-cell">
                      <div className="player-name-section">
                        <span className="player-icon">🧍</span>
                        {player.name}
                        <button
                          onClick={() => removePlayer(table.id, player.id)}
                          className="remove-player-btn"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                    <td className="losses-cell">
                      {player.losses}
                    </td>
                    <td className="hours-cell">
                      {player.hours}
                    </td>
                    <td className="rate-cell">
                      ₱{player.rate}
                    </td>
                    <td className={`total-cell ${player.total > 0 ? 'unpaid' : 'paid'}`}>
                      ₱{player.total}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${player.status.toLowerCase()}`}>
                        {player.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          onClick={() => addLoss(table.id, player.id)}
                          className="btn btn-danger action-btn"
                        >
                          +Loss
                        </button>
                        <button
                          onClick={() => addHour(table.id, player.id)}
                          className="btn btn-warning action-btn"
                        >
                          +Hour
                        </button>
                        {player.status === 'Unpaid' ? (
                          <button
                            onClick={() => markAsPaid(table.id, player.id)}
                            className="btn btn-success action-btn"
                          >
                            Paid
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsUnpaid(table.id, player.id)}
                            className="btn btn-warning action-btn"
                          >
                            Unpaid
                          </button>
                        )}
                        <button
                          onClick={() => resetPlayer(table.id, player.id)}
                          className="btn btn-secondary action-btn"
                        >
                          Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Reset All Button - Only show when tables are visible */}
      {showTables && (
        <div className="reset-all-section">
          <button
            onClick={resetAll}
            className="btn btn-warning reset-all-btn"
          >
            🔄 Reset All
          </button>
        </div>
      )}

      {/* CSS Styles - Professional Design */}
      <style jsx>{`
        .pool-tracker-container {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          margin-bottom: var(--spacing-xl);
          box-shadow: var(--card-shadow);
          border: 1px solid var(--card-border);
          position: relative;
          overflow: hidden;
          transition: all var(--transition-base);
        }

        .pool-tracker-container:hover {
          box-shadow: var(--card-shadow-hover);
          transform: translateY(-2px);
        }

        .pool-tracker-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .pool-tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
          padding-bottom: var(--spacing-lg);
          border-bottom: 2px solid rgba(102, 126, 234, 0.1);
          position: relative;
          flex-wrap: wrap;
          gap: var(--spacing-lg);
        }

        .pool-tracker-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%);
        }

        .pool-tracker-title {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 2.25rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
          line-height: 1.2;
          white-space: nowrap;
        }

        .pool-tracker-title-section {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .pool-tracker-subtitle {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          opacity: 0.9;
          white-space: nowrap;
          letter-spacing: 0.3px;
        }

        .pool-tracker-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: nowrap;
          white-space: nowrap;
        }

        .outstanding-total {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.08));
          border: 2px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--radius-md);
          padding: var(--spacing-md) var(--spacing-lg);
          text-align: center;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
          min-width: 140px;
          transition: all var(--transition-base);
        }

        .outstanding-total:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .outstanding-total::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent-danger), var(--accent-danger-dark));
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }

        .outstanding-label {
          font-size: 0.6875rem;
          color: var(--accent-danger-dark);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: var(--spacing-xs);
          display: block;
        }

        .outstanding-amount {
          font-size: 1.5rem;
          background: linear-gradient(135deg, var(--accent-danger), var(--accent-danger-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .notification-container {
          position: relative;
        }

        .notification-bell {
          position: relative;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          cursor: pointer;
          padding: 8px;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          min-height: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .notification-bell:hover {
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border-radius: 12px;
          min-width: 20px;
          height: 20px;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
          animation: pulse 2s infinite;
          border: 2px solid white;
        }

        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: var(--spacing-md);
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-lg);
          box-shadow: var(--card-shadow-hover);
          border: 1px solid var(--card-border);
          min-width: 320px;
          max-width: 380px;
          width: max-content;
          z-index: 9999;
          animation: fadeIn var(--transition-base);
          overflow: hidden;
        }

        .dropdown-header {
          padding: var(--spacing-lg) var(--spacing-xl);
          border-bottom: 2px solid rgba(102, 126, 234, 0.1);
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.03));
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          position: relative;
        }

        .dropdown-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: var(--spacing-xl);
          right: var(--spacing-xl);
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%);
        }

        .dropdown-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.3px;
        }

        .player-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .player-item {
          padding: var(--spacing-md) var(--spacing-xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          transition: all var(--transition-base);
          border-bottom: 1px solid rgba(102, 126, 234, 0.08);
          position: relative;
          background: var(--card-bg);
        }

        .player-item:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.03));
          transform: translateX(6px);
          box-shadow: -4px 0 0 var(--accent-primary);
        }

        .player-item:last-child {
          border-bottom: none;
        }

        .player-icon {
          font-size: 18px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          border-radius: 8px;
        }

        .player-info {
          flex: 1;
        }

        .player-name {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 1rem;
          margin-bottom: var(--spacing-xs);
          letter-spacing: -0.2px;
        }

        .player-details {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .dropdown-footer {
          padding: 8px 16px;
          background-color: #f8f9fa;
          border-radius: 0 0 8px 8px;
          text-align: center;
        }

        .footer-text {
          font-size: 12px;
          color: #666;
        }

        .pool-tracker-btn {
          font-size: 0.875rem;
          font-weight: 700;
          padding: var(--spacing-md) var(--spacing-lg);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          box-shadow: var(--shadow-sm);
          white-space: nowrap;
        }

        .pool-tracker-btn:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .pool-tracker-btn:active {
          transform: translateY(-1px) scale(0.98);
        }

        .pool-status-card {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          text-align: center;
          border: 2px dashed rgba(102, 126, 234, 0.25);
          margin-bottom: var(--spacing-xl);
          position: relative;
          overflow: hidden;
          box-shadow: var(--card-shadow);
          transition: all var(--transition-base);
        }

        .pool-status-card:hover {
          border-color: rgba(102, 126, 234, 0.4);
          box-shadow: var(--card-shadow-hover);
          transform: translateY(-2px);
        }

        .pool-status-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .pool-icon {
          font-size: 5rem;
          margin-bottom: var(--spacing-lg);
          filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .pool-status-title {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 var(--spacing-md) 0;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .pool-status-description {
          color: var(--text-secondary);
          margin: 0 0 var(--spacing-xl) 0;
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.6;
        }

        .status-metrics {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .status-metric {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.08));
          border: 2px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg) var(--spacing-xl);
          text-align: center;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
          min-width: 140px;
          transition: all var(--transition-base);
        }

        .status-metric:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .status-metric::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent-danger), var(--accent-danger-dark));
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }

        .metric-label {
          font-size: 0.6875rem;
          color: var(--accent-danger-dark);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: var(--spacing-sm);
          display: block;
        }

        .metric-value {
          font-size: 1.75rem;
          background: linear-gradient(135deg, var(--accent-danger), var(--accent-danger-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .pool-table-card {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-lg);
          border: 2px solid rgba(102, 126, 234, 0.15);
          box-shadow: var(--card-shadow);
          position: relative;
          overflow: hidden;
          transition: all var(--transition-base);
        }

        .pool-table-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--card-shadow-hover);
          border-color: rgba(102, 126, 234, 0.3);
        }

        .pool-table-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
        }

        .table-title {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .add-player-section {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .player-input {
          padding: var(--spacing-md) var(--spacing-lg);
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
          width: 180px;
          background: rgba(255, 255, 255, 0.95);
          transition: all var(--transition-base);
          font-weight: 600;
          color: var(--text-primary);
        }

        .player-input::placeholder {
          color: var(--text-light);
          opacity: 0.6;
        }

        .player-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), var(--shadow-md);
          background: var(--text-white);
          transform: translateY(-2px);
        }

        .player-input:hover {
          border-color: rgba(102, 126, 234, 0.4);
        }

        .add-player-btn {
          font-size: 11px;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .add-player-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .table-container {
          overflow-x: auto;
        }

        .players-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: var(--card-bg);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          min-width: 600px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .table-header-row {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dark));
          color: var(--text-white);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }

        .table-header-cell {
          padding: var(--spacing-md) var(--spacing-sm);
          text-align: left;
          font-weight: 800;
          font-size: 0.8125rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--text-white);
          position: relative;
        }

        .table-header-cell:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 20%;
          bottom: 20%;
          width: 1px;
          background: rgba(255, 255, 255, 0.2);
        }

        .table-header-cell:nth-child(2),
        .table-header-cell:nth-child(3),
        .table-header-cell:nth-child(4),
        .table-header-cell:nth-child(5),
        .table-header-cell:nth-child(6),
        .table-header-cell:nth-child(7) {
          text-align: center;
        }

        .table-row {
          border-bottom: 1px solid rgba(102, 126, 234, 0.08);
          transition: all var(--transition-base);
          background: var(--card-bg);
        }

        .table-row:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.03));
          transform: translateX(4px);
          box-shadow: -4px 0 0 var(--accent-primary);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .player-cell {
          padding: var(--spacing-md);
          font-weight: 700;
          color: var(--text-primary);
          font-size: 0.9375rem;
        }

        .player-name-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .remove-player-btn {
          background: none;
          border: none;
          color: #e74c3c;
          cursor: pointer;
          font-size: 10px;
          padding: 2px 4px;
          border-radius: 3px;
          transition: background-color 0.2s ease;
        }

        .remove-player-btn:hover {
          background-color: rgba(231, 76, 60, 0.1);
        }

        .losses-cell {
          padding: var(--spacing-md);
          text-align: center;
          color: var(--accent-danger);
          font-weight: 800;
          font-size: 1rem;
        }

        .hours-cell {
          padding: var(--spacing-md);
          text-align: center;
          color: var(--accent-warning);
          font-weight: 800;
          font-size: 1rem;
        }

        .rate-cell {
          padding: var(--spacing-md);
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .total-cell {
          padding: var(--spacing-md);
          text-align: center;
          font-weight: 900;
          font-size: 1.125rem;
          letter-spacing: -0.5px;
        }

        .total-cell.unpaid {
          background: linear-gradient(135deg, var(--accent-danger), var(--accent-danger-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .total-cell.paid {
          background: linear-gradient(135deg, var(--accent-success), var(--accent-success-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .status-cell {
          padding: 10px;
          text-align: center;
        }

        .status-badge {
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-base);
          display: inline-block;
        }

        .status-badge:hover {
          transform: scale(1.05);
        }

        .status-badge.paid {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
          color: var(--accent-success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-badge.unpaid {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
          color: var(--accent-danger);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .actions-cell {
          padding: 10px;
          text-align: center;
        }

        .action-buttons {
          display: flex;
          gap: 3px;
          justify-content: center;
          flex-wrap: wrap;
          min-width: 200px;
        }

        .action-btn {
          font-size: 0.75rem;
          font-weight: 700;
          padding: var(--spacing-sm) var(--spacing-md);
          min-width: 70px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-base);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          box-shadow: var(--shadow-sm);
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .action-btn:active {
          transform: translateY(0) scale(0.98);
        }

        .reset-all-section {
          text-align: center;
          margin-top: var(--spacing-xl);
          padding: var(--spacing-xl);
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.08));
          border-radius: var(--radius-lg);
          border: 2px solid rgba(245, 158, 11, 0.25);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-base);
        }

        .reset-all-section:hover {
          border-color: rgba(245, 158, 11, 0.4);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .reset-all-btn {
          font-size: 1rem;
          font-weight: 800;
          padding: var(--spacing-md) var(--spacing-2xl);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        }

        .reset-all-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.5);
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @media (max-width: 768px) {
          .pool-tracker-container {
            padding: 15px !important;
            margin-bottom: 20px !important;
          }
          
          .pool-tracker-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          
          .pool-tracker-title-section {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
          }
          
          .pool-tracker-subtitle {
            margin: 0 !important;
          }
          
          .pool-tracker-controls {
            width: 100% !important;
            justify-content: space-between !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
          }
          
          .pool-tracker-title {
            font-size: 1.4rem !important;
          }
          
          .players-table {
            font-size: 11px !important;
          }
          
          .table-header-cell,
          .table-row td {
            padding: 6px 4px !important;
          }
          
          .action-btn {
            font-size: 7px !important;
            padding: 2px 4px !important;
            min-width: 40px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PoolTableTracker;