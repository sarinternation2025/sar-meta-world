import React from 'react';

const HolographicDisplay = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <svg className="w-16 h-16 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-cyan-400 text-sm font-medium">Holographic Globe</div>
        <div className="text-gray-400 text-xs">3D Visualization</div>
      </div>
    </div>
  );
};

export default HolographicDisplay; 