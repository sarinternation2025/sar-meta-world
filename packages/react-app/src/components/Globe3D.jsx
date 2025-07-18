import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function RotatingGlobe({ data }) {
  const mesh = useRef();
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.002;
      mesh.current.rotation.x = 0.25;
    }
  });

  // Generate glowing points based on data
  const points = Array.from({ length: 30 }, (_, _i) => ({
    lat: Math.random() * Math.PI,
    lon: Math.random() * 2 * Math.PI,
    color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`,
    intensity: data?.activeConnections ? (data.activeConnections / 1000) : 1,
  }));

  return (
    <group>
      {/* Globe */}
      <mesh ref={mesh} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#0ff"
          emissive="#0ff"
          emissiveIntensity={0.15}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      
      {/* Glowing points */}
      {points.map((pt, _i) => {
        // Convert lat/lon to Cartesian coordinates
        const r = 1.01;
        const x = r * Math.sin(pt.lat) * Math.cos(pt.lon);
        const y = r * Math.cos(pt.lat);
        const z = r * Math.sin(pt.lat) * Math.sin(pt.lon);
        
        return (
          <mesh key={_i} position={[x, y, z]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial
              color={pt.color}
              emissive={pt.color}
              emissiveIntensity={pt.intensity}
              transparent
              opacity={0.9}
            />
          </mesh>
        );
      })}
      
      {/* Orbital rings */}
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.005, 16, 100]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.3}
            transparent
            opacity={0.5}
          />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.3, 0.003, 16, 100]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.2}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}

const Globe3D = ({ data }) => (
  <RotatingGlobe data={data} />
);

export default Globe3D;
