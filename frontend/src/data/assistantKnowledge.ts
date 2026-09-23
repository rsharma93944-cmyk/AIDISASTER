export interface KnowledgeItem {
  id: string;
  keywords: string[];
  title: string;
  response: string;
  quickActions?: { label: string; action: string; path?: string }[];
  suggestedFollowUps?: string[];
  category: 'risk' | 'rainfall' | 'slope' | 'detection' | 'safety' | 'ner' | 'yolo' | 'alerts' | 'general';
}

export const ASSISTANT_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'rainfall-risk',
    keywords: ['rainfall', 'rain', 'precipitation', 'monsoon', 'water', 'saturation', 'pore pressure', 'soil moisture'],
    title: 'Rainfall & Pore-Water Saturation',
    response: `**Rainfall is the primary triggering factor for landslides in Northeast India.**

When prolonged or intense monsoon precipitation occurs:
1. **Soil Saturation:** Rain infiltrates the topsoil, increasing unit weight and pore-water pressure.
2. **Shear Strength Reduction:** The elevated pore pressure reduces the effective normal stress between soil particles, drastically lowering the slope's shear resistance.
3. **Threshold Exceedance:** In the NER Himalayan belt, cumulative 24-hour rainfall exceeding **120–140 mm** or 72-hour cumulative precipitation exceeding **250 mm** triggers critical slope instability.

*Tip: In ResQAI's multi-parametric risk engine, rainfall carries a 30% analytical weighting.*`,
    quickActions: [
      { label: 'Check Risk Factors', action: 'navigate', path: '/risk-monitoring' },
      { label: 'View Live Map', action: 'navigate', path: '/live-map' }
    ],
    suggestedFollowUps: [
      'What factors increase landslide risk?',
      'Why is this location at risk?',
      'What does High Risk mean?'
    ],
    category: 'rainfall'
  },
  {
    id: 'yolo11-vision',
    keywords: ['yolo', 'yolo11', 'image', 'photo', 'vision', 'camera', 'detection', 'scarp', 'tension crack', 'debris', 'segmentation'],
    title: 'ResQAI YOLO11 Landslide Vision Pipeline',
    response: `**ResQAI utilizes YOLO11 for image-based terrain and landslide indicator detection.**

Key aspects of the vision pipeline:
- **Visual Features Detected:** Model detects crown scarps, tension cracks, toe bulges, rockfall debris, and active slope displacement.
- **Inference Pipeline:** High-resolution drone or ground photos are uploaded via \`/analysis\` and processed through the YOLO11 model service (\`POST /predict\`).
- **Confidence & Bounding Boxes:** Identified rupture zones are annotated with bounding boxes, risk classification, and localized confidence scores.
- **Frontend Prototype Mode:** When the backend service is offline, the system clearly discloses prototype status without fabricating fake AI predictions.`,
    quickActions: [
      { label: 'Open Image Analysis', action: 'navigate', path: '/analysis' },
      { label: 'View Live Alerts', action: 'navigate', path: '/alerts' }
    ],
    suggestedFollowUps: [
      'How does ResQAI detect landslides?',
      'What factors increase landslide risk?'
    ],
    category: 'yolo'
  },
  {
    id: 'risk-factors',
    keywords: ['factor', 'factors', 'why', 'cause', 'causes', 'increase', 'contribute', 'trigger', 'geotechnical'],
    title: 'Key Geotechnical & Environmental Risk Factors',
    response: `**Landslide risk in ResQAI is assessed across 5 primary multi-parametric factors:**

1. **Precipitation & Moisture (30% Weight):** Antecedent rainfall and current 24h precipitation rate causing pore-water elevation.
2. **Slope & Topography (25% Weight):** Terrain gradient — slopes between **32° and 55°** with steep convex profiles exhibit highest vulnerability.
3. **Soil & Geological Lithology (20% Weight):** Weakly consolidated phyllites, shales, and weathered clayey overburden prone to liquefaction.
4. **Subsurface Ground Displacement (15% Weight):** Real-time GNSS/InSAR slope creep exceeding **12 mm/day**.
5. **Historical Susceptibility & Seismicity (10% Weight):** Past debris slide events and minor seismic fault activity.`,
    quickActions: [
      { label: 'Examine Factor Breakdown', action: 'navigate', path: '/risk-monitoring' },
      { label: 'View Live Map', action: 'navigate', path: '/live-map' }
    ],
    suggestedFollowUps: [
      'Why is this location at risk?',
      'What does High Risk mean?',
      'How does rainfall affect landslide risk?'
    ],
    category: 'risk'
  },
  {
    id: 'location-risk-why',
    keywords: ['location', 'why is this location at risk', 'melli', 'jorethang', 'gangtok', 'south sikkim', 'current location'],
    title: 'Location-Specific Risk Assessment',
    response: `**Currently monitored priority zone: Melli–Jorethang Ridge (South Sikkim)**

**Current Risk Status: HIGH (78% Composite Index)**
- **Rainfall:** 142 mm / 24h (Exceeding critical 120 mm threshold by +18%)
- **Slope Angle:** 42.5° (Steep unstable gneissic slope)
- **Soil Saturation:** 84% pore saturation with high seepage pressure
- **Surface Displacement:** +14.2 mm / 24h slope creep recorded by GNSS telemetry
- **Geological Unit:** Weathered Daling Group Phyllites with pervasive shear planes.

*Recommendation:* Maintain Level 2 Warning, restrict heavy vehicle movement along NH-10, and notify local disaster management authorities.`,
    quickActions: [
      { label: 'Open Risk Monitoring', action: 'navigate', path: '/risk-monitoring' },
      { label: 'View Alert Status', action: 'navigate', path: '/alerts' }
    ],
    suggestedFollowUps: [
      'What should I do during a landslide warning?',
      'What does High Risk mean?'
    ],
    category: 'risk'
  },
  {
    id: 'risk-levels-explained',
    keywords: ['high risk', 'risk level', 'risk levels', 'low risk', 'moderate risk', 'severe', 'critical', 'meaning', 'threshold'],
    title: 'Understanding ResQAI Risk Levels',
    response: `**ResQAI categorizes landslide hazard into four standard operational levels:**

- 🟢 **LOW RISK (0% – 39%):** Normal conditions. Slope displacement < 3 mm/day, soil saturation < 45%. Standard monitoring.
- 🟡 **MODERATE RISK (40% – 64%):** Elevated rainfall or moderate slope creep (3–8 mm/day). Advisory watch issued; field verification recommended.
- 🟠 **HIGH RISK (65% – 84%):** Severe pore-pressure saturation (> 75%), slope movement > 10 mm/day. **Level 2 Warning active**. Pre-emptive traffic restrictions and emergency service alerts triggered.
- 🔴 **SEVERE / CRITICAL (85% – 100%):** Imminent slope failure detected (> 25 mm/day displacement or severe storm deluge). **Level 3 Evacuation Alert** recommended.`,
    quickActions: [
      { label: 'View All Active Alerts', action: 'navigate', path: '/alerts' },
      { label: 'Inspect Live Map', action: 'navigate', path: '/live-map' }
    ],
    suggestedFollowUps: [
      'What should I do during a landslide warning?',
      'Why is this location at risk?'
    ],
    category: 'risk'
  },
  {
    id: 'emergency-contacts-helpline',
    keywords: [
      'who should i contact', 'who to contact', 'emergency contact', 'emergency contacts',
      'emergency number', 'emergency numbers', 'helpline', 'helplines', 'i need emergency help',
      'call emergency', 'call police', 'call ambulance', 'call ndrf', 'disaster helpline',
      'phone number', 'contact number', 'ndma number', 'sdma number', 'police number'
    ],
    title: 'Verified Disaster & Emergency Helplines (India & NER)',
    response: `**Official Verified Emergency & Disaster Helplines:**

🚨 **National Unified Emergency:**
- **112** — Single unified helpline for Police, Fire, Ambulance & Rescue across India (24×7 Toll-Free)

🏔️ **Disaster Management Helplines:**
- **1070** — State Disaster Management Control Room (SEOC Toll-Free)
- **1077** — District Disaster Management Authority (DDMA / District Control Room)
- **1078** — NDMA Central Control Room Helpline
- **011-24363260** — NDRF HQ 24×7 Operations Control Room

🚑 **Medical & Critical Response:**
- **108** — Emergency Medical & Ambulance Service
- **100 / 112** — Police Emergency
- **101** — Fire & Rescue Service

📍 **Northeast State Disaster Control Rooms (Direct Landlines):**
- **Assam (ASDMA):** \`0361-2237000\` / \`1070\`
- **Sikkim (SSDMA):** \`03592-202410\` / \`1070\`
- **Meghalaya (MSDMA):** \`0364-2226571\` / \`1070\`
- **Arunachal Pradesh:** \`0360-2212373\` / \`1070\`
- **Mizoram:** \`0389-2326162\` / \`1070\`
- **Nagaland (NSDMA):** \`0370-2291122\` / \`1070\`
- **Manipur:** \`0385-2451172\` / \`1070\`
- **Tripura:** \`0381-2416045\` / \`1070\`

⚠️ *Disclaimer: ResQAI provides information and decision-support features. For immediate emergencies, contact the appropriate official emergency service directly.*`,
    quickActions: [
      { label: 'View All Helplines', action: 'emergency_modal' },
      { label: 'View Active Alerts', action: 'navigate', path: '/alerts' }
    ],
    suggestedFollowUps: [
      'What should I do during a landslide warning?',
      'Who should I contact during a landslide?',
      'Why is this location at risk?'
    ],
    category: 'safety'
  },
  {
    id: 'landslide-safety-emergency',
    keywords: ['safety', 'safe', 'emergency', 'do during', 'evacuate', 'what should i do', 'action', 'protect', 'precaution', 'travel', 'road', 'what should i do during a landslide'],
    title: 'Landslide Emergency Safety & Preparedness Guidelines',
    response: `**Immediate Safety Actions During a Landslide Warning:**

🚨 **Immediate Personal Safety:**
1. **Follow Official Directives:** Adhere strictly to alerts issued by NDMA, SDMA, and local district authorities.
2. **Evacuate Threatened Slopes:** If advised to evacuate or if you observe new ground cracks, bulging slopes, or tilting trees, move uphill or laterally away from the slide path immediately.
3. **Avoid Debris Flow Channels:** Never attempt to walk, drive, or cross active mudslides or swollen mountain streams.
4. **Emergency Services:** If anyone is trapped or injured, immediately dial **112** (Unified Emergency) or **1070** (Disaster Helpline).

🚗 **Mountain Travel & Highways:**
- Avoid non-essential travel on arterial corridors (NH-10, NH-29, NH-51) during High/Severe risk advisories.
- Watch for sudden muddy water discharge from culverts, tumbling gravel, or sinking road pavement.

⚠️ *Disclaimer: ResQAI provides information and decision-support features. For immediate emergencies, contact the appropriate official emergency service.*`,
    quickActions: [
      { label: 'View All Helplines', action: 'emergency_modal' },
      { label: 'View Active Alerts', action: 'navigate', path: '/alerts' },
      { label: 'Check Risk Details', action: 'navigate', path: '/risk-monitoring' }
    ],
    suggestedFollowUps: [
      'Who should I contact during an emergency?',
      'What factors increase landslide risk?',
      'What does High Risk mean?'
    ],
    category: 'safety'
  },
  {
    id: 'resqai-detection-system',
    keywords: ['detect', 'detection', 'how does resqai work', 'system', 'architecture', 'sensor', 'insar', 'satellite'],
    title: 'How ResQAI Detects & Predicts Landslides',
    response: `**ResQAI combines multi-source environmental intelligence into an early warning pipeline:**

1. **Ground Sensor Telemetry:** Edge IoT inclinometers, piezometers, and GNSS displacement sensors transmit real-time telemetry.
2. **Earth Observation & Satellite InSAR:** Sentinel-1 radar interferometry tracks millimeter-level surface deformation across regional corridors.
3. **Meteorological Models:** High-resolution precipitation forecasts and IMD radar feeds detect impending rainfall thresholds.
4. **AI Computer Vision (YOLO11):** Analyzes slope imagery from drones or field cameras to detect tension cracks, scarps, and rock movement.
5. **Dynamic Risk Scoring Engine:** Synthesizes terrain, soil, weather, and displacement data into actionable 0–100% risk indices with multi-channel dispatch alerts.`,
    quickActions: [
      { label: 'View Live Map Grid', action: 'navigate', path: '/live-map' },
      { label: 'Try Image Analysis', action: 'navigate', path: '/analysis' }
    ],
    suggestedFollowUps: [
      'What is YOLO11 used for in ResQAI?',
      'What factors increase landslide risk?'
    ],
    category: 'detection'
  },
  {
    id: 'ner-geology',
    keywords: ['ner', 'northeast', 'northeast india', 'sikkim', 'assam', 'meghalaya', 'arunachal', 'mizoram', 'manipur', 'nagaland', 'tripura'],
    title: 'Northeast Region (NER) Landslide Vulnerability',
    response: `**The North Eastern Region of India is among the world's most landslide-vulnerable landscapes.**

**Vulnerability Drivers:**
- **Active Himalayan Tectonics:** Young, fragile, and seismically active mountain formations (Zone V).
- **Extreme Monsoon Deluges:** Areas like Cherrapunji, Mawsynram, and South Sikkim receive over 3,000–10,000 mm of annual rainfall.
- **Steep Unstable Slopes:** High relief topography with heavy weathering and fragile overburden along critical transit corridors.
- **ResQAI Focus:** Covering all 8 NER states (Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura) with focused spatial monitoring.`,
    quickActions: [
      { label: 'Explore NER Live Map', action: 'navigate', path: '/live-map' },
      { label: 'View Regional Alerts', action: 'navigate', path: '/alerts' }
    ],
    suggestedFollowUps: [
      'Why is this location at risk?',
      'How does rainfall affect landslide risk?'
    ],
    category: 'ner'
  },
  {
    id: 'alerts-management',
    keywords: ['alert', 'alerts', 'acknowledge', 'warning management', 'notification', 'sms', 'dispatch'],
    title: 'ResQAI Alert Lifecycle & Management',
    response: `**The Alert Management system (\`/alerts\`) enables disaster authorities to:**

1. **Detect:** Real-time sensor spikes trigger automated Level 1 Watch, Level 2 Warning, or Level 3 Evacuation notices.
2. **Review:** Geotechnical engineers evaluate contributing factors, rainfall metrics, and radar data.
3. **Acknowledge:** Incident commanders log acknowledgment with operator ID and verification notes.
4. **Dispatch:** Multi-channel broadcast to district administrations, SDMA nodes, police checkpoints, and public siren networks.
5. **Resolve:** Track mitigation, road clearance, and slope stabilization until safe closure.`,
    quickActions: [
      { label: 'Go to Alert Management', action: 'navigate', path: '/alerts' },
      { label: 'Check Risk Factors', action: 'navigate', path: '/risk-monitoring' }
    ],
    suggestedFollowUps: [
      'What should I do during a landslide warning?',
      'What does High Risk mean?'
    ],
    category: 'alerts'
  }
];

export const SUGGESTED_QUESTIONS = [
  'Who should I contact during an emergency?',
  'What should I do during a landslide warning?',
  'Why is this location at risk?',
  'What factors increase landslide risk?',
  'How does ResQAI detect landslides?',
  'What does High Risk mean?',
  'What is YOLO11 used for in ResQAI?'
];

export const OUT_OF_SCOPE_FALLBACK = `I’m **ResQAI Disaster Assistant**. I’m designed specifically to help with landslide risk analysis, early warning systems, geotechnical factors, disaster preparedness, and ResQAI features across Northeast India.

You can ask me about:
- **Rainfall & pore-water triggers**
- **Slope stability & soil factors**
- **Safety precautions during warnings**
- **How ResQAI & YOLO11 detect landslides**
- **Current monitoring context for Northeast India**`;
