import {
  GitCompare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { EvacuationCalculationResult } from '../../services/routeService';

interface RouteComparisonProps {
  result: EvacuationCalculationResult;
  selectedRouteId: string;
  onSelectRoute: (routeId: 'recommended-safer' | 'shortest-direct') => void;
}

export default function RouteComparison({
  result,
  selectedRouteId,
  onSelectRoute,
}: RouteComparisonProps) {
  const { recommendedRoute: routeB, alternativeRoute: routeA } = result;

  const diffDistance = Math.round((routeB.distanceKm - routeA.distanceKm) * 10) / 10;
  const extraKmText = diffDistance > 0 ? `+${diffDistance} km detour` : 'Identical corridor';

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col gap-4 font-sans border border-[#244A36]/15 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#244A36]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#244A36]/10 flex items-center justify-center text-[#244A36]">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1C2826]">
              Route Comparison Analysis
            </h3>
            <span className="text-[10px] text-[#5E7E67] font-medium">
              Prototype risk-weighted routing evaluation
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#244A36] bg-[#244A36]/10 px-2.5 py-1 rounded-full">
          2 Options
        </span>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* ROUTE A: Shortest Route */}
        <div
          onClick={() => onSelectRoute('shortest-direct')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedRouteId === 'shortest-direct'
              ? 'bg-white border-[#C87941] shadow-[0_4px_16px_rgba(200,121,65,0.18)] ring-2 ring-[#C87941]/30'
              : 'bg-white/50 border-[#244A36]/10 hover:bg-white/80'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider block">
                ROUTE A
              </span>
              <h4 className="text-sm font-bold text-[#1C2826]">
                Shortest Route
              </h4>
            </div>
            <span className="text-[9px] font-bold bg-[#C87941]/10 text-[#C87941] px-2 py-0.5 rounded-full uppercase">
              Direct
            </span>
          </div>

          <div className="space-y-1.5 text-xs mb-3">
            <div className="flex justify-between">
              <span className="text-[#5E7E67]">Distance:</span>
              <span className="font-bold text-[#1C2826]">{routeA.distanceKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5E7E67]">Est. Time:</span>
              <span className="font-bold text-[#1C2826]">{routeA.estimatedMinutes} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#5E7E67]">High-risk exposure:</span>
              <span
                className="font-bold text-[10px] px-1.5 py-0.2 rounded uppercase"
                style={{
                  color: routeA.riskExposureLevel === 'SEVERE' ? '#7A2E2E' : routeA.riskExposureLevel === 'HIGH' ? '#A05C2C' : '#C87941',
                  backgroundColor: routeA.riskExposureLevel === 'SEVERE' ? '#7A2E2E15' : routeA.riskExposureLevel === 'HIGH' ? '#A05C2C15' : '#C8794115',
                }}
              >
                {routeA.riskExposureLevel}
              </span>
            </div>
          </div>

          {routeA.highRiskZonesCrossed > 0 ? (
            <div className="p-2 rounded-xl bg-red-50/80 border border-red-200 text-[10px] text-red-800 leading-tight flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 text-red-600 shrink-0 mt-0.5" />
              <span>Crosses {routeA.highRiskZonesCrossed} high/severe landslide cut(s).</span>
            </div>
          ) : (
            <div className="text-[10px] text-[#5E7E67]">Traverses standard roadway.</div>
          )}
        </div>

        {/* ROUTE B: Risk-Aware Route */}
        <div
          onClick={() => onSelectRoute('recommended-safer')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedRouteId === 'recommended-safer'
              ? 'bg-white border-[#244A36] shadow-[0_4px_16px_rgba(36,74,54,0.18)] ring-2 ring-[#244A36]/30'
              : 'bg-white/50 border-[#244A36]/10 hover:bg-white/80'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] font-bold text-[#244A36] uppercase tracking-wider block">
                ROUTE B
              </span>
              <h4 className="text-sm font-bold text-[#1C2826]">
                Risk-Aware Route
              </h4>
            </div>
            <span className="text-[9px] font-bold bg-[#244A36]/10 text-[#244A36] px-2 py-0.5 rounded-full uppercase">
              Safer
            </span>
          </div>

          <div className="space-y-1.5 text-xs mb-3">
            <div className="flex justify-between">
              <span className="text-[#5E7E67]">Distance:</span>
              <span className="font-bold text-[#1C2826]">{routeB.distanceKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5E7E67]">Est. Time:</span>
              <span className="font-bold text-[#1C2826]">{routeB.estimatedMinutes} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#5E7E67]">High-risk exposure:</span>
              <span
                className="font-bold text-[10px] px-1.5 py-0.2 rounded uppercase"
                style={{
                  color: routeB.riskExposureLevel === 'SEVERE' ? '#7A2E2E' : routeB.riskExposureLevel === 'HIGH' ? '#A05C2C' : '#244A36',
                  backgroundColor: routeB.riskExposureLevel === 'SEVERE' ? '#7A2E2E15' : routeB.riskExposureLevel === 'HIGH' ? '#A05C2C15' : '#244A3615',
                }}
              >
                {routeB.riskExposureLevel}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#244A36]/10 border border-[#244A36]/20 text-[10px] text-[#244A36] leading-tight flex items-start gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#244A36] shrink-0 mt-0.5" />
            <span>Avoids high hazard cuts via reinforced ridge ({extraKmText}).</span>
          </div>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="p-3.5 rounded-2xl bg-[#244A36]/8 border border-[#244A36]/15 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-[#244A36] shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-bold text-[#1C2826]">
            Recommended for lower risk exposure: <span className="text-[#244A36]">Route B</span>
          </div>
          <p className="text-[10.5px] text-[#5E7E67] mt-0.5 leading-relaxed">
            While Route A is {diffDistance > 0 ? `${diffDistance} km shorter` : 'direct'}, Route B incurs significantly lower risk penalty by bypassing critical escarpments and active slide creep sectors.
          </p>
        </div>
      </div>

      {/* Decision-support disclaimer */}
      <div className="text-[9.5px] text-[#5E7E67] text-center">
        Label: <strong>“Lower-risk prototype route”</strong> — actual safety depends on current conditions and official information.
      </div>
    </div>
  );
}
