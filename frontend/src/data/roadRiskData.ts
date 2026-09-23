/**
 * ResQAI — Road Risk & Landslide Vulnerability Corridors
 * Centralized dataset representing road segments, mountain cuts, and hazard zones across the North Eastern Region.
 *
 * Designed to be backend-ready (consumable via GET /api/road-risk).
 */

export interface RoadRiskSegment {
  roadSegmentId: string;
  name: string;
  highwayRef: string;
  state: string;
  district: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  riskScore: number; // 0 - 100
  riskReason: string;
  slopeGradient: string;
  rainfallStatus: string;
  source: 'prototype-demo' | 'prototype-derived' | 'telemetry-live';
  lastUpdated: string;
  center: { lat: number; lng: number };
  radiusMeters: number;
  geometry: [number, number][]; // [lat, lng] points along the road segment
}

export const ROAD_RISK_SEGMENTS: RoadRiskSegment[] = [
  // Nagaland / Kohima - Dimapur Corridor (NH-29)
  {
    roadSegmentId: 'road-nh29-01',
    name: 'NH-29 Pagla Pahar Mountain Cut',
    highwayRef: 'NH-29',
    state: 'Nagaland',
    district: 'Kohima / Dimapur',
    riskLevel: 'SEVERE',
    riskScore: 92,
    riskReason: 'Active rockfall cliff & high pore pressure on unstable schist layer.',
    slopeGradient: '48° Escarpment',
    rainfallStatus: 'Heavy (82mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 10m ago (Prototype)',
    center: { lat: 25.7600, lng: 93.9200 },
    radiusMeters: 4500,
    geometry: [
      [25.7400, 93.9000],
      [25.7550, 93.9150],
      [25.7700, 93.9350],
      [25.7850, 93.9500],
    ],
  },
  {
    roadSegmentId: 'road-nh29-02',
    name: 'Kohima North Ridge Bypass Arterial',
    highwayRef: 'Kohima Bypass',
    state: 'Nagaland',
    district: 'Kohima',
    riskLevel: 'LOW',
    riskScore: 24,
    riskReason: 'Reinforced retaining walls and gentle gradient along stable bedrock.',
    slopeGradient: '18° Stable Ridge',
    rainfallStatus: 'Moderate (28mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 25m ago (Prototype)',
    center: { lat: 25.6850, lng: 94.1350 },
    radiusMeters: 3500,
    geometry: [
      [25.6600, 94.1050],
      [25.6750, 94.1250],
      [25.6900, 94.1400],
      [25.7050, 94.1550],
    ],
  },
  {
    roadSegmentId: 'road-nh29-03',
    name: 'Zubza Sector Saturated Silt Cut',
    highwayRef: 'NH-29',
    state: 'Nagaland',
    district: 'Kohima',
    riskLevel: 'HIGH',
    riskScore: 78,
    riskReason: 'Silt over-saturation with micro-shear cracks along road embankment.',
    slopeGradient: '36° Slope',
    rainfallStatus: 'High (68mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 15m ago (Prototype)',
    center: { lat: 25.6950, lng: 94.0250 },
    radiusMeters: 3000,
    geometry: [
      [25.6800, 94.0100],
      [25.6950, 94.0250],
      [25.7100, 94.0450],
    ],
  },

  // Sikkim / Gangtok - Teesta Corridor (NH-10)
  {
    roadSegmentId: 'road-nh10-01',
    name: 'NH-10 29th Mile Teesta Gorge Segment',
    highwayRef: 'NH-10',
    state: 'Sikkim',
    district: 'East Sikkim',
    riskLevel: 'SEVERE',
    riskScore: 95,
    riskReason: 'Riverine toe erosion and recurring debris flow over-topping carriageway.',
    slopeGradient: '52° Gorge Wall',
    rainfallStatus: 'Critical (115mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 5m ago (Prototype)',
    center: { lat: 27.1850, lng: 88.5120 },
    radiusMeters: 5000,
    geometry: [
      [27.1650, 88.4950],
      [27.1850, 88.5120],
      [27.2050, 88.5280],
      [27.2250, 88.5400],
    ],
  },
  {
    roadSegmentId: 'road-nh10-02',
    name: 'Gangtok - Ranipool Upper Valley Ridge Road',
    highwayRef: 'Ranipool Alt Road',
    state: 'Sikkim',
    district: 'East Sikkim',
    riskLevel: 'LOW',
    riskScore: 28,
    riskReason: 'Well-engineered terraced road away from primary drainage nullahs.',
    slopeGradient: '22° Protected',
    rainfallStatus: 'Moderate (35mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 20m ago (Prototype)',
    center: { lat: 27.3100, lng: 88.6050 },
    radiusMeters: 3500,
    geometry: [
      [27.2900, 88.5850],
      [27.3100, 88.6050],
      [27.3250, 88.6200],
    ],
  },
  {
    roadSegmentId: 'road-nh10-03',
    name: 'Melli-Manpur Slump Zone',
    highwayRef: 'NH-10 / Melli Link',
    state: 'Sikkim',
    district: 'South Sikkim',
    riskLevel: 'HIGH',
    riskScore: 76,
    riskReason: 'Recent slope toe undercut by swollen river flows.',
    slopeGradient: '39° Cut',
    rainfallStatus: 'Elevated (64mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 40m ago (Prototype)',
    center: { lat: 27.0950, lng: 88.4480 },
    radiusMeters: 4000,
    geometry: [
      [27.0800, 88.4350],
      [27.0950, 88.4480],
      [27.1150, 88.4600],
    ],
  },

  // Meghalaya / Shillong - Guwahati Corridor (NH-06 / GS Road)
  {
    roadSegmentId: 'road-nh06-01',
    name: 'Umiam - Barapani Lakeside Escarpment',
    highwayRef: 'NH-06',
    state: 'Meghalaya',
    district: 'Ri-Bhoi',
    riskLevel: 'HIGH',
    riskScore: 81,
    riskReason: 'Over-steepened hill-cut with historical debris avalanches during heavy rains.',
    slopeGradient: '41° Slope',
    rainfallStatus: 'Heavy (76mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 12m ago (Prototype)',
    center: { lat: 25.6600, lng: 91.9050 },
    radiusMeters: 4000,
    geometry: [
      [25.6450, 91.8950],
      [25.6600, 91.9050],
      [25.6800, 91.9150],
    ],
  },
  {
    roadSegmentId: 'road-nh06-02',
    name: 'Shillong Bypass Expressway Corridor',
    highwayRef: 'NE Expressway Bypass',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    riskLevel: 'LOW',
    riskScore: 19,
    riskReason: 'High-standard multi-lane bypass built on stable sandstone ridges.',
    slopeGradient: '14° Gentle',
    rainfallStatus: 'Moderate (25mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 30m ago (Prototype)',
    center: { lat: 25.6100, lng: 91.9400 },
    radiusMeters: 5000,
    geometry: [
      [25.5800, 91.9100],
      [25.6050, 91.9350],
      [25.6350, 91.9600],
    ],
  },

  // Assam / Haflong - Dima Hasao Corridor
  {
    roadSegmentId: 'road-nh27-01',
    name: 'Jatinga - Mahur Hill Pass Section',
    highwayRef: 'NH-27',
    state: 'Assam',
    district: 'Dima Hasao',
    riskLevel: 'SEVERE',
    riskScore: 89,
    riskReason: 'Massive mudslide reactivation in sedimentary formation with sinking roadbed.',
    slopeGradient: '44° Unstable Clay',
    rainfallStatus: 'Heavy (90mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 18m ago (Prototype)',
    center: { lat: 25.1300, lng: 93.0450 },
    radiusMeters: 4500,
    geometry: [
      [25.1100, 93.0300],
      [25.1300, 93.0450],
      [25.1500, 93.0600],
    ],
  },
  {
    roadSegmentId: 'road-nh27-02',
    name: 'Haflong Plateau Arterial Relief Way',
    highwayRef: 'Plateau Link',
    state: 'Assam',
    district: 'Dima Hasao',
    riskLevel: 'MODERATE',
    riskScore: 48,
    riskReason: 'Moderate slope with minor surface runoff trenches.',
    slopeGradient: '24° Slope',
    rainfallStatus: 'Moderate (40mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 50m ago (Prototype)',
    center: { lat: 25.1780, lng: 93.0200 },
    radiusMeters: 3000,
    geometry: [
      [25.1600, 93.0100],
      [25.1780, 93.0200],
      [25.1950, 93.0350],
    ],
  },

  // Mizoram / Aizawl - Sairang Corridor
  {
    roadSegmentId: 'road-nh54-01',
    name: 'Aizawl Hunthar Sinking Road Zone',
    highwayRef: 'NH-54 / Old Route',
    state: 'Mizoram',
    district: 'Aizawl',
    riskLevel: 'SEVERE',
    riskScore: 94,
    riskReason: 'Active deep-seated circular slide zone affecting multiple road sections.',
    slopeGradient: '46° Sinking Face',
    rainfallStatus: 'Heavy (88mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 8m ago (Prototype)',
    center: { lat: 23.7550, lng: 92.7050 },
    radiusMeters: 3500,
    geometry: [
      [23.7450, 92.6950],
      [23.7550, 92.7050],
      [23.7700, 92.7150],
    ],
  },
  {
    roadSegmentId: 'road-nh54-02',
    name: 'Tanhril University Valley Bypass',
    highwayRef: 'Tanhril Ridge Link',
    state: 'Mizoram',
    district: 'Aizawl',
    riskLevel: 'LOW',
    riskScore: 22,
    riskReason: 'Paved crest road constructed along geological ridge.',
    slopeGradient: '16° Ridge',
    rainfallStatus: 'Moderate (30mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 1h ago (Prototype)',
    center: { lat: 23.7380, lng: 92.6680 },
    radiusMeters: 4000,
    geometry: [
      [23.7250, 92.6550],
      [23.7380, 92.6680],
      [23.7500, 92.6800],
    ],
  },

  // Manipur / Imphal - Kohima Highway (NH-02)
  {
    roadSegmentId: 'road-nh02-01',
    name: 'NH-02 Maram-Tadubi Mountain Pass',
    highwayRef: 'NH-02',
    state: 'Manipur',
    district: 'Senapati',
    riskLevel: 'HIGH',
    riskScore: 79,
    riskReason: 'Repeated debris slides blocking single-lane sections in monsoon.',
    slopeGradient: '38° Pass',
    rainfallStatus: 'High (62mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 22m ago (Prototype)',
    center: { lat: 25.4300, lng: 94.1100 },
    radiusMeters: 4500,
    geometry: [
      [25.4050, 94.0950],
      [25.4300, 94.1100],
      [25.4550, 94.1250],
    ],
  },

  // Arunachal Pradesh / Itanagar - Naharlagun Corridor
  {
    roadSegmentId: 'road-nh415-01',
    name: 'NH-415 Zoo Road Landslide Slit',
    highwayRef: 'NH-415',
    state: 'Arunachal Pradesh',
    district: 'Papum Pare',
    riskLevel: 'HIGH',
    riskScore: 83,
    riskReason: 'Weak shale foundation with steep cut face showing continuous soil creep.',
    slopeGradient: '43° Hill Cut',
    rainfallStatus: 'Heavy (78mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 14m ago (Prototype)',
    center: { lat: 27.0850, lng: 93.6350 },
    radiusMeters: 3000,
    geometry: [
      [27.0750, 93.6200],
      [27.0850, 93.6350],
      [27.0950, 93.6500],
    ],
  },
  {
    roadSegmentId: 'road-nh415-02',
    name: 'Naharlagun Valley Four-Lane Arterial',
    highwayRef: 'NH-415 Bypass',
    state: 'Arunachal Pradesh',
    district: 'Papum Pare',
    riskLevel: 'LOW',
    riskScore: 16,
    riskReason: 'Wide valley alignment with concrete retaining walls and bio-engineering slope mesh.',
    slopeGradient: '12° Flat Valley',
    rainfallStatus: 'Moderate (22mm/24h)',
    source: 'prototype-demo',
    lastUpdated: 'Updated 45m ago (Prototype)',
    center: { lat: 27.1050, lng: 93.6950 },
    radiusMeters: 4000,
    geometry: [
      [27.0950, 93.6700],
      [27.1050, 93.6950],
      [27.1150, 93.7200],
    ],
  },
];

/**
 * Returns road risk segments in the vicinity of given coordinates
 */
export function getNearbyRoadRisks(lat: number, lng: number, maxDistanceKm = 60): RoadRiskSegment[] {
  return ROAD_RISK_SEGMENTS.filter(seg => {
    const R = 6371;
    const dLat = ((seg.center.lat - lat) * Math.PI) / 180;
    const dLon = ((seg.center.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((seg.center.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return dist <= maxDistanceKm;
  });
}

export default ROAD_RISK_SEGMENTS;
