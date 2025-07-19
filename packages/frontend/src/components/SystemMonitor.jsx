import React, { useState, useEffect } from 'react';

const SystemMonitor = () => {
  const [metrics, setMetrics] = useState({
    cpu: 65,
    memory: 72,
    disk: 45,
    network: 88,
    activeUsers: 127,
    uptime: '7d 14h 23m'
  });

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(20, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 8)),
        network: Math.max(10, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
        activeUsers: Math.max(50, Math.min(200, prev.activeUsers + Math.floor((Math.random() - 0.5) * 10)))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value) => {
    if (value < 50) return 'text-green-500';
    if (value < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (value) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const MetricCard = ({ title, value, unit = '%', icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="mb-2">
        <div className={`text-2xl font-bold ${getStatusColor(value)}`}>
          {typeof value === 'number' ? `${Math.round(value)}${unit}` : value}
        </div>
      </div>
      {typeof value === 'number' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(value)}`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="my-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🖥️ System Monitor</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'System Online' : 'System Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard title="CPU Usage" value={metrics.cpu} icon="⚡" />
        <MetricCard title="Memory" value={metrics.memory} icon="🧠" />
        <MetricCard title="Disk Usage" value={metrics.disk} icon="💾" />
        <MetricCard title="Network" value={metrics.network} icon="🌐" />
        <MetricCard title="Active Users" value={metrics.activeUsers} unit="" icon="👥" />
        <MetricCard title="Uptime" value={metrics.uptime} unit="" icon="⏱️" />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">🔍 Recent Activity</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span className="text-green-700">✅ Database connection established</span>
            <span className="text-green-600 text-xs">2 min ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
            <span className="text-blue-700">🔄 Background sync completed</span>
            <span className="text-blue-600 text-xs">5 min ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
            <span className="text-yellow-700">⚠️ High memory usage detected</span>
            <span className="text-yellow-600 text-xs">12 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
