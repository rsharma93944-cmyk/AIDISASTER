import { useState } from 'react';
import { 
  MapPin, CloudRain, Mountain, Layers, Activity, Radio, 
  History, ShieldAlert, ArrowRight, TrendingUp, AlertTriangle, 
  CheckCircle2, Compass, Bell, ChevronDown, Check, Info, RefreshCw,
  Route
} from 'lucide-react';
import { useRisk } from '../context/RiskContext';
import { ComputedRiskFactor } from '../services/riskCalculationService';

interface RiskMonitoringProps {
  initialLocationId?: string;
}

export default function RiskMonitoring({ initialLocationId }: RiskMonitoringProps) {
  const { 
    selectedLocationId, 
    setSelectedLocationId, 
    selectedRiskData: data, 
    riskDataMap,
    getRiskColor, 
    getIndicatorBadge 
  } = useRisk();

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // If initialLocationId is provided and different, we can sync it
  if (initialLocationId && initialLocationId !== selectedLocationId && riskDataMap[initialLocationId]) {
    setSelectedLocationId(initialLocationId);
  }

  const riskColor = getRiskColor(data.riskLevel);

  // Helper to get category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Rainfall':
        return <CloudRain className="w-4 h-4 text-[#244A36]" />;
      case 'Slope':
        return <Mountain className="w-4 h-4 text-[#244A36]" />;
      case 'Soil / Terrain':
        return <Layers className="w-4 h-4 text-[#244A36]" />;
      case 'Ground Movement':
        return <Activity className="w-4 h-4 text-[#C87941]" />;
      case 'Satellite Indicator':
        return <Radio className="w-4 h-4 text-[#244A36]" />;
      case 'Historical Landslide Activity':
        return <History className="w-4 h-4 text-[#7A2E2E]" />;
      default:
        return <Info className="w-4 h-4 text-[#244A36]" />;
    }
  };

  const handleSelectLocation = (id: string) => {
    setSelectedLocationId(id);
    setDropdownOpen(false);
  };

  const navigateToMap = () => {
    window.history.pushState({}, '', `/live-map?location=${selectedLocationId}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const navigateToEvacuation = () => {
    window.history.pushState({}, '', `/live-map?evacuateFrom=${selectedLocationId}&evacuation=true`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const navigateToAlerts = () => {
    window.history.pushState({}, '', `/alerts?location=${data.location}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.riskScore / 100) * circumference * 0.75; // 270 degree gauge

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto flex flex-col font-sans selection:bg-[#244A36]/20">
      
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER & 2. LOCATION SELECTOR                                    */}
      {/* ========================================================================= */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#244A36]/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass border border-[#C87941]/25 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#C87941] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#C87941]">
              Prototype Risk Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2826] tracking-tight">
            Risk Monitoring
          </h1>
          <p className="text-sm sm:text-base text-[#5E7E67] font-medium mt-1 max-w-2xl">
            Analyze the 6 core environmental and geotechnical factors contributing to calculated landslide risk.
          </p>
        </div>

        {/* 2. LOCATION SELECTOR DROPDOWN */}
        <div className="relative w-full sm:w-80 z-30">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] mb-1.5 flex items-center justify-between">
            <span>Select Monitoring Location</span>
            <span className="text-[10px] text-[#C87941] font-semibold">Prototype Data</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full glass-card hover:border-[#244A36]/40 rounded-2xl px-4 py-3 text-left flex items-center justify-between shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#244A36]/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl liquid-glass flex items-center justify-center text-[#244A36]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#1C2826] block">{data.location}</span>
                  <span className="text-xs text-[#5E7E67]">{data.state}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase"
                  style={{ backgroundColor: `${riskColor}15`, color: riskColor }}
                >
                  {data.riskLevel}
                </span>
                <ChevronDown className="w-4 h-4 text-[#5E7E67]" />
              </div>
            </button>

            {dropdownOpen && (
              <div 
                className="absolute top-full mt-2 left-0 right-0 liquid-glass-modal rounded-2xl p-1.5 max-h-72 overflow-y-auto z-40 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-[#244A36]/10 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider">8 Prototype Locations</span>
                  <span className="text-[9px] font-semibold text-[#C87941] bg-[#C87941]/10 px-2 py-0.5 rounded-full">NER Sector</span>
                </div>
                {Object.values(riskDataMap).map((loc) => {
                  const isCur = loc.id === data.id;
                  const itemColor = getRiskColor(loc.riskLevel);
                  return (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                        isCur ? 'bg-[#244A36]/10 font-bold' : 'hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className={`w-4 h-4 ${isCur ? 'text-[#244A36]' : 'text-[#5E7E67]'}`} />
                        <div>
                          <span className="text-sm text-[#1C2826] block">{loc.location}</span>
                          <span className="text-xs text-[#5E7E67]">{loc.state}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                          style={{ backgroundColor: `${itemColor}15`, color: itemColor }}
                        >
                          {loc.riskLevel}
                        </span>
                        {isCur && <Check className="w-4 h-4 text-[#244A36]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. OVERALL RISK CARD + 6. LOCATION PROFILE + 8. RECOMMENDED ACTION       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* 3. OVERALL RISK CARD */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-transparent to-[#FAF7F2]/60 rounded-bl-full pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#244A36]" /> Calculated Risk Score
              </span>
              <span className="text-[10px] font-bold text-[#C87941] bg-[#C87941]/10 px-2.5 py-0.5 rounded-full uppercase">
                {data.lastUpdated}
              </span>
            </div>

            {/* Circular Gauge / Risk Meter */}
            <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
              <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-135" viewBox="0 0 160 160">
                  {/* Gauge Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="#EFEBE4"
                    strokeWidth="12"
                    strokeDasharray={`${circumference * 0.75} ${circumference}`}
                    strokeLinecap="round"
                  />
                  {/* Gauge Active Progress */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={riskColor}
                    strokeWidth="12"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Gauge Inner Score & Level */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-[#1C2826] tracking-tight">{data.riskScore}</span>
                  <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider">Score / 100</span>
                </div>
              </div>

              <div className="text-center sm:text-left space-y-2">
                <div 
                  className="inline-block text-2xl font-extrabold px-3 py-1 rounded-xl uppercase tracking-wide border"
                  style={{ 
                    backgroundColor: `${riskColor}12`, 
                    color: riskColor,
                    borderColor: `${riskColor}30` 
                  }}
                >
                  {data.riskLevel}
                </div>
                <h3 className="text-sm font-bold text-[#1C2826]">{data.riskStatus}</h3>
                <p className="text-xs text-[#5E7E67] flex items-center gap-1.5 justify-center sm:justify-start">
                  <span className="w-2 h-2 rounded-full bg-[#526E48] animate-pulse" />
                  <span>{data.monitoringStatus}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#244A36]/10 flex items-center justify-between text-xs text-[#5E7E67]">
            <span>6-Factor Weighted Index</span>
            <span className="font-semibold text-[#1C2826]">{data.location} Sector</span>
          </div>
        </div>

        {/* 6. LOCATION PROFILE */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#244A36]" /> Location Profile
              </span>
              <span className="text-xs font-bold text-[#244A36]">{data.profile.state}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#244A36]/5">
                <span className="text-[#5E7E67] font-medium">Monitoring Location</span>
                <span className="font-bold text-[#1C2826]">{data.profile.location}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#244A36]/5">
                <span className="text-[#5E7E67] font-medium">Terrain Type</span>
                <span className="font-bold text-[#1C2826] text-right">{data.profile.terrainType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#244A36]/5">
                <span className="text-[#5E7E67] font-medium">Elevation</span>
                <span className="font-bold text-[#1C2826]">{data.profile.elevation}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#244A36]/5">
                <span className="text-[#5E7E67] font-medium">Slope Condition</span>
                <span className="font-bold text-[#1C2826]">{data.profile.slopeCondition}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#244A36]/5">
                <span className="text-[#5E7E67] font-medium">Historical Activity</span>
                <span className="font-bold text-[#1C2826] text-right">{data.profile.historicalActivity}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#244A36]/10 flex items-center justify-between text-xs">
            <span className="text-[#5E7E67]">Geographic Coordinates</span>
            <span className="font-mono text-[11px] text-[#1C2826] font-semibold">
              {data.profile.coordinates.lat.toFixed(4)}°N, {data.profile.coordinates.lng.toFixed(4)}°E
            </span>
          </div>
        </div>

        {/* 8. RECOMMENDED ACTION */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#244A36]" /> Recommended Action
              </span>
              <span className="text-[10px] font-bold text-[#C87941] liquid-glass border border-[#C87941]/20 px-2.5 py-0.5 rounded-full uppercase">
                Decision Support
              </span>
            </div>

            <div className="space-y-4">
              <div 
                className="p-4 rounded-2xl border backdrop-blur-md"
                style={{ 
                  backgroundColor: `${riskColor}10`, 
                  borderColor: `${riskColor}25` 
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: riskColor }}>
                  Priority Level: {data.recommendedAction.priority}
                </span>
                <h4 className="text-base font-bold text-[#1C2826] leading-snug">
                  {data.recommendedAction.summary}
                </h4>
              </div>

              <p className="text-xs text-[#2B3A33] leading-relaxed font-medium">
                {data.recommendedAction.details}
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-4 border-t border-[#244A36]/10 flex flex-col sm:flex-row items-stretch gap-2">
            <button
              type="button"
              onClick={navigateToEvacuation}
              className="flex-1 py-2.5 px-3 bg-[#244A36] text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#1B3828] transition-all shadow-md shadow-[#244A36]/20 hover:scale-[1.02]"
            >
              <Route className="w-3.5 h-3.5 text-[#FAF7F2]" />
              <span>Plan Evacuation Route</span>
            </button>
            <div className="flex gap-2 flex-1">
              <button
                type="button"
                onClick={navigateToMap}
                className="flex-1 py-2.5 px-2.5 glass-button text-[#1C2826] rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all hover:scale-[1.02]"
              >
                <span>Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={navigateToAlerts}
                className="flex-1 py-2.5 px-2.5 glass-button text-[#1C2826] rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all hover:scale-[1.02]"
              >
                <Bell className="w-3.5 h-3.5 text-[#C87941]" />
                <span>Alerts</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. RISK FACTORS (6 SEPARATE CARDS)                                       */}
      {/* ========================================================================= */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1C2826] tracking-tight">
              Calculated Risk Factors
            </h2>
            <p className="text-xs sm:text-sm text-[#5E7E67]">
              Current multi-factor indicators evaluated for {data.location} using the 6 standardized risk dimensions.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#5E7E67] bg-white px-3 py-1 rounded-full border border-[#244A36]/10 hidden sm:inline-block">
            6 Unified Indicators
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(data.factors).map(([key, factor]: [string, ComputedRiskFactor]) => {
            const badge = getIndicatorBadge(factor.indicator);
            return (
              <div 
                key={key}
                className="glass-card rounded-3xl p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl liquid-glass flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getCategoryIcon(factor.category)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider block">
                          {factor.category}
                        </span>
                        <h4 className="text-sm font-bold text-[#1C2826] leading-tight">
                          {factor.name}
                        </h4>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase backdrop-blur-md ${badge.bg} ${badge.text} ${badge.border}`}>
                      {factor.indicator}
                    </span>
                  </div>

                  <p className="text-xs text-[#3A4D43] leading-relaxed mb-4 font-medium">
                    {factor.explanation}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#244A36]/10 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E7E67]">
                    Risk Contribution
                  </span>
                  <span className="text-[11px] font-bold text-[#244A36]">
                    {factor.contributionTag} ({factor.contribution}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RISK CONTRIBUTION + 7. RISK EXPLANATION + 9. RISK TREND               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 5. RISK CONTRIBUTION BAR VISUALIZATION */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1C2826] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#244A36]" /> Factor Influence Weights
              </h3>
              <span className="text-[10px] font-bold text-[#C87941] liquid-glass border border-[#C87941]/25 px-2 py-0.5 rounded-full uppercase">
                Contribution
              </span>
            </div>

            <div className="space-y-3.5 my-2">
              {data.riskContributions.map((item, idx) => {
                const badge = getIndicatorBadge(item.indicator);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1C2826]">{item.factor}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${badge.text}`}>
                        {item.weightPercentage}%
                      </span>
                    </div>
                    {/* Visual Bar Track */}
                    <div className="w-full bg-[#FAF7F2] border border-[#244A36]/10 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                        style={{ 
                          width: `${item.weightPercentage}%`,
                          backgroundColor: item.weightPercentage > 75 ? '#A05C2C' : item.weightPercentage > 50 ? '#C87941' : '#244A36'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-[#5E7E67] pt-4 border-t border-[#244A36]/10 italic">
            Computed deterministically based on Rainfall (25%), Slope (20%), Soil (15%), Movement (15%), Satellite (15%), History (10%).
          </p>
        </div>

        {/* 7. WHY IS THIS LOCATION AT RISK? */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1C2826] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C87941]" /> Why is this location at risk?
              </h3>
              <span className="text-[10px] font-bold text-[#5E7E67] liquid-glass px-2 py-0.5 rounded-full uppercase">
                Structured Synthesis
              </span>
            </div>

            <div className="p-4 glass-widget rounded-2xl mb-4">
              <p className="text-xs sm:text-sm text-[#1C2826] font-medium leading-relaxed">
                "{data.explanation}"
              </p>
            </div>

            <div className="space-y-2 text-xs text-[#3A4D43] font-medium">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#244A36] mt-1.5 flex-shrink-0" />
                <span><strong>Terrain Geometry:</strong> {data.profile.slopeCondition} elevates gravitational slide probability.</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C87941] mt-1.5 flex-shrink-0" />
                <span><strong>Rainfall Impact:</strong> {data.factors.rainfall.explanation}</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7A2E2E] mt-1.5 flex-shrink-0" />
                <span><strong>Geotechnical Telemetry:</strong> {data.factors.groundMovement.explanation}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#244A36]/10 flex items-center justify-between text-xs text-[#5E7E67]">
            <span>Deterministic Risk Model</span>
            <span className="font-semibold text-[#244A36]">Standardized Calculation</span>
          </div>
        </div>

        {/* 9. RISK TREND CHART */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1C2826] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#244A36]" /> Risk Trend
              </h3>
              <span className="text-[10px] font-bold text-[#C87941] liquid-glass border border-[#C87941]/25 px-2 py-0.5 rounded-full uppercase">
                Timeline
              </span>
            </div>

            {/* SVG Trend Line Chart */}
            <div className="py-2">
              <div className="relative h-40 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 130">
                  <defs>
                    <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={riskColor} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={riskColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#EFEBE4" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="65" x2="300" y2="65" stroke="#EFEBE4" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="110" x2="300" y2="110" stroke="#EFEBE4" strokeWidth="1" />

                  {/* Points Calculation */}
                  {(() => {
                    const points = data.trend.map((t, idx) => {
                      const x = idx * (300 / (data.trend.length - 1));
                      const y = 110 - (t.riskScore / 100) * 90;
                      return { x, y, score: t.riskScore, time: t.timePoint, label: t.label };
                    });

                    const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                    const areaD = `${pathD} L 300 110 L 0 110 Z`;

                    return (
                      <>
                        {/* Area fill */}
                        <path d={areaD} fill="url(#trendGradient)" />

                        {/* Line Stroke */}
                        <path d={pathD} fill="none" stroke={riskColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Data Point Circles and Value Labels */}
                        {points.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="4.5" fill="#FAF7F2" stroke={riskColor} strokeWidth="2.5" />
                            <text 
                              x={p.x} 
                              y={p.y - 8} 
                              fill="#1C2826" 
                              fontSize="9.5" 
                              fontWeight="bold" 
                              textAnchor="middle"
                            >
                              {p.score}
                            </text>
                            <text 
                              x={p.x} 
                              y="125" 
                              fill="#5E7E67" 
                              fontSize="8.5" 
                              fontWeight="bold" 
                              textAnchor="middle"
                            >
                              {p.time}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#244A36]/10 flex items-center justify-between text-xs text-[#5E7E67]">
            <span>48-Hour Assessment Window</span>
            <span className="font-bold text-[#1C2826] flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-[#244A36]" /> Current: {data.riskLevel} ({data.riskScore}/100)
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
