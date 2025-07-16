// Chat feature - self-contained business domain
// Export all chat-related modules

// Export components
export * from './components';

// Export API (socket service and context)
export * from './api';

// Export hooks
export * from './hooks';

// Export Redux slice
export { default as chatSlice } from './chatSlice';

// Export actions for direct use
export { 
  addMessage, 
  setCurrentUser, 
  setConnectionStatus, 
  setInputMessage, 
  clearMessages, 
  setError, 
  clearError,
  setActiveRoom,
  sendMessage
} from './chatSlice';
