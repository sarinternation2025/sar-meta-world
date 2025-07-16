import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, isOpen }) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Quantum Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'System overview and metrics'
    },
    {
      id: 'chat',
      label: 'AI Communication',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      description: 'AI assistant and chat interface'
    },
    {
      id: 'analytics',
      label: 'Quantum Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Advanced data analytics'
    },
    {
      id: 'admin',
      label: 'Admin Controls',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'System administration'
    },
    {
      id: 'settings',
      label: 'Quantum Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'System configuration'
    }
  ];

  return (
    <div className={`${isOpen ? 'w-64' : 'w-16'} bg-black/40 backdrop-blur-xl border-r border-cyan-500/30 transition-all duration-300 ease-in-out h-full relative overflow-hidden group`}>
      {/* Holographic Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-30"></div>
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Logo Section */}
        <div className="p-4 border-b border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {isOpen && (
              <div>
                <h2 className="text-cyan-400 font-bold text-lg">SAR-META</h2>
                <p className="text-gray-400 text-xs">Quantum World</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group relative overflow-hidden rounded-xl p-3 transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/50 text-cyan-400'
                  : 'bg-black/20 border border-transparent hover:bg-black/30 hover:border-cyan-400/30 text-gray-300 hover:text-cyan-300'
              }`}
            >
              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                activeTab === item.id ? 'opacity-100' : ''
              }`}></div>
              
              <div className="relative z-10 flex items-center space-x-3">
                <div className={`flex-shrink-0 transition-all duration-300 ${
                  activeTab === item.id ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-300'
                }`}>
                  {item.icon}
                </div>
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium transition-all duration-300 ${
                      activeTab === item.id ? 'text-cyan-400' : 'text-gray-300 group-hover:text-cyan-300'
                    }`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                      {item.description}
                    </div>
                  </div>
                )}
                {activeTab === item.id && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-cyan-500/20">
          {isOpen ? (
            <div className="space-y-3">
              <div className="bg-black/20 rounded-lg p-3 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">System Status</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-green-400 text-xs font-medium">OPERATIONAL</div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-3 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Quantum Core</span>
                  <span className="text-cyan-400 text-xs font-medium">98.7%</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-1">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1 rounded-full" style={{ width: '98.7%' }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
