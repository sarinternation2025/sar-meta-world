import React from 'react';

const DataPanel = ({ title, value }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-4 shadow-lg backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-cyan-400">{value}</p>
    </div>
  );
};

export default DataPanel;
