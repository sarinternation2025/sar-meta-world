import React, { useState, useEffect } from 'react';

const GlobeVisualization = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Generate random data points for the globe
  useEffect(() => {
    const generateDataPoints = () => {
      const points = [];
      const regions = [
        { name: 'North America', lat: 45, lng: -100, color: 'cyan', intensity: 0.8 },
        { name: 'Europe', lat: 50, lng: 10, color: 'blue', intensity: 0.9 },
        { name: 'Asia', lat: 35, lng: 100, color: 'purple', intensity: 0.7 },
        { name: 'Africa', lat: 0, lng: 20, color: 'green', intensity: 0.6 },
        { name: 'South America', lat: -15, lng: -60, color: 'orange', intensity: 0.5 },
        { name: 'Australia', lat: -25, lng: 135, color: 'pink', intensity: 0.4 }
      ];

      regions.forEach((region, index) => {
        // Add main data point
        points.push({
          id: `point-${index}`,
          lat: region.lat + (Math.random() - 0.5) * 10,
          lng: region.lng + (Math.random() - 0.5) * 20,
          color: region.color,
          intensity: region.intensity,
          name: region.name,
          value: Math.floor(Math.random() * 1000) + 500
        });

        // Add satellite points around each region
        for (let i = 0; i < 3; i++) {
          points.push({
            id: `satellite-${index}-${i}`,
            lat: region.lat + (Math.random() - 0.5) * 15,
            lng: region.lng + (Math.random() - 0.5) * 30,
            color: region.color,
            intensity: region.intensity * 0.6,
            name: `${region.name} Node ${i + 1}`,
            value: Math.floor(Math.random() * 200) + 100
          });
        }
      });

      setDataPoints(points);
    };

    generateDataPoints();
    const interval = setInterval(generateDataPoints, 8000);
    return () => clearInterval(interval);
  }, []);

  // Generate connections between data points
  useEffect(() => {
    const generateConnections = () => {
      const newConnections = [];
      const mainPoints = dataPoints.filter(point => !point.id.includes('satellite'));

      mainPoints.forEach((point, index) => {
        // Connect to other main points
        mainPoints.slice(index + 1).forEach(targetPoint => {
          if (Math.random() > 0.5) {
            newConnections.push({
              id: `connection-${point.id}-${targetPoint.id}`,
              from: point,
              to: targetPoint,
              strength: Math.random() * 0.8 + 0.2
            });
          }
        });

        // Connect to satellite points
        const satellites = dataPoints.filter(p => p.id.includes('satellite') && p.name.includes(point.name.split(' ')[0]));
        satellites.forEach(satellite => {
          newConnections.push({
            id: `connection-${point.id}-${satellite.id}`,
            from: point,
            to: satellite,
            strength: 0.9
          });
        });
      });

      setConnections(newConnections);
    };

    if (dataPoints.length > 0) {
      generateConnections();
    }
  }, [dataPoints]);

  const getPointPosition = (lat, lng) => {
    // Convert lat/lng to 3D position on a sphere
    const radius = 120;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return { x, y, z };
  };

  const renderGlobe = () => (
    <div className="relative w-full h-full">
      {/* Globe Base */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-80 h-80 rounded-full bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-cyan-500/30 backdrop-blur-sm relative">
          {/* Grid Lines */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/20"></div>
          <div className="absolute inset-0 rounded-full border border-cyan-500/10" style={{ transform: 'rotate(45deg)' }}></div>
          
          {/* Equator */}
          <div className="absolute inset-0 rounded-full border border-cyan-400/30"></div>
          
          {/* Meridians */}
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-cyan-500/10"
              style={{ transform: `rotate(${i * 45}deg)` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Data Points */}
      {dataPoints.map((point) => {
        const position = getPointPosition(point.lat, point.lng);
        const isMainPoint = !point.id.includes('satellite');
        
        return (
          <div
            key={point.id}
            className={`absolute cursor-pointer transition-all duration-500 ${
              selectedRegion === point.id ? 'z-20' : 'z-10'
            }`}
            style={{
              left: `calc(50% + ${position.x * 0.8}px)`,
              top: `calc(50% + ${position.y * 0.8}px)`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setSelectedRegion(point.id)}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 border-white/50 shadow-lg transition-all duration-300 ${
                selectedRegion === point.id ? 'scale-150' : 'hover:scale-125'
              }`}
              style={{
                backgroundColor: `var(--tw-gradient-from)`,
                background: `radial-gradient(circle, ${point.color}-400, ${point.color}-600)`,
                boxShadow: `0 0 ${isMainPoint ? '20px' : '10px'} ${point.color}-400/50`
              }}
            >
              {isMainPoint && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-2 py-1 text-xs text-cyan-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {point.name}
                </div>
              )}
            </div>
            
            {/* Pulse effect for main points */}
            {isMainPoint && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: `${point.color}-400`,
                  opacity: 0.3
                }}
              ></div>
            )}
          </div>
        );
      })}

      {/* Connections */}
      {connections.map((connection) => {
        const fromPos = getPointPosition(connection.from.lat, connection.from.lng);
        const toPos = getPointPosition(connection.to.lat, connection.to.lng);
        
        return (
          <svg
            key={connection.id}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 5 }}
          >
            <line
              x1={`calc(50% + ${fromPos.x * 0.8}px)`}
              y1={`calc(50% + ${fromPos.y * 0.8}px)`}
              x2={`calc(50% + ${toPos.x * 0.8}px)`}
              y2={`calc(50% + ${toPos.y * 0.8}px)`}
              stroke={connection.from.color}
              strokeWidth={connection.strength * 2}
              opacity={connection.strength * 0.6}
              className="animate-pulse"
            />
          </svg>
        );
      })}

      {/* Floating Data Panel */}
      {selectedRegion && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-cyan-400 font-semibold">
              {dataPoints.find(p => p.id === selectedRegion)?.name}
            </h3>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Active Users:</span>
              <span className="text-cyan-400 font-medium">
                {dataPoints.find(p => p.id === selectedRegion)?.value}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Latency:</span>
              <span className="text-green-400 font-medium">
                {Math.floor(Math.random() * 50) + 20}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">GLOBAL NETWORK</span>
          </div>
          <div className="text-cyan-400 text-sm">
            {dataPoints.length} Active Nodes
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30 transition-all duration-200">
            Reset View
          </button>
          <button className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm hover:bg-purple-500/30 transition-all duration-200">
            Export Data
          </button>
        </div>
      </div>

      {/* Globe Container */}
      <div className="w-full h-full pt-16">
        {renderGlobe()}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3">
        <h4 className="text-cyan-400 text-sm font-medium mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
            <span className="text-gray-300">Primary Nodes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">Secondary Nodes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
            <span className="text-gray-300">Connections</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobeVisualization;
