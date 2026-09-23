/**
 * ResQAI Unified Risk Calculation Service
 * 
 * Computes deterministic Landslide Risk Scores and Risk Levels across all locations
 * using the 6 standardized environmental and geological risk factors:
 * 
 * 1. Rainfall (25% weight)
 * 2. Slope (20% weight)
 * 3. Soil / Terrain (15% weight)
 * 4. Ground Movement (15% weight)
 * 5. Satellite / InSAR Indicator (15% weight)
 * 6. Historical Landslide Activity (10% weight)
 */

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
export type FactorIndicator = 'Normal' | 'Elevated' | 'High' | 'Critical';
export type AlertSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface FactorInput {
  name: string;
  category: 'Rainfall' | 'Slope' | 'Soil / Terrain' | 'Ground Movement' | 'Satellite Indicator' | 'Historical Landslide Activity';
  rawScore: number; // 0 to 100
  indicator: FactorIndicator;
  valueDisplay: string; // e.g. "74mm/24h", "42° Escarpment"
  explanation: string;
  contributionTag: string; // e.g. "Major Driver", "Critical Factor"
}

export interface RawLocationProfile {
  id: string;
  name: string;
  state: string;
  terrainType: string;
  elevation: string;
  slopeCondition: string;
  historicalActivity: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  factors: {
    rainfall: FactorInput;
    slope: FactorInput;
    soilTerrain: FactorInput;
    groundMovement: FactorInput;
    satellite: FactorInput;
    historical: FactorInput;
  };
  historicalTrendBase: number[]; // 4 past points before current
}

export interface ComputedRiskFactor {
  name: string;
  category: 'Rainfall' | 'Slope' | 'Soil / Terrain' | 'Ground Movement' | 'Satellite Indicator' | 'Historical Landslide Activity';
  indicator: FactorIndicator;
  valueDisplay: string;
  explanation: string;
  contribution: number; // 0 - 100
  contributionTag: string;
  weightedImpact: number; // contribution * weight
}

export interface RiskTrendPoint {
  timePoint: string;
  riskScore: number;
  label: string;
}

export interface LocationProfile {
  location: string;
  state: string;
  terrainType: string;
  elevation: string;
  slopeCondition: string;
  historicalActivity: string;
  coordinates: { lat: number; lng: number };
}

export interface LocationRiskData {
  id: string;
  location: string;
  state: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  riskStatus: string;
  lastUpdated: string;
  monitoringStatus: string;
  profile: LocationProfile;
  factors: {
    rainfall: ComputedRiskFactor;
    slope: ComputedRiskFactor;
    soilTerrain: ComputedRiskFactor;
    groundMovement: ComputedRiskFactor;
    satellite: ComputedRiskFactor;
    historical: ComputedRiskFactor;
  };
  riskContributions: {
    factor: string;
    weightPercentage: number;
    indicator: FactorIndicator;
  }[];
  explanation: string;
  recommendedAction: {
    summary: string;
    priority: 'Low' | 'Medium' | 'High' | 'Immediate';
    details: string;
  };
  trend: RiskTrendPoint[];
}

export interface MapLocationData {
  id: string;
  name: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  riskLevel: RiskLevel;
  riskScore: number;
  rainfall: string;
  slope: string;
  soilTerrain: string;
  groundMovement: string;
  satelliteIndicator: string;
  historicalActivity: string;
  recentActivity: string;
  lastUpdated: string;
}

export interface AlertTimelineEvent {
  step: 'Detected' | 'Reviewed' | 'Acknowledged' | 'Resolved';
  timestamp: string;
  completed: boolean;
  active: boolean;
  description: string;
}

export type EscalationStageStatus = 'completed' | 'active' | 'pending';

export type EscalationStageName =
  | 'Detection'
  | 'AI Screening'
  | 'Risk Assessment'
  | 'Alert Generated'
  | 'Review'
  | 'Warning / Action';

export interface EscalationTimelineStage {
  stage: EscalationStageName;
  status: EscalationStageStatus;
  timestamp: string | null;
  description: string;
  details: Record<string, string>;
}

export interface AlertItem {
  id: string;
  locationId: string;
  location: string;
  state: string;
  severity: AlertSeverity;
  riskLevel: AlertSeverity;
  riskScore: number;
  status: AlertStatus;
  trigger: string;
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  recommendedAction: string;
  actionPriority: 'Low' | 'Medium' | 'High' | 'Immediate';
  factors: {
    rainfall: string;
    slope: string;
    soilTerrain: string;
    groundMovement: string;
    satelliteIndicator: string;
    historicalActivity: string;
  };
  timeline: AlertTimelineEvent[];
  escalationTimeline?: EscalationTimelineStage[];
}

// Weights defined for standard multi-criteria landslide risk indexing
export const RISK_WEIGHTS = {
  rainfall: 0.25,
  slope: 0.20,
  soilTerrain: 0.15,
  groundMovement: 0.15,
  satellite: 0.15,
  historical: 0.10,
};

/**
 * Maps numeric risk score (0-100) to standard RiskLevel
 */
export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'SEVERE';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MODERATE';
  return 'LOW';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW':
      return '#244A36'; // Forest Green
    case 'MODERATE':
      return '#C87941'; // Earthy Orange
    case 'HIGH':
      return '#A05C2C'; // Deep Amber / Brown
    case 'SEVERE':
      return '#7A2E2E'; // Dark Crimson Red
    default:
      return '#244A36';
  }
}

export function getIndicatorBadge(indicator: FactorIndicator): { bg: string; text: string; border: string } {
  switch (indicator) {
    case 'Critical':
      return { bg: 'bg-[#7A2E2E]/10', text: 'text-[#7A2E2E]', border: 'border-[#7A2E2E]/25' };
    case 'High':
      return { bg: 'bg-[#A05C2C]/10', text: 'text-[#A05C2C]', border: 'border-[#A05C2C]/25' };
    case 'Elevated':
      return { bg: 'bg-[#C87941]/10', text: 'text-[#C87941]', border: 'border-[#C87941]/25' };
    case 'Normal':
    default:
      return { bg: 'bg-[#244A36]/10', text: 'text-[#244A36]', border: 'border-[#244A36]/20' };
  }
}

/**
 * Calculates complete LocationRiskData from raw factor inputs
 */
export function calculateLocationRisk(raw: RawLocationProfile): LocationRiskData {
  const f = raw.factors;

  // Compute weighted sum
  const weightedSum = 
    f.rainfall.rawScore * RISK_WEIGHTS.rainfall +
    f.slope.rawScore * RISK_WEIGHTS.slope +
    f.soilTerrain.rawScore * RISK_WEIGHTS.soilTerrain +
    f.groundMovement.rawScore * RISK_WEIGHTS.groundMovement +
    f.satellite.rawScore * RISK_WEIGHTS.satellite +
    f.historical.rawScore * RISK_WEIGHTS.historical;

  const riskScore = Math.min(100, Math.max(0, Math.round(weightedSum)));
  const riskLevel = getRiskLevelFromScore(riskScore);

  // Compute individual factor objects
  const computedFactors = {
    rainfall: {
      ...f.rainfall,
      contribution: f.rainfall.rawScore,
      weightedImpact: Math.round(f.rainfall.rawScore * RISK_WEIGHTS.rainfall),
    },
    slope: {
      ...f.slope,
      contribution: f.slope.rawScore,
      weightedImpact: Math.round(f.slope.rawScore * RISK_WEIGHTS.slope),
    },
    soilTerrain: {
      ...f.soilTerrain,
      contribution: f.soilTerrain.rawScore,
      weightedImpact: Math.round(f.soilTerrain.rawScore * RISK_WEIGHTS.soilTerrain),
    },
    groundMovement: {
      ...f.groundMovement,
      contribution: f.groundMovement.rawScore,
      weightedImpact: Math.round(f.groundMovement.rawScore * RISK_WEIGHTS.groundMovement),
    },
    satellite: {
      ...f.satellite,
      contribution: f.satellite.rawScore,
      weightedImpact: Math.round(f.satellite.rawScore * RISK_WEIGHTS.satellite),
    },
    historical: {
      ...f.historical,
      contribution: f.historical.rawScore,
      weightedImpact: Math.round(f.historical.rawScore * RISK_WEIGHTS.historical),
    },
  };

  // Rank factors by contribution
  const factorEntries = [
    { factor: `${f.slope.name} (${f.slope.valueDisplay})`, weightPercentage: f.slope.rawScore, indicator: f.slope.indicator },
    { factor: `${f.rainfall.name} (${f.rainfall.valueDisplay})`, weightPercentage: f.rainfall.rawScore, indicator: f.rainfall.indicator },
    { factor: `${f.groundMovement.name}`, weightPercentage: f.groundMovement.rawScore, indicator: f.groundMovement.indicator },
    { factor: `${f.satellite.name}`, weightPercentage: f.satellite.rawScore, indicator: f.satellite.indicator },
    { factor: `${f.soilTerrain.name}`, weightPercentage: f.soilTerrain.rawScore, indicator: f.soilTerrain.indicator },
    { factor: `${f.historical.name}`, weightPercentage: f.historical.rawScore, indicator: f.historical.indicator },
  ].sort((a, b) => b.weightPercentage - a.weightPercentage);

  // Status and recommendations based on computed riskLevel
  let riskStatus = 'Nominal / Stable Operating Conditions';
  let priority: 'Low' | 'Medium' | 'High' | 'Immediate' = 'Low';
  let summary = 'Continue baseline monitoring.';
  let details = 'Maintain standard telemetry polling intervals (60 mins) and automated weather station connectivity.';
  let monitoringStatus = 'Baseline Surveillance Active';
  let explanation = '';

  if (riskLevel === 'SEVERE') {
    riskStatus = 'Critical Slope Failure Warning';
    priority = 'Immediate';
    summary = 'Prioritize immediate geotechnical assessment and emergency advisory.';
    details = 'Dispatch emergency geotechnical taskforce, advise immediate civil defense evacuation for downhill settlement clusters, and restrict arterial ridge traffic.';
    monitoringStatus = 'Urgent High-Frequency Telemetry';
    explanation = `Current prototype indicators indicate severe landslide risk driven by critical rainfall saturation (${f.rainfall.valueDisplay}), dangerous slope angles (${f.slope.valueDisplay}), and active sub-surface ground displacement (${f.groundMovement.valueDisplay}).`;
  } else if (riskLevel === 'HIGH') {
    riskStatus = 'Precautionary Advisory Active';
    priority = 'High';
    summary = 'Issue precautionary alert and closely monitor vulnerable slope sectors.';
    details = 'Deploy highway safety personnel along arterial checkpoints, alert local State Disaster Management Authority, and poll borehole pore pressure sensors at 15-minute intervals.';
    monitoringStatus = 'Intensive Telemetry Polling';
    explanation = `Current prototype indicators suggest high landslide risk due to steep terrain gradients (${f.slope.valueDisplay}), elevated rainfall volume (${f.rainfall.valueDisplay}), and active ground deformation.`;
  } else if (riskLevel === 'MODERATE') {
    riskStatus = 'Advisory Surveillance in Progress';
    priority = 'Medium';
    summary = 'Maintain active surveillance on steep cuts and drainage culverts.';
    details = 'Inspect municipal retaining barriers, ensure drainage channels remain clear, and monitor slope sensors during ongoing precipitation.';
    monitoringStatus = 'Active Sensor Network';
    explanation = `Current prototype indicators indicate moderate landslide risk with elevated rainfall (${f.rainfall.valueDisplay}) across moderate terrain slopes (${f.slope.valueDisplay}).`;
  } else {
    explanation = `Current prototype indicators suggest low landslide risk due to gentle terrain topography (${f.slope.valueDisplay}), baseline rainfall levels (${f.rainfall.valueDisplay}), and absence of ground displacement.`;
  }

  // Trend points
  const timeLabels = ['T-48h', 'T-36h', 'T-24h', 'T-12h', 'Current'];
  const trend: RiskTrendPoint[] = [
    ...(raw.historicalTrendBase.map((val, idx) => ({
      timePoint: timeLabels[idx] || `T-${(4 - idx) * 12}h`,
      riskScore: val,
      label: getRiskLevelFromScore(val),
    }))),
    {
      timePoint: 'Current',
      riskScore,
      label: riskLevel,
    }
  ];

  return {
    id: raw.id,
    location: raw.name,
    state: raw.state,
    riskLevel,
    riskScore,
    riskStatus,
    lastUpdated: 'Prototype Data (Consistent)',
    monitoringStatus,
    profile: {
      location: raw.name,
      state: raw.state,
      terrainType: raw.terrainType,
      elevation: raw.elevation,
      slopeCondition: raw.slopeCondition,
      historicalActivity: raw.historicalActivity,
      coordinates: raw.coordinates,
    },
    factors: computedFactors,
    riskContributions: factorEntries,
    explanation,
    recommendedAction: {
      summary,
      priority,
      details,
    },
    trend,
  };
}

/**
 * Converts LocationRiskData into MapLocationData for LiveMap
 */
export function convertToMapLocation(riskData: LocationRiskData): MapLocationData {
  return {
    id: riskData.id,
    name: riskData.location,
    state: riskData.state,
    coordinates: riskData.profile.coordinates,
    riskLevel: riskData.riskLevel,
    riskScore: riskData.riskScore,
    rainfall: `${riskData.factors.rainfall.indicator} (${riskData.factors.rainfall.valueDisplay})`,
    slope: `${riskData.factors.slope.indicator} (${riskData.factors.slope.valueDisplay})`,
    soilTerrain: `${riskData.factors.soilTerrain.indicator} Lithology`,
    groundMovement: riskData.factors.groundMovement.indicator === 'Normal' ? 'Stable' : `${riskData.factors.groundMovement.indicator} Displacement`,
    satelliteIndicator: riskData.factors.satellite.indicator,
    historicalActivity: riskData.factors.historical.indicator === 'Normal' ? 'Low Incidence' : 'Historical Slide Hotspot',
    recentActivity: riskData.riskLevel === 'SEVERE' 
      ? 'Major slide warning active'
      : riskData.riskLevel === 'HIGH'
        ? 'Minor slip & micro-displacement'
        : riskData.riskLevel === 'MODERATE'
          ? 'Advisory clearance active'
          : 'None reported',
    lastUpdated: 'Prototype Data',
  };
}

/**
 * Builds the 6-stage escalation timeline for an alert based on its current status
 * and computed risk data. Stages derive their completion status from AlertStatus
 * so the timeline updates automatically when the alert is acknowledged or resolved.
 */
export function buildEscalationTimeline(
  riskData: LocationRiskData,
  alertStatus: AlertStatus,
  detectedAt: string,
  acknowledgedAt?: string,
  resolvedAt?: string
): EscalationTimelineStage[] {
  // Determine how far along the pipeline we are
  const isAcknowledged = alertStatus === 'ACKNOWLEDGED' || alertStatus === 'RESOLVED';
  const isResolved = alertStatus === 'RESOLVED';

  // Derive detection time (offset by prototype minutes)
  const baseTime = detectedAt || 'Today, 07:15 IST';

  // Derive screening time
  const screeningCompletedDesc = riskData.riskLevel === 'LOW'
    ? 'No significant visual indicators detected.'
    : riskData.riskLevel === 'MODERATE'
      ? 'AI-assisted screening flagged moderate terrain displacement patterns.'
      : riskData.riskLevel === 'HIGH'
        ? 'AI-assisted screening detected elevated slope instability indicators.'
        : 'AI-assisted screening identified critical terrain failure signatures.';

  // Derive recommended action text
  const actionText = isResolved
    ? 'Response actions completed. Area stabilized.'
    : isAcknowledged
      ? riskData.recommendedAction.summary
      : 'Pending review before action recommendations are dispatched.';

  const actionStatus: EscalationStageStatus = isResolved ? 'completed' : isAcknowledged ? 'active' : 'pending';

  return [
    {
      stage: 'Detection',
      status: 'completed',
      timestamp: baseTime,
      description: 'Environmental indicators or reported evidence triggered an initial risk signal.',
      details: {
        'Location': `${riskData.location}, ${riskData.state}`,
        'Trigger Source': `Prototype sensor network — ${riskData.factors.rainfall.indicator} rainfall`,
        'Elevation': riskData.profile.elevation,
      },
    },
    {
      stage: 'AI Screening',
      status: 'completed',
      timestamp: baseTime.replace(/\d{2}:\d{2}/, (m) => {
        const [h, min] = m.split(':').map(Number);
        const newMin = min + 1;
        return `${String(h).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
      }),
      description: screeningCompletedDesc,
      details: {
        'Image Analysis': 'Prototype — visual evidence screening',
        'YOLO11 Status': riskData.riskScore >= 60 ? 'Anomaly patterns flagged' : 'No critical anomalies',
        'Detection Confidence': riskData.riskScore >= 80 ? 'High' : riskData.riskScore >= 60 ? 'Moderate' : 'Low',
      },
    },
    {
      stage: 'Risk Assessment',
      status: 'completed',
      timestamp: baseTime.replace(/\d{2}:\d{2}/, (m) => {
        const [h, min] = m.split(':').map(Number);
        const newMin = min + 2;
        return `${String(h).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
      }),
      description: 'Risk factors evaluated to determine the current landslide risk level.',
      details: {
        'Rainfall': riskData.factors.rainfall.valueDisplay + ` (${riskData.factors.rainfall.indicator})`,
        'Slope': riskData.factors.slope.valueDisplay + ` (${riskData.factors.slope.indicator})`,
        'Ground Movement': riskData.factors.groundMovement.valueDisplay + ` (${riskData.factors.groundMovement.indicator})`,
        'Historical Activity': `${riskData.factors.historical.indicator} Frequency`,
        'Satellite / InSAR': `${riskData.factors.satellite.indicator} Velocity`,
        'Risk Level': `${riskData.riskLevel} (Score: ${riskData.riskScore}/100)`,
      },
    },
    {
      stage: 'Alert Generated',
      status: 'completed',
      timestamp: baseTime.replace(/\d{2}:\d{2}/, (m) => {
        const [h, min] = m.split(':').map(Number);
        const newMin = min + 3;
        return `${String(h).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
      }),
      description: 'Alert generated when configured prototype risk condition was reached.',
      details: {
        'Severity': riskData.riskLevel,
        'Risk Score': `${riskData.riskScore}/100`,
        'Priority': riskData.recommendedAction.priority,
      },
    },
    {
      stage: 'Review',
      status: isAcknowledged ? 'completed' : 'active',
      timestamp: isAcknowledged ? (acknowledgedAt || 'Just now') : null,
      description: isAcknowledged
        ? 'Alert reviewed and acknowledged by disaster coordinator.'
        : 'Alert awaiting review before further action.',
      details: {
        'Review Status': isResolved ? 'Reviewed' : isAcknowledged ? 'Acknowledged' : 'Pending',
        ...(isAcknowledged ? { 'Acknowledged At': acknowledgedAt || 'Just now' } : {}),
      },
    },
    {
      stage: 'Warning / Action',
      status: actionStatus,
      timestamp: isResolved ? (resolvedAt || 'Just now') : null,
      description: actionText,
      details: {
        'Recommended Action': riskData.recommendedAction.summary,
        'Action Status': isResolved ? 'Completed' : isAcknowledged ? 'Initiated' : 'Pending',
      },
    },
  ];
}

/**
 * Generates an AlertItem from a LocationRiskData if the location warrants an alert
 */
export function generateAlertFromRisk(riskData: LocationRiskData, existingAlert?: AlertItem): AlertItem | null {
  // Only Moderate, High, and Severe produce operational alerts
  if (riskData.riskLevel === 'LOW' && !existingAlert) {
    return null;
  }

  const alertId = existingAlert?.id || `ALT-NER-2026-${riskData.id.toUpperCase().slice(0, 3)}-${riskData.riskScore}`;
  const status: AlertStatus = existingAlert ? existingAlert.status : 'ACTIVE';
  
  const trigger = riskData.riskLevel === 'SEVERE'
    ? `Critical rainfall surge (${riskData.factors.rainfall.valueDisplay}) + active tensile displacement (${riskData.factors.groundMovement.valueDisplay})`
    : riskData.riskLevel === 'HIGH'
      ? `Elevated precipitation (${riskData.factors.rainfall.valueDisplay}) + steep slope gradient (${riskData.factors.slope.valueDisplay})`
      : `Moderate precipitation (${riskData.factors.rainfall.valueDisplay}) across unbuttressed slope cuttings (${riskData.factors.slope.valueDisplay})`;

  const timeline: AlertTimelineEvent[] = existingAlert?.timeline || [
    { step: 'Detected', timestamp: 'Today, 06:30 IST', completed: true, active: false, description: 'Sensor threshold breach detected by ResQAI early warning pipeline.' },
    { step: 'Reviewed', timestamp: 'Today, 06:45 IST', completed: true, active: false, description: 'Telemetry cross-validated against InSAR displacement vectors.' },
    { step: 'Acknowledged', timestamp: 'Pending', completed: false, active: true, description: 'Awaiting disaster coordinator acknowledgment.' },
    { step: 'Resolved', timestamp: 'Pending', completed: false, active: false, description: 'Pending geotechnical inspection and slope stabilization.' },
  ];

  const detectedAt = existingAlert?.detectedAt || 'Today, 07:15 IST';

  // Build the 6-stage escalation timeline from risk data
  const escalationTimeline = buildEscalationTimeline(
    riskData,
    status,
    detectedAt,
    existingAlert?.acknowledgedAt,
    existingAlert?.resolvedAt
  );

  return {
    id: alertId,
    locationId: riskData.id,
    location: riskData.location,
    state: riskData.state,
    severity: riskData.riskLevel,
    riskLevel: riskData.riskLevel,
    riskScore: riskData.riskScore,
    status,
    trigger,
    detectedAt,
    acknowledgedAt: existingAlert?.acknowledgedAt,
    resolvedAt: existingAlert?.resolvedAt,
    recommendedAction: riskData.recommendedAction.summary,
    actionPriority: riskData.recommendedAction.priority,
    factors: {
      rainfall: `${riskData.factors.rainfall.indicator} (${riskData.factors.rainfall.valueDisplay})`,
      slope: `${riskData.factors.slope.indicator} (${riskData.factors.slope.valueDisplay})`,
      soilTerrain: `${riskData.factors.soilTerrain.indicator} Saturation`,
      groundMovement: `${riskData.factors.groundMovement.indicator} (${riskData.factors.groundMovement.valueDisplay})`,
      satelliteIndicator: `${riskData.factors.satellite.indicator} InSAR Velocity`,
      historicalActivity: `${riskData.factors.historical.indicator} Hazard Frequency`,
    },
    timeline,
    escalationTimeline,
  };
}
