/**
 * ResQAI Prototype Landslide Dataset — Northeast India
 *
 * ⚠️  PROTOTYPE / DEMO DATA
 * These records are illustrative scenario data for the ResQAI prototype.
 * They are NOT real-time GSI / ISRO / NDMA landslide event records.
 */

export interface LandslideItem {
  id: string;
  latitude: number;
  longitude: number;
  location: string;
  district: string;
  state: string;
  date: string;
  severity: string;
  trigger: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  casualties: string;
  volumeEstimate: string;
  source: string;
}

export const DATA_SOURCE_NOTE =
  'Prototype / Demo Data — Not real-time. Source: ResQAI Scenario Dataset.';

export const PROTOTYPE_LANDSLIDES: LandslideItem[] = [
  {
    id: 'LS001',
    latitude: 27.3314,
    longitude: 88.6138,
    location: 'NH-10 Sevoke-Rangpo Corridor',
    district: 'East Sikkim',
    state: 'Sikkim',
    date: '2024-08-14',
    severity: 'Severe',
    trigger: 'Intense Monsoon Rainfall',
    riskLevel: 'SEVERE',
    casualties: 'Road closure reported',
    volumeEstimate: 'Large (>10,000 m³)',
    source: 'Prototype',
  },
  {
    id: 'LS002',
    latitude: 25.5788,
    longitude: 91.8933,
    location: 'Shillong–Cherrapunji Highway',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    date: '2024-06-22',
    severity: 'High',
    trigger: 'Sustained Orographic Rainfall',
    riskLevel: 'HIGH',
    casualties: 'Minor debris flow',
    volumeEstimate: 'Medium (1,000–10,000 m³)',
    source: 'Prototype',
  },
  {
    id: 'LS003',
    latitude: 25.6701,
    longitude: 94.1077,
    location: 'NH-29 Approach (Kohima South)',
    district: 'Kohima',
    state: 'Nagaland',
    date: '2024-07-03',
    severity: 'High',
    trigger: 'Rainfall + Road Cut',
    riskLevel: 'HIGH',
    casualties: 'None reported',
    volumeEstimate: 'Medium (500–5,000 m³)',
    source: 'Prototype',
  },
  {
    id: 'LS004',
    latitude: 24.6637,
    longitude: 93.9063,
    location: 'Imphal–Moreh NH-102',
    district: 'Churachandpur',
    state: 'Manipur',
    date: '2024-07-19',
    severity: 'Moderate',
    trigger: 'Rainfall + Slope Instability',
    riskLevel: 'MODERATE',
    casualties: 'Road disruption',
    volumeEstimate: 'Small (< 500 m³)',
    source: 'Prototype',
  },
  {
    id: 'LS005',
    latitude: 23.1645,
    longitude: 92.9376,
    location: 'Aizawl Ring Road Zone',
    district: 'Aizawl',
    state: 'Mizoram',
    date: '2024-08-02',
    severity: 'High',
    trigger: 'Cyclone-induced Rainfall',
    riskLevel: 'HIGH',
    casualties: 'Property damage',
    volumeEstimate: 'Large (>5,000 m³)',
    source: 'Prototype',
  },
  {
    id: 'LS006',
    latitude: 25.4670,
    longitude: 91.3662,
    location: 'Shillong Escarpment',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    date: '2024-06-10',
    severity: 'Severe',
    trigger: 'Flash Flood + Rainfall',
    riskLevel: 'SEVERE',
    casualties: 'Structural damage',
    volumeEstimate: 'Large (>10,000 m³)',
    source: 'Prototype',
  },
  {
    id: 'LS007',
    latitude: 27.0844,
    longitude: 93.6053,
    location: 'NH-415 Itanagar Bypass',
    district: 'Papum Pare',
    state: 'Arunachal Pradesh',
    date: '2024-07-28',
    severity: 'Moderate',
    trigger: 'Rainfall Saturation',
    riskLevel: 'MODERATE',
    casualties: 'None reported',
    volumeEstimate: 'Small (200–1,000 m³)',
    source: 'Prototype',
  },
  {
    id: 'LS008',
    latitude: 25.1856,
    longitude: 93.0232,
    location: 'Dima Hasao NH-27',
    district: 'Dima Hasao',
    state: 'Assam',
    date: '2024-06-30',
    severity: 'High',
    trigger: 'Earthquake + Rainfall',
    riskLevel: 'HIGH',
    casualties: 'Road blocked',
    volumeEstimate: 'Large (>8,000 m³)',
    source: 'Prototype',
  },
  {
    id: 'LS009',
    latitude: 23.9408,
    longitude: 91.9882,
    location: 'Agartala Hill Fringe',
    district: 'West Tripura',
    state: 'Tripura',
    date: '2024-05-18',
    severity: 'Low',
    trigger: 'Pre-monsoon Showers',
    riskLevel: 'LOW',
    casualties: 'None',
    volumeEstimate: 'Small (< 200 m³)',
    source: 'Prototype',
  },
  {
    id: 'LS010',
    latitude: 26.7509,
    longitude: 94.2166,
    location: 'Jorhat–Mariani Slope',
    district: 'Jorhat',
    state: 'Assam',
    date: '2024-08-08',
    severity: 'Low',
    trigger: 'Riverbank Erosion',
    riskLevel: 'LOW',
    casualties: 'None',
    volumeEstimate: 'Small',
    source: 'Prototype',
  },
  {
    id: 'LS011',
    latitude: 27.5330,
    longitude: 88.5122,
    location: 'Mangan–Lachen Road (North Sikkim)',
    district: 'North Sikkim',
    state: 'Sikkim',
    date: '2024-10-03',
    severity: 'Severe',
    trigger: 'Post-GLOf Debris Flow',
    riskLevel: 'SEVERE',
    casualties: 'Infrastructure damage',
    volumeEstimate: 'Very Large (>50,000 m³)',
    source: 'Prototype',
  },
  {
    id: 'LS012',
    latitude: 26.1584,
    longitude: 94.5624,
    location: 'Pfutsero–Phek Ridge',
    district: 'Phek',
    state: 'Nagaland',
    date: '2024-07-14',
    severity: 'Moderate',
    trigger: 'Prolonged Drizzle + Weak Slope',
    riskLevel: 'MODERATE',
    casualties: 'None reported',
    volumeEstimate: 'Small',
    source: 'Prototype',
  },
];

export async function fetchLandslides(): Promise<{ data: LandslideItem[]; isPrototype: boolean }> {
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL;
  if (!apiBase) {
    return { data: PROTOTYPE_LANDSLIDES, isPrototype: true };
  }
  try {
    const res = await fetch(`${apiBase}/api/landslides`);
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    return { data, isPrototype: false };
  } catch {
    return { data: PROTOTYPE_LANDSLIDES, isPrototype: true };
  }
}

export default PROTOTYPE_LANDSLIDES;
