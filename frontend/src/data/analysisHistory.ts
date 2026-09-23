export interface AnalysisHistoryItem {
  id: string;
  imageName: string;
  thumbnailUrl: string;
  detection: string;
  confidenceLabel: string;
  riskIndicator: 'Low' | 'Moderate' | 'High' | 'Critical';
  date: string;
  status: 'Prototype Log' | 'Verified';
  model: string;
}

export const PROTOTYPE_ANALYSIS_HISTORY: AnalysisHistoryItem[] = [
  {
    id: 'ANL-2026-042',
    imageName: 'nh10_gangtok_flank.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    detection: 'Landslide Scarp Identified',
    confidenceLabel: '84.2%',
    riskIndicator: 'High',
    date: 'Today, 10:45 IST',
    status: 'Prototype Log',
    model: 'YOLO11'
  },
  {
    id: 'ANL-2026-039',
    imageName: 'aizawl_eastern_slope.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    detection: 'Debris Flow Runout Zone',
    confidenceLabel: '91.8%',
    riskIndicator: 'Critical',
    date: 'Yesterday, 16:20 IST',
    status: 'Prototype Log',
    model: 'YOLO11'
  },
  {
    id: 'ANL-2026-031',
    imageName: 'shillong_plateau_ridge.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=400&q=80',
    detection: 'Stable Vegetated Terrain',
    confidenceLabel: '96.4%',
    riskIndicator: 'Low',
    date: '2 days ago, 12:15 IST',
    status: 'Prototype Log',
    model: 'YOLO11'
  }
];
