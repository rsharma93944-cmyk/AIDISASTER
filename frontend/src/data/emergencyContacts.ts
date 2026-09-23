export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  rawNumber: string;
  description: string;
  category: 'national' | 'disaster' | 'medical' | 'police' | 'fire' | 'regional';
  available: string;
  verified: boolean;
  authority: string;
  isPrimary?: boolean;
}

export interface RegionalStateHelpline {
  state: string;
  code: string;
  capital: string;
  sdmaTollFree: string;
  controlRoomNumber: string;
  alternateNumber?: string;
  verified: boolean;
  authority: string;
}

/**
 * Officially verified Indian National & Disaster Helplines
 * Sources: NDMA (ndma.gov.in), Ministry of Home Affairs (mha.gov.in), 112 India Emergency Response Support System (ERSS)
 */
export const VERIFIED_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'unified-112',
    name: 'National Unified Emergency Helpline',
    number: '112',
    rawNumber: '112',
    description: 'Single national emergency response number for Police, Fire, Medical, and Disaster Assistance across India.',
    category: 'national',
    available: '24×7 Toll-Free',
    verified: true,
    authority: 'Ministry of Home Affairs (ERSS - 112 India)',
    isPrimary: true,
  },
  {
    id: 'sdma-1070',
    name: 'State Disaster Management Control Room',
    number: '1070',
    rawNumber: '1070',
    description: 'State Emergency Operations Centre (SEOC) toll-free helpline for disaster alerts, slope failures, and rescue deployment.',
    category: 'disaster',
    available: '24×7 Toll-Free',
    verified: true,
    authority: 'State Disaster Management Authorities (SDMA)',
    isPrimary: true,
  },
  {
    id: 'ddma-1077',
    name: 'District Disaster Management Authority (DDMA)',
    number: '1077',
    rawNumber: '1077',
    description: 'District-level Emergency Operations Centre for localized evacuation, road blockage, and village rescue support.',
    category: 'disaster',
    available: '24×7 Toll-Free',
    verified: true,
    authority: 'District Magistrate & DDMA Control Rooms',
  },
  {
    id: 'ndma-1078',
    name: 'NDMA Control Room Helpline',
    number: '1078',
    rawNumber: '1078',
    description: 'National Disaster Management Authority central control room helpline for major disaster coordination.',
    category: 'disaster',
    available: '24×7 Toll-Free',
    verified: true,
    authority: 'National Disaster Management Authority (NDMA)',
  },
  {
    id: 'ndrf-hq',
    name: 'National Disaster Response Force (NDRF HQ)',
    number: '011-24363260',
    rawNumber: '+911124363260',
    description: 'Specialized mountain search and rescue force deployment control room.',
    category: 'disaster',
    available: '24×7 Operations',
    verified: true,
    authority: 'NDRF HQ / 1st & 12th NDRF Battalions (NER)',
  },
  {
    id: 'ambulance-108',
    name: 'Emergency Medical & Ambulance Service',
    number: '108',
    rawNumber: '108',
    description: 'Emergency medical transport and critical trauma response across all North Eastern states.',
    category: 'medical',
    available: '24×7 Toll-Free',
    verified: true,
    authority: 'National Health Mission / GVK EMRI',
    isPrimary: true,
  },
  {
    id: 'police-100',
    name: 'Police Emergency Response',
    number: '100 / 112',
    rawNumber: '100',
    description: 'Highway patrol, traffic cordoning, and public safety during mountain arterial disruptions.',
    category: 'police',
    available: '24×7 Toll-Free',
    verified: true,
    authority: 'State Police Departments',
  },
  {
    id: 'fire-101',
    name: 'Fire & Emergency Rescue Services',
    number: '101',
    rawNumber: '101',
    description: 'Structural rescue, debris clearance equipment, and hazardous flow mitigation.',
    category: 'fire',
    available: '24×7 Toll-Free',
    verified: true,
    authority: 'State Fire & Emergency Services',
  },
];

/**
 * Verified State Disaster Management Control Rooms across all 8 North Eastern States
 */
export const NER_STATE_HELPLINES: RegionalStateHelpline[] = [
  {
    state: 'Assam',
    code: 'AS',
    capital: 'Dispur / Guwahati',
    sdmaTollFree: '1070',
    controlRoomNumber: '0361-2237000',
    alternateNumber: '0361-2237221',
    verified: true,
    authority: 'Assam State Disaster Management Authority (ASDMA)',
  },
  {
    state: 'Sikkim',
    code: 'SK',
    capital: 'Gangtok',
    sdmaTollFree: '1070',
    controlRoomNumber: '03592-202410',
    alternateNumber: '03592-201075',
    verified: true,
    authority: 'Sikkim State Disaster Management Authority (SSDMA)',
  },
  {
    state: 'Meghalaya',
    code: 'ML',
    capital: 'Shillong',
    sdmaTollFree: '1070',
    controlRoomNumber: '0364-2226571',
    alternateNumber: '0364-2503022',
    verified: true,
    authority: 'Meghalaya State Disaster Management Authority (MSDMA)',
  },
  {
    state: 'Arunachal Pradesh',
    code: 'AR',
    capital: 'Itanagar',
    sdmaTollFree: '1070',
    controlRoomNumber: '0360-2212373',
    alternateNumber: '0360-2212268',
    verified: true,
    authority: 'Department of Disaster Management, Arunachal Pradesh',
  },
  {
    state: 'Mizoram',
    code: 'MZ',
    capital: 'Aizawl',
    sdmaTollFree: '1070',
    controlRoomNumber: '0389-2326162',
    alternateNumber: '0389-2322241',
    verified: true,
    authority: 'Disaster Management & Rehabilitation Department, Mizoram',
  },
  {
    state: 'Nagaland',
    code: 'NL',
    capital: 'Kohima',
    sdmaTollFree: '1070',
    controlRoomNumber: '0370-2291122',
    alternateNumber: '0370-2291120',
    verified: true,
    authority: 'Nagaland State Disaster Management Authority (NSDMA)',
  },
  {
    state: 'Manipur',
    code: 'MN',
    capital: 'Imphal',
    sdmaTollFree: '1070',
    controlRoomNumber: '0385-2451172',
    alternateNumber: '0385-2450073',
    verified: true,
    authority: 'Department of Relief & Disaster Management, Manipur',
  },
  {
    state: 'Tripura',
    code: 'TR',
    capital: 'Agartala',
    sdmaTollFree: '1070',
    controlRoomNumber: '0381-2416045',
    alternateNumber: '0381-2418074',
    verified: true,
    authority: 'State Disaster Management Authority, Tripura',
  },
];

export const EMERGENCY_DISCLAIMER =
  'ResQAI provides information and decision-support features. For immediate emergencies, contact the appropriate official emergency service.';
