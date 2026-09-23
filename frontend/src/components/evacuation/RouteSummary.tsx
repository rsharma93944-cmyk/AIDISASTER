import {
  AlertTriangle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { EvacuationCalculationResult } from '../../services/routeService';

interface RouteSummaryProps {
  result: EvacuationCalculationResult;
  onViewOnMap: () => void;
  onRecalculate: () => void;
  onClear: () => void;
}

export default function RouteSummary({
  result,
  onViewOnMap,
  onRecalculate,
  onClear,
}: RouteSummaryProps) {
  const { start, destination, recommendedRoute: route, hasLowRiskAlternative } = result;

  // Determine risk exposure badge color
  const riskBadgeStyle = (() => {
    switch (route.riskExposureLevel) {
      case 'SEVERE':
        return { bg: '#7A2E2E18', text: '#7A2E2E', border: '#7A2E2E35' };
      case 'HIGH':
        return { bg: '#A05C2C18', text: '#A05C2C', border: '#A05C2C35' };
      case 'MODERATE':
        return { bg: '#C8794118', text: '#C87941', border: '#C8794135' };
      case 'LOW':
      default:
        return { bg: '#244A3618', text: '#244A36', border: '#244A3635' };
    }
  })();

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col gap-4 font-sans border border-[#244A36]/15 shadow-md">
      {/* Card Header */}
      <div className="flex items-start justify-between pb-3 border-b border-[#244A36]/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#244A36]/10 text-[#244A36] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#244A36] animate-pulse" />
            <span>Prototype route analysis</span>
          </div>
          <h3 className="text-xl font-bold text-[#1C2826] tracking-tight">
            ROUTE SUMMARY
          </h3>
        </div>

        {/* Route Status Badge */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold uppercase text-[#5E7E67]">Route status</span>
          <span className="text-xs font-bold text-[#C87941] bg-[#C87941]/15 px-2 py-0.5 rounded-full">
            Prototype
          </span>
        </div>
      </div>

      {/* From / To Journey Steps */}
      <div className="p-3.5 rounded-2xl bg-white/70 border border-[#244A36]/10 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#244A36] text-[#FAF7F2] flex items-center justify-center text-[10px] font-bold shrink-0">
            A
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">From:</span>
            <span className="text-xs font-bold text-[#1C2826] truncate block">{start.name}</span>
          </div>
        </div>

        <div className="w-px h-3 bg-[#244A36]/20 ml-3" />

        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#C87941] text-[#FAF7F2] flex items-center justify-center text-[10px] font-bold shrink-0">
            B
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">To:</span>
            <span className="text-xs font-bold text-[#1C2826] truncate block">{destination.name}</span>
            <span className="text-[9.5px] text-[#C87941] font-semibold block">Designated/Prototype Safe Location</span>
          </div>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Distance */}
        <div className="p-3 rounded-2xl bg-white/60 border border-[#244A36]/8">
          <span className="text-[10px] font-bold text-[#5E7E67] uppercase block">Distance</span>
          <span className="text-lg font-extrabold text-[#1C2826] mt-0.5 block">
            {route.distanceKm} <span className="text-xs font-semibold text-[#5E7E67]">km</span>
          </span>
        </div>

        {/* Estimated Time */}
        <div className="p-3 rounded-2xl bg-white/60 border border-[#244A36]/8">
          <span className="text-[10px] font-bold text-[#5E7E67] uppercase block">Estimated Time</span>
          <span className="text-lg font-extrabold text-[#1C2826] mt-0.5 block">
            {route.estimatedMinutes} <span className="text-xs font-semibold text-[#5E7E67]">min</span>
          </span>
        </div>

        {/* Risk Exposure */}
        <div
          className="p-3 rounded-2xl border"
          style={{ backgroundColor: riskBadgeStyle.bg, borderColor: riskBadgeStyle.border }}
        >
          <span className="text-[10px] font-bold uppercase block" style={{ color: riskBadgeStyle.text }}>
            Risk Exposure
          </span>
          <span className="text-lg font-extrabold mt-0.5 block" style={{ color: riskBadgeStyle.text }}>
            {route.riskExposureLevel}
          </span>
        </div>
      </div>

      {/* Zone Hazard Analysis Counts */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-white/50 border border-[#244A36]/8 flex items-center justify-between">
          <span className="text-[11px] text-[#5E7E67] font-medium">High-risk zones avoided:</span>
          <span className="font-extrabold text-[#244A36] bg-[#244A36]/10 px-2 py-0.5 rounded-full text-xs">
            {route.severeRiskZonesAvoided}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/50 border border-[#244A36]/8 flex items-center justify-between">
          <span className="text-[11px] text-[#5E7E67] font-medium">Moderate-risk zones:</span>
          <span className="font-extrabold text-[#C87941] bg-[#C87941]/10 px-2 py-0.5 rounded-full text-xs">
            {route.moderateRiskZonesCrossed}
          </span>
        </div>
      </div>

      {/* Safety Notice if no low-risk route available */}
      {!hasLowRiskAlternative && (
        <div className="p-3 rounded-2xl bg-[#C87941]/10 border border-[#C87941]/25 text-[11px] text-[#8C4A1E] leading-relaxed flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#C87941] shrink-0 mt-0.5" />
          <p>
            <strong>No completely low-risk route is currently available.</strong> The displayed route minimizes exposure based on available prototype risk data.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onViewOnMap}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#244A36] text-[#FAF7F2] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#1E3A2B] transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View on Map</span>
        </button>

        <button
          type="button"
          onClick={onRecalculate}
          className="py-2.5 px-3 rounded-xl border border-[#244A36]/20 text-[#244A36] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/80 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          className="py-2.5 px-3 rounded-xl border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors"
        >
          Clear Route
        </button>
      </div>

      {/* Safety Disclaimer */}
      <div className="pt-2 border-t border-[#244A36]/10 text-[10px] text-[#5E7E67] leading-relaxed">
        <p>
          <strong className="text-[#1C2826]">Disclaimer:</strong> Routes are illustrative and should not replace official emergency instructions, road-closure information, or local authority guidance.
        </p>
      </div>
    </div>
  );
}
