import { io } from 'socket.io-client';

// Create and export the socket instance with websocket transport
export const socket = io(import.meta.env.VITE_SOCKET_URL, { 
  transports: ['websocket'] 
});

// Socket event handlers that can be used by the Redux slice
export const setupSocketEventHandlers = (dispatch) => {
  // Import actions from chatSlice to dispatch on socket events
  // We'll pass the actions as a parameter to avoid circular imports
  
  // Connection events
  socket.on('connect', () => {
    console.log('Connected to server');
    // Dispatch will be handled by the caller with the appropriate action
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    // Dispatch will be handled by the caller with the appropriate action
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    // Dispatch will be handled by the caller with the appropriate action
  });

  // Message events
  socket.on('message', (message) => {
    // Dispatch will be handled by the caller with the appropriate action
  });

  socket.on('user_joined', (user) => {
    // Dispatch will be handled by the caller with the appropriate action
  });

  socket.on('user_left', (user) => {
    // Dispatch will be handled by the caller with the appropriate action
  });

  // Error events
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    // Dispatch will be handled by the caller with the appropriate action
  });
};

// Specific event handler setup that takes actions as parameters
export const setupSocketEventHandlersWithActions = (dispatch, actions) => {
  const { setConnectionStatus, setError, addMessage } = actions;
  
  // Connection events
  socket.on('connect', () => {
    console.log('Connected to server');
    dispatch(setConnectionStatus(true));
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    dispatch(setConnectionStatus(false));
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    dispatch(setError(error.message));
  });

  // Message events
  socket.on('message', (message) => {
    dispatch(addMessage(message));
  });

  socket.on('user_joined', (user) => {
    dispatch(addMessage({
      type: 'system',
      text: `${user.name} joined the chat`,
      timestamp: new Date().toISOString(),
      id: Date.now()
    }));
  });

  socket.on('user_left', (user) => {
    dispatch(addMessage({
      type: 'system',
      text: `${user.name} left the chat`,
      timestamp: new Date().toISOString(),
      id: Date.now()
    }));
  });

  // Error events
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    dispatch(setError(error.message));
  });
};

// Socket utility functions
export const sendMessage = (message) => {
  if (socket.connected && message.trim()) {
    socket.emit('message', message);
    return true;
  }
  return false;
};

export const joinRoom = (roomId) => {
  if (socket.connected) {
    socket.emit('join_room', roomId);
  }
};

export const leaveRoom = (roomId) => {
  if (socket.connected) {
    socket.emit('leave_room', roomId);
  }
};

export const disconnect = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const connect = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

// Export connection status
export const isConnected = () => socket.connected;

// Export socket instance as default
export default socket;
