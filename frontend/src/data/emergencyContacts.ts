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
    authority: 'NDRF HQ / 1st & 12th NDRF Battalions (India)',
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
 * Verified State Disaster Management Control Rooms across key Indian states
 */
export const NER_STATE_HELPLINES: RegionalStateHelpline[] = [
  {
    state: 'Uttarakhand',
    code: 'UK',
    capital: 'Dehradun',
    sdmaTollFree: '1070',
    controlRoomNumber: '0135-2710334',
    alternateNumber: '0135-2710335',
    verified: true,
    authority: 'Uttarakhand State Disaster Management Authority (USDMA)',
  },
  {
    state: 'Himachal Pradesh',
    code: 'HP',
    capital: 'Shimla',
    sdmaTollFree: '1070',
    controlRoomNumber: '0177-2621723',
    alternateNumber: '0177-2880055',
    verified: true,
    authority: 'Himachal Pradesh State Disaster Management Authority (HPSDMA)',
  },
  {
    state: 'Kerala',
    code: 'KL',
    capital: 'Thiruvananthapuram',
    sdmaTollFree: '1070',
    controlRoomNumber: '0471-2364424',
    alternateNumber: '0471-2331639',
    verified: true,
    authority: 'Kerala State Disaster Management Authority (KSDMA)',
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
    state: 'Maharashtra',
    code: 'MH',
    capital: 'Mumbai',
    sdmaTollFree: '1070',
    controlRoomNumber: '022-22027990',
    alternateNumber: '022-22853048',
    verified: true,
    authority: 'Maharashtra State Disaster Management Authority',
  },
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
    state: 'Tamil Nadu',
    code: 'TN',
    capital: 'Chennai',
    sdmaTollFree: '1070',
    controlRoomNumber: '044-25672500',
    alternateNumber: '044-28413534',
    verified: true,
    authority: 'Tamil Nadu State Disaster Management Authority (TNSDMA)',
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
    state: 'West Bengal',
    code: 'WB',
    capital: 'Kolkata',
    sdmaTollFree: '1070',
    controlRoomNumber: '033-22143526',
    alternateNumber: '033-22534317',
    verified: true,
    authority: 'West Bengal State Disaster Management Authority',
  },
  {
    state: 'Jammu & Kashmir',
    code: 'JK',
    capital: 'Srinagar',
    sdmaTollFree: '1070',
    controlRoomNumber: '0194-2440029',
    alternateNumber: '0194-2452052',
    verified: true,
    authority: 'J&K State Disaster Management Authority (JKSDMA)',
  },
];

export const EMERGENCY_DISCLAIMER =
  'ResQAI provides information and decision-support features. For immediate emergencies, contact the appropriate official emergency service.';
