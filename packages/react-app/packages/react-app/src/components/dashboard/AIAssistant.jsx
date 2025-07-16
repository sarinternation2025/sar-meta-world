import React, { useState, useEffect } from 'react';

const AIAssistant = ({ isActive = true, status = 'analyzing' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Quantum systems optimized', type: 'info', time: '2s ago' },
    { id: 2, text: 'Neural network recalibrating', type: 'warning', time: '5s ago' },
    { id: 3, text: 'Security protocols updated', type: 'success', time: '10s ago' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newMessage = {
        id: Date.now(),
        text: `System check ${Math.floor(Math.random() * 1000)} completed`,
        type: ['info', 'warning', 'success'][Math.floor(Math.random() * 3)],
        time: 'now'
      };
      setMessages(prev => [newMessage, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzing': return 'text-cyan-400';
      case 'processing': return 'text-yellow-400';
      case 'ready': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'info': return 'text-cyan-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl transition-all duration-300 ${
        isExpanded ? 'w-80 h-96' : 'w-16 h-16'
      }`}>
        {!isExpanded ? (
          // Collapsed state
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full h-full flex items-center justify-center relative group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center animate-pulse">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </button>
        ) : (
          // Expanded state
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-cyan-400 text-sm font-bold">AI Assistant</h3>
                  <div className={`text-xs ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map(message => (
                <div key={message.id} className="bg-black/30 rounded-lg p-3 border border-cyan-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-xs ${getMessageColor(message.type)}`}>
                        {message.text}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">{message.time}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      message.type === 'success' ? 'bg-green-400' :
                      message.type === 'warning' ? 'bg-yellow-400' : 'bg-cyan-400'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex space-x-2">
                <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 rounded-lg text-white text-xs font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200">
                  Optimize
                </button>
                <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 px-3 py-2 rounded-lg text-white text-xs font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200">
                  Analyze
                </button>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 text-xs font-bold">QUANTUM AI</div>
                <div className="text-gray-400 text-xs">Always Learning</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant; 