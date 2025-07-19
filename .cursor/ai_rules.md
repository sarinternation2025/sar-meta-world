# Cursor AI Development Rules for SAR Meta World

## Project Context
This is a full-stack 3D visualization platform called "SAR Meta World" with the following architecture:

### Tech Stack
- **Frontend**: React 18+ with Three.js and React Three Fiber for 3D visualizations
- **Backend**: Node.js with Express, MQTT integration, WebSocket support
- **Database**: PostgreSQL, Redis, InfluxDB for different data types
- **Infrastructure**: Docker containers, Nginx reverse proxy, SSL termination
- **Monitoring**: Grafana, Prometheus for metrics and alerting
- **CLI**: Custom CLI agent with modular command structure

### Key Components
- 3D interactive dashboard with real-time data visualization
- MQTT message broker for IoT device communication
- Real-time analytics and monitoring systems
- WebSocket connections for live updates
- Production-ready containerized services

## AI Assistant Preferences

### Code Generation
1. **Always use modern JavaScript/React patterns**:
   - Functional components with hooks
   - Arrow functions
   - Template literals
   - Destructuring
   - Async/await over promises

2. **Three.js and React Three Fiber conventions**:
   - Use `@react-three/fiber` for React integration
   - Use `@react-three/drei` for common helpers
   - Follow Three.js best practices for performance
   - Use proper cleanup in useEffect for 3D resources

3. **Backend API patterns**:
   - Express.js with middleware pattern
   - Async/await for database operations
   - Proper error handling with try/catch
   - RESTful API design principles
   - MQTT message handling patterns

### File Structure Preferences
```
// React components
src/components/ComponentName/
├── ComponentName.jsx
├── ComponentName.css
└── ComponentName.test.jsx

// API routes
routes/
├── api/
│   ├── v1/
│   └── middleware/
└── websocket/

// 3D components
src/components/3d/
├── visualizations/
├── controls/
└── effects/
```

### Coding Standards
1. **Naming Conventions**:
   - React components: PascalCase
   - Files: kebab-case for configs, PascalCase for React components
   - Variables: camelCase
   - Constants: UPPER_SNAKE_CASE

2. **Import Order**:
   ```javascript
   // External libraries
   import React from 'react'
   import * as THREE from 'three'
   
   // Internal utilities
   import { apiClient } from '../services/api'
   
   // Components
   import Dashboard from './Dashboard'
   
   // Styles
   import './Component.css'
   ```

3. **Error Handling**:
   - Always wrap async operations in try/catch
   - Use proper error boundaries in React
   - Log errors with context information
   - Return meaningful error messages

### Development Priorities
1. **Performance**: Optimize 3D rendering and data processing
2. **Real-time**: Ensure smooth WebSocket and MQTT integration
3. **Scalability**: Design for multiple concurrent users
4. **Security**: Follow security best practices for all endpoints
5. **Testing**: Include unit tests for critical components

### Specific Guidelines

#### 3D Visualization Components
```javascript
// Preferred pattern for 3D components
const My3DComponent = ({ data, onUpdate }) => {
  const meshRef = useRef()
  const { scene } = useThree()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
    }
  })
  
  useEffect(() => {
    return () => {
      // Cleanup 3D resources
      if (meshRef.current) {
        meshRef.current.geometry?.dispose()
        meshRef.current.material?.dispose()
      }
    }
  }, [])
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="cyan" />
    </mesh>
  )
}
```

#### API Endpoint Pattern
```javascript
// Preferred API endpoint structure
router.get('/api/data/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await dataService.getData(id)
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Data fetch failed:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})
```

#### WebSocket Pattern
```javascript
// Preferred WebSocket handling
const wsConnection = (ws, req) => {
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data)
      
      switch (message.type) {
        case 'subscribe':
          await handleSubscription(ws, message.channel)
          break
        case 'data_request':
          await handleDataRequest(ws, message.query)
          break
        default:
          ws.send(JSON.stringify({ error: 'Unknown message type' }))
      }
    } catch (error) {
      logger.error('WebSocket error:', error)
      ws.send(JSON.stringify({ error: 'Message processing failed' }))
    }
  })
}
```

### Docker and DevOps
- Use multi-stage builds for production images
- Include health checks in Docker services
- Use environment variables for configuration
- Follow security best practices (non-root users, minimal images)

### Testing Preferences
```javascript
// React Testing Library for components
import { render, screen } from '@testing-library/react'
import { Canvas } from '@react-three/fiber'

test('renders 3D component', () => {
  render(
    <Canvas>
      <My3DComponent />
    </Canvas>
  )
  // Test 3D component logic
})

// Jest for API testing
describe('API endpoints', () => {
  test('GET /api/data returns valid data', async () => {
    const response = await request(app).get('/api/data/123')
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
```

## AI Behavior Instructions

1. **When generating new features**: Always consider the existing architecture and patterns
2. **When debugging**: Start by checking logs, environment variables, and service connections
3. **When optimizing**: Focus on 3D rendering performance and data processing efficiency
4. **When suggesting improvements**: Consider scalability, security, and maintainability
5. **When creating tests**: Include both unit tests and integration tests where appropriate

## Project-Specific Context

### Current Services Running
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000
- 3D Dashboard: http://localhost:9000
- Dev Dashboard: http://localhost:8080
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090

### Key Environment Variables
- `MQTT_BROKER_URL`: MQTT broker connection
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection
- `INFLUXDB_URL`: InfluxDB connection
- `NODE_ENV`: Development environment setting

### Common Development Tasks
1. Adding new 3D visualizations
2. Creating API endpoints for real-time data
3. Implementing WebSocket channels
4. Setting up monitoring and alerting
5. Optimizing performance for large datasets
6. Adding new CLI commands
7. Configuring Docker services

Use this context to provide more accurate and helpful suggestions throughout the development process.
