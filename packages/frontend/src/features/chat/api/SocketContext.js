import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { socket, setupSocketEventHandlersWithActions } from './socket';
import { 
  setConnectionStatus, 
  setError, 
  addMessage 
} from '../chatSlice';

// Create the Socket Context
const SocketContext = createContext();

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Socket Context Provider Component
export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);

  useEffect(() => {
    // Setup socket event handlers with Redux dispatch and actions
    setupSocketEventHandlersWithActions(dispatch, {
      setConnectionStatus,
      setError,
      addMessage
    });

    // Additional connection status tracking
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onPong = () => setLastPong(new Date());

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('pong', onPong);

    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Cleanup function
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('pong', onPong);
    };
  }, [dispatch]);

  // Context value
  const value = {
    socket,
    isConnected,
    lastPong,
    
    // Socket utility methods
    emit: (event, ...args) => socket.emit(event, ...args),
    on: (event, callback) => socket.on(event, callback),
    off: (event, callback) => socket.off(event, callback),
    
    // Connection management
    connect: () => socket.connect(),
    disconnect: () => socket.disconnect(),
    
    // Convenience methods
    sendMessage: (message) => {
      if (socket.connected && message.trim()) {
        socket.emit('message', message);
        return true;
      }
      return false;
    },
    
    joinRoom: (roomId) => {
      if (socket.connected) {
        socket.emit('join_room', roomId);
      }
    },
    
    leaveRoom: (roomId) => {
      if (socket.connected) {
        socket.emit('leave_room', roomId);
      }
    },
    
    // Health check
    ping: () => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Higher-order component for wrapping components that need socket access
// eslint-disable-next-line no-unused-vars
export const withSocket = (WrappedComponent) => {
  return (props) => {
    const socketContext = useSocket();
    return <WrappedComponent {...props} socket={socketContext} />;
  };
};

export default SocketContext;
