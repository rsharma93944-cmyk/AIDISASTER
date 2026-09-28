import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'অসমীয়া' },
  { code: 'ur', name: 'اردو' }
];

export default function LanguageWelcome() {
  const { t, i18n } = useTranslation();
  const [show, setShow] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');

  useEffect(() => {
    const hasSelectedLang = localStorage.getItem('resqai_lang_selected');
    if (!hasSelectedLang) {
      setShow(true);
      // Attempt to set selectedLang to currently detected language if it's in our list
      const detected = i18n.language.split('-')[0];
      if (languages.some(l => l.code === detected)) {
        setSelectedLang(detected);
      }
    }
  }, [i18n.language]);

  if (!show) return null;

  const handleContinue = () => {
    i18n.changeLanguage(selectedLang);
    localStorage.setItem('resqai_lang_selected', 'true');
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#141D1A]/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_8px_32px_rgba(36,74,54,0.15)] rounded-[32px] p-8 flex flex-col items-center animate-in zoom-in-95 duration-300">
        <h2 className="text-xl font-bold text-[#1C2826] mb-2">{t('lang.welcome', 'Welcome to ResQAI')}</h2>
        <p className="text-sm text-[#5E7E67] font-medium mb-6">{t('lang.choose', 'Choose your language')}</p>
        
        <div className="w-full h-64 overflow-y-auto mb-6 pr-2 custom-scrollbar space-y-2">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all duration-200 font-medium ${
                selectedLang === lang.code
                  ? 'bg-[#244A36] text-[#FAF7F2] shadow-md'
                  : 'bg-white/60 hover:bg-[#244A36]/5 text-[#1C2826] border border-transparent hover:border-[#244A36]/10'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-[#1C2826] hover:bg-[#2A3B37] text-white px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-md flex items-center justify-center"
        >
          {t('lang.continue', 'Continue →')}
        </button>
      </div>
    </div>
  );
}
