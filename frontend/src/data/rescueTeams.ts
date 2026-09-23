/**
 * ResQAI — Rescue Team Data Models and Demo Datasets
 * Designed for emergency field operations, dispatching, and live tracking across NER India.
 */

export type RescueTeamStatus = 'Available' | 'En Route' | 'On Site' | 'Completed';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  rank?: string;
  phone?: string;
  skills: string[];
}

export interface RouteWaypoint {
  name: string;
  lat: number;
  lng: number;
  status: 'passed' | 'current' | 'upcoming';
  estimatedTime?: string;
}

export interface RescueIncident {
  id: string;
  incidentCode: string; // e.g., "Landslide #01"
  locationId: string;
  locationName: string;
  district: string;
  state: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'SEVERE';
  riskScore: number;
  affectedPeople: number;
  incidentType: string;
  evacuationRouteName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  reportedAt: string;
  description: string;
  recommendedSafeHaven: string;
}

export interface RescueTeam {
  id: string;
  name: string;
  callSign: string;
  agency: 'NDRF' | 'SDRF' | 'DDMA Quick Response' | 'Assam Rifles Disaster Cell';
  status: RescueTeamStatus;
  baseLocation: string;
  currentLocation: {
    name: string;
    lat: number;
    lng: number;
    district: string;
    state: string;
  };
  leadOfficer: {
    name: string;
    rank: string;
    phone: string;
    radioCall: string;
  };
  membersCount: number;
  members: TeamMember[];
  specialization: string;
  vehicleType: string;
  equipment: string[];
  assignedIncident?: RescueIncident;
  etaMinutes?: number;
  speedKmh?: number;
  lastTelemetryUpdate: string;
  routeCoordinates?: [number, number][]; // [lat, lng] array
  waypoints?: RouteWaypoint[];
  notes?: string;
}

export const INITIAL_RESCUE_TEAMS: RescueTeam[] = [
  {
    id: 'team-alpha',
    name: 'Team Alpha (Kohima SDRF Unit)',
    callSign: 'ALPHA-01',
    agency: 'SDRF',
    status: 'Available',
    baseLocation: 'Kohima Regional HQ, Nagaland',
    currentLocation: {
      name: 'Kohima Town Central Staging Area',
      lat: 25.6751,
      lng: 94.1086,
      district: 'Kohima',
      state: 'Nagaland',
    },
    leadOfficer: {
      name: 'Capt. T. Jamir',
      rank: 'Assistant Commandant',
      phone: '+91 370 229 0041',
      radioCall: 'FREQ-156.800 MHz (Ch-16)',
    },
    membersCount: 14,
    members: [
      { id: 'm-1', name: 'Capt. T. Jamir', role: 'Team Leader', skills: ['Mountain Incident Command', 'Tactical Comms'] },
      { id: 'm-2', name: 'Sub-Insp. A. Ao', role: 'Technical Search Specialist', skills: ['Acoustic Listening Devices', 'Drone Recon'] },
      { id: 'm-3', name: 'Dr. K. Angami', role: 'Field Trauma Medic', skills: ['Triage', 'Advanced Life Support'] },
      { id: 'm-4', name: 'Hav. R. Lotha', role: 'High-Angle Rope Specialist', skills: ['Rigging', 'Slope Extraction'] },
      { id: 'm-5', name: 'Const. B. Sema', role: 'Heavy Extrication Operator', skills: ['Hydraulic Cutters', 'Pneumatic Shoring'] },
      { id: 'm-6', name: 'Const. L. Kikon', role: 'Logistics & Comms', skills: ['Satellite Radios', 'Field Mesh'] },
    ],
    specialization: 'High-Altitude Rope Rescue & Rapid Slope Extraction',
    vehicleType: '4x4 All-Terrain Emergency Response Vehicle + Quad-ATVs',
    equipment: [
      'High-Angle Rigging Kit (200m dynamic lines)',
      'Victim Location Acoustic Sensors (VLL-04)',
      'Thermal Imaging Drone (DJI Matrice 300 RTK)',
      'Hydraulic Spreaders & Cutters (Holmatro)',
      'Portable Trauma Field Stabilizers',
      'Satellite Mesh Communicator (Iridium Extreme)',
    ],
    lastTelemetryUpdate: '3 mins ago (GPS Lock Active)',
    notes: 'Standing by at Kohima Sector 4. Fuel 100%, medical kit fully replenished.',
  },
  {
    id: 'team-bravo',
    name: 'Team Bravo (1st Bn NDRF Dimapur)',
    callSign: 'BRAVO-02',
    agency: 'NDRF',
    status: 'En Route',
    baseLocation: 'Dimapur Base Camp, Nagaland',
    currentLocation: {
      name: 'Dimapur-Kohima Highway Corridor (NH-29 Mile 14)',
      lat: 25.7920,
      lng: 93.9140,
      district: 'Chümoukedima',
      state: 'Nagaland',
    },
    leadOfficer: {
      name: 'Maj. R. Borah',
      rank: 'Deputy Commandant',
      phone: '+91 3862 232 110',
      radioCall: 'FREQ-148.450 MHz (Ch-09)',
    },
    membersCount: 18,
    members: [
      { id: 'm-201', name: 'Maj. R. Borah', role: 'Incident Commander', skills: ['Disaster Operations', 'Civil-Military Liason'] },
      { id: 'm-202', name: 'Sub. P. Gogoi', role: 'Heavy Equipment Coordinator', skills: ['Earthmover Lead', 'Trench Stabilizer'] },
      { id: 'm-203', name: 'Capt. N. Sharma', role: 'Senior Paramedic', skills: ['Crush Injury Protocols', 'Hypothermia Care'] },
      { id: 'm-204', name: 'Hav. S. Teron', role: 'Structural Collapse Searcher', skills: ['Search Cameras', 'K9 Handler'] },
      { id: 'm-205', name: 'Const. M. Das', role: 'Field Engineer', skills: ['Culvert Drainage', 'Hazardous Debris Clearing'] },
    ],
    specialization: 'Heavy Debris Clearing & Trench Collapse Rescue',
    vehicleType: 'Heavy Response Truck + JCB 3DX Backhoe + Support Van',
    equipment: [
      'Heavy Debris Lifting Airbags (70-ton capacity)',
      'Rotary Diamond Saws & Concrete Breakers',
      'Canine Search & Scent Team (2 Canines)',
      'High-Capacity Mud Dewatering Pumps',
      'Emergency Field Lighting Towers (40,000 Lumens)',
      'Portable VHF/HF Relay Station',
    ],
    assignedIncident: {
      id: 'inc-001',
      incidentCode: 'Landslide #01',
      locationId: 'kohima',
      locationName: 'Kohima NH-29 Bypass Slope',
      district: 'Kohima',
      state: 'Nagaland',
      riskLevel: 'HIGH',
      riskScore: 78,
      affectedPeople: 120,
      incidentType: 'Major Slope Rupture across Arterial Highway',
      evacuationRouteName: 'Route Alpha: NH-29 Bypass → Jotsoma High Ground Shelter',
      coordinates: {
        lat: 25.6751,
        lng: 94.1086,
      },
      reportedAt: '18 mins ago (Sensor Triggered)',
      description: 'Active mudflow and rock debris obstructing 45m section of NH-29. 6 vehicles stranded, 2 residential structures on downhill crest at imminent risk.',
      recommendedSafeHaven: 'Kohima Regional Indoor Stadium Evacuation Centre',
    },
    etaMinutes: 18,
    speedKmh: 42,
    lastTelemetryUpdate: 'Live (Speed 42 km/h, Moving North-East)',
    routeCoordinates: [
      [25.9068, 93.7279], // Dimapur base
      [25.8610, 93.7950], // Chümoukedima Gate
      [25.7920, 93.9140], // Current position (Mile 14)
      [25.7420, 93.9980], // Medziphema Overpass
      [25.6980, 94.0620], // Jotsoma Ridge
      [25.6751, 94.1086], // Incident site (Kohima)
    ],
    waypoints: [
      { name: 'Dimapur Base HQ', lat: 25.9068, lng: 93.7279, status: 'passed' },
      { name: 'Chümoukedima Checkpost', lat: 25.8610, lng: 93.7950, status: 'passed' },
      { name: 'Mile 14 Mountain Gradient (Current)', lat: 25.7920, lng: 93.9140, status: 'current', estimatedTime: 'Now' },
      { name: 'Jotsoma Safe Crossing', lat: 25.6980, lng: 94.0620, status: 'upcoming', estimatedTime: '+10 mins' },
      { name: 'Kohima Incident Ground', lat: 25.6751, lng: 94.1086, status: 'upcoming', estimatedTime: '+18 mins' },
    ],
    notes: 'Convoy escorted by Nagaland Traffic Police. Heavy excavator in rear column.',
  },
  {
    id: 'team-charlie',
    name: 'Team Charlie (12th Bn NDRF Itanagar)',
    callSign: 'CHARLIE-03',
    agency: 'NDRF',
    status: 'On Site',
    baseLocation: 'Doimukh Sector Base, Arunachal Pradesh',
    currentLocation: {
      name: 'Papum Pare Hill Sector 3 (Incident Ground)',
      lat: 27.0844,
      lng: 93.6053,
      district: 'Papum Pare',
      state: 'Arunachal Pradesh',
    },
    leadOfficer: {
      name: 'Insp. S. Tayeng',
      rank: 'Inspector / Sector Lead',
      phone: '+91 360 221 2450',
      radioCall: 'FREQ-151.200 MHz (Ch-04)',
    },
    membersCount: 22,
    members: [
      { id: 'm-301', name: 'Insp. S. Tayeng', role: 'Sector Commander', skills: ['Urban & Hill Search', 'Radio Dispatch'] },
      { id: 'm-302', name: 'Sub-Insp. M. Riba', role: 'Forward Evacuation Chief', skills: ['Civil Crowd Management', 'Safe Haven Routing'] },
      { id: 'm-303', name: 'Dr. H. Tsering', role: 'Emergency Field Surgeon', skills: ['Surgical Triage', 'Mass Casualty Protocols'] },
      { id: 'm-304', name: 'Hav. K. Nabam', role: 'Structural Stability Assessor', skills: ['Crack Extensometers', 'Laser Rangefinders'] },
      { id: 'm-305', name: 'Const. G. Basar', role: 'Swift Water & Mud Rescue', skills: ['Life Rafts', 'Flotation Harnesses'] },
    ],
    specialization: 'Mass Evacuation, Casualty Triage & Slope Stabilization',
    vehicleType: '3x Heavy Troop Carriers + 2x Mobile Ambulance Units',
    equipment: [
      'Inflatable Field Hospital & Triage Tent (30 beds)',
      'Laser Geodetic Slope Creep Monitor',
      'Life Detection Radar (LDR-X)',
      'Battery-Powered Hydraulic Cutters',
      'Emergency Satellite Broadband Terminal',
    ],
    assignedIncident: {
      id: 'inc-002',
      incidentCode: 'Landslide #02',
      locationId: 'itanagar',
      locationName: 'Itanagar Papum Pare Sector',
      district: 'Papum Pare',
      state: 'Arunachal Pradesh',
      riskLevel: 'CRITICAL',
      riskScore: 89,
      affectedPeople: 280,
      incidentType: 'Severe Slope Failure with Debris Flow into Settlement',
      evacuationRouteName: 'Route Bravo: Ward 7 Road → Doimukh High Ground Relief Hub',
      coordinates: {
        lat: 27.0844,
        lng: 93.6053,
      },
      reportedAt: '42 mins ago (Radar & Eyewitness)',
      description: 'Massive rotational landslide involving ~40,000 cu.m of wet schist soil. 18 dwellings evacuated, 4 individuals successfully rescued, active triage in progress.',
      recommendedSafeHaven: 'Itanagar Multipurpose Community Shelter',
    },
    etaMinutes: 0,
    speedKmh: 0,
    lastTelemetryUpdate: 'On Scene — Actively conducting triage & safety cordon',
    routeCoordinates: [
      [27.1420, 93.7530], // Base Doimukh
      [27.1100, 93.6800], // Highway
      [27.0844, 93.6053], // Incident Ground
    ],
    waypoints: [
      { name: 'Doimukh Base', lat: 27.1420, lng: 93.7530, status: 'passed' },
      { name: 'Papum Pare Sector 3 Ground (On Site)', lat: 27.0844, lng: 93.6053, status: 'current', estimatedTime: 'On Scene' },
    ],
    notes: 'Establishing 200-meter safety perimeter. Geotechnical sensors detect secondary slope creep.',
  },
  {
    id: 'team-delta',
    name: 'Team Delta (SDRF Gangtok Emergency Unit)',
    callSign: 'DELTA-04',
    agency: 'SDRF',
    status: 'En Route',
    baseLocation: 'Sikkim State Disaster HQ, Gangtok',
    currentLocation: {
      name: 'Singtam-Ranipool Mountain Sector (NH-10 Km 48)',
      lat: 27.2400,
      lng: 88.5200,
      district: 'East Sikkim',
      state: 'Sikkim',
    },
    leadOfficer: {
      name: 'Sub-Maj. P. Lepcha',
      rank: 'Sub-Major / Lead Climber',
      phone: '+91 3592 202 590',
      radioCall: 'FREQ-144.150 MHz (Ch-02)',
    },
    membersCount: 16,
    members: [
      { id: 'm-401', name: 'Sub-Maj. P. Lepcha', role: 'Alpine Response Lead', skills: ['Glacial & Mountain Rescue', 'Avalanche Search'] },
      { id: 'm-402', name: 'Sub-Insp. D. Bhutia', role: 'Drone Recon Operator', skills: ['LiDAR Topography', 'Thermal Scouting'] },
      { id: 'm-403', name: 'Dr. C. Pradhan', role: 'Cold-Climate Paramedic', skills: ['Hypothermia Management', 'Trauma Resuscitation'] },
      { id: 'm-404', name: 'Hav. T. Rai', role: 'Rock Anchor Specialist', skills: ['Percussion Drilling', 'Cliff Safety Belays'] },
    ],
    specialization: 'Alpine Mountain Rescue & Arterial Corridor Clearance',
    vehicleType: '2x High-Clearance 4x4 Mountain Trucks + Snow-capable winch',
    equipment: [
      'Heavy Cliff Anchoring & Winch Systems',
      'Infrared Night-Vision Goggles & Scopes',
      'Gas & Hazardous Fume Leak Detectors',
      'Foldable Carbon-Fiber Litters & Spineboards',
      'Emergency Satellite Telemetry Transceiver',
    ],
    assignedIncident: {
      id: 'inc-003',
      incidentCode: 'Landslide #03',
      locationId: 'gangtok',
      locationName: 'Gangtok NH-10 Corridor (Km 54)',
      district: 'East Sikkim',
      state: 'Sikkim',
      riskLevel: 'HIGH',
      riskScore: 76,
      affectedPeople: 95,
      incidentType: 'Steep Rockfall and Mudslide blocking NH-10 Lifeline',
      evacuationRouteName: 'Route Gamma: NH-10 Km 54 → Singtam Safe Transit Staging Ground',
      coordinates: {
        lat: 27.3314,
        lng: 88.6138,
      },
      reportedAt: '25 mins ago (NHIDCL Road Patrol)',
      description: 'Heavy continuous rain caused wedge failure of rockmass onto NH-10. Multiple tourist vehicles waiting behind closure. Heavy boulders require pneumatic breaking.',
      recommendedSafeHaven: 'Singtam Disaster Relief Camp & Transit Centre',
    },
    etaMinutes: 24,
    speedKmh: 35,
    lastTelemetryUpdate: 'Live (Speed 35 km/h in fog conditions)',
    routeCoordinates: [
      [27.1500, 88.4900], // Singtam Valley
      [27.2400, 88.5200], // Km 48 (Current)
      [27.2800, 88.5600], // Ranipool Junction
      [27.3314, 88.6138], // Gangtok Incident Site
    ],
    waypoints: [
      { name: 'Singtam Transit Hub', lat: 27.1500, lng: 88.4900, status: 'passed' },
      { name: 'Km 48 Mountain Curve (Current)', lat: 27.2400, lng: 88.5200, status: 'current', estimatedTime: 'Now' },
      { name: 'Ranipool Checkpoint', lat: 27.2800, lng: 88.5600, status: 'upcoming', estimatedTime: '+12 mins' },
      { name: 'Gangtok NH-10 Ground', lat: 27.3314, lng: 88.6138, status: 'upcoming', estimatedTime: '+24 mins' },
    ],
    notes: 'Visibility under 20 meters due to dense ridge fog. Hazard lights on.',
  },
  {
    id: 'team-echo',
    name: 'Team Echo (SDRF Shillong Unit)',
    callSign: 'ECHO-05',
    agency: 'SDRF',
    status: 'Available',
    baseLocation: 'Civil Defence HQ, Shillong, Meghalaya',
    currentLocation: {
      name: 'Shillong East Khasi Hills Staging Ground',
      lat: 25.5788,
      lng: 91.8933,
      district: 'East Khasi Hills',
      state: 'Meghalaya',
    },
    leadOfficer: {
      name: 'Capt. M. Marak',
      rank: 'Captain / Commander',
      phone: '+91 364 222 6660',
      radioCall: 'FREQ-154.600 MHz (Ch-11)',
    },
    membersCount: 12,
    members: [
      { id: 'm-501', name: 'Capt. M. Marak', role: 'Team Commander', skills: ['Urban Disaster Mgmt', 'High Rainfall Ops'] },
      { id: 'm-502', name: 'Sub-Insp. W. Lyngdoh', role: 'Hydrological Response', skills: ['Flash Flood Boating', 'Gorge Ropeways'] },
      { id: 'm-503', name: 'Dr. E. Sangma', role: 'Paramedic', skills: ['Emergency Wound Care', 'Hypoxia Support'] },
      { id: 'm-504', name: 'Hav. K. Kharbangar', role: 'Geological Field Scout', skills: ['Soil Penetrometer', 'Drainage Diversion'] },
    ],
    specialization: 'High-Precipitation Slope Drainage & Gorge Extraction',
    vehicleType: '2x 4x4 Quick Response Vans + 1x Medical Transport',
    equipment: [
      'Submersible Mud Pumps (3,000 L/min)',
      'High-Tension Tyrolean Traverse Rope Gear',
      'Autonomous Water Rescue Buoys',
      'High-Power Megaphones & Warning Sirens',
      'Emergency Solar Battery Backup Stations',
    ],
    lastTelemetryUpdate: '5 mins ago (Base Station Standby)',
    notes: 'Monitoring Cherrapunji / Mawsynram rainfall radar. Ready for immediate mobilization.',
  },
  {
    id: 'team-foxtrot',
    name: 'Team Foxtrot (NDRF Hub Guwahati Quick Reaction)',
    callSign: 'FOXTROT-06',
    agency: 'NDRF',
    status: 'Completed',
    baseLocation: 'Patgaon Regional Centre, Guwahati, Assam',
    currentLocation: {
      name: 'Guwahati Kamrup Relief Base',
      lat: 26.1445,
      lng: 91.7362,
      district: 'Kamrup Metropolitan',
      state: 'Assam',
    },
    leadOfficer: {
      name: 'Maj. A. Das',
      rank: 'Major / Senior Operations Officer',
      phone: '+91 361 245 8890',
      radioCall: 'FREQ-149.800 MHz (Ch-08)',
    },
    membersCount: 20,
    members: [
      { id: 'm-601', name: 'Maj. A. Das', role: 'Battalion Operations Head', skills: ['Strategic Logistics', 'Regional Coordination'] },
      { id: 'm-602', name: 'Capt. D. Kalita', role: 'Drone Fleet Lead', skills: ['Aerial 3D Photogrammetry', 'Thermal Surveying'] },
      { id: 'm-603', name: 'Sub. R. Saikia', role: 'Field Engineer', skills: ['Bridge Shoring', 'Retaining Wall Anchors'] },
    ],
    specialization: 'Regional Logistic Hub, Drone Photogrammetry & Fast Reinforcement',
    vehicleType: 'Heavy Transport Fleet (2 Trucks + 1 Mobile Command Centre)',
    equipment: [
      'Mobile Operations Command & Control Van (Satellite uplink)',
      'DJI Matrice 350 RTK Drone Fleet (3 Units)',
      'Ground Penetrating Radar (GPR-500)',
      'Heavy Winch Recovery Crane (25-ton)',
    ],
    assignedIncident: {
      id: 'inc-004',
      incidentCode: 'Landslide #00-Resolved',
      locationId: 'guwahati',
      locationName: 'Guwahati Hills Kamrup Sector',
      district: 'Kamrup Metropolitan',
      state: 'Assam',
      riskLevel: 'MODERATE',
      riskScore: 42,
      affectedPeople: 45,
      incidentType: 'Minor Retaining Wall Collapse (Cleared and Stabilized)',
      evacuationRouteName: 'GS Road Safe Bypass Corridor',
      coordinates: {
        lat: 26.1445,
        lng: 91.7362,
      },
      reportedAt: '6 hours ago (Completed)',
      description: 'Retaining wall secured with gabion wire crates. Debris removed from roadway, traffic restored, all 45 individuals returned to dwellings safely.',
      recommendedSafeHaven: 'Guwahati Stadium Transit Shelter',
    },
    lastTelemetryUpdate: 'Operation completed successfully. Post-mission maintenance underway.',
    notes: 'Mission debrief complete. Standing down for 2-hour equipment calibration.',
  },
];
