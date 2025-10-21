// Session Management with Timeout
import { SESSION_TIMEOUT, INACTIVITY_WARNING } from '../data/userRoles';
import { logActivity, ACTIVITY_TYPES } from './activityLogger';

class SessionManager {
  constructor() {
    this.timeoutId = null;
    this.warningTimeoutId = null;
    this.lastActivity = Date.now();
    this.isWarningShown = false;
    this.onTimeout = null;
    this.onWarning = null;
  }

  start(userId) {
    this.reset();
    this.setupActivityListeners();
    this.startTimeout();
  }

  reset() {
    this.lastActivity = Date.now();
    this.clearTimeouts();
    this.isWarningShown = false;
  }

  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimeout = () => {
      this.lastActivity = Date.now();
      this.reset();
      this.startTimeout();
    };

    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });
  }

  startTimeout() {
    // Clear existing timeouts
    this.clearTimeouts();

    // Set warning timeout
    this.warningTimeoutId = setTimeout(() => {
      this.showWarning();
    }, (SESSION_TIMEOUT - INACTIVITY_WARNING) * 60 * 1000);

    // Set session timeout
    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, SESSION_TIMEOUT * 60 * 1000);
  }

  showWarning() {
    if (this.isWarningShown) return;
    
    this.isWarningShown = true;
    
    if (this.onWarning) {
      this.onWarning();
    }
  }

  handleTimeout() {
    const userId = JSON.parse(localStorage.getItem('adminAuth') || '{}').user?.id;
    
    // Log the timeout
    logActivity(ACTIVITY_TYPES.SESSION_TIMEOUT, {
      reason: 'inactivity',
      lastActivity: new Date(this.lastActivity).toISOString()
    }, userId);

    // Clear session
    localStorage.removeItem('adminAuth');
    
    if (this.onTimeout) {
      this.onTimeout();
    }
  }

  clearTimeouts() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  stop() {
    this.clearTimeouts();
    this.isWarningShown = false;
  }

  extend() {
    this.reset();
    this.startTimeout();
  }
}

export const sessionManager = new SessionManager();
