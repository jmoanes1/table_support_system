import React, { useState, useEffect } from 'react';
import { createBackup, saveBackup, restoreFromBackup, exportToJSON, importFromJSON, getAvailableBackups } from '../utils/backupManager';
import { toast } from 'react-toastify';

const BackupRestore = ({ onClose }) => {
  const [backups, setBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    const availableBackups = getAvailableBackups();
    setBackups(availableBackups);
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const backup = createBackup();
      const backupKey = saveBackup(backup);
      toast.success('Backup created successfully!');
      loadBackups();
    } catch (error) {
      toast.error('Failed to create backup');
    }
    setIsLoading(false);
  };

  const handleExportJSON = async () => {
    setIsLoading(true);
    try {
      await exportToJSON();
      toast.success('Data exported to JSON file!');
    } catch (error) {
      toast.error('Failed to export data');
    }
    setIsLoading(false);
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    importFromJSON(file)
      .then(() => {
        toast.success('Data imported successfully!');
        loadBackups();
        // Refresh the page to show imported data
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to import data');
      })
      .finally(() => {
        setIsLoading(false);
        event.target.value = ''; // Reset file input
      });
  };

  const handleRestoreBackup = (backupKey) => {
    if (window.confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      setIsLoading(true);
      try {
        restoreFromBackup(backupKey);
        toast.success('Backup restored successfully!');
        // Refresh the page to show restored data
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        toast.error('Failed to restore backup');
      }
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal backup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💾 Backup & Restore</h2>
          <button onClick={onClose} className="btn btn-secondary">✕</button>
        </div>

        <div className="backup-content">
          {/* Create Backup */}
          <div className="backup-section">
            <h3>📦 Create Backup</h3>
            <p>Create a backup of all current data including tables, orders, and settings.</p>
            <button 
              onClick={handleCreateBackup} 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Backup'}
            </button>
          </div>

          {/* Export/Import */}
          <div className="backup-section">
            <h3>📤 Export/Import Data</h3>
            <div className="export-import-buttons">
              <button 
                onClick={handleExportJSON} 
                className="btn btn-success"
                disabled={isLoading}
              >
                📄 Export to JSON
              </button>
              
              <label className="btn btn-warning" style={{ cursor: 'pointer' }}>
                📥 Import from JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  style={{ display: 'none' }}
                  disabled={isLoading}
                />
              </label>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Export creates a downloadable JSON file. Import allows you to restore from a previously exported file.
            </p>
          </div>

          {/* Available Backups */}
          <div className="backup-section">
            <h3>📋 Available Backups</h3>
            {backups.length > 0 ? (
              <div className="backups-list">
                {backups.map((backup, index) => (
                  <div key={backup.key} className="backup-item">
                    <div className="backup-info">
                      <h4>Backup #{index + 1}</h4>
                      <p>Created: {formatDate(backup.timestamp)}</p>
                      <p>Records: {backup.recordCount} tables</p>
                    </div>
                    <button 
                      onClick={() => handleRestoreBackup(backup.key)}
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No backups available. Create your first backup above.</p>
            )}
          </div>

          {/* Instructions */}
          <div className="backup-section">
            <h3>ℹ️ Instructions</h3>
            <div className="instructions">
              <p><strong>Creating Backups:</strong> Automatically saves your data locally. Up to 10 backups are kept.</p>
              <p><strong>Export/Import:</strong> Download data as JSON file or restore from a JSON file.</p>
              <p><strong>Restore:</strong> Overwrites current data with selected backup.</p>
              <p><strong>Note:</strong> All data is stored locally in your browser. Clear browser data will remove backups.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
