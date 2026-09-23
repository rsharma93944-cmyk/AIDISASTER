/**
 * NER States — North Eastern Region of India
 * Static metadata for all 8 NER states.
 */

export interface NERState {
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

export const NER_STATES: NERState[] = [
  {
    id: 'arunachal-pradesh',
    name: 'Arunachal Pradesh',
    code: 'AR',
    capital: 'Itanagar',
    area: '83,743 km²',
    population: '1.38 million',
    center: { lat: 28.2180, lng: 94.7278 },
    bounds: [[26.6, 91.5], [29.5, 97.4]],
    districts: [
      'Tawang', 'West Kameng', 'East Kameng', 'Papum Pare',
      'Kurung Kumey', 'Kra Daadi', 'Lower Subansiri', 'Upper Subansiri',
      'West Siang', 'East Siang', 'Siang', 'Upper Siang',
      'Lohit', 'Anjaw', 'Changlang', 'Tirap', 'Longding',
    ],
    terrainNote: 'High Himalayan terrain; steep valleys, glacial rivers, extreme slope gradients.',
    landslideRisk: 'HIGH',
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
    districts: [
      'Kamrup Metropolitan', 'Kamrup', 'Cachar', 'Dibrugarh',
      'Jorhat', 'Nagaon', 'Tinsukia', 'Sivsagar', 'Goalpara',
      'Barpeta', 'Sonitpur', 'Lakhimpur', 'Dhubri', 'Bongaigaon',
      'Karbi Anglong', 'Dima Hasao', 'Hojai', 'West Karbi Anglong',
    ],
    terrainNote: 'Brahmaputra floodplain; northern foothills prone to rainfall-induced landslides.',
    landslideRisk: 'MODERATE',
  },
  {
    id: 'manipur',
    name: 'Manipur',
    code: 'MN',
    capital: 'Imphal',
    area: '22,327 km²',
    population: '2.86 million',
    center: { lat: 24.6637, lng: 93.9063 },
    bounds: [[23.8, 93.0], [25.7, 94.8]],
    districts: [
      'Imphal East', 'Imphal West', 'Bishnupur', 'Thoubal',
      'Churachandpur', 'Senapati', 'Tamenglong', 'Ukhrul',
      'Chandel', 'Kangpokpi', 'Jiribam', 'Pherzawl',
    ],
    terrainNote: 'Central valley surrounded by hill ranges; Naga and Lushai hills with slope instability.',
    landslideRisk: 'HIGH',
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    code: 'ML',
    capital: 'Shillong',
    area: '22,429 km²',
    population: '2.97 million',
    center: { lat: 25.4670, lng: 91.3662 },
    bounds: [[24.9, 89.8], [26.1, 92.8]],
    districts: [
      'East Khasi Hills', 'West Khasi Hills', 'South West Khasi Hills',
      'Ri Bhoi', 'Jaintia Hills', 'East Jaintia Hills',
      'East Garo Hills', 'West Garo Hills', 'South Garo Hills',
      'North Garo Hills',
    ],
    terrainNote: 'Plateau edges with steep southward escarpments; among highest rainfall zones in the world.',
    landslideRisk: 'SEVERE',
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    code: 'MZ',
    capital: 'Aizawl',
    area: '21,081 km²',
    population: '1.09 million',
    center: { lat: 23.1645, lng: 92.9376 },
    bounds: [[21.9, 92.3], [24.5, 93.5]],
    districts: [
      'Aizawl', 'Lunglei', 'Champhai', 'Mamit',
      'Kolasib', 'Serchhip', 'Lawngtlai', 'Siaha',
      'Saitual', 'Khawzawl', 'Hnahthial',
    ],
    terrainNote: 'Lushai Hills; narrow ridges and deep gorges, high seismicity and rainfall-triggered slides.',
    landslideRisk: 'HIGH',
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    code: 'NL',
    capital: 'Kohima',
    area: '16,579 km²',
    population: '1.98 million',
    center: { lat: 26.1584, lng: 94.5624 },
    bounds: [[25.1, 93.3], [27.1, 95.3]],
    districts: [
      'Kohima', 'Dimapur', 'Mokokchung', 'Wokha',
      'Zunheboto', 'Mon', 'Tuensang', 'Longleng',
      'Kiphire', 'Phek', 'Peren',
    ],
    terrainNote: 'Patkai range and Naga Hills; steep gradients on NH-29 and NH-702 corridors.',
    landslideRisk: 'HIGH',
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
    districts: [
      'East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim',
      'Pakyong', 'Soreng',
    ],
    terrainNote: 'High Himalayan state; NH-10 (Sevoke–Gangtok) is one of India\'s most landslide-prone corridors.',
    landslideRisk: 'SEVERE',
  },
  {
    id: 'tripura',
    name: 'Tripura',
    code: 'TR',
    capital: 'Agartala',
    area: '10,486 km²',
    population: '3.67 million',
    center: { lat: 23.9408, lng: 91.9882 },
    bounds: [[22.9, 91.1], [24.5, 92.3]],
    districts: [
      'West Tripura', 'Sepahijala', 'Khowai', 'Sipahijala',
      'Gomati', 'South Tripura', 'Dhalai', 'North Tripura',
    ],
    terrainNote: 'Low hill ranges; monsoon-induced slides on terraced hillsides and river banks.',
    landslideRisk: 'MODERATE',
  },
];

export function getNERStateByIdOrName(idOrName: string): NERState | null {
  const normalized = idOrName.toLowerCase().trim();
  return NER_STATES.find(
    (s) => s.id === normalized || s.name.toLowerCase() === normalized || s.code.toLowerCase() === normalized
  ) || null;
}

export function getAllNERDistricts(): { district: string; state: string; stateId: string }[] {
  return NER_STATES.flatMap((s) => s.districts.map((d) => ({ district: d, state: s.name, stateId: s.id })));
}

export default NER_STATES;
