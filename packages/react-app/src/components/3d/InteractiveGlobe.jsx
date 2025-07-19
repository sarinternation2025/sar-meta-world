import React, { useRef, useState, _useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { _Text, _Html } from '@react-three/drei'
import * as THREE from 'three'
import { countryData } from '../../data/countryData'

const InteractiveGlobe = ({ 
  radius = 2, 
  onCountrySelect, 
  selectedCountry = null,
  dataMode = 'population',
  showConnections = true 
}) => {
  const meshRef = useRef()
  const globeRef = useRef()
  const particlesRef = useRef()
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { camera, raycaster, scene } = useThree()

  // Globe texture and materials
  const globeTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    // Using a public Earth texture
    return loader.load('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
  }, [])

  const bumpTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return loader.load('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
  }, [])

  // Create country markers based on data
  const countryMarkers = useMemo(() => {
    return countryData.map((country, index) => {
      const phi = (90 - country.lat) * (Math.PI / 180)
      const theta = (country.lng + 180) * (Math.PI / 180)

      const x = -(radius + 0.1) * Math.sin(phi) * Math.cos(theta)
      const y = (radius + 0.1) * Math.cos(phi)
      const z = (radius + 0.1) * Math.sin(phi) * Math.sin(theta)

      // Calculate marker size based on data
      const dataValue = country[dataMode] || 0
      const maxValue = Math.max(...countryData.map(c => c[dataMode] || 0))
      const normalizedSize = (dataValue / maxValue) * 0.15 + 0.02

      return {
        ...country,
        position: [x, y, z],
        size: normalizedSize,
        color: getCountryColor(dataValue, maxValue),
        index
      }
    })
  }, [radius, dataMode])

  // Color mapping based on data values
  const getCountryColor = (value, maxValue) => {
    const intensity = value / maxValue
    return new THREE.Color().setHSL(0.6 - intensity * 0.6, 0.8, 0.5 + intensity * 0.3)
  }

  // Connection lines between countries
  const connections = useMemo(() => {
    if (!showConnections) return []

    const lines = []
    countryData.forEach((country, i) => {
      if (country.connections) {
        country.connections.forEach(connectionId => {
          const targetCountry = countryData.find(c => c.id === connectionId)
          if (targetCountry) {
            const sourceMarker = countryMarkers[i]
            const targetMarker = countryMarkers.find(m => m.id === connectionId)
            
            if (sourceMarker && targetMarker) {
              lines.push({
                start: sourceMarker.position,
                end: targetMarker.position,
                strength: country.connectionStrength?.[connectionId] || 1
              })
            }
          }
        })
      }
    })
    return lines
  }, [countryMarkers, showConnections])

  // Handle mouse interactions
  const handlePointerMove = (_event) => {
    const pointer = new THREE.Vector2()
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

    setMousePosition({ x: event.clientX, y: event.clientY })

    raycaster.setFromCamera(pointer, camera)
    
    // Check intersection with country markers
    const markerObjects = scene.children.filter(child => 
      child.userData && child.userData.isCountryMarker
    )
    
    const intersects = raycaster.intersectObjects(markerObjects)
    
    if (intersects.length > 0) {
      const country = intersects[0].object.userData.country
      setHoveredCountry(country)
    } else {
      setHoveredCountry(null)
    }
  }

  const handleClick = (_event) => {
    if (hoveredCountry && onCountrySelect) {
      onCountrySelect(hoveredCountry)
    }
  }

  // Animation loop
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1 // Slow rotation
    }

    // Animate particles if present
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.05
    }
  })

  // Create connection line geometry
  const createConnectionLine = (start, end, strength = 1) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) * 0.5,
        (start[1] + end[1]) * 0.5 + 1, // Arc height
        (start[2] + end[2]) * 0.5
      ),
      new THREE.Vector3(...end)
    )

    const points = curve.getPoints(50)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    
    return (
      <line key={`${start.join()}-${end.join()}`}>
        <bufferGeometry attach="geometry" {...geometry} />
        <lineBasicMaterial 
          attach="material" 
          color={new THREE.Color().setHSL(0.15, 0.8, 0.5 + strength * 0.3)}
          transparent
          opacity={0.6 * strength}
          linewidth={2}
        />
      </line>
    )
  }

  return (
    <group ref={globeRef} onPointerMove={handlePointerMove} onClick={handleClick}>
      {/* Main Globe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhongMaterial
          map={globeTexture}
          bumpMap={bumpTexture}
          bumpScale={0.05}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Atmosphere effect */}
      <mesh>
        <sphereGeometry args={[radius + 0.05, 32, 32]} />
        <meshBasicMaterial
          color={new THREE.Color(0.3, 0.6, 1.0)}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Country Markers */}
      {countryMarkers.map((country, index) => (
        <group key={country.id} position={country.position}>
          <mesh
            userData={{ isCountryMarker: true, country }}
            onPointerEnter={() => setHoveredCountry(country)}
            onPointerLeave={() => setHoveredCountry(null)}
            onClick={() => onCountrySelect?.(country)}
          >
            <sphereGeometry args={[country.size, 8, 8]} />
            <meshBasicMaterial
              color={selectedCountry?.id === country.id ? '#ffff00' : country.color}
              transparent
              opacity={hoveredCountry?.id === country.id ? 1.0 : 0.8}
            />
          </mesh>

          {/* Country label for selected/hovered countries */}
          {(selectedCountry?.id === country.id || hoveredCountry?.id === country.id) && (
            <Text
              position={[0, country.size + 0.1, 0]}
              fontSize={0.1}
              color="white"
              anchorX="center"
              anchorY="bottom"
            >
              {country.name}
            </Text>
          )}
        </group>
      ))}

      {/* Connection Lines */}
      {connections.map((connection, index) => 
        createConnectionLine(connection.start, connection.end, connection.strength)
      )}

      {/* Data Flow Particles */}
      {showConnections && (
        <group ref={particlesRef}>
          {connections.slice(0, 10).map((connection, index) => (
            <DataFlowParticle 
              key={index}
              start={connection.start}
              end={connection.end}
              speed={connection.strength}
            />
          ))}
        </group>
      )}

      {/* Tooltip */}
      {hoveredCountry && (
        <Html
          position={[0, 0, 0]}
          style={{
            position: 'fixed',
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            pointerEvents: 'none',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 1000
          }}
        >
          <div>
            <strong>{hoveredCountry.name}</strong><br />
            Population: {hoveredCountry.population?.toLocaleString()}<br />
            GDP: ${hoveredCountry.gdp?.toLocaleString()}<br />
            {dataMode !== 'population' && dataMode !== 'gdp' && (
              <>
                {dataMode}: {hoveredCountry[dataMode]}
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

// Data flow particle component
const _DataFlowParticle = ({ start, end, speed = 1 }) => {
  const particleRef = useRef()
  const [progress, setProgress] = useState(0)

  useFrame((state, delta) => {
    if (particleRef.current) {
      const newProgress = (progress + delta * speed * 0.5) % 1
      setProgress(newProgress)

      // Interpolate position along the curve
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...start),
        new THREE.Vector3(
          (start[0] + end[0]) * 0.5,
          (start[1] + end[1]) * 0.5 + 1,
          (start[2] + end[2]) * 0.5
        ),
        new THREE.Vector3(...end)
      )

      const position = curve.getPoint(newProgress)
      particleRef.current.position.copy(position)
    }
  })

  return (
    <mesh ref={particleRef}>
      <sphereGeometry args={[0.01, 4, 4]} />
      <meshBasicMaterial
        color="#00ffff"
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

export default InteractiveGlobe
