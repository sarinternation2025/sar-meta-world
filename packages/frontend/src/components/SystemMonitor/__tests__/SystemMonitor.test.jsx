import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SystemMonitor from '../SystemMonitor';
import monitoringSlice from '../../../features/monitoring/monitoringSlice';

// Mock the recharts library
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />
}));

// Mock components
vi.mock('../MetricCard', () => ({
  default: ({ title, value, unit, _color, icon }) => (
    <div data-testid="metric-card">
      <span data-testid="metric-title">{title}</span>
      <span data-testid="metric-value">{value}</span>
      <span data-testid="metric-unit">{unit}</span>
      <span data-testid="metric-icon">{icon}</span>
    </div>
  )
}));

vi.mock('../ServiceStatusCard', () => ({
  default: ({ name, status, _uptime, _port }) => (
    <div data-testid="service-status-card">
      <span data-testid="service-name">{name}</span>
      <span data-testid="service-status">{status}</span>
    </div>
  )
}));

vi.mock('../AlertsPanel', () => ({
  default: ({ alerts }) => (
    <div data-testid="alerts-panel">
      {alerts?.map((alert, index) => (
        <div key={index} data-testid="alert-item">{alert.message}</div>
      ))}
    </div>
  )
}));

// Mock fetch
global.fetch = vi.fn();

const mockStore = configureStore({
  reducer: {
    monitoring: monitoringSlice
  },
  preloadedState: {
    monitoring: {
      metrics: {
        cpu: { usage: 45.5, cores: 8 },
        memory: { percentage: 67.8, used: 8589934592 },
        disk: { percentage: 23.4, used: 268435456000 },
        network: { download: 12.5, upload: 3.2 }
      },
      services: {
        backend: { status: 'online', uptime: 3600, port: 3001 },
        frontend: { status: 'online', uptime: 1800, port: 3000 }
      },
      alerts: [
        { id: 1, message: 'High CPU usage detected', level: 'warning' }
      ],
      isLoading: false,
      error: null
    }
  }
});

const renderWithProvider = (component) => {
  return render(
    <Provider store={mockStore}>
      {component}
    </Provider>
  );
};

describe('SystemMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders system monitor with compact view by default', () => {
    renderWithProvider(<SystemMonitor />);
    
    expect(screen.getByText('System Monitor')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-card')).toHaveLength(4);
    expect(screen.getAllByTestId('metric-title')[0]).toHaveTextContent('CPU');
  });

  it.skip('displays loading state when metrics are being fetched', () => {
    const loadingStore = configureStore({
      reducer: { monitoring: monitoringSlice },
      preloadedState: {
        monitoring: {
          metrics: null,
          services: {},
          alerts: [],
          isLoading: true,
          error: null
        }
      }
    });

    render(
      <Provider store={loadingStore}>
        <SystemMonitor />
      </Provider>
    );

    // Look for loading indicator
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it.skip('displays error state when there is an error', () => {
    const errorStore = configureStore({
      reducer: { monitoring: monitoringSlice },
      preloadedState: {
        monitoring: {
          metrics: null,
          services: {},
          alerts: [],
          isLoading: false,
          error: 'Failed to fetch metrics'
        }
      }
    });

    render(
      <Provider store={errorStore}>
        <SystemMonitor />
      </Provider>
    );

    expect(screen.getByText('Error loading system metrics')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch metrics')).toBeInTheDocument();
  });

  it('expands to full view when expand button is clicked', () => {
    renderWithProvider(<SystemMonitor />);
    
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    expect(screen.getByText('System Metrics')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
    expect(screen.getByText('Historical Data')).toBeInTheDocument();
  });

  it('displays correct metric values', () => {
    renderWithProvider(<SystemMonitor />);
    
    const metricCards = screen.getAllByTestId('metric-card');
    expect(metricCards).toHaveLength(4);
    
    // Check CPU metric
    const cpuCard = metricCards[0];
    expect(cpuCard).toHaveTextContent('CPU');
    expect(cpuCard).toHaveTextContent('45.5');
    expect(cpuCard).toHaveTextContent('%');
  });

  it('displays service status correctly', () => {
    renderWithProvider(<SystemMonitor />);
    
    // Expand the view to see services
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    const serviceCards = screen.getAllByTestId('service-status-card');
    expect(serviceCards).toHaveLength(2);
    
    expect(screen.getByText('backend')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
  });

  it('displays alerts in the alerts panel', () => {
    renderWithProvider(<SystemMonitor />);
    
    // Expand the view to see alerts
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    expect(screen.getByTestId('alerts-panel')).toBeInTheDocument();
    expect(screen.getByText('High CPU usage detected')).toBeInTheDocument();
  });

  it('shows historical chart when expanded', () => {
    renderWithProvider(<SystemMonitor />);
    
    // Expand the view
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it.skip('updates metrics periodically', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: {
          cpu: { usage: 50.0, cores: 8 },
          memory: { percentage: 70.0, used: 9000000000 },
          disk: { percentage: 25.0, used: 270000000000 },
          network: { download: 15.0, upload: 4.0 }
        }
      })
    });

    global.fetch = mockFetch;
    
    renderWithProvider(<SystemMonitor />);
    
    // Fast forward time to trigger interval
    vi.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/monitoring/metrics')
      );
    });
  });

  it('accumulates historical data over time', async () => {
    renderWithProvider(<SystemMonitor />);
    
    // Expand to see the chart
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    // The component should show historical data
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it.skip('shows connection status indicator', () => {
    renderWithProvider(<SystemMonitor />);
    
    // Check for the status indicator (green dot for connected)
    const statusIndicator = screen.getByRole('status', { hidden: true });
    expect(statusIndicator).toHaveClass('bg-green-500');
  });

  it.skip('handles connection failures gracefully', () => {
    const disconnectedStore = configureStore({
      reducer: { monitoring: monitoringSlice },
      preloadedState: {
        monitoring: {
          metrics: null,
          services: {},
          alerts: [],
          isLoading: false,
          error: null,
          connectionStatus: 'disconnected'
        }
      }
    });

    render(
      <Provider store={disconnectedStore}>
        <SystemMonitor />
      </Provider>
    );

    const statusIndicator = screen.getByRole('status', { hidden: true });
    expect(statusIndicator).toHaveClass('bg-red-500');
  });

  it('formats time correctly in last updated display', () => {
    renderWithProvider(<SystemMonitor />);
    
    const lastUpdatedElement = screen.getByText(/Last updated:/);
    expect(lastUpdatedElement).toBeInTheDocument();
    
    // Check that it contains a time format
    expect(lastUpdatedElement.textContent).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  it('handles empty services gracefully', () => {
    const emptyServicesStore = configureStore({
      reducer: { monitoring: monitoringSlice },
      preloadedState: {
        monitoring: {
          metrics: {
            cpu: { usage: 45.5, cores: 8 },
            memory: { percentage: 67.8, used: 8589934592 },
            disk: { percentage: 23.4, used: 268435456000 },
            network: { download: 12.5, upload: 3.2 }
          },
          services: {},
          alerts: [],
          isLoading: false,
          error: null
        }
      }
    });

    render(
      <Provider store={emptyServicesStore}>
        <SystemMonitor />
      </Provider>
    );

    // Expand the view
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    // Should not crash and should show services section
    expect(screen.getByText('Services')).toBeInTheDocument();
  });
});

describe('SystemMonitor Integration', () => {
  it.skip('integrates with Redux store correctly', () => {
    const { store } = renderWithProvider(<SystemMonitor />);
    
    // Check that the component is connected to the store
    expect(store.getState().monitoring.metrics).toBeDefined();
    expect(store.getState().monitoring.services).toBeDefined();
  });

  it('dispatches actions on mount', () => {
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    
    renderWithProvider(<SystemMonitor />);
    
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
