import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Gauge } from './Gauge';
import { DataPanel } from './DataPanel';
import { Globe } from './Globe';
import { socket } from '../app/socket';
import { updateMetrics } from '../features/metrics/metricsSlice';
import { updateServices } from '../features/services/servicesSlice';
import { updateAlerts } from '../features/alerts/alertsSlice';
import { updateHistory } from '../features/history/historySlice';
import ServiceStatus from './ServiceStatus';
import Alerts from './Alerts';
import Chart from './Chart';
import GlobeComponent from './Globe';

const DashboardWireframe = () => {
  const dispatch = useDispatch();
  const { cpu, memory, disk } = useSelector((state) => state.metrics);
  const services = useSelector((state) => state.services);
  const alerts = useSelector((state) => state.alerts);
  const history = useSelector((state) => state.history);

  useEffect(() => {
    socket.on('data', (data) => {
      dispatch(updateMetrics(data.metrics));
      dispatch(updateServices(data.services));
      dispatch(updateAlerts(data.alerts));
      dispatch(updateHistory({ name: new Date().toLocaleTimeString(), ...data.metrics }));
    });

    return () => {
      socket.off('data');
    };
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <nav>
          <ul>
            <li className="mb-2"><a href="#" className="hover:text-gray-300">Overview</a></li>
            <li className="mb-2"><a href="#" className="hover:text-gray-300">Metrics</a></li>
            <li className="mb-2"><a href="#" className="hover:text-gray-300">Services</a></li>
            <li className="mb-2"><a href="#" className="hover:text-gray-300">Alerts</a></li>
            <li className="mb-2"><a href="#" className="hover:text-gray-300">Settings</a></li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Gauges */}
          <DataPanel title="CPU Usage">
            <Gauge value={cpu} />
          </DataPanel>
          <DataPanel title="Memory Usage">
            <Gauge value={memory} />
          </DataPanel>
          <DataPanel title="Disk Usage">
            <Gauge value={disk} />
          </DataPanel>

          {/* Service Status */}
          <ServiceStatus services={services} />

          {/* Alerts */}
          <Alerts alerts={alerts} />

          {/* Chart */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <DataPanel title="Historical Data">
              <Chart data={history} />
            </DataPanel>
          </div>

          {/* Globe */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 h-96">
            <DataPanel title="Network Visualization">
              <GlobeComponent />
            </DataPanel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWireframe;

