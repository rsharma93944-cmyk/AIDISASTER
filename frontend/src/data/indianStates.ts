/**
 * Indian States
 * Static metadata for a representative set of Indian states for the Pan-India system.
 */

export interface IndianState {
  id: string;
  name: string;
  code: string;
  capital: string;
  area: string;
  population: string;
  center: { lat: number; lng: number };
  bounds: [[number, number], [number, number]];
  districts: string[];
  terrainNote: string;
  landslideRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
}

export const INDIAN_STATES: IndianState[] = [
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    code: 'UK',
    capital: 'Dehradun',
    area: '53,483 km²',
    population: '10.08 million',
    center: { lat: 30.0668, lng: 79.0193 },
    bounds: [[28.7, 77.5], [31.4, 81.0]],
    districts: ['Chamoli', 'Dehradun', 'Haridwar', 'Nainital', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Uttarkashi'],
    terrainNote: 'High Himalayan terrain; highly susceptible to cloudbursts and massive debris flows.',
    landslideRisk: 'SEVERE',
  },
  {
    id: 'kerala',
    name: 'Kerala',
    code: 'KL',
    capital: 'Thiruvananthapuram',
    area: '38,863 km²',
    population: '34.6 million',
    center: { lat: 10.8505, lng: 76.2711 },
    bounds: [[8.2, 74.8], [12.7, 77.4]],
    districts: ['Wayanad', 'Idukki', 'Ernakulam', 'Thiruvananthapuram', 'Kozhikode', 'Palakkad'],
    terrainNote: 'Western Ghats; steep escarpments heavily impacted by extreme monsoon rainfall.',
    landslideRisk: 'HIGH',
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    code: 'MH',
    capital: 'Mumbai',
    area: '307,713 km²',
    population: '112.3 million',
    center: { lat: 19.7515, lng: 75.7139 },
    bounds: [[15.6, 72.6], [22.0, 80.9]],
    districts: ['Mumbai', 'Pune', 'Raigad', 'Ratnagiri', 'Satara', 'Thane'],
    terrainNote: 'Deccan Plateau and Western Ghats; vulnerable to slope failures during heavy monsoon.',
    landslideRisk: 'MODERATE',
  },
  {
    id: 'himachal-pradesh',
    name: 'Himachal Pradesh',
    code: 'HP',
    capital: 'Shimla',
    area: '55,673 km²',
    population: '6.8 million',
    center: { lat: 31.1048, lng: 77.1665 },
    bounds: [[30.3, 75.5], [33.2, 79.0]],
    districts: ['Shimla', 'Kangra', 'Mandi', 'Kullu', 'Chamba', 'Kinnaur'],
    terrainNote: 'Himalayan state with deep valleys, prone to flash floods and rockfalls.',
    landslideRisk: 'SEVERE',
  },
  {
    id: 'assam',
    name: 'Assam',
    code: 'AS',
    capital: 'Dispur',
    area: '78,438 km²',
    population: '31.2 million',
    center: { lat: 26.2006, lng: 92.9376 },
    bounds: [[24.1, 89.7], [28.2, 96.0]],
    districts: ['Kamrup', 'Cachar', 'Dibrugarh', 'Jorhat', 'Dima Hasao'],
    terrainNote: 'Brahmaputra floodplain; northern foothills prone to rainfall-induced landslides.',
    landslideRisk: 'MODERATE',
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    code: 'SK',
    capital: 'Gangtok',
    area: '7,096 km²',
    population: '0.61 million',
    center: { lat: 27.5330, lng: 88.5122 },
    bounds: [[27.0, 88.0], [28.1, 88.9]],
    districts: ['East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim', 'Pakyong', 'Soreng'],
    terrainNote: 'High Himalayan state; NH-10 is one of India\'s most landslide-prone corridors.',
    landslideRisk: 'SEVERE',
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    code: 'TN',
    capital: 'Chennai',
    area: '130,058 km²',
    population: '72.1 million',
    center: { lat: 11.1271, lng: 78.6569 },
    bounds: [[8.0, 76.2], [13.5, 80.3]],
    districts: ['Nilgiris', 'Coimbatore', 'Chennai', 'Madurai', 'Salem'],
    terrainNote: 'Eastern and Western Ghats convergence; Nilgiris highly susceptible to landslides.',
    landslideRisk: 'MODERATE',
  },
  {
    id: 'arunachal-pradesh',
    name: 'Arunachal Pradesh',
    code: 'AR',
    capital: 'Itanagar',
    area: '83,743 km²',
    population: '1.38 million',
    center: { lat: 28.2180, lng: 94.7278 },
    bounds: [[26.6, 91.5], [29.5, 97.4]],
    districts: ['Tawang', 'West Kameng', 'Papum Pare', 'East Siang'],
    terrainNote: 'High Himalayan terrain; steep valleys, glacial rivers, extreme slope gradients.',
    landslideRisk: 'HIGH',
  },
];

export function getIndianStateByIdOrName(idOrName: string): IndianState | null {
  const normalized = idOrName.toLowerCase().trim();
  return INDIAN_STATES.find(
    (s) => s.id === normalized || s.name.toLowerCase() === normalized || s.code.toLowerCase() === normalized
  ) || null;
}

export function getAllIndianDistricts(): { district: string; state: string; stateId: string }[] {
  return INDIAN_STATES.flatMap((s) => s.districts.map((d) => ({ district: d, state: s.name, stateId: s.id })));
}

export default INDIAN_STATES;
