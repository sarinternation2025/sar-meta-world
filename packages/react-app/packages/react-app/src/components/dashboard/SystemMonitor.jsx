import React, { useState, useEffect } from 'react';

const SystemMonitor = () => {
  const [backupStatus, setBackupStatus] = useState({
    lastBackup: null,
    status: 'unknown',
    nextScheduled: null
  });
  const [backupHistory, setBackupHistory] = useState([]);
  const [diskUsage, setDiskUsage] = useState(0);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchBackupStatus = async () => {
      try {
        const res = await fetch('/api/backup/status');
        const data = await res.json();
        if (data.success) {
          setBackupStatus({
            lastBackup: data.lastBackup,
            status: data.status,
            nextScheduled: data.nextScheduled
          });
        }
      } catch (e) {
        setBackupStatus({ lastBackup: null, status: 'error', nextScheduled: null });
      }
    };
    fetchBackupStatus();
    const interval = setInterval(fetchBackupStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchBackupHistory = async () => {
      try {
        const res = await fetch('/api/backup/history');
        const data = await res.json();
        if (data.success) setBackupHistory(data.history);
      } catch {}
    };
    fetchBackupHistory();
    const interval = setInterval(fetchBackupHistory, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDiskUsage = async () => {
      try {
        const res = await fetch('/api/backup/disk-usage');
        const data = await res.json();
        if (data.success) setDiskUsage(data.usage);
      } catch {}
    };
    fetchDiskUsage();
    const interval = setInterval(fetchDiskUsage, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Health/alert logic
    if (!backupStatus.lastBackup) {
      setAlert({ type: 'error', message: 'No backups found! Immediate action required.' });
    } else {
      const last = new Date(backupStatus.lastBackup);
      const now = new Date();
      const hours = (now - last) / (1000 * 60 * 60);
      if (hours > 24) {
        setAlert({ type: 'warning', message: `Last backup was over ${Math.floor(hours)} hours ago.` });
      } else {
        setAlert(null);
      }
    }
  }, [backupStatus]);

  const systems = [
    { name: 'Database', status: 'online', health: 98, uptime: '15d 8h 32m' },
    { name: 'Web Server', status: 'online', health: 95, uptime: '12d 4h 15m' },
    { name: 'Cache Layer', status: 'online', health: 99, uptime: '8d 16h 42m' },
    { name: 'Message Queue', status: 'online', health: 97, uptime: '20d 2h 8m' },
    { name: 'File Storage', status: 'online', health: 96, uptime: '25d 11h 33m' },
    { name: 'Backup System', status: backupStatus.status === 'success' ? 'online' : 'warning', health: backupStatus.status === 'success' ? 100 : 85, uptime: '3d 7h 19m' },
  ];

  const getHealthColor = (health) => {
    if (health >= 95) return 'text-green-400';
    if (health >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            System Monitor
          </span>
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Live</span>
        </div>
      </div>

      {/* Backup Health/Alert Banner */}
      {alert && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-semibold ${
          alert.type === 'error' ? 'bg-red-900/30 border border-red-500/30 text-red-300' :
          alert.type === 'warning' ? 'bg-yellow-900/30 border border-yellow-500/30 text-yellow-300' :
          'bg-green-900/30 border border-green-500/30 text-green-300'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Backup Status */}
      <div className="mb-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Backup Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-1">💾</div>
            <div className="text-xs text-gray-400">Last Backup</div>
            <div className="text-sm font-semibold text-white">
              {backupStatus.lastBackup ? new Date(backupStatus.lastBackup).toLocaleString() : 'Never'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xs text-gray-400">Status</div>
            <div className={`text-sm font-semibold ${backupStatus.status === 'success' ? 'text-green-400' : 'text-yellow-400'}`}>
              {backupStatus.status === 'success' ? '✅ Success' : backupStatus.status === 'none' ? 'No backups' : backupStatus.status === 'error' ? '❌ Error' : '⚠️ Pending'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⏰</div>
            <div className="text-xs text-gray-400">Next Scheduled</div>
            <div className="text-sm font-semibold text-white">
              {backupStatus.nextScheduled ? backupStatus.nextScheduled : 'Not set'}
            </div>
          </div>
        </div>
        {/* Disk Usage & Retention */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-slate-400">
          <div>Stored backups: <span className="font-bold text-white">{backupHistory.length}</span></div>
          <div>Total disk usage: <span className="font-bold text-white">{formatSize(diskUsage)}</span></div>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="mb-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Backup History</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-slate-200">
            <thead>
              <tr className="bg-slate-900/60">
                <th className="px-2 py-1 text-left">Filename</th>
                <th className="px-2 py-1 text-left">Date</th>
                <th className="px-2 py-1 text-right">Size</th>
              </tr>
            </thead>
            <tbody>
              {backupHistory.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-2 text-slate-400">No backups found.</td></tr>
              ) : (
                backupHistory.map(b => (
                  <tr key={b.filename} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="px-2 py-1 font-mono break-all">{b.filename}</td>
                    <td className="px-2 py-1">{new Date(b.date).toLocaleString()}</td>
                    <td className="px-2 py-1 text-right">{formatSize(b.size)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systems.map((system, index) => (
          <div
            key={index}
            className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4 hover:border-slate-600/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">{system.name}</h4>
              <div className={`w-2 h-2 rounded-full ${
                system.status === 'online' ? 'bg-green-400' : 
                system.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Health</span>
                <span className={`font-semibold ${getHealthColor(system.health)}`}>
                  {system.health}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    system.health >= 95 ? 'bg-green-500' :
                    system.health >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${system.health}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Uptime</span>
                <span className="text-white font-mono">{system.uptime}</span>
              </div>
            </div>

            <div className="flex space-x-2 mt-3">
              <button className="flex-1 bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded px-3 py-1 text-xs text-blue-300 hover:from-blue-600/30 hover:to-blue-700/30 transition-all">
                Monitor
              </button>
              <button className="flex-1 bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded px-3 py-1 text-xs text-purple-300 hover:from-purple-600/30 hover:to-purple-700/30 transition-all">
                Control
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* System Alerts */}
      <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Recent Alerts</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">All systems operational</span>
            <span className="text-gray-500 text-xs">2m ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">Backup completed successfully</span>
            <span className="text-gray-500 text-xs">5m ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-300">Security scan completed</span>
            <span className="text-gray-500 text-xs">8m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor; 