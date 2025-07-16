import React, { useState, useEffect } from 'react';

const TopBar = ({ sidebarOpen, setSidebarOpen }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', message: 'System backup completed', time: '2m ago' },
    { id: 2, type: 'warning', message: 'High memory usage detected', time: '5m ago' },
    { id: 3, type: 'success', message: 'Security update installed', time: '10m ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getNotificationColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'error': return 'bg-red-500/20 border-red-400/30';
      case 'warning': return 'bg-yellow-500/20 border-yellow-400/30';
      case 'success': return 'bg-green-500/20 border-green-400/30';
      default: return 'bg-blue-500/20 border-blue-400/30';
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border-b border-cyan-500/30 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-black/20 border border-cyan-500/30 hover:bg-black/30 hover:border-cyan-400/50 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">SYSTEM ONLINE</span>
            </div>
            <div className="text-gray-400 text-sm">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-gray-400 text-sm">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex-1 flex justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-cyan-400">SAR-META-WORLD</h1>
            <p className="text-xs text-gray-400">Quantum Operations Center</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <button className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-lg text-green-400 text-xs font-medium hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-200">
              Quick Backup
            </button>
            <button className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-400/30 rounded-lg text-purple-400 text-xs font-medium hover:from-purple-500/30 hover:to-pink-600/30 transition-all duration-200">
              Emergency Mode
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-black/20 border border-cyan-500/30 hover:bg-black/30 hover:border-cyan-400/50 transition-all duration-200 group"
            >
              <svg className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4H20c1.1 0 2-.9 2-2s-.9-2-2-2H4.19C4.08 1.38 3.78 1 3.37 1H1C.45 1 0 1.45 0 2s.45 1 1 1h2.37c.41 0 .71-.38.82-.77zM20 15H4.19c-.41 0-.71.38-.82.77L3 17h17c1.1 0 2-.9 2-2s-.9-2-2-2z" />
              </svg>
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{notifications.length}</span>
                </div>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-cyan-400 font-semibold">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map(notification => (
                      <div key={notification.id} className={`p-3 rounded-lg border ${getNotificationBg(notification.type)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm ${getNotificationColor(notification.type)}`}>
                              {notification.message}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            notification.type === 'error' ? 'bg-red-400' :
                            notification.type === 'warning' ? 'bg-yellow-400' :
                            notification.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-cyan-400 text-sm font-medium">Admin User</div>
              <div className="text-gray-400 text-xs">Quantum Administrator</div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

