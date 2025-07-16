import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

export const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    updateServices: (state, action) => {
      return action.payload;
    },
  },
});

export const { updateServices } = servicesSlice.actions;

export default servicesSlice.reducer;

