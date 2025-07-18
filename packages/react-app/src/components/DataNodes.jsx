import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';

const DataNode = ({ position, data, onHover, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          onHover(data);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(data)}
      >
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial
          color={hovered ? '#ff6b6b' : '#4ecdc4'}
          emissive={hovered ? '#ff6b6b' : '#4ecdc4'}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {hovered && (
        <Html distanceFactor={10}>
          <div className="data-node-tooltip">
            <div className="tooltip-title">{data.name}</div>
            <div className="tooltip-value">{data.value}</div>
            <div className="tooltip-status">{data.status}</div>
          </div>
        </Html>
      )}
      
      <Text
        position={[0, -0.2, 0]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {data.name}
      </Text>
    </group>
  );
};

const DataNodes = ({ data }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    { id: 1, name: 'CPU', value: '45%', status: 'Normal', position: [2, 1, 0] },
    { id: 2, name: 'Memory', value: '78%', status: 'Warning', position: [-2, 1, 0] },
    { id: 3, name: 'Storage', value: '23%', status: 'Normal', position: [0, 2, 1] },
    { id: 4, name: 'Network', value: '156 Mbps', status: 'High', position: [1, -1, 2] },
    { id: 5, name: 'Database', value: '234 queries/s', status: 'Normal', position: [-1, -1, -1] },
  ];

  return (
    <group>
      {nodes.map((node) => (
        <DataNode
          key={node.id}
          position={node.position}
          data={node}
          onHover={setHoveredNode}
          onSelect={setSelectedNode}
        />
      ))}
      
      {/* Connection lines between nodes */}
      {nodes.map((node, index) => (
        nodes.slice(index + 1).map((otherNode) => (
          <line key={`${node.id}-${otherNode.id}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  ...node.position,
                  ...otherNode.position
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color="#00ffff" 
              transparent 
              opacity={0.3}
            />
          </line>
        ))
      ))}
    </group>
  );
};

export default DataNodes;
