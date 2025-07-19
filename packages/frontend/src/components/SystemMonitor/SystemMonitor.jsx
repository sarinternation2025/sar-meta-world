import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemMetrics, fetchServiceStatus } from '../../features/monitoring/monitoringSlice';
import MetricCard from './MetricCard';
import ServiceStatusCard from './ServiceStatusCard';
import AlertsPanel from './AlertsPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SystemMonitor = () => {
  const dispatch = useDispatch();
  const { metrics, services, alerts, isLoading, error } = useSelector(state => state.monitoring);
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshInterval, _setRefreshInterval] = useState(5000);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchSystemMetrics());
      dispatch(fetchServiceStatus());
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [dispatch, refreshInterval]);

  useEffect(() => {
    if (metrics) {
      const timestamp = new Date().toLocaleTimeString();
      setHistoricalData(prev => [...prev.slice(-19), {
        time: timestamp,
        cpu: metrics.cpu?.usage || 0,
        memory: metrics.memory?.percentage || 0,
        disk: metrics.disk?.percentage || 0
      }]);
    }
  }, [metrics]);

  const _getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="text-red-500 text-center">
          <p>Error loading system metrics</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg transition-all duration-300 ${
      isExpanded ? 'w-[90vw] h-[90vh]' : 'w-80 h-auto'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">System Monitor</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? '🗗' : '🗖'}
          </button>
          <div className={`w-3 h-3 rounded-full ${metrics ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </div>

      {/* Compact View */}
      {!isExpanded && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title="CPU"
              value={metrics?.cpu?.usage || 0}
              unit="%"
              color="blue"
              icon="🔄"
            />
            <MetricCard
              title="Memory"
              value={metrics?.memory?.percentage || 0}
              unit="%"
              color="green"
              icon="💾"
            />
            <MetricCard
              title="Disk"
              value={metrics?.disk?.percentage || 0}
              unit="%"
              color="purple"
              icon="💽"
            />
            <MetricCard
              title="Network"
              value={metrics?.network?.download || 0}
              unit="MB/s"
              color="orange"
              icon="📡"
            />
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="p-4 h-full overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {/* System Metrics */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">System Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  title="CPU Usage"
                  value={metrics?.cpu?.usage || 0}
                  unit="%"
                  color="blue"
                  icon="🔄"
                  detailed={true}
                  additional={`${metrics?.cpu?.cores || 0} cores`}
                />
                <MetricCard
                  title="Memory"
                  value={metrics?.memory?.percentage || 0}
                  unit="%"
                  color="green"
                  icon="💾"
                  detailed={true}
                  additional={`${((metrics?.memory?.used || 0) / 1024 / 1024 / 1024).toFixed(1)} GB used`}
                />
                <MetricCard
                  title="Disk Space"
                  value={metrics?.disk?.percentage || 0}
                  unit="%"
                  color="purple"
                  icon="💽"
                  detailed={true}
                  additional={`${((metrics?.disk?.used || 0) / 1024 / 1024 / 1024).toFixed(1)} GB used`}
                />
                <MetricCard
                  title="Network"
                  value={metrics?.network?.download || 0}
                  unit="MB/s"
                  color="orange"
                  icon="📡"
                  detailed={true}
                  additional={`↑${metrics?.network?.upload || 0} MB/s`}
                />
              </div>
            </div>

            {/* Service Status */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Services</h4>
              <div className="space-y-2">
                {Object.entries(services || {}).map(([name, service]) => (
                  <ServiceStatusCard
                    key={name}
                    name={name}
                    status={service.status}
                    uptime={service.uptime}
                    port={service.port}
                  />
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Alerts</h4>
              <AlertsPanel alerts={alerts} />
            </div>
          </div>

          {/* Historical Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Historical Data</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="disk" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitor;
