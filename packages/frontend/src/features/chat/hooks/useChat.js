import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, setInputMessage, clearMessages } from '../chatSlice';
import { useSocket } from '../api';

// Custom hook for chat functionality
export const useChat = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  
  // Get chat state from Redux store
  const { 
    messages, 
    currentUser, 
    isConnected, 
    isLoading, 
    error, 
    inputMessage, 
    activeRoom 
  } = useSelector((state) => state.chat);

  // Chat actions
  const handleSendMessage = (message) => {
    if (message && message.trim()) {
      dispatch(sendMessage(message));
    }
  };

  const handleInputChange = (value) => {
    dispatch(setInputMessage(value));
  };

  const handleClearMessages = () => {
    dispatch(clearMessages());
  };

  const handleJoinRoom = (roomId) => {
    socket.joinRoom(roomId);
  };

  const handleLeaveRoom = (roomId) => {
    socket.leaveRoom(roomId);
  };

  // Direct socket access methods (for components that need them)
  const sendDirectMessage = (message) => {
    return socket.sendMessage(message);
  };

  const emitCustomEvent = (event, data) => {
    socket.emit(event, data);
  };

  const listenToCustomEvent = (event, callback) => {
    socket.on(event, callback);
    
    // Return cleanup function
    return () => socket.off(event, callback);
  };

  return {
    // State
    messages,
    currentUser,
    isConnected,
    isLoading,
    error,
    inputMessage,
    activeRoom,
    
    // Actions
    sendMessage: handleSendMessage,
    setInputMessage: handleInputChange,
    clearMessages: handleClearMessages,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    
    // Direct socket access
    sendDirectMessage,
    emitCustomEvent,
    listenToCustomEvent,
    
    // Socket instance (for advanced use cases)
    socket: socket.socket,
    
    // Connection status
    connectionStatus: {
      isConnected,
      lastPong: socket.lastPong
    }
  };
};

export default useChat;
