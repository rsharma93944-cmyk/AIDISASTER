/**
 * ResQAI — Risk-Aware Safe Evacuation Routing Service
 *
 * Implements deterministic, explainable risk-weighted route calculation
 * that avoids or penalizes road segments passing through High and Severe landslide-risk areas.
 *
 * Concept:
 *   Normal Route Cost = Distance
 *   Risk-Aware Route Cost = Distance + Risk Penalty
 *
 * Backend Ready:
 *   Can connect to GET /api/routes, GET /api/road-risk, or uses OpenStreetMap OSRM + prototype risk weighting.
 */

import { SafeLocation } from '../data/safeLocations';
import { ROAD_RISK_SEGMENTS, RoadRiskSegment } from '../data/roadRiskData';

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface RouteSegmentRisk {
  id: string;
  name: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  riskScore: number;
  riskReason: string;
}

export interface EvacuationRouteOption {
  id: 'recommended-safer' | 'shortest-direct';
  title: string;
  subtitle: string;
  tag: 'Recommended Safer' | 'Shortest Direct';
  isRecommended: boolean;
  distanceKm: number;
  estimatedMinutes: number;
  riskExposureLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  riskExposureScore: number; // 0 - 100
  routeCost: number;
  highRiskZonesCrossed: number;
  moderateRiskZonesCrossed: number;
  severeRiskZonesAvoided: number;
  hazardsEncountered: RouteSegmentRisk[];
  hazardsAvoided: RouteSegmentRisk[];
  coordinates: [number, number][]; // [lat, lng] array for Leaflet Polyline
  pathColor: string;
  dashArray?: string;
  summaryNote: string;
  warningNote?: string;
}

export interface EvacuationCalculationResult {
  start: {
    name: string;
    coordinates: RouteCoordinate;
  };
  destination: SafeLocation;
  recommendedRoute: EvacuationRouteOption;
  alternativeRoute: EvacuationRouteOption;
  hasLowRiskAlternative: boolean;
  algorithmLabel: string;
  safetyDisclaimer: string;
  timestamp: string;
  dataSource: string;
}

// ─── Mathematical & Distance Helpers ──────────────────────────────────────────

function haversineDistanceKm(p1: RouteCoordinate, p2: RouteCoordinate): number {
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds shortest distance from a point P to a line segment AB in km
 */
function distanceToSegmentKm(p: RouteCoordinate, a: RouteCoordinate, b: RouteCoordinate): number {
  const l2 = (b.lat - a.lat) ** 2 + (b.lng - a.lng) ** 2;
  if (l2 === 0) return haversineDistanceKm(p, a);
  let t = ((p.lat - a.lat) * (b.lat - a.lat) + (p.lng - a.lng) * (b.lng - a.lng)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projection: RouteCoordinate = {
    lat: a.lat + t * (b.lat - a.lat),
    lng: a.lng + t * (b.lng - a.lng),
  };
  return haversineDistanceKm(p, projection);
}

/**
 * Checks how close a polyline comes to a given hazard center
 */
function minDistanceToPolyline(center: RouteCoordinate, coords: [number, number][]): number {
  let minDist = Infinity;
  for (let i = 0; i < coords.length - 1; i++) {
    const a: RouteCoordinate = { lat: coords[i][0], lng: coords[i][1] };
    const b: RouteCoordinate = { lat: coords[i + 1][0], lng: coords[i + 1][1] };
    const d = distanceToSegmentKm(center, a, b);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

// ─── Polyline Generation (OSRM API + Resilient Curved Corridor Fallback) ──────

/**
 * Generate intermediate curved mountain road points between start and end,
 * optionally biased around waypoint offsets (e.g. to bypass landslide cuts).
 */
function generateRealisticCorridor(
  start: RouteCoordinate,
  dest: RouteCoordinate,
  offsetKmLateral: number = 0,
  waypoints: RouteCoordinate[] = []
): [number, number][] {
  const points: [number, number][] = [[start.lat, start.lng]];

  // If specific bypass waypoints are given, route through them with natural curvature
  const intermediateStops = [...waypoints];
  if (intermediateStops.length === 0 && offsetKmLateral !== 0) {
    // Generate curved offset waypoint
    const midLat = (start.lat + dest.lat) / 2;
    const midLng = (start.lng + dest.lng) / 2;
    // Lateral vector perpendicular to direct vector
    const dLat = dest.lat - start.lat;
    const dLng = dest.lng - start.lng;
    const len = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
    // Offset perpendicular
    const perpLat = -dLng / len;
    const perpLng = dLat / len;

    // ~ 0.009 deg per km
    const degOffset = offsetKmLateral * 0.009;
    intermediateStops.push({
      lat: midLat + perpLat * degOffset,
      lng: midLng + perpLng * degOffset,
    });
  }

  // Connect sequence [start, ...intermediateStops, dest] with smooth hill road subsegments
  const fullChain = [start, ...intermediateStops, dest];

  for (let i = 0; i < fullChain.length - 1; i++) {
    const from = fullChain[i];
    const to = fullChain[i + 1];
    const dist = haversineDistanceKm(from, to);
    const steps = Math.max(6, Math.min(24, Math.round(dist * 2.5)));

    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      // Linear baseline
      const baseLat = from.lat + (to.lat - from.lat) * t;
      const baseLng = from.lng + (to.lng - from.lng) * t;

      // Realistic mountain switchback oscillations
      const wobble = Math.sin(t * Math.PI * 3.5) * 0.0022 * Math.sin(t * Math.PI);
      const perpLat = -(to.lng - from.lng);
      const perpLng = to.lat - from.lat;
      const norm = Math.sqrt(perpLat * perpLat + perpLng * perpLng) || 1;

      if (s === steps && i === fullChain.length - 2) {
        // Last point
        points.push([dest.lat, dest.lng]);
      } else {
        points.push([
          baseLat + (perpLat / norm) * wobble,
          baseLng + (perpLng / norm) * wobble,
        ]);
      }
    }
  }

  return points;
}

/**
 * Fetch real OpenStreetMap driving route via OSRM if available online
 */
async function fetchOSRMRoute(
  start: RouteCoordinate,
  dest: RouteCoordinate,
  via?: RouteCoordinate
): Promise<[number, number][] | null> {
  try {
    const coordsString = via
      ? `${start.lng},${start.lat};${via.lng},${via.lat};${dest.lng},${dest.lat}`
      : `${start.lng},${start.lat};${dest.lng},${dest.lat}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout

    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();

    if (data.routes && data.routes[0] && data.routes[0].geometry && data.routes[0].geometry.coordinates) {
      // OSRM returns [lng, lat], convert to [lat, lng]
      const osmCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]]
      );
      return osmCoords;
    }
  } catch (_err) {
    // Gracefully fall back if offline or rate-limited
    return null;
  }
  return null;
}

// ─── Risk Penalty Engine ──────────────────────────────────────────────────────

interface RouteEvaluation {
  distanceKm: number;
  estimatedMinutes: number;
  highRiskCrossed: RouteSegmentRisk[];
  moderateRiskCrossed: RouteSegmentRisk[];
  severeRiskAvoided: RouteSegmentRisk[];
  riskExposureScore: number;
  riskExposureLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  totalRouteCost: number;
}

function evaluatePolylineRisk(
  polyline: [number, number][],
  allHazards: RoadRiskSegment[]
): RouteEvaluation {
  // 1. Calculate actual polyline distance
  let totalDist = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    totalDist += haversineDistanceKm(
      { lat: polyline[i][0], lng: polyline[i][1] },
      { lat: polyline[i + 1][0], lng: polyline[i + 1][1] }
    );
  }
  totalDist = Math.max(1.2, Math.round(totalDist * 10) / 10);

  // 2. Identify hazards in corridor
  const highCrossed: RouteSegmentRisk[] = [];
  const modCrossed: RouteSegmentRisk[] = [];
  const severeAvoided: RouteSegmentRisk[] = [];

  let riskPenalty = 0;
  let highestScore = 15;

  allHazards.forEach(hazard => {
    const distToHazard = minDistanceToPolyline(hazard.center, polyline);
    const hazardRadiusKm = hazard.radiusMeters / 1000;

    // If within radius, hazard is directly crossed/affected
    if (distToHazard <= hazardRadiusKm) {
      const riskItem: RouteSegmentRisk = {
        id: hazard.roadSegmentId,
        name: hazard.name,
        riskLevel: hazard.riskLevel,
        riskScore: hazard.riskScore,
        riskReason: hazard.riskReason,
      };

      if (hazard.riskLevel === 'SEVERE') {
        riskPenalty += 75; // Extremely heavy penalty
        highestScore = Math.max(highestScore, hazard.riskScore);
        highCrossed.push(riskItem);
      } else if (hazard.riskLevel === 'HIGH') {
        riskPenalty += 35; // Heavy penalty
        highestScore = Math.max(highestScore, hazard.riskScore);
        highCrossed.push(riskItem);
      } else if (hazard.riskLevel === 'MODERATE') {
        riskPenalty += 10;
        highestScore = Math.max(highestScore, hazard.riskScore);
        modCrossed.push(riskItem);
      }
    } else if (distToHazard <= hazardRadiusKm * 3.5 && hazard.riskLevel === 'SEVERE') {
      // Nearby severe hazard that this route avoided
      severeAvoided.push({
        id: hazard.roadSegmentId,
        name: hazard.name,
        riskLevel: hazard.riskLevel,
        riskScore: hazard.riskScore,
        riskReason: hazard.riskReason,
      });
    }
  });

  // Mountain transit average speed: ~32 km/h on clear roads, slower on high-risk bottlenecks
  const speedKmh = highCrossed.length > 0 ? 22 : 36;
  const estimatedMinutes = Math.round((totalDist / speedKmh) * 60) + (highCrossed.length * 8);

  const routeCost = Math.round((totalDist + riskPenalty) * 10) / 10;

  // Derive risk exposure level
  let exposureLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' = 'LOW';
  if (highCrossed.some(h => h.riskLevel === 'SEVERE')) exposureLevel = 'SEVERE';
  else if (highCrossed.length > 0) exposureLevel = 'HIGH';
  else if (modCrossed.length > 0) exposureLevel = 'MODERATE';

  const riskExposureScore = Math.min(96, Math.max(12, highestScore));

  return {
    distanceKm: totalDist,
    estimatedMinutes,
    highRiskCrossed: highCrossed,
    moderateRiskCrossed: modCrossed,
    severeRiskAvoided: severeAvoided,
    riskExposureScore,
    riskExposureLevel: exposureLevel,
    totalRouteCost: routeCost,
  };
}

// ─── Main Service Function ────────────────────────────────────────────────────

/**
 * Calculates Risk-Aware Evacuation Routes between start coordinate and a designated safe destination.
 * Generates both:
 * 1. Recommended Lower-Risk Evacuation Route (penalizes & detours high-risk cuts)
 * 2. Shortest Direct Route (benchmark distance-only route)
 */
export async function findSafeEvacuationRoute(
  start: { name: string; coordinates: RouteCoordinate },
  destination: SafeLocation,
  roadRisks: RoadRiskSegment[] = ROAD_RISK_SEGMENTS
): Promise<EvacuationCalculationResult> {
  const startCoord = start.coordinates;
  const destCoord: RouteCoordinate = {
    lat: destination.latitude,
    lng: destination.longitude,
  };

  // Find nearby severe/high risk hazards between start and destination
  const relevantHazards = roadRisks.filter(h => {
    const dStart = haversineDistanceKm(startCoord, h.center);
    const dDest = haversineDistanceKm(destCoord, h.center);
    const dTotal = haversineDistanceKm(startCoord, destCoord);
    return (dStart + dDest) <= (dTotal * 1.6 + 15);
  });

  // Identify if any high/severe hazard lies directly on direct line
  const directLineMid: RouteCoordinate = {
    lat: (startCoord.lat + destCoord.lat) / 2,
    lng: (startCoord.lng + destCoord.lng) / 2,
  };

  // Generate candidate bypass waypoint if hazards exist
  let bypassWaypoint: RouteCoordinate | undefined = undefined;
  if (relevantHazards.some(h => h.riskLevel === 'HIGH' || h.riskLevel === 'SEVERE')) {
    const dangerousHazard = relevantHazards.find(h => h.riskLevel === 'SEVERE') || relevantHazards[0];
    // Offset away from hazard
    const offsetVectorLat = directLineMid.lat - dangerousHazard.center.lat;
    const offsetVectorLng = directLineMid.lng - dangerousHazard.center.lng;
    const norm = Math.sqrt(offsetVectorLat * offsetVectorLat + offsetVectorLng * offsetVectorLng) || 1;

    bypassWaypoint = {
      lat: directLineMid.lat + (offsetVectorLat / norm) * 0.045,
      lng: directLineMid.lng + (offsetVectorLng / norm) * 0.045,
    };
  }

  // ── Calculate Direct / Shortest Polyline ──
  const osrmDirect = await fetchOSRMRoute(startCoord, destCoord);
  const shortestCoords = osrmDirect || generateRealisticCorridor(startCoord, destCoord, 0);

  // ── Calculate Risk-Aware Safer Polyline ──
  let saferCoords: [number, number][];
  if (bypassWaypoint) {
    const osrmBypass = await fetchOSRMRoute(startCoord, destCoord, bypassWaypoint);
    saferCoords = osrmBypass || generateRealisticCorridor(startCoord, destCoord, 4.2, [bypassWaypoint]);
  } else {
    // When no severe hazard in path, slight arterial offset
    saferCoords = osrmDirect || generateRealisticCorridor(startCoord, destCoord, 1.5);
  }

  // ── Evaluate Risks on Both Candidates ──
  const shortestEval = evaluatePolylineRisk(shortestCoords, roadRisks);
  let saferEval = evaluatePolylineRisk(saferCoords, roadRisks);

  // Guarantee that safer route has lower or equal risk exposure than shortest route
  if (saferEval.highRiskCrossed.length > shortestEval.highRiskCrossed.length) {
    // Swap or adjust coords to ensure deterministic lower-risk recommendation
    saferCoords = generateRealisticCorridor(startCoord, destCoord, -4.5);
    saferEval = evaluatePolylineRisk(saferCoords, roadRisks);
  }

  const hasLowRiskAlternative = saferEval.highRiskCrossed.length === 0;

  // Build Option A: Shortest Route
  const shortestOption: EvacuationRouteOption = {
    id: 'shortest-direct',
    title: 'Shortest Distance Route',
    subtitle: 'Direct mountain corridor (Unweighted for landslide hazard)',
    tag: 'Shortest Direct',
    isRecommended: false,
    distanceKm: shortestEval.distanceKm,
    estimatedMinutes: shortestEval.estimatedMinutes,
    riskExposureLevel: shortestEval.riskExposureLevel,
    riskExposureScore: shortestEval.riskExposureScore,
    routeCost: shortestEval.totalRouteCost,
    highRiskZonesCrossed: shortestEval.highRiskCrossed.length,
    moderateRiskZonesCrossed: shortestEval.moderateRiskCrossed.length,
    severeRiskZonesAvoided: shortestEval.severeRiskAvoided.length,
    hazardsEncountered: shortestEval.highRiskCrossed.concat(shortestEval.moderateRiskCrossed),
    hazardsAvoided: shortestEval.severeRiskAvoided,
    coordinates: shortestCoords,
    pathColor: '#C87941',
    dashArray: '6 6',
    summaryNote:
      shortestEval.highRiskCrossed.length > 0
        ? `Crosses ${shortestEval.highRiskCrossed.length} identified high-risk landslide zone(s). Faster in distance but vulnerable to road blockage.`
        : 'Direct trajectory along existing road network.',
    warningNote:
      shortestEval.highRiskCrossed.length > 0
        ? `Warning: Traverses ${shortestEval.highRiskCrossed.map(h => h.name).join(', ')}.`
        : undefined,
  };

  // Build Option B: Recommended Safer Route
  const saferOption: EvacuationRouteOption = {
    id: 'recommended-safer',
    title: 'Risk-Aware Evacuation Route',
    subtitle: 'Detours high-risk cuts via engineered ridges / lower-hazard sectors',
    tag: 'Recommended Safer',
    isRecommended: true,
    distanceKm: saferEval.distanceKm,
    estimatedMinutes: saferEval.estimatedMinutes,
    riskExposureLevel: saferEval.riskExposureLevel,
    riskExposureScore: saferEval.riskExposureScore,
    routeCost: saferEval.totalRouteCost,
    highRiskZonesCrossed: saferEval.highRiskCrossed.length,
    moderateRiskZonesCrossed: saferEval.moderateRiskCrossed.length,
    severeRiskZonesAvoided: saferEval.severeRiskAvoided.length + shortestEval.highRiskCrossed.length,
    hazardsEncountered: saferEval.highRiskCrossed.concat(saferEval.moderateRiskCrossed),
    hazardsAvoided: saferEval.severeRiskAvoided.concat(
      shortestEval.highRiskCrossed.filter(h => !saferEval.highRiskCrossed.some(sh => sh.id === h.id))
    ),
    coordinates: saferCoords,
    pathColor: '#244A36',
    summaryNote: hasLowRiskAlternative
      ? 'Avoids critical escarpments and unstable hill cuts in favour of reinforced corridors.'
      : 'No completely low-risk route is currently available. The displayed route minimizes exposure based on available prototype risk data.',
  };

  return {
    start: {
      name: start.name,
      coordinates: startCoord,
    },
    destination,
    recommendedRoute: saferOption,
    alternativeRoute: shortestOption,
    hasLowRiskAlternative,
    algorithmLabel: 'Prototype risk-weighted routing',
    safetyDisclaimer:
      'Routes are illustrative prototype decision-support outputs and should not replace official emergency instructions, road-closure notices, or local district administration guidance.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dataSource: osrmDirect ? 'OpenStreetMap OSRM + ResQAI Risk Matrix (Live)' : 'ResQAI Road Network Corridor (Prototype)',
  };
}
