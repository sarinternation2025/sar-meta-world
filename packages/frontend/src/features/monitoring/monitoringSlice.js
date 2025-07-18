import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { config } from '../../config';

// Async thunks for API calls
export const fetchSystemMetrics = createAsyncThunk(
  'monitoring/fetchSystemMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${config.API_URL}/api/monitoring/metrics`);
      if (!response.ok) {
        throw new Error('Failed to fetch system metrics');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchServiceStatus = createAsyncThunk(
  'monitoring/fetchServiceStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${config.API_URL}/api/monitoring/services`);
      if (!response.ok) {
        throw new Error('Failed to fetch service status');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLogs = createAsyncThunk(
  'monitoring/fetchLogs',
  async ({ level = 'info', limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${config.API_URL}/api/monitoring/logs?level=${level}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAlerts = createAsyncThunk(
  'monitoring/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${config.API_URL}/api/monitoring/alerts`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateConfig = createAsyncThunk(
  'monitoring/updateConfig',
  async (configData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${config.API_URL}/api/monitoring/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: configData }),
      });
      if (!response.ok) {
        throw new Error('Failed to update configuration');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  metrics: null,
  services: {},
  logs: [],
  alerts: [],
  config: {
    monitoring: {
      refreshInterval: 5000,
      autoRefresh: true,
      alertThresholds: {
        cpu: 80,
        memory: 85,
        disk: 90
      }
    }
  },
  isLoading: false,
  error: null,
  lastUpdated: null,
  connectionStatus: 'disconnected'
};

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    addAlert: (state, action) => {
      state.alerts.push(action.payload);
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
    updateMetricsRealtime: (state, action) => {
      state.metrics = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    updateServicesRealtime: (state, action) => {
      state.services = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch System Metrics
      .addCase(fetchSystemMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchSystemMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Service Status
      .addCase(fetchServiceStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(fetchServiceStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Logs
      .addCase(fetchLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Config
      .addCase(updateConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.config = action.payload;
      })
      .addCase(updateConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setConnectionStatus,
  addAlert,
  removeAlert,
  clearAlerts,
  updateMetricsRealtime,
  updateServicesRealtime
} = monitoringSlice.actions;

export default monitoringSlice.reducer;
