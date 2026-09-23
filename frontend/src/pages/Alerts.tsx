import { useState, useMemo, useEffect } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Clock, MapPin, 
  Search, Filter, ArrowRight, Check, X, Copy, Share2, 
  Eye, History, ChevronDown, 
  Bell, Radio, Mountain, CloudRain, Activity, Phone, PhoneCall,
  Route
} from 'lucide-react';
import { useRisk } from '../context/RiskContext';
import { 
  NER_STATE_STATUSES, 
  AlertItem, 
  getSeverityBadgeStyle,
  getStatusBadgeStyle,
  getStateStatusColor
} from '../data/alerts';
import EmergencyContactsModal from '../components/EmergencyContactsModal';
import AlertEscalationTimeline from '../components/alerts/AlertEscalationTimeline';

type FilterType = 'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'HIGH' | 'SEVERE';

export default function Alerts() {
  const { alerts, activeAlertsCount, acknowledgeAlert, resolveAlert, setSelectedLocationId } = useRisk();

  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [historySeverityFilter, setHistorySeverityFilter] = useState<string>('ALL');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyModalState, setEmergencyModalState] = useState<string | undefined>(undefined);

  // Handle location or alert ID query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locParam = params.get('location');
    const alertIdParam = params.get('id');
    if (locParam) {
      setSearchQuery(locParam);
    }
    if (alertIdParam) {
      const match = alerts.find(a => a.id.toLowerCase() === alertIdParam.toLowerCase());
      if (match) setSelectedAlert(match);
    }
  }, [alerts]);

  // Keep selectedAlert in sync if alerts list changes
  useEffect(() => {
    if (selectedAlert) {
      const updated = alerts.find(a => a.id === selectedAlert.id);
      if (updated) setSelectedAlert(updated);
    }
  }, [alerts]);

  // Trigger brief toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 11. Acknowledge Workflow
  const handleAcknowledge = (alertId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    acknowledgeAlert(alertId);
    showToast('Alert acknowledged. Status updated to ACKNOWLEDGED across system.');
  };

  // 12. Resolve Workflow
  const handleResolve = (alertId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    resolveAlert(alertId);
    showToast('Alert marked as resolved. Moved to Alert History across system.');
  };

  // 10. View on Map
  const handleViewOnMap = (locationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedLocationId(locationId);
    window.history.pushState({}, '', `/live-map?location=${locationId}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // View Risk Monitoring
  const handleViewRiskMonitoring = (locationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedLocationId(locationId);
    window.history.pushState({}, '', `/risk-monitoring?location=${locationId}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // View Analysis
  const handleViewAnalysis = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.history.pushState({}, '', `/analysis`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Find Safer Evacuation Route
  const handleFindSaferRoute = (locationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedLocationId(locationId);
    window.history.pushState({}, '', `/live-map?evacuateFrom=${locationId}&evacuation=true`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // 13. Copy Message
  const handleCopyMessage = (alert: AlertItem) => {
    const text = `LANDSLIDE RISK ALERT\n\nLocation: ${alert.location}, ${alert.state}\nRisk Level: ${alert.riskLevel}\nSeverity: ${alert.severity}\nTrigger: ${alert.trigger}\n\nRecommended Action:\n${alert.recommendedAction}\n\nPlease follow local disaster-management guidance.\n[ResQAI Early Warning System - Prototype]`;
    navigator.clipboard.writeText(text);
    showToast('Warning message copied to clipboard.');
  };

  // Derived Summary Counts
  const activeCount = activeAlertsCount;
  const acknowledgedCount = useMemo(() => alerts.filter(a => a.status === 'ACKNOWLEDGED').length, [alerts]);
  const highSevereCount = useMemo(() => alerts.filter(a => (a.severity === 'HIGH' || a.severity === 'SEVERE') && a.status !== 'RESOLVED').length, [alerts]);
  const resolvedCount = useMemo(() => alerts.filter(a => a.status === 'RESOLVED').length, [alerts]);

  // Filtered Alert List
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      // Status & Severity Filters
      if (activeFilter === 'ACTIVE' && a.status !== 'ACTIVE') return false;
      if (activeFilter === 'ACKNOWLEDGED' && a.status !== 'ACKNOWLEDGED') return false;
      if (activeFilter === 'RESOLVED' && a.status !== 'RESOLVED') return false;
      if (activeFilter === 'HIGH' && a.severity !== 'HIGH') return false;
      if (activeFilter === 'SEVERE' && a.severity !== 'SEVERE') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesLoc = a.location.toLowerCase().includes(q);
        const matchesState = a.state.toLowerCase().includes(q);
        const matchesId = a.id.toLowerCase().includes(q);
        const matchesTrigger = a.trigger.toLowerCase().includes(q);
        if (!matchesLoc && !matchesState && !matchesId && !matchesTrigger) return false;
      }

      return true;
    });
  }, [alerts, activeFilter, searchQuery]);

  // Resolved Alerts for History
  const resolvedAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (a.status !== 'RESOLVED') return false;
      if (historySeverityFilter !== 'ALL' && a.severity !== historySeverityFilter) return false;
      return true;
    });
  }, [alerts, historySeverityFilter]);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto flex flex-col font-sans selection:bg-[#244A36]/20">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1C2826] text-[#FAF7F2] px-5 py-3 rounded-2xl shadow-2xl border border-[#244A36]/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#526E48]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/60 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PAGE HEADER                                                           */}
      {/* ========================================================================= */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#244A36]/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C87941]/10 border border-[#C87941]/25 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#C87941] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#C87941]">
              Prototype Alert System
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2826] tracking-tight">
            Alert Management
          </h1>
          <p className="text-sm sm:text-base text-[#5E7E67] font-medium mt-1 max-w-2xl">
            Monitor, review and manage landslide risk alerts across the North Eastern Region.
          </p>
        </div>

        {/* Right Actions: Search Box & Emergency Help Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Emergency Helplines Button */}
          <button
            type="button"
            onClick={() => {
              setEmergencyModalState(undefined);
              setEmergencyModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#7A2E2E]/10 hover:bg-[#7A2E2E]/15 text-[#7A2E2E] border border-[#7A2E2E]/25 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-sm flex-shrink-0"
          >
            <PhoneCall className="w-4 h-4 text-[#7A2E2E]" />
            <span>Emergency Helplines</span>
          </button>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E7E67]">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-9 py-2.5 glass-card rounded-2xl text-sm text-[#1C2826] placeholder-[#5E7E67]/70 focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 focus:border-[#244A36]/40 transition-all shadow-sm"
              placeholder="Search location or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5E7E67] hover:text-[#1C2826]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ALERT SUMMARY (4 COMPACT CARDS)                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        
        {/* Active Alerts */}
        <div 
          onClick={() => setActiveFilter('ACTIVE')}
          className={`glass-card rounded-3xl p-5 sm:p-6 cursor-pointer transition-all ${
            activeFilter === 'ACTIVE' ? 'border-[#C87941] ring-2 ring-[#C87941]/25 bg-white/90' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5E7E67]">
              Active Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#C87941]/10 text-[#C87941] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#1C2826]">{activeCount}</span>
            <span className="text-xs font-semibold text-[#C87941]">Requires Action</span>
          </div>
          <span className="text-[10px] text-[#5E7E67] mt-2 block font-medium">Prototype Data</span>
        </div>

        {/* Acknowledged */}
        <div 
          onClick={() => setActiveFilter('ACKNOWLEDGED')}
          className={`glass-card rounded-3xl p-5 sm:p-6 cursor-pointer transition-all ${
            activeFilter === 'ACKNOWLEDGED' ? 'border-[#526E48] ring-2 ring-[#526E48]/25 bg-white/90' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5E7E67]">
              Acknowledged
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#526E48]/10 text-[#526E48] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#1C2826]">{acknowledgedCount}</span>
            <span className="text-xs font-semibold text-[#526E48]">In Progress</span>
          </div>
          <span className="text-[10px] text-[#5E7E67] mt-2 block font-medium">Prototype Data</span>
        </div>

        {/* High / Severe */}
        <div 
          onClick={() => setActiveFilter('HIGH')}
          className={`glass-card rounded-3xl p-5 sm:p-6 cursor-pointer transition-all ${
            activeFilter === 'HIGH' || activeFilter === 'SEVERE' ? 'border-[#7A2E2E] ring-2 ring-[#7A2E2E]/25 bg-white/90' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5E7E67]">
              High / Severe
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#7A2E2E]/10 text-[#7A2E2E] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#7A2E2E]">{highSevereCount}</span>
            <span className="text-xs font-semibold text-[#7A2E2E]">Critical Zones</span>
          </div>
          <span className="text-[10px] text-[#5E7E67] mt-2 block font-medium">Prototype Data</span>
        </div>

        {/* Resolved */}
        <div 
          onClick={() => setActiveFilter('RESOLVED')}
          className={`glass-card rounded-3xl p-5 sm:p-6 cursor-pointer transition-all ${
            activeFilter === 'RESOLVED' ? 'border-[#244A36] ring-2 ring-[#244A36]/25 bg-white/90' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5E7E67]">
              Resolved
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#244A36]/10 text-[#244A36] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#1C2826]">{resolvedCount}</span>
            <span className="text-xs font-semibold text-[#244A36]">Stabilized</span>
          </div>
          <span className="text-[10px] text-[#5E7E67] mt-2 block font-medium">Prototype Data</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. ALERT FILTERS & MAIN WORKSPACE                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE ALERTS & FILTERS */}
        <div className="flex-1 w-full flex flex-col gap-6">
          
          {/* Filters Bar */}
          <div className="liquid-glass rounded-2xl p-2 flex items-center gap-1 overflow-x-auto">
            <span className="text-[11px] font-bold text-[#5E7E67] uppercase tracking-wider px-3 flex items-center gap-1.5 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#244A36]" /> Filter:
            </span>
            {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'HIGH', 'SEVERE'] as FilterType[]).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? 'bg-[#244A36] text-[#FAF7F2] shadow-[0_2px_8px_rgba(36,74,54,0.25)]'
                    : 'text-[#3A4D43] hover:bg-white/80'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Alert Cards List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-[#1C2826] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#244A36]" />
                <span>Alert Queue ({filteredAlerts.length})</span>
              </h2>
              <span className="text-xs text-[#5E7E67]">Click card to inspect telemetry details</span>
            </div>

            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(alert => {
                const sevBadge = getSeverityBadgeStyle(alert.severity);
                const statBadge = getStatusBadgeStyle(alert.status);
                const isSelected = selectedAlert?.id === alert.id;

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`glass-card rounded-3xl p-6 cursor-pointer flex flex-col gap-4 relative overflow-hidden ${
                      isSelected ? 'border-[#244A36] ring-2 ring-[#244A36]/25 bg-white/95 shadow-md' : ''
                    }`}
                  >
                    {/* Top Row: Location, State, Badges */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-[#244A36]" />
                          <h3 className="text-xl font-bold text-[#1C2826] tracking-tight">{alert.location}</h3>
                          <span className="text-sm font-semibold text-[#5E7E67]">({alert.state})</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#5E7E67] block">ID: {alert.id} • {alert.detectedAt}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Severity Badge */}
                        <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase border flex items-center gap-1.5 backdrop-blur-md ${sevBadge.bg} ${sevBadge.text} ${sevBadge.border}`}>
                          <span className={`w-2 h-2 rounded-full ${sevBadge.dot} animate-pulse`} />
                          {alert.severity} RISK
                        </span>
                        {/* Status Badge */}
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border backdrop-blur-md ${statBadge.bg} ${statBadge.text} ${statBadge.border}`}>
                          {alert.status}
                        </span>
                      </div>
                    </div>

                    {/* Trigger Condition */}
                    <div className="p-3.5 glass-widget rounded-2xl text-xs text-[#2B3A33]">
                      <span className="font-bold text-[#1C2826] block mb-0.5">Environmental Trigger:</span>
                      <span className="font-medium">{alert.trigger}</span>
                    </div>

                    {/* Recommended Action */}
                    <div className="text-xs text-[#3A4D43] leading-relaxed font-medium">
                      <strong className="text-[#1C2826]">Recommended Action: </strong>
                      {alert.recommendedAction}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-3 border-t border-[#244A36]/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => handleViewOnMap(alert.locationId, e)}
                          className="text-xs font-bold text-[#244A36] hover:text-[#1B3828] flex items-center gap-1.5 hover:underline"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>View on Map</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {(alert.severity === 'HIGH' || alert.severity === 'SEVERE') && (
                          <button
                            type="button"
                            onClick={(e) => handleFindSaferRoute(alert.locationId, e)}
                            className="text-xs font-bold text-[#C87941] hover:text-[#A05C2C] flex items-center gap-1.5 hover:underline"
                          >
                            <Route className="w-3.5 h-3.5" />
                            <span>Find Safer Route</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {alert.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={(e) => handleAcknowledge(alert.id, e)}
                            className="px-4 py-2 glass-button-primary text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Acknowledge</span>
                          </button>
                        )}

                        {alert.status === 'ACKNOWLEDGED' && (
                          <button
                            type="button"
                            onClick={(e) => handleResolve(alert.id, e)}
                            className="px-4 py-2 bg-[#526E48] hover:bg-[#3D5236] text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedAlert(alert)}
                          className="px-3 py-2 glass-button text-[#1C2826] rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#5E7E67]" />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-card rounded-3xl p-12 text-center">
                <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center mx-auto mb-3 text-[#5E7E67]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1C2826] mb-1">No Alerts Found</h3>
                <p className="text-xs text-[#5E7E67]">No alerts matching the selected filter "{activeFilter}".</p>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 8. ALERT HISTORY SECTION (COLLAPSIBLE)                                    */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl border border-[#244A36]/15 p-6 shadow-sm">
            <div 
              onClick={() => setHistoryOpen(!historyOpen)}
              className="flex items-center justify-between cursor-pointer pb-2"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-[#244A36]" />
                <div>
                  <h3 className="text-base font-bold text-[#1C2826]">Alert History</h3>
                  <span className="text-xs text-[#5E7E67]">Archived resolved incidents ({resolvedAlerts.length})</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-[#5E7E67] bg-[#FAF7F2] px-2.5 py-1 rounded-full uppercase border border-[#244A36]/10">
                  Resolved Records
                </span>
                <ChevronDown className={`w-5 h-5 text-[#5E7E67] transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {historyOpen && (
              <div className="mt-4 pt-4 border-t border-[#244A36]/10 space-y-3">
                {/* Severity Filter for History */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-[#5E7E67] uppercase">Filter:</span>
                  {['ALL', 'LOW', 'MODERATE', 'HIGH', 'SEVERE'].map(sev => (
                    <button
                      key={sev}
                      onClick={() => setHistorySeverityFilter(sev)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        historySeverityFilter === sev ? 'bg-[#244A36] text-white' : 'bg-[#FAF7F2] text-[#5E7E67]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                {resolvedAlerts.length > 0 ? (
                  resolvedAlerts.map(h => (
                    <div 
                      key={h.id}
                      className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#244A36]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1C2826]">{h.location}, {h.state}</span>
                          <span className="text-[10px] font-mono text-[#5E7E67]">({h.id})</span>
                        </div>
                        <p className="text-[#5E7E67] text-[11px] mt-0.5">{h.trigger}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] font-bold text-[#244A36] bg-[#244A36]/10 px-2 py-0.5 rounded-full uppercase">
                          Resolved {h.resolvedAt}
                        </span>
                        <button
                          onClick={() => setSelectedAlert(h)}
                          className="text-[11px] font-bold text-[#244A36] hover:underline"
                        >
                          View Log
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#5E7E67] text-center py-4">No historical records matching filter.</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: 9. NER REGIONAL OVERVIEW + 6. SELECTED ALERT DETAILS */}
        <div className="w-full lg:w-[460px] flex-shrink-0 flex flex-col gap-6">
          
          {/* 9. NER ALERT OVERVIEW (8 STATES) */}
          <div className="liquid-glass rounded-3xl border border-white/60 p-6 shadow-lg shadow-[#244A36]/5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#244A36]/10">
              <h3 className="text-sm font-bold text-[#1C2826] flex items-center gap-2 uppercase tracking-wider">
                <Radio className="w-4 h-4 text-[#C87941] animate-pulse" /> NER Alert Overview
              </h3>
              <span className="text-[10px] font-bold text-[#C87941] bg-[#C87941]/10 px-2 py-0.5 rounded-full uppercase border border-[#C87941]/20">
                Prototype Status
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {NER_STATE_STATUSES.map(s => {
                const color = getStateStatusColor(s.status);
                return (
                  <div key={s.code} className="p-2.5 glass-card rounded-2xl border border-white/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#1C2826] block leading-tight">{s.state}</span>
                      <span className="text-[10px] text-[#5E7E67] font-medium">{s.code}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-black/5 ${color.bg} ${color.text}`}>
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-[#5E7E67] mt-3 italic text-center">
              Regional status aggregated from prototype IoT slope sensor nodes.
            </p>
          </div>

          {/* 6. ALERT DETAILS PANEL (IF SELECTED) */}
          {selectedAlert ? (
            <div className="liquid-glass rounded-3xl border border-white/70 p-6 shadow-xl shadow-[#244A36]/10 flex flex-col gap-5 sticky top-24">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#244A36]/10">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#5E7E67] uppercase block">{selectedAlert.id}</span>
                  <h3 className="text-2xl font-bold text-[#1C2826] tracking-tight">{selectedAlert.location}</h3>
                  <span className="text-xs font-semibold text-[#5E7E67]">{selectedAlert.state} • Sector Grid</span>
                </div>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="p-1.5 rounded-full bg-white/70 hover:bg-white text-[#1C2826] border border-white/60 shadow-sm transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status & Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 glass-card rounded-2xl border border-white/60">
                  <span className="text-[10px] font-bold text-[#5E7E67] uppercase block mb-0.5">Severity</span>
                  <span className="text-sm font-extrabold text-[#1C2826]">{selectedAlert.severity} RISK</span>
                </div>
                <div className="p-3 glass-card rounded-2xl border border-white/60">
                  <span className="text-[10px] font-bold text-[#5E7E67] uppercase block mb-0.5">Status</span>
                  <span className="text-sm font-extrabold text-[#244A36]">{selectedAlert.status}</span>
                </div>
              </div>

              {/* Trigger Factors Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider block">
                  Geotechnical Triggers
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 glass-card rounded-xl border border-white/50 flex items-center justify-between">
                    <span className="text-[#5E7E67] flex items-center gap-1.5 font-medium"><CloudRain className="w-3.5 h-3.5 text-[#244A36]" /> Rainfall</span>
                    <span className="font-bold text-[#1C2826]">{selectedAlert.factors.rainfall}</span>
                  </div>
                  <div className="p-2.5 glass-card rounded-xl border border-white/50 flex items-center justify-between">
                    <span className="text-[#5E7E67] flex items-center gap-1.5 font-medium"><Mountain className="w-3.5 h-3.5 text-[#244A36]" /> Slope</span>
                    <span className="font-bold text-[#1C2826]">{selectedAlert.factors.slope}</span>
                  </div>
                  <div className="p-2.5 glass-card rounded-xl border border-white/50 flex items-center justify-between">
                    <span className="text-[#5E7E67] flex items-center gap-1.5 font-medium"><Activity className="w-3.5 h-3.5 text-[#C87941]" /> Movement</span>
                    <span className="font-bold text-[#1C2826]">{selectedAlert.factors.groundMovement}</span>
                  </div>
                </div>
              </div>

              {/* 7. ALERT TIMELINE */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider block">
                  Alert Lifecycle Timeline
                </span>
                <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#244A36]/20">
                  {selectedAlert.timeline.map((event, idx) => (
                    <div key={idx} className="relative flex items-start gap-3 text-xs">
                      <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 -ml-[19px] mt-0.5 border-2 ${
                        event.completed 
                          ? 'bg-[#244A36] border-white ring-2 ring-[#244A36]/30' 
                          : event.active 
                            ? 'bg-[#C87941] border-white ring-2 ring-[#C87941]/30 animate-pulse' 
                            : 'bg-white border-[#5E7E67]/40'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${event.completed ? 'text-[#1C2826]' : event.active ? 'text-[#C87941]' : 'text-[#5E7E67]'}`}>
                            {event.step}
                          </span>
                          <span className="text-[10px] text-[#5E7E67] font-mono">{event.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-[#5E7E67] mt-0.5">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ALERT ESCALATION TIMELINE */}
              <AlertEscalationTimeline 
                alert={selectedAlert}
                onViewMap={(locId) => handleViewOnMap(locId)}
                onViewRisk={(locId) => handleViewRiskMonitoring(locId)}
                onViewAnalysis={() => handleViewAnalysis()}
              />

              {/* 13. NOTIFICATION MESSAGE PREVIEW */}
              <div className="p-4 glass-card rounded-2xl border border-white/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#C87941]" /> Dispatch Preview
                  </span>
                  <span className="text-[9px] font-bold text-[#C87941] bg-[#C87941]/10 px-2 py-0.5 rounded-md uppercase border border-[#C87941]/20">Sample Message</span>
                </div>

                <div className="p-3 bg-white/80 backdrop-blur-md rounded-xl border border-white/60 font-mono text-[11px] text-[#1C2826] leading-relaxed">
                  <strong>LANDSLIDE RISK ALERT</strong><br />
                  Location: {selectedAlert.location}, {selectedAlert.state}<br />
                  Risk Level: {selectedAlert.riskLevel}<br /><br />
                  Elevated environmental indicators detected.<br />
                  Please follow local disaster-management guidance.
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(selectedAlert)}
                    className="flex-1 py-2 bg-white/80 hover:bg-white text-[#1C2826] border border-white/60 shadow-sm rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Message</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Disaster communication template ready.')}
                    className="py-2 px-3 bg-white/80 hover:bg-white text-[#1C2826] border border-white/60 shadow-sm rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* EMERGENCY ASSISTANCE BOX (PROMINENT ON HIGH / SEVERE RISK) */}
              {(selectedAlert.severity === 'HIGH' || selectedAlert.severity === 'SEVERE') ? (
                <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
                  selectedAlert.severity === 'SEVERE'
                    ? 'bg-[#7A2E2E]/12 border-[#7A2E2E]/30 shadow-md shadow-[#7A2E2E]/10'
                    : 'bg-[#C87941]/10 border-[#C87941]/25'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                      selectedAlert.severity === 'SEVERE' ? 'text-[#7A2E2E]' : 'text-[#C87941]'
                    }`}>
                      <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                      Need Emergency Assistance?
                    </span>
                    <span className="text-[9.5px] font-bold text-[#5E7E67] bg-white/80 px-2 py-0.5 rounded-full border border-black/5 uppercase">
                      {selectedAlert.state}
                    </span>
                  </div>

                  <p className="text-xs text-[#2B3A33] font-medium leading-relaxed mb-3">
                    Contact the appropriate emergency service.
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="tel:112"
                      className="flex-1 min-w-[95px] py-2 px-3 bg-[#7A2E2E] hover:bg-[#602323] text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call 112</span>
                    </a>

                    <a
                      href="tel:1070"
                      className="flex-1 min-w-[95px] py-2 px-3 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call 1070</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setEmergencyModalState(selectedAlert.state);
                        setEmergencyModalOpen(true);
                      }}
                      className="py-2 px-3 bg-white/80 hover:bg-white text-[#1C2826] border border-white/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all hover:scale-105"
                    >
                      <span>All Helplines</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white/70 rounded-2xl border border-white/70 flex items-center justify-between text-xs">
                  <span className="text-[#5E7E67] font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#244A36]" /> Emergency Helplines
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmergencyModalState(selectedAlert.state);
                      setEmergencyModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-[#244A36] hover:underline"
                  >
                    View Official Numbers
                  </button>
                </div>
              )}

              {/* Panel Action Buttons */}
              <div className="pt-2 border-t border-[#244A36]/10 flex flex-col gap-2">
                {selectedAlert.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="w-full py-3 bg-[#244A36] text-[#FAF7F2] rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1B3828] active:scale-98 transition-all shadow-md shadow-[#244A36]/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Acknowledge Alert</span>
                  </button>
                )}

                {selectedAlert.status === 'ACKNOWLEDGED' && (
                  <button
                    type="button"
                    onClick={() => handleResolve(selectedAlert.id)}
                    className="w-full py-3 bg-[#526E48] text-[#FAF7F2] rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#3D5236] active:scale-98 transition-all shadow-md shadow-[#526E48]/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                )}

                {/* Find Safer Evacuation Route Action */}
                <button
                  type="button"
                  onClick={() => handleFindSaferRoute(selectedAlert.locationId)}
                  className="w-full py-2.5 bg-[#244A36] text-[#FAF7F2] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#1B3828] transition-all shadow-md shadow-[#244A36]/20 hover:scale-[1.02]"
                >
                  <Route className="w-3.5 h-3.5 text-[#FAF7F2]" />
                  <span>Find Safer Route</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewOnMap(selectedAlert.locationId)}
                    className="py-2.5 glass-button text-[#1C2826] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#244A36]" />
                    <span>View Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleViewRiskMonitoring(selectedAlert.locationId)}
                    className="py-2.5 bg-white/80 border border-[#244A36]/20 text-[#244A36] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white transition-all shadow-sm hover:scale-[1.02]"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Risk Analysis</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="liquid-glass rounded-3xl border border-white/60 p-8 text-center hidden lg:flex flex-col items-center justify-center shadow-lg shadow-[#244A36]/5">
              <div className="w-14 h-14 rounded-2xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-center mb-3 text-[#244A36]">
                <ShieldAlert className="w-7 h-7 text-[#244A36]/80" />
              </div>
              <h4 className="text-base font-bold text-[#1C2826] mb-1">Select an Alert</h4>
              <p className="text-xs text-[#5E7E67] max-w-xs leading-relaxed font-medium">
                Choose any active or acknowledged incident to inspect geotechnical trigger parameters, lifecycle timeline, and verified emergency helplines.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Emergency Contacts Modal */}
      <EmergencyContactsModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        defaultState={emergencyModalState}
      />

    </div>
  );
}
