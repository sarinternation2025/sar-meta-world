import React, { useState } from 'react';

const AdminControls = () => {
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');

  const triggerBackup = async (mode) => {
    setBackupLoading(true);
    setBackupMessage('');
    
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBackupMessage(`✅ ${mode} backup completed successfully!`);
      } else {
        setBackupMessage(`❌ Backup failed: ${result.message}`);
      }
    } catch (error) {
      setBackupMessage(`❌ Backup error: ${error.message}`);
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Admin Controls
        </span>
      </h3>
      
      {/* Backup Controls */}
      <div className="space-y-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Database Backup</h4>
          <div className="flex gap-3">
            <button
              onClick={() => triggerBackup('local')}
              disabled={backupLoading}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {backupLoading ? '🔄 Processing...' : '💾 Local Backup'}
            </button>
            <button
              onClick={() => triggerBackup('cloud')}
              disabled={backupLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {backupLoading ? '🔄 Processing...' : '☁️ Cloud Backup'}
            </button>
          </div>
          {backupMessage && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              backupMessage.includes('✅') 
                ? 'bg-green-900/30 border border-green-500/30 text-green-300' 
                : 'bg-red-900/30 border border-red-500/30 text-red-300'
            }`}>
              {backupMessage}
            </div>
          )}
        </div>

        {/* System Controls */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">System Controls</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              🔄 Restart Services
            </button>
            <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              🛑 Emergency Stop
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              ⚙️ System Config
            </button>
            <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              📊 Performance
            </button>
          </div>
        </div>

        {/* Security Controls */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Security Controls</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              🔒 Lock System
            </button>
            <button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              🚨 Alert Mode
            </button>
            <button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              🛡️ Firewall
            </button>
            <button className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              🔐 Access Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminControls;
