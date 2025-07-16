# Chat Feature - Socket.IO Service Layer

This document explains how to use the new Socket.IO service layer and context for the chat feature.

## Overview

The Socket.IO implementation has been abstracted into a service layer with the following components:

1. **Socket Service** (`api/socket.js`) - Encapsulates connection logic and utility functions
2. **Socket Context** (`api/SocketContext.js`) - Provides React context for socket access
3. **Chat Hook** (`hooks/useChat.js`) - Custom hook combining Redux and socket functionality
4. **Updated Redux Slice** (`chatSlice.js`) - Simplified to focus on state management

## Socket Service (`api/socket.js`)

The main socket instance is created and configured:

```js
export const socket = io(import.meta.env.VITE_SOCKET_URL, { 
  transports: ['websocket'] 
});
```

### Available Functions

- `sendMessage(message)` - Send a message through the socket
- `joinRoom(roomId)` - Join a chat room
- `leaveRoom(roomId)` - Leave a chat room
- `connect()` - Connect to the socket server
- `disconnect()` - Disconnect from the socket server
- `isConnected()` - Check connection status

## Socket Context (`api/SocketContext.js`)

Provides a React context for components that need direct socket access.

### Usage

1. **Wrap your app with SocketProvider:**

```jsx
import { SocketProvider } from './features/chat/api';

function App() {
  return (
    <SocketProvider>
      <YourAppComponents />
    </SocketProvider>
  );
}
```

2. **Use the useSocket hook in components:**

```jsx
import { useSocket } from './features/chat/api';

function MyComponent() {
  const socket = useSocket();
  
  // Direct socket access
  const handleCustomEvent = () => {
    socket.emit('custom_event', { data: 'example' });
  };
  
  return <button onClick={handleCustomEvent}>Send Custom Event</button>;
}
```

## Chat Hook (`hooks/useChat.js`)

The recommended way to interact with chat functionality. Combines Redux state management with socket operations.

### Usage

```jsx
import { useChat } from './features/chat/hooks';

function ChatComponent() {
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
    }
  };
  
  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {/* Message display */}
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg.text}</div>
        ))}
      </div>
      {/* Input form */}
      <form onSubmit={handleSubmit}>
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!isConnected || isLoading}
        />
        <button type="submit" disabled={!isConnected || isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
```

## Redux Integration

The socket service integrates with Redux by dispatching actions from socket event callbacks:

```js
// Socket events automatically dispatch Redux actions
socket.on('message', (message) => {
  dispatch(addMessage(message));
});

socket.on('connect', () => {
  dispatch(setConnectionStatus(true));
});

socket.on('disconnect', () => {
  dispatch(setConnectionStatus(false));
});
```

## Environment Configuration

Make sure to set the socket URL in your environment variables:

```env
VITE_SOCKET_URL=ws://localhost:3001
```

## Migration from Old Implementation

If you're migrating from the old implementation:

1. **Remove direct socket.io-client imports** from components
2. **Use the useChat hook** instead of directly accessing Redux state
3. **Wrap your app with SocketProvider** 
4. **Use the socket service functions** instead of managing socket connection in Redux

## Examples

See `components/ChatExample.jsx` for a complete example demonstrating:
- Basic message sending/receiving
- Direct socket access for custom events
- Connection status monitoring
- Error handling

## Benefits

- **Separation of Concerns**: Socket logic is separated from UI components
- **Reusability**: Socket service can be used across different components
- **Testability**: Easy to mock socket functionality for testing
- **Type Safety**: Better TypeScript support (when migrating to TS)
- **Centralized Configuration**: Single place to manage socket setup
- **Redux Integration**: Automatic state updates from socket events
