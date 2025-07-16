import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    updateHistory: (state, action) => {
      state.push(action.payload);
      if (state.length > 20) {
        state.shift();
      }
    },
  },
});

export const { updateHistory } = historySlice.actions;

export default historySlice.reducer;

