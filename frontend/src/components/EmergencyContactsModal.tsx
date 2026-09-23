import { useState, useMemo } from 'react';
import { 
  Phone, ShieldAlert, PhoneCall, Copy, Check, X, 
  Search, MapPin, ShieldCheck, Info
} from 'lucide-react';
import { 
  VERIFIED_EMERGENCY_CONTACTS, 
  NER_STATE_HELPLINES, 
  EMERGENCY_DISCLAIMER
} from '../data/emergencyContacts';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultState?: string;
  initialCategory?: string;
}

export default function EmergencyContactsModal({
  isOpen,
  onClose,
  defaultState,
  initialCategory = 'ALL'
}: EmergencyContactsModalProps) {
  const [activeTab, setActiveTab] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>(defaultState || 'ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Filtered list of national/general contacts
  const filteredContacts = useMemo(() => {
    return VERIFIED_EMERGENCY_CONTACTS.filter(contact => {
      // Category Filter
      if (activeTab !== 'ALL' && activeTab !== 'REGIONAL' && contact.category !== activeTab.toLowerCase()) {
        return false;
      }
      // If user specifically clicked regional tab, hide general contacts unless searching
      if (activeTab === 'REGIONAL' && !searchQuery) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = contact.name.toLowerCase().includes(q);
        const matchesNum = contact.number.includes(q);
        const matchesAuth = contact.authority.toLowerCase().includes(q);
        const matchesDesc = contact.description.toLowerCase().includes(q);
        return matchesName || matchesNum || matchesAuth || matchesDesc;
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  // Filtered list of regional helplines
  const filteredRegionalHelplines = useMemo(() => {
    if (activeTab !== 'ALL' && activeTab !== 'REGIONAL' && activeTab !== 'DISASTER') {
      return [];
    }
    return NER_STATE_HELPLINES.filter(reg => {
      if (selectedState !== 'ALL' && reg.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesState = reg.state.toLowerCase().includes(q);
        const matchesCap = reg.capital.toLowerCase().includes(q);
        const matchesNum = reg.controlRoomNumber.includes(q) || (reg.alternateNumber && reg.alternateNumber.includes(q));
        const matchesAuth = reg.authority.toLowerCase().includes(q);
        return matchesState || matchesCap || matchesNum || matchesAuth;
      }
      return true;
    });
  }, [activeTab, selectedState, searchQuery]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#141D1A]/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl liquid-glass-modal rounded-3xl border border-white/80 p-6 sm:p-8 flex flex-col gap-5 max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-[#1C2826]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#244A36]/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#7A2E2E] text-[#FAF7F2] flex items-center justify-center shadow-md shadow-[#7A2E2E]/25 flex-shrink-0">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C2826] tracking-tight">
                  Emergency Helplines &amp; Disaster Contacts
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-bold text-[#526E48] bg-[#526E48]/10 px-2 py-0.5 rounded-full border border-[#526E48]/20 uppercase">
                  Verified Official
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5E7E67] font-medium mt-0.5">
                Official emergency numbers and State Disaster Management Control Rooms across Northeast India.
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#1C2826] border border-white/80 flex items-center justify-center shadow-sm transition-all hover:scale-105"
            aria-label="Close emergency contacts modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Quick Call Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7A2E2E]/12 via-[#C87941]/10 to-[#FAF7F2] border border-[#7A2E2E]/25 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-[#7A2E2E] flex-shrink-0" />
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A2E2E] block">
                Immediate Life-Threatening Emergency
              </span>
              <span className="text-xs text-[#2B3A33] font-medium">
                Dial <strong>112</strong> for unified Police, Fire, Ambulance &amp; Rescue dispatch.
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:112"
              className="flex-1 sm:flex-none px-4 py-2 bg-[#7A2E2E] hover:bg-[#602323] text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#7A2E2E]/20 transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 112 (National)</span>
            </a>
            <a
              href="tel:1070"
              className="flex-1 sm:flex-none px-4 py-2 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#244A36]/20 transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 1070 (Disaster)</span>
            </a>
          </div>
        </div>

        {/* Controls Bar: Category Tabs & Search Box */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="liquid-glass rounded-2xl p-1 flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Helplines' },
              { id: 'DISASTER', label: 'Disaster / NDRF' },
              { id: 'MEDICAL', label: 'Ambulance' },
              { id: 'POLICE', label: 'Police' },
              { id: 'FIRE', label: 'Fire & Rescue' },
              { id: 'REGIONAL', label: 'NER States' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#244A36] text-[#FAF7F2] shadow-sm'
                    : 'text-[#3A4D43] hover:bg-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box & State Filter */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-[#5E7E67] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search helpline or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white/80 backdrop-blur-md border border-white/80 rounded-xl text-xs text-[#1C2826] placeholder-[#5E7E67]/60 focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5E7E67] hover:text-[#1C2826]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* State Select */}
            {(activeTab === 'ALL' || activeTab === 'REGIONAL' || activeTab === 'DISASTER') && (
              <select
                aria-label="Filter by NER state"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-white/80 backdrop-blur-md border border-white/80 rounded-xl text-xs text-[#1C2826] font-semibold px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 shadow-inner cursor-pointer"
              >
                <option value="ALL">All 8 NER States</option>
                {NER_STATE_HELPLINES.map((s) => (
                  <option key={s.code} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Contacts Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 max-h-[50vh]">
          {/* Section 1: Standard National & Central Helplines */}
          {filteredContacts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#5E7E67] uppercase tracking-wider">
                  National &amp; Central Helplines ({filteredContacts.length})
                </span>
                <span className="text-[10px] text-[#526E48] font-semibold">Toll-Free Across India</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredContacts.map((contact) => {
                  const isCopied = copiedId === contact.id;
                  return (
                    <div
                      key={contact.id}
                      className="glass-card rounded-2xl border border-white/70 p-4 flex flex-col justify-between group hover:border-[#244A36]/30 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider block">
                              {contact.authority}
                            </span>
                            <h3 className="text-sm font-bold text-[#1C2826] leading-tight">
                              {contact.name}
                            </h3>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#526E48]/10 text-[#526E48] border border-[#526E48]/20 flex items-center gap-1 flex-shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        </div>

                        <p className="text-xs text-[#3A4D43] font-medium leading-relaxed mb-3">
                          {contact.description}
                        </p>
                      </div>

                      {/* Number Display & Actions */}
                      <div className="pt-3 border-t border-[#244A36]/10 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-[#5E7E67] block font-medium">Helpline Number</span>
                          <span className="text-base font-extrabold text-[#1C2826] tracking-wide font-mono">
                            {contact.number}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopy(contact.id, contact.number)}
                            title="Copy number to clipboard"
                            className="p-2 rounded-xl bg-white/80 hover:bg-white text-[#1C2826] border border-white/80 shadow-xs transition-all hover:scale-105 flex items-center gap-1 text-[11px] font-bold"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#526E48]" />
                                <span className="text-[#526E48]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#5E7E67]" />
                                <span className="hidden sm:inline">Copy</span>
                              </>
                            )}
                          </button>

                          {/* Direct Call Button */}
                          <a
                            href={`tel:${contact.rawNumber}`}
                            className="px-3 py-2 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Regional NER State Disaster Control Rooms */}
          {filteredRegionalHelplines.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#5E7E67] uppercase tracking-wider">
                  Northeast State Disaster Control Rooms (SEOC)
                </span>
                <span className="text-[10px] text-[#C87941] font-semibold">8 NER State Nodes</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredRegionalHelplines.map((reg) => {
                  const isCopied = copiedId === `reg-${reg.code}`;
                  return (
                    <div
                      key={reg.code}
                      className="glass-card rounded-2xl border border-white/70 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#244A36]" />
                            <h3 className="text-sm font-bold text-[#1C2826]">
                              {reg.state} ({reg.capital})
                            </h3>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#244A36]/10 text-[#244A36] border border-[#244A36]/20">
                            SEOC {reg.code}
                          </span>
                        </div>

                        <p className="text-xs text-[#5E7E67] font-medium mb-3">
                          {reg.authority}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#244A36]/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#5E7E67]">State Toll-Free:</span>
                          <span className="font-mono font-bold text-[#1C2826]">{reg.sdmaTollFree}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#5E7E67]">Direct Landline:</span>
                          <span className="font-mono font-bold text-[#244A36]">{reg.controlRoomNumber}</span>
                        </div>

                        {reg.alternateNumber && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#5E7E67]">Alternate:</span>
                            <span className="font-mono text-[#5E7E67]">{reg.alternateNumber}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(`reg-${reg.code}`, reg.controlRoomNumber)}
                            className="p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white text-[#1C2826] border border-white/80 text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-[#526E48]" />
                                <span className="text-[#526E48]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#5E7E67]" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`tel:${reg.controlRoomNumber.replace(/[^0-9+]/g, '')}`}
                            className="px-3 py-1.5 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call SEOC</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredContacts.length === 0 && filteredRegionalHelplines.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <Info className="w-8 h-8 text-[#5E7E67] mb-2" />
              <h4 className="text-sm font-bold text-[#1C2826]">No Helplines Found</h4>
              <p className="text-xs text-[#5E7E67] mt-1">No emergency contact matches your search "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-3 border-t border-[#244A36]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5E7E67]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#C87941] flex-shrink-0" />
            <span className="text-[11px] leading-tight font-medium">
              {EMERGENCY_DISCLAIMER}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#1C2826]/10 hover:bg-[#1C2826]/15 text-[#1C2826] text-xs font-bold transition-colors flex-shrink-0"
          >
            Close Helplines
          </button>
        </div>
      </div>
    </div>
  );
}
