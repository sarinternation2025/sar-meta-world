import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    updateAlerts: (state, action) => {
      return action.payload;
    },
  },
});

export const { updateAlerts } = alertsSlice.actions;

export default alertsSlice.reducer;

