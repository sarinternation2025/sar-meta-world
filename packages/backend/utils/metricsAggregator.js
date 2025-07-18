// Metrics aggregation utility for historical data processing
class MetricsAggregator {
  constructor() {
    this.data = [];
    this.maxDataPoints = 10000; // Maximum number of data points to keep
  }

  // Add a data point
  addDataPoint(metrics) {
    const dataPoint = {
      timestamp: Date.now(),
      cpu: metrics.cpu?.usage || 0,
      memory: metrics.memory?.percentage || 0,
      disk: metrics.disk?.percentage || 0,
      network: {
        upload: metrics.network?.upload || 0,
        download: metrics.network?.download || 0
      },
      temperature: metrics.cpu?.temperature || 0
    };

    this.data.push(dataPoint);

    // Remove old data points if we exceed the maximum
    if (this.data.length > this.maxDataPoints) {
      this.data.shift();
    }

    return dataPoint;
  }

  // Get data for a specific time range
  getDataRange(startTime, endTime) {
    return this.data.filter(point => 
      point.timestamp >= startTime && point.timestamp <= endTime
    );
  }

  // Get last N data points
  getLastNPoints(n) {
    return this.data.slice(-n);
  }

  // Calculate averages for a time period
  calculateAverages(startTime, endTime) {
    const rangeData = this.getDataRange(startTime, endTime);
    
    if (rangeData.length === 0) {
      return {
        cpu: 0,
        memory: 0,
        disk: 0,
        network: { upload: 0, download: 0 },
        temperature: 0,
        dataPoints: 0
      };
    }

    const totals = rangeData.reduce((acc, point) => {
      acc.cpu += point.cpu;
      acc.memory += point.memory;
      acc.disk += point.disk;
      acc.networkUpload += point.network.upload;
      acc.networkDownload += point.network.download;
      acc.temperature += point.temperature;
      return acc;
    }, { cpu: 0, memory: 0, disk: 0, networkUpload: 0, networkDownload: 0, temperature: 0 });

    const count = rangeData.length;

    return {
      cpu: Math.round((totals.cpu / count) * 100) / 100,
      memory: Math.round((totals.memory / count) * 100) / 100,
      disk: Math.round((totals.disk / count) * 100) / 100,
      network: {
        upload: Math.round((totals.networkUpload / count) * 100) / 100,
        download: Math.round((totals.networkDownload / count) * 100) / 100
      },
      temperature: Math.round((totals.temperature / count) * 100) / 100,
      dataPoints: count
    };
  }

  // Calculate peaks for a time period
  calculatePeaks(startTime, endTime) {
    const rangeData = this.getDataRange(startTime, endTime);
    
    if (rangeData.length === 0) {
      return {
        cpu: { max: 0, min: 0, timestamp: null },
        memory: { max: 0, min: 0, timestamp: null },
        disk: { max: 0, min: 0, timestamp: null }
      };
    }

    const peaks = {
      cpu: { max: -Infinity, min: Infinity, maxTimestamp: null, minTimestamp: null },
      memory: { max: -Infinity, min: Infinity, maxTimestamp: null, minTimestamp: null },
      disk: { max: -Infinity, min: Infinity, maxTimestamp: null, minTimestamp: null }
    };

    rangeData.forEach(point => {
      // CPU peaks
      if (point.cpu > peaks.cpu.max) {
        peaks.cpu.max = point.cpu;
        peaks.cpu.maxTimestamp = point.timestamp;
      }
      if (point.cpu < peaks.cpu.min) {
        peaks.cpu.min = point.cpu;
        peaks.cpu.minTimestamp = point.timestamp;
      }

      // Memory peaks
      if (point.memory > peaks.memory.max) {
        peaks.memory.max = point.memory;
        peaks.memory.maxTimestamp = point.timestamp;
      }
      if (point.memory < peaks.memory.min) {
        peaks.memory.min = point.memory;
        peaks.memory.minTimestamp = point.timestamp;
      }

      // Disk peaks
      if (point.disk > peaks.disk.max) {
        peaks.disk.max = point.disk;
        peaks.disk.maxTimestamp = point.timestamp;
      }
      if (point.disk < peaks.disk.min) {
        peaks.disk.min = point.disk;
        peaks.disk.minTimestamp = point.timestamp;
      }
    });

    return peaks;
  }

  // Get trend analysis
  getTrendAnalysis(metric, timeWindow = 300000) { // 5 minutes default
    const endTime = Date.now();
    const startTime = endTime - timeWindow;
    const rangeData = this.getDataRange(startTime, endTime);

    if (rangeData.length < 2) {
      return { trend: 'stable', change: 0, confidence: 0 };
    }

    const values = rangeData.map(point => point[metric]);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    const changePercent = (change / firstAvg) * 100;

    let trend = 'stable';
    if (Math.abs(changePercent) > 5) {
      trend = changePercent > 0 ? 'increasing' : 'decreasing';
    }

    return {
      trend,
      change: Math.round(changePercent * 100) / 100,
      confidence: Math.min(100, rangeData.length * 2) // Simple confidence based on data points
    };
  }

  // Generate summary statistics
  generateSummary(timeWindow = 3600000) { // 1 hour default
    const endTime = Date.now();
    const startTime = endTime - timeWindow;
    
    const averages = this.calculateAverages(startTime, endTime);
    const peaks = this.calculatePeaks(startTime, endTime);
    const trends = {
      cpu: this.getTrendAnalysis('cpu', timeWindow),
      memory: this.getTrendAnalysis('memory', timeWindow),
      disk: this.getTrendAnalysis('disk', timeWindow)
    };

    return {
      timeWindow: { start: startTime, end: endTime },
      averages,
      peaks,
      trends,
      dataPoints: this.getDataRange(startTime, endTime).length,
      generatedAt: Date.now()
    };
  }

  // Export data in different formats
  exportData(format = 'json', startTime = null, endTime = null) {
    let data;
    
    if (startTime && endTime) {
      data = this.getDataRange(startTime, endTime);
    } else {
      data = this.data;
    }

    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportAsCSV(data);
      case 'json':
      default:
        return {
          format: 'json',
          data: data,
          metadata: {
            totalPoints: data.length,
            startTime: data.length > 0 ? data[0].timestamp : null,
            endTime: data.length > 0 ? data[data.length - 1].timestamp : null,
            exportedAt: Date.now()
          }
        };
    }
  }

  // Export as CSV
  exportAsCSV(data) {
    const headers = ['timestamp', 'cpu', 'memory', 'disk', 'network_upload', 'network_download', 'temperature'];
    const rows = data.map(point => [
      point.timestamp,
      point.cpu,
      point.memory,
      point.disk,
      point.network.upload,
      point.network.download,
      point.temperature
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    return {
      format: 'csv',
      content: csvContent,
      filename: `metrics_${Date.now()}.csv`
    };
  }

  // Clear all data
  clearData() {
    this.data = [];
  }

  // Get current data length
  getDataLength() {
    return this.data.length;
  }

  // Get memory usage of aggregator
  getMemoryUsage() {
    return {
      dataPoints: this.data.length,
      estimatedMemoryMB: (this.data.length * 200) / (1024 * 1024), // Rough estimate
      maxDataPoints: this.maxDataPoints
    };
  }
}

module.exports = MetricsAggregator;
