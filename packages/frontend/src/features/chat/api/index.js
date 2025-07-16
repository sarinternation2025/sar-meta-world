// Chat API - service layer (socket helpers)
// Export all chat-related API functions and socket helpers

// Socket service exports
export { socket, sendMessage, joinRoom, leaveRoom, connect, disconnect, isConnected } from './socket';

// Socket context exports
export { SocketProvider, useSocket, withSocket } from './SocketContext';

// Default export
export { default as socket } from './socket';
