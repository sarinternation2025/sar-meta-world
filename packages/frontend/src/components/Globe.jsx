import React from 'react';
import Globe from 'react-globe.gl';

const GlobeComponent = () => {
  return (
    <div className="absolute inset-0">
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      />
    </div>
  );
};

export default GlobeComponent;
