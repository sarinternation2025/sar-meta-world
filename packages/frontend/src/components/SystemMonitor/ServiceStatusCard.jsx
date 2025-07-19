import React from 'react';

const ServiceStatusCard = ({ name, status, uptime, port, lastCheck, responseTime, version }) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      online: {
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        dot: 'bg-green-500',
        icon: '🟢'
      },
      offline: {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        dot: 'bg-red-500',
        icon: '🔴'
      },
      warning: {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
        icon: '🟡'
      },
      maintenance: {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        icon: '🔵'
      },
      unknown: {
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        dot: 'bg-gray-500',
        icon: '⚪'
      }
    };
    return statusMap[status] || statusMap.unknown;
  };

  const formatUptime = (uptimeSeconds) => {
    if (!uptimeSeconds) return 'N/A';
    
    const seconds = parseInt(uptimeSeconds);
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatServiceName = (name) => {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className={`${statusConfig.bg} ${statusConfig.border} border rounded-lg p-3 transition-all duration-200 hover:shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{statusConfig.icon}</span>
          <h4 className="font-medium text-gray-800 text-sm">
            {formatServiceName(name)}
          </h4>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} font-medium`}>
          {status.toUpperCase()}
        </div>
      </div>

      {/* Service Details */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Port:</span>
          <span className="text-xs font-mono text-gray-700">{port || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Uptime:</span>
          <span className="text-xs text-gray-700">{formatUptime(uptime)}</span>
        </div>

        {responseTime && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Response:</span>
            <span className={`text-xs ${responseTime < 100 ? 'text-green-600' : 
              responseTime < 500 ? 'text-yellow-600' : 'text-red-600'}`}>
              {responseTime}ms
            </span>
          </div>
        )}

        {version && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Version:</span>
            <span className="text-xs font-mono text-gray-700">{version}</span>
          </div>
        )}

        {lastCheck && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Last Check:</span>
            <span className="text-xs text-gray-700">
              {new Date(lastCheck).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center mt-3 pt-2 border-t border-gray-100">
        <div className={`w-2 h-2 rounded-full ${statusConfig.dot} mr-2 animate-pulse`} />
        <span className={`text-xs ${statusConfig.color}`}>
          {status === 'online' && 'Service is running normally'}
          {status === 'offline' && 'Service is not responding'}
          {status === 'warning' && 'Service has issues'}
          {status === 'maintenance' && 'Service is under maintenance'}
          {status === 'unknown' && 'Service status unknown'}
        </span>
      </div>

      {/* Actions */}
      {status === 'offline' && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
            Restart Service
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceStatusCard;
