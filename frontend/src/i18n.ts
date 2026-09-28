import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './i18n/en.json';
import hi from './i18n/hi.json';
import bn from './i18n/bn.json';
import mr from './i18n/mr.json';
import gu from './i18n/gu.json';
import ta from './i18n/ta.json';
import te from './i18n/te.json';
import kn from './i18n/kn.json';
import ml from './i18n/ml.json';
import pa from './i18n/pa.json';
import or from './i18n/or.json';
import as from './i18n/as.json';
import ur from './i18n/ur.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  mr: { translation: mr },
  gu: { translation: gu },
  ta: { translation: ta },
  te: { translation: te },
  kn: { translation: kn },
  ml: { translation: ml },
  pa: { translation: pa },
  or: { translation: or },
  as: { translation: as },
  ur: { translation: ur },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
