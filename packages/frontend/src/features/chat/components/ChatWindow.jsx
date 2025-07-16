import React, { useRef, useEffect } from 'react';

const COLORS = {
  primary: 'bg-[#2563EB]',
  secondary: 'bg-[#10B981]',
  accent: 'bg-[#8B5CF6]',
  dark: 'bg-[#1E293B]',
  light: 'bg-[#F8FAFC]',
};

const ChatWindow = ({ messages, onSendMessage, isLoading, inputValue, onInputChange, onInputKeyDown, isConnected }) => {
  /** @type {React.MutableRefObject<HTMLDivElement|null>} */
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-h-[600px] w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-[#e2e8f0]">
      {/* SAR-U Header */}
      <div className="flex flex-col items-center justify-center py-6 border-b border-[#e2e8f0] bg-[#F8FAFC] rounded-t-2xl">
        <div className="font-mono text-2xl text-[#1E293B] leading-tight text-center select-none">
          <span className="block">╔═╗╔═╗╦═╗  ╔═╗</span>
          <span className="block">╚═╗║ ║╠╦╝  ║ ║</span>
          <span className="block">╚═╝╚═╝╩╚═  ╚═╝</span>
        </div>
        <div className="mt-2 text-[#10B981] font-semibold text-lg tracking-wide">SAR-U</div>
        <div className="text-xs text-[#64748b] mt-1">Smart Autonomous Resource - Unified</div>
        <div className="mt-2 flex items-center space-x-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-[#10B981]' : 'bg-red-400'}`}></span>
          <span className={`text-xs font-medium ${isConnected ? 'text-[#10B981]' : 'text-red-400'}`}>{isConnected ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#F8FAFC] font-sans">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm break-words font-medium ${
                message.isOwn
                  ? 'bg-[#2563EB] text-white rounded-br-md'
                  : 'bg-white text-[#1E293B] border border-[#e2e8f0] rounded-bl-md'
              }`}
              aria-label={message.isOwn ? 'Your message' : 'Received message'}
            >
              <span>{message.text}</span>
              <span className="block text-[10px] mt-1 opacity-60 text-right font-mono">
                {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#8B5CF6] text-white rounded-2xl px-4 py-2 animate-pulse font-mono">SAR-U is typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-[#e2e8f0] bg-white rounded-b-2xl">
        <form className="flex space-x-2" onSubmit={e => { e.preventDefault(); onSendMessage(); }}>
          <input
            type="text"
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-sans text-sm bg-[#F8FAFC]"
            aria-label="Type a message"
            disabled={!isConnected || isLoading}
            autoComplete="off"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 transition-colors disabled:opacity-60"
            disabled={!inputValue.trim() || !isConnected || isLoading}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
