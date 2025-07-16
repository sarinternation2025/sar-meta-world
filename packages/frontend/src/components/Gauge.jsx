import React from 'react';

const Gauge = ({ label, value }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg className="w-24 h-24" viewBox="0 0 100 100">
        <circle
          className="text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className="text-cyan-400"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="mt-2 text-sm text-gray-400">{label}</span>
      <span className="text-lg font-bold text-cyan-400">{value}%</span>
    </div>
  );
};

export default Gauge;
