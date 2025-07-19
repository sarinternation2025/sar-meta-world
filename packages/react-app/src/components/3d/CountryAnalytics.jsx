import React, { useState, useMemo } from 'react'
import { getDataModes, getTopCountries, getAllConnections } from '../../data/countryData'
import './CountryAnalytics.css'

const CountryAnalytics = ({ 
  selectedCountry, 
  dataMode,
  onDataModeChange,
  onCountrySelect,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const dataModes = getDataModes()
  const topCountries = useMemo(() => getTopCountries(dataMode, 5), [dataMode])
  const connections = useMemo(() => getAllConnections(), [])

  const formatNumber = (num, unit) => {
    if (!num) return 'N/A'
    
    if (unit === 'USD' && num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`
    } else if (unit === 'USD' && num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    } else if (unit === 'people' && num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (unit === 'tonnes CO2' && num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}Mt`
    }
    
    return num.toLocaleString()
  }

  const getCountryConnections = (country) => {
    if (!country?.connections) return []
    
    return country.connections.map(connId => {
      const strength = country.connectionStrength?.[connId] || 1
      const connection = connections.find(c => 
        c.source === country.id && c.target === connId
      )
      return {
        id: connId,
        name: connection?.targetCountry || connId,
        strength
      }
    }).sort((a, b) => b.strength - a.strength)
  }

  const renderOverviewTab = () => (
    <div className="analytics-overview">
      {selectedCountry ? (
        <div className="country-details">
          <div className="country-header">
            <h2>{selectedCountry.name}</h2>
            <span className="country-code">{selectedCountry.id}</span>
          </div>
          
          <div className="country-metrics">
            <div className="metric-card">
              <div className="metric-label">Population</div>
              <div className="metric-value">
                {formatNumber(selectedCountry.population, 'people')}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">GDP</div>
              <div className="metric-value">
                {formatNumber(selectedCountry.gdp, 'USD')}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Trade Volume</div>
              <div className="metric-value">
                {formatNumber(selectedCountry.tradeVolume, 'USD')}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Tech Index</div>
              <div className="metric-value">
                {selectedCountry.techIndex}/100
              </div>
            </div>
          </div>

          <div className="country-connections">
            <h3>Key Connections</h3>
            <div className="connections-list">
              {getCountryConnections(selectedCountry).map(connection => (
                <div 
                  key={connection.id} 
                  className="connection-item"
                  onClick={() => {
                    import('../../data/countryData').then(({ countryData }) => {
                      const targetCountry = countryData.find(c => c.id === connection.id)
                      if (targetCountry) onCountrySelect?.(targetCountry)
                    })
                  }}
                >
                  <span className="connection-name">{connection.name}</span>
                  <div className="connection-strength">
                    <div 
                      className="strength-bar"
                      style={{ width: `${connection.strength * 100}%` }}
                    />
                    <span className="strength-value">
                      {Math.round(connection.strength * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="no-selection">
          <h3>Select a country to view analytics</h3>
          <p>Click on any country marker on the globe to see detailed information.</p>
        </div>
      )}
    </div>
  )

  const renderRankingsTab = () => (
    <div className="analytics-rankings">
      <div className="data-mode-selector">
        <label>Ranking by:</label>
        <select 
          value={dataMode} 
          onChange={(e) => onDataModeChange?.(e.target.value)}
          className="data-mode-select"
        >
          {dataModes.map(mode => (
            <option key={mode.key} value={mode.key}>
              {mode.label}
            </option>
          ))}
        </select>
      </div>

      <div className="top-countries-list">
        <h3>Top Countries - {dataModes.find(m => m.key === dataMode)?.label}</h3>
        {topCountries.map((country, index) => (
          <div 
            key={country.id}
            className={`country-rank-item ${selectedCountry?.id === country.id ? 'selected' : ''}`}
            onClick={() => onCountrySelect?.(country)}
          >
            <div className="rank-number">#{index + 1}</div>
            <div className="country-info">
              <div className="country-name">{country.name}</div>
              <div className="country-value">
                {formatNumber(
                  country[dataMode], 
                  dataModes.find(m => m.key === dataMode)?.unit
                )}
              </div>
            </div>
            <div className="rank-bar">
              <div 
                className="rank-progress"
                style={{ 
                  width: `${(country[dataMode] / topCountries[0][dataMode]) * 100}%` 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderNetworkTab = () => (
    <div className="analytics-network">
      <h3>Global Network Analysis</h3>
      
      <div className="network-stats">
        <div className="network-stat">
          <div className="stat-value">{connections.length}</div>
          <div className="stat-label">Total Connections</div>
        </div>
        
        <div className="network-stat">
          <div className="stat-value">
            {Math.round(connections.reduce((sum, c) => sum + c.strength, 0) / connections.length * 100)}%
          </div>
          <div className="stat-label">Avg Connection Strength</div>
        </div>
        
        <div className="network-stat">
          <div className="stat-value">
            {Math.max(...connections.map(c => c.strength * 100)).toFixed(0)}%
          </div>
          <div className="stat-label">Strongest Connection</div>
        </div>
      </div>

      <div className="strongest-connections">
        <h4>Strongest Global Connections</h4>
        {connections
          .sort((a, b) => b.strength - a.strength)
          .slice(0, 10)
          .map((connection, index) => (
            <div key={`${connection.source}-${connection.target}`} className="connection-row">
              <div className="connection-countries">
                {connection.sourceCountry} ↔ {connection.targetCountry}
              </div>
              <div className="connection-strength-display">
                <div 
                  className="strength-indicator"
                  style={{ width: `${connection.strength * 100}%` }}
                />
                <span>{Math.round(connection.strength * 100)}%</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  )

  return (
    <div className={`country-analytics ${className}`}>
      <div className="analytics-header">
        <h2>Country Analytics</h2>
        <div className="analytics-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'rankings' ? 'active' : ''}`}
            onClick={() => setActiveTab('rankings')}
          >
            Rankings
          </button>
          <button 
            className={`tab ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            Network
          </button>
        </div>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'rankings' && renderRankingsTab()}
        {activeTab === 'network' && renderNetworkTab()}
      </div>
    </div>
  )
}

export default CountryAnalytics
