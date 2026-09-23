import { useState, useEffect, FormEvent } from 'react';
import { 
  User, Mail, MapPin, Shield, Bell, CheckCircle2, 
  LogOut, Save, ShieldAlert, CloudRain, 
  Layers, UserCheck, PhoneCall, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserPreferences } from '../services/authService';
import EmergencyContactsModal from '../components/EmergencyContactsModal';

const NER_STATES = [
  'Arunachal Pradesh',
  'Assam',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura',
  'Northeast India (NER)'
];

export default function Profile() {
  const { user, updatePreferences, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [preferredRegion, setPreferredRegion] = useState(user?.preferredRegion || 'Northeast India (NER)');
  const [preferences, setPreferences] = useState<UserPreferences>(user?.preferences || {
    severeAlerts: true,
    highRiskAlerts: true,
    rainfallWarnings: true,
    regionalUpdates: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPreferredRegion(user.preferredRegion);
      if (user.preferences) {
        setPreferences(user.preferences);
      }
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSaveInfo = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    try {
      await updateProfile(name, preferredRegion);
      showToast('Personal information updated successfully.');
    } catch (_e) {
      showToast('Failed to update personal details.');
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    try {
      await updatePreferences(preferences);
      showToast('Notification preferences saved.');
    } catch (_e) {
      showToast('Failed to save preferences.');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Get initials
  const initials = (user?.name || 'DU')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col font-sans selection:bg-[#244A36]/20">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 liquid-glass text-[#1C2826] px-5 py-3 rounded-2xl shadow-2xl border border-white/80 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#526E48]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROFILE HEADER & AVATAR BANNER                                           */}
      {/* ========================================================================= */}
      <div className="liquid-glass rounded-3xl border border-white/60 p-6 sm:p-8 shadow-lg shadow-[#244A36]/5 mb-8 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#244A36] via-[#526E48] to-[#C87941]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-3xl bg-[#244A36] text-[#FAF7F2] flex items-center justify-center text-2xl font-black shadow-[0_8px_25px_rgba(36,74,54,0.3)] border-2 border-white/80 flex-shrink-0">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2826] tracking-tight">
                  {user?.name || 'ResQAI Demo User'}
                </h1>
                <span className="text-[10px] font-bold text-[#244A36] bg-[#244A36]/10 px-2.5 py-0.5 rounded-full border border-[#244A36]/20 uppercase">
                  {user?.accountType || 'Demo User'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5E7E67] font-medium flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || 'demo@resqai.app'}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-[#244A36]" />
                <span>{user?.preferredRegion || 'Northeast India'}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setEmergencyModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#7A2E2E]/10 hover:bg-[#7A2E2E]/15 text-[#7A2E2E] border border-[#7A2E2E]/25 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-sm"
            >
              <PhoneCall className="w-4 h-4 text-[#7A2E2E]" />
              <span>Emergency Helplines</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white/70 hover:bg-[#7A2E2E]/10 text-[#7A2E2E] border border-[#7A2E2E]/20 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Sub-bar */}
        <div className="mt-6 pt-4 border-t border-[#244A36]/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#5E7E67]">
          <span>Member since: <strong>{user?.memberSince || 'September 2026'}</strong></span>
          <span className="flex items-center gap-1.5 text-[#244A36] font-semibold">
            <UserCheck className="w-3.5 h-3.5" /> Telemetry Access Authorized
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROFILE WORKSPACE: PERSONAL INFO + NOTIFICATION PREFERENCES               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PERSONAL INFORMATION (6 Cols) */}
        <div className="lg:col-span-6 liquid-glass rounded-3xl border border-white/60 p-6 sm:p-7 shadow-lg shadow-[#244A36]/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#244A36]/10 mb-5">
              <h2 className="text-base font-bold text-[#1C2826] flex items-center gap-2">
                <User className="w-4 h-4 text-[#244A36]" /> Personal Information
              </h2>
              <span className="text-[10px] font-bold text-[#5E7E67] uppercase">Profile Details</span>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl text-sm text-[#1C2826] focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 shadow-inner"
                />
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'demo@resqai.app'}
                  className="w-full px-4 py-2.5 bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl text-sm text-[#5E7E67] cursor-not-allowed"
                />
              </div>

              {/* Preferred Region */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] mb-1.5">
                  Preferred Sector / State
                </label>
                <select
                  value={preferredRegion}
                  onChange={(e) => setPreferredRegion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl text-sm text-[#1C2826] focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 cursor-pointer shadow-inner"
                >
                  {NER_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Account Level */}
              <div className="p-3.5 glass-card rounded-2xl border border-white/60 text-xs">
                <span className="font-bold text-[#1C2826] block mb-0.5">Authorization Level:</span>
                <p className="text-[#5E7E67] font-medium">
                  Standard Regional Observer • Real-time telemetry ingestion and alert acknowledgment enabled.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingInfo}
                className="w-full py-2.5 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#244A36]/20 transition-all disabled:opacity-50 hover:scale-[1.02]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Information</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: NOTIFICATION PREFERENCES (6 Cols) */}
        <div className="lg:col-span-6 liquid-glass rounded-3xl border border-white/60 p-6 sm:p-7 shadow-lg shadow-[#244A36]/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#244A36]/10 mb-5">
              <h2 className="text-base font-bold text-[#1C2826] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C87941]" /> Notification Preferences
              </h2>
              <span className="text-[10px] font-bold text-[#C87941] bg-[#C87941]/10 px-2 py-0.5 rounded-full uppercase border border-[#C87941]/20">
                Alert Triggers
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Severe Alerts Toggle */}
              <label className="p-3.5 glass-card rounded-2xl border border-white/60 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-[#7A2E2E] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#1C2826] block">Severe Landslide Alerts</span>
                    <span className="text-[11px] text-[#5E7E67] font-medium">Urgent warnings for critical slope failure and road blocks</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.severeAlerts}
                  onChange={(e) => setPreferences(p => ({ ...p, severeAlerts: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#244A36] focus:ring-[#244A36] border-[#244A36]/20 cursor-pointer"
                />
              </label>

              {/* High Risk Alerts Toggle */}
              <label className="p-3.5 glass-card rounded-2xl border border-white/60 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#C87941] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#1C2826] block">High-Risk Precautionary Advisories</span>
                    <span className="text-[11px] text-[#5E7E67] font-medium">Telemetry threshold breaches and slope strain warnings</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.highRiskAlerts}
                  onChange={(e) => setPreferences(p => ({ ...p, highRiskAlerts: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#244A36] focus:ring-[#244A36] border-[#244A36]/20 cursor-pointer"
                />
              </label>

              {/* Rainfall Warnings Toggle */}
              <label className="p-3.5 glass-card rounded-2xl border border-white/60 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]">
                <div className="flex items-start gap-3">
                  <CloudRain className="w-5 h-5 text-[#244A36] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#1C2826] block">Precipitation & InSAR Warnings</span>
                    <span className="text-[11px] text-[#5E7E67] font-medium">Doppler rainfall intensity and satellite subsidence anomalies</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.rainfallWarnings}
                  onChange={(e) => setPreferences(p => ({ ...p, rainfallWarnings: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#244A36] focus:ring-[#244A36] border-[#244A36]/20 cursor-pointer"
                />
              </label>

              {/* Regional Updates Toggle */}
              <label className="p-3.5 glass-card rounded-2xl border border-white/60 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]">
                <div className="flex items-start gap-3">
                  <Layers className="w-5 h-5 text-[#526E48] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#1C2826] block">Regional NER Bulletins</span>
                    <span className="text-[11px] text-[#5E7E67] font-medium">Daily synthesized geotechnical status across all 8 states</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.regionalUpdates}
                  onChange={(e) => setPreferences(p => ({ ...p, regionalUpdates: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#244A36] focus:ring-[#244A36] border-[#244A36]/20 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="pt-5 border-t border-[#244A36]/10 mt-4">
            <button
              type="button"
              disabled={isSavingPrefs}
              onClick={handleSavePreferences}
              className="w-full py-2.5 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#244A36]/20 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </div>

      </div>

      {/* EMERGENCY CONTACTS QUICK REFERENCE CARD */}
      <div className="mt-8 liquid-glass rounded-3xl border border-white/60 p-6 sm:p-7 shadow-lg shadow-[#244A36]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7A2E2E]/10 border border-[#7A2E2E]/25 text-[#7A2E2E] flex items-center justify-center flex-shrink-0 shadow-sm">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#1C2826]">
                Verified Disaster Helplines &amp; Emergency Numbers
              </h3>
              <span className="text-[10px] font-bold text-[#526E48] bg-[#526E48]/10 px-2 py-0.5 rounded-full border border-[#526E48]/20 uppercase">
                Official Directory
              </span>
            </div>
            <p className="text-xs text-[#5E7E67] font-medium mt-0.5 max-w-2xl leading-relaxed">
              Immediate access to National Emergency (112), Disaster Management (1070/1077), NDRF, Medical Ambulance (108), and all 8 North Eastern state control rooms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setEmergencyModalOpen(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-[#7A2E2E] hover:bg-[#602323] text-[#FAF7F2] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#7A2E2E]/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Open Helpline Directory</span>
          </button>
        </div>
      </div>

      {/* Emergency Contacts Modal */}
      <EmergencyContactsModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        defaultState={user?.preferredRegion}
      />

    </div>
  );
}
