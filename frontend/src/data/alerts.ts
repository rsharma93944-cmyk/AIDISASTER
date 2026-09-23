import { 
  AlertSeverity, 
  AlertStatus, 
  AlertTimelineEvent, 
  AlertItem,
  EscalationTimelineStage,
  EscalationStageStatus,
  EscalationStageName,
  calculateLocationRisk,
  generateAlertFromRisk
} from '../services/riskCalculationService';
import { RAW_LOCATIONS_DATA } from './rawLocationsData';

export type { AlertSeverity, AlertStatus, AlertTimelineEvent, AlertItem, EscalationTimelineStage, EscalationStageStatus, EscalationStageName };

export interface StateAlertStatus {
  state: string;
  code: string;
  status: 'Normal' | 'Monitoring' | 'Elevated' | 'High Risk';
  activeAlertCount: number;
}

// Generate unified prototype alerts directly from calculated risk states
export const INITIAL_PROTOTYPE_ALERTS: AlertItem[] = Object.values(RAW_LOCATIONS_DATA)
  .map(raw => {
    const riskData = calculateLocationRisk(raw);
    return generateAlertFromRisk(riskData);
  })
  .filter((alert): alert is AlertItem => alert !== null)
  .map((alert) => {
    // Preserve initial prototype statuses for realistic operational UI demonstration
    if (alert.locationId === 'itanagar' || alert.locationId === 'shillong') {
      return {
        ...alert,
        status: 'RESOLVED' as AlertStatus,
        resolvedAt: 'Yesterday, 16:30 IST',
        timeline: alert.timeline.map(t => ({ ...t, completed: true, active: false }))
      };
    }
    if (alert.locationId === 'guwahati') {
      return {
        ...alert,
        status: 'ACKNOWLEDGED' as AlertStatus,
        acknowledgedAt: 'Yesterday, 14:45 IST',
        timeline: alert.timeline.map(t => t.step === 'Acknowledged' ? { ...t, completed: true, active: false, timestamp: 'Yesterday, 14:45 IST' } : t.step === 'Resolved' ? { ...t, active: true } : t)
      };
    }
    return alert;
  })
  .sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
    return b.riskScore - a.riskScore;
  });

export const NER_STATE_STATUSES: StateAlertStatus[] = [
  { state: 'Arunachal Pradesh', code: 'AR', status: 'Monitoring', activeAlertCount: 0 },
  { state: 'Assam', code: 'AS', status: 'Elevated', activeAlertCount: 1 },
  { state: 'Manipur', code: 'MN', status: 'Normal', activeAlertCount: 0 },
  { state: 'Meghalaya', code: 'ML', status: 'Normal', activeAlertCount: 0 },
  { state: 'Mizoram', code: 'MZ', status: 'High Risk', activeAlertCount: 1 },
  { state: 'Nagaland', code: 'NL', status: 'Elevated', activeAlertCount: 1 },
  { state: 'Sikkim', code: 'SK', status: 'High Risk', activeAlertCount: 1 },
  { state: 'Tripura', code: 'TR', status: 'Normal', activeAlertCount: 0 }
];

export const getSeverityBadgeStyle = (severity: AlertSeverity): { bg: string; text: string; border: string; dot: string } => {
  switch (severity) {
    case 'LOW':
      return { bg: 'bg-[#244A36]/10', text: 'text-[#244A36]', border: 'border-[#244A36]/20', dot: 'bg-[#244A36]' };
    case 'MODERATE':
      return { bg: 'bg-[#C87941]/10', text: 'text-[#C87941]', border: 'border-[#C87941]/25', dot: 'bg-[#C87941]' };
    case 'HIGH':
      return { bg: 'bg-[#A05C2C]/10', text: 'text-[#A05C2C]', border: 'border-[#A05C2C]/25', dot: 'bg-[#A05C2C]' };
    case 'SEVERE':
      return { bg: 'bg-[#7A2E2E]/10', text: 'text-[#7A2E2E]', border: 'border-[#7A2E2E]/30', dot: 'bg-[#7A2E2E]' };
  }
};

export const getStatusBadgeStyle = (status: AlertStatus): { bg: string; text: string; border: string } => {
  switch (status) {
    case 'ACTIVE':
      return { bg: 'bg-[#C87941]/15', text: 'text-[#C87941]', border: 'border-[#C87941]/30' };
    case 'ACKNOWLEDGED':
      return { bg: 'bg-[#526E48]/15', text: 'text-[#526E48]', border: 'border-[#526E48]/30' };
    case 'RESOLVED':
      return { bg: 'bg-[#244A36]/10', text: 'text-[#244A36]', border: 'border-[#244A36]/20' };
  }
};

export const getStateStatusColor = (status: StateAlertStatus['status']): { bg: string; text: string } => {
  switch (status) {
    case 'Normal':
      return { bg: 'bg-[#244A36]/10', text: 'text-[#244A36]' };
    case 'Monitoring':
      return { bg: 'bg-[#526E48]/15', text: 'text-[#526E48]' };
    case 'Elevated':
      return { bg: 'bg-[#C87941]/15', text: 'text-[#C87941]' };
    case 'High Risk':
      return { bg: 'bg-[#7A2E2E]/15', text: 'text-[#7A2E2E]' };
  }
};

export const fetchAlerts = async (): Promise<AlertItem[]> => {
  return [...INITIAL_PROTOTYPE_ALERTS];
};

export const updateAlertStatus = async (_alertId: string, _status: AlertStatus): Promise<boolean> => {
  return true;
};
