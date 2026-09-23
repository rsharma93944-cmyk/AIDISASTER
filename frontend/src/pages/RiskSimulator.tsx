import { useState, useCallback, useMemo } from 'react';
import {
  MapPin,
  CloudRain,
  Mountain,
  Activity,
  History,
  Sliders,
  RefreshCw,
  ArrowRight,
  BarChart3,
  ChevronDown,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Radio,
  Layers,
  Route,
} from 'lucide-react';
import { useRisk } from '../context/RiskContext';
import {
  runSimulation,
  extractBaselineFactors,
  RISK_LEVEL_META,
  SimulatorFactorState,
  SimulationResult,
} from '../services/riskSimulatorService';

// ─── Navigation helper (matches App.tsx pattern) ─────────────────────────────
function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Slider labels and icons ──────────────────────────────────────────────────
const ADJUSTABLE_FACTORS: {
  key: keyof Pick<SimulatorFactorState, 'rainfall' | 'groundMovement' | 'slope' | 'historical'>;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  trackColor: string;
}[] = [
  {
    key: 'rainfall',
    label: 'Rainfall Intensity',
    sublabel: 'Cumulative precipitation volume / 24 h',
    icon: <CloudRain className="w-4 h-4" />,
    trackColor: '#244A36',
  },
  {
    key: 'groundMovement',
    label: 'Ground Movement',
    sublabel: 'Sub-surface displacement & creep rate',
    icon: <Activity className="w-4 h-4" />,
    trackColor: '#C87941',
  },
  {
    key: 'slope',
    label: 'Slope Sensitivity',
    sublabel: 'Effective shear-stress gradient',
    icon: <Mountain className="w-4 h-4" />,
    trackColor: '#244A36',
  },
  {
    key: 'historical',
    label: 'Historical Activity',
    sublabel: 'Decadal landslide recurrence index',
    icon: <History className="w-4 h-4" />,
    trackColor: '#A05C2C',
  },
];

// ─── Score indicator label ────────────────────────────────────────────────────
function scoreLabel(v: number): string {
  if (v >= 80) return 'Critical';
  if (v >= 60) return 'High';
  if (v >= 35) return 'Elevated';
  return 'Normal';
}

// ─── Single factor slider ─────────────────────────────────────────────────────
interface FactorSliderProps {
  factorKey: keyof Pick<SimulatorFactorState, 'rainfall' | 'groundMovement' | 'slope' | 'historical'>;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  trackColor: string;
  value: number;
  baseline: number;
  onChange: (key: keyof SimulatorFactorState, v: number) => void;
}

function FactorSlider({ factorKey, label, sublabel, icon, trackColor, value, baseline, onChange }: FactorSliderProps) {
  const delta = value - baseline;
  const pct = `${value}%`;

  return (
    <div className="p-4 rounded-2xl bg-white/60 border border-[#244A36]/10 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#244A36]/8 text-[#244A36]">
            {icon}
          </span>
          <div>
            <div className="text-[13px] font-semibold text-[#1C2826] leading-snug">{label}</div>
            <div className="text-[11px] text-[#5E7E67] leading-tight">{sublabel}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-base font-bold text-[#1C2826]">{value}</span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ color: trackColor, background: `${trackColor}18` }}
          >
            {scoreLabel(value)}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full pointer-events-none transition-all"
          style={{ width: pct, background: trackColor, opacity: 0.55 }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(factorKey, Number(e.target.value))}
          className="w-full h-1.5 appearance-none bg-[#244A36]/10 rounded-full cursor-pointer relative z-10 simulator-slider"
          style={{ accentColor: trackColor }}
        />
      </div>

      {/* Delta from baseline */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#5E7E67]">Baseline: <strong className="text-[#1C2826]">{baseline}</strong></span>
        {Math.abs(delta) >= 1 ? (
          <span
            className="font-semibold flex items-center gap-0.5"
            style={{ color: delta > 0 ? '#A05C2C' : '#244A36' }}
          >
            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta > 0 ? `+${delta}` : delta} pts from baseline
          </span>
        ) : (
          <span className="text-[#9BA9A0] flex items-center gap-0.5">
            <Minus className="w-3 h-3" /> No change
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ level, score }: { level: keyof typeof RISK_LEVEL_META; score: number }) {
  const meta = RISK_LEVEL_META[level];
  return (
    <div
      className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border"
      style={{ background: meta.bg, borderColor: meta.border }}
    >
      <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: meta.color }}>
        Risk Level
      </span>
      <span className="text-2xl font-extrabold tracking-tight" style={{ color: meta.color }}>
        {meta.label.toUpperCase()}
      </span>
      <span
        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
        style={{ background: meta.color, color: '#FAF7F2' }}
      >
        Score: {score}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RiskSimulator() {
  const { riskDataMap, rawProfiles } = useRisk();

  const locationIds = Object.keys(riskDataMap);

  const [selectedId, setSelectedId] = useState<string>(locationIds[0] || 'gangtok');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [simulationRan, setSimulationRan] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Baseline extracted from raw profiles (same source as riskCalculationService)
  const baseline = useMemo<SimulatorFactorState>(() => {
    const raw = rawProfiles[selectedId];
    if (!raw) return { rainfall: 50, slope: 50, soilTerrain: 50, groundMovement: 50, satellite: 50, historical: 50 };
    return extractBaselineFactors(raw.factors);
  }, [selectedId, rawProfiles]);

  const [scenario, setScenario] = useState<SimulatorFactorState>(baseline);

  // When location changes, reset scenario to new baseline
  const handleSelectLocation = useCallback((id: string) => {
    setSelectedId(id);
    setDropdownOpen(false);
    setSimulationRan(false);
    setResult(null);
    const raw = rawProfiles[id];
    if (raw) setScenario(extractBaselineFactors(raw.factors));
  }, [rawProfiles]);

  const handleSliderChange = useCallback((key: keyof SimulatorFactorState, value: number) => {
    setScenario((prev) => ({ ...prev, [key]: value }));
    setSimulationRan(false);
    setResult(null);
  }, []);

  const handleSimulate = () => {
    const r = runSimulation(baseline, scenario);
    setResult(r);
    setSimulationRan(true);
  };

  const handleReset = () => {
    setScenario({ ...baseline });
    setSimulationRan(false);
    setResult(null);
  };

  const locationData = riskDataMap[selectedId];
  const rawProfile = rawProfiles[selectedId];

  if (!locationData || !rawProfile) return null;

  const currentMeta = RISK_LEVEL_META[locationData.riskLevel];

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto flex flex-col font-sans selection:bg-[#244A36]/20">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-7 pb-6 border-b border-[#244A36]/10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#244A36]/10 flex items-center justify-center text-[#244A36]">
            <Sliders className="w-4 h-4" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5E7E67]">
            Scenario Simulation — Prototype
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C2826] tracking-tight leading-snug">
          What-If Risk Simulator
        </h1>
        <p className="text-sm text-[#3A4D43] max-w-2xl leading-relaxed">
          Explore how changing environmental conditions may affect landslide risk for a selected Northeast India location.
          Adjust the sliders and simulate a scenario to compare risk outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 flex-1">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Location Selector */}
          <div className="liquid-glass rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[#5E7E67] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              Select Location
            </div>

            {/* Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/70 border border-[#244A36]/12 text-sm font-semibold text-[#1C2826] hover:bg-white/90 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#5E7E67]" />
                  {locationData.location}, {locationData.state}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#5E7E67] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full mt-1.5 left-0 right-0 z-30 liquid-glass-modal rounded-xl overflow-hidden shadow-lg">
                  {locationIds.map((id) => {
                    const ld = riskDataMap[id];
                    if (!ld) return null;
                    const meta = RISK_LEVEL_META[ld.riskLevel];
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelectLocation(id)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-[#244A36]/5 transition-colors ${id === selectedId ? 'bg-[#244A36]/8' : ''}`}
                      >
                        <span className="font-medium text-[#1C2826]">{ld.location}, {ld.state}</span>
                        <span
                          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{ color: meta.color, background: meta.bg }}
                        >
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Location quick-facts */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { label: 'Terrain', value: rawProfile.terrainType.split(' ').slice(0, 3).join(' ') },
                { label: 'Elevation', value: rawProfile.elevation },
                { label: 'Slope', value: rawProfile.slopeCondition.split('(')[0].trim() },
                { label: 'History', value: rawProfile.historicalActivity.split('(')[0].trim().split(' ').slice(0, 3).join(' ') },
              ].map(({ label, value }) => (
                <div key={label} className="px-3 py-2 rounded-xl bg-white/50 border border-[#244A36]/8">
                  <div className="text-[10px] text-[#5E7E67] font-medium uppercase tracking-wider">{label}</div>
                  <div className="text-[12px] font-semibold text-[#1C2826] leading-tight mt-0.5 truncate" title={value}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Conditions */}
          <div className="liquid-glass rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[#5E7E67] uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5" />
              Current Conditions
            </div>

            <div className="flex flex-col gap-2">
              {[
                { label: 'Rainfall', icon: <CloudRain className="w-3.5 h-3.5" />, factor: locationData.factors.rainfall },
                { label: 'Ground Movement', icon: <Activity className="w-3.5 h-3.5" />, factor: locationData.factors.groundMovement },
                { label: 'Slope Sensitivity', icon: <Mountain className="w-3.5 h-3.5" />, factor: locationData.factors.slope },
                { label: 'Historical Activity', icon: <History className="w-3.5 h-3.5" />, factor: locationData.factors.historical },
                { label: 'Satellite / InSAR', icon: <Radio className="w-3.5 h-3.5" />, factor: locationData.factors.satellite },
                { label: 'Soil / Terrain', icon: <Layers className="w-3.5 h-3.5" />, factor: locationData.factors.soilTerrain },
              ].map(({ label, icon, factor }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/50 border border-[#244A36]/8 gap-2">
                  <span className="flex items-center gap-1.5 text-[12px] text-[#3A4D43] font-medium">
                    <span className="text-[#5E7E67]">{icon}</span>
                    {label}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#5E7E67]">{factor.valueDisplay}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        factor.indicator === 'Critical' ? 'text-[#7A2E2E] bg-[#7A2E2E]/10 border-[#7A2E2E]/20' :
                        factor.indicator === 'High' ? 'text-[#A05C2C] bg-[#A05C2C]/10 border-[#A05C2C]/20' :
                        factor.indicator === 'Elevated' ? 'text-[#C87941] bg-[#C87941]/10 border-[#C87941]/20' :
                        'text-[#244A36] bg-[#244A36]/10 border-[#244A36]/20'
                      }`}
                    >
                      {factor.indicator}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Current risk badge */}
            <div
              className="mt-1 flex items-center justify-between px-4 py-3 rounded-xl border"
              style={{ background: currentMeta.bg, borderColor: currentMeta.border }}
            >
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: currentMeta.color }}>
                  Current Risk
                </div>
                <div className="text-lg font-extrabold leading-tight" style={{ color: currentMeta.color }}>
                  {currentMeta.label.toUpperCase()}
                </div>
              </div>
              <div
                className="text-2xl font-black"
                style={{ color: currentMeta.color }}
              >
                {locationData.riskScore}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Simulation Controls */}
          <div className="liquid-glass rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#5E7E67] uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" />
                Adjust Scenario Factors
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5E7E67] hover:text-[#244A36] transition-colors px-2.5 py-1 rounded-lg hover:bg-[#244A36]/8"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Scenario
              </button>
            </div>

            <div className="text-[11px] text-[#5E7E67] bg-[#244A36]/5 px-3 py-2 rounded-lg flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Satellite/InSAR and Soil/Terrain inputs are locked at baseline as these are slow-changing geological parameters.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADJUSTABLE_FACTORS.map((f) => (
                <FactorSlider
                  key={f.key}
                  factorKey={f.key}
                  label={f.label}
                  sublabel={f.sublabel}
                  icon={f.icon}
                  trackColor={f.trackColor}
                  value={scenario[f.key]}
                  baseline={baseline[f.key]}
                  onChange={handleSliderChange}
                />
              ))}
            </div>

            {/* Fixed (locked) factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60">
              {[
                { label: 'Satellite / InSAR', icon: <Radio className="w-4 h-4" />, value: baseline.satellite },
                { label: 'Soil / Terrain', icon: <Layers className="w-4 h-4" />, value: baseline.soilTerrain },
              ].map(({ label, icon, value }) => (
                <div key={label} className="p-4 rounded-2xl bg-white/40 border border-[#244A36]/8 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-[#3A4D43]">
                    <span className="text-[#5E7E67]">{icon}</span>
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1C2826]">{value}</span>
                    <span className="text-[10px] text-[#5E7E67] font-medium px-2 py-0.5 rounded-full border border-[#244A36]/15 bg-white/60">
                      Locked
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulate Button */}
            <button
              type="button"
              onClick={handleSimulate}
              className="w-full py-3 rounded-2xl bg-[#244A36] text-[#FAF7F2] font-bold text-sm tracking-wide hover:bg-[#1B3828] active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(36,74,54,0.25)] flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4 text-[#A3C7AD]" />
              Simulate Risk
            </button>
          </div>

          {/* ── Result Panel ─────────────────────────────────────────────── */}
          {simulationRan && result && (
            <div className="liquid-glass rounded-2xl p-5 flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-300">

              {/* Before / After comparison */}
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#5E7E67] uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5" />
                Simulation Result
              </div>

              {/* Score comparison row */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                {/* Baseline card */}
                <div className="flex-1 w-full">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#5E7E67] mb-1.5 text-center">
                    Current Conditions
                  </div>
                  <RiskBadge level={result.baselineLevel} score={result.baselineScore} />
                </div>

                {/* Arrow + delta */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className="text-sm font-extrabold px-3 py-1 rounded-full border"
                    style={{
                      color: result.scoreDelta > 0 ? '#A05C2C' : result.scoreDelta < 0 ? '#244A36' : '#5E7E67',
                      background: result.scoreDelta > 0 ? 'rgba(160,92,44,0.08)' : result.scoreDelta < 0 ? 'rgba(36,74,54,0.08)' : 'rgba(94,126,103,0.08)',
                      borderColor: result.scoreDelta > 0 ? 'rgba(160,92,44,0.2)' : result.scoreDelta < 0 ? 'rgba(36,74,54,0.2)' : 'rgba(94,126,103,0.2)',
                    }}
                  >
                    {result.scoreDelta === 0 ? '±0' : result.scoreDelta > 0 ? `+${result.scoreDelta}` : result.scoreDelta} pts
                  </div>
                  <div className="hidden sm:flex items-center">
                    <ArrowRight className="w-5 h-5 text-[#5E7E67]" />
                  </div>
                  <div className="sm:hidden text-[#5E7E67] text-[18px] font-light">↓</div>
                </div>

                {/* Scenario card */}
                <div className="flex-1 w-full">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#5E7E67] mb-1.5 text-center">
                    Scenario Conditions
                  </div>
                  <RiskBadge level={result.scenarioLevel} score={result.scenarioScore} />
                </div>
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Score Before', value: result.baselineScore },
                  { label: 'Score After', value: result.scenarioScore },
                  {
                    label: 'Risk Change',
                    value: result.scoreDelta === 0 ? '±0' : result.scoreDelta > 0 ? `+${result.scoreDelta}` : `${result.scoreDelta}`,
                    color: result.scoreDelta > 0 ? '#A05C2C' : result.scoreDelta < 0 ? '#244A36' : '#5E7E67',
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5 px-3 py-3 rounded-xl bg-white/60 border border-[#244A36]/8 text-center">
                    <span className="text-[10px] text-[#5E7E67] font-medium uppercase tracking-wider">{label}</span>
                    <span className="text-xl font-extrabold" style={{ color: color || '#1C2826' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Changed factors highlights */}
              {(result.increasedFactors.length > 0 || result.decreasedFactors.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {result.increasedFactors.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#A05C2C]/10 text-[#A05C2C] border border-[#A05C2C]/20">
                      <TrendingUp className="w-3 h-3" /> {f}
                    </span>
                  ))}
                  {result.decreasedFactors.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#244A36]/10 text-[#244A36] border border-[#244A36]/20">
                      <TrendingDown className="w-3 h-3" /> {f}
                    </span>
                  ))}
                </div>
              )}

              {/* Explanation */}
              <div className="p-4 rounded-xl bg-white/60 border border-[#244A36]/10 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#244A36]/8 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-3.5 h-3.5 text-[#244A36]" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#5E7E67] uppercase tracking-wider mb-1">
                    Why did risk change?
                  </div>
                  <p className="text-sm text-[#1C2826] leading-relaxed">{result.explanation}</p>
                </div>
              </div>

              {/* Before vs After visual comparison */}
              <div className="rounded-xl border border-[#244A36]/10 overflow-hidden">
                <div className="grid grid-cols-2 text-center">
                  <div
                    className="p-3 border-r border-[#244A36]/10"
                    style={{ background: RISK_LEVEL_META[result.baselineLevel].bg }}
                  >
                    <div className="text-[10px] font-semibold text-[#5E7E67] uppercase tracking-wider">Before</div>
                    <div className="text-base font-extrabold mt-0.5" style={{ color: RISK_LEVEL_META[result.baselineLevel].color }}>
                      {RISK_LEVEL_META[result.baselineLevel].label.toUpperCase()}
                    </div>
                    <div className="text-xs text-[#5E7E67]">Score: {result.baselineScore}</div>
                  </div>
                  <div
                    className="p-3"
                    style={{ background: RISK_LEVEL_META[result.scenarioLevel].bg }}
                  >
                    <div className="text-[10px] font-semibold text-[#5E7E67] uppercase tracking-wider">After</div>
                    <div className="text-base font-extrabold mt-0.5" style={{ color: RISK_LEVEL_META[result.scenarioLevel].color }}>
                      {RISK_LEVEL_META[result.scenarioLevel].label.toUpperCase()}
                    </div>
                    <div className="text-xs text-[#5E7E67]">Score: {result.scenarioScore}</div>
                  </div>
                </div>
                <div className="bg-[#244A36]/5 text-center py-1.5 text-[10px] text-[#5E7E67] font-medium tracking-wide flex items-center justify-center gap-1.5">
                  <span>↑ SIMULATION ↑</span>
                </div>
              </div>

              {/* Navigation CTA */}
              <div className="flex flex-wrap gap-3 pt-1">
                {(result.scenarioLevel === 'HIGH' || result.scenarioLevel === 'SEVERE') && (
                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState({}, '', `/live-map?evacuateFrom=${selectedId}&evacuation=true`);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#7A2E2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#5C2323] transition-colors shadow-sm"
                  >
                    <Route className="w-3.5 h-3.5 text-[#F2D5D5]" />
                    Plan Evacuation Route
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigateTo('/risk-monitoring')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#244A36] text-[#FAF7F2] text-xs font-semibold hover:bg-[#1B3828] transition-colors shadow-sm"
                >
                  <Activity className="w-3.5 h-3.5 text-[#A3C7AD]" />
                  View Risk Monitoring
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('/live-map')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-[#244A36]/15 text-[#1C2826] text-xs font-semibold hover:bg-white transition-colors shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#244A36]" />
                  View Live Map
                </button>
              </div>
            </div>
          )}

          {/* Prompt to simulate (before first run) */}
          {!simulationRan && (
            <div className="liquid-glass rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center min-h-[160px]">
              <div className="w-12 h-12 rounded-2xl bg-[#244A36]/8 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#5E7E67]" />
              </div>
              <div className="text-sm font-semibold text-[#3A4D43]">
                Adjust the sliders above and press <strong>Simulate Risk</strong> to see the scenario outcome.
              </div>
              <div className="text-[11px] text-[#5E7E67]">
                Try increasing Rainfall or Ground Movement to see how risk escalates.
              </div>
            </div>
          )}

          {/* Data safety disclaimer */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#C87941]/6 border border-[#C87941]/18">
            <AlertTriangle className="w-4 h-4 text-[#C87941] shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-[#5E7E67] leading-relaxed">
              <strong className="text-[#C87941]">Prototype Disclaimer:</strong> This simulator is a scenario-planning tool only.
              Results are illustrative and based on a weighted prototype formula — not a validated geotechnical prediction model.
              Do not treat simulation outputs as official early-warning advisories.
            </p>
          </div>
        </div>
      </div>

      {/* Slider thumb CSS */}
      <style>{`
        .simulator-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #1C2826;
          border: 2.5px solid white;
          box-shadow: 0 1px 6px rgba(28,40,34,0.18);
          cursor: pointer;
          position: relative;
          z-index: 10;
          margin-top: -6px;
        }
        .simulator-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #1C2826;
          border: 2.5px solid white;
          box-shadow: 0 1px 6px rgba(28,40,34,0.18);
          cursor: pointer;
        }
        .simulator-slider::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 9999px;
        }
        .simulator-slider::-moz-range-track {
          height: 6px;
          border-radius: 9999px;
          background: rgba(36,74,54,0.10);
        }
      `}</style>
    </div>
  );
}
