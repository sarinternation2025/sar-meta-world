import React from 'react';
import GlobeComponent from '../components/Globe';
import DataPanel from '../components/DataPanel';
import Gauge from '../components/Gauge';
import NavIcon from '../components/NavIcon';

const DashboardLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <GlobeComponent />
      <main className="relative z-10 p-6 grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <DataPanel title="Total Users" value="1,234" />
        </div>
        <div className="col-span-2 flex justify-around">
          <Gauge label="CPU" value={78} />
          <Gauge label="Memory" value={64} />
        </div>
        <div className="col-span-1">
          <DataPanel title="Active Sessions" value="567" />
        </div>
        <div className="col-span-4">
          {children}
        </div>
        <div className="col-span-1">
          <DataPanel title="Network In" value="1.2 GB" />
        </div>
        <div className="col-span-2 flex justify-around">
          <NavIcon icon="💬" label="Chat" />
          <NavIcon icon="👥" label="Users" />
          <NavIcon icon="🤖" label="AI Tools" />
          <NavIcon icon="⚙️" label="Settings" />
        </div>
        <div className="col-span-1">
          <DataPanel title="Network Out" value="3.4 GB" />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
