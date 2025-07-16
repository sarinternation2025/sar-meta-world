import React from 'react';

const Alerts = ({ alerts }) => {
  return (
    <DataPanel title="Alerts">
      <ul>
        {alerts.map((alert, index) => (
          <li key={index} className={`text-${alert.level === 'critical' ? 'red' : 'yellow'}-500`}>
            {alert.message}
          </li>
        ))}
      </ul>
    </DataPanel>
  );
};

export default Alerts;

