import React, { useState, useEffect } from 'react';

const SecurityMatrix = () => {
  const [securityStatus, setSecurityStatus] = useState({
    firewall: 'active',
    encryption: 'enabled',
    authentication: 'multi-factor',
    intrusion: 'blocked',
    malware: 'clean',
    vulnerabilities: 'patched'
  });

  const [threats, setThreats] = useState([
    { id: 1, type: 'blocked', source: '192.168.1.100', time: '2m ago', severity: 'medium' },
    { id: 2, type: 'monitored', source: '10.0.0.50', time: '5m ago', severity: 'low' },
    { id: 3, type: 'blocked', source: '203.0.113.25', time: '10m ago', severity: 'high' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new threats
      if (Math.random() > 0.7) {
        const newThreat = {
          id: Date.now(),
          type: Math.random() > 0.5 ? 'blocked' : 'monitored',
          source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          time: 'now',
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        };
        setThreats(prev => [newThreat, ...prev.slice(0, 4)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'enabled':
      case 'multi-factor':
      case 'blocked':
      case 'clean':
      case 'patched':
        return 'text-green-400';
      case 'inactive':
      case 'disabled':
      case 'single-factor':
      case 'allowed':
      case 'infected':
      case 'vulnerable':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getThreatColor = (type, severity) => {
    if (type === 'blocked') return 'text-green-400';
    if (severity === 'high') return 'text-red-400';
    if (severity === 'medium') return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <div className="h-full p-4">
      <div className="bg-black/30 border border-orange-500/20 rounded-xl p-4 h-full">
        <h3 className="text-lg font-semibold text-orange-300 mb-4">Security Matrix</h3>
        
        {/* Security Status Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
              <span className="text-gray-300 text-sm">Firewall</span>
              <span className={`text-sm font-medium ${getStatusColor(securityStatus.firewall)}`}>
                {securityStatus.firewall.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
              <span className="text-gray-300 text-sm">Encryption</span>
              <span className={`text-sm font-medium ${getStatusColor(securityStatus.encryption)}`}>
                {securityStatus.encryption.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
              <span className="text-gray-300 text-sm">Authentication</span>
              <span className={`text-sm font-medium ${getStatusColor(securityStatus.authentication)}`}>
                {securityStatus.authentication.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
              <span className="text-gray-300 text-sm">Intrusion</span>
              <span className={`text-sm font-medium ${getStatusColor(securityStatus.intrusion)}`}>
                {securityStatus.intrusion.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
              <span className="text-gray-300 text-sm">Malware</span>
              <span className={`text-sm font-medium ${getStatusColor(securityStatus.malware)}`}>
                {securityStatus.malware.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
              <span className="text-gray-300 text-sm">Vulnerabilities</span>
              <span className={`text-sm font-medium ${getStatusColor(securityStatus.vulnerabilities)}`}>
                {securityStatus.vulnerabilities.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Threat Activity */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-orange-300">Recent Threats</h4>
          <div className="space-y-2">
            {threats.map(threat => (
              <div key={threat.id} className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-orange-500/20">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    threat.type === 'blocked' ? 'bg-green-400' : 'bg-blue-400'
                  }`}></div>
                  <div>
                    <div className="text-gray-300 text-sm">{threat.source}</div>
                    <div className="text-gray-500 text-xs">{threat.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getThreatColor(threat.type, threat.severity)}`}>
                    {threat.type.toUpperCase()}
                  </div>
                  <div className="text-gray-500 text-xs">{threat.severity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Score */}
        <div className="mt-6 pt-4 border-t border-orange-500/20">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Security Score</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-black/30 rounded-full">
                <div className="w-14 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
              </div>
              <span className="text-green-400 font-bold text-sm">95%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityMatrix; 