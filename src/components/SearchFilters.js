import React from 'react';

const SearchFilters = ({ 
  onSearch, 
  onFilterChange, 
  onClearFilters, 
  searchTerm, 
  filterStatus 
}) => {
  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleFilterClick = (status) => {
    onFilterChange(status);
  };

  return (
    <div className="search-filters">
      <div style={{ flex: 1, minWidth: '250px' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search by customer name, table number, or beer..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="filter-buttons">
        <button
          onClick={() => handleFilterClick('all')}
          className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Tables
        </button>
        
        <button
          onClick={() => handleFilterClick('occupied')}
          className={`btn ${filterStatus === 'occupied' ? 'btn-primary' : 'btn-secondary'}`}
        >
          🍺 Occupied
        </button>
        
        <button
          onClick={() => handleFilterClick('available')}
          className={`btn ${filterStatus === 'available' ? 'btn-primary' : 'btn-secondary'}`}
        >
          ✅ Available
        </button>
        
        <button
          onClick={() => handleFilterClick('unpaid')}
          className={`btn ${filterStatus === 'unpaid' ? 'btn-primary' : 'btn-secondary'}`}
        >
          ⚠️ Unpaid
        </button>
        
        <button
          onClick={() => handleFilterClick('paid')}
          className={`btn ${filterStatus === 'paid' ? 'btn-primary' : 'btn-secondary'}`}
        >
          💰 Paid
        </button>
        
        {(searchTerm || filterStatus !== 'all') && (
          <button
            onClick={onClearFilters}
            className="btn btn-warning"
          >
            🗑️ Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
