/**
 * ResQAI — Designated & Prototype Safe Evacuation Destinations
 * Centralized dataset for emergency shelters, relief centres, and staging grounds across NER India.
 *
 * NOTE:
 * Unless officially verified by state DDMA / NDMA, these destinations are labelled as
 * "prototype-demo" for decision-support prototyping only.
 */

export interface SafeLocation {
  id: string;
  name: string;
  type: 'Relief Centre' | 'District Staging Area' | 'Community Evacuation Point' | 'Army / SDRF Transit Ground' | 'Emergency Helipad Zone';
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  capacityEstimate: string;
  elevation: string;
  verified: boolean;
  source: string;
  features: string[];
  contactAgency: string;
  isPrototype: boolean;
}

export const SAFE_DESTINATIONS: SafeLocation[] = [
  // Nagaland
  {
    id: 'safe-nld-001',
    name: 'Kohima Regional Indoor Stadium Evacuation Centre',
    type: 'Relief Centre',
    state: 'Nagaland',
    district: 'Kohima',
    latitude: 25.6650,
    longitude: 94.1120,
    capacityEstimate: '1,200 persons',
    elevation: '1,420 m ASL (Stable Ridge)',
    verified: false,
    source: 'prototype-demo',
    features: ['Helipad Access', 'Medical Staging', 'Reinforced Roof', 'Backup Power'],
    contactAgency: 'Nagaland State Disaster Management Authority (NSDMA)',
    isPrototype: true,
  },
  {
    id: 'safe-nld-002',
    name: 'Dimapur DDMA Flood & Slide Relief Hub',
    type: 'District Staging Area',
    state: 'Nagaland',
    district: 'Dimapur',
    latitude: 25.9068,
    longitude: 93.7279,
    capacityEstimate: '3,000 persons',
    elevation: '195 m ASL (Plain Zone)',
    verified: false,
    source: 'prototype-demo',
    features: ['High-Volume Food Stocks', 'SDRF Base', 'Major Highway Link'],
    contactAgency: 'DDMA Dimapur',
    isPrototype: true,
  },

  // Sikkim
  {
    id: 'safe-skm-001',
    name: 'Paljor Stadium Upper Evacuation Ground',
    type: 'Relief Centre',
    state: 'Sikkim',
    district: 'East Sikkim',
    latitude: 27.3292,
    longitude: 88.6185,
    capacityEstimate: '2,500 persons',
    elevation: '1,680 m ASL',
    verified: false,
    source: 'prototype-demo',
    features: ['Open Canopy Ground', 'Direct Hospital Access', 'Water Filtration'],
    contactAgency: 'Sikkim State Disaster Management Authority (SSDMA)',
    isPrototype: true,
  },
  {
    id: 'safe-skm-002',
    name: 'Singtam Riverine High-Ground Relief Depot',
    type: 'District Staging Area',
    state: 'Sikkim',
    district: 'East Sikkim',
    latitude: 27.2340,
    longitude: 88.4980,
    capacityEstimate: '800 persons',
    elevation: '1,350 m ASL (Elevated Terrace)',
    verified: false,
    source: 'prototype-demo',
    features: ['First Aid Camp', 'Emergency Fuel', 'Satellite Comms'],
    contactAgency: 'East Sikkim District Administration',
    isPrototype: true,
  },

  // Meghalaya
  {
    id: 'safe-meg-001',
    name: 'Jawaharlal Nehru Sports Complex Relief Shelter',
    type: 'Relief Centre',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    latitude: 25.5910,
    longitude: 91.8985,
    capacityEstimate: '2,000 persons',
    elevation: '1,510 m ASL (Plateau Base)',
    verified: false,
    source: 'prototype-demo',
    features: ['Civil Defence Staging', 'Triage Station', 'Sheltered Halls'],
    contactAgency: 'Meghalaya State Disaster Management Authority (SDMA)',
    isPrototype: true,
  },
  {
    id: 'safe-meg-002',
    name: 'Nongpoh Valley Transit Relief Centre',
    type: 'District Staging Area',
    state: 'Meghalaya',
    district: 'Ri-Bhoi',
    latitude: 25.9030,
    longitude: 91.8810,
    capacityEstimate: '1,500 persons',
    elevation: '485 m ASL',
    verified: false,
    source: 'prototype-demo',
    features: ['GS Road Corridor Access', 'Heavy Vehicle Parking', 'SDRF Station'],
    contactAgency: 'Ri-Bhoi District Administration',
    isPrototype: true,
  },

  // Assam
  {
    id: 'safe-asm-001',
    name: 'Sarusajai Sports Complex Emergency Camp',
    type: 'District Staging Area',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    latitude: 26.1150,
    longitude: 91.7580,
    capacityEstimate: '5,000 persons',
    elevation: '55 m ASL (All-Weather)',
    verified: false,
    source: 'prototype-demo',
    features: ['Helipad', 'State Emergency Operations Centre Link', 'Multi-bed Trauma Unit'],
    contactAgency: 'Assam State Disaster Management Authority (ASDMA)',
    isPrototype: true,
  },
  {
    id: 'safe-asm-002',
    name: 'Haflong High Plateau Community Shelter',
    type: 'Community Evacuation Point',
    state: 'Assam',
    district: 'Dima Hasao',
    latitude: 25.1720,
    longitude: 93.0180,
    capacityEstimate: '900 persons',
    elevation: '960 m ASL (Geologically Stable Peak)',
    verified: false,
    source: 'prototype-demo',
    features: ['Rainfall Deflection Shelter', 'Solar Microgrid', 'Ham Radio Station'],
    contactAgency: 'Dima Hasao DDMA',
    isPrototype: true,
  },

  // Mizoram
  {
    id: 'safe-miz-001',
    name: 'Aizawl Rajiv Gandhi Stadium Relief Camp',
    type: 'Relief Centre',
    state: 'Mizoram',
    district: 'Aizawl',
    latitude: 23.7420,
    longitude: 92.7160,
    capacityEstimate: '1,800 persons',
    elevation: '1,120 m ASL',
    verified: false,
    source: 'prototype-demo',
    features: ['Emergency Water Reservoir', 'Ambulance Bay', 'Temporary Dormitories'],
    contactAgency: 'Mizoram Disaster Management & Rehabilitation',
    isPrototype: true,
  },
  {
    id: 'safe-miz-002',
    name: 'Kolasib District High Ground Evacuation Base',
    type: 'District Staging Area',
    state: 'Mizoram',
    district: 'Kolasib',
    latitude: 24.2250,
    longitude: 92.6780,
    capacityEstimate: '1,000 persons',
    elevation: '620 m ASL',
    verified: false,
    source: 'prototype-demo',
    features: ['NH-54 Transit Link', 'Medical Supply Depot'],
    contactAgency: 'Kolasib District Administration',
    isPrototype: true,
  },

  // Manipur
  {
    id: 'safe-mnp-001',
    name: 'Khuman Lampak Main Stadium Disaster Relief Camp',
    type: 'Relief Centre',
    state: 'Manipur',
    district: 'Imphal East',
    latitude: 24.8180,
    longitude: 93.9480,
    capacityEstimate: '4,000 persons',
    elevation: '785 m ASL (Valley Centre)',
    verified: false,
    source: 'prototype-demo',
    features: ['Ample Helipad Landing Space', 'Food Distribution Complex', 'Military Escort Link'],
    contactAgency: 'Manipur Relief and Disaster Management',
    isPrototype: true,
  },

  // Arunachal Pradesh
  {
    id: 'safe-arn-001',
    name: 'Indira Gandhi Park Designated Assembly Base',
    type: 'Relief Centre',
    state: 'Arunachal Pradesh',
    district: 'Papum Pare',
    latitude: 27.0980,
    longitude: 93.6180,
    capacityEstimate: '2,200 persons',
    elevation: '560 m ASL',
    verified: false,
    source: 'prototype-demo',
    features: ['Emergency Air-Drop Field', 'NDRF Response Unit', 'Satellite Telecom Link'],
    contactAgency: 'Arunachal Pradesh State Disaster Management Authority',
    isPrototype: true,
  },

  // Tripura
  {
    id: 'safe-trpm-001',
    name: 'Swami Vivekananda Stadium Relief Complex',
    type: 'Relief Centre',
    state: 'Tripura',
    district: 'West Tripura',
    latitude: 23.8340,
    longitude: 91.2820,
    capacityEstimate: '3,500 persons',
    elevation: '32 m ASL',
    verified: false,
    source: 'prototype-demo',
    features: ['High-Capacity Drainage', 'Command Post', 'Full Medical Tents'],
    contactAgency: 'Tripura State Disaster Management Authority',
    isPrototype: true,
  },
];

/**
 * Helper to get safe destinations for a given state or coordinate
 */
export function getSafeDestinationsByState(stateName?: string): SafeLocation[] {
  if (!stateName || stateName === 'ALL') return SAFE_DESTINATIONS;
  const normalized = stateName.toLowerCase().trim();
  const filtered = SAFE_DESTINATIONS.filter(d => d.state.toLowerCase() === normalized);
  return filtered.length > 0 ? filtered : SAFE_DESTINATIONS;
}

export function getNearestSafeDestinations(lat: number, lng: number, count = 4): (SafeLocation & { distanceKm: number })[] {
  const list = SAFE_DESTINATIONS.map(dest => {
    // Haversine distance
    const R = 6371; // km
    const dLat = ((dest.latitude - lat) * Math.PI) / 180;
    const dLon = ((dest.longitude - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((dest.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = Math.round(R * c * 10) / 10;
    return { ...dest, distanceKm };
  });

  return list.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, count);
}

export default SAFE_DESTINATIONS;
