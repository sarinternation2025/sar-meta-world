import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

function RotatingGlobe() {
  const mesh = useRef();
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.002;
      mesh.current.rotation.x = 0.25;
    }
  });

  // Example: random glowing points (simulate real-time data)
  const points = Array.from({ length: 30 }, (_, i) => ({
    lat: Math.random() * Math.PI,
    lon: Math.random() * 2 * Math.PI,
    color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`,
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
      {points.map((pt, i) => {
        // Convert lat/lon to Cartesian coordinates
        const r = 1.01;
        const x = r * Math.sin(pt.lat) * Math.cos(pt.lon);
        const y = r * Math.cos(pt.lat);
        const z = r * Math.sin(pt.lat) * Math.sin(pt.lon);
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial
              color={pt.color}
              emissive={pt.color}
              emissiveIntensity={1.5}
              transparent
              opacity={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
}

const Globe3D = () => (
  <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
    <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }} shadows>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <Stars radius={10} depth={50} count={500} factor={0.5} fade speed={1} />
      <RotatingGlobe />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  </div>
);

export default Globe3D; 