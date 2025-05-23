import { WATER_QUALITY_STANDARDS } from '../constants/waterQualityStandards';

export function predictWaterQuality(historicalData, stationId) {
  if (!historicalData || historicalData.length === 0) return null;

  // Filter data for specific station if stationId provided
  const stationData = stationId !== "all" ? 
    historicalData.filter(item => item.stationId._id === stationId) :
    historicalData;

  if (stationData.length === 0) return null;

  // Calculate predictions for each parameter
  const predictions = {};
  const parameters = ['pH', 'temperature', 'ec', 'tds', 'turbidity'];

  parameters.forEach(param => {
    const values = stationData.map(item => Number(item[param] || 0));
    const currentValue = values[values.length - 1];
    const trend = calculateTrend(values);
    const predictedValue = Math.max(0, currentValue + trend);

    predictions[param] = {
      current: currentValue,
      predicted: Number(predictedValue.toFixed(2)),
      trend: getTrendDirection(trend),
      status: getPredictionStatus(predictedValue, WATER_QUALITY_STANDARDS[param]),
      unit: WATER_QUALITY_STANDARDS[param].unit
    };
  });

  return predictions;
}

function calculateTrend(values) {
  if (values.length < 2) return 0;
  
  const recentValues = values.slice(-3); // Use last 3 readings
  const differences = [];
  
  for (let i = 1; i < recentValues.length; i++) {
    differences.push(recentValues[i] - recentValues[i - 1]);
  }
  
  return differences.reduce((a, b) => a + b, 0) / differences.length;
}

function getTrendDirection(trend) {
  if (Math.abs(trend) < 0.1) return 'stable';
  return trend > 0 ? 'increasing' : 'decreasing';
}

function getPredictionStatus(value, standard) {
  if (value < standard.min) return 'below';
  if (value > standard.max) return 'above';
  return 'normal';
}