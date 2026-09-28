const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, 'src', 'i18n');
if (!fs.existsSync(i18nDir)) {
  fs.mkdirSync(i18nDir, { recursive: true });
}

const en = {
  nav: {
    home: "Home",
    liveMap: "Live Map",
    riskMonitoring: "Risk Monitoring",
    alerts: "Alerts",
    aiAnalysis: "AI Analysis",
    assistant: "Assistant",
    simulator: "Simulator",
    about: "About",
    signIn: "Sign In",
    monitorRisk: "Monitor Risk"
  },
  home: {
    title: "AI-powered disaster & landslide early warning for India",
    subtitle: "AI-driven risk monitoring, early warning and response support for vulnerable regions across India.",
    exploreMap: "Explore India Risk Map",
    telemetryStream: "Monitoring Dashboard",
    panIndiaGrid: "Pan-India Early Warning Grid",
    statesAndUTs: "28 States • 8 Union Territories",
    viewMapBtn: "View India Map →",
    selectState: "Select State →"
  },
  risk: {
    low: "LOW",
    moderate: "MODERATE",
    high: "HIGH",
    critical: "CRITICAL"
  },
  alerts: {
    highRisk: "High Risk",
    moderateRisk: "Moderate Risk",
    viewSafeRoute: "View Safe Route",
    nearbyShelter: "Nearby Shelter"
  },
  lang: {
    welcome: "Welcome to ResQAI",
    choose: "Choose your language",
    continue: "Continue →"
  }
};

const hi = {
  nav: {
    home: "होम",
    liveMap: "लाइव मैप",
    riskMonitoring: "जोखिम निगरानी",
    alerts: "अलर्ट",
    aiAnalysis: "एआई विश्लेषण",
    assistant: "सहायक",
    simulator: "सिम्युलेटर",
    about: "हमारे बारे में",
    signIn: "साइन इन",
    monitorRisk: "जोखिम की निगरानी"
  },
  home: {
    title: "भारत के लिए एआई-संचालित आपदा और भूस्खलन प्रारंभिक चेतावनी",
    subtitle: "पूरे भारत के संवेदनशील क्षेत्रों के लिए एआई-संचालित जोखिम निगरानी, प्रारंभिक चेतावनी और प्रतिक्रिया सहायता।",
    exploreMap: "भारत जोखिम मानचित्र देखें",
    telemetryStream: "निगरानी डैशबोर्ड",
    panIndiaGrid: "अखिल भारतीय प्रारंभिक चेतावनी ग्रिड",
    statesAndUTs: "28 राज्य • 8 केंद्र शासित प्रदेश",
    viewMapBtn: "भारत का नक्शा देखें →",
    selectState: "राज्य चुनें →"
  },
  risk: {
    low: "कम",
    moderate: "मध्यम",
    high: "उच्च",
    critical: "गंभीर"
  },
  alerts: {
    highRisk: "उच्च जोखिम",
    moderateRisk: "मध्यम जोखिम",
    viewSafeRoute: "सुरक्षित मार्ग देखें",
    nearbyShelter: "निकटतम आश्रय"
  },
  lang: {
    welcome: "ResQAI में आपका स्वागत है",
    choose: "अपनी भाषा चुनें",
    continue: "जारी रखें →"
  }
};

const bn = {
  nav: {
    home: "হোম",
    liveMap: "লাইভ ম্যাপ",
    riskMonitoring: "ঝুঁকি পর্যবেক্ষণ",
    alerts: "সতর্কতা",
    aiAnalysis: "এআই বিশ্লেষণ",
    assistant: "সহকারী",
    simulator: "সিমুলেটর",
    about: "আমাদের সম্পর্কে",
    signIn: "সাইন ইন",
    monitorRisk: "ঝুঁকি নিরীক্ষণ"
  },
  home: {
    title: "ভারতের জন্য এআই-চালিত দুর্যোগ এবং ভূমিধস আগাম সতর্কতা",
    subtitle: "সমগ্র ভারতে ঝুঁকিপূর্ণ অঞ্চলের জন্য এআই-চালিত ঝুঁকি পর্যবেক্ষণ, আগাম সতর্কতা এবং প্রতিক্রিয়া সহায়তা।",
    exploreMap: "ভারত ঝুঁকি মানচিত্র অন্বেষণ করুন",
    telemetryStream: "মনিটরিং ড্যাশবোর্ড",
    panIndiaGrid: "প্যান-ইন্ডিয়া আর্লি ওয়ার্নিং গ্রিড",
    statesAndUTs: "২৮ রাজ্য • ৮ কেন্দ্রশাসিত অঞ্চল",
    viewMapBtn: "ভারতের মানচিত্র দেখুন →",
    selectState: "রাজ্য নির্বাচন করুন →"
  },
  risk: {
    low: "কম",
    moderate: "মাঝারি",
    high: "উচ্চ",
    critical: "গুরুতর"
  },
  alerts: {
    highRisk: "উচ্চ ঝুঁকি",
    moderateRisk: "মাঝারি ঝুঁকি",
    viewSafeRoute: "নিরাপদ রুট দেখুন",
    nearbyShelter: "নিকটবর্তী আশ্রয়কেন্দ্র"
  },
  lang: {
    welcome: "ResQAI তে স্বাগতম",
    choose: "আপনার ভাষা চয়ন করুন",
    continue: "চালিয়ে যান →"
  }
};

const ta = {
  nav: {
    home: "முகப்பு",
    liveMap: "நேரடி வரைபடம்",
    riskMonitoring: "ஆபத்து கண்காணிப்பு",
    alerts: "எச்சரிக்கைகள்",
    aiAnalysis: "AI பகுப்பாய்வு",
    assistant: "உதவியாளர்",
    simulator: "உருவாக்கி",
    about: "எங்களை பற்றி",
    signIn: "உள்நுழைய",
    monitorRisk: "ஆபத்தை கண்காணி"
  },
  home: {
    title: "இந்தியாவுக்கான AI-ஆதரவு பேரிடர் மற்றும் நிலச்சரிவு முன்னெச்சரிக்கை",
    subtitle: "இந்தியா முழுவதிலும் பாதிக்கப்படக்கூடிய பகுதிகளுக்கு AI-உந்துதல் ஆபத்து கண்காணிப்பு, முன்னெச்சரிக்கை மற்றும் மீட்பு ஆதரவு.",
    exploreMap: "இந்திய ஆபத்து வரைபடத்தை ஆராயுங்கள்",
    telemetryStream: "கண்காணிப்பு டாஷ்போர்டு",
    panIndiaGrid: "பான்-இந்தியா முன்னெச்சரிக்கை கட்டம்",
    statesAndUTs: "28 மாநிலங்கள் • 8 யூனியன் பிரதேசங்கள்",
    viewMapBtn: "இந்திய வரைபடத்தை காண் →",
    selectState: "மாநிலத்தை தேர்ந்தெடுக்கவும் →"
  },
  risk: {
    low: "குறைவு",
    moderate: "மிதமான",
    high: "அதிகம்",
    critical: "மிக அதிகம்"
  },
  alerts: {
    highRisk: "அதிக ஆபத்து",
    moderateRisk: "மிதமான ஆபத்து",
    viewSafeRoute: "பாதுகாப்பான பாதையை காண்",
    nearbyShelter: "அருகிலுள்ள தங்குமிடம்"
  },
  lang: {
    welcome: "ResQAI க்கு வரவேற்கிறோம்",
    choose: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    continue: "தொடரவும் →"
  }
};

fs.writeFileSync(path.join(i18nDir, 'en.json'), JSON.stringify(en, null, 2));
fs.writeFileSync(path.join(i18nDir, 'hi.json'), JSON.stringify(hi, null, 2));
fs.writeFileSync(path.join(i18nDir, 'bn.json'), JSON.stringify(bn, null, 2));
fs.writeFileSync(path.join(i18nDir, 'ta.json'), JSON.stringify(ta, null, 2));

console.log("Translations generated successfully.");
