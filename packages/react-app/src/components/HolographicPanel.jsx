import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Plane, shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Custom holographic shader
const HolographicMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color('#00ffff'),
    opacity: 0.8,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    varying vec2 vUv;
    
    void main() {
      float scanline = sin(vUv.y * 50.0 + time * 5.0) * 0.1;
      float flicker = sin(time * 10.0) * 0.05;
      float grid = step(0.05, mod(vUv.x * 20.0, 1.0)) * step(0.05, mod(vUv.y * 20.0, 1.0));
      
      vec3 finalColor = color + scanline + flicker;
      float finalOpacity = opacity * (0.8 + grid * 0.2);
      
      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `
);

extend({ HolographicMaterial });

const HolographicPanel = ({ position, rotation, title, children, width = 2, height = 1.5 }) => {
  const materialRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }
    if (groupRef.current) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.001;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Holographic background */}
      <Plane args={[width, height]}>
        <holographicMaterial
          ref={materialRef}
          transparent
          side={THREE.DoubleSide}
          color={hovered ? '#ff00ff' : '#00ffff'}
        />
      </Plane>
      
      {/* Border glow effect */}
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={4}
            array={new Float32Array([
              -width/2, -height/2, 0.001,
              width/2, -height/2, 0.001,
              width/2, height/2, 0.001,
              -width/2, height/2, 0.001,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </lineLoop>
      
      {/* HTML content */}
      <Html
        transform
        position={[0, 0, 0.01]}
        style={{
          width: `${width * 100}px`,
          height: `${height * 100}px`,
          background: 'rgba(0, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '10px',
          padding: '20px',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '14px',
          overflow: 'hidden',
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <div className="holographic-panel-content">
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: '#00ffff',
            textShadow: '0 0 10px #00ffff',
            borderBottom: '1px solid #00ffff',
            paddingBottom: '10px'
          }}>
            {title}
          </h3>
          {children}
        </div>
      </Html>
    </group>
  );
};

export default HolographicPanel;
