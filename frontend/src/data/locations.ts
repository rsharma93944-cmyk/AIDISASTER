import { 
  RiskLevel, 
  LocationRiskData, 
  MapLocationData,
  calculateLocationRisk, 
  convertToMapLocation, 
  getRiskColor 
} from '../services/riskCalculationService';
import { RAW_LOCATIONS_DATA } from './rawLocationsData';

export type { RiskLevel, LocationRiskData, MapLocationData };
export type LocationData = MapLocationData;

// Compute default prototype locations using the unified calculation engine
export const PROTOTYPE_LOCATIONS: LocationData[] = Object.values(RAW_LOCATIONS_DATA).map(raw => {
  const riskData = calculateLocationRisk(raw);
  return convertToMapLocation(riskData);
});

export { getRiskColor };
