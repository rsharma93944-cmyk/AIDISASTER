/**
 * ResQAI What-If Risk Simulator Service
 *
 * Provides deterministic, weighted scenario simulation for landslide risk.
 * Uses the same factor weights as the core riskCalculationService.
 *
 * ⚠️  PROTOTYPE — Illustrative scenario planning only.
 * This formula is NOT a scientifically validated geotechnical prediction model.
 * It mirrors the same weighted multi-criteria approach used across ResQAI
 * so that future swap-in of an ML backend remains seamless.
 *
 * Formula:
 *   RiskScore = Σ (factorScore[i] × weight[i])  clamped to [0, 100]
 *
 * Weights (same as riskCalculationService.ts):
 *   Rainfall        25%
 *   Slope           20%
 *   Soil / Terrain  15%
 *   Ground Movement 15%
 *   Satellite       15%
 *   Historical      10%
 */

import { RISK_WEIGHTS, getRiskLevelFromScore, RiskLevel } from './riskCalculationService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SimulatorFactorState {
  rainfall: number;        // 0–100
  groundMovement: number;  // 0–100
  slope: number;           // 0–100
  historical: number;      // 0–100
  /** Satellite/InSAR — kept at baseline (not user-adjustable, for now) */
  satellite: number;       // 0–100
  /** Soil/Terrain — kept at baseline (geological, slow-changing) */
  soilTerrain: number;     // 0–100
}

export interface SimulationResult {
  /** Score computed from original location factors */
  baselineScore: number;
  baselineLevel: RiskLevel;
  /** Score computed from user-adjusted scenario factors */
  scenarioScore: number;
  scenarioLevel: RiskLevel;
  /** Signed difference */
  scoreDelta: number;
  /** Human-readable explanation of what drove the change */
  explanation: string;
  /** Which factors increased most (for visual highlighting) */
  increasedFactors: string[];
  /** Which factors decreased most */
  decreasedFactors: string[];
}

// ─── Core Simulation Function ─────────────────────────────────────────────────

/**
 * Computes baseline and scenario risk scores from two sets of factor inputs.
 *
 * @param baseline - Original factor values from the selected location profile
 * @param scenario - User-modified values from the simulator sliders
 * @returns SimulationResult with scores, levels, delta, and explanation
 *
 * NOTE: Replace the body of this function with an API call to your ML backend
 *       when the production model is ready — the interface contract stays identical.
 */
export function runSimulation(
  baseline: SimulatorFactorState,
  scenario: SimulatorFactorState
): SimulationResult {
  const computeScore = (f: SimulatorFactorState): number =>
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          f.rainfall       * RISK_WEIGHTS.rainfall +
          f.slope          * RISK_WEIGHTS.slope +
          f.soilTerrain    * RISK_WEIGHTS.soilTerrain +
          f.groundMovement * RISK_WEIGHTS.groundMovement +
          f.satellite      * RISK_WEIGHTS.satellite +
          f.historical     * RISK_WEIGHTS.historical
        )
      )
    );

  const baselineScore = computeScore(baseline);
  const scenarioScore = computeScore(scenario);
  const baselineLevel = getRiskLevelFromScore(baselineScore);
  const scenarioLevel = getRiskLevelFromScore(scenarioScore);
  const scoreDelta    = scenarioScore - baselineScore;

  // Identify changed factors for explanation generation
  const FACTOR_LABELS: Record<keyof SimulatorFactorState, string> = {
    rainfall:       'Rainfall Intensity',
    groundMovement: 'Ground Movement',
    slope:          'Slope Sensitivity',
    historical:     'Historical Activity',
    satellite:      'Satellite / InSAR',
    soilTerrain:    'Soil / Terrain',
  };

  const THRESHOLD = 3; // minimum score change to mention in explanation
  const increasedFactors: string[] = [];
  const decreasedFactors: string[] = [];

  (Object.keys(FACTOR_LABELS) as (keyof SimulatorFactorState)[]).forEach((key) => {
    const delta = scenario[key] - baseline[key];
    if (delta >= THRESHOLD)  increasedFactors.push(FACTOR_LABELS[key]);
    if (delta <= -THRESHOLD) decreasedFactors.push(FACTOR_LABELS[key]);
  });

  const explanation = buildExplanation(
    scoreDelta,
    baselineLevel,
    scenarioLevel,
    increasedFactors,
    decreasedFactors
  );

  return {
    baselineScore,
    baselineLevel,
    scenarioScore,
    scenarioLevel,
    scoreDelta,
    explanation,
    increasedFactors,
    decreasedFactors,
  };
}

// ─── Explanation Builder ──────────────────────────────────────────────────────

function buildExplanation(
  delta: number,
  fromLevel: RiskLevel,
  toLevel: RiskLevel,
  increased: string[],
  decreased: string[]
): string {
  if (Math.abs(delta) < 2) {
    return 'The scenario conditions are nearly identical to the current baseline. Risk level remains unchanged.';
  }

  const direction = delta > 0 ? 'increased' : 'decreased';
  const magnitude = Math.abs(delta);

  let intro = '';
  if (magnitude <= 8)  intro = `Risk ${direction} slightly (${Math.abs(delta)} pts).`;
  else if (magnitude <= 20) intro = `Risk ${direction} moderately (${Math.abs(delta)} pts).`;
  else intro = `Risk ${direction} significantly (${Math.abs(delta)} pts).`;

  let levelChange = '';
  if (fromLevel !== toLevel) {
    levelChange = ` The risk level has shifted from ${fromLevel} to ${toLevel}.`;
  }

  let factorDetail = '';
  if (delta > 0 && increased.length > 0) {
    const listed = increased.length === 1
      ? increased[0]
      : `${increased.slice(0, -1).join(', ')} and ${increased[increased.length - 1]}`;
    factorDetail = ` This is mainly driven by elevated ${listed} in the simulated scenario.`;
  } else if (delta < 0 && decreased.length > 0) {
    const listed = decreased.length === 1
      ? decreased[0]
      : `${decreased.slice(0, -1).join(', ')} and ${decreased[decreased.length - 1]}`;
    factorDetail = ` This is mainly due to reduced ${listed} in the simulated scenario.`;
  } else if (increased.length > 0 && decreased.length > 0) {
    factorDetail = ` Mixed conditions: ${increased.join(', ')} increased while ${decreased.join(', ')} decreased.`;
  }

  return intro + levelChange + factorDetail;
}

// ─── Baseline Extractor ───────────────────────────────────────────────────────

/**
 * Extracts a SimulatorFactorState from a LocationRiskData object.
 * Used to initialise the simulator sliders to the current location's values.
 */
export function extractBaselineFactors(
  rawFactors: {
    rainfall: { rawScore: number };
    slope: { rawScore: number };
    soilTerrain: { rawScore: number };
    groundMovement: { rawScore: number };
    satellite: { rawScore: number };
    historical: { rawScore: number };
  }
): SimulatorFactorState {
  return {
    rainfall:       rawFactors.rainfall.rawScore,
    slope:          rawFactors.slope.rawScore,
    soilTerrain:    rawFactors.soilTerrain.rawScore,
    groundMovement: rawFactors.groundMovement.rawScore,
    satellite:      rawFactors.satellite.rawScore,
    historical:     rawFactors.historical.rawScore,
  };
}

// ─── Risk Level Display Helpers ───────────────────────────────────────────────

export const RISK_LEVEL_META: Record<
  RiskLevel,
  { label: string; color: string; bg: string; border: string; textClass: string; bgClass: string }
> = {
  LOW: {
    label: 'Low',
    color: '#244A36',
    bg: 'rgba(36,74,54,0.07)',
    border: 'rgba(36,74,54,0.18)',
    textClass: 'text-[#244A36]',
    bgClass: 'bg-[#244A36]/10',
  },
  MODERATE: {
    label: 'Moderate',
    color: '#C87941',
    bg: 'rgba(200,121,65,0.08)',
    border: 'rgba(200,121,65,0.22)',
    textClass: 'text-[#C87941]',
    bgClass: 'bg-[#C87941]/10',
  },
  HIGH: {
    label: 'High',
    color: '#A05C2C',
    bg: 'rgba(160,92,44,0.08)',
    border: 'rgba(160,92,44,0.22)',
    textClass: 'text-[#A05C2C]',
    bgClass: 'bg-[#A05C2C]/10',
  },
  SEVERE: {
    label: 'Severe',
    color: '#7A2E2E',
    bg: 'rgba(122,46,46,0.09)',
    border: 'rgba(122,46,46,0.24)',
    textClass: 'text-[#7A2E2E]',
    bgClass: 'bg-[#7A2E2E]/10',
  },
};
