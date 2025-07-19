import React from 'react';

const MetricCard = ({ 
  title, 
  value, 
  unit = '', 
  color = 'blue', 
  icon = '📊', 
  detailed = false, 
  additional = '' 
}) => {
  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        progress: 'bg-blue-500'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        progress: 'bg-green-500'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        progress: 'bg-purple-500'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        progress: 'bg-orange-500'
      },
      red: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        progress: 'bg-red-500'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const colors = getColorClasses(color);
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const displayValue = numericValue.toFixed(1);

  const getStatusColor = (value) => {
    if (value >= 90) return 'text-red-600';
    if (value >= 75) return 'text-orange-600';
    if (value >= 50) return 'text-yellow-600';
    return colors.text;
  };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-3 ${detailed ? 'p-4' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <h3 className={`font-medium ${colors.text} ${detailed ? 'text-sm' : 'text-xs'}`}>
            {title}
          </h3>
        </div>
        {detailed && (
          <div className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
            Live
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className={`text-xl font-bold ${getStatusColor(numericValue)} ${detailed ? 'text-2xl' : ''}`}>
            {displayValue}
            <span className="text-sm font-normal ml-1">{unit}</span>
          </div>
          {detailed && additional && (
            <div className="text-xs text-gray-500 mt-1">
              {additional}
            </div>
          )}
        </div>

        {/* Progress bar for percentage values */}
        {unit === '%' && (
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colors.progress} transition-all duration-500 ease-in-out`}
              style={{ width: `${Math.min(numericValue, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Status indicator */}
      {detailed && (
        <div className="flex items-center mt-3 space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            numericValue >= 90 ? 'bg-red-500' :
            numericValue >= 75 ? 'bg-orange-500' :
            numericValue >= 50 ? 'bg-yellow-500' :
            'bg-green-500'
          }`} />
          <span className="text-xs text-gray-500">
            {numericValue >= 90 ? 'Critical' :
             numericValue >= 75 ? 'High' :
             numericValue >= 50 ? 'Medium' :
             'Normal'}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
