// Backup and Restore System
import { logActivity, ACTIVITY_TYPES } from './activityLogger';

export const createBackup = () => {
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    data: {
      tables: JSON.parse(localStorage.getItem('barTables') || '[]'),
      orderHistory: JSON.parse(localStorage.getItem('orderHistory') || '[]'),
      activityLogs: JSON.parse(localStorage.getItem('activityLogs') || '[]'),
      settings: JSON.parse(localStorage.getItem('barSettings') || '{}')
    }
  };

  // Log backup creation
  const userId = JSON.parse(localStorage.getItem('adminAuth') || '{}').user?.id;
  logActivity(ACTIVITY_TYPES.EXPORT_DATA, {
    type: 'backup',
    recordCount: backup.data.tables.length
  }, userId);

  return backup;
};

export const saveBackup = (backup) => {
  const backupKey = `backup_${Date.now()}`;
  localStorage.setItem(backupKey, JSON.stringify(backup));
  
  // Keep only last 10 backups
  const backupKeys = Object.keys(localStorage)
    .filter(key => key.startsWith('backup_'))
    .sort()
    .reverse();
  
  if (backupKeys.length > 10) {
    backupKeys.slice(10).forEach(key => {
      localStorage.removeItem(key);
    });
  }
  
  return backupKey;
};

export const restoreFromBackup = (backupKey) => {
  const backup = JSON.parse(localStorage.getItem(backupKey) || '{}');
  
  if (!backup.data) {
    throw new Error('Invalid backup file');
  }

  // Restore data
  if (backup.data.tables) {
    localStorage.setItem('barTables', JSON.stringify(backup.data.tables));
  }
  
  if (backup.data.orderHistory) {
    localStorage.setItem('orderHistory', JSON.stringify(backup.data.orderHistory));
  }
  
  if (backup.data.activityLogs) {
    localStorage.setItem('activityLogs', JSON.stringify(backup.data.activityLogs));
  }
  
  if (backup.data.settings) {
    localStorage.setItem('barSettings', JSON.stringify(backup.data.settings));
  }

  // Log restore
  const userId = JSON.parse(localStorage.getItem('adminAuth') || '{}').user?.id;
  logActivity(ACTIVITY_TYPES.EXPORT_DATA, {
    type: 'restore',
    backupTimestamp: backup.timestamp
  }, userId);

  return backup;
};

export const exportToJSON = () => {
  const backup = createBackup();
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `table-support-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  return backup;
};

export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        const restoredBackup = restoreFromBackup(JSON.stringify(backup));
        resolve(restoredBackup);
      } catch (error) {
        reject(new Error('Invalid backup file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export const getAvailableBackups = () => {
  return Object.keys(localStorage)
    .filter(key => key.startsWith('backup_'))
    .map(key => {
      const backup = JSON.parse(localStorage.getItem(key) || '{}');
      return {
        key,
        timestamp: backup.timestamp,
        recordCount: backup.data?.tables?.length || 0
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
