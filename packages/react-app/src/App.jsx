import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import Globe3D from './components/Globe3D'
import Dashboard from './components/Dashboard'
// Unused imports - available for future features
// import ParticleField from './components/ParticleField'
// import DataNodes from './components/DataNodes'
// import HolographicPanel from './components/HolographicPanel'
// import AdvancedControls from './components/AdvancedControls'
// import InteractiveTimeline from './components/InteractiveTimeline'
// import WidgetDashboard from './components/WidgetDashboard'
import './App.css'
import SyncService from './services/SyncService'
// import SyncStatus from './components/SyncStatus'

function App() {
  const [view, setView] = useState('3d') // '3d', 'advanced', 'dashboard', or 'widgets'
  const [sceneMode, setSceneMode] = useState('standard') // 'standard', 'enhanced', 'holographic'
  const [settings, setSettings] = useState({
    theme: 'dark',
    autoRotate: true,
    showFPS: false,
    speed: 1.0,
    opacity: 1.0
  })
  const [realTimeData, setRealTimeData] = useState({
    activeConnections: 1247,
    dataThroughput: '2.3 GB/s',
    latency: '12ms',
    quantumEntropy: 0.847,
    neuralAccuracy: 94.3,
    transactions: 58392,
    uptime: '127d 14h 32m'
  })
  // Initialize SyncService
  useEffect(() => {
    SyncService.on('config_updated', ({ config }) => {
      setSettings(config)
    })

    return () => {
      SyncService.off('config_updated')
    }
  }, [])

  // Export/Import functionality
  const handleExportData = (data) => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportData = (data) => {
    if (data.settings) {
      setSettings(data.settings)
    }
    if (data.realTimeData) {
      setRealTimeData(data.realTimeData)
    }
    alert('Data imported successfully!')
  }

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 20) - 10,
        dataThroughput: `${(Math.random() * 3 + 1).toFixed(1)} GB/s`,
        latency: `${Math.floor(Math.random() * 30 + 5)}ms`,
        quantumEntropy: Math.random() * 0.3 + 0.7,
        neuralAccuracy: Math.random() * 5 + 92,
        transactions: prev.transactions + Math.floor(Math.random() * 100)
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <div className="view-controls">
        <button 
          onClick={() => setView('3d')} 
          className={view === '3d' ? 'active' : ''}
        >
          3D Globe
        </button>
        <button 
          onClick={() => setView('advanced')} 
          className={view === 'advanced' ? 'active' : ''}
        >
          Advanced 3D
        </button>
        <button 
          onClick={() => setView('dashboard')} 
          className={view === 'dashboard' ? 'active' : ''}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setView('widgets')} 
          className={view === 'widgets' ? 'active' : ''}
        >
          🎛️ Widgets
        </button>
      </div>
      
      {view === 'advanced' && (
        <div className="scene-controls">
          <button 
            onClick={() => setSceneMode('standard')}
            className={sceneMode === 'standard' ? 'active' : ''}
          >
            Standard
          </button>
          <button 
            onClick={() => setSceneMode('enhanced')}
            className={sceneMode === 'enhanced' ? 'active' : ''}
          >
            Enhanced
          </button>
          <button 
            onClick={() => setSceneMode('holographic')}
            className={sceneMode === 'holographic' ? 'active' : ''}
          >
            Holographic
          </button>
        </div>
      )}

      {view === '3d' ? (
        <div className="canvas-container">
          <Canvas 
            camera={{ position: [0, 0, 2.5], fov: 50 }} 
            shadows
            style={{ background: 'radial-gradient(circle, #001122 0%, #000000 100%)' }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1.2} />
            <Stars radius={10} depth={50} count={500} factor={0.5} fade speed={1} />
            <Globe3D data={realTimeData} />
            <OrbitControls 
              enablePan={false} 
              enableZoom={true} 
              autoRotate 
              autoRotateSpeed={0.5}
              minDistance={1.5}
              maxDistance={5}
            />
          </Canvas>
          
          <div className="overlay-panel">
            <h2>🌐 Live Quantum Metrics</h2>
            <div className="metrics">
              <div className="metric">
                <span>Active Connections</span>
                <span className="value">{realTimeData.activeConnections.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span>Data Throughput</span>
                <span className="value">{realTimeData.dataThroughput}</span>
              </div>
              <div className="metric">
                <span>Latency</span>
                <span className="value">{realTimeData.latency}</span>
              </div>
              <div className="metric">
                <span>Quantum Entropy</span>
                <span className="value">{realTimeData.quantumEntropy.toFixed(3)}</span>
              </div>
              <div className="metric">
                <span>Neural Accuracy</span>
                <span className="value">{realTimeData.neuralAccuracy.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : view === 'advanced' ? (
        <div className="canvas-container">
          <Canvas 
            camera={{ position: [0, 0, 6], fov: 50 }} 
            shadows
            style={{ background: 'radial-gradient(circle, #001122 0%, #000000 100%)' }}
          >
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <directionalLight position={[-10, -10, -5]} intensity={0.8} />
            
            {/* Enhanced star field */}
            <Stars radius={50} depth={80} count={1000} factor={0.8} fade speed={2} />
            
            {/* Conditional rendering based on scene mode */}
            {sceneMode === 'standard' && (
              <>
                <Globe3D data={realTimeData} />
                {/* <DataNodes data={realTimeData} /> */}
              </>
            )}
            
            {sceneMode === 'enhanced' && (
              <>
                <Globe3D data={realTimeData} />
                {/* <ParticleField count={500} data={realTimeData} /> */}
                {/* <DataNodes data={realTimeData} /> */}
              </>
            )}
            
            {sceneMode === 'holographic' && (
              <>
                <Globe3D data={realTimeData} />
                {/* <ParticleField count={1000} data={realTimeData} /> */}
                {/* <DataNodes data={realTimeData} /> */}
                
                {/* Holographic panels */}
                <HolographicPanel 
                  position={[3, 1, 0]} 
                  rotation={[0, -Math.PI/4, 0]}
                  title="System Status"
                  width={2}
                  height={1.5}
                >
                  <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    <p>🟢 All systems operational</p>
                    <p>⚡ Power: {realTimeData.neuralAccuracy.toFixed(1)}%</p>
                    <p>🔗 Connections: {realTimeData.activeConnections.toLocaleString()}</p>
                    <p>📊 Throughput: {realTimeData.dataThroughput}</p>
                  </div>
                </HolographicPanel>
                
                <HolographicPanel 
                  position={[-3, 1, 0]} 
                  rotation={[0, Math.PI/4, 0]}
                  title="Network Analytics"
                  width={2}
                  height={1.5}
                >
                  <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    <p>🌐 Latency: {realTimeData.latency}</p>
                    <p>🔄 Transactions: {realTimeData.transactions.toLocaleString()}</p>
                    <p>🧠 AI Accuracy: {realTimeData.neuralAccuracy.toFixed(1)}%</p>
                    <p>⚡ Quantum Entropy: {realTimeData.quantumEntropy.toFixed(3)}</p>
                  </div>
                </HolographicPanel>
                
                <HolographicPanel 
                  position={[0, -2, 2]} 
                  rotation={[Math.PI/6, 0, 0]}
                  title="Live Feed"
                  width={3}
                  height={1}
                >
                  <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                    <p>📡 Uptime: {realTimeData.uptime}</p>
                    <p>🚀 Performance: Optimal</p>
                    <p>🔒 Security: Active</p>
                  </div>
                </HolographicPanel>
              </>
            )}
            
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              autoRotate={sceneMode === 'holographic'} 
              autoRotateSpeed={0.3}
              minDistance={2}
              maxDistance={15}
            />
          </Canvas>
        </div>
      ) : view === 'widgets' ? (
        <WidgetDashboard 
          realTimeData={realTimeData} 
          settings={settings} 
        />
      ) : (
        <>
          <Dashboard data={realTimeData} />
          <InteractiveTimeline 
            data={realTimeData} 
            settings={settings} 
          />
        </>
      )}
      
      {/* Advanced Controls - Available in all views */}
      <AdvancedControls 
        settings={settings}
        onSettingsChange={setSettings}
        realTimeData={realTimeData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />
      
      {/* Sync Status - Available in all views */}
      <SyncStatus />
    </div>
  )
}

export default App
