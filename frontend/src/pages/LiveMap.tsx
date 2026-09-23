/**
 * ResQAI Live Map — Northeast India Landslide Risk Map & Risk-Aware Safe Evacuation
 *
 * Uses: Leaflet + React-Leaflet v4 + OpenStreetMap (no API key required)
 *
 * Features:
 *  - Real interactive Leaflet MapContainer
 *  - Risk markers from RiskContext (existing unified data system)
 *  - Landslide markers from prototype landslides dataset
 *  - NER state metadata from nerStates.ts
 *  - Risk-Aware Safe Evacuation routing engine & visualization
 *  - Dual Route Comparison (Recommended Lower-Risk vs Shortest Direct)
 *  - Designated safe shelters & relief centres across NER
 *  - Road risk corridors with explainable landslide penalty scoring
 *  - All controls (filter, layer, search, zoom, reset) preserved
 *  - Backend-ready: API-first fallback architecture
 */

import { useState, useMemo, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  Polyline,
  Marker,
  Tooltip
} from 'react-leaflet';
import {
  MapPin as MapPinIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Layers as LayersIcon,
  Activity as ActivityIcon,
  ShieldAlert as ShieldAlertIcon,
  ArrowRight as ArrowRightIcon,
  Zap as ZapIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  X as XIcon,
  Mountain as MountainIcon,
  AlertTriangle as AlertTriangleIcon,
  Compass as CompassIcon,
  CloudRain as CloudRainIcon,
  Info as InfoIcon,
  Route as RouteIcon,
  ShieldCheck as ShieldCheckIcon,
} from 'lucide-react';
import L from 'leaflet';
import { useRisk } from '../context/RiskContext';
import { RiskLevel, MapLocationData as LocationData } from '../services/riskCalculationService';
import { NER_STATES, getAllNERDistricts, NERState } from '../data/nerStates';
import { PROTOTYPE_LANDSLIDES, DATA_SOURCE_NOTE, LandslideItem } from '../data/landslides';
import { SAFE_DESTINATIONS, SafeLocation } from '../data/safeLocations';
import { ROAD_RISK_SEGMENTS, RoadRiskSegment } from '../data/roadRiskData';
import {
  findSafeEvacuationRoute,
  EvacuationCalculationResult,
} from '../services/routeService';
import EvacuationPanel, { StartLocationOption } from '../components/evacuation/EvacuationPanel';
import RouteSummary from '../components/evacuation/RouteSummary';
import RouteComparison from '../components/evacuation/RouteComparison';

// ─── Fix Leaflet default marker icons for bundlers ────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Pins for Evacuation Start & Destination
const createStartIcon = (label = 'START') =>
  L.divIcon({
    className: 'custom-evacuation-pin',
    html: `<div style="background: #244A36; color: #FAF7F2; padding: 4px 10px; border-radius: 999px; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 5px; box-shadow: 0 4px 14px rgba(36,74,54,0.45); border: 2px solid #FFFFFF; white-space: nowrap;"><span style="width:7px; height:7px; border-radius:50%; background:#FAF7F2; display:inline-block;"></span>${label}</div>`,
    iconSize: [84, 28],
    iconAnchor: [42, 14],
  });

const createDestIcon = (label = 'SAFE DESTINATION') =>
  L.divIcon({
    className: 'custom-evacuation-pin',
    html: `<div style="background: #C87941; color: #FAF7F2; padding: 4px 10px; border-radius: 999px; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 5px; box-shadow: 0 4px 14px rgba(200,121,65,0.45); border: 2px solid #FFFFFF; white-space: nowrap;"><span style="width:7px; height:7px; border-radius:50%; background:#FAF7F2; display:inline-block;"></span>${label}</div>`,
    iconSize: [140, 28],
    iconAnchor: [70, 14],
  });

// ─── Constants ────────────────────────────────────────────────────────────────
const NER_BOUNDS: L.LatLngBoundsExpression = [
  [22.0, 87.5], // SW
  [29.5, 97.5], // NE
];

const RISK_COLORS: Record<string, string> = {
  LOW: '#244A36',
  MODERATE: '#C87941',
  HIGH: '#A05C2C',
  SEVERE: '#7A2E2E',
};

function getRiskColorHex(level: string): string {
  return RISK_COLORS[level?.toUpperCase()] || '#244A36';
}

// ─── Map Controller (internal Leaflet hook) ──────────────────────────────────
interface MapControllerProps {
  flyTo: { lat: number; lng: number; zoom: number } | null;
  flyToBounds: L.LatLngBoundsExpression | null;
  onReady: (map: L.Map) => void;
}

function MapController({ flyTo, flyToBounds, onReady }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom, { duration: 1.2 });
    }
  }, [flyTo, map]);

  useEffect(() => {
    if (flyToBounds) {
      map.flyToBounds(flyToBounds as L.LatLngBoundsExpression, { padding: [40, 40], duration: 1.2 });
    }
  }, [flyToBounds, map]);

  return null;
}

// ─── Navigation Helper ────────────────────────────────────────────────────────
function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface LiveMapProps {
  isLoaded?: boolean;
}

export default function LiveMap({ isLoaded: _isLoaded }: LiveMapProps) {
  const { locations, selectedLocationId, setSelectedLocationId, getRiskColor, activeAlertsCount } = useRisk();

  // ── State ──────────────────────────────────────────────────────────────────
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(selectedLocationId || null);
  const [activeFilter, setActiveFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [activeLayer, setActiveLayer] = useState<'RISK' | 'RAINFALL' | 'SLOPE' | 'LANDSLIDES' | 'SATELLITE' | 'EVACUATION'>('RISK');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [layerDropdownOpen, setLayerDropdownOpen] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [showLandslides] = useState(true);

  // ── Evacuation Feature State ───────────────────────────────────────────────
  const [isEvacuationMode, setIsEvacuationMode] = useState(false);
  const [evacuationStartId, setEvacuationStartId] = useState<string | null>(null);
  const [evacuationResult, setEvacuationResult] = useState<EvacuationCalculationResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [selectedRouteType, setSelectedRouteType] = useState<'recommended-safer' | 'shortest-direct'>('recommended-safer');
  const [evacuationActiveTab, setEvacuationActiveTab] = useState<'planner' | 'summary' | 'comparison'>('planner');

  // Flyto control
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [flyToBounds, setFlyToBounds] = useState<L.LatLngBoundsExpression | null>(null);

  // ── Landslide data ─────────────────────────────────────────────────────────
  const landslides: LandslideItem[] = PROTOTYPE_LANDSLIDES;

  // ── Read URL params on mount ───────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locParam = params.get('location') || params.get('id');
    const evacParam = params.get('evacuation') || params.get('evacuateFrom');

    if (evacParam) {
      setIsEvacuationMode(true);
      setShowMobilePanel(true);
      if (params.get('evacuateFrom')) {
        setEvacuationStartId(params.get('evacuateFrom'));
      }
    }

    if (locParam) {
      const match = locations.find(
        (l: LocationData) => l.id.toLowerCase() === locParam.toLowerCase() ||
               l.name.toLowerCase() === locParam.toLowerCase()
      );
      if (match) {
        setActiveMarkerId(match.id);
        setSelectedLocationId(match.id);
        setShowMobilePanel(true);
        setFlyTo({ lat: match.coordinates.lat, lng: match.coordinates.lng, zoom: 9 });
        if (evacParam) {
          setEvacuationStartId(match.id);
        }
      }
    } else if (selectedLocationId) {
      setActiveMarkerId(selectedLocationId);
    }
  }, [locations, selectedLocationId, setSelectedLocationId]);

  // ── Build combined search corpus ───────────────────────────────────────────
  const allDistricts = useMemo(() => getAllNERDistricts(), []);

  interface SearchSuggestion {
    type: 'location' | 'state' | 'district';
    id: string;
    label: string;
    sub: string;
    riskLevel: string;
    data: LocationData | NERState | null;
  }

  const searchSuggestions: SearchSuggestion[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const locMatches: SearchSuggestion[] = locations
      .filter((l: LocationData) => l.name.toLowerCase().includes(q) || l.state.toLowerCase().includes(q))
      .map((l: LocationData) => ({ type: 'location', id: l.id, label: l.name, sub: l.state, riskLevel: l.riskLevel, data: l }));

    const stateMatches: SearchSuggestion[] = NER_STATES
      .filter((s: NERState) => s.name.toLowerCase().includes(q) || s.capital.toLowerCase().includes(q))
      .map((s: NERState) => ({ type: 'state', id: s.id, label: s.name, sub: `Capital: ${s.capital}`, riskLevel: s.landslideRisk, data: s }));

    const districtMatches: SearchSuggestion[] = allDistricts
      .filter((d: { district: string; state: string; stateId: string }) => d.district.toLowerCase().includes(q))
      .slice(0, 4)
      .map((d: { district: string; state: string; stateId: string }) => ({ type: 'district', id: d.stateId, label: d.district, sub: d.state, riskLevel: 'MODERATE', data: null }));

    return [...locMatches, ...stateMatches, ...districtMatches].slice(0, 8);
  }, [searchQuery, locations, allDistricts]);

  // ── Filtered risk markers ──────────────────────────────────────────────────
  const filteredLocations = useMemo(() => {
    let result = locations;
    if (activeFilter !== 'ALL') result = result.filter((l: LocationData) => l.riskLevel === activeFilter);
    return result;
  }, [locations, activeFilter]);

  // ── Filtered landslide markers ─────────────────────────────────────────────
  const filteredLandslides = useMemo(() => {
    if (!showLandslides || activeLayer !== 'LANDSLIDES') return [];
    if (activeFilter === 'ALL') return landslides;
    return landslides.filter((l: LandslideItem) => l.riskLevel === activeFilter);
  }, [landslides, showLandslides, activeLayer, activeFilter]);

  // ── Active selected location ───────────────────────────────────────────────
  const activeLocation = useMemo(
    () => locations.find((l: LocationData) => l.id === activeMarkerId) || null,
    [locations, activeMarkerId]
  );

  const selectedStateData = useMemo(
    () => NER_STATES.find((s: NERState) => s.id === selectedStateId) || null,
    [selectedStateId]
  );

  // Landslide counts by state for state info card
  const landslidesByState = useMemo(() => {
    return landslides.reduce((acc: Record<string, number>, ls: LandslideItem) => {
      acc[ls.state] = (acc[ls.state] || 0) + 1;
      return acc;
    }, {});
  }, [landslides]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleMarkerClick = (loc: LocationData) => {
    setActiveMarkerId(loc.id);
    setSelectedLocationId(loc.id);
    setShowMobilePanel(true);
    setFlyTo({ lat: loc.coordinates.lat, lng: loc.coordinates.lng, zoom: 9 });
  };

  const handleResetView = () => {
    setFlyToBounds(NER_BOUNDS);
    setFlyTo(null);
    setActiveMarkerId(null);
    setSelectedStateId(null);
    setShowMobilePanel(false);
    setSearchQuery('');
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (mapInstance) {
      mapInstance.setZoom(mapInstance.getZoom() + (direction === 'in' ? 1 : -1));
    }
  };

  const handleStateSelect = (stateId: string) => {
    const state = NER_STATES.find((s: NERState) => s.id === stateId);
    if (state) {
      setSelectedStateId(stateId);
      setStateDropdownOpen(false);
      setFlyToBounds(state.bounds as L.LatLngBoundsExpression);
      setFlyTo(null);
      setActiveMarkerId(null);
      setShowMobilePanel(false);
    }
  };

  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.label);
    setIsSearchFocused(false);
    if (suggestion.type === 'location' && suggestion.data) {
      handleMarkerClick(suggestion.data as LocationData);
    } else if (suggestion.type === 'state') {
      handleStateSelect(suggestion.id);
    } else if (suggestion.type === 'district') {
      handleStateSelect(suggestion.id);
    }
  };

  // ── Evacuation Calculation Handlers ────────────────────────────────────────
  const handleCalculateEvacuationRoute = async (start: StartLocationOption, dest: SafeLocation) => {
    setIsCalculatingRoute(true);
    try {
      const res = await findSafeEvacuationRoute(start, dest, ROAD_RISK_SEGMENTS);
      setEvacuationResult(res);
      setSelectedRouteType('recommended-safer');
      setEvacuationActiveTab('summary');
      setShowMobilePanel(true);

      // Fit map bounds to route
      if (res.recommendedRoute.coordinates.length > 0) {
        const bounds = L.latLngBounds(res.recommendedRoute.coordinates);
        setFlyToBounds(bounds);
      }
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleClearEvacuation = () => {
    setEvacuationResult(null);
    setEvacuationActiveTab('planner');
    setFlyToBounds(NER_BOUNDS);
  };

  const handleStartEvacuationFromLocation = (locId: string) => {
    setEvacuationStartId(locId);
    setIsEvacuationMode(true);
    setEvacuationActiveTab('planner');
    setShowMobilePanel(true);
  };

  const handleCenterOnRoute = () => {
    if (evacuationResult) {
      const activeCoords =
        selectedRouteType === 'shortest-direct'
          ? evacuationResult.alternativeRoute.coordinates
          : evacuationResult.recommendedRoute.coordinates;
      if (activeCoords.length > 0) {
        setFlyToBounds(L.latLngBounds(activeCoords));
      }
    }
  };

  // Marker sizes
  const markerRadius = (riskLevel: string, isActive: boolean) => {
    const base = riskLevel === 'SEVERE' ? 12 : riskLevel === 'HIGH' ? 10 : riskLevel === 'MODERATE' ? 8 : 7;
    return isActive ? base + 4 : base;
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1700px] mx-auto font-sans">
      {/* ── Top Bar: Title, Search, Filter Tabs, Evacuation Toggle ────────────── */}
      <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C87941] animate-ping" />
            <span className="text-[11px] font-bold text-[#C87941] uppercase tracking-wider">
              {isEvacuationMode ? 'Prototype Evacuation System' : 'Interactive GIS Monitoring'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C2826] tracking-tight flex items-center gap-2">
            <span>NER Live Map</span>
            {isEvacuationMode && (
              <span className="text-xs font-bold text-[#244A36] bg-[#244A36]/10 px-3 py-1 rounded-full uppercase border border-[#244A36]/20">
                Safe Evacuation Active
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#5E7E67] font-medium mt-0.5">
            {isEvacuationMode
              ? 'Find a route that avoids or penalizes high-risk landslide areas across North East India.'
              : 'Real-time terrain monitoring & landslide hazard corridors across 8 North Eastern states.'}
          </p>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Safe Evacuation Main Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsEvacuationMode(!isEvacuationMode);
              setShowMobilePanel(true);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
              isEvacuationMode
                ? 'bg-[#244A36] text-[#FAF7F2] ring-2 ring-[#244A36]/30'
                : 'liquid-glass border border-[#244A36]/20 text-[#244A36] hover:bg-[#244A36]/10'
            }`}
          >
            <RouteIcon className="w-4 h-4 text-inherit" />
            <span>{isEvacuationMode ? 'Evacuation Mode Active' : 'Safe Evacuation'}</span>
          </button>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <div className="relative">
              <SearchIcon className="w-4 h-4 text-[#5E7E67] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search state, city, road..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-9 pr-8 py-2 rounded-2xl liquid-glass text-xs font-semibold text-[#1C2826] placeholder-[#5E7E67] focus:outline-none focus:ring-2 focus:ring-[#244A36]/30 border border-[#244A36]/15"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E7E67] hover:text-[#1C2826]"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div
                className="absolute top-full mt-2 left-0 right-0 liquid-glass-modal rounded-2xl p-1.5 z-50 max-h-64 overflow-y-auto shadow-xl"
                onMouseLeave={() => setIsSearchFocused(false)}
              >
                {searchSuggestions.map((s: SearchSuggestion) => (
                  <button
                    key={`${s.type}-${s.id}-${s.label}`}
                    type="button"
                    onClick={() => handleSearchSelect(s)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/80 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-[#1C2826] block">{s.label}</span>
                      <span className="text-[10px] text-[#5E7E67]">{s.sub}</span>
                    </div>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                      style={{ color: getRiskColorHex(s.riskLevel), background: `${getRiskColorHex(s.riskLevel)}18` }}
                    >
                      {s.riskLevel}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Layout: Map Canvas + Side Panel ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-190px)] min-h-[580px]">
        {/* Map Container Wrapper */}
        <div className="flex-1 relative rounded-3xl overflow-hidden glass-card border border-[#244A36]/15 shadow-lg flex flex-col">
          {/* Top Overlays: Risk Filter Tabs + Layer Selectors */}
          <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Filter Pills */}
            <div className="pointer-events-auto liquid-glass rounded-2xl p-1 flex items-center gap-1">
              <span className="text-[10px] font-bold text-[#5E7E67] px-2 uppercase tracking-wider hidden sm:inline flex items-center gap-1">
                <FilterIcon className="w-3 h-3 text-[#244A36]" /> Filter:
              </span>
              {(['ALL', 'LOW', 'MODERATE', 'HIGH', 'SEVERE'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === filter
                      ? 'bg-[#244A36] text-[#FAF7F2] shadow-sm'
                      : 'text-[#3A4D43] hover:bg-white/60'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Layer dropdown + State Selector */}
            <div className="pointer-events-auto flex items-center gap-2">
              {/* NER State Selector */}
              <div className="relative">
                <button
                  onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                  className="liquid-glass rounded-2xl px-3.5 py-2 flex items-center gap-2 text-xs font-bold text-[#1C2826] hover:bg-white transition-all"
                >
                  <CompassIcon className="w-3.5 h-3.5 text-[#244A36]" />
                  <span className="text-[#5E7E67] uppercase text-[10px] tracking-wider font-semibold">State:</span>
                  <span>{selectedStateData?.name || 'All NER'}</span>
                  <ChevronDownIcon className={`w-3.5 h-3.5 text-[#5E7E67] transition-transform ${stateDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {stateDropdownOpen && (
                  <div
                    className="absolute top-full mt-2 right-0 w-52 liquid-glass-modal rounded-2xl p-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150 max-h-72 overflow-y-auto"
                    onMouseLeave={() => setStateDropdownOpen(false)}
                  >
                    <button
                      onClick={handleResetView}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors hover:bg-white/80 mb-1 border-b border-[#244A36]/10 pb-1.5"
                    >
                      <span className="font-semibold text-[#244A36]">View All NER</span>
                      <CompassIcon className="w-3.5 h-3.5 text-[#244A36]" />
                    </button>
                    {NER_STATES.map((state: NERState) => (
                      <button
                        key={state.id}
                        onClick={() => handleStateSelect(state.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          selectedStateId === state.id ? 'bg-[#244A36]/10 text-[#244A36] font-bold' : 'text-[#2B3A33] hover:bg-white/80'
                        }`}
                      >
                        <span>{state.name}</span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: getRiskColorHex(state.landslideRisk), background: `${getRiskColorHex(state.landslideRisk)}18` }}
                        >
                          {state.landslideRisk}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Layer dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLayerDropdownOpen(!layerDropdownOpen)}
                  className="liquid-glass rounded-2xl px-3.5 py-2 flex items-center gap-2 text-xs font-bold text-[#1C2826] hover:bg-white transition-all"
                >
                  <LayersIcon className="w-3.5 h-3.5 text-[#244A36]" />
                  <span className="text-[#5E7E67] uppercase text-[10px] tracking-wider font-semibold">Layer:</span>
                  <span>{activeLayer}</span>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-[#5E7E67]" />
                </button>
                {layerDropdownOpen && (
                  <div
                    className="absolute top-full mt-2 right-0 w-52 liquid-glass-modal rounded-2xl p-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setLayerDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 border-b border-[#244A36]/10 mb-1">
                      <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider">GIS Layer View</span>
                    </div>
                    {(['RISK', 'LANDSLIDES'] as const).map((layer) => (
                      <button
                        key={layer}
                        onClick={() => { setActiveLayer(layer); setLayerDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          activeLayer === layer ? 'bg-[#244A36]/10 text-[#244A36] font-bold' : 'text-[#2B3A33] hover:bg-white/80'
                        }`}
                      >
                        <span>{layer}</span>
                        {activeLayer === layer && <CheckIcon className="w-3.5 h-3.5 text-[#244A36]" />}
                      </button>
                    ))}
                    {/* Pending layers */}
                    {(['RAINFALL', 'SLOPE', 'SATELLITE'] as const).map((layer) => (
                      <div key={layer} className="px-3 py-2 rounded-xl text-xs flex items-center justify-between opacity-50 cursor-not-allowed select-none">
                        <span className="text-[#2B3A33]">{layer}</span>
                        <span className="text-[9px] bg-[#C87941]/15 text-[#C87941] px-1.5 py-0.5 rounded-full font-semibold">Pending</span>
                      </div>
                    ))}
                    <div className="mt-1 pt-1.5 border-t border-[#244A36]/10 px-2.5 py-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C87941]" />
                      <span className="text-[9px] text-[#C87941] uppercase font-bold tracking-wider">Prototype GIS</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Layer status badge */}
          <div className="absolute top-16 sm:top-20 left-4 z-[400] pointer-events-none">
            <div className="bg-[#1C2826]/85 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#526E48] animate-ping" />
              <span>
                {isEvacuationMode ? (
                  <>Mode: <strong>Safe Evacuation Routing</strong></>
                ) : (
                  <>Layer: <strong>{activeLayer}</strong> — NER Region</>
                )}
              </span>
              {isEvacuationMode && evacuationResult && (
                <span className="text-[#C87941] text-[9px] font-bold">
                  ({evacuationResult.recommendedRoute.distanceKm} km route calculated)
                </span>
              )}
            </div>
          </div>

          {/* ── Leaflet Map ────────────────────────────────────────────────── */}
          <div className="flex-1 w-full h-full" style={{ minHeight: '480px' }}>
            <MapContainer
              bounds={NER_BOUNDS}
              style={{ width: '100%', height: '100%', minHeight: '480px' }}
              zoomControl={false}
              className="rounded-3xl"
            >
              {/* OpenStreetMap tiles */}
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={18}
              />

              {/* Internal map controller */}
              <MapController
                flyTo={flyTo}
                flyToBounds={flyToBounds}
                onReady={setMapInstance}
              />

              {/* ── Road Risk Segments / Hazard Corridors ────────────────── */}
              {ROAD_RISK_SEGMENTS.map((seg: RoadRiskSegment) => {
                const isHighOrSevere = seg.riskLevel === 'HIGH' || seg.riskLevel === 'SEVERE';
                const color = getRiskColorHex(seg.riskLevel);

                return (
                  <CircleMarker
                    key={seg.roadSegmentId}
                    center={[seg.center.lat, seg.center.lng]}
                    radius={isHighOrSevere ? 14 : 9}
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: 0.35,
                      color: color,
                      weight: 2,
                      dashArray: isHighOrSevere ? '4 4' : undefined,
                    }}
                  >
                    <Popup className="resqai-popup" maxWidth={280}>
                      <div className="p-1 font-sans text-[#1C2826]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold uppercase text-[#5E7E67]">{seg.highwayRef}</span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase"
                            style={{ backgroundColor: `${color}18`, color }}
                          >
                            {seg.riskLevel} Hazard
                          </span>
                        </div>
                        <h4 className="font-bold text-xs mb-1">{seg.name}</h4>
                        <p className="text-[11px] text-[#5E7E67] leading-snug mb-2">{seg.riskReason}</p>
                        <div className="grid grid-cols-2 gap-1 text-[10px] bg-[#244A36]/5 p-2 rounded-xl mb-1">
                          <div>
                            <span className="text-[#5E7E67] block">Slope:</span>
                            <span className="font-bold">{seg.slopeGradient}</span>
                          </div>
                          <div>
                            <span className="text-[#5E7E67] block">Rainfall:</span>
                            <span className="font-bold">{seg.rainfallStatus}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* ── Safe Shelters & Relief Destinations ───────────────────── */}
              {SAFE_DESTINATIONS.map((dest: SafeLocation) => (
                <CircleMarker
                  key={dest.id}
                  center={[dest.latitude, dest.longitude]}
                  radius={7}
                  pathOptions={{
                    fillColor: '#3B7A57',
                    fillOpacity: 0.9,
                    color: '#FFFFFF',
                    weight: 2,
                  }}
                >
                  <Popup className="resqai-popup" maxWidth={260}>
                    <div className="p-1 font-sans text-[#1C2826]">
                      <div className="flex items-center gap-1.5 mb-1 text-[#244A36]">
                        <ShieldCheckIcon className="w-3.5 h-3.5 text-[#244A36]" />
                        <span className="text-[9.5px] font-bold uppercase tracking-wider">Designated Shelter</span>
                      </div>
                      <h4 className="font-bold text-xs mb-1">{dest.name}</h4>
                      <div className="text-[10px] text-[#5E7E67] mb-2">{dest.district}, {dest.state} • Cap: {dest.capacityEstimate}</div>
                      <div className="text-[9px] text-[#C87941] bg-[#C87941]/10 px-2 py-1 rounded-lg">
                        Prototype destination
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {/* ── Evacuation Route Polylines ───────────────────────────── */}
              {evacuationResult && (
                <>
                  {/* Route A: Shortest Direct Route (Dashed amber comparison line) */}
                  <Polyline
                    positions={evacuationResult.alternativeRoute.coordinates}
                    pathOptions={{
                      color: selectedRouteType === 'shortest-direct' ? '#C87941' : '#C8794177',
                      weight: selectedRouteType === 'shortest-direct' ? 5 : 3.5,
                      dashArray: '8 8',
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  >
                    <Tooltip sticky direction="top" className="resqai-map-tooltip">
                      <span className="text-xs font-bold text-[#C87941]">
                        Route A (Shortest Direct): {evacuationResult.alternativeRoute.distanceKm} km
                      </span>
                    </Tooltip>
                  </Polyline>

                  {/* Route B: Recommended Risk-Aware Evacuation Route (Solid Emerald line) */}
                  <Polyline
                    positions={evacuationResult.recommendedRoute.coordinates}
                    pathOptions={{
                      color: selectedRouteType === 'recommended-safer' ? '#244A36' : '#244A3688',
                      weight: selectedRouteType === 'recommended-safer' ? 6 : 4,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  >
                    <Tooltip sticky direction="top" className="resqai-map-tooltip">
                      <span className="text-xs font-bold text-[#244A36]">
                        Route B (Lower-Risk Route): {evacuationResult.recommendedRoute.distanceKm} km
                      </span>
                    </Tooltip>
                  </Polyline>

                  {/* Start Point Marker */}
                  <Marker
                    position={[
                      evacuationResult.start.coordinates.lat,
                      evacuationResult.start.coordinates.lng,
                    ]}
                    icon={createStartIcon('START')}
                  />

                  {/* Destination Point Marker */}
                  <Marker
                    position={[
                      evacuationResult.destination.latitude,
                      evacuationResult.destination.longitude,
                    ]}
                    icon={createDestIcon('DESTINATION')}
                  />
                </>
              )}

              {/* ── RISK Layer: Standard Monitoring Markers ──────────────── */}
              {activeLayer === 'RISK' && filteredLocations.map((loc: LocationData) => {
                const isActive = activeMarkerId === loc.id;
                const color = getRiskColor(loc.riskLevel);
                const radius = markerRadius(loc.riskLevel, isActive);

                return (
                  <CircleMarker
                    key={loc.id}
                    center={[loc.coordinates.lat, loc.coordinates.lng]}
                    radius={radius}
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: isActive ? 1 : 0.82,
                      color: '#FFFFFF',
                      weight: isActive ? 3 : 1.5,
                    }}
                    eventHandlers={{ click: () => handleMarkerClick(loc) }}
                  >
                    <Popup className="resqai-popup" maxWidth={280}>
                      <div className="p-1 font-sans text-[#1C2826]">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPinIcon className="w-3.5 h-3.5 text-[#244A36] shrink-0" />
                          <span className="font-bold text-sm">{loc.name}</span>
                        </div>
                        <div className="text-xs text-[#5E7E67] mb-2">{loc.state} · NER Region</div>

                        {/* Risk badge */}
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3"
                          style={{ background: `${color}18`, color }}
                        >
                          <ShieldAlertIcon className="w-3 h-3" />
                          {loc.riskLevel} RISK
                        </div>

                        {/* Factor summary */}
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-3">
                          <div className="bg-[#244A36]/5 rounded-lg px-2 py-1.5">
                            <span className="text-[#5E7E67] block text-[10px] font-medium">Rainfall</span>
                            <span className="font-bold text-[#1C2826]">{loc.rainfall}</span>
                          </div>
                          <div className="bg-[#244A36]/5 rounded-lg px-2 py-1.5">
                            <span className="text-[#5E7E67] block text-[10px] font-medium">Slope</span>
                            <span className="font-bold text-[#1C2826]">{loc.slope}</span>
                          </div>
                          <div className="bg-[#244A36]/5 rounded-lg px-2 py-1.5">
                            <span className="text-[#5E7E67] block text-[10px] font-medium">Ground Mvmt</span>
                            <span className="font-bold text-[#1C2826]">{loc.groundMovement}</span>
                          </div>
                          <div className="bg-[#244A36]/5 rounded-lg px-2 py-1.5">
                            <span className="text-[#5E7E67] block text-[10px] font-medium">Activity</span>
                            <span className="font-bold text-[#1C2826]">{loc.recentActivity}</span>
                          </div>
                        </div>

                        {/* Evacuation Quick Action */}
                        <button
                          type="button"
                          onClick={() => handleStartEvacuationFromLocation(loc.id)}
                          className="w-full mb-2 py-2 rounded-lg bg-[#244A36] text-[#FAF7F2] text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#1E3A2B]"
                        >
                          <RouteIcon className="w-3.5 h-3.5" />
                          <span>Find Safer Route from Here</span>
                        </button>

                        {/* Action buttons */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => navigateTo(`/risk-monitoring?location=${loc.id}`)}
                            className="flex-1 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#244A36]/20 text-[#244A36] text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-white"
                          >
                            <ActivityIcon className="w-3 h-3" /> Risk Details
                          </button>
                          <button
                            onClick={() => navigateTo('/alerts')}
                            className="flex-1 py-1.5 rounded-lg border border-[#244A36]/20 text-[#244A36] text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-white"
                          >
                            <AlertTriangleIcon className="w-3 h-3" /> Alerts
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* ── LANDSLIDES Layer: Landslide Event Markers ────────────── */}
              {activeLayer === 'LANDSLIDES' && filteredLandslides.map((ls: LandslideItem) => {
                const color = getRiskColorHex(ls.riskLevel);
                return (
                  <CircleMarker
                    key={ls.id}
                    center={[ls.latitude, ls.longitude]}
                    radius={ls.riskLevel === 'SEVERE' ? 11 : ls.riskLevel === 'HIGH' ? 9 : 7}
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: 0.85,
                      color: '#FFFFFF',
                      weight: 1.5,
                      dashArray: '4 2',
                    }}
                  >
                    <Popup className="resqai-popup" maxWidth={300}>
                      <div className="p-1 font-sans text-[#1C2826]">
                        <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-[#C87941]/10 rounded-lg">
                          <InfoIcon className="w-3 h-3 text-[#C87941]" />
                          <span className="text-[9px] font-bold text-[#C87941] uppercase tracking-wide">Prototype Data</span>
                        </div>

                        <div className="font-bold text-sm mb-0.5">{ls.location}</div>
                        <div className="text-xs text-[#5E7E67] mb-2">{ls.district}, {ls.state}</div>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-3">
                          {[
                            { label: 'Date', val: ls.date },
                            { label: 'Severity', val: ls.severity },
                            { label: 'Trigger', val: ls.trigger },
                            { label: 'Risk Level', val: ls.riskLevel },
                            { label: 'Casualties', val: ls.casualties },
                            { label: 'Volume', val: ls.volumeEstimate },
                          ].map(({ label, val }) => (
                            <div key={label} className="bg-[#244A36]/5 rounded-lg px-2 py-1.5">
                              <span className="text-[#5E7E67] block text-[10px] font-medium">{label}</span>
                              <span className="font-bold text-[#1C2826]">{val}</span>
                            </div>
                          ))}
                        </div>

                        <div className="text-[9px] text-[#5E7E67] mb-2">Source: {ls.source}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* ── Bottom Bar: Legend + Controls ─────────────────────────────── */}
          <div className="absolute bottom-4 left-4 right-4 z-[400] flex flex-col sm:flex-row justify-between items-end sm:items-center gap-3 pointer-events-none">
            {/* Legend */}
            <div className="pointer-events-auto liquid-glass rounded-2xl p-2.5 px-4 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider">Legend:</span>
              {[
                { color: '#244A36', label: 'Low Risk' },
                { color: '#C87941', label: 'Moderate' },
                { color: '#A05C2C', label: 'High Risk' },
                { color: '#7A2E2E', label: 'Severe' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-[11px] font-bold text-[#1C2826]">{label}</span>
                </div>
              ))}
              {isEvacuationMode && (
                <div className="flex items-center gap-3 border-l border-[#244A36]/10 pl-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-1 rounded-full bg-[#244A36]" />
                    <span className="text-[10.5px] font-bold text-[#244A36]">Safer Route</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-1 rounded-full bg-[#C87941] border-b border-dashed border-white" />
                    <span className="text-[10.5px] font-bold text-[#C87941]">Shortest</span>
                  </div>
                </div>
              )}
            </div>

            {/* Zoom + Reset controls */}
            <div className="pointer-events-auto liquid-glass rounded-2xl flex items-center p-1 gap-1">
              <button onClick={() => handleZoom('in')} title="Zoom In" className="p-2 hover:bg-white text-[#1C2826] rounded-xl transition-colors">
                <ZoomInIcon className="w-4 h-4" />
              </button>
              <button onClick={handleResetView} title="View All NER" className="p-2 hover:bg-white text-[#1C2826] rounded-xl transition-colors flex items-center gap-1 text-[11px] font-bold px-2.5">
                <CompassIcon className="w-4 h-4 text-[#244A36]" />
                <span className="hidden sm:inline">View All NER</span>
              </button>
              <button onClick={() => handleZoom('out')} title="Zoom Out" className="p-2 hover:bg-white text-[#1C2826] rounded-xl transition-colors">
                <ZoomOutIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Side Panel: Evacuation vs Location Details ──────────────────────── */}
        <div className={`lg:w-[420px] flex-shrink-0 flex flex-col gap-4 transition-all duration-300 ${showMobilePanel ? 'fixed inset-x-4 bottom-4 top-24 z-50 lg:static lg:inset-auto' : 'hidden lg:flex'}`}>

          {/* ── EVACUATION MODE PANEL ── */}
          {isEvacuationMode ? (
            <div className="glass-card rounded-3xl p-5 flex flex-col flex-1 overflow-y-auto space-y-4">
              {/* Mode Sub-Tabs (Planner | Summary | Compare) if route calculated */}
              {evacuationResult && (
                <div className="p-1 rounded-2xl bg-[#244A36]/8 border border-[#244A36]/15 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEvacuationActiveTab('summary')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      evacuationActiveTab === 'summary'
                        ? 'bg-[#244A36] text-[#FAF7F2] shadow-sm'
                        : 'text-[#3A4D43] hover:bg-white/60'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvacuationActiveTab('comparison')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      evacuationActiveTab === 'comparison'
                        ? 'bg-[#244A36] text-[#FAF7F2] shadow-sm'
                        : 'text-[#3A4D43] hover:bg-white/60'
                    }`}
                  >
                    Compare Routes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvacuationActiveTab('planner')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      evacuationActiveTab === 'planner'
                        ? 'bg-[#244A36] text-[#FAF7F2] shadow-sm'
                        : 'text-[#3A4D43] hover:bg-white/60'
                    }`}
                  >
                    Edit Route
                  </button>
                </div>
              )}

              {/* View Router */}
              {evacuationActiveTab === 'planner' || !evacuationResult ? (
                <EvacuationPanel
                  locations={locations}
                  initialStartId={evacuationStartId}
                  onCalculateRoute={handleCalculateEvacuationRoute}
                  onClearRoute={handleClearEvacuation}
                  isLoading={isCalculatingRoute}
                  activeResult={evacuationResult}
                  onClose={() => setIsEvacuationMode(false)}
                />
              ) : evacuationActiveTab === 'summary' ? (
                <RouteSummary
                  result={evacuationResult}
                  onViewOnMap={handleCenterOnRoute}
                  onRecalculate={() => setEvacuationActiveTab('planner')}
                  onClear={handleClearEvacuation}
                />
              ) : (
                <RouteComparison
                  result={evacuationResult}
                  selectedRouteId={selectedRouteType}
                  onSelectRoute={(rId) => {
                    setSelectedRouteType(rId);
                    handleCenterOnRoute();
                  }}
                />
              )}
            </div>
          ) : (
            /* ── STANDARD LIVE MAP DETAILS PANEL ── */
            <>
              {/* State Info Panel */}
              {selectedStateData && !activeLocation && (
                <div className="glass-card rounded-3xl p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5E7E67] mb-0.5">{selectedStateData.code} · NER State</div>
                      <h2 className="text-2xl font-bold text-[#1C2826]">{selectedStateData.name}</h2>
                      <div className="text-sm text-[#5E7E67]">Capital: <strong className="text-[#1C2826]">{selectedStateData.capital}</strong></div>
                    </div>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full border"
                      style={{ color: getRiskColorHex(selectedStateData.landslideRisk), background: `${getRiskColorHex(selectedStateData.landslideRisk)}12`, borderColor: `${getRiskColorHex(selectedStateData.landslideRisk)}30` }}
                    >
                      {selectedStateData.landslideRisk}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="px-3 py-2 rounded-xl bg-white/50 border border-[#244A36]/8">
                      <span className="text-[#5E7E67] block text-[10px] uppercase font-medium">Area</span>
                      <span className="font-bold text-[#1C2826]">{selectedStateData.area}</span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white/50 border border-[#244A36]/8">
                      <span className="text-[#5E7E67] block text-[10px] uppercase font-medium">Slide Records</span>
                      <span className="font-bold text-[#C87941]">
                        {landslidesByState[selectedStateData.name] || 0} <span className="font-normal text-[#5E7E67]">prototype</span>
                      </span>
                    </div>
                  </div>

                  <div className="px-3 py-2.5 rounded-xl bg-[#244A36]/5 border border-[#244A36]/10 text-[11px] text-[#3A4D43] leading-relaxed">
                    <InfoIcon className="w-3 h-3 inline text-[#244A36] mr-1" />
                    {selectedStateData.terrainNote}
                  </div>

                  <button
                    onClick={handleResetView}
                    className="w-full py-2 rounded-xl border border-[#244A36]/20 text-[#244A36] text-xs font-semibold hover:bg-[#244A36]/5 transition-colors"
                  >
                    View All NER
                  </button>
                </div>
              )}

              {/* Location Details Card */}
              {activeLocation ? (
                <div className="glass-card rounded-3xl p-6 flex flex-col flex-1 overflow-y-auto">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-[#244A36]" />
                        <h2 className="text-2xl font-bold text-[#1C2826] tracking-tight">{activeLocation.name}</h2>
                      </div>
                      <p className="text-sm font-semibold text-[#5E7E67] ml-7">{activeLocation.state} (NER Sector)</p>
                    </div>
                    <button onClick={() => { setShowMobilePanel(false); setActiveMarkerId(null); }} className="p-2 rounded-full liquid-glass text-[#1C2826] hover:bg-white lg:hidden">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Risk Banner */}
                  <div
                    className="p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between mb-4"
                    style={{ backgroundColor: `${getRiskColor(activeLocation.riskLevel)}12`, borderColor: `${getRiskColor(activeLocation.riskLevel)}35` }}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: getRiskColor(activeLocation.riskLevel) }}>
                        Landslide Risk Level
                      </span>
                      <span className="text-xl font-extrabold" style={{ color: getRiskColor(activeLocation.riskLevel) }}>
                        {activeLocation.riskLevel}
                      </span>
                    </div>
                    <ShieldAlertIcon className="w-7 h-7" style={{ color: getRiskColor(activeLocation.riskLevel) }} />
                  </div>

                  {/* Factors Grid */}
                  <div className="space-y-3 flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Rainfall', icon: <CloudRainIcon className="w-3.5 h-3.5 text-[#244A36]" />, val: activeLocation.rainfall },
                        { label: 'Slope Condition', icon: <MountainIcon className="w-3.5 h-3.5 text-[#244A36]" />, val: activeLocation.slope },
                      ].map(({ label, icon, val }) => (
                        <div key={label} className="p-3.5 glass-widget rounded-2xl">
                          <span className="text-[10px] font-bold text-[#5E7E67] uppercase flex items-center gap-1.5 mb-1">{icon} {label}</span>
                          <span className="text-xs font-bold text-[#1C2826] block">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-3.5 glass-widget rounded-2xl">
                      <span className="text-[10px] font-bold text-[#5E7E67] uppercase mb-1 flex items-center gap-1.5">
                        <ActivityIcon className="w-3.5 h-3.5 text-[#C87941]" /> Ground Movement
                      </span>
                      <span className="text-xs font-bold text-[#1C2826] block">{activeLocation.groundMovement}</span>
                    </div>
                    <div className="p-3.5 glass-widget rounded-2xl">
                      <span className="text-[10px] font-bold text-[#5E7E67] uppercase mb-1 flex items-center gap-1.5">
                        <AlertTriangleIcon className="w-3.5 h-3.5 text-[#7A2E2E]" /> Recent Landslide Activity
                      </span>
                      <span className="text-xs font-bold text-[#1C2826] block">{activeLocation.recentActivity}</span>
                    </div>
                  </div>

                  {/* Safe Evacuation Route Callout */}
                  <div className="mt-4 pt-3 border-t border-[#244A36]/10">
                    <button
                      type="button"
                      onClick={() => handleStartEvacuationFromLocation(activeLocation.id)}
                      className="w-full py-3 px-4 rounded-2xl bg-[#244A36] text-[#FAF7F2] text-xs font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(36,74,54,0.22)] hover:bg-[#1E3A2B] transition-all"
                    >
                      <RouteIcon className="w-4 h-4 text-[#FAF7F2]" />
                      <span>Find Safer Evacuation Route</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>

                  {/* Footer Secondary Links */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => navigateTo(`/risk-monitoring?location=${activeLocation.id}`)}
                      className="flex-1 py-2.5 rounded-xl border border-[#244A36]/20 text-[#1C2826] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/60 transition-colors"
                    >
                      <ActivityIcon className="w-3.5 h-3.5 text-[#244A36]" />
                      <span>Risk Details</span>
                    </button>
                    <button
                      onClick={() => navigateTo('/alerts')}
                      className="flex-1 py-2.5 rounded-xl border border-[#244A36]/20 text-[#1C2826] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/60 transition-colors"
                    >
                      <AlertTriangleIcon className="w-3.5 h-3.5 text-[#C87941]" />
                      <span>Alerts</span>
                    </button>
                  </div>
                </div>
              ) : !selectedStateData ? (
                /* Placeholder */
                <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center flex-1">
                  <div className="w-14 h-14 rounded-2xl liquid-glass flex items-center justify-center mb-4 text-[#244A36]">
                    <CompassIcon className="w-7 h-7 text-[#244A36]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1C2826] mb-1">Select a Location</h3>
                  <p className="text-xs text-[#5E7E67] max-w-xs leading-relaxed font-medium mb-4">
                    Click any risk marker on the map, or use the Safe Evacuation button to plan risk-weighted routes.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEvacuationMode(true);
                      setShowMobilePanel(true);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-[#244A36] text-[#FAF7F2] text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#1E3A2B] transition-all"
                  >
                    <RouteIcon className="w-3.5 h-3.5" />
                    <span>Plan Safe Evacuation</span>
                  </button>
                </div>
              ) : null}

              {/* NER Overview Summary */}
              <div className="liquid-glass rounded-3xl p-5 hidden lg:block">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#244A36]/10">
                  <h3 className="text-xs font-bold text-[#1C2826] uppercase tracking-wider flex items-center gap-2">
                    <ZapIcon className="w-4 h-4 text-[#C87941]" /> NER Monitoring Overview
                  </h3>
                  <span className="text-[10px] font-bold text-[#5E7E67] bg-white px-2 py-0.5 rounded-full border border-[#244A36]/10">
                    8 States
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="glass-widget p-2.5 rounded-2xl">
                    <span className="text-[10px] font-bold text-[#5E7E67] uppercase block">Locations</span>
                    <span className="text-base font-bold text-[#1C2826] mt-0.5 block">{locations.length}</span>
                  </div>
                  <div className="glass-widget p-2.5 rounded-2xl">
                    <span className="text-[10px] font-bold text-[#5E7E67] uppercase block">Slide Records</span>
                    <span className="text-base font-bold text-[#C87941] mt-0.5 block">{landslides.length}</span>
                  </div>
                  <div className="glass-widget p-2.5 rounded-2xl">
                    <span className="text-[10px] font-bold text-[#5E7E67] uppercase block">Active Alerts</span>
                    <span className="text-base font-bold text-[#C87941] mt-0.5 block">{activeAlertsCount} Active</span>
                  </div>
                </div>

                {/* Prototype data notice */}
                <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-[#C87941]/6 border border-[#C87941]/15">
                  <InfoIcon className="w-3.5 h-3.5 text-[#C87941] shrink-0 mt-0.5" />
                  <p className="text-[9.5px] text-[#5E7E67] leading-relaxed">
                    <strong className="text-[#C87941]">Prototype:</strong> {DATA_SOURCE_NOTE}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
