import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cpu: 0,
  memory: 0,
  disk: 0,
};

export const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    updateMetrics: (state, action) => {
      state.cpu = action.payload.cpu;
      state.memory = action.payload.memory;
      state.disk = action.payload.disk;
    },
  },
});

export const { updateMetrics } = metricsSlice.actions;

export default metricsSlice.reducer;

