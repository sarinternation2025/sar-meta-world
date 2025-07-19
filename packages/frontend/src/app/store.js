import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '../features/chat/chatSlice';
import metricsReducer from '../features/metrics/metricsSlice';
import servicesReducer from '../features/services/servicesSlice';
import alertsReducer from '../features/alerts/alertsSlice';
import historyReducer from '../features/history/historySlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    metrics: metricsReducer,
    services: servicesReducer,
    alerts: alertsReducer,
    history: historyReducer,
  },
  // Enable Redux DevTools Extension
  devTools: import.meta.env.MODE !== 'production',
});

export default store;
