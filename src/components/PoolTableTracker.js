import React, { useState, useEffect, useRef } from 'react';

const PoolTableTracker = ({ onUnpaidCustomersUpdate }) => {
  const [tables, setTables] = useState([
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
  ]);

  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notificationRef = useRef(null);

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
              players: table.players.map(player =>
                player.id === playerId
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
    <div className="pool-tracker-container" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '25px',
      marginBottom: '30px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <div>
          <h2 style={{ 
            color: '#2c3e50', 
            fontSize: '1.8rem', 
            fontWeight: '700',
            margin: '0 0 5px 0'
          }}>
            🎱 Shooter Bar Pool Tracker
          </h2>
          <p style={{ color: '#7f8c8d', margin: '0', fontSize: '14px' }}>
            Track game losses (₱30 each) and table rent (₱120/hr)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Outstanding Total */}
          <div style={{
            background: 'rgba(231, 76, 60, 0.1)',
            border: '1px solid rgba(231, 76, 60, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: '600' }}>
              Outstanding
            </div>
            <div style={{ fontSize: '18px', color: '#e74c3c', fontWeight: 'bold' }}>
              ₱{tables.flatMap(t => t.players).filter(p => p.total > 0 && p.status === "Unpaid").reduce((sum, player) => sum + player.total, 0)}
            </div>
          </div>

          {/* Pool Tracker Notification Badge */}
          <div style={{ position: 'relative' }} ref={notificationRef}>
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                transition: 'background-color 0.2s ease',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '36px',
                minHeight: '36px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              🔔
              {/* Red Badge */}
              {unpaidCustomers.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    borderRadius: '50%',
                    minWidth: '18px',
                    height: '18px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  {unpaidCustomers.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationDropdown && unpaidCustomers.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e0e0e0',
                  minWidth: '200px',
                  maxWidth: '300px',
                  width: 'max-content',
                  zIndex: 9999,
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                {/* Dropdown Header */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px 8px 0 0'
                  }}
                >
                  <h4 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    Unpaid Pool Players ({unpaidCustomers.length})
                  </h4>
                </div>

                {/* Player List */}
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {unpaidCustomers.map((player, index) => (
                    <div
                      key={player.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: index < unpaidCustomers.length - 1 ? '1px solid #f0f0f0' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>🧍</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                          {player.name}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          Pool Table {tables.find(t => t.players.includes(player))?.id || ''} — ₱{player.total}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dropdown Footer */}
                <div
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0 0 8px 8px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    Click outside to close
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={resetAll}
            className="btn btn-warning"
            style={{ fontSize: '12px', padding: '8px 16px' }}
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      {/* Pool Tables */}
      {tables.map((table) => (
        <div key={table.id} style={{
          background: 'rgba(52, 152, 219, 0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(52, 152, 219, 0.2)'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ 
              color: '#2c3e50', 
              fontSize: '1.4rem', 
              fontWeight: '600',
              margin: '0'
            }}>
              🏓 {table.name}
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Add player..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addNewPlayer(table.id, e.target.value);
                    e.target.value = '';
                  }
                }}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '12px',
                  width: '120px'
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
                className="btn btn-primary"
                style={{ fontSize: '10px', padding: '6px 10px' }}
              >
                ➕ Add
              </button>
            </div>
          </div>

          {/* Players Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              minWidth: '600px'
            }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '12px' }}>
                    Player
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                    Losses
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                    Hours
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                    Rate/hr
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                    Total
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.players.map((player, index) => (
                  <tr 
                    key={player.id}
                    style={{
                      borderBottom: index < table.players.length - 1 ? '1px solid #f0f0f0' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '10px', fontWeight: '600', color: '#2c3e50' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>🧍</span>
                        {player.name}
                        <button
                          onClick={() => removePlayer(table.id, player.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e74c3c',
                            cursor: 'pointer',
                            fontSize: '10px',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(231, 76, 60, 0.1)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#e74c3c', fontWeight: '600' }}>
                      {player.losses}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#f39c12', fontWeight: '600' }}>
                      {player.hours}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#7f8c8d', fontSize: '11px' }}>
                      ₱{player.rate}
                    </td>
                    <td style={{ 
                      padding: '10px', 
                      textAlign: 'center', 
                      fontWeight: 'bold',
                      color: player.total > 0 ? '#e74c3c' : '#27ae60',
                      fontSize: '14px'
                    }}>
                      ₱{player.total}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: player.status === 'Paid' ? '#d5f4e6' : '#fadbd8',
                        color: player.status === 'Paid' ? '#27ae60' : '#e74c3c'
                      }}>
                        {player.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '3px', 
                        justifyContent: 'center', 
                        flexWrap: 'wrap',
                        minWidth: '200px'
                      }}>
                        <button
                          onClick={() => addLoss(table.id, player.id)}
                          className="btn btn-danger"
                          style={{ fontSize: '8px', padding: '3px 6px', minWidth: '50px' }}
                        >
                          +Loss
                        </button>
                        <button
                          onClick={() => addHour(table.id, player.id)}
                          className="btn btn-warning"
                          style={{ fontSize: '8px', padding: '3px 6px', minWidth: '50px' }}
                        >
                          +Hour
                        </button>
                        {player.status === 'Unpaid' ? (
                          <button
                            onClick={() => markAsPaid(table.id, player.id)}
                            className="btn btn-success"
                            style={{ fontSize: '8px', padding: '3px 6px', minWidth: '50px' }}
                          >
                            Paid
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsUnpaid(table.id, player.id)}
                            className="btn btn-warning"
                            style={{ fontSize: '8px', padding: '3px 6px', minWidth: '50px' }}
                          >
                            Unpaid
                          </button>
                        )}
                        <button
                          onClick={() => resetPlayer(table.id, player.id)}
                          className="btn btn-secondary"
                          style={{ fontSize: '8px', padding: '3px 6px', minWidth: '50px' }}
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

      {/* Reset All Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={resetAll}
          className="btn btn-warning"
          style={{ fontSize: '14px', padding: '10px 20px' }}
        >
          🔄 Reset All
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
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
      `}</style>

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .pool-tracker-container {
            padding: 15px !important;
            margin-bottom: 20px !important;
          }
          
          .pool-tracker-container h2 {
            font-size: 1.4rem !important;
          }
          
          .pool-tracker-container table {
            font-size: 11px !important;
          }
          
          .pool-tracker-container th,
          .pool-tracker-container td {
            padding: 6px 4px !important;
          }
          
          .pool-tracker-container .btn {
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