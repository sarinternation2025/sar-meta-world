import React, { useState, useEffect } from 'react';
import { useChat } from '../hooks';
import { useSocket } from '../api';

// Example component showing how to use the new socket service layer
const ChatExample = () => {
  const [customMessage, setCustomMessage] = useState('');
  
  // Using the useChat hook (recommended approach)
  const {
    messages,
    inputMessage,
    isConnected,
    isLoading,
    error,
    sendMessage,
    setInputMessage,
    clearMessages,
    connectionStatus
  } = useChat();

  // Using the useSocket hook for direct socket access (when needed)
  const socket = useSocket();

  // Example of listening to custom events
  useEffect(() => {
    const handleCustomEvent = (data) => {
      console.log('Custom event received:', data);
    };

    // Listen to custom events
    socket.on('custom_event', handleCustomEvent);

    // Cleanup
    return () => {
      socket.off('custom_event', handleCustomEvent);
    };
  }, [socket]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
    }
  };

  // Handle custom message emission
  const handleCustomMessage = () => {
    if (customMessage.trim()) {
      socket.emit('custom_event', { 
        message: customMessage, 
        timestamp: new Date().toISOString() 
      });
      setCustomMessage('');
    }
  };

  return (
    <div className="flex flex-col h-96 max-w-md mx-auto border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-lg font-semibold">Chat Example</h2>
        <div className="text-sm">
          Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          {connectionStatus.lastPong && (
            <span className="ml-2">
              Last ping: {connectionStatus.lastPong.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2">
          Error: {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`p-2 rounded ${
              message.sender === 'me'
                ? 'bg-blue-100 ml-auto max-w-xs'
                : message.type === 'system'
                ? 'bg-gray-100 text-gray-600 text-sm text-center'
                : 'bg-gray-100 max-w-xs'
            }`}
          >
            {message.type === 'system' ? (
              <span>{message.text}</span>
            ) : (
              <>
                <div className="text-xs text-gray-500 mb-1">
                  {message.sender} • {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                <div>{message.text}</div>
              </>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="text-center text-gray-500">
            <div className="animate-pulse">Sending...</div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isConnected || isLoading}
          />
          <button
            type="submit"
            disabled={!isConnected || isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>

      {/* Custom Event Example */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-sm text-gray-600 mb-2">Custom Event Example:</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Custom message..."
            className="flex-1 px-2 py-1 border rounded text-sm"
          />
          <button
            onClick={handleCustomMessage}
            disabled={!isConnected || !customMessage.trim()}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            Emit
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={clearMessages}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Clear Messages
          </button>
          <button
            onClick={() => socket.ping()}
            disabled={!isConnected}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            Ping
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatExample;
