import { RawLocationProfile } from '../services/riskCalculationService';

export const RAW_LOCATIONS_DATA: Record<string, RawLocationProfile> = {
  gangtok: {
    id: 'gangtok',
    name: 'Gangtok',
    state: 'Sikkim',
    terrainType: 'High Himalayan Mountainous',
    elevation: '1,650 m ASL',
    slopeCondition: 'Steep Escarpments (38°–44°)',
    historicalActivity: 'Frequent Monsoon Creep (NH-10 Corridor)',
    coordinates: { lat: 27.3314, lng: 88.6138 },
    historicalTrendBase: [42, 51, 66, 74],
    factors: {
      rainfall: {
        name: 'Precipitation Volume',
        category: 'Rainfall',
        rawScore: 82,
        indicator: 'High',
        valueDisplay: '74mm/24h',
        explanation: 'Cumulative precipitation of 74mm in 24 hours has saturated upper soil mantles.',
        contributionTag: 'Major Driver'
      },
      slope: {
        name: 'Slope Inclination',
        category: 'Slope',
        rawScore: 85,
        indicator: 'High',
        valueDisplay: '42° Gradient',
        explanation: 'Steep hill cut gradients exceeding 40° increase shear stress along the slip plane.',
        contributionTag: 'Critical Factor'
      },
      soilTerrain: {
        name: 'Soil Saturation & Lithology',
        category: 'Soil / Terrain',
        rawScore: 68,
        indicator: 'Elevated',
        valueDisplay: 'Mica-Schist Saturated',
        explanation: 'Weathered mica-schist bedrock with high water retention and reduced internal friction.',
        contributionTag: 'Moderate Influence'
      },
      groundMovement: {
        name: 'Sub-surface Displacement',
        category: 'Ground Movement',
        rawScore: 74,
        indicator: 'Elevated',
        valueDisplay: '4.2mm/week creep',
        explanation: 'Borehole tilt sensors register continuous micro-displacement along the overburden.',
        contributionTag: 'Active Warning'
      },
      satellite: {
        name: 'InSAR Displacement Vector',
        category: 'Satellite Indicator',
        rawScore: 79,
        indicator: 'High',
        valueDisplay: 'LOS 4.2mm/wk',
        explanation: 'Synthetic Aperture Radar interferometry detects 4.2 mm/week line-of-sight subsidence.',
        contributionTag: 'Satellite Verified'
      },
      historical: {
        name: 'Hazard Inventory Recurrence',
        category: 'Historical Landslide Activity',
        rawScore: 80,
        indicator: 'High',
        valueDisplay: '14 events / 10yr',
        explanation: 'Historical records show 14 significant slide reactivations in this sector over 10 years.',
        contributionTag: 'Historical Hotspot'
      }
    }
  },

  kohima: {
    id: 'kohima',
    name: 'Kohima',
    state: 'Nagaland',
    terrainType: 'Fold Mountain Terrain & Ridges',
    elevation: '1,444 m ASL',
    slopeCondition: 'Steep Terraced Slopes (32°–39°)',
    historicalActivity: 'Recorded Slide Activity on NH-29',
    coordinates: { lat: 25.6701, lng: 94.1077 },
    historicalTrendBase: [48, 54, 63, 69],
    factors: {
      rainfall: {
        name: 'Precipitation Volume',
        category: 'Rainfall',
        rawScore: 70,
        indicator: 'Elevated',
        valueDisplay: '56mm/36h',
        explanation: 'Moderate to heavy intermittent rain over 36 hours causing progressive slope softening.',
        contributionTag: 'Elevated'
      },
      slope: {
        name: 'Slope Inclination',
        category: 'Slope',
        rawScore: 78,
        indicator: 'High',
        valueDisplay: '35° Terraced',
        explanation: 'Steep hill slopes with high anthropogenic terracing and developmental cutting.',
        contributionTag: 'High Impact'
      },
      soilTerrain: {
        name: 'Soil Saturation & Lithology',
        category: 'Soil / Terrain',
        rawScore: 76,
        indicator: 'High',
        valueDisplay: 'Disshang Shale Saturated',
        explanation: 'Disshang shale formation prone to severe slaking and loss of cohesion upon wetting.',
        contributionTag: 'High Impact'
      },
      groundMovement: {
        name: 'Sub-surface Displacement',
        category: 'Ground Movement',
        rawScore: 69,
        indicator: 'Elevated',
        valueDisplay: 'Surface fissures detected',
        explanation: 'Surface tension fissures observed along vulnerable road embankment shoulders.',
        contributionTag: 'Monitoring Req.'
      },
      satellite: {
        name: 'InSAR Displacement Vector',
        category: 'Satellite Indicator',
        rawScore: 66,
        indicator: 'Elevated',
        valueDisplay: '2.8mm/wk creep',
        explanation: 'Ascending orbital SAR passes reveal 2.8 mm/week creeping along ridge edges.',
        contributionTag: 'Satellite Tracking'
      },
      historical: {
        name: 'Hazard Inventory Recurrence',
        category: 'Historical Landslide Activity',
        rawScore: 72,
        indicator: 'Elevated',
        valueDisplay: 'Recurring Dzüdza sector',
        explanation: 'Historical slide inventory registers recurring monsoon slips near Dzüdza corridor.',
        contributionTag: 'Recorded'
      }
    }
  },

  shillong: {
    id: 'shillong',
    name: 'Shillong',
    state: 'Meghalaya',
    terrainType: 'Rolling Plateau & Gentle Hills',
    elevation: '1,525 m ASL',
    slopeCondition: 'Gentle to Moderate (12°–22°)',
    historicalActivity: 'Low Incidence in Urban Core',
    coordinates: { lat: 25.5788, lng: 91.8933 },
    historicalTrendBase: [20, 22, 25, 23],
    factors: {
      rainfall: {
        name: 'Precipitation Volume',
        category: 'Rainfall',
        rawScore: 22,
        indicator: 'Normal',
        valueDisplay: '8mm/24h',
        explanation: 'Low baseline rainfall (8mm in 24h) with effective natural plateau watershed drainage.',
        contributionTag: 'Nominal'
      },
      slope: {
        name: 'Slope Inclination',
        category: 'Slope',
        rawScore: 25,
        indicator: 'Normal',
        valueDisplay: '18° Gentle Undulation',
        explanation: 'Gentle undulations with stable natural vegetative cover retaining soil root matrix.',
        contributionTag: 'Stable'
      },
      soilTerrain: {
        name: 'Soil Saturation & Lithology',
        category: 'Soil / Terrain',
        rawScore: 18,
        indicator: 'Normal',
        valueDisplay: 'Quartzite Bedrock (Stable)',
        explanation: 'Coarse quartzite bedrock providing robust shear resistance and high bearing capacity.',
        contributionTag: 'High Stability'
      },
      groundMovement: {
        name: 'Sub-surface Displacement',
        category: 'Ground Movement',
        rawScore: 15,
        indicator: 'Normal',
        valueDisplay: '0.1mm/mo (Baseline)',
        explanation: 'Acoustic emissions and tiltmeter telemetry remain well within baseline safety thresholds.',
        contributionTag: 'Zero Creep'
      },
      satellite: {
        name: 'InSAR Displacement Vector',
        category: 'Satellite Indicator',
        rawScore: 20,
        indicator: 'Normal',
        valueDisplay: 'Static (<0.5mm/yr)',
        explanation: 'No anomalous line-of-sight terrain displacement observed in Sentinel-1 interferograms.',
        contributionTag: 'Stable'
      },
      historical: {
        name: 'Hazard Inventory Recurrence',
        category: 'Historical Landslide Activity',
        rawScore: 26,
        indicator: 'Normal',
        valueDisplay: 'Low urban incidence',
        explanation: 'Minimal historical landslide events recorded in the immediate central plateau zone.',
        contributionTag: 'Low Risk'
      }
    }
  },

  aizawl: {
    id: 'aizawl',
    name: 'Aizawl',
    state: 'Mizoram',
    terrainType: 'High Relief N-S Anticlinal Ridge',
    elevation: '1,132 m ASL',
    slopeCondition: 'Extremely Steep Scarp Slopes (45°–56°)',
    historicalActivity: 'Frequent Major Slides (Laipuitlang, Hunthar)',
    coordinates: { lat: 23.7271, lng: 92.7176 },
    historicalTrendBase: [58, 71, 84, 89],
    factors: {
      rainfall: {
        name: 'Precipitation Volume',
        category: 'Rainfall',
        rawScore: 95,
        indicator: 'Critical',
        valueDisplay: '112mm/24h',
        explanation: 'Extremely heavy rainfall (112mm in 24h) exceeding critical empirical antecedent thresholds.',
        contributionTag: 'Extreme Hazard'
      },
      slope: {
        name: 'Slope Inclination',
        category: 'Slope',
        rawScore: 94,
        indicator: 'Critical',
        valueDisplay: '52° Critical Scarp',
        explanation: 'Extreme slope angles (>48°) combined with steep western flank structural dip orientation.',
        contributionTag: 'Critical Gradient'
      },
      soilTerrain: {
        name: 'Soil Saturation & Lithology',
        category: 'Soil / Terrain',
        rawScore: 90,
        indicator: 'Critical',
        valueDisplay: 'Pore Water Threshold Exceeded',
        explanation: 'Pore water pressure exceeds critical safety threshold with saturated siltstone interbeds.',
        contributionTag: 'Liquefaction Risk'
      },
      groundMovement: {
        name: 'Sub-surface Displacement',
        category: 'Ground Movement',
        rawScore: 96,
        indicator: 'Critical',
        valueDisplay: '12.4mm / 6h active crack',
        explanation: 'Extensometers report 12.4 mm displacement in 6 hours; tension cracks widening rapidly.',
        contributionTag: 'Immediate Threat'
      },
      satellite: {
        name: 'InSAR Displacement Vector',
        category: 'Satellite Indicator',
        rawScore: 88,
        indicator: 'Critical',
        valueDisplay: '8.5mm/wk subsidence',
        explanation: 'Severe velocity gradient (>8.5 mm/week) detected along eastern cliff-line settlement belt.',
        contributionTag: 'High Velocity'
      },
      historical: {
        name: 'Hazard Inventory Recurrence',
        category: 'Historical Landslide Activity',
        rawScore: 89,
        indicator: 'High',
        valueDisplay: 'Catastrophic historical slides',
        explanation: 'Sector has experienced catastrophic structural slope failures in past monsoon cycles.',
        contributionTag: 'Vulnerable Sector'
      }
    }
  },

  imphal: {
    id: 'imphal',
    name: 'Imphal',
    state: 'Manipur',
    terrainType: 'Intermontane Lacustrine Basin',
    elevation: '786 m ASL',
    slopeCondition: 'Flat Valley / Gentle Basin Margin (4°–12°)',
    historicalActivity: 'Negligible in Basin Center',
    coordinates: { lat: 24.8170, lng: 93.9368 },
    historicalTrendBase: [25, 27, 26, 28],
    factors: {
      rainfall: {
        name: 'Precipitation Volume',
        category: 'Rainfall',
        rawScore: 30,
        indicator: 'Normal',
        valueDisplay: '14mm/24h',
        explanation: 'Low intermittent showers (14mm/day), adequate river basin drainage capacity.',
        contributionTag: 'Nominal'
      },
      slope: {
        name: 'Slope Inclination',
        category: 'Slope',
        rawScore: 20,
        indicator: 'Normal',
        valueDisplay: '8° Valley Margin',
        explanation: 'Flat to gently inclined basin floor with low gravitational driving shear forces.',
        contributionTag: 'Safe Margin'
      },
      soilTerrain: {
        name: 'Soil Saturation & Lithology',
        category: 'Soil / Terrain',
        rawScore: 32,
        indicator: 'Normal',
        valueDisplay: 'Alluvial Clays (Stable)',
        explanation: 'Alluvial clay deposit with moderate consolidation; river edge bank erosion monitored.',
        contributionTag: 'Moderate Bearing'
      },
      groundMovement: {
        name: 'Sub-surface Displacement',
        category: 'Ground Movement',
        rawScore: 22,
        indicator: 'Normal',
        valueDisplay: 'Zero tilt breach',
        explanation: 'Zero anomalous ground movement recorded across municipal accelerometer nodes.',
        contributionTag: 'Quiescent'
      },
      satellite: {
        name: 'InSAR Displacement Vector',
        category: 'Satellite Indicator',
        rawScore: 25,
        indicator: 'Normal',
        valueDisplay: '<1.0mm/yr LOS',
        explanation: 'InSAR deformation timeseries shows planar stability without slope subsidence.',
        contributionTag: 'Planar Stability'
      },
      historical: {
        name: 'Hazard Inventory Recurrence',
        category: 'Historical Landslide Activity',
        rawScore: 24,
        indicator: 'Normal',
        valueDisplay: 'No historical slides',
        explanation: 'No major historical landslide occurrences inside the urban valley boundary.',
        contributionTag: 'Zero Incident'
      }
    }
  },

  itanagar: {
    id: 'itanagar',
    name: 'Itanagar',
    state: 'Arunachal Pradesh',
    terrainType: 'Siwalik Foothills & Dissected Terraces',
    elevation: '320 m ASL',
    slopeCondition: 'Moderate to Steep Hill Cuttings (28°–36°)',
    historicalActivity: 'Monsoon Roadside Slips (NH-415)',
    coordinates: { lat: 27.0844, lng: 93.6053 },
    historicalTrendBase: [36, 40, 44, 46],
    factors: {
      rainfall: {
        name: 'Precipitation Volume',
        category: 'Rainfall',
        rawScore: 54,
        indicator: 'Elevated',
        valueDisplay: '42mm/24h',
        explanation: 'Steady monsoon drizzle (42mm/day); foothill soils approaching saturation.',
        contributionTag: 'Elevated'
      },
      slope: {
        name: 'Slope Inclination',
        category: 'Slope',
        rawScore: 50,
        indicator: 'Elevated',
        valueDisplay: '31° Foothill Cut',
        explanation: 'Moderate steepness hill flanks with ongoing road widening cuttings on NH-415.',
        contributionTag: 'Moderate Influence'
      },
      soilTerrain: {
        name: 'Soil Saturation & Lithology',
        category: 'Soil / Terrain',
        rawScore: 48,
        indicator: 'Elevated',
        valueDisplay: 'Semi-Consolidated Sandstone',
        explanation: 'Semi-consolidated Siwalik sandstone and pebble beds sensitive to toe-erosion.',
        contributionTag: 'Toe Erosion'
      },
      groundMovement: {
        name: 'Sub-surface Displacement',
        category: 'Ground Movement',
        rawScore: 45,
        indicator: 'Elevated',
        valueDisplay: 'Minor surface creep',
        explanation: 'Minor creeping detected on unbuttressed roadside slopes near Papu Nallah.',
        contributionTag: 'Advisory Active'
      },
      satellite: {
        name: 'InSAR Displacement Vector',
        category: 'Satellite Indicator',
        rawScore: 46,
        indicator: 'Elevated',
        valueDisplay: '1.9mm/wk deformation',
        explanation: 'Sentinel-1 ascending track shows localized downslope migration along highway cuts.',
        contributionTag: 'Tracked'
      },
      historical: {
        name: 'Hazard Inventory Recurrence',
        category: 'Historical Landslide Activity',
        rawScore: 49,
        indicator: 'Elevated',
        valueDisplay: 'Seasonal roadside debris',
        explanation: 'Seasonal debris slides documented along the Banderdewa–Itanagar corridor.',
        contributionTag: 'Monsoon Slips'
      }
    }
  },

  agartala: {
    id: 'agartala',
    name: 'Agartala',
    state: 'Tripura',
    terrainType: 'Low Undulating Alluvial Plain & Till',
    elevation: '13 m ASL',
    slopeCondition: 'Flat to Low Gradient Tilla (2°–8°)',
    historicalActivity: 'No Active Slide History',
    coordinates: { lat: 23.8315, lng: 91.2868 },
    historicalTrendBase: [15, 16, 17, 18],
    factors: {
      rainfall: {
        name: 'Precipitation Volume',
        category: 'Rainfall',
        rawScore: 18,
        indicator: 'Normal',
        valueDisplay: '5mm/24h',
        explanation: 'Minimal rainfall (5mm/day); urban drainage discharging normally into Haora river.',
        contributionTag: 'Negligible'
      },
      slope: {
        name: 'Slope Inclination',
        category: 'Slope',
        rawScore: 12,
        indicator: 'Normal',
        valueDisplay: '4° Low Tilla',
        explanation: 'Very low gradient topography incapable of generating catastrophic mass movements.',
        contributionTag: 'Minimal Risk'
      },
      soilTerrain: {
        name: 'Soil Saturation & Lithology',
        category: 'Soil / Terrain',
        rawScore: 22,
        indicator: 'Normal',
        valueDisplay: 'Alluvial Loam',
        explanation: 'Dense alluvial loam with low plasticity index and stable cohesion.',
        contributionTag: 'Stable Soil'
      },
      groundMovement: {
        name: 'Sub-surface Displacement',
        category: 'Ground Movement',
        rawScore: 14,
        indicator: 'Normal',
        valueDisplay: 'Zero displacement',
        explanation: 'Zero displacement or strain accumulation registered across regional sensors.',
        contributionTag: 'Nominal'
      },
      satellite: {
        name: 'InSAR Displacement Vector',
        category: 'Satellite Indicator',
        rawScore: 15,
        indicator: 'Normal',
        valueDisplay: 'Stable Baseline',
        explanation: 'Uniform SAR phase coherence confirming absolute geodetic stability.',
        contributionTag: 'Verified Stable'
      },
      historical: {
        name: 'Hazard Inventory Recurrence',
        category: 'Historical Landslide Activity',
        rawScore: 10,
        indicator: 'Normal',
        valueDisplay: 'Zero recorded slides',
        explanation: 'No historical record of slope failures in the Agartala plain sector.',
        contributionTag: 'Zero Incident'
      }
    }
  },

  guwahati: {
    id: 'guwahati',
    name: 'Guwahati',
    state: 'Assam',
    terrainType: 'Brahmaputra Valley with Granite Inliers',
    elevation: '55 m ASL',
    slopeCondition: 'Moderate Urban Hill Cuts (26°–36°)',
    historicalActivity: 'Monsoon Urban Hill Slides (Khanapara, Naranarayan)',
    coordinates: { lat: 26.1445, lng: 91.7362 },
    historicalTrendBase: [40, 44, 48, 50],
    factors: {
      rainfall: {
        name: 'Precipitation Volume',
        category: 'Rainfall',
        rawScore: 58,
        indicator: 'Elevated',
        valueDisplay: '48mm/24h',
        explanation: 'Heavy urban precipitation (48mm in 24h) leading to localized runoff accumulation.',
        contributionTag: 'Urban Runoff'
      },
      slope: {
        name: 'Slope Inclination',
        category: 'Slope',
        rawScore: 54,
        indicator: 'Elevated',
        valueDisplay: '32° Modified Cut',
        explanation: 'Anthropogenically modified hill slopes with exposed cut faces and unreinforced soil.',
        contributionTag: 'Modified Slopes'
      },
      soilTerrain: {
        name: 'Soil Saturation & Lithology',
        category: 'Soil / Terrain',
        rawScore: 52,
        indicator: 'Elevated',
        valueDisplay: 'Residual Red Sandy Loam',
        explanation: 'Residual soil on weathered Precambrian gneiss prone to rain wash and mudslips.',
        contributionTag: 'Surface Wash'
      },
      groundMovement: {
        name: 'Sub-surface Displacement',
        category: 'Ground Movement',
        rawScore: 49,
        indicator: 'Elevated',
        valueDisplay: 'Roadside soil creep',
        explanation: 'Localized soil creep reported near unbuttressed roadside embankments.',
        contributionTag: 'Roadside Creep'
      },
      satellite: {
        name: 'InSAR Displacement Vector',
        category: 'Satellite Indicator',
        rawScore: 50,
        indicator: 'Elevated',
        valueDisplay: '2.1mm/wk slope wash',
        explanation: 'InSAR indicates minor surface soil drift across urban hill pockets.',
        contributionTag: 'Tracked Drift'
      },
      historical: {
        name: 'Hazard Inventory Recurrence',
        category: 'Historical Landslide Activity',
        rawScore: 55,
        indicator: 'Elevated',
        valueDisplay: 'Frequent monsoon slips',
        explanation: 'Documented history of seasonal urban hill slips during torrential cloudbursts.',
        contributionTag: 'Recurring Urban'
      }
    }
  }
};
