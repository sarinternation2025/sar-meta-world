// Chat Redux slice - state management for chat feature
// This file contains the Redux slice for chat functionality

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendMessage as socketSendMessage } from './api/socket';

const initialState = {
  messages: [],
  currentUser: null,
  isConnected: false,
  isLoading: false,
  error: null,
  inputMessage: '',
  activeRoom: null,
};

// Async thunk for sending messages using the socket service
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message, { rejectWithValue }) => {
    try {
      if (message.trim()) {
        const success = socketSendMessage(message);
        if (success) {
          return { 
            text: message, 
            sender: 'me', 
            timestamp: new Date().toISOString(),
            id: Date.now() // Simple ID generation
          };
        }
        throw new Error('Failed to send message - socket not connected');
      }
      throw new Error('Message cannot be empty');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    setInputMessage: (state, action) => {
      state.inputMessage = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push(action.payload);
        state.inputMessage = '';
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { 
  addMessage, 
  setCurrentUser, 
  setConnectionStatus, 
  setInputMessage, 
  clearMessages, 
  setError, 
  clearError,
  setActiveRoom 
} = chatSlice.actions;

// Export the reducer
export default chatSlice.reducer;
