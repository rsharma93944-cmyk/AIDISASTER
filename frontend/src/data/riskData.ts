import { 
  RiskLevel, 
  FactorIndicator, 
  ComputedRiskFactor,
  LocationProfile, 
  RiskTrendPoint, 
  LocationRiskData,
  calculateLocationRisk,
  getRiskColor,
  getIndicatorBadge
} from '../services/riskCalculationService';
import { RAW_LOCATIONS_DATA } from './rawLocationsData';

export type { RiskLevel, FactorIndicator, LocationProfile, RiskTrendPoint, LocationRiskData };
export type RiskFactor = ComputedRiskFactor;

// Master computed dictionary for all 8 NER locations
export const PROTOTYPE_RISK_DATA: Record<string, LocationRiskData> = {};
for (const [id, raw] of Object.entries(RAW_LOCATIONS_DATA)) {
  PROTOTYPE_RISK_DATA[id] = calculateLocationRisk(raw);
}

export { getRiskColor, getIndicatorBadge };

// API readiness mock service
export const fetchLocationRisk = async (locationId: string): Promise<LocationRiskData> => {
  return PROTOTYPE_RISK_DATA[locationId.toLowerCase()] || PROTOTYPE_RISK_DATA['kohima'];
};
