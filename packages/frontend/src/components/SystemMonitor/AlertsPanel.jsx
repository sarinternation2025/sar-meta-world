import React, { useState } from 'react';

const AlertsPanel = ({ alerts = [] }) => {
  const [filter, setFilter] = useState('all');
  const [expandedAlert, setExpandedAlert] = useState(null);

  const getAlertConfig = (severity) => {
    const severityMap = {
      critical: {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: '🚨',
        priority: 4
      },
      high: {
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: '⚠️',
        priority: 3
      },
      medium: {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: '⚡',
        priority: 2
      },
      low: {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'ℹ️',
        priority: 1
      },
      info: {
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: '📋',
        priority: 0
      }
    };
    return severityMap[severity] || severityMap.info;
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    const configA = getAlertConfig(a.severity);
    const configB = getAlertConfig(b.severity);
    
    // Sort by priority (higher first), then by timestamp (newer first)
    if (configA.priority !== configB.priority) {
      return configB.priority - configA.priority;
    }
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const filteredAlerts = sortedAlerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  });

  const alertCounts = alerts.reduce((counts, alert) => {
    counts[alert.severity] = (counts[alert.severity] || 0) + 1;
    counts.total = (counts.total || 0) + 1;
    return counts;
  }, {});

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <div className="text-gray-400 text-4xl mb-2">✅</div>
        <p className="text-gray-600 text-sm">No alerts to display</p>
        <p className="text-gray-400 text-xs mt-1">All systems are running normally</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-3">
        {['all', 'critical', 'high', 'medium', 'low', 'info'].map(severity => {
          const count = severity === 'all' ? alertCounts.total : alertCounts[severity] || 0;
          const isActive = filter === severity;
          
          if (severity !== 'all' && count === 0) return null;
          
          return (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredAlerts.map((alert, index) => {
          const config = getAlertConfig(alert.severity);
          const isExpanded = expandedAlert === index;
          
          return (
            <div
              key={index}
              className={`${config.bg} ${config.border} border rounded-lg p-3 transition-all duration-200 hover:shadow-sm cursor-pointer`}
              onClick={() => setExpandedAlert(isExpanded ? null : index)}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1">
                  <span className="text-sm mt-0.5">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h5 className={`font-medium ${config.color} text-sm`}>
                      {alert.title || 'System Alert'}
                    </h5>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                      {alert.message || alert.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium border ${config.border}`}>
                    {alert.severity?.toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(alert.timestamp)}
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  {alert.source && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Source:</span>
                      <span className="font-mono text-gray-700">{alert.source}</span>
                    </div>
                  )}
                  
                  {alert.component && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Component:</span>
                      <span className="text-gray-700">{alert.component}</span>
                    </div>
                  )}
                  
                  {alert.value && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Value:</span>
                      <span className={`font-mono ${config.color}`}>{alert.value}</span>
                    </div>
                  )}
                  
                  {alert.threshold && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Threshold:</span>
                      <span className="font-mono text-gray-700">{alert.threshold}</span>
                    </div>
                  )}
                  
                  {alert.timestamp && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Time:</span>
                      <span className="text-gray-700">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-2">
                    <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
                      Acknowledge
                    </button>
                    <button className="text-xs text-red-600 hover:text-red-800 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {alertCounts.total > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Total Alerts: {alertCounts.total}</span>
            <span>
              Critical: {alertCounts.critical || 0} | 
              High: {alertCounts.high || 0} | 
              Medium: {alertCounts.medium || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
