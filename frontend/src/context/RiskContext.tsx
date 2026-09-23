import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  RiskLevel, 
  FactorIndicator, 
  AlertStatus, 
  LocationRiskData, 
  MapLocationData, 
  AlertItem, 
  calculateLocationRisk, 
  convertToMapLocation, 
  generateAlertFromRisk, 
  buildEscalationTimeline,
  RawLocationProfile,
  getRiskColor,
  getIndicatorBadge
} from '../services/riskCalculationService';
import { RAW_LOCATIONS_DATA } from '../data/rawLocationsData';

interface RiskContextType {
  // Current active selection
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
  selectedRiskData: LocationRiskData;
  
  // Master lists
  locations: MapLocationData[];
  riskDataMap: Record<string, LocationRiskData>;
  rawProfiles: Record<string, RawLocationProfile>;
  
  // Alerts state
  alerts: AlertItem[];
  activeAlertsCount: number;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  
  // Factor modification & simulation
  updateFactorScore: (locationId: string, factorKey: 'rainfall' | 'slope' | 'soilTerrain' | 'groundMovement' | 'satellite' | 'historical', newScore: number, newIndicator?: FactorIndicator, newValueDisplay?: string) => void;
  
  // Helpers
  getRiskColor: (level: RiskLevel) => string;
  getIndicatorBadge: (indicator: FactorIndicator) => { bg: string; text: string; border: string };
  isPrototype: boolean;
  lastUpdated: string;
}

const RiskContext = createContext<RiskContextType | undefined>(undefined);

export function RiskProvider({ children }: { children: React.ReactNode }) {
  // Store raw profiles to allow dynamic recalculations
  const [rawProfiles, setRawProfiles] = useState<Record<string, RawLocationProfile>>(RAW_LOCATIONS_DATA);
  const [selectedLocationId, setSelectedLocationIdState] = useState<string>('kohima');
  const [alertOverrides, setAlertOverrides] = useState<Record<string, { status: AlertStatus; acknowledgedAt?: string; resolvedAt?: string }>>({});
  const [lastUpdated, setLastUpdated] = useState<string>('Prototype Data');

  // Read URL params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locParam = params.get('location') || params.get('id');
    if (locParam) {
      const normalized = locParam.toLowerCase();
      if (rawProfiles[normalized]) {
        setSelectedLocationIdState(normalized);
      } else {
        const found = Object.values(rawProfiles).find(p => p.name.toLowerCase() === normalized);
        if (found) {
          setSelectedLocationIdState(found.id);
        }
      }
    }
  }, []);

  // Update selected location and synchronize with URL if needed
  const setSelectedLocationId = useCallback((id: string) => {
    const normalized = id.toLowerCase();
    if (rawProfiles[normalized]) {
      setSelectedLocationIdState(normalized);
      const url = new URL(window.location.href);
      url.searchParams.set('location', normalized);
      window.history.replaceState({}, '', url.toString());
    }
  }, [rawProfiles]);

  // Compute all LocationRiskData from current raw profiles
  const riskDataMap = useMemo(() => {
    const result: Record<string, LocationRiskData> = {};
    for (const [id, raw] of Object.entries(rawProfiles)) {
      result[id] = calculateLocationRisk(raw);
    }
    return result;
  }, [rawProfiles]);

  // Convert to MapLocationData array for LiveMap
  const locations = useMemo(() => {
    return Object.values(riskDataMap).map(convertToMapLocation);
  }, [riskDataMap]);

  // Derive unified alerts list
  const alerts = useMemo(() => {
    const generated: AlertItem[] = [];
    for (const riskData of Object.values(riskDataMap)) {
      const override = alertOverrides[riskData.id];
      const alert = generateAlertFromRisk(riskData);
      if (alert) {
        if (override) {
          alert.status = override.status;
          alert.acknowledgedAt = override.acknowledgedAt;
          alert.resolvedAt = override.resolvedAt;
          if (override.status === 'ACKNOWLEDGED') {
            alert.timeline = alert.timeline.map(t => {
              if (t.step === 'Acknowledged') return { ...t, completed: true, active: false, timestamp: override.acknowledgedAt || 'Just now' };
              if (t.step === 'Resolved') return { ...t, active: true };
              return t;
            });
          } else if (override.status === 'RESOLVED') {
            alert.timeline = alert.timeline.map(t => {
              if (t.step === 'Acknowledged' && !t.completed) return { ...t, completed: true, active: false, timestamp: override.acknowledgedAt || 'Earlier' };
              if (t.step === 'Resolved') return { ...t, completed: true, active: false, timestamp: override.resolvedAt || 'Just now' };
              return t;
            });
          }
          // Rebuild escalation timeline to reflect the updated status
          alert.escalationTimeline = buildEscalationTimeline(
            riskData,
            override.status,
            alert.detectedAt,
            override.acknowledgedAt,
            override.resolvedAt
          );
        }
        generated.push(alert);
      }
    }

    // Sort: ACTIVE first, then by riskScore descending
    return generated.sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      return b.riskScore - a.riskScore;
    });
  }, [riskDataMap, alertOverrides]);

  const activeAlertsCount = useMemo(() => {
    return alerts.filter(a => a.status === 'ACTIVE').length;
  }, [alerts]);

  // Selected Location Risk Data
  const selectedRiskData = useMemo(() => {
    return riskDataMap[selectedLocationId] || riskDataMap['kohima'] || Object.values(riskDataMap)[0];
  }, [riskDataMap, selectedLocationId]);

  // Acknowledge Alert Handler
  const acknowledgeAlert = useCallback((alertId: string) => {
    const targetAlert = alerts.find(a => a.id === alertId);
    if (targetAlert) {
      setAlertOverrides(prev => ({
        ...prev,
        [targetAlert.locationId]: {
          status: 'ACKNOWLEDGED',
          acknowledgedAt: 'Just now'
        }
      }));
    }
  }, [alerts]);

  // Resolve Alert Handler
  const resolveAlert = useCallback((alertId: string) => {
    const targetAlert = alerts.find(a => a.id === alertId);
    if (targetAlert) {
      setAlertOverrides(prev => ({
        ...prev,
        [targetAlert.locationId]: {
          status: 'RESOLVED',
          resolvedAt: 'Just now'
        }
      }));
    }
  }, [alerts]);

  // Dynamically update factor score and recalculate
  const updateFactorScore = useCallback((
    locationId: string, 
    factorKey: 'rainfall' | 'slope' | 'soilTerrain' | 'groundMovement' | 'satellite' | 'historical', 
    newScore: number, 
    newIndicator?: FactorIndicator, 
    newValueDisplay?: string
  ) => {
    setRawProfiles(prev => {
      const loc = prev[locationId];
      if (!loc) return prev;

      const currentFactor = loc.factors[factorKey];
      const indicator = newIndicator || (newScore >= 80 ? 'Critical' : newScore >= 60 ? 'High' : newScore >= 35 ? 'Elevated' : 'Normal');

      return {
        ...prev,
        [locationId]: {
          ...loc,
          factors: {
            ...loc.factors,
            [factorKey]: {
              ...currentFactor,
              rawScore: Math.min(100, Math.max(0, newScore)),
              indicator,
              valueDisplay: newValueDisplay || currentFactor.valueDisplay,
            }
          }
        }
      };
    });
    setLastUpdated('Updated just now (Prototype Calculated)');
  }, []);

  const value = useMemo(() => ({
    selectedLocationId,
    setSelectedLocationId,
    selectedRiskData,
    locations,
    riskDataMap,
    rawProfiles,
    alerts,
    activeAlertsCount,
    acknowledgeAlert,
    resolveAlert,
    updateFactorScore,
    getRiskColor,
    getIndicatorBadge,
    isPrototype: true,
    lastUpdated,
  }), [
    selectedLocationId,
    setSelectedLocationId,
    selectedRiskData,
    locations,
    riskDataMap,
    rawProfiles,
    alerts,
    activeAlertsCount,
    acknowledgeAlert,
    resolveAlert,
    updateFactorScore,
    lastUpdated
  ]);

  return (
    <RiskContext.Provider value={value}>
      {children}
    </RiskContext.Provider>
  );
}

export function useRisk(): RiskContextType {
  const context = useContext(RiskContext);
  if (!context) {
    throw new Error('useRisk must be used within a RiskProvider');
  }
  return context;
}
