export const WATER_QUALITY_STANDARDS = {
  pH: {
    min: 6.5,
    max: 8.5,
    ideal: 7.0,
    unit: '',
    description: 'Acceptable pH range for river water'
  },
  temperature: {
    min: 20,
    max: 30,
    ideal: 25,
    unit: '°C',
    description: 'Optimal temperature range for aquatic life'
  },
  ec: {
    min: 150,
    max: 500,
    ideal: 300,
    unit: 'µS/cm',
    description: 'Electrical conductivity'
  },
  tds: {
    min: 100,
    max: 500,
    ideal: 250,
    unit: 'mg/L',
    description: 'Total dissolved solids'
  },
  turbidity: {
    min: 0,
    max: 5,
    ideal: 1,
    unit: 'NTU',
    description: 'Turbidity level'
  }
};