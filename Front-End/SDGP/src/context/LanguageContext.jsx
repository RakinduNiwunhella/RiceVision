import { createContext, useContext, useState } from "react";

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "si", label: "සිංහල", short: "සිං" },
  { code: "ta", label: "தமிழ்", short: "த" },
];

export const translations = {
  en: {
    // ── Nav ──
    dashboard: "Dashboard",
    fieldData: "Field Data",
    map: "Map",
    weather: "Weather",
    alerts: "Alerts",
    report: "Report",
    help: "Help",
    searchPlaceholder: "Search",
    noResults: "No results for",

    // ── Navigation Button Tutorials (FLAT KEYS) ──
    dashboardTutTitle: "See all your fields",
    dashboardTutAction: "View crop health, yield, threats",
    dashboardTutOutcome: "All field information in one place",
    
    fieldDataTutTitle: "Your field records",
    fieldDataTutAction: "Check field statistics and data",
    fieldDataTutOutcome: "See all field details and history",
    
    mapTutTitle: "Satellite view of fields",
    mapTutAction: "View field imagery and layers",
    mapTutOutcome: "See health status on the map",
    
    weatherTutTitle: "Check weather forecast",
    weatherTutAction: "See temperature, rain, soil",
    weatherTutOutcome: "Plan farming based on weather",
    
    alertsTutTitle: "Get pest and disease warnings",
    alertsTutAction: "See active threats to crops",
    alertsTutOutcome: "Know about risks to your crops",
    
    reportTutTitle: "Analyze yield performance",
    reportTutAction: "Compare districts and yields",
    reportTutOutcome: "Understand yield results",
    
    helpTutTitle: "Get help and support",
    helpTutAction: "Find answers and FAQs",
    helpTutOutcome: "Get help when needed",
    
    chatbotTutTitle: "Get instant AI advice",
    chatbotTutAction: "Click to open chat assistant",
    chatbotTutOutcome: "Ask questions and get instant answers",
    
    // ── Header Action Button Tutorials (FLAT KEYS) ──
    searchHeaderTitle: "Find pages quickly",
    searchHeaderAction: "Type page or district name",
    searchHeaderOutcome: "Jump to any page instantly",
    
    languageTitle: "Switch language",
    languageAction: "Choose English, Sinhala, or Tamil",
    languageOutcome: "App displays in your language",
    
    themeTitle: "Change brightness level",
    themeAction: "Click sun/moon icon",
    themeOutcome: "Toggle dark or light mode",
    
    notificationsTitle: "Check messages",
    notificationsAction: "See alerts and updates",
    notificationsOutcome: "Stay informed",
    
    profileTitle: "Your account settings",
    profileAction: "Edit your information",
    profileOutcome: "Update your profile details",

    // ── Field Setup Tutorials ──
    fieldSetupTutorial: {
      getStarted: {
        title: "Start Field Registration",
        action: "Click 'Get Started' to begin drawing your field",
        outcome: "You'll be guided to select district and draw field boundary on map",
      },
      review: {
        title: "Review Your Field",
        action: "After drawing, click 'Review Selection' to check details",
        outcome: "You'll see the field area in acres and annual cost breakdown",
      },
      complete: {
        title: "Complete Registration",
        action: "Click 'Complete Registration' to save your field",
        outcome: "Your field is registered and you can start monitoring it",
      },
      download: {
        title: "Export Report",
        action: "Click 'Download PDF' to get field analysis report",
        outcome: "A detailed PDF document is created with field data and analytics",
      },
    },

    // ── Dashboard ──
    welcomeTitle: "Welcome to RiceVision",
    welcomeSubtitle: "Insights of smarter farming",
    systemSynced: "System Synchronized",
    cropHealthDist: "Crop Health Distribution",
    analysing: "Analysing...",
    optimal: "Optimal",
    mildStress: "Mild Stress",
    severeStress: "Severe Stress",
    outputProjection: "Output Projection",
    metricTons: "Metric Tons (Est.)",
    highPerformance: "High Performance Sectors",
    supplyStability: "Supply Stability",
    expectedShortfall: "Expected Shortfall (MT)",
    nationalDemand: "National Demand Saturation",
    referenceThreshold: "Reference: 3.0M MT Threshold",
    diseaseOutbreak: "Disease & Disaster Outbreak",
    checkingFields: "Checking Fields...",
    alertsDetected: "Alerts Detected",
    viewDetails: "View Details",
    showLess: "Show Less",
    showAll: "Show All",
    growthAnalysis: "Growth Analysis",
    cropStageDistribution: "Crop Stage Distribution",
    totalFieldsTracked: "Total Fields Tracked",
    districtHealthMap: "District Health Map",

    // ── Alerts ──
    fieldRiskAlerts: "Field Risk Alerts",
    automatedMonitoring: "Automated Sentinel Monitoring",
    active: "Active",
    resolved: "Resolved",
    disasters: "Disasters",
    pestRisks: "Pest Risks",
    pastAlerts: "Past Alerts",
    findAnomaly: "Find specific anomaly...",
    noThreats: "No active threats detected",
    resolveBtn: "Resolve",
    ignoreBtn: "Ignore",
    viewInMap: "View in Map",

    // ── Help ──
    helpSupport: "Help & Support",
    quickAssistance: "Quick Assistance",
    quickAssistanceDesc:
      "Immediate tactical assistance for critical infrastructure failures.",
    dialConcierge: "Dial Concierge",
    askTeam: "Ask Our Team",
    askTeamDesc: "Submit non-urgent data requests or detailed system feedback.",
    transmitEmail: "Transmit Email",
    feedbackLoop: "Intelligence Feedback Loop",
    fullOperatorName: "Full Operator Name",
    assignedPosition: "Assigned Position",
    province: "Province",
    district: "District",
    anomalyType: "Anomaly Type",
    selectSeverity: "Select Severity",
    detailedMessage: "Detailed Diagnostic Message",
    describeIssue: "Describe the issue in detail so we can help you....",
    transmitting: "Transmitting...",
    submitReport: "Submit Your Report",
    quickHelp: "Quick Help",
    decryptingFaqs: "Decrypting FAQs...",

    // ── Field Data ──
    fieldIntelligence: "Field Intelligence",
    liveStream: "Live Sentinel Stream",
    decryptingIntel: "Decrypting Field Intelligence...",
    districtPerformance: "District-wise Performance Summary",
    colDistrict: "District",
    colTotalFields: "Total Fields",
    colHealthy: "Healthy",
    colStressed: "Stressed",
    colCritical: "Critical",
    colAvgYield: "Avg Yield (kg/ha)",
    colTotalYield: "Total Yield (kg)",

    // ── Weather ──
    weatherTitle: "Weather Intelligence",
    locating: "Locating...",
    locateMe: "Locate Me",
    sunrise: "Sunrise",
    sunset: "Sunset",
    todayRain: "Today Rain",
    feelsLike: "Feels like",
    humidity: "Humidity",
    cloudCover: "Cloud Cover",
    atmospheric: "Atmospheric Conditions",
    tabOverview: "Overview",
    tabHourly: "Hourly",
    tab14Day: "14-Day",
    tabSoil: "Soil",
    tabAgriculture: "Agriculture",

    // ── Report ──
    reportTitle: "Yield Analytics",
    singleDistrict: "Single District",
    compareDistricts: "Compare Districts",
    generateReport: "Generate Report",
    downloadPdf: "Download PDF",
    season: "Season",
    noData: "No data available",
    loading: "Loading...",

    // ── Profile ──
    operatorAuth: "Operator Authorization",
    identityProfile: "Identity Profile",
    profileDesc:
      "Synthesize and finalize your operator credentials within the RiceVision network. All modifications are recorded permanently in the regional registry.",
    personalId: "Personal Identification",
    sectorReg: "Sector Registration",
    givenName: "Given Name",
    surname: "Surname",
    identification: "Identification (NIC)",
    tacticalPhone: "Tactical Phone",
    emailEndpoint: "Encryption Endpoint (Email)",
    address: "Operational Zone (Address)",
    uploadingMatrix: "Uploading Matrix...",
    updating: "Applying Changes...",
    updateProfile: "Synchronize Identity",

    // ── Notifications ──
    notifications: "Notifications",
    noNotifications: "No notifications",

    // ── Sign In ──
    welcomeBack: "Welcome Back",
    signInDetails: "Please enter your details to access your dashboard.",
    emailAddress: "Email Address",
    password: "Password",
    forgotPassword: "Forgot password?",
    keepLoggedIn: "Keep me logged in",
    signingIn: "Signing in...",
    signInBtn: "Sign In to Account",
    orDivider: "OR",
    noAccount: "Don't have an account?",
    signUpLink: "Sign up",
    continueGoogle: "Continue with Google",

    // ── Sign Up ──
    createAccount: "Create Account",
    fullName: "Full Name",
    confirmPassword: "Confirm Password",
    alreadyAccount: "Already have an account?",
    signInLink: "Sign in",
    signingUp: "Creating account...",
    signUpBtn: "Create Account",

    // ── Sidebar ──
    myDashboard: "My Dashboard",
    fieldMap: "Field Map",
    myProfile: "My Profile",
    helpFAQ: "Help & FAQ",
    logout: "Logout",

    // ── Profile Tabs ──
    myPaddyField: "My Paddy Field",
    paddyFieldDesc:
      "View, draw, or update your registered paddy field boundary. Pricing is Rs. 1,000 per acre per year.",

    // ── ProfileForm extra ──
    districtSector: "District Sector",
    physicalAddress: "Physical Registry Address",
    synchronizing: "Synchronizing...",
    synchronized: "Synchronized",
    registryIdentity: "Registry Identity",

    // ── Reset Password ──
    resetPassword: "Reset Password",
    sendResetLink: "Send Reset Link",
    sending: "Sending...",
    resetEmailSent: "✅ Password reset email sent! Check your inbox.",
    setNewPassword: "Set New Password",
    newPassword: "New Password",
    enterNewPassword: "Enter new password",
    reEnterNewPassword: "Re-enter new password",
    updatePasswordBtn: "Update Password",
    passwordUpdatedMsg: "Password updated! Redirecting...",
    passwordMinLengthError: "Password must be at least 6 characters long.",
    passwordsNoMatchError: "Passwords do not match.",

    // ── Field Setup ──
    fieldRegistration: "Field Registration",
    introductionStep: "Introduction",
    drawFieldStep: "Draw Field",
    paymentStep: "Payment",
    confirmEmailBanner:
      "A confirmation email has been sent. Please verify before completing payment — you can still preview the map now.",
    registerPaddyTitle: "Register Your Paddy Field",
    registerPaddySubtitle:
      "Draw your paddy field boundary on the map to unlock satellite‑powered health monitoring, disease alerts, yield predictions, and disaster reports — all personalised to your exact location.",
    drawFreely: "Draw Freely",
    drawFreelyDesc:
      "Use the polygon or rectangle tool to outline the exact boundary of your paddy area on a live satellite map.",
    satelliteInsightsTitle: "Satellite Insights",
    satelliteInsightsDesc:
      "Receive NDVI, EVI, VV/VH SAR overlays and health classifications updated from Sentinel imagery.",
    pricingCardTitle: "Rs. 1,000 / acre",
    pricingCardDesc:
      "Simple transparent pricing — you only pay for the area you actually register. Billed annually.",
    getStartedBtn: "Get Started — Draw My Field",
    skipForNow: "Skip for now — set up later in Profile →",
    drawYourPaddyField: "Draw Your Paddy Field",
    drawYourPaddyDesc:
      "Select your district to load paddy zone boundaries, then use the draw tools to outline your field.",
    back: "← Back",
    reviewSelection: "Review Selection →",
    reviewPaymentTitle: "Review & Payment",
    reviewPaymentDesc: "Confirm your field details and complete registration.",
    fieldSummaryTitle: "Field Summary",
    fieldNameLabel: "Field Name",
    totalAreaLabel: "Total Area",
    areaSqmLabel: "Area (m²)",
    rateLabel: "Rate",
    annualCostLabel: "Annual Cost",
    securePaymentTitle: "Secure Payment",
    previewOnlyBadge: "Preview Only",
    cardNumberLabel: "Card Number",
    expiryLabel: "Expiry",
    cvvLabel: "CVV",
    paymentComingSoon:
      "Payment gateway integration coming soon. Save your field now to reserve your slot.",
    securedSSL:
      "Secured by SSL · Powered by PayHere · Your card data is never stored",
    backToMapBtn: "← Back to Map",
    savingField: "Saving…",
    completeRegistrationBtn: "Complete Registration",

    // ── My Field Tab ──
    fieldRegistry: "Field Registry",
    fieldRegistryExisting:
      "Your registered paddy field. Use Edit to update the boundary, or draw a new polygon to replace it.",
    fieldRegistryNew:
      "You have not registered a paddy field yet. Draw your field boundary below.",
    editBtn: "Edit",
    removeBtn: "Remove",
    loadingFieldData: "Loading Field Data",
    fieldNameStat: "Field Name",
    areaStat: "Area",
    annualFeeStat: "Annual Fee",
    editModeInfo:
      "Draw a new polygon to replace your existing boundary. The dashed blue outline shows your current field.",
    selectionSummary: "Selection Summary",
    cancelBtn: "Cancel",
    saveFieldBtn: "Save Field",

    // ── Weather ──
    detectingLocation: "Detecting Your Location...",
    loadingWeatherData: "Loading Weather Data...",
    retry: "Retry",
    paddyWeatherIntelligence: "Paddy Field Weather Intelligence",
    tab24Hour: "24-Hour",
    tabSoilAgro: "Soil & Agro",
    tabHistory: "History",
    todayFieldSummary: "Today's Field Summary",
    next24Hours: "Next 24 Hours",
    soilAgroTitle: "Soil & Agro Intelligence",
    forecast14Day: "14-Day Forecast",
    historicalData: "Historical Data (7 days)",
    temperature: "Temperature",
    dewpoint: "Dew Point",
    pressure: "Pressure",
    windSpeed: "Wind Speed",
    windGusts: "Wind Gusts",
    precipitation: "Precipitation",
    uvIndex: "UV Index",
    visibility: "Visibility",
    maxTemp: "Max Temp",
    minTemp: "Min Temp",
    uvIndexMax: "UV Index Max",
    daylightRain: "Daylight Rain",
    solarRadiation: "Solar Radiation",
    evapotranspiration: "Evapotranspiration",
    vapourPressureDef: "Vapour Pressure Def.",
    windMaxToday: "Wind Max Today",
    rainSum: "Rain Sum",
    rainProbability: "Rain Probability",

    // ── Report ──
    yieldReports: "Yield Reports",
    satelliteDerivedAnalytics:
      "Satellite-derived analytics & district yield forecasts",
    single: "Single",
    compare: "Compare",
    liveData: "Live Data",
  },

  si: {
    // ── Nav ──
    dashboard: "උපකරණ පුවරුව",
    fieldData: "කෙත් දත්ත",
    map: "සản-ල",
    weather: "කාලගුණය",
    alerts: "අනතුරු ඇඟවීම්",
    report: "වාර්තාව",
    help: "උදව්",
    searchPlaceholder: "සොයන්න...",
    noResults: "ප්‍රතිඵල නොමැත",

    // ── Navigation Button Tutorials (FLAT KEYS) ──
    dashboardTutTitle: "සියලු ඔබේ ක්ෂේත්‍ර බලන්න",
    dashboardTutAction: "බෝග සෞඛ්‍ය, අස්වැන්න, තර්ජන පරීක්ෂා කරන්න",
    dashboardTutOutcome: "එකම ස්ථානයේ සියලු ක්ෂේත්‍ර තොරතුරු",
    
    fieldDataTutTitle: "ඔබේ ක්ෂේත්‍ර වාර්තා",
    fieldDataTutAction: "ක්ෂේත්‍ර සංඛ්‍යා සහ දත්ත පරීක්ෂා කරන්න",
    fieldDataTutOutcome: "සියලු ක්ෂේත්‍ර විස්තර සහ ඉතිහාසය බලන්න",
    
    mapTutTitle: "චන්ද්‍රිකා ක්ෂේත්‍ර දර්ශනය",
    mapTutAction: "ක්ෂේත්‍ර පිතු සහ ස්ථරයන් බලන්න",
    mapTutOutcome: "සිතියමේ සෞඛ්‍ය බලන්න",
    
    weatherTutTitle: "කාලගුණ අනාවැකිය පරීක්ෂා කරන්න",
    weatherTutAction: "උෂ්ණත්වය, වර්ෂා සහ පස බලන්න",
    weatherTutOutcome: "කාලගුණ ඉතිරි කිරීමක් මත පදනම් වී සැලසුම්",
    
    alertsTutTitle: "පත්කයේ සහ රෝගවල අනතුරු ප්‍රවේශ කරන්න",
    alertsTutAction: "බෝගවලට ක්රියාශීල තර්ජන බලන්න",
    alertsTutOutcome: "ඔබේ බෝගවලට තර්ජන ගැන දැන ගන්න",
    
    reportTutTitle: "අස්වැන්න කර්ම විශ්ලේෂණ කරන්න",
    reportTutAction: "දිස්ත්‍රික් සහ අස්වැන්න සංසන්දනය කරන්න",
    reportTutOutcome: "අස්වැන්න ප්‍රතිඵල තේරුම් ගන්න",
    
    helpTutTitle: "සහාය සහ ආධාර ලබා ගන්න",
    helpTutAction: "පිළිතුරු සහ FAQ සොයන්න",
    helpTutOutcome: "ඔබට අවශ්‍ය විට සහාය ලබා ගන්න",
    
    chatbotTutTitle: "তাৎক্ষণিক AI পরামর්শ পান",
    chatbotTutAction: "চ্যাট সহায়ক খুলতে ক্লিক করুন",
    chatbotTutOutcome: "প্রশ্ন জিজ্ঞাসা করুন এবং তাৎক্ষণিক উত্তর পান",
    
    // ── Header Action Button Tutorials (FLAT KEYS) ──
    searchHeaderTitle: "පිටු ඉක්මනින් සොයන්න",
    searchHeaderAction: "පිටුවේ හෝ දිස්ත්‍රික්කයේ නාමය ටයිප් කරන්න",
    searchHeaderOutcome: "ඕනෑම පිටුවට ක්ෂණිකව පනින්න",
    
    languageTitle: "භාෂාව මාරු කරන්න",
    languageAction: "ඉංග්‍රීසි, සිංහල හෝ දෙමළ තෝරා ගැනීමට ක්ලික් කරන්න",
    languageOutcome: "යෙදුම ඔබේ භාෂාවින් පෙන්නුම් දෙයි",
    
    themeTitle: "දීප්තිමතභාවය මට්ටම වෙනස් කරන්න",
    themeAction: "සඳ/සූර්ය අයිකනය ක්ලික් කරන්න",
    themeOutcome: "අඳුරු හෝ ආලෝකමත් ප්‍රකාශනය ටොගල් කරන්න",
    
    notificationsTitle: "පණිවිඩ පරීක්ෂා කරන්න",
    notificationsAction: "අනතුරු ඇඟවීම් සහ යාවත්කාලීනයි බලන්න",
    notificationsOutcome: "දැනුම්දෙන්න අවුරුද්ධ",
    
    profileTitle: "ඔබේ ගිණුම් සැකසීම්",
    profileAction: "ඔබේ තොරතුරු සංස්කරණය කරන්න",
    profileOutcome: "ඔබේ පැතිකඩ විස්තර යාවත්කාල කරන්න",

    // ── Field Setup Tutorials ──
    fieldSetupTutorial: {
      getStarted: {
        title: "ක්ෂේත්‍ර ලියාපදිංචිය ආරම්භ කරන්න",
        action: "'ආරම්භ කරන්න' ක්ලික් කර ඔබේ කෙත ඇඳීම ආරම්භ කරන්න",
        outcome: "ඔබ දිස්ත්‍රික්කය තෝරා ගැනීමට සහ සිතියමේ කෙත් සීමාව ඇඳීමට පෙනෙනු ඇත",
      },
      review: {
        title: "ඔබේ කෙත සමාලෝකනය කරන්න",
        action: "ඇඳීමෙන් පසු, 'සමාලෝකනය කරන්න' ක්ලික් කර විස්තර ඉතිරි කරන්න",
        outcome: "ඔබ acres හි කෙත් ප්‍රදේශය සහ වාර්ෂික වියදම් බිඳුම දකිනු ඇත",
      },
      complete: {
        title: "ලියාපදිංචිය සම්පූර්ණ කරන්න",
        action: "'සම්පූර්ණ ලියාපදිංචිය' ක්ලික් කර ඔබේ කෙත සුරකින්න",
        outcome: "ඔබේ කෙත ලියාපදිංචි වී ඔබ එය නිරීක්ෂණ කිරීමට පටන් ගත හැකිය",
      },
      download: {
        title: "වාර්තාව នាందු නිෂ්පාදිතය",
        action: "'PDF බාගන්න' ක්ලික් කර කෙත් විශ්ලේෂණ වාර්තාව ලබා ගන්න",
        outcome: "කෙත් දත්ත සහ විශ්ලේෂණ සහිත විස්තරිත PDF ឯකសារ তৈরි කරනු ලැබේ",
      },
    },

    // ── Dashboard ──
    welcomeTitle: "RiceVision වෙත සාදරයෙන් පිළිගනිමු",
    welcomeSubtitle: "දක්ෂ ගොවිතැනෙහි අවබෝධය",
    systemSynced: "පද්ධතිය සමමුහුර්ත කර ඇත",
    cropHealthDist: "බෝග සෞඛ්‍ය බෙදාහැරීම",
    analysing: "විශ්ලේෂණය කරමින්...",
    optimal: "ශ්‍රේෂ්ඨ",
    mildStress: "මෘදු ඒකාග්‍රතාව",
    severeStress: "දැඩි ඒකාග්‍රතාව",
    outputProjection: "නිෂ්පාදන අනාවැකිය",
    metricTons: "මෙට්‍රික් ටොන් (ඇ.)",
    highPerformance: "ඉහළ කාර්ය සාධන ප්‍රදේශ",
    supplyStability: "සැපයුම් ස්ථාවරත්වය",
    expectedShortfall: "අපේක්ෂිත හිඟය (MT)",
    nationalDemand: "ජාතික ඉල්ලුම් සන්තෘප්තිය",
    referenceThreshold: "ආශ්‍රිතය: MT 3.0M සීමාව",
    diseaseOutbreak: "රෝග හා ව්‍යසන ආගමනය",
    checkingFields: "කෙත් පරීක්ෂා කරමින්...",
    alertsDetected: "ඇඟවීම් හඳුනාගෙන ඇත",
    viewDetails: "විස්තර බලන්න",
    showLess: "අඩු කරන්න",
    showAll: "සියල්ල බලන්න",
    growthAnalysis: "වර්ධන විශ්ලේෂණය",
    cropStageDistribution: "බෝග අදියර බෙදාහැරීම",
    totalFieldsTracked: "ලුහුඬු කළ කෙත් ගණන",
    districtHealthMap: "දිස්ත්‍රික් සෞඛ්‍ය සản-ල",

    // ── Alerts ──
    fieldRiskAlerts: "කෙත් අවදානම් ඇඟවීම්",
    automatedMonitoring: "ස්වයංක්‍රීය නිරීක්ෂණය",
    active: "ක්‍රියාකාරී",
    resolved: "විසඳා ඇත",
    disasters: "ව්‍යසන",
    pestRisks: "පළිබෝධ අවදානම්",
    pastAlerts: "පෙර ඇඟවීම්",
    findAnomaly: "නිශ්චිත විෂමතාව සොයන්න...",
    noThreats: "ක්‍රියාකාරී තර්ජන හඳුනාගෙන නැත",
    resolveBtn: "විසඳන්න",
    ignoreBtn: "නොසලකන්න",
    viewInMap: "සản-ලෙ බලන්න",

    // ── Help ──
    helpSupport: "උදව් සහ සහාය",
    quickAssistance: "ඉක්මන් සහාය",
    quickAssistanceDesc: "තීරණාත්මක යටිතල අකාමාවන් සඳහා ඉක්මන් සහාය.",
    dialConcierge: "ඇමතුම ගන්න",
    askTeam: "කණ්ඩායමෙන් අසන්න",
    askTeamDesc: "හදිසි නොවන දත්ත ඉල්ලීම් හෝ ප්‍රතිපෝෂණ ඉදිරිපත් කරන්න.",
    transmitEmail: "ඊමේල් යවන්න",
    feedbackLoop: "ප්‍රතිපෝෂණ පරිපාලනය",
    fullOperatorName: "සම්පූර්ණ නාමය",
    assignedPosition: "නිශ්චිත තනතුර",
    province: "පළාත",
    district: "දිස්ත්‍රික්කය",
    anomalyType: "ගැටලු වර්ගය",
    selectSeverity: "බරපතල බව තෝරන්න",
    detailedMessage: "සවිස්තරාත්මක පණිවිඩය",
    describeIssue: "ගැටලුව සවිස්තරාත්මකව විස්තර කරන්න...",
    transmitting: "යවමින්...",
    submitReport: "වාර්තාව ඉදිරිපත් කරන්න",
    quickHelp: "ඉක්මන් උදව්",
    decryptingFaqs: "FAQs පූරණය කරමින්...",

    // ── Field Data ──
    fieldIntelligence: "කෙත් බුද්ධිය",
    liveStream: "සජීව ධාරාව",
    decryptingIntel: "කෙත් දත්ත විශ්ලේෂණය කරමින්...",
    districtPerformance: "දිස්ත්‍රික් කාර්ය සාධන සාරාංශය",
    colDistrict: "දිස්ත්‍රික්කය",
    colTotalFields: "මුළු කෙත්",
    colHealthy: "සෞඛ්‍ය සම්පන්න",
    colStressed: "ඒකාග්‍ර",
    colCritical: "අනතුරු",
    colAvgYield: "සාමාන්‍ය අස්වැන්න (kg/ha)",
    colTotalYield: "මුළු අස්වැන්න (kg)",

    // ── Weather ──
    weatherTitle: "කාලගුණ තොරතුරු",
    locating: "ස්ථාන ලබා ගනිමින්...",
    locateMe: "මාව සොයන්න",
    sunrise: "සූර්යෝදය",
    sunset: "සූර්යාස්තය",
    todayRain: "අද වැස්ස",
    feelsLike: "දැනෙන ශීතලය",
    humidity: "ආර්ද්‍රතාව",
    cloudCover: "වලා ආවරණය",
    atmospheric: "වායුගෝලීය තත්ත්ව",
    tabOverview: "දළ විශ්ලේෂණය",
    tabHourly: "පැය-by-පැය",
    tab14Day: "දින 14",
    tabSoil: "පසෙ",
    tabAgriculture: "කෘෂිකර්ම",

    // ── Report ──
    reportTitle: "අස්වැන්න විශ්ලේෂණය",
    singleDistrict: "තනි දිස්ත්‍රික්කය",
    compareDistricts: "දිස්ත්‍රික් සංසන්දනය",
    generateReport: "වාර්තාව ජනනය කරන්න",
    downloadPdf: "PDF බාගන්න",
    season: "කාලය",
    noData: "දත්ත නොමැත",
    loading: "පූරණය...",

    // ── Profile ──
    operatorAuth: "ක්‍රියාකරු අනුමැතිය",
    identityProfile: "අනන්‍යතා විස්තරය",
    profileDesc:
      "RiceVision ජාලයේ ඔබේ ක්‍රියාකරු අක්‍රිය සාකාරය සාකච්ඡා කරන්න.",
    personalId: "පෞද්ගලික හඳුනාගැනීම",
    sectorReg: "ක්ෂේත්‍ර ලියාපදිංචිය",
    givenName: "ලබා දුන් නාමය",
    surname: "පවුලේ නාමය",
    identification: "හැඳුනුම්පත (NIC)",
    tacticalPhone: "දුරකථන අංකය",
    emailEndpoint: "ඊමේල් ලිපිනය",
    address: "ලිපිනය",
    uploadingMatrix: "ඡායාරූපය යවමින්...",
    updating: "යාවත්කාලීන කරමින්...",
    updateProfile: "අනන්‍යතාව සමමුහුර්ත කරන්න",

    // ── Notifications ──
    notifications: "දැනුම්දීම්",
    noNotifications: "දැනුම්දීම් නොමැත",

    // ── Sign In ──
    welcomeBack: "ආයුබෝවන්",
    signInDetails: "ඔබේ ගිණුම ප්‍රවේශ වීමට විස්තර ඇතුළත් කරන්න.",
    emailAddress: "ඊමේල් ලිපිනය",
    password: "මුරපදය",
    forgotPassword: "මුරපදය අමතකද?",
    keepLoggedIn: "ලොගිනව තබා ගන්න",
    signingIn: "ඇතුල් වෙමින්...",
    signInBtn: "ගිණුමට ඇතුල් වන්න",
    orDivider: "හෝ",
    noAccount: "ගිණුමක් නැද්ද?",
    signUpLink: "ලියාපදිංචි වන්න",
    continueGoogle: "Google සමඟ දිගටම",

    // ── Sign Up ──
    createAccount: "ගිණුමක් සාදන්න",
    fullName: "සම්පූර්ණ නාමය",
    confirmPassword: "මුරපදය තහවුරු කරන්න",
    alreadyAccount: "දැනටමත් ගිණුමක් තිබේද?",
    signInLink: "ඇතුල් වන්න",
    signingUp: "ගිණුම සාදමින්...",
    signUpBtn: "ගිණුමක් සාදන්න",

    // ── Sidebar ──
    myDashboard: "මගේ උපකරණ පුවරුව",
    fieldMap: "කෙත් සản-ල",
    myProfile: "මගේ ගිණුම",
    helpFAQ: "උදව් සහ FAQ",
    logout: "ලොග් අවුට්",

    // ── Profile Tabs ──
    myPaddyField: "මගේ ගොළු කෙත",
    paddyFieldDesc:
      "ඔබේ ලියාපදිංචි ගොළු කෙත් සීමාව බලන්න, ඇඳීම් කරන්න, හෝ යාවත්කාලීන කරන්න.",

    // ── ProfileForm extra ──
    districtSector: "දිස්ත්‍රික් ක්ෂේත්‍රය",
    physicalAddress: "භෞතික ලිපිනය",
    synchronizing: "සමමුහුර්ත කරමින්...",
    synchronized: "සමමුහුර්ත කර ඇත",
    registryIdentity: "ලේඛනාගාර අනන්‍යතාව",

    // ── Reset Password ──
    resetPassword: "මුරපදය නැවත සකසන්න",
    sendResetLink: "නැවත සකස් කිරීමේ සබැඳිය යවන්න",
    sending: "යවමින්...",
    resetEmailSent:
      "✅ මුරපදය නැවත සකසන ඊමේල් යවා ඇත! ඔබේ inbox පරීක්ෂා කරන්න.",
    setNewPassword: "නව මුරපදය සකසන්න",
    newPassword: "නව මුරපදය",
    enterNewPassword: "නව මුරපදය ඇතුළත් කරන්න",
    reEnterNewPassword: "නව මුරපදය නැවත ඇතුළත් කරන්න",
    updatePasswordBtn: "මුරපදය යාවත්කාලීන කරන්න",
    passwordUpdatedMsg: "මුරපදය සාර්ථකව යාවත්කාලීන කර ඇත! යළි-යොමු කරමින්...",
    passwordMinLengthError: "මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුය.",
    passwordsNoMatchError: "මුරපද ගැළපෙන්නේ නැත.",

    // ── Field Setup ──
    fieldRegistration: "කෙත් ලියාපදිංචිය",
    introductionStep: "හඳුන්වාදීම",
    drawFieldStep: "කෙත ඇඳීම",
    paymentStep: "ගෙවීම",
    confirmEmailBanner:
      "තහවුරු ඊමේල් එකක් යවා ඇත. ගෙවීම සම්පූර්ණ කිරීමට ඔබේ ඊමේල් තහවුරු කරන්න — ඔබට දැන් සản-ල දැකිය හැකිය.",
    registerPaddyTitle: "ඔබේ ගොළු කෙත ලියාපදිංචි කරන්න",
    registerPaddySubtitle:
      "ගොළු කෙත් සීමාව ඇඳීමෙන් චන්ද්‍රිකා-ශක්තිය සෞඛ්‍ය නිරීක්ෂණය, රෝග ඇඟවීම්, අස්වැන්න අනාවැකි සහ ව්‍යසන වාර්තා ලබා ගන්න.",
    drawFreely: "නිදහසේ ඇඳීම",
    drawFreelyDesc:
      "ජීව චන්ද්‍රිකා සản-ලෙ ඔබේ ගොළු ප්‍රදේශයේ සීමාව polygon හෝ ​රෙකටැංගල් මෙවලමින් ගෙනයන්න.",
    satelliteInsightsTitle: "චන්ද්‍රිකා තොරතුරු",
    satelliteInsightsDesc:
      "Sentinel රූපවලින් යාවත්කාලීන NDVI, EVI, VV/VH SAR අධ-ස්ථරීකරණ සහ සෞඛ්‍ය වර්ගීකරණ ලැබේ.",
    pricingCardTitle: "රු. 1,000 / acre",
    pricingCardDesc:
      "සරල ස්ථාවර මිල ගනන් — ඔබ ලියාපදිංචි කළ ප්‍රදේශය පමණක් ගෙවන්න. වාර්ෂිකව.",
    getStartedBtn: "ආරම්භ කරන්න — කෙත ඇඳීම",
    skipForNow: "දැනට අත්හරින්න — පසුව Profile හි සකසන්න →",
    drawYourPaddyField: "ඔබේ ගොළු කෙත ඇඳීම",
    drawYourPaddyDesc:
      "ගොළු කලාප සීමා ලෝඩ් කිරීමට ඔබේ දිස්ත්‍රික්කය තෝරන්න, ඉන්පසු ඔබේ කෙත ඇඳීමට draw tools භාවිත කරන්න.",
    back: "← ආපසු",
    reviewSelection: "තේරීම සමාලෝකනය →",
    reviewPaymentTitle: "සමාලෝකනය සහ ගෙවීම",
    reviewPaymentDesc: "ඔබේ කෙත් විස්තර තහවුරු කර ලියාපදිංචිය සම්පූර්ණ කරන්න.",
    fieldSummaryTitle: "කෙත් සාරාංශ",
    fieldNameLabel: "කෙත් නම",
    totalAreaLabel: "මුළු ප්‍රදේශ",
    areaSqmLabel: "ප්‍රදේශ (m²)",
    rateLabel: "ශ්‍රේණිය",
    annualCostLabel: "වාර්ෂික වියදම",
    securePaymentTitle: "ආරක්ෂිත ගෙවීම",
    previewOnlyBadge: "පෙරදර්ශනය පමණි",
    cardNumberLabel: "කාඩ් අංකය",
    expiryLabel: "කල් ඉකුත් දිනය",
    cvvLabel: "CVV",
    paymentComingSoon:
      "ගෙවීම් ද්වාරය ඉක්මනින් ලැබේ. ඔබේ slot රක්ෂා කිරීම සඳහා දැන් කෙත සුරකින්න.",
    securedSSL:
      "SSL සහිත ආරක්ෂිතව · PayHere විසින් ධාවනය · ඔබේ කාඩ් දත්ත ගබඩා නොවේ",
    backToMapBtn: "← සản-ලට ආපසු",
    savingField: "සුරකිමින්...",
    completeRegistrationBtn: "ලියාපදිංචිය සම්පූර්ණ කරන්න",

    // ── My Field Tab ──
    fieldRegistry: "කෙත් ලේඛනාගාරය",
    fieldRegistryExisting:
      "ඔබේ ලියාපදිංචි ගොළු කෙත. සීමාව යාවත්කාලීන කිරීමට Edit හෝ ප්‍රතිස්ථාපනය කිරීමට නව polygon ඇඳීම කරන්න.",
    fieldRegistryNew:
      "ඔබ තවම ගොළු කෙතක් ලියාපදිංචි කර නැත. පහත ඔබේ කෙත් සීමාව ඇඳීම කරන්න.",
    editBtn: "සංස්කරණය",
    removeBtn: "ඉවත් කරන්න",
    loadingFieldData: "කෙත් දත්ත පූරණය",
    fieldNameStat: "කෙත් නම",
    areaStat: "ප්‍රදේශය",
    annualFeeStat: "වාර්ෂික ගාස්තු",
    editModeInfo:
      "නව polygon ඇඳීමෙන් ඔබේ පවතින සීමාව ප්‍රතිස්ථාපනය කරන්න. ඉරි ගසා ඇති නිල් සීමාව ඔබේ වත්මන් කෙත් පෙන්වයි.",
    selectionSummary: "තේරීම් සාරාංශ",
    cancelBtn: "අවලංගු කරන්න",
    saveFieldBtn: "කෙත සුරකින්න",

    // ── Weather ──
    detectingLocation: "ස්ථානය හඳුනා ගනිමින්...",
    loadingWeatherData: "කාලගුණ දත්ත පූරණය කරමින්...",
    retry: "නැවත උත්සාහ කරන්න",
    paddyWeatherIntelligence: "ගොළු කෙත් කාලගුණ තොරතුරු",
    tab24Hour: "පැය 24",
    tabSoilAgro: "පස සහ කෘෂිකර්ම",
    tabHistory: "ඉතිහාසය",
    todayFieldSummary: "අද කෙත් සාරාංශය",
    next24Hours: "ඊළඟ පැය 24",
    soilAgroTitle: "පස සහ කෘෂිකර්ම",
    forecast14Day: "දින 14 අනාවැකිය",
    historicalData: "ඓතිහාසික දත්ත (දින 7)",
    temperature: "උෂ්ණත්වය",
    dewpoint: "තෙමේ ලක්ෂ්‍යය",
    pressure: "පීඩනය",
    windSpeed: "සුළං වේගය",
    windGusts: "සුළං ගඬාව",
    precipitation: "වර්ෂාපතනය",
    uvIndex: "UV දර්ශකය",
    visibility: "දෘශ්‍යතාව",
    maxTemp: "උපරිම උෂ්ණත්වය",
    minTemp: "අවම උෂ්ණත්වය",
    uvIndexMax: "UV දර්ශකය Max",
    daylightRain: "දවල් වැස්ස",
    solarRadiation: "සූර්ය විකිරණ",
    evapotranspiration: "ජලය ආශෝෂණය",
    vapourPressureDef: "ද්‍රාව්‍ය පීඩන ඌනතාව",
    windMaxToday: "අද සුළං උපරිමය",
    rainSum: "වර්ෂා සාරාංශ",
    rainProbability: "වැසි සම්භාවිතාව",

    // ── Report ──
    yieldReports: "අස්වැන්න වාර්තා",
    satelliteDerivedAnalytics: "චන්ද්‍රිකා-ලබාගත් විශ්ලේෂණ",
    single: "තනි",
    compare: "සංසන්දනය",
    liveData: "සජීව දත්ත",
  },

  ta: {
    // ── Nav ──
    dashboard: "டாஷ்போர்டு",
    fieldData: "வயல் தரவு",
    map: "வரைபடம்",
    weather: "வானிலை",
    alerts: "எச்சரிக்கைகள்",
    report: "அறிக்கை",
    help: "உதவி",
    searchPlaceholder: "தேடுங்கள்...",
    noResults: "முடிவுகள் இல்லை",

    // ── Navigation Button Tutorials (FLAT KEYS) ──
    dashboardTutTitle: "உங்கள் சகல வயல்களைப் பார்க்கவும்",
    dashboardTutAction: "பயிர் ஆரோக்கியம், மகசூல், அச்சுறுத்தல்கள் பார்க்கவும்",
    dashboardTutOutcome: "ஒரே இடத்தில் சகல வயல் தகவல்",
    
    fieldDataTutTitle: "உங்கள் வயல் பதிவுகள்",
    fieldDataTutAction: "வயல் இலக்கங்கள் மற்றும் செயல்திறன் பரிசோதிக்கவும்",
    fieldDataTutOutcome: "சகல வயல் விவரங்களையும் பார்க்கவும்",
    
    mapTutTitle: "செயற்கைக்கோள் வயல் காட்சிப்படுத்தல்",
    mapTutAction: "வயல் பிம்பங்கள் மற்றும் சுரங்குகளை பார்க்கவும்",
    mapTutOutcome: "வரைபடத்தில் ஆரோக்கியம் பார்க்கவும்",
    
    weatherTutTitle: "வானிலை முன்னிறுத்தல் சரிபார்க்கவும்",
    weatherTutAction: "வெப்பநிலை, மழை, மண் பார்க்கவும்",
    weatherTutOutcome: "வானிலையின் அடிப்படையில் விவசாய திட்டமிடுங்கள்",
    
    alertsTutTitle: "பூச்சிக்கு மற்றும் நோய் அச்சரிக்கைகளைப் பெறுங்கள்",
    alertsTutAction: "பயிர்களுக்கான செயலில் அச்சுறுத்தல்கள் பார்க்கவும்",
    alertsTutOutcome: "உங்கள் பயிர்களுக்கான ஆபத்து பற்றி அறிந்து கொள்ளுங்கள்",
    
    reportTutTitle: "மகசூல் செயல்திறனை பகுப்பாய்வு செய்யவும்",
    reportTutAction: "மாவட்டம் மற்றும் மகசூல் ஒப்பிடுங்கள்",
    reportTutOutcome: "மகசூல் முடிவுகளை புரிந்து கொள்ளுங்கள்",
    
    helpTutTitle: "உதவி மற்றும் ஆதரவு பெறுங்கள்",
    helpTutAction: "பதில் மற்றும் FAQ கண்டுபிடிக்கவும்",
    helpTutOutcome: "உங்களுக்கு தேவை எனில் உதவி பெறுங்கள்",
    
    chatbotTutTitle: "তাৎক্ষণিક AI পরামর্শ পান",
    chatbotTutAction: "চ্যাট সহায়ক খুলতে ক্লিক করুন",
    chatbotTutOutcome: "প্রশ্ন জিজ্ঞাসা করুন এবং তাৎক্ষণিক উত্তর পান",
    
    // ── Header Action Button Tutorials (FLAT KEYS) ──
    searchHeaderTitle: "பக்கங்களை விரைவாக கண்டுபிடிக்கவும்",
    searchHeaderAction: "பக்கம் அல்லது மாவட்ட பெயர் தட்டச்சு செய்யவும்",
    searchHeaderOutcome: "எந்த பக்கத்திற்கும் உடனடியாக குதிக்கவும்",
    
    languageTitle: "மொழி மாற்றவும்",
    languageAction: "ஆங்கிலம், சிங்களம் அல்லது தமிழ்ப் பயன்பாட்டைத் தேர்க்கவும்",
    languageOutcome: "பயன்பாடு உங்கள் மொழியில் தோன்றும்",
    
    themeTitle: "பிரகாசம் நிலை மாற்றவும்",
    themeAction: "சந்திரன்/சூரியன் ஐகனைக் கிளிக் செய்யவும்",
    themeOutcome: "அன்பான அல்லது ஒளி பயன்முறை ஏற்ற இறக்கம் செய்யவும்",
    
    notificationsTitle: "செய்திகளை சரிபார்க்கவும்",
    notificationsAction: "எச்சரிக்கைகள் மற்றும் புதுப்பிப்புகளைப் பார்க்கவும்",
    notificationsOutcome: "தெரிந்து கொள்ளப்படுவது முக்கியமான நிகழ்வுகளைப் பற்றி",
    
    profileTitle: "உங்கள் கணக்கு அமைப்புகள்",
    profileAction: "உங்கள் தகவலைத் திருத்தவும்",
    profileOutcome: "உங்கள் சுயவிவர விவரங்களை புதுப்பிக்கவும்",

    // ── Field Setup Tutorials ──
    fieldSetupTutorial: {
      getStarted: {
        title: "வயல் பதிவைத் தொடங்கவும்",
        action: "உங்கள் வயலை வரைய தொடங்க 'தொடங்குங்கள்' கிளிக் செய்யவும்",
        outcome: "மாவட்டத்தைத் தேர்ந்தெடுக்க மற்றும் வரைபடத்தில் வயல் எல்லையை வரைய வழிகாட்டப்படுவீர்கள்",
      },
      review: {
        title: "உங்கள் வயலை மதிப்பாய்வு செய்யவும்",
        action: "வரைந்த பிறகு, விவரங்களை சரிபார்க்க 'மதிப்பாய்வு செய்யவும்' கிளிக் செய்யவும்",
        outcome: "ஏக்கரில் வயல் பரப்பு மற்றும் வருடாந்திர செலவு முறிவு உங்கள் அறிவுக்கு வரும்",
      },
      complete: {
        title: "பதிவை முடிக்கவும்",
        action: "உங்கள் வயலை சேமிக்க 'முடிக்கவும்' கிளிக் செய்யவும்",
        outcome: "உங்கள் வயல் பதிவுசெய்யப்பட்டு குறிப்பெடுக்கத் தொடங்கலாம்",
      },
      download: {
        title: "அறிக்கை ஏற்றுமதி செய்யவும்",
        action: "வயல் பகுப்பாய்வு அறிக்கையைப் பெற 'PDF பதிவிறக்கு' கிளிக் செய்யவும்",
        outcome: "வயல் தரவு மற்றும் பகுப்பாய்வு கொண்ட விரிவான PDF ஆவணம் தயாரிக்கப்படுகிறது",
      },
    },

    // ── Dashboard ──
    welcomeTitle: "RiceVision-க்கு வரவேற்கிறோம்",
    welcomeSubtitle: "சிறந்த விவசாயத்தின் நுண்ணறிவு",
    systemSynced: "கணினி இணைக்கப்பட்டது",
    cropHealthDist: "பயிர் ஆரோக்கிய விநியோகம்",
    analysing: "பகுப்பாய்வு செய்கிறது...",
    optimal: "உகந்த",
    mildStress: "மிதமான அழுத்தம்",
    severeStress: "கடுமையான அழுத்தம்",
    outputProjection: "உற்பத்தி முன்னிறுத்தல்",
    metricTons: "மெட்ரிக் டன் (மதி.)",
    highPerformance: "உயர் செயல்திறன் பகுதிகள்",
    supplyStability: "வழங்கல் நிலைத்தன்மை",
    expectedShortfall: "எதிர்பார்க்கப்படும் பற்றாக்குறை (MT)",
    nationalDemand: "தேசிய தேவை திருப்திகரம்",
    referenceThreshold: "குறிப்பு: 3.0M MT வரம்பு",
    diseaseOutbreak: "நோய் & பேரழிவு வெடிப்பு",
    checkingFields: "வயல்களை சரிபார்க்கிறது...",
    alertsDetected: "எச்சரிக்கைகள் கண்டறியப்பட்டன",
    viewDetails: "விவரங்கள் காண்க",
    showLess: "குறைவாக காட்டு",
    showAll: "அனைத்தும் காட்டு",
    growthAnalysis: "வளர்ச்சி பகுப்பாய்வு",
    cropStageDistribution: "பயிர் கட்ட விநியோகம்",
    totalFieldsTracked: "கண்காணிக்கப்படும் மொத்த வயல்கள்",
    districtHealthMap: "மாவட்ட ஆரோக்கிய வரைபடம்",

    // ── Alerts ──
    fieldRiskAlerts: "வயல் அபாய எச்சரிக்கைகள்",
    automatedMonitoring: "தானியங்கி கண்காணிப்பு",
    active: "செயலில்",
    resolved: "தீர்வு காணப்பட்டது",
    disasters: "பேரழிவுகள்",
    pestRisks: "பூச்சி அபாயங்கள்",
    pastAlerts: "கடந்த எச்சரிக்கைகள்",
    findAnomaly: "குறிப்பிட்ட வினோதத்தை தேடுங்கள்...",
    noThreats: "செயலில் உள்ள அச்சுறுத்தல்கள் இல்லை",
    resolveBtn: "தீர்க்கவும்",
    ignoreBtn: "புறக்கணிக்க",
    viewInMap: "வரைபடத்தில் காண்க",

    // ── Help ──
    helpSupport: "உதவி & ஆதரவு",
    quickAssistance: "விரைவு உதவி",
    quickAssistanceDesc: "முக்கியமான தகராறுகளுக்கு உடனடி உதவி.",
    dialConcierge: "அழைக்கவும்",
    askTeam: "எங்கள் குழுவிடம் கேளுங்கள்",
    askTeamDesc: "அவசர அல்லாத கோரிக்கைகள் அல்லது கருத்துக்களை சமர்ப்பிக்கவும்.",
    transmitEmail: "மின்னஞ்சல் அனுப்பவும்",
    feedbackLoop: "கருத்து வழிமுறை",
    fullOperatorName: "முழு இயக்குநர் பெயர்",
    assignedPosition: "நியமிக்கப்பட்ட பதவி",
    province: "மாகாணம்",
    district: "மாவட்டம்",
    anomalyType: "பிரச்சனை வகை",
    selectSeverity: "தீவிரத்தை தேர்ந்தெடுக்கவும்",
    detailedMessage: "விரிவான செய்தி",
    describeIssue: "பிரச்சனையை விரிவாக விவரிக்கவும்...",
    transmitting: "அனுப்புகிறது...",
    submitReport: "அறிக்கையை சமர்ப்பிக்கவும்",
    quickHelp: "விரைவு உதவி",
    decryptingFaqs: "FAQs ஏற்றுகிறது...",

    // ── Field Data ──
    fieldIntelligence: "வயல் நுண்ணறிவு",
    liveStream: "நேரடி ஒளிபரப்பு",
    decryptingIntel: "வயல் தரவு பகுப்பாய்வு செய்கிறது...",
    districtPerformance: "மாவட்ட செயல்திறன் சுருக்கம்",
    colDistrict: "மாவட்டம்",
    colTotalFields: "மொத்த வயல்கள்",
    colHealthy: "ஆரோக்கியமான",
    colStressed: "அழுத்தமான",
    colCritical: "ஆபத்தான",
    colAvgYield: "சராசரி மகசூல் (kg/ha)",
    colTotalYield: "மொத்த மகசூல் (kg)",

    // ── Weather ──
    weatherTitle: "வானிலை நுண்ணறிவு",
    locating: "இடம் கண்டறிகிறது...",
    locateMe: "என்னை கண்டுபிடி",
    sunrise: "சூரிய உதயம்",
    sunset: "சூரிய அஸ்தமனம்",
    todayRain: "இன்று மழை",
    feelsLike: "உணர்வு",
    humidity: "ஈரப்பதம்",
    cloudCover: "மேக மூட்டம்",
    atmospheric: "வளிமண்டல நிலைமைகள்",
    tabOverview: "கண்ணோட்டம்",
    tabHourly: "மணிநேர",
    tab14Day: "14 நாட்கள்",
    tabSoil: "மண்",
    tabAgriculture: "விவசாயம்",

    // ── Report ──
    reportTitle: "மகசூல் பகுப்பாய்வு",
    singleDistrict: "ஒற்றை மாவட்டம்",
    compareDistricts: "மாவட்டங்களை ஒப்பிடு",
    generateReport: "அறிக்கை உருவாக்கு",
    downloadPdf: "PDF பதிவிறக்கு",
    season: "பருவம்",
    noData: "தரவு இல்லை",
    loading: "ஏற்றுகிறது...",

    // ── Profile ──
    operatorAuth: "இயக்குநர் அங்கீகாரம்",
    identityProfile: "அடையாள சுயவிவரம்",
    profileDesc:
      "RiceVision நெட்வொர்க்கில் உங்கள் இயக்குநர் சான்றுகளை முடிக்கவும்.",
    personalId: "தனிப்பட்ட அடையாளம்",
    sectorReg: "துறை பதிவு",
    givenName: "முதல் பெயர்",
    surname: "குடும்ப பெயர்",
    identification: "அடையாளம் (NIC)",
    tacticalPhone: "தொலைபேசி",
    emailEndpoint: "மின்னஞ்சல் முகவரி",
    address: "முகவரி",
    uploadingMatrix: "புகைப்படம் பதிவேற்றுகிறது...",
    updating: "புதுப்பிக்கிறது...",
    updateProfile: "அடையாளத்தை ஒத்திசைக்கவும்",

    // ── Notifications ──
    notifications: "அறிவிப்புகள்",
    noNotifications: "அறிவிப்புகள் இல்லை",

    // ── Sign In ──
    welcomeBack: "மீண்டும் வரவேற்கிறோம்",
    signInDetails: "உங்கள் டாஷ்போர்டை அணுக விவரங்களை உள்ளிடவும்.",
    emailAddress: "மின்னஞ்சல் முகவரி",
    password: "கடவுச்சொல்",
    forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
    keepLoggedIn: "உள்நுழைந்திருக்கவும்",
    signingIn: "உள்நுழைகிறது...",
    signInBtn: "கணக்கில் உள்நுழைக",
    orDivider: "அல்லது",
    noAccount: "கணக்கு இல்லையா?",
    signUpLink: "பதிவு செய்யவும்",
    continueGoogle: "Google மூலம் தொடரவும்",

    // ── Sign Up ──
    createAccount: "கணக்கு உருவாக்கவும்",
    fullName: "முழு பெயர்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    alreadyAccount: "ஏற்கனவே கணக்கு இருக்கிறதா?",
    signInLink: "உள்நுழையவும்",
    signingUp: "கணக்கு உருவாக்குகிறது...",
    signUpBtn: "கணக்கு உருவாக்கவும்",

    // ── Sidebar ──
    myDashboard: "என் டாஷ்போர்டு",
    fieldMap: "வயல் வரைபடம்",
    myProfile: "என் சுயவிவரம்",
    helpFAQ: "உதவி & FAQ",
    logout: "வெளியேறவும்",

    // ── Profile Tabs ──
    myPaddyField: "என் நெல் வயல்",
    paddyFieldDesc:
      "உங்கள் பதிவு செய்யப்பட்ட நெல் வயல் எல்லையை பார்க்கவும், வரையவும், புதுப்பிக்கவும்.",

    // ── ProfileForm extra ──
    districtSector: "மாவட்ட துறை",
    physicalAddress: "இயற்பியல் முகவரி",
    synchronizing: "ஒத்திசைக்கிறது...",
    synchronized: "ஒத்திசைக்கப்பட்டது",
    registryIdentity: "பதிவேட்டு அடையாளம்",

    // ── Reset Password ──
    resetPassword: "கடவுச்சொல் மீட்டமைவு",
    sendResetLink: "மீட்டமைவு இணைப்பை அனுப்பவும்",
    sending: "அனுப்புகிறது...",
    resetEmailSent:
      "✅ கடவுச்சொல் மீட்டமைவு மின்னஞ்சல் அனுப்பப்பட்டது! உங்கள் inbox சரிபார்க்கவும்.",
    setNewPassword: "புதிய கடவுச்சொல் அமைக்கவும்",
    newPassword: "புதிய கடவுச்சொல்",
    enterNewPassword: "புதிய கடவுச்சொல் உள்ளிடவும்",
    reEnterNewPassword: "புதிய கடவுச்சொல் மீண்டும் உள்ளிடவும்",
    updatePasswordBtn: "கடவுச்சொல்லை புதுப்பிக்கவும்",
    passwordUpdatedMsg:
      "கடவுச்சொல் வெற்றிகரமாக புதுப்பிக்கப்பட்டது! திருப்பி அனுப்புகிறது...",
    passwordMinLengthError:
      "கடவுச்சொல் குறைந்தது 6 எழுத்துகளாக இருக்க வேண்டும்.",
    passwordsNoMatchError: "கடவுச்சொற்கள் பொருந்தவில்லை.",

    // ── Field Setup ──
    fieldRegistration: "வயல் பதிவு",
    introductionStep: "அறிமுகம்",
    drawFieldStep: "வயல் வரையுங்கள்",
    paymentStep: "கட்டணம்",
    confirmEmailBanner:
      "உறுதிப்படுத்தல் மின்னஞ்சல் அனுப்பப்பட்டது. கட்டணம் செலுத்துவதற்கு முன் உங்கள் மின்னஞ்சலை உறுதிப்படுத்துங்கள் — இப்போது வரைபடத்தை முன்னோட்டமிடலாம்.",
    registerPaddyTitle: "உங்கள் நெல் வயலை பதிவு செய்யுங்கள்",
    registerPaddySubtitle:
      "செயற்கைக்கோள் ஆரோக்கிய கண்காணிப்பு, நோய் எச்சரிக்கைகள், மகசூல் முன்னிறுத்தல்கள் மற்றும் பேரழிவு அறிக்கைகளை திறக்க வரைபடத்தில் நெல் வயல் எல்லையை வரையுங்கள்.",
    drawFreely: "சுதந்திரமாக வரையுங்கள்",
    drawFreelyDesc:
      "நேரடி செயற்கைக்கோள் வரைபடத்தில் உங்கள் நெல் பரப்பின் சரியான எல்லையை வரைய பலகோணம் அல்லது செவ்வக கருவியைப் பயன்படுத்துங்கள்.",
    satelliteInsightsTitle: "செயற்கைக்கோள் நுண்ணறிவு",
    satelliteInsightsDesc:
      "Sentinel படங்களிலிருந்து புதுப்பிக்கப்பட்ட NDVI, EVI, VV/VH SAR அடுக்குகள் மற்றும் ஆரோக்கிய வகைப்படுத்தல்களை பெறுங்கள்.",
    pricingCardTitle: "ரூ. 1,000 / ஏக்கர்",
    pricingCardDesc:
      "எளிய வெளிப்படையான விலை நிர்ணயம் — நீங்கள் பதிவு செய்யும் பரப்புக்கு மட்டுமே கட்டணம். வருடாந்திரம்.",
    getStartedBtn: "தொடங்குங்கள் — என் வயலை வரையுங்கள்",
    skipForNow: "இப்போது தவிர்க்கவும் — பின்னர் சுயவிவரத்தில் அமைக்கவும் →",
    drawYourPaddyField: "உங்கள் நெல் வயலை வரையுங்கள்",
    drawYourPaddyDesc:
      "நெல் மண்டல எல்லைகளை ஏற்ற மாவட்டத்தை தேர்ந்தெடுக்கவும், பின்னர் உங்கள் வயலை வரைய வரைகலை கருவிகளைப் பயன்படுத்துங்கள்.",
    back: "← பின்பு",
    reviewSelection: "தேர்வை மதிப்பாய்வு செய்யுங்கள் →",
    reviewPaymentTitle: "மதிப்பாய்வு & கட்டணம்",
    reviewPaymentDesc:
      "உங்கள் வயல் விவரங்களை உறுதிப்படுத்தி பதிவை முடிக்கவும்.",
    fieldSummaryTitle: "வயல் சுருக்கம்",
    fieldNameLabel: "வயல் பெயர்",
    totalAreaLabel: "மொத்த பரப்பு",
    areaSqmLabel: "பரப்பு (m²)",
    rateLabel: "விகிதம்",
    annualCostLabel: "வருடாந்திர செலவு",
    securePaymentTitle: "பாதுகாப்பான கட்டணம்",
    previewOnlyBadge: "முன்னோட்டம் மட்டும்",
    cardNumberLabel: "அட்டை எண்",
    expiryLabel: "காலாவதி",
    cvvLabel: "CVV",
    paymentComingSoon:
      "கட்டண நுழைவாயில் விரைவில் வருகிறது. உங்கள் இடத்தை ஒதுக்க இப்போது வயலை சேமிக்கவும்.",
    securedSSL:
      "SSL மூலம் பாதுகாக்கப்பட்டது · PayHere மூலம் இயக்கப்படுகிறது · உங்கள் அட்டை தரவு ஒருபோதும் சேமிக்கப்படாது",
    backToMapBtn: "← வரைபடத்திற்கு திரும்பவும்",
    savingField: "சேமிக்கிறது...",
    completeRegistrationBtn: "பதிவை முடிக்கவும்",

    // ── My Field Tab ──
    fieldRegistry: "வயல் பதிவேடு",
    fieldRegistryExisting:
      "உங்கள் பதிவு செய்யப்பட்ட நெல் வயல். எல்லையை புதுப்பிக்க திருத்து அல்லது மாற்ற புதிய பலகோணம் வரையுங்கள்.",
    fieldRegistryNew:
      "நீங்கள் இன்னும் நெல் வயல் பதிவு செய்யவில்லை. கீழே உங்கள் வயல் எல்லையை வரையுங்கள்.",
    editBtn: "திருத்து",
    removeBtn: "அகற்றவும்",
    loadingFieldData: "வயல் தரவு ஏற்றுகிறது",
    fieldNameStat: "வயல் பெயர்",
    areaStat: "பரப்பு",
    annualFeeStat: "வருடாந்திர கட்டணம்",
    editModeInfo:
      "புதிய பலகோணத்தை வரைந்து உங்கள் தற்போதைய எல்லையை மாற்றவும். சரிய நீல கோடு உங்கள் தற்போதைய வயலை காட்டுகிறது.",
    selectionSummary: "தேர்வு சுருக்கம்",
    cancelBtn: "ரத்துசெய்",
    saveFieldBtn: "வயலை சேமி",

    // ── Weather ──
    detectingLocation: "உங்கள் இடத்தை கண்டறிகிறது...",
    loadingWeatherData: "வானிலை தரவு ஏற்றுகிறது...",
    retry: "மீண்டும் முயற்சிக்க",
    paddyWeatherIntelligence: "நெல் வயல் வானிலை நுண்ணறிவு",
    tab24Hour: "24 மணி நேரம்",
    tabSoilAgro: "மண் & விவசாயம்",
    tabHistory: "வரலாறு",
    todayFieldSummary: "இன்றைய வயல் சுருக்கம்",
    next24Hours: "அடுத்த 24 மணி நேரம்",
    soilAgroTitle: "மண் & விவசாய நுண்ணறிவு",
    forecast14Day: "14 நாள் முன்னிறுத்தல்",
    historicalData: "வரலாற்று தரவு (7 நாட்கள்)",
    temperature: "வெப்பநிலை",
    dewpoint: "பனி புள்ளி",
    pressure: "அழுத்தம்",
    windSpeed: "காற்று வேகம்",
    windGusts: "காற்று வீச்சு",
    precipitation: "மழையளவு",
    uvIndex: "UV குறியீடு",
    visibility: "தெரிவுநிலை",
    maxTemp: "அதிகபட்ச வெப்பம்",
    minTemp: "குறைந்தபட்ச வெப்பம்",
    uvIndexMax: "UV அதிகபட்சம்",
    daylightRain: "பகல் மழை",
    solarRadiation: "சூரிய கதிர்வீச்சு",
    evapotranspiration: "ஆவியாதல்",
    vapourPressureDef: "ஆவி அழுத்த குறைபாடு",
    windMaxToday: "இன்று காற்று அதிகபட்சம்",
    rainSum: "மழை மொத்தம்",
    rainProbability: "மழை வாய்ப்பு",

    // ── Report ──
    yieldReports: "மகசூல் அறிக்கைகள்",
    satelliteDerivedAnalytics:
      "செயற்கைக்கோள்-பெறப்பட்ட பகுப்பாய்வு & மாவட்ட மகசூல் முன்னிறுத்தல்கள்",
    single: "ஒற்றை",
    compare: "ஒப்பிடு",
    liveData: "நேரடி தரவு",
  },
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  const handleSetLanguage = (code) => {
    setLanguage(code);
    localStorage.setItem("language", code);
  };

  const t = (key) =>
    translations[language]?.[key] ?? translations["en"][key] ?? key;

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
