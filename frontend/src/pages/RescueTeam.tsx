import { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Truck,
  MapPin,
  Users,
  Phone,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  RefreshCw,
  X,
  ShieldAlert,
  Navigation,
  Eye,
  Activity,
  Send,
  Zap,
  Map as MapIcon,
  UserCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { RescueTeam, RescueIncident, RescueTeamStatus } from '../data/rescueTeams';
import {
  getRescueTeams,
  assignRescueTeam,
  updateRescueTeamStatus,
  calculateRescueMetrics,
  resetRescueTeamsData,
} from '../services/rescueTeamService';
import { useRisk } from '../context/RiskContext';

// Helper to auto-fit map bounds to markers & polyline
function AutoFitBounds({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      if (coordinates.length === 1) {
        map.setView(coordinates[0], 12);
      } else {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [coordinates, map]);
  return null;
}

// Custom Leaflet Icons using SVG DivIcons for high visual polish
const createDivIcon = (type: 'team' | 'incident' | 'waypoint' | 'safe') => {
  let iconHtml = '';
  let className = 'custom-rescue-marker';

  if (type === 'team') {
    iconHtml = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:9999px;background:#244A36;border:2.5px solid #FAF7F2;box-shadow:0 4px 14px rgba(36,74,54,0.45);cursor:pointer;animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
        <span style="font-size:18px;line-height:1;">🚑</span>
      </div>
    `;
  } else if (type === 'incident') {
    iconHtml = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:9999px;background:#7A2E2E;border:2.5px solid #FAF7F2;box-shadow:0 4px 14px rgba(122,46,46,0.5);cursor:pointer;">
        <span style="font-size:17px;line-height:1;">⚠️</span>
      </div>
    `;
  } else if (type === 'safe') {
    iconHtml = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#526E48;border:2px solid #FAF7F2;box-shadow:0 3px 10px rgba(82,110,72,0.4);cursor:pointer;">
        <span style="font-size:15px;line-height:1;">🏛️</span>
      </div>
    `;
  } else {
    iconHtml = `
      <div style="width:14px;height:14px;border-radius:9999px;background:#C87941;border:2px solid #FAF7F2;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
    `;
  }

  return L.divIcon({
    html: iconHtml,
    className,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

export default function RescueTeamPage() {
  const { alerts, riskDataMap } = useRisk();

  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedTeam, setSelectedTeam] = useState<RescueTeam | null>(null);
  const [assignModalTeam, setAssignModalTeam] = useState<RescueTeam | null>(null);
  const [trackModalTeam, setTrackModalTeam] = useState<RescueTeam | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Load teams
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await getRescueTeams();
      setTeams(data);
    } catch (err) {
      console.error('Error loading rescue teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Compute metrics
  const metrics = useMemo(() => calculateRescueMetrics(teams), [teams]);

  // Derive active high/severe risk incidents from RiskContext
  const availableIncidentsFromContext = useMemo<RescueIncident[]>(() => {
    const highRiskLocations = Object.values(riskDataMap).filter(
      r => r.riskLevel === 'HIGH' || r.riskLevel === 'SEVERE'
    );

    return highRiskLocations.map((loc, idx) => {
      const activeAlert = alerts.find(a => a.locationId === loc.id);
      return {
        id: `inc-ctx-${loc.id}`,
        incidentCode: `Landslide Alert #${(idx + 1).toString().padStart(2, '0')}`,
        locationId: loc.id,
        locationName: `${loc.location} (${loc.state})`,
        district: loc.profile.location,
        state: loc.state,
        riskLevel: loc.riskLevel,
        riskScore: loc.riskScore,
        affectedPeople: Math.floor(loc.riskScore * 2.8) + 40,
        incidentType: activeAlert ? activeAlert.trigger : 'Slope Failure & High Rain Risk',
        evacuationRouteName: `Primary Corridor: ${loc.location} → Sector Safe Shelter`,
        coordinates: {
          lat: loc.profile.coordinates.lat,
          lng: loc.profile.coordinates.lng,
        },
        reportedAt: activeAlert ? activeAlert.detectedAt : 'Real-time telemetry',
        description: `Calculated landslide risk is ${loc.riskLevel} (${loc.riskScore}/100) driven by rainfall and geotechnical slope dynamics.`,
        recommendedSafeHaven: `${loc.location} District Community Relief Centre`,
      };
    });
  }, [riskDataMap, alerts]);

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      // Status filter
      if (activeFilter !== 'all' && team.status.toLowerCase().replace(' ', '-') !== activeFilter.toLowerCase()) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = team.name.toLowerCase().includes(q);
        const matchesLocation = team.currentLocation.name.toLowerCase().includes(q) || team.currentLocation.state.toLowerCase().includes(q);
        const matchesIncident = team.assignedIncident?.incidentCode.toLowerCase().includes(q) || team.assignedIncident?.locationName.toLowerCase().includes(q);
        const matchesLeader = team.leadOfficer.name.toLowerCase().includes(q);
        const matchesAgency = team.agency.toLowerCase().includes(q);
        if (!matchesName && !matchesLocation && !matchesIncident && !matchesLeader && !matchesAgency) {
          return false;
        }
      }

      return true;
    });
  }, [teams, activeFilter, searchQuery]);

  // Handle status update
  const handleStatusChange = async (teamId: string, newStatus: RescueTeamStatus) => {
    try {
      const updated = await updateRescueTeamStatus(teamId, newStatus);
      setTeams(prev => prev.map(t => (t.id === teamId ? updated : t)));
      
      if (selectedTeam?.id === teamId) setSelectedTeam(updated);
      if (trackModalTeam?.id === teamId) setTrackModalTeam(updated);

      showNotification(`Team status updated to "${newStatus}"`);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle assign incident
  const handleAssignIncident = async (teamId: string, incident: RescueIncident, etaMinutes: number) => {
    try {
      const updated = await assignRescueTeam(teamId, incident, etaMinutes);
      setTeams(prev => prev.map(t => (t.id === teamId ? updated : t)));
      setAssignModalTeam(null);
      showNotification(`Dispatched ${updated.name} to ${incident.incidentCode}!`);
      // Open tracking modal immediately for smooth flow
      setTrackModalTeam(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Reset to initial demo data
  const handleResetData = () => {
    const initial = resetRescueTeamsData();
    setTeams(initial);
    showNotification('Rescue team demo data reset to default.');
  };

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Status Badge Helper
  const getStatusBadge = (status: RescueTeamStatus) => {
    switch (status) {
      case 'Available':
        return {
          bg: 'bg-[#244A36]/10 text-[#244A36] border-[#244A36]/25',
          dot: 'bg-[#244A36]',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#244A36]" />
        };
      case 'En Route':
        return {
          bg: 'bg-[#C87941]/15 text-[#C87941] border-[#C87941]/30',
          dot: 'bg-[#C87941] animate-ping',
          icon: <Truck className="w-3.5 h-3.5 text-[#C87941]" />
        };
      case 'On Site':
        return {
          bg: 'bg-[#7A2E2E]/15 text-[#7A2E2E] border-[#7A2E2E]/30',
          dot: 'bg-[#7A2E2E]',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-[#7A2E2E]" />
        };
      case 'Completed':
        return {
          bg: 'bg-[#526E48]/15 text-[#526E48] border-[#526E48]/30',
          dot: 'bg-[#526E48]',
          icon: <UserCheck className="w-3.5 h-3.5 text-[#526E48]" />
        };
    }
  };

  // Risk Level Badge Helper
  const getRiskBadge = (level?: string) => {
    if (!level) return null;
    const l = level.toUpperCase();
    if (l === 'CRITICAL' || l === 'SEVERE') {
      return 'bg-[#7A2E2E]/15 text-[#7A2E2E] border-[#7A2E2E]/30';
    }
    if (l === 'HIGH') {
      return 'bg-[#C87941]/15 text-[#C87941] border-[#C87941]/30';
    }
    if (l === 'MODERATE') {
      return 'bg-[#8E804B]/15 text-[#8E804B] border-[#8E804B]/30';
    }
    return 'bg-[#244A36]/10 text-[#244A36] border-[#244A36]/20';
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto flex flex-col font-sans selection:bg-[#244A36]/20 animate-fade-in">
      
      {/* Toast Notification Banner */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1C2826] text-[#FAF7F2] shadow-xl border border-[#244A36]/40 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#526E48] animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold">{actionMessage}</span>
            <button 
              onClick={() => setActionMessage(null)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HEADER & DISPATCH LIFECYCLE INDICATOR                                  */}
      {/* ========================================================================= */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#244A36]/10">
        <div>
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass border border-[#244A36]/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#244A36] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#244A36]">
              Emergency Field Operations & Dispatch
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2826] tracking-tight flex items-center gap-3">
            <span>Rescue Team</span>
            <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-[#244A36]/10 text-[#244A36] border border-[#244A36]/20 font-semibold align-middle">
              NDRF & SDRF Coordination
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#5E7E67] font-medium mt-1 max-w-2xl">
            Real-time field response deployment, GPS route tracking, and incident task allocation connected to the ResQAI early warning grid.
          </p>
        </div>

        {/* Operational Lifecycle Pipeline Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-white/70 border border-[#244A36]/15 rounded-2xl p-2.5 sm:px-4 shadow-sm backdrop-blur-md">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#5E7E67] pr-1">
            Pipeline:
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C2826] flex-wrap">
            <span className="px-2 py-0.5 rounded-lg bg-[#244A36]/10 text-[#244A36]">1. Detect</span>
            <ArrowRight className="w-3 h-3 text-[#5E7E67]" />
            <span className="px-2 py-0.5 rounded-lg bg-[#C87941]/15 text-[#C87941]">2. Alert</span>
            <ArrowRight className="w-3 h-3 text-[#5E7E67]" />
            <span className="px-2 py-0.5 rounded-lg bg-[#244A36] text-[#FAF7F2] shadow-xs">3. Assign</span>
            <ArrowRight className="w-3 h-3 text-[#5E7E67]" />
            <span className="px-2 py-0.5 rounded-lg bg-[#244A36]/10 text-[#244A36]">4. Track</span>
            <ArrowRight className="w-3 h-3 text-[#5E7E67]" />
            <span className="px-2 py-0.5 rounded-lg bg-[#526E48]/20 text-[#526E48]">5. Rescue</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OVERVIEW SUMMARY CARDS                                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 1. Available Teams */}
        <div className="glass-card rounded-2xl p-5 border border-[#244A36]/15 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E7E67]">Available Teams</span>
            <div className="w-9 h-9 rounded-xl bg-[#244A36]/10 flex items-center justify-center text-[#244A36]">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-[#1C2826] tracking-tight">
              {metrics.available}
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#244A36]/10 text-[#244A36]">
              Standby & Ready
            </span>
          </div>
          <div className="mt-2 text-[11.5px] text-[#5E7E67] font-medium">
            Equipped for rapid deployment in NER sector
          </div>
        </div>

        {/* 2. Teams En Route */}
        <div className="glass-card rounded-2xl p-5 border border-[#C87941]/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C87941]">Teams En Route</span>
            <div className="w-9 h-9 rounded-xl bg-[#C87941]/15 flex items-center justify-center text-[#C87941]">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-[#1C2826] tracking-tight">
              {metrics.enRoute}
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#C87941]/15 text-[#C87941] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C87941] animate-ping" />
              In Transit
            </span>
          </div>
          <div className="mt-2 text-[11.5px] text-[#5E7E67] font-medium">
            Active GPS telemetry & route navigation
          </div>
        </div>

        {/* 3. Teams On Site */}
        <div className="glass-card rounded-2xl p-5 border border-[#7A2E2E]/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A2E2E]">Teams On Site</span>
            <div className="w-9 h-9 rounded-xl bg-[#7A2E2E]/15 flex items-center justify-center text-[#7A2E2E]">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-[#1C2826] tracking-tight">
              {metrics.onSite}
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#7A2E2E]/15 text-[#7A2E2E]">
              Active Ops
            </span>
          </div>
          <div className="mt-2 text-[11.5px] text-[#5E7E67] font-medium">
            Conducting search, medical triage & extraction
          </div>
        </div>

        {/* 4. Active Rescue Operations */}
        <div className="glass-card rounded-2xl p-5 border border-[#244A36]/15 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1C2826]">Active Operations</span>
            <div className="w-9 h-9 rounded-xl bg-[#244A36] text-[#FAF7F2] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-[#1C2826] tracking-tight">
              {metrics.activeOperations}
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#244A36]/10 text-[#244A36]">
              Assigned Tasks
            </span>
          </div>
          <div className="mt-2 text-[11.5px] text-[#5E7E67] font-medium">
            Connected with real-time High / Severe alerts
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONNECTED RISK MONITORING DISPATCH STRIP                              */}
      {/* ========================================================================= */}
      {availableIncidentsFromContext.length > 0 && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#7A2E2E]/10 via-[#C87941]/10 to-[#FAF7F2] border border-[#C87941]/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#7A2E2E] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A2E2E]">
                  Live Risk Engine Sync
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-[#7A2E2E] text-white">
                  {availableIncidentsFromContext.length} Critical Zones Detected
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#1C2826] mt-0.5">
                Active high-hazard landslide threats in North-East sectors requiring rescue coordination.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {teams.some(t => t.status === 'Available') ? (
              <button
                type="button"
                onClick={() => {
                  const availableTeam = teams.find(t => t.status === 'Available');
                  if (availableTeam) setAssignModalTeam(availableTeam);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#244A36] text-[#FAF7F2] text-xs font-bold hover:bg-[#1B3828] transition-all shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-[#A3C7AD]" />
                <span>Quick Dispatch Available Team</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-[#5E7E67] italic">
                All units deployed or occupied
              </span>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONTROLS, SEARCH & FILTER TABS                                        */}
      {/* ========================================================================= */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Teams', count: teams.length },
            { id: 'available', label: 'Available', count: metrics.available },
            { id: 'en-route', label: 'En Route', count: metrics.enRoute },
            { id: 'on-site', label: 'On Site', count: metrics.onSite },
            { id: 'completed', label: 'Completed', count: metrics.completed },
          ].map(tab => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#244A36] text-[#FAF7F2] shadow-sm'
                    : 'bg-white/80 hover:bg-[#244A36]/8 text-[#2B3A33] border border-[#244A36]/15'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/25 text-[#FAF7F2]' : 'bg-[#244A36]/10 text-[#244A36]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Search & Reset */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#5E7E67] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team, incident, sector..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 border border-[#244A36]/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1C2826] placeholder-[#5E7E67] focus:outline-none focus:ring-2 focus:ring-[#244A36]/30 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5E7E67] hover:text-[#1C2826]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchTeams}
            title="Refresh Teams Data"
            className="p-2 rounded-xl bg-white/80 hover:bg-[#244A36]/10 text-[#244A36] border border-[#244A36]/20 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetData}
            title="Reset Demo Dataset"
            className="px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-[#7A2E2E]/10 text-[#7A2E2E] border border-[#7A2E2E]/20 text-[11px] font-bold transition-all"
          >
            Reset Demo
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RESCUE TEAMS LIST (RESPONSIVE TABLE + CARDS)                           */}
      {/* ========================================================================= */}
      <div className="glass-card rounded-2xl border border-[#244A36]/15 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#5E7E67]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#244A36] mb-3" />
            <span className="text-sm font-semibold">Loading rescue units telemetry...</span>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="py-16 text-center text-[#5E7E67]">
            <Shield className="w-8 h-8 mx-auto text-[#5E7E67]/50 mb-2" />
            <p className="text-sm font-bold text-[#1C2826]">No rescue teams match your filter</p>
            <p className="text-xs mt-1">Try selecting "All Teams" or clearing search terms.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#244A36]/10 bg-[#244A36]/5 text-[11.5px] uppercase tracking-wider font-bold text-[#5E7E67]">
                    <th className="py-3.5 px-5">Team / Agency</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Current Location</th>
                    <th className="py-3.5 px-4">Assigned Incident</th>
                    <th className="py-3.5 px-4">Risk / Impact</th>
                    <th className="py-3.5 px-4">Lead Officer & Telemetry</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#244A36]/10 text-xs text-[#1C2826]">
                  {filteredTeams.map(team => {
                    const statusBadge = getStatusBadge(team.status);
                    const riskBadgeClass = getRiskBadge(team.assignedIncident?.riskLevel);

                    return (
                      <tr key={team.id} className="hover:bg-white/60 transition-colors group">
                        {/* Team */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#244A36]/10 text-[#244A36] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#244A36] group-hover:text-[#FAF7F2] transition-colors">
                              {team.callSign.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-[#1C2826] flex items-center gap-2">
                                <span>{team.name}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#244A36]/10 text-[#244A36]">
                                  {team.agency}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#5E7E67] font-medium flex items-center gap-1 mt-0.5">
                                <Users className="w-3 h-3" />
                                <span>{team.membersCount} Specialists</span>
                                <span>•</span>
                                <span className="truncate max-w-[170px]">{team.specialization}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge.bg}`}>
                            {statusBadge.icon}
                            <span>{team.status}</span>
                          </span>
                        </td>

                        {/* Current Location */}
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#244A36] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold block text-[#1C2826]">{team.currentLocation.name}</span>
                              <span className="text-[10.5px] text-[#5E7E67]">{team.currentLocation.state}</span>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Incident */}
                        <td className="py-4 px-4">
                          {team.assignedIncident ? (
                            <div>
                              <span className="font-bold text-[#1C2826] block flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-[#C87941]" />
                                {team.assignedIncident.incidentCode}
                              </span>
                              <span className="text-[11px] text-[#5E7E67] block truncate max-w-[190px]">
                                {team.assignedIncident.locationName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#5E7E67]/70 font-medium italic">
                              — No incident assigned —
                            </span>
                          )}
                        </td>

                        {/* Risk / Impact */}
                        <td className="py-4 px-4">
                          {team.assignedIncident ? (
                            <div className="flex flex-col items-start gap-1">
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${riskBadgeClass}`}>
                                {team.assignedIncident.riskLevel} Risk ({team.assignedIncident.riskScore}/100)
                              </span>
                              <span className="text-[10.5px] text-[#5E7E67] font-medium">
                                ~{team.assignedIncident.affectedPeople} affected
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#5E7E67]/70 font-medium">—</span>
                          )}
                        </td>

                        {/* Lead Officer & Telemetry */}
                        <td className="py-4 px-4">
                          <div>
                            <span className="font-bold text-[#1C2826] block">{team.leadOfficer.name}</span>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-[#5E7E67] font-medium mt-0.5">
                              <Radio className="w-3 h-3 text-[#244A36]" />
                              <span>{team.leadOfficer.radioCall}</span>
                            </div>
                            {team.etaMinutes !== undefined && team.status === 'En Route' && (
                              <div className="mt-1 flex items-center gap-1 text-[10.5px] font-bold text-[#C87941]">
                                <Clock className="w-3 h-3" />
                                <span>ETA: {team.etaMinutes} mins ({team.speedKmh} km/h)</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {team.status === 'Available' && (
                              <button
                                type="button"
                                onClick={() => setAssignModalTeam(team)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#244A36] text-[#FAF7F2] text-xs font-bold hover:bg-[#1B3828] transition-all shadow-xs"
                              >
                                <Send className="w-3 h-3" />
                                <span>Assign</span>
                              </button>
                            )}

                            {(team.status === 'En Route' || team.status === 'On Site') && (
                              <button
                                type="button"
                                onClick={() => setTrackModalTeam(team)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#C87941] text-[#FAF7F2] text-xs font-bold hover:bg-[#B06733] transition-all shadow-xs"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>Track</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedTeam(team)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-[#244A36]/10 text-[#244A36] border border-[#244A36]/20 text-xs font-bold transition-all"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="lg:hidden divide-y divide-[#244A36]/10">
              {filteredTeams.map(team => {
                const statusBadge = getStatusBadge(team.status);
                const riskBadgeClass = getRiskBadge(team.assignedIncident?.riskLevel);

                return (
                  <div key={team.id} className="p-4 sm:p-5 flex flex-col gap-3.5 hover:bg-white/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#244A36]/10 text-[#244A36] flex items-center justify-center font-bold text-xs shrink-0">
                          {team.callSign.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#1C2826]">{team.name}</div>
                          <span className="text-[10px] text-[#5E7E67] font-semibold">{team.agency} • {team.membersCount} Members</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge.bg}`}>
                        {statusBadge.icon}
                        <span>{team.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white/50 p-2.5 rounded-xl border border-[#244A36]/10">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">Location</span>
                        <span className="font-semibold text-[#1C2826] truncate block">{team.currentLocation.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">Lead Officer</span>
                        <span className="font-semibold text-[#1C2826] truncate block">{team.leadOfficer.name}</span>
                      </div>
                    </div>

                    {team.assignedIncident && (
                      <div className="p-3 rounded-xl bg-[#7A2E2E]/5 border border-[#7A2E2E]/15 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#7A2E2E] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {team.assignedIncident.incidentCode}
                          </span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.2 rounded-full border ${riskBadgeClass}`}>
                            {team.assignedIncident.riskLevel}
                          </span>
                        </div>
                        <p className="text-[#5E7E67] text-[11px] font-medium">{team.assignedIncident.locationName}</p>
                        {team.etaMinutes !== undefined && team.status === 'En Route' && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#C87941]">
                            <Clock className="w-3 h-3" />
                            <span>ETA: {team.etaMinutes} mins ({team.speedKmh} km/h)</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {team.status === 'Available' && (
                        <button
                          type="button"
                          onClick={() => setAssignModalTeam(team)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-[#244A36] text-[#FAF7F2] text-xs font-bold shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                      )}

                      {(team.status === 'En Route' || team.status === 'On Site') && (
                        <button
                          type="button"
                          onClick={() => setTrackModalTeam(team)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-[#C87941] text-[#FAF7F2] text-xs font-bold shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Track Team</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedTeam(team)}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-white/80 text-[#244A36] border border-[#244A36]/20 text-xs font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. VIEW RESCUE TEAM DOSSIER MODAL                                         */}
      {/* ========================================================================= */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl p-6 shadow-2xl border border-[#244A36]/20 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#244A36]/10 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#244A36]/10 text-[#244A36]">
                    {selectedTeam.agency} Disaster Division
                  </span>
                  <span className="text-xs font-bold text-[#5E7E67]">
                    Call Sign: {selectedTeam.callSign}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[#1C2826]">{selectedTeam.name}</h2>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-1.5 rounded-full hover:bg-[#244A36]/10 text-[#5E7E67] hover:text-[#1C2826] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Switcher Strip */}
            <div className="mb-5 p-3 rounded-2xl bg-white/80 border border-[#244A36]/15 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5E7E67]">Current Status:</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(selectedTeam.status).bg}`}>
                  {selectedTeam.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#5E7E67] mr-1">Change:</span>
                {(['Available', 'En Route', 'On Site', 'Completed'] as RescueTeamStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(selectedTeam.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      selectedTeam.status === st
                        ? 'bg-[#244A36] text-[#FAF7F2]'
                        : 'bg-white hover:bg-[#244A36]/10 text-[#2B3A33] border border-[#244A36]/15'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Assigned Incident Section */}
            {selectedTeam.assignedIncident ? (
              <div className="mb-5 p-4 rounded-2xl bg-[#7A2E2E]/5 border border-[#7A2E2E]/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7A2E2E] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7A2E2E]">
                      Assigned Rescue Operation
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getRiskBadge(selectedTeam.assignedIncident.riskLevel)}`}>
                    {selectedTeam.assignedIncident.riskLevel} Risk ({selectedTeam.assignedIncident.riskScore}/100)
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1C2826] mb-1">
                  {selectedTeam.assignedIncident.incidentCode}: {selectedTeam.assignedIncident.incidentType}
                </h3>
                <p className="text-xs text-[#5E7E67] mb-3">
                  {selectedTeam.assignedIncident.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/70 p-3 rounded-xl border border-[#244A36]/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">Affected Population</span>
                    <span className="font-bold text-[#1C2826]">~{selectedTeam.assignedIncident.affectedPeople} Persons at Risk</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">Recommended Evacuation Route</span>
                    <span className="font-semibold text-[#244A36]">{selectedTeam.assignedIncident.evacuationRouteName}</span>
                  </div>
                  <div className="sm:col-span-2 pt-1 border-t border-[#244A36]/10">
                    <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">Designated Safe Haven</span>
                    <span className="font-semibold text-[#1C2826]">{selectedTeam.assignedIncident.recommendedSafeHaven}</span>
                  </div>
                </div>

                {selectedTeam.etaMinutes !== undefined && selectedTeam.status === 'En Route' && (
                  <div className="mt-3 flex items-center justify-between bg-[#C87941]/10 p-2.5 rounded-xl border border-[#C87941]/20 text-xs font-bold text-[#C87941]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Estimated Arrival Time (ETA):</span>
                    </div>
                    <span>{selectedTeam.etaMinutes} minutes ({selectedTeam.speedKmh} km/h)</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-5 p-4 rounded-2xl bg-white/70 border border-[#244A36]/15 text-center text-[#5E7E67]">
                <Shield className="w-6 h-6 mx-auto mb-1 text-[#244A36]" />
                <p className="text-xs font-bold text-[#1C2826]">Team Alpha is currently in Standby</p>
                <p className="text-[11px] mt-0.5">Ready for immediate dispatch to any high risk zone in NER.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeam(null);
                    setAssignModalTeam(selectedTeam);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#244A36] text-[#FAF7F2] text-xs font-bold hover:bg-[#1B3828] transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch This Team</span>
                </button>
              </div>
            )}

            {/* Team Telemetry & Officer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="p-3.5 rounded-2xl bg-white/70 border border-[#244A36]/15">
                <span className="text-[10.5px] uppercase font-bold text-[#5E7E67] block mb-2">Officer-in-Charge</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#244A36] text-[#FAF7F2] flex items-center justify-center font-extrabold text-sm">
                    {selectedTeam.leadOfficer.name.split(' ').pop()?.slice(0, 2) || 'LE'}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#1C2826] block">{selectedTeam.leadOfficer.name}</span>
                    <span className="text-xs text-[#5E7E67]">{selectedTeam.leadOfficer.rank}</span>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-[#244A36]">
                      <Phone className="w-3 h-3" />
                      <span>{selectedTeam.leadOfficer.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 border border-[#244A36]/15">
                <span className="text-[10.5px] uppercase font-bold text-[#5E7E67] block mb-2">Field Telemetry</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5E7E67]">Radio Comms:</span>
                    <span className="font-bold text-[#1C2826]">{selectedTeam.leadOfficer.radioCall}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5E7E67]">Vehicles:</span>
                    <span className="font-semibold text-[#1C2826] truncate max-w-[170px]">{selectedTeam.vehicleType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5E7E67]">Telemetry:</span>
                    <span className="font-semibold text-[#244A36] truncate max-w-[170px]">{selectedTeam.lastTelemetryUpdate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Roster */}
            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E7E67] mb-2 flex items-center justify-between">
                <span>Team Members ({selectedTeam.membersCount} Specialists)</span>
                <span className="text-[10px] text-[#244A36]">Certified Response Unit</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {selectedTeam.members.map(m => (
                  <div key={m.id} className="p-2 rounded-xl bg-white/60 border border-[#244A36]/10 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#1C2826] block">{m.name}</span>
                      <span className="text-[10px] text-[#5E7E67]">{m.role}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#244A36]/10 text-[#244A36] font-semibold">
                      {m.skills[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Kit */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E7E67] mb-2">Equipped Response Gear</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedTeam.equipment.map((eq, i) => (
                  <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/80 border border-[#244A36]/15 text-[#1C2826]">
                    ✓ {eq}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#244A36]/10">
              {(selectedTeam.status === 'En Route' || selectedTeam.status === 'On Site') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeam(null);
                    setTrackModalTeam(selectedTeam);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#C87941] text-[#FAF7F2] text-xs font-bold hover:bg-[#B06733] transition-all flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open Live Map Track</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="px-4 py-2 rounded-xl bg-white/80 border border-[#244A36]/20 text-xs font-bold text-[#1C2826] hover:bg-[#244A36]/10 transition-all"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ASSIGN INCIDENT MODAL                                                  */}
      {/* ========================================================================= */}
      {assignModalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-[#FAF7F2] rounded-3xl p-6 shadow-2xl border border-[#244A36]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#244A36]/10 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#244A36] text-white">
                    Mission Dispatch
                  </span>
                  <span className="text-xs font-bold text-[#5E7E67]">{assignModalTeam.name}</span>
                </div>
                <h2 className="text-xl font-bold text-[#1C2826]">Assign Rescue Operation</h2>
              </div>
              <button
                onClick={() => setAssignModalTeam(null)}
                className="p-1.5 rounded-full hover:bg-[#244A36]/10 text-[#5E7E67] hover:text-[#1C2826]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5E7E67] mb-4">
              Select an active landslide hazard incident from the early warning grid to deploy <strong>{assignModalTeam.name}</strong>.
            </p>

            {/* List of Available Incidents */}
            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
              {availableIncidentsFromContext.map(incident => (
                <div
                  key={incident.id}
                  className="p-3.5 rounded-2xl bg-white/80 border border-[#244A36]/15 hover:border-[#244A36]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-[#1C2826]">{incident.incidentCode}</span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.2 rounded-full border ${getRiskBadge(incident.riskLevel)}`}>
                        {incident.riskLevel} ({incident.riskScore}/100)
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#244A36]">{incident.locationName}</p>
                    <p className="text-[11px] text-[#5E7E67] mt-0.5">~{incident.affectedPeople} persons at risk • {incident.incidentType}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAssignIncident(assignModalTeam.id, incident, 18)}
                    className="px-3.5 py-2 rounded-xl bg-[#244A36] text-[#FAF7F2] text-xs font-bold hover:bg-[#1B3828] transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Deploy Unit</span>
                  </button>
                </div>
              ))}

              {/* Preset Kohima Incident Option if context is empty */}
              {availableIncidentsFromContext.length === 0 && (
                <div className="p-3.5 rounded-2xl bg-white/80 border border-[#244A36]/15 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-[#1C2826]">Landslide #01 — Kohima NH-29 Bypass</span>
                    <span className="text-[10px] font-bold text-[#7A2E2E] block">HIGH Risk (78/100) • 120 affected</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAssignIncident(assignModalTeam.id, {
                      id: 'inc-preset-1',
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
                      coordinates: { lat: 25.6751, lng: 94.1086 },
                      reportedAt: 'Just now',
                      description: 'Active mudflow obstructing NH-29 corridor.',
                      recommendedSafeHaven: 'Kohima Regional Indoor Stadium Evacuation Centre',
                    }, 18)}
                    className="px-3 py-1.5 rounded-xl bg-[#244A36] text-[#FAF7F2] text-xs font-bold"
                  >
                    Deploy
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#244A36]/10">
              <button
                type="button"
                onClick={() => setAssignModalTeam(null)}
                className="px-4 py-2 rounded-xl bg-white/80 border border-[#244A36]/20 text-xs font-bold text-[#1C2826]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. INTERACTIVE LEAFLET TRACKING MODAL                                     */}
      {/* ========================================================================= */}
      {trackModalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#244A36]/20 max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-[#244A36]/10 mb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C87941] animate-ping" />
                  <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#C87941]">
                    Live GPS Telemetry & Evacuation Route
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C2826] flex items-center gap-2">
                  <span>{trackModalTeam.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#244A36]/10 text-[#244A36]">
                    {trackModalTeam.callSign}
                  </span>
                </h2>
              </div>
              <button
                onClick={() => setTrackModalTeam(null)}
                className="p-1.5 rounded-full hover:bg-[#244A36]/10 text-[#5E7E67] hover:text-[#1C2826]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5 shrink-0 text-xs bg-white/70 p-3 rounded-2xl border border-[#244A36]/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">Status</span>
                <span className="font-bold text-[#1C2826]">{trackModalTeam.status}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">ETA to Target</span>
                <span className="font-bold text-[#C87941]">
                  {trackModalTeam.etaMinutes !== undefined ? `${trackModalTeam.etaMinutes} mins` : 'On Scene'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">Convoy Speed</span>
                <span className="font-bold text-[#244A36]">{trackModalTeam.speedKmh || 0} km/h</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5E7E67] block">Assigned Incident</span>
                <span className="font-bold text-[#7A2E2E] truncate block">
                  {trackModalTeam.assignedIncident?.incidentCode || 'General Patrol'}
                </span>
              </div>
            </div>

            {/* Interactive Leaflet Tracking Map */}
            <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden border border-[#244A36]/20 shadow-inner z-10 shrink-0">
              <MapContainer
                center={[trackModalTeam.currentLocation.lat, trackModalTeam.currentLocation.lng]}
                zoom={10}
                style={{ width: '100%', height: '100%' }}
                className="z-10"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Team Location Marker */}
                <Marker
                  position={[trackModalTeam.currentLocation.lat, trackModalTeam.currentLocation.lng]}
                  icon={createDivIcon('team')}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <p className="font-bold text-[#244A36]">{trackModalTeam.name}</p>
                      <p className="text-[#5E7E67]">{trackModalTeam.currentLocation.name}</p>
                      <p className="text-[10px] font-bold mt-1 text-[#C87941]">
                        Speed: {trackModalTeam.speedKmh} km/h
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* Assigned Incident Marker */}
                {trackModalTeam.assignedIncident && (
                  <Marker
                    position={[
                      trackModalTeam.assignedIncident.coordinates.lat,
                      trackModalTeam.assignedIncident.coordinates.lng,
                    ]}
                    icon={createDivIcon('incident')}
                  >
                    <Popup>
                      <div className="p-1 text-xs">
                        <p className="font-bold text-[#7A2E2E]">
                          {trackModalTeam.assignedIncident.incidentCode}
                        </p>
                        <p className="text-[#1C2826]">
                          {trackModalTeam.assignedIncident.locationName}
                        </p>
                        <p className="text-[10px] text-[#5E7E67] mt-1">
                          Affected: ~{trackModalTeam.assignedIncident.affectedPeople} persons
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route Polyline */}
                {trackModalTeam.routeCoordinates && trackModalTeam.routeCoordinates.length > 1 && (
                  <Polyline
                    positions={trackModalTeam.routeCoordinates}
                    color="#244A36"
                    weight={4}
                    dashArray="6, 6"
                    opacity={0.85}
                  />
                )}

                {/* AutoFit Bounds */}
                {trackModalTeam.routeCoordinates && (
                  <AutoFitBounds coordinates={trackModalTeam.routeCoordinates} />
                )}
              </MapContainer>

              {/* Map Floating Legend */}
              <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md p-2 rounded-xl border border-[#244A36]/15 shadow-md text-[11px] font-semibold space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#244A36]" />
                  <span>Rescue Team</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7A2E2E]" />
                  <span>Incident Ground</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-[#244A36]" />
                  <span>Safe Access Route</span>
                </div>
              </div>
            </div>

            {/* Waypoint Steps & Actions */}
            <div className="mt-4 pt-3 border-t border-[#244A36]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-[#5E7E67] flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#244A36]" />
                <span>
                  Route: <strong>{trackModalTeam.assignedIncident?.evacuationRouteName || 'Direct Corridor'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    // Navigate to full LiveMap with this location
                    if (trackModalTeam.assignedIncident?.locationId) {
                      window.history.pushState({}, '', `/live-map?location=${trackModalTeam.assignedIncident.locationId}`);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 border border-[#244A36]/20 text-xs font-bold text-[#244A36] hover:bg-[#244A36]/10 transition-all"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>View in Full Live Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTrackModalTeam(null)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#244A36] text-[#FAF7F2] text-xs font-bold hover:bg-[#1B3828] transition-all"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
