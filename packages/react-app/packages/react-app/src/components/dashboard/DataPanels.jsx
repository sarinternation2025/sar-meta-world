import React, { useState, useEffect } from 'react';

const DataPanels = () => {
  const [metrics, setMetrics] = useState({
    activeUsers: 2847,
    systemUptime: 98.7,
    dataProcessed: 3.2,
    alertsHandled: 1247,
    responseTime: 45,
    throughput: 2.4
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeUsers: Math.max(2000, Math.min(3500, prev.activeUsers + (Math.random() - 0.5) * 50)),
        systemUptime: Math.max(95, Math.min(99.9, prev.systemUptime + (Math.random() - 0.5) * 0.5)),
        dataProcessed: Math.max(2.5, Math.min(4.0, prev.dataProcessed + (Math.random() - 0.5) * 0.2)),
        alertsHandled: Math.max(1000, Math.min(1500, prev.alertsHandled + (Math.random() - 0.5) * 20)),
        responseTime: Math.max(30, Math.min(60, prev.responseTime + (Math.random() - 0.5) * 5)),
        throughput: Math.max(2.0, Math.min(3.0, prev.throughput + (Math.random() - 0.5) * 0.3))
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const renderMetricCard = (title, value, unit, icon, color, trend) => (
    <div className={`bg-gradient-to-br from-${color}-500/20 to-${color === 'blue' ? 'cyan' : color === 'green' ? 'emerald' : color === 'purple' ? 'pink' : color === 'orange' ? 'red' : 'blue'}-600/20 border border-${color}-500/30 rounded-xl p-4 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br from-${color}-400 to-${color === 'blue' ? 'cyan' : color === 'green' ? 'emerald' : color === 'purple' ? 'pink' : color === 'orange' ? 'red' : 'blue'}-500 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <div className="text-right">
          <span className={`text-${color}-400 text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        </div>
      </div>
      <h3 className={`text-2xl font-bold text-${color}-400 mb-1`}>
        {typeof value === 'number' && value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </h3>
      <p className={`text-${color}-300 text-sm`}>{title}</p>
    </div>
  );

  const renderPerformanceChart = () => (
    <div className="bg-black/30 border border-cyan-500/20 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-cyan-300 mb-4">Performance Trends</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Response Time</span>
          <span className="text-cyan-400 font-medium">{metrics.responseTime}ms</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (metrics.responseTime / 100) * 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Throughput</span>
          <span className="text-purple-400 font-medium">{metrics.throughput.toFixed(1)}GB/s</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (metrics.throughput / 5) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderAlertPanel = () => (
    <div className="bg-black/30 border border-orange-500/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-orange-300">Recent Alerts</h3>
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
      </div>
      <div className="space-y-3">
        <div className="flex items-start space-x-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-orange-300 text-sm font-medium">High CPU Usage</p>
            <p className="text-orange-400 text-xs">Server 3 - 2 minutes ago</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-yellow-300 text-sm font-medium">Memory Warning</p>
            <p className="text-yellow-400 text-xs">Database 1 - 5 minutes ago</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-green-300 text-sm font-medium">Backup Complete</p>
            <p className="text-green-400 text-xs">System backup - 10 minutes ago</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="bg-black/30 border border-green-500/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-300">System Health</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">OPTIMAL</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{metrics.systemUptime.toFixed(1)}%</div>
          <div className="text-green-300 text-xs">Uptime</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{metrics.alertsHandled}</div>
          <div className="text-blue-300 text-xs">Alerts</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {renderMetricCard(
          'Active Users',
          Math.round(metrics.activeUsers),
          null,
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>,
          'blue',
          12.5
        )}
        
        {renderMetricCard(
          'System Uptime',
          metrics.systemUptime.toFixed(1),
          '%',
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>,
          'green',
          8.3
        )}
        
        {renderMetricCard(
          'Data Processed',
          metrics.dataProcessed.toFixed(1),
          'TB',
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>,
          'purple',
          15.2
        )}
        
        {renderMetricCard(
          'Alerts Handled',
          Math.round(metrics.alertsHandled),
          null,
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>,
          'orange',
          5.8
        )}
      </div>

      {/* Performance Chart */}
      {renderPerformanceChart()}

      {/* System Health */}
      {renderSystemHealth()}

      {/* Alerts Panel */}
      {renderAlertPanel()}
    </div>
  );
};

export default DataPanels;
