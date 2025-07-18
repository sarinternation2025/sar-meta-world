import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = ({ count = 1000, data }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Generate particle positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ],
        velocity: [
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ],
        scale: Math.random() * 0.5 + 0.5,
        color: new THREE.Color(`hsl(${Math.random() * 360}, 70%, 60%)`)
      });
    }
    return temp;
  }, [count]);

  // Animate particles
  useFrame((state) => {
    if (mesh.current) {
      particles.forEach((particle, i) => {
        // Update position
        particle.position[0] += particle.velocity[0];
        particle.position[1] += particle.velocity[1];
        particle.position[2] += particle.velocity[2];
        
        // Bounce off boundaries
        ['x', 'y', 'z'].forEach((axis, axisIndex) => {
          if (Math.abs(particle.position[axisIndex]) > 5) {
            particle.velocity[axisIndex] *= -1;
          }
        });
        
        // Set matrix for instance
        dummy.position.set(...particle.position);
        dummy.scale.setScalar(particle.scale * (1 + Math.sin(state.clock.elapsedTime + i) * 0.1));
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
        mesh.current.setColorAt(i, particle.color);
      });
      
      mesh.current.instanceMatrix.needsUpdate = true;
      if (mesh.current.instanceColor) {
        mesh.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshStandardMaterial 
        transparent 
        opacity={0.8}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};

export default ParticleField;
