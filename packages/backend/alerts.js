const rules = [
  {
    metric: 'cpu',
    threshold: 80,
    level: 'warning',
    message: 'High CPU usage',
  },
  {
    metric: 'memory',
    threshold: 85,
    level: 'warning',
    message: 'High memory usage',
  },
  {
    metric: 'disk',
    threshold: 90,
    level: 'critical',
    message: 'High disk usage',
  },
];

const checkAlerts = (metrics) => {
  const alerts = [];
  for (const rule of rules) {
    if (metrics[rule.metric] > rule.threshold) {
      alerts.push({ ...rule });
    }
  }
  return alerts;
};

module.exports = { checkAlerts };

