import React from 'react';

const Dashboard = ({ data }) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🌟 SAR Meta-World Dashboard</h1>
        <p>Real-time system monitoring and analytics</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="metric-card">
          <h3>🔗 Active Connections</h3>
          <div className="metric-value">{data.activeConnections.toLocaleString()}</div>
          <div className="metric-trend">+2.3% from last hour</div>
        </div>
        
        <div className="metric-card">
          <h3>📊 Data Throughput</h3>
          <div className="metric-value">{data.dataThroughput}</div>
          <div className="metric-trend">↗️ High performance</div>
        </div>
        
        <div className="metric-card">
          <h3>⚡ Latency</h3>
          <div className="metric-value">{data.latency}</div>
          <div className="metric-trend">✅ Optimal</div>
        </div>
        
        <div className="metric-card">
          <h3>🌌 Quantum Entropy</h3>
          <div className="metric-value">{data.quantumEntropy.toFixed(3)}</div>
          <div className="metric-trend">🔮 Stable</div>
        </div>
        
        <div className="metric-card">
          <h3>🧠 Neural Accuracy</h3>
          <div className="metric-value">{data.neuralAccuracy.toFixed(1)}%</div>
          <div className="metric-trend">🎯 Excellent</div>
        </div>
        
        <div className="metric-card">
          <h3>💳 Transactions</h3>
          <div className="metric-value">{data.transactions.toLocaleString()}</div>
          <div className="metric-trend">📈 Growing</div>
        </div>
        
        <div className="metric-card system-uptime">
          <h3>⏰ System Uptime</h3>
          <div className="metric-value">{data.uptime}</div>
          <div className="metric-trend">💚 Stable</div>
        </div>
        
        <div className="metric-card system-status">
          <h3>🖥️ System Status</h3>
          <div className="status-indicators">
            <div className="status-item">
              <span className="status-dot green"></span>
              <span>Frontend</span>
            </div>
            <div className="status-item">
              <span className="status-dot green"></span>
              <span>Backend</span>
            </div>
            <div className="status-item">
              <span className="status-dot green"></span>
              <span>Database</span>
            </div>
            <div className="status-item">
              <span className="status-dot yellow"></span>
              <span>MQTT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
