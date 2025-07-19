// Chat API - service layer (socket helpers)
// Export all chat-related API functions and socket helpers

// Socket service exports - using named exports from socket.js
export { socket, sendMessage, joinRoom, leaveRoom, connect, disconnect, isConnected } from './socket';

// Socket context exports
export { SocketProvider, useSocket, withSocket } from './SocketContext';

// Re-export socket utility functions
export { setupSocketEventHandlers, setupSocketEventHandlersWithActions } from './socket';

// Default export - export the socket instance as default
export { socket as default } from './socket';
