import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Info,
  ChevronDown,
  LocateFixed,
  Route,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { SAFE_DESTINATIONS, SafeLocation, getSafeDestinationsByState } from '../../data/safeLocations';
import { MapLocationData } from '../../services/riskCalculationService';
import { NER_STATES, NERState } from '../../data/nerStates';
import { EvacuationCalculationResult, RouteCoordinate } from '../../services/routeService';

export interface StartLocationOption {
  id: string;
  name: string;
  state?: string;
  coordinates: RouteCoordinate;
  source: 'ner-monitored' | 'geolocation' | 'custom';
}

interface EvacuationPanelProps {
  locations: MapLocationData[];
  initialStartId?: string | null;
  onCalculateRoute: (start: StartLocationOption, destination: SafeLocation) => Promise<void>;
  onClearRoute: () => void;
  isLoading: boolean;
  activeResult: EvacuationCalculationResult | null;
  onClose?: () => void;
}

export default function EvacuationPanel({
  locations,
  initialStartId,
  onCalculateRoute,
  onClearRoute,
  isLoading,
  activeResult,
  onClose,
}: EvacuationPanelProps) {
  // State for selections
  const [startType, setStartType] = useState<'preset' | 'geolocation'>('preset');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    initialStartId || (locations[0]?.id || 'kohima')
  );
  const [customStart, setCustomStart] = useState<StartLocationOption | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Safe Destination selection
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>(
    SAFE_DESTINATIONS[0]?.id || 'safe-nld-001'
  );

  // Dropdown states
  const [startDropdownOpen, setStartDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);

  // Sync initialStartId prop
  useEffect(() => {
    if (initialStartId) {
      const match = locations.find(l => l.id.toLowerCase() === initialStartId.toLowerCase());
      if (match) {
        setSelectedLocationId(match.id);
        setStartType('preset');
        // If match belongs to a state, auto-filter destination to that state
        const matchingStateDest = SAFE_DESTINATIONS.find(
          (d: SafeLocation) => d.state.toLowerCase() === match.state.toLowerCase()
        );
        if (matchingStateDest) {
          setSelectedStateFilter(match.state);
          setSelectedDestinationId(matchingStateDest.id);
        }
      }
    }
  }, [initialStartId, locations]);

  // Filtered destinations
  const availableDestinations = getSafeDestinationsByState(selectedStateFilter);

  // Resolve active start object
  const currentStartOption: StartLocationOption = (() => {
    if (startType === 'geolocation' && customStart) {
      return customStart;
    }
    const loc = locations.find(l => l.id === selectedLocationId) || locations[0];
    if (loc) {
      return {
        id: loc.id,
        name: `${loc.name}, ${loc.state}`,
        state: loc.state,
        coordinates: { lat: loc.coordinates.lat, lng: loc.coordinates.lng },
        source: 'ner-monitored',
      };
    }
    return {
      id: 'kohima',
      name: 'Kohima, Nagaland',
      state: 'Nagaland',
      coordinates: { lat: 25.6751, lng: 94.1086 },
      source: 'ner-monitored',
    };
  })();

  const currentDestination =
    SAFE_DESTINATIONS.find((d: SafeLocation) => d.id === selectedDestinationId) || SAFE_DESTINATIONS[0];

  // Geolocation handler
  const handleRequestGeolocation = () => {
    setGeoLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Location access unavailable on this browser. Please select manually.');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geoStart: StartLocationOption = {
          id: 'user-current-gps',
          name: 'My Current Location (GPS)',
          coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          source: 'geolocation',
        };
        setCustomStart(geoStart);
        setStartType('geolocation');
        setGeoLoading(false);
      },
      (err) => {
        let msg = 'Location access unavailable. Please select a starting location manually.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location access unavailable. Please select a starting location manually.';
        }
        setGeoError(msg);
        setGeoLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleCalculate = () => {
    if (!currentStartOption || !currentDestination) return;
    onCalculateRoute(currentStartOption, currentDestination);
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Header with Prototype & Status Badge */}
      <div className="flex items-start justify-between pb-3 border-b border-[#244A36]/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#244A36]/10 border border-[#244A36]/20 mb-2">
            <Route className="w-3.5 h-3.5 text-[#244A36]" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#244A36]">
              Risk-Aware Evacuation Route — Prototype
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C2826] tracking-tight flex items-center gap-2">
            Safe Evacuation Route
          </h2>
          <p className="text-xs text-[#5E7E67] font-medium mt-0.5">
            Find a route that avoids high-risk landslide areas.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full liquid-glass text-[#5E7E67] hover:text-[#1C2826] transition-colors"
            title="Close evacuation panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── 1. Starting Location Selector ─────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#244A36]" />
            From:
          </span>
          <span className="text-[10px] text-[#244A36] font-semibold">Select starting location</span>
        </label>

        {/* Start Selection Input Container */}
        <div className="space-y-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setStartDropdownOpen(!startDropdownOpen)}
              className="w-full text-left p-3 rounded-2xl bg-white/70 hover:bg-white border border-[#244A36]/15 flex items-center justify-between transition-all shadow-sm focus:ring-2 focus:ring-[#244A36]/25"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-xl bg-[#244A36]/10 flex items-center justify-center shrink-0">
                  {startType === 'geolocation' ? (
                    <LocateFixed className="w-3.5 h-3.5 text-[#244A36]" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-[#244A36]" />
                  )}
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-[#1C2826] block truncate">
                    {currentStartOption.name}
                  </span>
                  <span className="text-[10px] text-[#5E7E67]">
                    Lat: {currentStartOption.coordinates.lat.toFixed(4)}, Lng: {currentStartOption.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#5E7E67] transition-transform ${startDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Start Dropdown */}
            {startDropdownOpen && (
              <div
                className="absolute top-full mt-2 left-0 right-0 liquid-glass-modal rounded-2xl p-1.5 z-40 max-h-60 overflow-y-auto shadow-xl"
                onMouseLeave={() => setStartDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider border-b border-[#244A36]/10">
                  NER Monitored Locations
                </div>
                {locations.map((loc: MapLocationData) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocationId(loc.id);
                      setStartType('preset');
                      setStartDropdownOpen(false);
                      // Auto align destination state
                      const matchDest = SAFE_DESTINATIONS.find(
                        (d: SafeLocation) => d.state.toLowerCase() === loc.state.toLowerCase()
                      );
                      if (matchDest) {
                        setSelectedStateFilter(loc.state);
                        setSelectedDestinationId(matchDest.id);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      startType === 'preset' && selectedLocationId === loc.id
                        ? 'bg-[#244A36]/10 text-[#244A36] font-bold'
                        : 'text-[#1C2826] hover:bg-white/80'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{loc.name}</span>
                      <span className="text-[10px] text-[#5E7E67]">{loc.state}</span>
                    </div>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                      style={{
                        backgroundColor: loc.riskLevel === 'SEVERE' ? '#7A2E2E18' : loc.riskLevel === 'HIGH' ? '#A05C2C18' : '#244A3618',
                        color: loc.riskLevel === 'SEVERE' ? '#7A2E2E' : loc.riskLevel === 'HIGH' ? '#A05C2C' : '#244A36',
                      }}
                    >
                      {loc.riskLevel}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Geolocation Option */}
          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={handleRequestGeolocation}
              disabled={geoLoading}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#244A36] hover:underline"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
              <span>{geoLoading ? 'Acquiring GPS…' : 'Use Current Device GPS'}</span>
            </button>
            <span className="text-[10px] text-[#5E7E67]">Browser Permission</span>
          </div>

          {/* Geolocation Notice / Error */}
          {geoError && (
            <div className="p-2.5 rounded-xl bg-[#C87941]/10 border border-[#C87941]/25 text-[11px] text-[#8C4A1E] flex items-start gap-1.5 leading-snug">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C87941] shrink-0 mt-0.5" />
              <span>{geoError}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Safe Destination Selector ─────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#244A36]" />
            To:
          </span>
          <span className="text-[9px] font-bold bg-[#C87941]/15 text-[#C87941] px-2 py-0.5 rounded-full">
            Prototype destination
          </span>
        </label>

        {/* State Filter + Destination Select */}
        <div className="space-y-1.5">
          {/* State Filter pills */}
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold text-[#5E7E67] uppercase shrink-0">State:</span>
              <button
                type="button"
                onClick={() => setSelectedStateFilter('ALL')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                  selectedStateFilter === 'ALL'
                    ? 'bg-[#244A36] text-[#FAF7F2]'
                    : 'bg-white/60 text-[#3A4D43] hover:bg-white'
                }`}
              >
                All NER
              </button>
              {NER_STATES.map((s: NERState) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelectedStateFilter(s.name);
                    const stateDests = SAFE_DESTINATIONS.filter((d: SafeLocation) => d.state.toLowerCase() === s.name.toLowerCase());
                    if (stateDests.length > 0) {
                      setSelectedDestinationId(stateDests[0].id);
                    }
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                    selectedStateFilter.toLowerCase() === s.name.toLowerCase()
                      ? 'bg-[#244A36] text-[#FAF7F2]'
                      : 'bg-white/60 text-[#3A4D43] hover:bg-white'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDestDropdownOpen(!destDropdownOpen)}
              className="w-full text-left p-3 rounded-2xl bg-white/70 hover:bg-white border border-[#244A36]/15 flex items-center justify-between transition-all shadow-sm focus:ring-2 focus:ring-[#244A36]/25"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-xl bg-[#244A36]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#244A36]" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-[#1C2826] block truncate">
                    {currentDestination.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#5E7E67]">
                    <span>{currentDestination.district}, {currentDestination.state}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#244A36]">{currentDestination.type}</span>
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#5E7E67] transition-transform ${destDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {destDropdownOpen && (
              <div
                className="absolute top-full mt-2 left-0 right-0 liquid-glass-modal rounded-2xl p-1.5 z-40 max-h-64 overflow-y-auto shadow-xl"
                onMouseLeave={() => setDestDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider border-b border-[#244A36]/10 flex items-center justify-between">
                  <span>Designated Safe Destinations</span>
                  <span className="text-[#C87941] text-[9px]">Prototype Staging</span>
                </div>
                {availableDestinations.map((dest: SafeLocation) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => {
                      setSelectedDestinationId(dest.id);
                      setDestDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex flex-col gap-0.5 transition-colors border-b border-[#244A36]/5 last:border-none ${
                      selectedDestinationId === dest.id
                        ? 'bg-[#244A36]/10 text-[#244A36] font-bold'
                        : 'text-[#1C2826] hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{dest.name}</span>
                      <span className="text-[9px] bg-[#C87941]/10 text-[#C87941] px-1.5 py-0.2 rounded font-semibold">
                        Prototype destination
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#5E7E67]">
                      <span>{dest.district}, {dest.state}</span>
                      <span>Cap: {dest.capacityEstimate}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Calculation Action Button ──────────────────────────────────── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCalculate}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#244A36] text-[#FAF7F2] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(36,74,54,0.22)] hover:bg-[#1E3A2B] hover:shadow-[0_6px_20px_rgba(36,74,54,0.3)] transition-all disabled:opacity-70 active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#FAF7F2]" />
              <span>Finding safer route…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#FAF7F2]" />
              <span>Find Safer Route</span>
              <ArrowRight className="w-4 h-4 ml-0.5 text-[#FAF7F2]" />
            </>
          )}
        </button>

        {activeResult && (
          <button
            type="button"
            onClick={onClearRoute}
            className="w-full mt-2 py-2 rounded-xl border border-[#244A36]/20 text-[#3A4D43] text-xs font-semibold hover:bg-white/60 transition-colors"
          >
            Clear Route
          </button>
        )}
      </div>

      {/* Safety Notice & Disclaimer */}
      <div className="p-3 rounded-2xl bg-[#FAF7F2]/90 border border-[#244A36]/10 text-[10.5px] text-[#5E7E67] leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-[#244A36] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#1C2826]">Prototype Notice:</strong> Routes are illustrative and should not replace official emergency instructions, road-closure information, or local authority guidance.
        </p>
      </div>
    </div>
  );
}
