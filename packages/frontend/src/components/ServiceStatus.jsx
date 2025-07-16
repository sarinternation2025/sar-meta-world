import React from 'react';

const ServiceStatus = ({ services }) => {
  return (
    <DataPanel title="Service Status">
      <ul>
        {Object.entries(services).map(([service, { status }]) => (
          <li key={service} className="flex justify-between">
            <span>{service}</span>
            <span className={status === 'online' ? 'text-green-500' : 'text-red-500'}>
              {status}
            </span>
          </li>
        ))}
      </ul>
    </DataPanel>
  );
};

export default ServiceStatus;

