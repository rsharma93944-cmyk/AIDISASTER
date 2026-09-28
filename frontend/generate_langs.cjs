const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, 'src', 'i18n');

// Each language: nav-only core translations + shared structure from en.json
// For languages without full translations, they will fall back to English via i18next fallbackLng

const te = {
  nav: { home: "హోమ్", liveMap: "లైవ్ మ్యాప్", riskMonitoring: "ప్రమాద పర్యవేక్షణ", alerts: "హెచ్చరికలు", aiAnalysis: "AI విశ్లేషణ", assistant: "సహాయకుడు", simulator: "సిమ్యులేటర్", about: "గురించి", signIn: "సైన్ ఇన్", signOut: "సైన్ అవుట్", profile: "ప్రొఫైల్" },
  home: { tagline: "ప్రకృతి హెచ్చరిస్తుంది. మేము చర్య తీసుకుంటాము.", title: "భారతదేశం కోసం AI-ఆధారిత విపత్తు & కొండచరియలు ముందస్తు హెచ్చరిక", subtitle: "భారతదేశం అంతటా అత్యంత ప్రభావిత ప్రాంతాలకు AI-ఆధారిత ప్రమాద పర్యవేక్షణ, ముందస్తు హెచ్చరిక మరియు ప్రతిస్పందన మద్దతు.", exploreMap: "భారత ప్రమాద మ్యాప్ అన్వేషించండి", telemetryStream: "పర్యవేక్షణ డాష్‌బోర్డ్", panIndiaGrid: "పాన్-ఇండియా ముందస్తు హెచ్చరిక గ్రిడ్", statesAndUTs: "28 రాష్ట్రాలు • 8 కేంద్ర పాలిత ప్రాంతాలు", viewMapBtn: "భారత మ్యాప్ చూడండి →", selectState: "రాష్ట్రం ఎంచుకోండి →" },
  risk: { low: "తక్కువ", moderate: "మధ్యస్థం", high: "అధికం", critical: "తీవ్రం", subtitle: "కొండచరియలు ప్రమాదానికి కారణమయ్యే ప్రధాన పర్యావరణ మరియు భూ-సాంకేతిక కారకాలను విశ్లేషించండి." },
  alerts: { title: "హెచ్చరిక నిర్వహణ", subtitle: "భారతదేశం అంతటా కొండచరియలు ప్రమాద హెచ్చరికలను పర్యవేక్షించండి.", highRisk: "అధిక ప్రమాదం", moderateRisk: "మధ్యస్థ ప్రమాదం", risk: "ప్రమాదం", viewSafeRoute: "సురక్షిత మార్గం చూడండి", nearbyShelter: "సమీపంలో ఆశ్రయం", activeAlerts: "సక్రియ హెచ్చరికలు", requiresAction: "చర్య అవసరం", acknowledged: "అంగీకరించబడింది", resolved: "పరిష్కరించబడింది", viewOnMap: "మ్యాప్‌లో చూడండి", acknowledge: "అంగీకరించు", resolve: "పరిష్కరించు", emergencyHelplines: "అత్యవసర హెల్ప్‌లైన్లు", searchPlaceholder: "స్థానం లేదా ID శోధించండి..." },
  lang: { welcome: "ResQAI కి స్వాగతం", choose: "మీ భాషను ఎంచుకోండి", continue: "కొనసాగించు →" },
  common: { loading: "లోడ్ అవుతోంది...", error: "ఏదో తప్పు జరిగింది", close: "మూసివేయి", demo: "డెమో డేటా" },
  footer: { tagline: "భారతదేశం కోసం AI-ఆధారిత విపత్తు ముందస్తు హెచ్చరిక", allRightsReserved: "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి" }
};

const mr = {
  nav: { home: "मुख्यपृष्ठ", liveMap: "लाइव्ह नकाशा", riskMonitoring: "जोखीम देखरेख", alerts: "सूचना", aiAnalysis: "एआय विश्लेषण", assistant: "सहाय्यक", simulator: "सिम्युलेटर", about: "आमच्याबद्दल", signIn: "साइन इन", signOut: "साइन आउट", profile: "प्रोफाइल" },
  home: { tagline: "निसर्ग सावध करतो. आम्ही कार्य करतो.", title: "भारतासाठी एआय-चालित आपत्ती आणि भूस्खलन पूर्व चेतावणी", subtitle: "संपूर्ण भारतातील असुरक्षित प्रदेशांसाठी एआय-चालित जोखीम निगराणी, पूर्व चेतावणी आणि प्रतिसाद सहाय्य.", exploreMap: "भारत जोखीम नकाशा पहा", telemetryStream: "देखरेख डॅशबोर्ड", panIndiaGrid: "अखिल भारतीय पूर्व चेतावणी ग्रिड", statesAndUTs: "28 राज्ये • 8 केंद्रशासित प्रदेश", viewMapBtn: "भारताचा नकाशा पहा →", selectState: "राज्य निवडा →" },
  risk: { low: "कमी", moderate: "मध्यम", high: "उच्च", critical: "गंभीर", subtitle: "भूस्खलन जोखमीला कारणीभूत असलेल्या मुख्य पर्यावरणीय आणि भू-तांत्रिक घटकांचे विश्लेषण करा." },
  alerts: { title: "सूचना व्यवस्थापन", subtitle: "संपूर्ण भारतातील भूस्खलन जोखीम सूचनांचे निरीक्षण, पुनरावलोकन आणि व्यवस्थापन करा.", highRisk: "उच्च जोखीम", moderateRisk: "मध्यम जोखीम", risk: "जोखीम", viewSafeRoute: "सुरक्षित मार्ग पहा", nearbyShelter: "जवळचे आश्रयस्थान", activeAlerts: "सक्रिय सूचना", requiresAction: "कृती आवश्यक", acknowledged: "मान्य", resolved: "निराकरण झाले", viewOnMap: "नकाशावर पहा", acknowledge: "मान्य करा", resolve: "निराकरण करा", emergencyHelplines: "आणीबाणी हेल्पलाइन", searchPlaceholder: "स्थान किंवा ID शोधा..." },
  lang: { welcome: "ResQAI मध्ये आपले स्वागत आहे", choose: "आपली भाषा निवडा", continue: "पुढे चालू ठेवा →" },
  common: { loading: "लोड होत आहे...", error: "काहीतरी चूक झाली", close: "बंद करा", demo: "डेमो डेटा" },
  footer: { tagline: "भारतासाठी एआय-चालित आपत्ती पूर्व चेतावणी", allRightsReserved: "सर्व हक्क राखीव" }
};

const gu = {
  nav: { home: "હોમ", liveMap: "લાઇવ મેપ", riskMonitoring: "જોખમ નિરીક્ષણ", alerts: "ચેતવણીઓ", aiAnalysis: "AI વિશ્લેષણ", assistant: "સહાયક", simulator: "સિમ્યુલેટર", about: "અમારા વિશે", signIn: "સાઇન ઇન", signOut: "સાઇન આઉટ", profile: "પ્રોફાઇલ" },
  home: { tagline: "પ્રકૃતિ ચેતવે છે. અમે કાર્ય કરીએ છીએ.", title: "ભારત માટે AI-સંચાલિત આપત્તિ અને ભૂસ્ખલન પ્રારંભિક ચેતવણી", subtitle: "સમગ્ર ભારતના સંવેદનશીલ પ્રદેશો માટે AI-સંચાલિત જોખમ નિરીક્ષણ, પ્રારંભિક ચેતવણી અને પ્રતિભાવ સહાય.", exploreMap: "ભારત જોખમ નકશો જુઓ", telemetryStream: "નિરીક્ષણ ડેશબોર્ડ", panIndiaGrid: "પાન-ઇન્ડિયા અર્લી વોર્નિંગ ગ્રિડ", statesAndUTs: "28 રાજ્યો • 8 કેન્દ્રશાસિત પ્રદેશો", viewMapBtn: "ભારતનો નકશો જુઓ →", selectState: "રાજ્ય પસંદ કરો →" },
  risk: { low: "ઓછું", moderate: "મધ્યમ", high: "ઉચ્ચ", critical: "ગંભીર" },
  alerts: { title: "ચેતવણી વ્યવસ્થાપન", highRisk: "ઉચ્ચ જોખમ", moderateRisk: "મધ્યમ જોખમ", risk: "જોખમ", viewSafeRoute: "સુરક્ષિત માર્ગ જુઓ", nearbyShelter: "નજીકનું આશ્રયસ્થાન", emergencyHelplines: "કટોકટી હેલ્પલાઇન" },
  lang: { welcome: "ResQAI માં આપનું સ્વાગત છે", choose: "તમારી ભાષા પસંદ કરો", continue: "ચાલુ રાખો →" },
  common: { loading: "લોડ થઈ રહ્યું છે...", error: "કંઈક ખોટું થયું", close: "બંધ કરો", demo: "ડેમો ડેટા" },
  footer: { tagline: "ભારત માટે AI-સંચાલિત આપત્તિ ચેતવણી", allRightsReserved: "સર્વ હક્ક સુરક્ષિત" }
};

const kn = {
  nav: { home: "ಮುಖಪುಟ", liveMap: "ಲೈವ್ ನಕ್ಷೆ", riskMonitoring: "ಅಪಾಯ ಮೇಲ್ವಿಚಾರಣೆ", alerts: "ಎಚ್ಚರಿಕೆಗಳು", aiAnalysis: "AI ವಿಶ್ಲೇಷಣೆ", assistant: "ಸಹಾಯಕ", simulator: "ಸಿಮ್ಯುಲೇಟರ್", about: "ನಮ್ಮ ಬಗ್ಗೆ", signIn: "ಸೈನ್ ಇನ್", signOut: "ಸೈನ್ ಔಟ್", profile: "ಪ್ರೊಫೈಲ್" },
  home: { tagline: "ಪ್ರಕೃತಿ ಎಚ್ಚರಿಸುತ್ತದೆ. ನಾವು ಕ್ರಿಯೆ ಮಾಡುತ್ತೇವೆ.", title: "ಭಾರತಕ್ಕಾಗಿ AI-ಚಾಲಿತ ವಿಪತ್ತು ಮತ್ತು ಭೂಕುಸಿತ ಮುಂಚಿತ ಎಚ್ಚರಿಕೆ", subtitle: "ಭಾರತದಾದ್ಯಂತ ಅಪಾಯಕಾರಿ ಪ್ರದೇಶಗಳಿಗೆ AI-ಚಾಲಿತ ಅಪಾಯ ಮೇಲ್ವಿಚಾರಣೆ, ಮುಂಚಿತ ಎಚ್ಚರಿಕೆ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆ ಬೆಂಬಲ.", exploreMap: "ಭಾರತ ಅಪಾಯ ನಕ್ಷೆ ಅನ್ವೇಷಿಸಿ", telemetryStream: "ಮೇಲ್ವಿಚಾರಣೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", panIndiaGrid: "ಪ್ಯಾನ್-ಇಂಡಿಯಾ ಅರ್ಲಿ ವಾರ್ನಿಂಗ್ ಗ್ರಿಡ್", statesAndUTs: "28 ರಾಜ್ಯಗಳು • 8 ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶಗಳು", viewMapBtn: "ಭಾರತ ನಕ್ಷೆ ನೋಡಿ →", selectState: "ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ →" },
  risk: { low: "ಕಡಿಮೆ", moderate: "ಮಧ್ಯಮ", high: "ಅಧಿಕ", critical: "ತೀವ್ರ" },
  alerts: { highRisk: "ಅಧಿಕ ಅಪಾಯ", moderateRisk: "ಮಧ್ಯಮ ಅಪಾಯ", risk: "ಅಪಾಯ", viewSafeRoute: "ಸುರಕ್ಷಿತ ಮಾರ್ಗ ನೋಡಿ", nearbyShelter: "ಹತ್ತಿರದ ಆಶ್ರಯ", emergencyHelplines: "ತುರ್ತು ಸಹಾಯವಾಣಿ" },
  lang: { welcome: "ResQAI ಗೆ ಸ್ವಾಗತ", choose: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", continue: "ಮುಂದುವರಿಸಿ →" },
  common: { loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...", error: "ಏನೋ ತಪ್ಪಾಗಿದೆ", close: "ಮುಚ್ಚಿ", demo: "ಡೆಮೊ ಡೇಟಾ" },
  footer: { tagline: "ಭಾರತಕ್ಕಾಗಿ AI-ಚಾಲಿತ ವಿಪತ್ತು ಮುಂಚಿತ ಎಚ್ಚರಿಕೆ", allRightsReserved: "ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ" }
};

const ml = {
  nav: { home: "ഹോം", liveMap: "ലൈവ് മാപ്പ്", riskMonitoring: "അപകട നിരീക്ഷണം", alerts: "മുന്നറിയിപ്പുകൾ", aiAnalysis: "AI വിശകലനം", assistant: "സഹായി", simulator: "സിമുലേറ്റർ", about: "ഞങ്ങളെ കുറിച്ച്", signIn: "സൈൻ ഇൻ", signOut: "സൈൻ ഔട്ട്", profile: "പ്രൊഫൈൽ" },
  home: { tagline: "പ്രകൃതി മുന്നറിയിപ്പ് നൽകുന്നു. ഞങ്ങൾ പ്രവർത്തിക്കുന്നു.", title: "ഇന്ത്യയ്ക്കായുള്ള AI-അധിഷ്ഠിത ദുരന്ത & ഉരുൾപൊട്ടൽ മുൻകൂർ മുന്നറിയിപ്പ്", subtitle: "ഇന്ത്യയിലുടനീളമുള്ള ദുർബല പ്രദേശങ്ങൾക്കായി AI-അധിഷ്ഠിത അപകട നിരീക്ഷണം, മുൻകൂർ മുന്നറിയിപ്പ് & പ്രതികരണ പിന്തുണ.", exploreMap: "ഇന്ത്യ അപകട ഭൂപടം പര്യവേക്ഷിക്കുക", telemetryStream: "നിരീക്ഷണ ഡാഷ്‌ബോർഡ്", panIndiaGrid: "പാൻ-ഇന്ത്യ ആദ്യ മുന്നറിയിപ്പ് ഗ്രിഡ്", statesAndUTs: "28 സംസ്ഥാനങ്ങൾ • 8 കേന്ദ്ര ഭരണ പ്രദേശങ്ങൾ", viewMapBtn: "ഇന്ത്യ ഭൂപടം കാണുക →", selectState: "സംസ്ഥാനം തിരഞ്ഞെടുക്കുക →" },
  risk: { low: "കുറവ്", moderate: "മിതമായ", high: "ഉയർന്ന", critical: "ഗുരുതരമായ" },
  alerts: { highRisk: "ഉയർന്ന അപകടം", moderateRisk: "മിതമായ അപകടം", risk: "അപകടം", viewSafeRoute: "സുരക്ഷിത വഴി കാണുക", nearbyShelter: "അടുത്തുള്ള ഷെൽട്ടർ", emergencyHelplines: "അടിയന്തര ഹെൽപ്പ്‌ലൈൻ" },
  lang: { welcome: "ResQAI-ലേക്ക് സ്വാഗതം", choose: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക", continue: "തുടരുക →" },
  common: { loading: "ലോഡ് ചെയ്യുന്നു...", error: "എന്തോ തെറ്റ് സംഭവിച്ചു", close: "അടയ്ക്കുക", demo: "ഡെമോ ഡാറ്റ" },
  footer: { tagline: "ഇന്ത്യയ്ക്കായുള്ള AI-അധിഷ്ഠിത ദുരന്ത മുൻകൂർ മുന്നറിയിപ്പ്", allRightsReserved: "എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം" }
};

const pa = {
  nav: { home: "ਘਰ", liveMap: "ਲਾਈਵ ਨਕਸ਼ਾ", riskMonitoring: "ਖ਼ਤਰਾ ਨਿਗਰਾਨੀ", alerts: "ਚੇਤਾਵਨੀਆਂ", aiAnalysis: "AI ਵਿਸ਼ਲੇਸ਼ਣ", assistant: "ਸਹਾਇਕ", simulator: "ਸਿਮੂਲੇਟਰ", about: "ਸਾਡੇ ਬਾਰੇ", signIn: "ਸਾਈਨ ਇਨ", signOut: "ਸਾਈਨ ਆਉਟ", profile: "ਪ੍ਰੋਫਾਈਲ" },
  home: { tagline: "ਕੁਦਰਤ ਚੇਤਾਵਨੀ ਦਿੰਦੀ ਹੈ। ਅਸੀਂ ਕਾਰਵਾਈ ਕਰਦੇ ਹਾਂ।", title: "ਭਾਰਤ ਲਈ AI-ਸੰਚਾਲਿਤ ਆਫ਼ਤ ਅਤੇ ਭੂ-ਖਿਸਕਣ ਪੂਰਵ ਚੇਤਾਵਨੀ", subtitle: "ਸਮੁੱਚੇ ਭਾਰਤ ਦੇ ਕਮਜ਼ੋਰ ਖੇਤਰਾਂ ਲਈ AI-ਸੰਚਾਲਿਤ ਖ਼ਤਰਾ ਨਿਗਰਾਨੀ, ਪੂਰਵ ਚੇਤਾਵਨੀ ਅਤੇ ਪ੍ਰਤੀਕਿਰਿਆ ਸਹਾਇਤਾ।", exploreMap: "ਭਾਰਤ ਖ਼ਤਰਾ ਨਕਸ਼ਾ ਵੇਖੋ", telemetryStream: "ਨਿਗਰਾਨੀ ਡੈਸ਼ਬੋਰਡ", panIndiaGrid: "ਪੈਨ-ਇੰਡੀਆ ਅਰਲੀ ਵਾਰਨਿੰਗ ਗ੍ਰਿੱਡ", statesAndUTs: "28 ਰਾਜ • 8 ਕੇਂਦਰ ਸ਼ਾਸਿਤ ਪ੍ਰਦੇਸ਼", viewMapBtn: "ਭਾਰਤ ਦਾ ਨਕਸ਼ਾ ਵੇਖੋ →", selectState: "ਰਾਜ ਚੁਣੋ →" },
  risk: { low: "ਘੱਟ", moderate: "ਮੱਧਮ", high: "ਉੱਚ", critical: "ਗੰਭੀਰ" },
  alerts: { highRisk: "ਉੱਚ ਖ਼ਤਰਾ", moderateRisk: "ਮੱਧਮ ਖ਼ਤਰਾ", risk: "ਖ਼ਤਰਾ", viewSafeRoute: "ਸੁਰੱਖਿਅਤ ਰਸਤਾ ਵੇਖੋ", nearbyShelter: "ਨੇੜਲੀ ਪਨਾਹਗਾਹ", emergencyHelplines: "ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ" },
  lang: { welcome: "ResQAI ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ", choose: "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ", continue: "ਜਾਰੀ ਰੱਖੋ →" },
  common: { loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", error: "ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ", close: "ਬੰਦ ਕਰੋ", demo: "ਡੈਮੋ ਡੇਟਾ" },
  footer: { tagline: "ਭਾਰਤ ਲਈ AI-ਸੰਚਾਲਿਤ ਆਫ਼ਤ ਪੂਰਵ ਚੇਤਾਵਨੀ", allRightsReserved: "ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ" }
};

const or = {
  nav: { home: "ହୋମ", liveMap: "ଲାଇଭ ମ୍ୟାପ", riskMonitoring: "ବିପଦ ନିରୀକ୍ଷଣ", alerts: "ସତର୍କତା", aiAnalysis: "AI ବିଶ୍ଳେଷଣ", assistant: "ସହାୟକ", simulator: "ସିମ୍ୟୁଲେଟର", about: "ଆମ ବିଷୟରେ", signIn: "ସାଇନ ଇନ", signOut: "ସାଇନ ଆଉଟ", profile: "ପ୍ରୋଫାଇଲ" },
  home: { tagline: "ପ୍ରକୃତି ସଚେତ କରେ। ଆମେ କାର୍ଯ୍ୟ କରୁ।", title: "ଭାରତ ପାଇଁ AI-ଚାଳିତ ଦୁର୍ଯ୍ୟୋଗ ଏବଂ ଭୂସ୍ଖଳନ ପ୍ରାଥମିକ ସତର୍କତା", subtitle: "ସମଗ୍ର ଭାରତର ସମ୍ବେଦନଶୀଳ ଅଞ୍ଚଳ ପାଇଁ AI-ଚାଳିତ ବିପଦ ନିରୀକ୍ଷଣ, ପ୍ରାଥମିକ ସତର୍କତା ଏବଂ ପ୍ରତିକ୍ରିୟା ସହାୟତା।", exploreMap: "ଭାରତ ବିପଦ ମାନଚିତ୍ର ଅନ୍ୱେଷଣ କରନ୍ତୁ", telemetryStream: "ନିରୀକ୍ଷଣ ଡ୍ୟାସବୋର୍ଡ", panIndiaGrid: "ପ୍ୟାନ-ଇଣ୍ଡିଆ ଆର୍ଲି ୱାର୍ନିଂ ଗ୍ରିଡ", statesAndUTs: "28 ରାଜ୍ୟ • 8 କେନ୍ଦ୍ରଶାସିତ ପ୍ରଦେଶ", viewMapBtn: "ଭାରତ ମାନଚିତ୍ର ଦେଖନ୍ତୁ →", selectState: "ରାଜ୍ୟ ବାଛନ୍ତୁ →" },
  risk: { low: "କମ", moderate: "ମଧ୍ୟମ", high: "ଅଧିକ", critical: "ଗୁରୁତର" },
  alerts: { highRisk: "ଅଧିକ ବିପଦ", moderateRisk: "ମଧ୍ୟମ ବିପଦ", risk: "ବିପଦ", viewSafeRoute: "ସୁରକ୍ଷିତ ମାର୍ଗ ଦେଖନ୍ତୁ", nearbyShelter: "ନିକଟତମ ଆଶ୍ରୟ", emergencyHelplines: "ଜରୁରୀ ହେଲ୍ପଲାଇନ" },
  lang: { welcome: "ResQAI ରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ", choose: "ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ", continue: "ଜାରି ରଖନ୍ତୁ →" },
  common: { loading: "ଲୋଡ ହେଉଛି...", error: "କିଛି ଭୁଲ ହେଲା", close: "ବନ୍ଦ କରନ୍ତୁ", demo: "ଡେମୋ ଡାଟା" },
  footer: { tagline: "ଭାରତ ପାଇଁ AI-ଚାଳିତ ଦୁର୍ଯ୍ୟୋଗ ପ୍ରାଥମିକ ସତର୍କତା", allRightsReserved: "ସର୍ବ ସ୍ୱତ୍ୱ ସଂରକ୍ଷିତ" }
};

const as = {
  nav: { home: "হোম", liveMap: "লাইভ মেপ", riskMonitoring: "বিপদ নিৰীক্ষণ", alerts: "সতৰ্কবাণী", aiAnalysis: "এআই বিশ্লেষণ", assistant: "সহায়ক", simulator: "ছিমুলেটৰ", about: "আমাৰ বিষয়ে", signIn: "ছাইন ইন", signOut: "ছাইন আউট", profile: "প্ৰ'ফাইল" },
  home: { tagline: "প্ৰকৃতিয়ে সকীয়াই দিয়ে। আমি কাম কৰোঁ।", title: "ভাৰতৰ বাবে এআই-চালিত দুৰ্যোগ আৰু ভূমিস্খলন আগতীয়া সতৰ্কবাণী", subtitle: "সমগ্ৰ ভাৰতৰ ক্ষতিগ্ৰস্ত অঞ্চলৰ বাবে এআই-চালিত বিপদ নিৰীক্ষণ, আগতীয়া সতৰ্কবাণী আৰু প্ৰতিক্ৰিয়া সহায়তা।", exploreMap: "ভাৰত বিপদ মানচিত্ৰ অন্বেষণ কৰক", telemetryStream: "নিৰীক্ষণ ডেশ্বোৰ্ড", panIndiaGrid: "পেন-ইণ্ডিয়া আৰ্লি ৱাৰ্নিং গ্ৰিড", statesAndUTs: "২৮ ৰাজ্য • ৮ কেন্দ্ৰশাসিত প্ৰদেশ", viewMapBtn: "ভাৰতৰ মানচিত্ৰ চাওক →", selectState: "ৰাজ্য বাছনি কৰক →" },
  risk: { low: "কম", moderate: "মধ্যমীয়া", high: "অধিক", critical: "গুৰুতৰ" },
  alerts: { highRisk: "অধিক বিপদ", moderateRisk: "মধ্যমীয়া বিপদ", risk: "বিপদ", viewSafeRoute: "সুৰক্ষিত পথ চাওক", nearbyShelter: "ওচৰৰ আশ্ৰয়", emergencyHelplines: "জৰুৰীকালীন হেল্পলাইন" },
  lang: { welcome: "ResQAI লৈ আপোনাক স্বাগতম", choose: "আপোনাৰ ভাষা বাছনি কৰক", continue: "আগবাঢ়ক →" },
  common: { loading: "ল'ড হৈ আছে...", error: "কিবা ভুল হ'ল", close: "বন্ধ কৰক", demo: "ডেম' ডাটা" },
  footer: { tagline: "ভাৰতৰ বাবে এআই-চালিত দুৰ্যোগ আগতীয়া সতৰ্কবাণী", allRightsReserved: "সৰ্বস্বত্ব সংৰক্ষিত" }
};

const ur = {
  nav: { home: "ہوم", liveMap: "لائیو نقشہ", riskMonitoring: "خطرے کی نگرانی", alerts: "انتباہات", aiAnalysis: "اے آئی تجزیہ", assistant: "معاون", simulator: "سمیولیٹر", about: "ہمارے بارے میں", signIn: "سائن ان", signOut: "سائن آؤٹ", profile: "پروفائل" },
  home: { tagline: "فطرت خبردار کرتی ہے۔ ہم عمل کرتے ہیں۔", title: "بھارت کے لیے اے آئی سے چلنے والی آفت اور لینڈ سلائیڈ قبل از وقت وارننگ", subtitle: "پورے بھارت کے کمزور علاقوں کے لیے اے آئی سے چلنے والی خطرے کی نگرانی، قبل از وقت وارننگ اور ردعمل کی مدد۔", exploreMap: "بھارت خطرے کا نقشہ دیکھیں", telemetryStream: "نگرانی ڈیش بورڈ", panIndiaGrid: "پین انڈیا ارلی وارننگ گرڈ", statesAndUTs: "28 ریاستیں • 8 مرکز کے زیر انتظام علاقے", viewMapBtn: "بھارت کا نقشہ دیکھیں →", selectState: "ریاست منتخب کریں →" },
  risk: { low: "کم", moderate: "درمیانہ", high: "زیادہ", critical: "شدید" },
  alerts: { highRisk: "زیادہ خطرہ", moderateRisk: "درمیانہ خطرہ", risk: "خطرہ", viewSafeRoute: "محفوظ راستہ دیکھیں", nearbyShelter: "قریبی پناہ گاہ", emergencyHelplines: "ایمرجنسی ہیلپ لائن" },
  lang: { welcome: "ResQAI میں خوش آمدید", choose: "اپنی زبان منتخب کریں", continue: "جاری رکھیں →" },
  common: { loading: "لوڈ ہو رہا ہے...", error: "کچھ غلط ہو گیا", close: "بند کریں", demo: "ڈیمو ڈیٹا" },
  footer: { tagline: "بھارت کے لیے اے آئی سے چلنے والی آفت قبل از وقت وارننگ", allRightsReserved: "جملہ حقوق محفوظ ہیں" }
};

const allLangs = { te, mr, gu, kn, ml, pa, or: or, as: as, ur };

Object.entries(allLangs).forEach(([code, data]) => {
  fs.writeFileSync(path.join(i18nDir, `${code}.json`), JSON.stringify(data, null, 2), 'utf-8');
});

console.log('Created language files:', Object.keys(allLangs).join(', '));
