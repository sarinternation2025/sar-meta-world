// Default alert rules
const defaultRules = [
  {
    id: 'cpu-high',
    metric: 'cpu',
    threshold: 80,
    level: 'warning',
    message: 'High CPU usage detected',
    description: 'CPU usage is above the warning threshold',
  },
  {
    id: 'memory-high',
    metric: 'memory',
    threshold: 85,
    level: 'warning',
    message: 'High memory usage detected',
    description: 'Memory usage is above the warning threshold',
  },
  {
    id: 'disk-high',
    metric: 'disk',
    threshold: 90,
    level: 'critical',
    message: 'High disk usage detected',
    description: 'Disk usage is critically high',
  },
  {
    id: 'cpu-critical',
    metric: 'cpu',
    threshold: 95,
    level: 'critical',
    message: 'Critical CPU usage',
    description: 'CPU usage is critically high',
  },
  {
    id: 'memory-critical',
    metric: 'memory',
    threshold: 95,
    level: 'critical',
    message: 'Critical memory usage',
    description: 'Memory usage is critically high',
  },
];

// Active alerts tracking
const activeAlerts = new Map();

const checkAlerts = (metrics, customThresholds = null) => {
  const alerts = [];
  const currentTime = Date.now();
  
  // Use custom thresholds if provided
  const thresholds = customThresholds || {
    cpu: 80,
    memory: 85,
    disk: 90
  };
  
  // Check each rule
  for (const rule of defaultRules) {
    const metricValue = metrics[rule.metric];
    let threshold = rule.threshold;
    
    // Override with custom threshold if available
    if (customThresholds && customThresholds[rule.metric]) {
      threshold = customThresholds[rule.metric];
    }
    
    if (metricValue > threshold) {
      const alert = {
        id: rule.id,
        metric: rule.metric,
        threshold: threshold,
        level: rule.level,
        message: rule.message,
        description: rule.description,
        value: metricValue,
        timestamp: currentTime,
        isActive: true
      };
      
      alerts.push(alert);
      activeAlerts.set(rule.id, alert);
    } else {
      // Remove alert if metric is back to normal
      if (activeAlerts.has(rule.id)) {
        activeAlerts.delete(rule.id);
      }
    }
  }
  
  return alerts;
};

// Get all active alerts
const getActiveAlerts = () => {
  return Array.from(activeAlerts.values());
};

// Clear specific alert
const clearAlert = (alertId) => {
  return activeAlerts.delete(alertId);
};

// Clear all alerts
const clearAllAlerts = () => {
  activeAlerts.clear();
};

// Get alert history (in production, this would be stored in a database)
const alertHistory = [];
const MAX_HISTORY = 100;

const addToHistory = (alert) => {
  alertHistory.unshift({ ...alert, resolvedAt: Date.now() });
  if (alertHistory.length > MAX_HISTORY) {
    alertHistory.pop();
  }
};

const getAlertHistory = () => {
  return alertHistory;
};

module.exports = {
  checkAlerts,
  getActiveAlerts,
  clearAlert,
  clearAllAlerts,
  addToHistory,
  getAlertHistory,
  defaultRules
};

