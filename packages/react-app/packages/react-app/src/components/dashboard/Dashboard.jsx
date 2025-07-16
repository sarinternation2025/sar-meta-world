import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import GlobeVisualization from './GlobeVisualization';
import DataPanels from './DataPanels';
import ChatInterface from '../chat/ChatInterface';
import AdminControls from './AdminControls';
import HolographicDisplay from './HolographicDisplay';
import ParticleSystem from './ParticleSystem';
import NeuralNetwork from './NeuralNetwork';
import QuantumMetrics from './QuantumMetrics';
import TimeSeriesChart from './TimeSeriesChart';
import NetworkTopology from './NetworkTopology';
import AIAssistant from './AIAssistant';
import AdvancedCharts from './AdvancedCharts';
import SystemMonitor from './SystemMonitor';
import SecurityMatrix from './SecurityMatrix';
import Globe3D from './Globe3D';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    cpu: 67,
    memory: 84,
    network: 92,
    storage: 45,
    quantum: 78,
    neural: 91,
    ai: 88,
    security: 95,
    blockchain: 82,
    iot: 76,
    edge: 89,
    cloud: 93
  });
  const [realTimeData, setRealTimeData] = useState({
    activeConnections: 2847,
    dataThroughput: '3.2TB/s',
    responseTime: '12ms',
    uptime: '99.97%',
    alerts: 1247,
    threats: 23,
    quantumEntropy: 0.847,
    neuralAccuracy: 98.3,
    transactions: 15420,
    latency: '8.5ms',
    bandwidth: '2.8GB/s',
    encryption: 'AES-256'
  });
  const [aiAssistant, setAiAssistant] = useState({
    isActive: true,
    status: 'analyzing',
    insights: ['Quantum optimization detected', 'Neural network recalibrating', 'Security protocols updated', 'Blockchain synchronization complete']
  });
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'High CPU usage detected', time: '2m ago', priority: 'medium' },
    { id: 2, type: 'info', message: 'New security patch available', time: '5m ago', priority: 'low' },
    { id: 3, type: 'success', message: 'Backup completed successfully', time: '10m ago', priority: 'low' },
    { id: 4, type: 'error', message: 'Network latency increased', time: '15m ago', priority: 'high' }
  ]);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Advanced real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        cpu: Math.max(20, Math.min(95, prev.cpu + (Math.random() - 0.5) * 8)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 6)),
        network: Math.max(50, Math.min(98, prev.network + (Math.random() - 0.5) * 5)),
        storage: Math.max(20, Math.min(80, prev.storage + (Math.random() - 0.5) * 4)),
        quantum: Math.max(60, Math.min(95, prev.quantum + (Math.random() - 0.5) * 7)),
        neural: Math.max(85, Math.min(99, prev.neural + (Math.random() - 0.5) * 3)),
        ai: Math.max(80, Math.min(95, prev.ai + (Math.random() - 0.5) * 4)),
        security: Math.max(90, Math.min(99, prev.security + (Math.random() - 0.5) * 2)),
        blockchain: Math.max(70, Math.min(95, prev.blockchain + (Math.random() - 0.5) * 6)),
        iot: Math.max(60, Math.min(90, prev.iot + (Math.random() - 0.5) * 5)),
        edge: Math.max(80, Math.min(98, prev.edge + (Math.random() - 0.5) * 4)),
        cloud: Math.max(85, Math.min(99, prev.cloud + (Math.random() - 0.5) * 3))
      }));

      setRealTimeData(prev => ({
        activeConnections: Math.floor(prev.activeConnections + (Math.random() - 0.5) * 50),
        dataThroughput: `${(Math.random() * 2 + 2.5).toFixed(1)}TB/s`,
        responseTime: `${Math.floor(Math.random() * 20 + 8)}ms`,
        uptime: `${(99.9 + Math.random() * 0.1).toFixed(3)}%`,
        alerts: Math.floor(prev.alerts + (Math.random() - 0.5) * 10),
        threats: Math.floor(prev.threats + (Math.random() - 0.5) * 5),
        quantumEntropy: Math.max(0.1, Math.min(1, prev.quantumEntropy + (Math.random() - 0.5) * 0.1)),
        neuralAccuracy: Math.max(95, Math.min(99.9, prev.neuralAccuracy + (Math.random() - 0.5) * 0.5)),
        transactions: Math.floor(prev.transactions + (Math.random() - 0.5) * 100),
        latency: `${(Math.random() * 10 + 5).toFixed(1)}ms`,
        bandwidth: `${(Math.random() * 2 + 2).toFixed(1)}GB/s`,
        encryption: 'AES-256'
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Particle system animation - simplified for now
  useEffect(() => {
    // Placeholder for particle system
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const renderUltraMetrics = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
      <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-cyan-300 text-sm font-medium">Quantum Processing</span>
          <span className="text-cyan-400 text-lg font-bold">{systemStatus.quantum.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2 relative z-10">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500 animate-pulse"
            style={{ width: `${systemStatus.quantum}%` }}
          />
        </div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
      </div>

      <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-400/30 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-purple-300 text-sm font-medium">Neural Network</span>
          <span className="text-purple-400 text-lg font-bold">{systemStatus.neural.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2 relative z-10">
          <div 
            className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-500 animate-pulse"
            style={{ width: `${systemStatus.neural}%` }}
          />
        </div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
      </div>

      <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-green-300 text-sm font-medium">AI Intelligence</span>
          <span className="text-green-400 text-lg font-bold">{systemStatus.ai.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2 relative z-10">
          <div 
            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500 animate-pulse"
            style={{ width: `${systemStatus.ai}%` }}
          />
        </div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
      </div>

      <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-400/30 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-orange-300 text-sm font-medium">Security Matrix</span>
          <span className="text-orange-400 text-lg font-bold">{systemStatus.security.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2 relative z-10">
          <div 
            className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500 animate-pulse"
            style={{ width: `${systemStatus.security}%` }}
          />
        </div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500/20 to-blue-600/20 border border-indigo-400/30 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-indigo-300 text-sm font-medium">Blockchain</span>
          <span className="text-indigo-400 text-lg font-bold">{systemStatus.blockchain.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2 relative z-10">
          <div 
            className="bg-gradient-to-r from-indigo-400 to-blue-500 h-2 rounded-full transition-all duration-500 animate-pulse"
            style={{ width: `${systemStatus.blockchain}%` }}
          />
        </div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
      </div>

      <div className="bg-gradient-to-br from-teal-500/20 to-cyan-600/20 border border-teal-400/30 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-teal-300 text-sm font-medium">Edge Computing</span>
          <span className="text-teal-400 text-lg font-bold">{systemStatus.edge.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2 relative z-10">
          <div 
            className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2 rounded-full transition-all duration-500 animate-pulse"
            style={{ width: `${systemStatus.edge}%` }}
          />
        </div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
      </div>
    </div>
  );

  const renderUltraOverview = () => (
    <div className="h-full p-6 space-y-6">
      {/* Ultra Metrics */}
      {renderUltraMetrics()}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100%-280px)]">
        {/* Holographic Globe - Takes 2/3 of space */}
        <div className="xl:col-span-2 relative">
          <div className="bg-black/20 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-0 h-full relative overflow-hidden group hover:border-cyan-400/50 transition-all duration-300" style={{ minHeight: '480px' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-600/5 animate-pulse z-0"></div>
            {/* 3D Globe Visualization */}
            <div className="absolute inset-0 z-10">
              <Globe3D />
            </div>
            {/* Glassmorphic Overlay Panel for Live Metrics */}
            <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-lg rounded-xl border border-cyan-400/20 shadow-lg p-6 z-20 min-w-[260px] max-w-[320px]">
              <h2 className="text-cyan-300 text-lg font-bold mb-2 flex items-center">
                <span className="mr-2">🌐</span> Live Quantum Metrics
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Active Connections</span>
                  <span className="text-cyan-400 font-bold">{realTimeData.activeConnections.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Data Throughput</span>
                  <span className="text-green-400 font-bold">{realTimeData.dataThroughput}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Latency</span>
                  <span className="text-blue-400 font-bold">{realTimeData.latency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Quantum Entropy</span>
                  <span className="text-purple-400 font-bold">{realTimeData.quantumEntropy.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Neural Accuracy</span>
                  <span className="text-pink-400 font-bold">{realTimeData.neuralAccuracy.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Data Panels - Takes 1/3 of space */}
        <div className="space-y-6">
          <div className="bg-black/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 group hover:border-purple-400/50 transition-all duration-300">
            <h3 className="text-lg font-bold text-purple-400 mb-4">Real-Time Analytics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors duration-200">
                <span className="text-gray-300 text-sm">Active Connections</span>
                <span className="text-cyan-400 font-bold">{realTimeData.activeConnections.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors duration-200">
                <span className="text-gray-300 text-sm">Data Throughput</span>
                <span className="text-green-400 font-bold">{realTimeData.dataThroughput}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors duration-200">
                <span className="text-gray-300 text-sm">Response Time</span>
                <span className="text-blue-400 font-bold">{realTimeData.responseTime}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors duration-200">
                <span className="text-gray-300 text-sm">System Uptime</span>
                <span className="text-purple-400 font-bold">{realTimeData.uptime}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors duration-200">
                <span className="text-gray-300 text-sm">Transactions</span>
                <span className="text-indigo-400 font-bold">{realTimeData.transactions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors duration-200">
                <span className="text-gray-300 text-sm">Latency</span>
                <span className="text-teal-400 font-bold">{realTimeData.latency}</span>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 group hover:border-green-400/50 transition-all duration-300">
            <h3 className="text-lg font-bold text-green-400 mb-4">AI Assistant</h3>
            <div className="space-y-2">
              {aiAssistant.insights.map((insight, index) => (
                <div key={index} className="flex items-center p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors duration-200">
                  <span className="text-green-400 mr-2">●</span>
                  <span className="text-gray-300 text-sm">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-4 group hover:border-orange-400/50 transition-all duration-300">
            <h3 className="text-lg font-bold text-orange-400 mb-4">System Alerts</h3>
            <div className="space-y-2">
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                  alert.type === 'error' ? 'bg-red-500/20 border border-red-400/30' :
                  alert.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-400/30' :
                  alert.type === 'success' ? 'bg-green-500/20 border border-green-400/30' :
                  'bg-blue-500/20 border border-blue-400/30'
                }`}>
                  <span className={`mr-2 ${
                    alert.type === 'error' ? 'text-red-400' :
                    alert.type === 'warning' ? 'text-yellow-400' :
                    alert.type === 'success' ? 'text-green-400' :
                    'text-blue-400'
                  }`}>●</span>
                  <div className="flex-1">
                    <span className="text-gray-300 text-sm">{alert.message}</span>
                    <div className="text-gray-500 text-xs">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUltraAnalytics = () => (
    <div className="h-full p-6">
      <div className="bg-black/20 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 h-full relative overflow-hidden group hover:border-cyan-400/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 animate-pulse"></div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-2xl font-bold text-cyan-400">Quantum Analytics Engine</h2>
          <div className="flex space-x-4">
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg text-white text-sm font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
              Export Quantum Data
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2 rounded-lg text-white text-sm font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105">
              Generate Neural Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <span className="text-green-400 text-sm font-medium">+{Math.floor(Math.random() * 20 + 10)}%</span>
            </div>
            <h3 className="text-2xl font-bold text-blue-400 mb-1">{realTimeData.activeConnections.toLocaleString()}</h3>
            <p className="text-blue-300 text-sm">Quantum Connections</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-green-400 text-sm font-medium">+{Math.floor(Math.random() * 10 + 5)}%</span>
            </div>
            <h3 className="text-2xl font-bold text-green-400 mb-1">{realTimeData.uptime}</h3>
            <p className="text-green-300 text-sm">Quantum Uptime</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-green-400 text-sm font-medium">+{Math.floor(Math.random() * 25 + 15)}%</span>
            </div>
            <h3 className="text-2xl font-bold text-purple-400 mb-1">{realTimeData.dataThroughput}</h3>
            <p className="text-purple-300 text-sm">Quantum Throughput</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-green-400 text-sm font-medium">+{Math.floor(Math.random() * 15 + 8)}%</span>
            </div>
            <h3 className="text-2xl font-bold text-orange-400 mb-1">{realTimeData.alerts}</h3>
            <p className="text-orange-300 text-sm">Quantum Alerts</p>
          </div>
        </div>

        {/* Advanced Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          <div className="bg-black/30 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400/40 transition-colors duration-300 group">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Neural Network Performance</h3>
            <NeuralNetwork />
          </div>

          <div className="bg-black/30 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/40 transition-colors duration-300 group">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Quantum Entropy Analysis</h3>
            <QuantumMetrics entropy={realTimeData.quantumEntropy} />
          </div>

          <div className="bg-black/30 border border-green-500/20 rounded-xl p-6 hover:border-green-400/40 transition-colors duration-300 group">
            <h3 className="text-lg font-semibold text-green-300 mb-4">Time Series Analysis</h3>
            <TimeSeriesChart />
          </div>

          <div className="bg-black/30 border border-orange-500/20 rounded-xl p-6 hover:border-orange-400/40 transition-colors duration-300 group">
            <h3 className="text-lg font-semibold text-orange-300 mb-4">Network Topology</h3>
            <NetworkTopology />
          </div>
        </div>
      </div>
    </div>
  );

  const renderUltraSettings = () => (
    <div className="h-full p-6">
      <div className="bg-black/20 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 h-full relative overflow-hidden group hover:border-cyan-400/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 animate-pulse"></div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-2xl font-bold text-cyan-400">Quantum System Configuration</h2>
          <div className="flex space-x-4">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-lg text-white text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105">
              Save Quantum State
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2 rounded-lg text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105">
              Reset to Quantum Default
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Quantum Security Protocols */}
          <div className="space-y-6">
            <div className="bg-black/30 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400/40 transition-colors duration-300 group">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4">Quantum Security Matrix</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-cyan-500/10 hover:border-cyan-400/30 transition-colors duration-200 group">
                  <div>
                    <span className="text-gray-300 font-medium">Quantum Firewall</span>
                    <p className="text-gray-400 text-sm">Entanglement-based protection</p>
                  </div>
                  <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer hover:bg-cyan-400 transition-colors duration-200">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform duration-200"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-cyan-500/10 hover:border-cyan-400/30 transition-colors duration-200 group">
                  <div>
                    <span className="text-gray-300 font-medium">Quantum Encryption</span>
                    <p className="text-gray-400 text-sm">Post-quantum cryptography</p>
                  </div>
                  <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer hover:bg-cyan-400 transition-colors duration-200">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform duration-200"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-cyan-500/10 hover:border-cyan-400/30 transition-colors duration-200 group">
                  <div>
                    <span className="text-gray-300 font-medium">Neural Authentication</span>
                    <p className="text-gray-400 text-sm">AI-powered access control</p>
                  </div>
                  <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer hover:bg-gray-500 transition-colors duration-200">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 transition-transform duration-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quantum Emergency Controls */}
          <div className="space-y-6">
            <div className="bg-black/30 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/40 transition-colors duration-300 group">
              <h3 className="text-lg font-semibold text-purple-300 mb-4">Quantum Emergency Protocols</h3>
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-lg text-white text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105">
                  Quantum Emergency Shutdown
                </button>
                <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 px-4 py-3 rounded-lg text-white text-sm font-medium hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105">
                  Neural Maintenance Mode
                </button>
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 rounded-lg text-white text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105">
                  Quantum Backup System
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Particle System Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ zIndex: 0 }}>
        <ParticleSystem />
      </div>
      
      {/* Holographic Grid Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-20 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="flex h-screen relative" style={{ zIndex: 10 }}>
        {/* Enhanced Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Dashboard Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'overview' && renderUltraOverview()}
            {activeTab === 'chat' && (
              <div className="h-full p-6">
                <ChatInterface />
              </div>
            )}
            {activeTab === 'admin' && (
              <div className="h-full p-6">
                <AdminControls />
              </div>
            )}
            {activeTab === 'analytics' && renderUltraAnalytics()}
            {activeTab === 'settings' && renderUltraSettings()}
          </div>
        </div>
      </div>

      {/* AI Assistant Floating Panel */}
      <AIAssistant isActive={aiAssistant.isActive} status={aiAssistant.status} />
    </div>
  );
};

export default Dashboard;
