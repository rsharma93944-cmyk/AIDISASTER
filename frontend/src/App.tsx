import { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Radio,
  MapPin,
  ShieldCheck,
  Menu,
  X,
  BarChart3,
  Info,
  ChevronRight,
  Database,
  Cpu,
  Bell,

  ArrowRight,
  AlertCircle,
  Zap,
  Layers,
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import LiveMap from './pages/LiveMap';
import RiskMonitoring from './pages/RiskMonitoring';
import Alerts from './pages/Alerts';
import ImageAnalysis from './pages/ImageAnalysis';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Assistant from './pages/Assistant';
import Footer from './components/Footer';
import RiskSimulator from './pages/RiskSimulator';
import RescueTeam from './pages/RescueTeam';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RiskProvider, useRisk } from './context/RiskContext';
import { User as UserIcon, LogOut, ChevronDown, MessageCircle } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapCenter = {
  lat: 26.2006,
  lng: 92.9376 // Center of North Eastern Region
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#FAF7F2' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#5E7E67' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#FAF7F2' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#E4DFD5' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#EFECE5' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'landscape.natural.terrain', elementType: 'geometry', stylers: [{ color: '#EAE5DB' }] }
  ]
};

const riskMarkers = [
  { id: 'gangtok', position: { lat: 27.3314, lng: 88.6138 }, title: 'Gangtok (NH-10)', status: 'Level 2 Watch', color: '#C87941' },
  { id: 'shillong', position: { lat: 25.5788, lng: 91.8933 }, title: 'Shillong', status: 'Normal • 12mm/h', color: '#244A36' },
  { id: 'guwahati', position: { lat: 26.1445, lng: 91.7362 }, title: 'Guwahati', status: 'Hub Station', color: '#244A36' },
  { id: 'itanagar', position: { lat: 27.0844, lng: 93.6053 }, title: 'Itanagar', status: 'Stable', color: '#244A36' },
  { id: 'dima-hasao', position: { lat: 25.1856, lng: 93.0232 }, title: 'Dima Hasao', status: 'Low Risk (FS: 1.6)', color: '#C87941' },
];
// Custom Minimal Mountain + Warning/Signal Logo SVG
function ResQAILogo() {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      <div className="relative w-8 h-8 rounded-full bg-[#1E3A2B]/8 flex items-center justify-center border border-[#1E3A2B]/15 group-hover:bg-[#1E3A2B]/12 transition-all duration-200">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-[#1E3A2B]"
        >
          {/* Mountain Silhouette */}
          <path
            d="M5 24L12 12L17 19L21 14L27 24H5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            className="text-[#1E3A2B]"
          />
          <path
            d="M12 12L15 17L12 24"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
          {/* Early Warning Signal Waves / Pulse Indicator */}
          <circle cx="12" cy="8" r="1.5" fill="#C87941" />
          <path
            d="M8.5 7C9.5 5.5 10.7 5 12 5C13.3 5 14.5 5.5 15.5 7"
            stroke="#C87941"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] md:text-base font-bold tracking-tight text-[#1C2826] font-sans">
            ResQAI
          </span>
          <span className="hidden xl:inline-block text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#244A36]/10 text-[#244A36]">
            NE-GIS
          </span>
        </div>
        <span className="hidden sm:inline-block text-[9.5px] tracking-wide text-[#5E7E67] font-medium leading-none -mt-0.5">
          Early Warning System
        </span>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { activeAlertsCount } = useRisk();
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  // Dynamic navigation items based on real-time alerts count
  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'live-map', label: 'Live Map', badge: 'Live', path: '/live-map' },
    { id: 'risk-monitoring', label: 'Risk Monitoring', path: '/risk-monitoring' },
    { id: 'alerts', label: 'Alerts', count: activeAlertsCount > 0 ? activeAlertsCount : undefined, path: '/alerts' },
    { id: 'rescue-team', label: 'Rescue Team', path: '/rescue-team' },
    { id: 'analysis', label: 'Analysis', path: '/analysis' },
    { id: 'assistant', label: 'Assistant', path: '/assistant' },
    { id: 'risk-simulator', label: 'Simulator', path: '/risk-simulator' },
  ];

  // Google Maps Loader
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  // Protected routes check - only /profile requires authentication
  const isProtectedRoute = (path: string) => {
    return path === '/profile';
  };

  // Listen to browser navigation and route synchronization
  useEffect(() => {
    if (loading) return;

    const handleLocationChange = () => {
      const path = window.location.pathname;

      // Protected route redirection if not logged in
      if (isProtectedRoute(path) && !isAuthenticated) {
        window.history.replaceState({}, '', `/login?redirect=${encodeURIComponent(path)}`);
        setActiveTab('login');
        setActiveModal(null);
        return;
      }

      if (path === '/login') {
        setActiveTab('login');
        setActiveModal(null);
      } else if (path === '/register') {
        setActiveTab('register');
        setActiveModal(null);
      } else if (path === '/profile') {
        setActiveTab('profile');
        setActiveModal(null);
      } else if (path === '/live-map') {
        setActiveTab('live-map');
        setActiveModal(null);
      } else if (path === '/risk-monitoring' || path === '/dashboard') {
        setActiveTab('risk-monitoring');
        setActiveModal(null);
      } else if (path === '/alerts') {
        setActiveTab('alerts');
        setActiveModal(null);
      } else if (path === '/rescue-team') {
        setActiveTab('rescue-team');
        setActiveModal(null);
      } else if (path === '/analysis') {
        setActiveTab('analysis');
        setActiveModal(null);
      } else if (path === '/assistant') {
        setActiveTab('assistant');
        setActiveModal(null);
      } else if (path === '/risk-simulator') {
        setActiveTab('risk-simulator');
        setActiveModal(null);
      } else if (path === '/about') {
        setActiveTab('about');
        setActiveModal('about');
      } else if (path === '/image-analysis') {
        const el = document.getElementById('ai-image-analysis');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setActiveTab('home');
        setActiveModal(null);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [isAuthenticated, loading]);

  const navigateTo = (path: string, modalId?: string) => {
    if (isProtectedRoute(path) && !loading && !isAuthenticated) {
      window.history.pushState({}, '', `/login?redirect=${encodeURIComponent(path)}`);
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
      setActiveModal(null);
      setActiveTab('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.history.pushState({}, '', path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);

    if (path === '/login') {
      setActiveModal(null);
      setActiveTab('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/register') {
      setActiveModal(null);
      setActiveTab('register');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/profile') {
      setActiveModal(null);
      setActiveTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/live-map') {
      setActiveModal(null);
      setActiveTab('live-map');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/risk-monitoring' || path === '/dashboard') {
      setActiveModal(null);
      setActiveTab('risk-monitoring');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/alerts') {
      setActiveModal(null);
      setActiveTab('alerts');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/rescue-team') {
      setActiveModal(null);
      setActiveTab('rescue-team');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/analysis') {
      setActiveModal(null);
      setActiveTab('analysis');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/assistant') {
      setActiveModal(null);
      setActiveTab('assistant');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/risk-simulator') {
      setActiveModal(null);
      setActiveTab('risk-simulator');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/about') {
      setActiveModal('about');
      setActiveTab('about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (modalId) {
      setActiveModal(modalId);
      setActiveTab(modalId);
    } else if (path === '/image-analysis') {
      const el = document.getElementById('ai-image-analysis');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveModal(null);
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    if (tabId === 'home') {
      navigateTo('/');
    } else if (tabId === 'live-map') {
      navigateTo('/live-map');
    } else if (tabId === 'risk-monitoring') {
      navigateTo('/risk-monitoring');
    } else if (tabId === 'alerts') {
      navigateTo('/alerts');
    } else if (tabId === 'rescue-team') {
      navigateTo('/rescue-team');
    } else if (tabId === 'analysis') {
      navigateTo('/analysis');
    } else if (tabId === 'assistant') {
      navigateTo('/assistant');
    } else if (tabId === 'about') {
      navigateTo('/about', 'about');
    } else {
      navigateTo(`/${tabId}`, tabId);
    }
  };

  const userInitials = (user?.name || 'DU')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative w-full min-h-screen bg-[#FAF7F2] font-sans selection:bg-[#244A36]/20 overflow-x-hidden">
      

        {/* ========================================================================= */}
        {/* CAPSULE NAVBAR                                                           */}
        {/* ========================================================================= */}
        <header className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <nav
            className="pointer-events-auto relative w-full max-w-5xl liquid-glass rounded-full px-3.5 sm:px-5 py-2 md:py-2.5 flex items-center justify-between transition-all duration-300"
            aria-label="Main Navigation"
          >
            {/* Left: Logo */}
            <div
              onClick={() => handleNavClick('home')}
              className="flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <ResQAILogo />
            </div>

            {/* Center: Navigation Links (Desktop & Tablet) */}
            <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-3.5 lg:px-4 py-1.5 rounded-full text-[13px] lg:text-[13.5px] font-medium tracking-normal transition-all duration-250 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#244A36] text-[#FAF7F2] shadow-[0_4px_12px_rgba(36,74,54,0.25)] border border-[#3D6950]/40'
                        : 'text-[#2B3A33] hover:text-[#141D1A] hover:bg-white/80 hover:shadow-sm hover:border-[#244A36]/15 border border-transparent'
                    }`}
                  >
                    <span>{item.label}</span>

                    {/* Optional Live Indicator or Badge */}
                    {item.badge && !isActive && (
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#526E48] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#526E48]"></span>
                      </span>
                    )}
                    {item.count && !isActive && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#C87941]/15 text-[#C87941]">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Auth Profile Area / Sign In + Action Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* About Link (Desktop) */}
              <button
                type="button"
                onClick={() => handleNavClick('about')}
                className={`hidden lg:inline-flex px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  activeTab === 'about'
                    ? 'bg-[#244A36] text-[#FAF7F2] shadow-sm'
                    : 'text-[#2B3A33] hover:text-[#141D1A] hover:bg-white/80 hover:shadow-sm hover:border-[#244A36]/15 border border-transparent'
                }`}
              >
                About
              </button>

              {/* Profile Dropdown / Sign In Area */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-[#244A36]/8 hover:bg-white/90 border border-[#244A36]/15 transition-all text-[#1C2826] hover:shadow-md"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#244A36] text-[#FAF7F2] flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                      {userInitials}
                    </div>
                    <span className="hidden xl:inline-block text-xs font-bold text-[#1C2826] max-w-[80px] truncate">
                      {user?.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#5E7E67]" />
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-56 liquid-glass-modal rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-[#244A36]/10 mb-1">
                        <span className="text-xs font-bold text-[#1C2826] block truncate">{user?.name}</span>
                        <span className="text-[10px] text-[#5E7E67] truncate block">{user?.email}</span>
                        <span className="text-[9px] font-bold text-[#244A36] bg-[#244A36]/10 px-1.5 py-0.2 rounded-md uppercase mt-1 inline-block">
                          {user?.accountType}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigateTo('/profile')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2826] hover:bg-[#FAF7F2] flex items-center gap-2 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#244A36]" />
                        <span>User Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTo('/profile')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2826] hover:bg-[#FAF7F2] flex items-center gap-2 transition-colors"
                      >
                        <Bell className="w-3.5 h-3.5 text-[#C87941]" />
                        <span>Notification Preferences</span>
                      </button>

                      <div className="pt-1 mt-1 border-t border-[#244A36]/10">
                        <button
                          type="button"
                          onClick={async () => {
                            await logout();
                            setUserDropdownOpen(false);
                            navigateTo('/login');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#7A2E2E] hover:bg-[#7A2E2E]/10 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo('/login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-semibold text-[#244A36] hover:bg-[#244A36]/10 border border-[#244A36]/20 transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Monitor Risk Primary Button */}
              <button
                type="button"
                onClick={() => navigateTo('/risk-monitoring')}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#244A36] text-[#FAF7F2] text-[12.5px] sm:text-[13px] font-semibold tracking-wide hover:bg-[#1B3828] active:scale-[0.98] transition-all duration-200 shadow-[0_2px_8px_rgba(36,74,54,0.22)] border border-[#2E5A44]/30"
              >
                <Activity className="w-3.5 h-3.5 text-[#A3C7AD]" />
                <span>Monitor Risk</span>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#1C2826] hover:bg-[#1C2826]/5 transition-colors focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </div>
          </nav>
        </header>

        {/* ========================================================================= */}
        {/* MOBILE EXPANDING CAPSULE DRAWER                                           */}
        {/* ========================================================================= */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-4 top-20 z-40 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-[#FAF7F2]/95 backdrop-blur-2xl border border-[#244A36]/15 rounded-3xl p-4 shadow-[0_16px_40px_rgba(28,40,34,0.18)] flex flex-col gap-1.5">
              
              {/* User tile if logged in */}
              {isAuthenticated ? (
                <div className="p-3 bg-white rounded-2xl border border-[#244A36]/10 mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#244A36] text-white flex items-center justify-center text-xs font-bold">
                      {userInitials}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1C2826] block">{user?.name}</span>
                      <span className="text-[10px] text-[#5E7E67] block">{user?.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('/profile')}
                    className="px-2.5 py-1 bg-[#244A36]/10 text-[#244A36] rounded-xl text-[11px] font-bold"
                  >
                    Profile
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-white rounded-2xl border border-[#244A36]/10 mb-1 flex items-center justify-between">
                  <span className="text-xs text-[#5E7E67]">Account Access</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('/login')}
                    className="px-3 py-1 bg-[#244A36] text-white rounded-xl text-xs font-bold"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5E7E67] border-b border-[#244A36]/10 mb-1 flex items-center justify-between">
                <span>Landslide Monitoring Menu</span>
                <span className="text-[10px] bg-[#244A36]/10 text-[#244A36] px-1.5 py-0.5 rounded-full">
                  NE Sector Active
                </span>
              </div>

              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-[14px] font-medium flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-[#244A36] text-[#FAF7F2] font-semibold'
                        : 'text-[#2B3A33] hover:bg-[#1C2826]/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] bg-[#526E48] text-white px-1.5 py-0.2 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.count && (
                      <span className="text-[11px] bg-[#C87941]/20 text-[#C87941] px-2 py-0.5 rounded-full font-semibold">
                        {item.count} Active
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleNavClick('assistant')}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-[14px] font-medium flex items-center justify-between transition-all ${
                  activeTab === 'assistant'
                    ? 'bg-[#244A36] text-[#FAF7F2]'
                    : 'text-[#2B3A33] hover:bg-[#1C2826]/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Disaster Assistant</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('about')}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-[14px] font-medium flex items-center justify-between transition-all ${
                  activeTab === 'about'
                    ? 'bg-[#244A36] text-[#FAF7F2]'
                    : 'text-[#2B3A33] hover:bg-[#1C2826]/5'
                }`}
              >
                <span>About Project</span>
                <Info className="w-4 h-4 text-[#5E7E67]" />
              </button>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    navigateTo('/login');
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-2xl text-[13px] font-bold text-[#7A2E2E] hover:bg-[#7A2E2E]/10 flex items-center gap-2 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}

              <div className="pt-2 border-t border-[#244A36]/10 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('/risk-monitoring');
                  }}
                  className="w-full py-2.5 rounded-2xl bg-[#244A36] text-[#FAF7F2] text-[13.5px] font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Activity className="w-4 h-4 text-[#A3C7AD]" />
                  <span>Launch Risk Assessment</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* ========================================================================= */}
        {/* PAGE CONDITIONAL ROUTING                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'login' ? (
          <Login />
        ) : activeTab === 'register' ? (
          <Register />
        ) : activeTab === 'profile' ? (
          <Profile />
        ) : activeTab === 'live-map' ? (
          <LiveMap isLoaded={isLoaded} />
        ) : activeTab === 'risk-monitoring' ? (
          <RiskMonitoring />
        ) : activeTab === 'alerts' ? (
          <Alerts />
        ) : activeTab === 'rescue-team' ? (
          <RescueTeam />
        ) : activeTab === 'analysis' ? (
          <ImageAnalysis />
        ) : activeTab === 'assistant' ? (
          <Assistant />
        ) : activeTab === 'risk-simulator' ? (
          <RiskSimulator />
        ) : (
          <>
      {/* ========================================================================= */}
      {/* SECTION: HERO SECTION WITH BACKGROUND VIDEO                               */}
      {/* ========================================================================= */}
      <section className="relative w-full h-[90vh] min-h-[560px] md:h-screen md:min-h-[640px] overflow-hidden bg-[#FAF7F2]">
        {/* Background Video Layer */}
        <div className="absolute inset-0 z-0">
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260820_010308_b1636845-4c15-4ab6-b0c9-9a29bfb0c6e3.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-bottom"
          />
          {/* Soft atmospheric gradient on left to ensure optimal text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/80 via-[#FAF7F2]/30 to-transparent pointer-events-none md:w-3/4" />
          {/* Subtle organic top gradient for navbar contrast */}
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#FAF7F2]/50 via-[#FAF7F2]/15 to-transparent pointer-events-none" />
          {/* Subtle bottom fade to transition seamlessly into Section 1 */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF7F2] to-transparent pointer-events-none" />
        </div>


        {/* ========================================================================= */}
        {/* HERO CONTENT AREA (Left-Aligned)                                          */}
        {/* ========================================================================= */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 sm:pt-24 md:pt-28 pb-10 pointer-events-none">
          <div className="max-w-2xl text-left pointer-events-auto flex flex-col items-start animate-fade-up">
            {/* Eyebrow Pill: NATURE WARNS. WE ACT. */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2]/90 backdrop-blur-md border border-[#244A36]/15 shadow-sm mb-2.5 md:mb-3">
              <span className="w-2 h-2 rounded-full bg-[#C87941] animate-pulse" />
              <span className="text-[10.5px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#1E3A2B]">
                NATURE WARNS. WE ACT.
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-bold text-[#1C2826] tracking-tight leading-[1.12] mb-2.5 md:mb-3 font-sans">
              AI-powered landslide <br className="hidden sm:inline" />
              <span className="text-[#244A36]">early warning</span> for Northeast India
            </h1>

            {/* Supporting Micro-Copy */}
            <p className="text-sm sm:text-base text-[#3A4D43] leading-relaxed max-w-xl mb-4 md:mb-5 font-medium">
              Continuous real-time geotechnical telemetry, InSAR displacement tracking, and physics-informed AI modeling to safeguard arterial mountain corridors and vulnerable hill settlements.
            </p>

            {/* Action Button Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigateTo('/live-map', 'live-map')}
                className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-[#244A36] text-[#FAF7F2] text-xs sm:text-sm font-semibold tracking-wide hover:bg-[#1B3828] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(36,74,54,0.25)] border border-[#2E5A44]/30"
              >
                <MapPin className="w-4 h-4 text-[#A3C7AD]" />
                <span>Explore Live Grid</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FAF7F2]/70" />
              </button>

              <button
                type="button"
                onClick={() => navigateTo('/risk-monitoring', 'risk-monitoring')}
                className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-[#FAF7F2]/85 backdrop-blur-md text-[#1C2826] text-xs sm:text-sm font-semibold hover:bg-[#FAF7F2] border border-[#244A36]/15 active:scale-[0.98] transition-all duration-200 shadow-sm"
              >
                <Activity className="w-4 h-4 text-[#244A36]" />
                <span>Telemetry Stream</span>
              </button>
            </div>
          </div>

          {/* Bottom Telemetry Status Bar */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#2B3A33] pt-3">
            <div className="bg-[#FAF7F2]/80 backdrop-blur-md border border-[#244A36]/12 px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 font-medium text-[11.5px]">
                <span className="w-2 h-2 rounded-full bg-[#526E48] animate-pulse" />
                Northeast Early Warning Grid
              </span>
              <span className="h-3 w-px bg-[#244A36]/15" />
              <span className="hidden sm:inline text-[11.5px] text-[#5E7E67]">
                Assam • Sikkim • Meghalaya • Arunachal • Mizoram
              </span>
              <button
                onClick={() => navigateTo('/live-map', 'live-map')}
                className="text-[11.5px] text-[#244A36] font-semibold flex items-center gap-0.5 hover:underline"
              >
                <span>View Radar</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1 — HOW RESQAI WORKS                                              */}
      {/* ========================================================================= */}
      <section
        id="how-it-works"
        className="relative w-full py-12 sm:py-16 px-6 sm:px-8 lg:px-12 border-t border-[#244A36]/10 text-[#1C2826] overflow-hidden"
      >
        {/* Ambient Liquid Gradient Refraction Spots */}
        <div className="pointer-events-none absolute -top-32 left-1/4 w-[420px] h-[420px] bg-[#244A36]/7 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/4 w-[420px] h-[420px] bg-[#C87941]/7 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/80 shadow-sm mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#244A36] animate-pulse" />
            <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-[#244A36]">
              Intelligent Pipeline
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C2826] tracking-tight mb-2 font-sans">
            How ResQAI Works
          </h2>
          <p className="text-xs sm:text-sm text-[#5E7E67] font-medium max-w-2xl mb-8 leading-relaxed">
            From multi-source sensor telemetry to physics-guided AI inference and real-time community early warnings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 w-full relative">
            {/* Connecting Liquid Pipeline Track (Desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#244A36]/10 via-[#244A36]/30 to-[#244A36]/10 z-0" />
            
            {/* CARD 01: DATA INGESTION */}
            <div className="liquid-flow-card rounded-3xl p-5 relative z-10 flex flex-col items-center text-center cursor-default group overflow-hidden">
              {/* Specular Shimmer Sheen */}
              <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              
              {/* Internal Glass Highlight */}
              <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

              <span className="text-[9.5px] font-mono font-extrabold text-[#C87941] bg-[#C87941]/10 px-2.5 py-0.5 rounded-full border border-[#C87941]/25 mb-2.5 shadow-xs backdrop-blur-md">
                STAGE 01
              </span>

              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-white/95 via-white/80 to-white/40 backdrop-blur-2xl border border-white shadow-[0_8px_20px_rgba(200,121,65,0.15)] flex items-center justify-center text-[#C87941] mb-2.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Database className="w-6 h-6 text-[#C87941]" />
              </div>

              <h3 className="text-xs sm:text-[13px] font-bold text-[#1C2826] uppercase mb-1 tracking-wider">
                DATA INGESTION
              </h3>
              <p className="text-[11.5px] text-[#5E7E67] font-medium leading-relaxed">
                Rainfall • Terrain Slope • Satellite InSAR • Historical Geotechnical Records
              </p>
            </div>
            
            {/* CARD 02: AI ANALYSIS */}
            <div className="liquid-flow-card rounded-3xl p-5 relative z-10 flex flex-col items-center text-center cursor-default group overflow-hidden">
              {/* Specular Shimmer Sheen */}
              <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              
              {/* Internal Glass Highlight */}
              <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

              <span className="text-[9.5px] font-mono font-extrabold text-[#244A36] bg-[#244A36]/10 px-2.5 py-0.5 rounded-full border border-[#244A36]/25 mb-2.5 shadow-xs backdrop-blur-md">
                STAGE 02
              </span>

              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-white/95 via-white/80 to-white/40 backdrop-blur-2xl border border-white shadow-[0_8px_20px_rgba(36,74,54,0.15)] flex items-center justify-center text-[#244A36] mb-2.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Cpu className="w-6 h-6 text-[#244A36]" />
              </div>

              <h3 className="text-xs sm:text-[13px] font-bold text-[#1C2826] uppercase mb-1 tracking-wider">
                AI / ML INFERENCE
              </h3>
              <p className="text-[11.5px] text-[#5E7E67] font-medium leading-relaxed">
                YOLO11 visual slope fracture detection & geotechnical hazard modeling
              </p>
            </div>

            {/* CARD 03: RISK ASSESSMENT */}
            <div className="liquid-flow-card rounded-3xl p-5 relative z-10 flex flex-col items-center text-center cursor-default group overflow-hidden">
              {/* Specular Shimmer Sheen */}
              <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              
              {/* Internal Glass Highlight */}
              <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

              <span className="text-[9.5px] font-mono font-extrabold text-[#526E48] bg-[#526E48]/10 px-2.5 py-0.5 rounded-full border border-[#526E48]/25 mb-2.5 shadow-xs backdrop-blur-md">
                STAGE 03
              </span>

              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-white/95 via-white/80 to-white/40 backdrop-blur-2xl border border-white shadow-[0_8px_20px_rgba(82,110,72,0.15)] flex items-center justify-center text-[#526E48] mb-2.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Activity className="w-6 h-6 text-[#526E48]" />
              </div>

              <h3 className="text-xs sm:text-[13px] font-bold text-[#1C2826] uppercase mb-1 tracking-wider">
                RISK EVALUATION
              </h3>
              <p className="text-[11.5px] text-[#5E7E67] font-medium leading-relaxed">
                Multi-factor risk score generation for monitored NER corridors & communities
              </p>
            </div>

            {/* CARD 04: EARLY WARNING */}
            <div className="liquid-flow-card rounded-3xl p-5 relative z-10 flex flex-col items-center text-center cursor-default group overflow-hidden">
              {/* Specular Shimmer Sheen */}
              <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              
              {/* Internal Glass Highlight */}
              <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

              <span className="text-[9.5px] font-mono font-extrabold text-[#A05C2C] bg-[#A05C2C]/10 px-2.5 py-0.5 rounded-full border border-[#A05C2C]/25 mb-2.5 shadow-xs backdrop-blur-md">
                STAGE 04
              </span>

              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-white/95 via-white/80 to-white/40 backdrop-blur-2xl border border-white shadow-[0_8px_20px_rgba(160,92,44,0.15)] flex items-center justify-center text-[#A05C2C] mb-2.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Bell className="w-6 h-6 text-[#A05C2C]" />
              </div>

              <h3 className="text-xs sm:text-[13px] font-bold text-[#1C2826] uppercase mb-1 tracking-wider">
                EARLY WARNING
              </h3>
              <p className="text-[11.5px] text-[#5E7E67] font-medium leading-relaxed">
                Automated multi-channel alerts to district authorities & mountain responders
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2 — NER RISK OVERVIEW                                               */}
      {/* ========================================================================= */}
      <section
        id="ner-risk-overview"
        className="relative w-full py-12 sm:py-16 px-6 sm:px-8 lg:px-12 border-t border-[#244A36]/10 text-[#1C2826] overflow-hidden"
      >
        {/* Ambient Refraction Glows */}
        <div className="pointer-events-none absolute -top-40 right-10 w-[500px] h-[500px] bg-[#526E48]/8 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-10 w-[500px] h-[500px] bg-[#244A36]/8 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/80 shadow-sm mb-2">
                <span className="w-2 h-2 rounded-full bg-[#526E48] animate-pulse" />
                <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-[#244A36]">
                  Geographic Intelligence
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C2826] tracking-tight mb-1 font-sans">
                NER Risk Overview
              </h2>
              <p className="text-xs sm:text-sm text-[#5E7E67] max-w-xl font-medium">
                North Eastern Region environmental monitoring grid & live telemetry stations.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass border border-[#C87941]/30 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#C87941] animate-pulse" />
              <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#C87941]">
                Live Sector Telemetry
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Google Map Panel */}
            <div className="lg:col-span-8 liquid-glass rounded-3xl p-4 sm:p-5 min-h-[420px] flex flex-col border border-white/80 shadow-xl shadow-[#244A36]/8">
              <div className="relative flex-1 w-full h-full rounded-2xl overflow-hidden border border-white/60 shadow-inner">
                {!isLoaded ? (
                  <div className="w-full h-full bg-white/40 backdrop-blur-md flex items-center justify-center animate-pulse">
                    <span className="text-xs font-semibold text-[#5E7E67]">Loading Maps...</span>
                  </div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={6.5}
                    options={mapOptions}
                    onClick={() => setActiveMarker(null)}
                  >
                    {riskMarkers.map((marker) => (
                      <Marker
                        key={marker.id}
                        position={marker.position}
                        onClick={() => setActiveMarker(marker.id)}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          fillColor: marker.color,
                          fillOpacity: 1,
                          strokeWeight: 0,
                          scale: 7
                        }}
                      />
                    ))}
                    {activeMarker && (
                      <InfoWindow
                        position={riskMarkers.find(m => m.id === activeMarker)?.position}
                        onCloseClick={() => setActiveMarker(null)}
                      >
                        <div className="p-1">
                          <h4 className="text-[13px] font-bold text-[#1C2826] m-0">{riskMarkers.find(m => m.id === activeMarker)?.title}</h4>
                          <p className="text-[11px] text-[#5E7E67] m-0 mt-0.5 font-medium">{riskMarkers.find(m => m.id === activeMarker)?.status}</p>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                )}
              </div>
            </div>

            {/* Dashboard Sidebar */}
            <div className="lg:col-span-4 liquid-glass rounded-3xl p-4 sm:p-5 flex flex-col gap-4 border border-white/80 shadow-xl shadow-[#244A36]/8">
              <div>
                <h3 className="text-xs sm:text-[13px] font-bold text-[#1C2826] uppercase mb-2.5 tracking-wider">
                  8 NER States Monitored
                </h3>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-[#5E7E67] font-medium">
                  {['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'].map(state => (
                    <div key={state} className="px-2.5 py-2 glass-card rounded-xl flex items-center gap-1.5 hover:text-[#1C2826] cursor-default border border-white/70 shadow-xs transition-all hover:scale-[1.02]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#244A36]" />
                      <span className="text-[11px]">{state}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#244A36]/10 pt-3">
                <h3 className="text-xs sm:text-[13px] font-bold text-[#1C2826] uppercase mb-2.5 tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#C87941] animate-pulse" />
                  Active Corridor Watches
                </h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl glass-card border border-white/70 backdrop-blur-md transition-all hover:scale-[1.02]">
                    <span className="text-[9.5px] font-bold text-[#C87941] bg-[#C87941]/10 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mb-0.5 border border-[#C87941]/20">
                      Level 2 Watch
                    </span>
                    <span className="text-xs text-[#1C2826] font-bold block">NH-10 (Gangtok Corridor)</span>
                    <span className="text-[10.5px] text-[#5E7E67] font-medium block mt-0.5">Telemetry threshold breach: 142mm rain</span>
                  </div>
                  <div className="p-3 rounded-2xl glass-card border border-white/70 backdrop-blur-md transition-all hover:scale-[1.02]">
                    <span className="text-[9.5px] font-bold text-[#244A36] bg-[#244A36]/10 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mb-0.5 border border-[#244A36]/20">
                      Stable
                    </span>
                    <span className="text-xs text-[#1C2826] font-bold block">Shillong Pass (Meghalaya)</span>
                    <span className="text-[10.5px] text-[#5E7E67] font-medium block mt-0.5">Sensors normal • Safe transit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3 — WHY RESQAI                                                    */}
      {/* ========================================================================= */}
      <section
        id="why-resqai"
        className="relative w-full py-12 sm:py-16 px-6 sm:px-8 lg:px-12 border-t border-[#244A36]/10 text-[#1C2826] overflow-hidden"
      >
        {/* Ambient Liquid Refraction Spots */}
        <div className="pointer-events-none absolute -top-32 left-1/3 w-[450px] h-[450px] bg-[#244A36]/6 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 w-[450px] h-[450px] bg-[#C87941]/6 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/80 shadow-sm mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#C87941] animate-pulse" />
              <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-[#C87941]">
                Mission & Impact
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C2826] tracking-tight mb-2 font-sans">
              Why ResQAI?
            </h2>
            <p className="text-xs sm:text-sm text-[#5E7E67] font-medium max-w-2xl mx-auto leading-relaxed">
              Addressing complex mountain disaster risks with intelligent, proactive early warning systems.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* PROBLEM CARD */}
            <div className="liquid-flow-card p-5 sm:p-6 rounded-3xl relative flex flex-col items-start cursor-default group overflow-hidden">
              <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out" />

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/95 via-white/75 to-white/30 backdrop-blur-xl border border-white/90 shadow-[0_8px_20px_rgba(36,74,54,0.12)] flex items-center justify-center text-[#C87941] mb-3.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <AlertCircle className="w-5 h-5 text-[#C87941]" />
              </div>

              <span className="text-[9.5px] font-mono font-bold text-[#C87941] bg-[#C87941]/10 px-2.5 py-0.5 rounded-full uppercase mb-1.5 border border-[#C87941]/20">
                The Challenge
              </span>
              <h3 className="text-base font-bold text-[#1C2826] tracking-tight mb-1.5">
                Mountain Terrain Vulnerability
              </h3>
              <p className="text-xs sm:text-[13px] text-[#5E7E67] leading-relaxed font-medium">
                The North Eastern Region contains mountainous and landslide-prone areas where heavy monsoons, steep slopes, and seismic activity create sudden slope failures along critical transport corridors.
              </p>
            </div>

            {/* SOLUTION CARD */}
            <div className="liquid-flow-card p-5 sm:p-6 rounded-3xl relative flex flex-col items-start cursor-default group overflow-hidden">
              <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out" />

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/95 via-white/75 to-white/30 backdrop-blur-xl border border-white/90 shadow-[0_8px_20px_rgba(36,74,54,0.12)] flex items-center justify-center text-[#526E48] mb-3.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Zap className="w-5 h-5 text-[#526E48]" />
              </div>

              <span className="text-[9.5px] font-mono font-bold text-[#526E48] bg-[#526E48]/10 px-2.5 py-0.5 rounded-full uppercase mb-1.5 border border-[#526E48]/20">
                Our Innovation
              </span>
              <h3 className="text-base font-bold text-[#1C2826] tracking-tight mb-1.5">
                Unified AI & GIS Architecture
              </h3>
              <p className="text-xs sm:text-[13px] text-[#5E7E67] leading-relaxed font-medium">
                ResQAI synthesizes YOLO11 optical computer-vision, InSAR ground subsidence radar, Doppler rainfall metrics, and geotechnical IoT sensor nodes into one seamless operational platform.
              </p>
            </div>

            {/* GOAL CARD */}
            <div className="liquid-flow-card p-5 sm:p-6 rounded-3xl relative flex flex-col items-start cursor-default group overflow-hidden">
              <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out" />

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/95 via-white/75 to-white/30 backdrop-blur-xl border border-white/90 shadow-[0_8px_20px_rgba(36,74,54,0.12)] flex items-center justify-center text-[#244A36] mb-3.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <ShieldCheck className="w-5 h-5 text-[#244A36]" />
              </div>

              <span className="text-[9.5px] font-mono font-bold text-[#244A36] bg-[#244A36]/10 px-2.5 py-0.5 rounded-full uppercase mb-1.5 border border-[#244A36]/20">
                The Objective
              </span>
              <h3 className="text-base font-bold text-[#1C2826] tracking-tight mb-1.5">
                Proactive Life Protection
              </h3>
              <p className="text-xs sm:text-[13px] text-[#5E7E67] leading-relaxed font-medium">
                Deliver decisive 24–48 hour lead-time landslide warnings to district disaster authorities, emergency responders, and hill settlements before catastrophic slope release occurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HERITAGE GROVE FOOTER ===== */}
      <Footer />

        </>
        )}

      
{/* ========================================================================= */}
      {/* INTERACTIVE SIH MODALS / SENSOR HUD PANELS                                */}
      {/* ========================================================================= */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-[#141D1A]/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-2xl liquid-glass-modal rounded-3xl p-5 sm:p-6 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#244A36]/10 pb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#244A36] text-[#FAF7F2] flex items-center justify-center">
                  {activeModal === 'live-map' && <MapPin className="w-4 h-4" />}
                  {activeModal === 'risk-monitoring' && <Activity className="w-4 h-4" />}
                  {activeModal === 'alerts' && <AlertTriangle className="w-4 h-4" />}
                  {activeModal === 'analysis' && <BarChart3 className="w-4 h-4" />}
                  {activeModal === 'about' && <Info className="w-4 h-4" />}
                  {activeModal === 'monitor-risk' && <Radio className="w-4 h-4 text-[#C87941]" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1C2826]">
                    {activeModal === 'live-map' && 'Northeast India 3D GIS Landslide Radar'}
                    {activeModal === 'risk-monitoring' && 'Real-Time Sensor Telemetry Hub'}
                    {activeModal === 'alerts' && 'Early Warning Bulletin & Hazard Advisories'}
                    {activeModal === 'analysis' && 'AI Predictive Modeling & Slope Stability'}
                    {activeModal === 'about' && 'ResQAI Project Overview'}
                    {activeModal === 'monitor-risk' && 'Instant Regional Risk Assessment Scanner'}
                  </h3>
                  <p className="text-xs text-[#5E7E67]">
                    ResQAI • Intelligent Landslide Hazard Early Warning System
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#1C2826]/5 hover:bg-[#1C2826]/10 flex items-center justify-center text-[#1C2826] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Contents based on selected Nav Tab */}
            {activeModal === 'live-map' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="p-3.5 bg-white rounded-2xl border border-[#244A36]/10">
                    <span className="text-[11px] text-[#5E7E67] font-medium uppercase tracking-wider block mb-1">
                      NH-10 (Sevoke–Gangtok)
                    </span>
                    <span className="text-base font-bold text-[#C87941] block">
                      Moderate Risk (Level 2)
                    </span>
                    <span className="text-xs text-[#1C2826]/70">Soil Saturation: 76.4%</span>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-[#244A36]/10">
                    <span className="text-[11px] text-[#5E7E67] font-medium uppercase tracking-wider block mb-1">
                      East Khasi Hills (Shillong)
                    </span>
                    <span className="text-base font-bold text-[#244A36] block">
                      Normal / Stable
                    </span>
                    <span className="text-xs text-[#1C2826]/70">Precipitation: 12mm/hr</span>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-[#244A36]/10">
                    <span className="text-[11px] text-[#5E7E67] font-medium uppercase tracking-wider block mb-1">
                      Dima Hasao Corridor
                    </span>
                    <span className="text-base font-bold text-[#244A36] block">
                      Low Risk (FS: 1.62)
                    </span>
                    <span className="text-xs text-[#1C2826]/70">Slope Angle: 34°</span>
                  </div>
                </div>

                <div className="p-4 bg-[#244A36]/5 rounded-2xl border border-[#244A36]/10 flex items-start gap-3">
                  <Layers className="w-5 h-5 text-[#244A36] flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-[#2B3A33] leading-relaxed">
                    <strong>Multi-Layer GIS Integration:</strong> Synthesizing ISRO Bhuvan elevation digital models, IMD Doppler precipitation forecasts, and IoT borehole extensometers across all 8 North Eastern states.
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'risk-monitoring' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-2xl border border-[#244A36]/10">
                    <span className="text-[10px] text-[#5E7E67] uppercase font-bold block">InSAR Displacement</span>
                    <span className="text-lg font-bold text-[#1C2826] mt-1 block">1.8 mm/wk</span>
                    <span className="text-[10px] text-[#526E48]">Within Threshold</span>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-[#244A36]/10">
                    <span className="text-[10px] text-[#5E7E67] uppercase font-bold block">Pore Water Press.</span>
                    <span className="text-lg font-bold text-[#C87941] mt-1 block">42.8 kPa</span>
                    <span className="text-[10px] text-[#C87941]">Rising Trend</span>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-[#244A36]/10">
                    <span className="text-[10px] text-[#5E7E67] uppercase font-bold block">Tiltmeter Axis</span>
                    <span className="text-lg font-bold text-[#1C2826] mt-1 block">0.04°</span>
                    <span className="text-[10px] text-[#526E48]">Nominal</span>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-[#244A36]/10">
                    <span className="text-[10px] text-[#5E7E67] uppercase font-bold block">Active Nodes</span>
                    <span className="text-lg font-bold text-[#244A36] mt-1 block">148 / 150</span>
                    <span className="text-[10px] text-[#526E48]">98.6% Online</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#244A36]/10 text-xs text-[#2B3A33] space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>Edge AI Sensor Health Status</span>
                    <span className="text-[#526E48]">Optimal</span>
                  </div>
                  <div className="w-full bg-[#1C2826]/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#244A36] h-full w-[94%]" />
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'alerts' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-[#C87941]/10 border border-[#C87941]/25 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#C87941] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#C87941]">LEVEL 2 WATCH</span>
                      <span className="text-[10px] text-[#1C2826]/60">12 mins ago</span>
                    </div>
                    <p className="text-xs text-[#1C2826] mt-1">
                      Heavy localized precipitation triggered early pore-pressure elevation along South Sikkim ridge (Melli–Jorethang sector).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-[#526E48]/10 border border-[#526E48]/25 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#526E48] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#526E48]">CLEARANCE ADVISORY</span>
                      <span className="text-[10px] text-[#1C2826]/60">1 hour ago</span>
                    </div>
                    <p className="text-xs text-[#1C2826] mt-1">
                      Cherrapunji–Mawsynram catchment slope movement stabilized following rainfall taper.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'analysis' && (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-[#244A36]/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C2826]">Predictive Model Confidence</span>
                    <span className="text-xs font-bold text-[#244A36]">98.4% (LSTM + Spatial-GNN)</span>
                  </div>
                  <div className="w-full bg-[#1C2826]/10 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#244A36] h-full w-[98.4%]" />
                  </div>
                  <p className="text-xs text-[#5E7E67]">
                    Trained on 25+ years of Geological Survey of India (GSI) landslide inventory data across Northeast Himalayan terrains.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#2B3A33]">
                  <div className="p-3 bg-[#244A36]/5 rounded-xl border border-[#244A36]/10">
                    <strong>Lead Time:</strong> 18–36 hours prior to critical slope failure.
                  </div>
                  <div className="p-3 bg-[#244A36]/5 rounded-xl border border-[#244A36]/10">
                    <strong>False Alarm Reduction:</strong> 64.2% over heuristic models.
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'about' && (
              <div className="space-y-3 text-xs text-[#2B3A33] leading-relaxed">
                <p className="text-sm font-semibold text-[#1C2826]">
                  “Nature Warns. We Act.”
                </p>
                <p>
                  <strong>ResQAI</strong> is an intelligent Early Warning & Landslide Risk Monitoring platform specifically architected for the vulnerable mountainous terrains of <strong>North Eastern India</strong> (Smart India Hackathon project).
                </p>
                <p>
                  By synthesizing real-time IoT geotechnical sensors (pore pressure, tiltmeters, acoustic emission), satellite InSAR displacement vectors, and meteorological forecasts with physics-informed deep learning models, ResQAI provides actionable early alerts to local disaster management authorities, border road organizations, and local hill communities.
                </p>
              </div>
            )}

            {activeModal === 'monitor-risk' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-16 h-16 rounded-full bg-[#244A36]/10 text-[#244A36] flex items-center justify-center mx-auto animate-pulse">
                  <Activity className="w-8 h-8 text-[#244A36]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#1C2826]">
                    Northeast Sector Telemetry Scan Active
                  </h4>
                  <p className="text-xs text-[#5E7E67] mt-1 max-w-md mx-auto">
                    Polling 148 IoT nodes across 8 states. All critical arterial highways (NH-10, NH-29, NH-51) currently within safe operating thresholds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('/live-map', 'live-map')}
                  className="px-5 py-2.5 rounded-full bg-[#244A36] text-[#FAF7F2] text-xs font-semibold hover:bg-[#1B3828] transition-colors"
                >
                  Explore Detailed Geographic Grid
                </button>
              </div>
            )}

            {/* Modal Footer Action */}
            <div className="pt-2 border-t border-[#244A36]/10 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-full bg-[#1C2826]/10 text-[#1C2826] text-xs font-semibold hover:bg-[#1C2826]/15 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RiskProvider>
        <AppContent />
      </RiskProvider>
    </AuthProvider>
  );
}

