import { 
  Radio, Brain, BarChart3, Bell, UserCheck, Megaphone,
  MapPin, Activity, Search, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import type { AlertItem, EscalationTimelineStage, EscalationStageName } from '../../data/alerts';

// Stage icon mapping using existing lucide-react icons
const STAGE_ICONS: Record<EscalationStageName, React.ComponentType<{ className?: string }>> = {
  'Detection': Radio,
  'AI Screening': Brain,
  'Risk Assessment': BarChart3,
  'Alert Generated': Bell,
  'Review': UserCheck,
  'Warning / Action': Megaphone,
};

// Status label + color mapping using ResQAI design tokens
const STATUS_CONFIG = {
  completed: {
    label: 'COMPLETED',
    dotClass: 'bg-[#244A36] border-white ring-2 ring-[#244A36]/30',
    lineClass: 'bg-[#244A36]/40',
    textClass: 'text-[#244A36]',
    badgeClass: 'bg-[#244A36]/10 text-[#244A36] border-[#244A36]/20',
    iconBg: 'bg-[#244A36]/10 text-[#244A36]',
  },
  active: {
    label: 'ACTIVE',
    dotClass: 'bg-[#C87941] border-white ring-2 ring-[#C87941]/30 animate-pulse',
    lineClass: 'bg-[#C87941]/30',
    textClass: 'text-[#C87941]',
    badgeClass: 'bg-[#C87941]/10 text-[#C87941] border-[#C87941]/25',
    iconBg: 'bg-[#C87941]/10 text-[#C87941]',
  },
  pending: {
    label: 'PENDING',
    dotClass: 'bg-white border-[#5E7E67]/40',
    lineClass: 'bg-[#5E7E67]/15',
    textClass: 'text-[#5E7E67]',
    badgeClass: 'bg-[#FAF7F2] text-[#5E7E67] border-[#5E7E67]/15',
    iconBg: 'bg-[#FAF7F2] text-[#5E7E67]/60',
  },
};

interface AlertEscalationTimelineProps {
  alert: AlertItem;
  onViewMap?: (locationId: string) => void;
  onViewRisk?: (locationId: string) => void;
  onViewAnalysis?: (locationId: string) => void;
}

export default function AlertEscalationTimeline({ 
  alert, 
  onViewMap, 
  onViewRisk, 
  onViewAnalysis 
}: AlertEscalationTimelineProps) {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  const stages = alert.escalationTimeline;

  // Empty state
  if (!stages || stages.length === 0) {
    return (
      <div className="p-5 glass-card rounded-2xl border border-white/60 text-center">
        <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#5E7E67]/15 flex items-center justify-center mx-auto mb-2.5">
          <BarChart3 className="w-5 h-5 text-[#5E7E67]/60" />
        </div>
        <p className="text-xs text-[#5E7E67] font-medium">
          Escalation timeline unavailable for this alert.
        </p>
      </div>
    );
  }

  const toggleStage = (idx: number) => {
    setExpandedStage(prev => prev === idx ? null : idx);
  };

  return (
    <div className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider block">
          Alert Escalation Timeline
        </span>
        <span className="text-[9px] font-bold text-[#C87941] bg-[#C87941]/10 px-2 py-0.5 rounded-md uppercase border border-[#C87941]/20">
          Alert Escalation Workflow — Prototype
        </span>
      </div>

      {/* Timeline Container */}
      <div className="p-4 glass-card rounded-2xl border border-white/60">
        <div className="relative">
          {stages.map((stage: EscalationTimelineStage, idx: number) => {
            const config = STATUS_CONFIG[stage.status];
            const IconComponent = STAGE_ICONS[stage.stage];
            const isLast = idx === stages.length - 1;
            const isExpanded = expandedStage === idx;
            const detailEntries = Object.entries(stage.details || {});
            const hasDetails = detailEntries.length > 0;

            return (
              <div key={stage.stage} className="relative flex gap-3">
                {/* Vertical connector line */}
                {!isLast && (
                  <div 
                    className={`absolute left-[15px] top-[34px] w-0.5 bottom-0 ${config.lineClass}`}
                    aria-hidden="true"
                  />
                )}

                {/* Icon Node */}
                <div className="flex-shrink-0 z-10 mt-0.5">
                  <div 
                    className={`w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center ${config.dotClass}`}
                    role="img"
                    aria-label={`${stage.stage} — ${config.label}`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Stage Content */}
                <div className={`flex-1 pb-4 ${isLast ? 'pb-0' : ''}`}>
                  {/* Stage Header — clickable to expand details */}
                  <button
                    type="button"
                    onClick={() => hasDetails ? toggleStage(idx) : undefined}
                    className={`w-full text-left flex items-start justify-between gap-2 ${
                      hasDetails ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    aria-expanded={isExpanded}
                    aria-label={`${stage.stage}: ${config.label}${stage.timestamp ? ` at ${stage.timestamp}` : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${config.textClass}`}>
                          {stage.stage}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${config.badgeClass}`}>
                          {config.label}
                        </span>
                      </div>

                      {/* Timestamp */}
                      {stage.timestamp && (
                        <span className="text-[10px] font-mono text-[#5E7E67] block mt-0.5">
                          {stage.timestamp}
                        </span>
                      )}

                      {/* Description */}
                      <p className="text-[11px] text-[#5E7E67] mt-1 leading-relaxed font-medium">
                        {stage.description}
                      </p>
                    </div>

                    {/* Expand chevron */}
                    {hasDetails && (
                      <div className="flex-shrink-0 mt-0.5">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#5E7E67]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#5E7E67]" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Expanded Detail Metadata */}
                  {isExpanded && hasDetails && (
                    <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="p-2.5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 space-y-1.5">
                        {detailEntries.map(([key, value]) => (
                          <div key={key} className="flex items-start justify-between gap-2 text-[11px]">
                            <span className="text-[#5E7E67] font-medium flex-shrink-0">{key}</span>
                            <span className={`font-bold text-right ${
                              key === 'Risk Level' 
                                ? value.includes('SEVERE') 
                                  ? 'text-[#7A2E2E]' 
                                  : value.includes('HIGH') 
                                    ? 'text-[#A05C2C]' 
                                    : value.includes('MODERATE') 
                                      ? 'text-[#C87941]' 
                                      : 'text-[#244A36]'
                                : 'text-[#1C2826]'
                            }`}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Quick-action buttons for relevant stages */}
                      {stage.stage === 'Detection' && onViewMap && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onViewMap(alert.locationId); }}
                          className="w-full py-1.5 bg-white/60 hover:bg-white/90 border border-white/70 rounded-lg text-[10px] font-bold text-[#244A36] flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>View Location on Map</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {stage.stage === 'Risk Assessment' && onViewRisk && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onViewRisk(alert.locationId); }}
                          className="w-full py-1.5 bg-white/60 hover:bg-white/90 border border-white/70 rounded-lg text-[10px] font-bold text-[#244A36] flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
                        >
                          <Activity className="w-3 h-3" />
                          <span>View Risk Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {stage.stage === 'AI Screening' && onViewAnalysis && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onViewAnalysis(alert.locationId); }}
                          className="w-full py-1.5 bg-white/60 hover:bg-white/90 border border-white/70 rounded-lg text-[10px] font-bold text-[#244A36] flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
                        >
                          <Search className="w-3 h-3" />
                          <span>Analyze Evidence</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
