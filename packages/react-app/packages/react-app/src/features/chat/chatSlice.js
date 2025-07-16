// Chat Redux slice - state management for chat feature
// This file contains the Redux slice for chat functionality

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  currentUser: null,
  isConnected: false,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Add your reducers here
    // Example:
    // addMessage: (state, action) => {
    //   state.messages.push(action.payload);
    // },
    // setCurrentUser: (state, action) => {
    //   state.currentUser = action.payload;
    // },
    // setConnectionStatus: (state, action) => {
    //   state.isConnected = action.payload;
    // },
  },
});

// Export actions
// export const { addMessage, setCurrentUser, setConnectionStatus } = chatSlice.actions;

// Export the reducer
export default chatSlice.reducer;
