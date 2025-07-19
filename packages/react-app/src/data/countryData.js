// Sample country data for the Interactive Globe
// In a real application, this would come from APIs like World Bank, REST Countries, etc.

export const countryData = [
  {
    id: 'USA',
    name: 'United States',
    lat: 39.8283,
    lng: -98.5795,
    population: 331000000,
    gdp: 21430000000000,
    connections: ['CAN', 'MEX', 'GBR', 'JPN', 'DEU'],
    connectionStrength: {
      'CAN': 0.9,
      'MEX': 0.8,
      'GBR': 0.7,
      'JPN': 0.6,
      'DEU': 0.5
    },
    tradeVolume: 4000000000000,
    techIndex: 95,
    carbonEmissions: 5416000000
  },
  {
    id: 'CAN',
    name: 'Canada',
    lat: 56.1304,
    lng: -106.3468,
    population: 38000000,
    gdp: 1736000000000,
    connections: ['USA', 'GBR', 'FRA'],
    connectionStrength: {
      'USA': 0.9,
      'GBR': 0.6,
      'FRA': 0.4
    },
    tradeVolume: 900000000000,
    techIndex: 88,
    carbonEmissions: 730000000
  },
  {
    id: 'MEX',
    name: 'Mexico',
    lat: 23.6345,
    lng: -102.5528,
    population: 128000000,
    gdp: 1269000000000,
    connections: ['USA', 'BRA', 'ARG'],
    connectionStrength: {
      'USA': 0.8,
      'BRA': 0.5,
      'ARG': 0.3
    },
    tradeVolume: 900000000000,
    techIndex: 62,
    carbonEmissions: 472000000
  },
  {
    id: 'BRA',
    name: 'Brazil',
    lat: -14.2350,
    lng: -51.9253,
    population: 212000000,
    gdp: 1869000000000,
    connections: ['ARG', 'MEX', 'USA', 'DEU'],
    connectionStrength: {
      'ARG': 0.7,
      'MEX': 0.5,
      'USA': 0.6,
      'DEU': 0.4
    },
    tradeVolume: 400000000000,
    techIndex: 58,
    carbonEmissions: 462000000
  },
  {
    id: 'ARG',
    name: 'Argentina',
    lat: -38.4161,
    lng: -63.6167,
    population: 45000000,
    gdp: 449000000000,
    connections: ['BRA', 'MEX', 'ESP'],
    connectionStrength: {
      'BRA': 0.7,
      'MEX': 0.3,
      'ESP': 0.5
    },
    tradeVolume: 120000000000,
    techIndex: 54,
    carbonEmissions: 198000000
  },
  {
    id: 'GBR',
    name: 'United Kingdom',
    lat: 55.3781,
    lng: -3.4360,
    population: 67000000,
    gdp: 2827000000000,
    connections: ['USA', 'DEU', 'FRA', 'CAN', 'AUS'],
    connectionStrength: {
      'USA': 0.7,
      'DEU': 0.8,
      'FRA': 0.9,
      'CAN': 0.6,
      'AUS': 0.5
    },
    tradeVolume: 1200000000000,
    techIndex: 92,
    carbonEmissions: 379000000
  },
  {
    id: 'DEU',
    name: 'Germany',
    lat: 51.1657,
    lng: 10.4515,
    population: 83000000,
    gdp: 3846000000000,
    connections: ['FRA', 'GBR', 'USA', 'CHN', 'ITA'],
    connectionStrength: {
      'FRA': 0.9,
      'GBR': 0.8,
      'USA': 0.5,
      'CHN': 0.7,
      'ITA': 0.8
    },
    tradeVolume: 2800000000000,
    techIndex: 90,
    carbonEmissions: 732000000
  },
  {
    id: 'FRA',
    name: 'France',
    lat: 46.2276,
    lng: 2.2137,
    population: 67000000,
    gdp: 2716000000000,
    connections: ['DEU', 'GBR', 'ESP', 'ITA', 'CAN'],
    connectionStrength: {
      'DEU': 0.9,
      'GBR': 0.9,
      'ESP': 0.8,
      'ITA': 0.7,
      'CAN': 0.4
    },
    tradeVolume: 1200000000000,
    techIndex: 87,
    carbonEmissions: 330000000
  },
  {
    id: 'ESP',
    name: 'Spain',
    lat: 40.4637,
    lng: -3.7492,
    population: 47000000,
    gdp: 1394000000000,
    connections: ['FRA', 'ARG', 'MEX', 'ITA'],
    connectionStrength: {
      'FRA': 0.8,
      'ARG': 0.5,
      'MEX': 0.4,
      'ITA': 0.6
    },
    tradeVolume: 700000000000,
    techIndex: 81,
    carbonEmissions: 258000000
  },
  {
    id: 'ITA',
    name: 'Italy',
    lat: 41.8719,
    lng: 12.5674,
    population: 60000000,
    gdp: 2001000000000,
    connections: ['DEU', 'FRA', 'ESP'],
    connectionStrength: {
      'DEU': 0.8,
      'FRA': 0.7,
      'ESP': 0.6
    },
    tradeVolume: 1000000000000,
    techIndex: 83,
    carbonEmissions: 335000000
  },
  {
    id: 'CHN',
    name: 'China',
    lat: 35.8617,
    lng: 104.1954,
    population: 1439000000,
    gdp: 14342000000000,
    connections: ['JPN', 'KOR', 'DEU', 'USA', 'IND'],
    connectionStrength: {
      'JPN': 0.8,
      'KOR': 0.9,
      'DEU': 0.7,
      'USA': 0.6,
      'IND': 0.5
    },
    tradeVolume: 4600000000000,
    techIndex: 78,
    carbonEmissions: 10175000000
  },
  {
    id: 'JPN',
    name: 'Japan',
    lat: 36.2048,
    lng: 138.2529,
    population: 126000000,
    gdp: 4941000000000,
    connections: ['CHN', 'KOR', 'USA', 'AUS'],
    connectionStrength: {
      'CHN': 0.8,
      'KOR': 0.7,
      'USA': 0.6,
      'AUS': 0.5
    },
    tradeVolume: 1400000000000,
    techIndex: 94,
    carbonEmissions: 1162000000
  },
  {
    id: 'KOR',
    name: 'South Korea',
    lat: 35.9078,
    lng: 127.7669,
    population: 52000000,
    gdp: 1811000000000,
    connections: ['CHN', 'JPN', 'USA'],
    connectionStrength: {
      'CHN': 0.9,
      'JPN': 0.7,
      'USA': 0.6
    },
    tradeVolume: 1200000000000,
    techIndex: 91,
    carbonEmissions: 616000000
  },
  {
    id: 'IND',
    name: 'India',
    lat: 20.5937,
    lng: 78.9629,
    population: 1380000000,
    gdp: 2875000000000,
    connections: ['CHN', 'USA', 'GBR', 'AUS'],
    connectionStrength: {
      'CHN': 0.5,
      'USA': 0.6,
      'GBR': 0.7,
      'AUS': 0.4
    },
    tradeVolume: 800000000000,
    techIndex: 65,
    carbonEmissions: 2654000000
  },
  {
    id: 'AUS',
    name: 'Australia',
    lat: -25.2744,
    lng: 133.7751,
    population: 25000000,
    gdp: 1393000000000,
    connections: ['JPN', 'CHN', 'USA', 'GBR', 'IND'],
    connectionStrength: {
      'JPN': 0.5,
      'CHN': 0.6,
      'USA': 0.6,
      'GBR': 0.5,
      'IND': 0.4
    },
    tradeVolume: 500000000000,
    techIndex: 86,
    carbonEmissions: 417000000
  },
  {
    id: 'RUS',
    name: 'Russia',
    lat: 61.5240,
    lng: 105.3188,
    population: 146000000,
    gdp: 1483000000000,
    connections: ['CHN', 'DEU', 'IND'],
    connectionStrength: {
      'CHN': 0.7,
      'DEU': 0.6,
      'IND': 0.4
    },
    tradeVolume: 700000000000,
    techIndex: 70,
    carbonEmissions: 1711000000
  },
  {
    id: 'ZAF',
    name: 'South Africa',
    lat: -30.5595,
    lng: 22.9375,
    population: 59000000,
    gdp: 419000000000,
    connections: ['GBR', 'USA', 'CHN'],
    connectionStrength: {
      'GBR': 0.6,
      'USA': 0.5,
      'CHN': 0.7
    },
    tradeVolume: 200000000000,
    techIndex: 58,
    carbonEmissions: 460000000
  },
  {
    id: 'NGA',
    name: 'Nigeria',
    lat: 9.0820,
    lng: 8.6753,
    population: 206000000,
    gdp: 432000000000,
    connections: ['USA', 'GBR', 'CHN'],
    connectionStrength: {
      'USA': 0.5,
      'GBR': 0.6,
      'CHN': 0.7
    },
    tradeVolume: 150000000000,
    techIndex: 45,
    carbonEmissions: 120000000
  },
  {
    id: 'EGY',
    name: 'Egypt',
    lat: 26.8206,
    lng: 30.8025,
    population: 102000000,
    gdp: 404000000000,
    connections: ['USA', 'DEU', 'ITA'],
    connectionStrength: {
      'USA': 0.4,
      'DEU': 0.5,
      'ITA': 0.6
    },
    tradeVolume: 90000000000,
    techIndex: 52,
    carbonEmissions: 234000000
  }
]

// Helper functions for data analysis
export const getDataModes = () => [
  { key: 'population', label: 'Population', unit: 'people' },
  { key: 'gdp', label: 'GDP', unit: 'USD' },
  { key: 'tradeVolume', label: 'Trade Volume', unit: 'USD' },
  { key: 'techIndex', label: 'Technology Index', unit: 'score' },
  { key: 'carbonEmissions', label: 'Carbon Emissions', unit: 'tonnes CO2' }
]

export const getCountryById = (id) => {
  return countryData.find(country => country.id === id)
}

export const getTopCountries = (dataMode, limit = 10) => {
  return [...countryData]
    .sort((a, b) => (b[dataMode] || 0) - (a[dataMode] || 0))
    .slice(0, limit)
}

export const getConnectionStrength = (countryId1, countryId2) => {
  const country = getCountryById(countryId1)
  return country?.connectionStrength?.[countryId2] || 0
}

export const getAllConnections = () => {
  const connections = []
  countryData.forEach(country => {
    if (country.connections) {
      country.connections.forEach(connectionId => {
        const strength = country.connectionStrength?.[connectionId] || 1
        connections.push({
          source: country.id,
          target: connectionId,
          strength,
          sourceCountry: country.name,
          targetCountry: getCountryById(connectionId)?.name
        })
      })
    }
  })
  return connections
}
