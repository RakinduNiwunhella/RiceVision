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
    welcomeSubtitle: "Insights for smarter farming",
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
    loadingStageData: "Loading stage data...",
    districtOverview: "District Overview",
    districtPestHealthStatus: "District Pest & Health Status",
    districtHealthMap: "District Health Map",

    // ── Alerts ──
    fieldRiskAlerts: "Field Risk Alerts",
    automatedMonitoring: "Automated Monitoring",
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
    quickAssistanceDesc: "Get quick help for urgent issues.",
    dialConcierge: "Dial Concierge",
    askTeam: "Ask Our Team",
    askTeamDesc: "Send non-urgent questions or feedback.",
    transmitEmail: "Transmit Email",
    feedbackLoop: "Feedback Form",
    fullOperatorName: "Full Operator Name",
    assignedPosition: "Assigned Position",
    province: "Province",
    district: "District",
    anomalyType: "Anomaly Type",
    selectSeverity: "Select Severity",
    detailedMessage: "Detailed Message",
    describeIssue: "Describe the issue in detail so we can help you...",
    transmitting: "Transmitting...",
    submitReport: "Submit Your Report",
    quickHelp: "Quick Help",
    decryptingFaqs: "Loading FAQs...",

    // ── Field Data ──
    fieldIntelligence: "Field Intelligence",
    liveStream: "Live Data Stream",
    decryptingIntel: "Analyzing field data...",
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
      "Keep your profile details up to date for a better experience in RiceVision.",
    personalId: "Personal Identification",
    sectorReg: "Sector Registration",
    givenName: "Given Name",
    surname: "Surname",
    identification: "Identification (NIC)",
    tacticalPhone: "Phone Number",
    emailEndpoint: "Email Address",
    address: "Address",
    uploadingMatrix: "Uploading photo...",
    updating: "Updating...",
    updateProfile: "Update Profile",

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

    // ── Cross-Page Missing Keys ──
    districtStat: "District",
    hourlyForecast: "Hourly Forecast",
    soilAgronomic: "Soil & Agronomic Data",
    historyData: "Historical Data",
    confirmEmailLoginBeforeSave:
      "Please confirm your email and log in before saving your field.",
    saveFieldFailedPrefix: "Could not save field",
    fieldMonitoringTitle: "RiceVision Field Monitoring",
    sriLanka: "Sri Lanka",
    payNow: "Pay",
    perYear: "year",
    saveFailedPrefix: "Save failed",
    fieldBoundarySaved: "Field boundary saved to registry.",
    confirmRemoveFieldRegistration:
      "Are you sure you want to remove your field registration? This cannot be undone.",
    deleteFailedPrefix: "Delete failed",
    fieldRegistrationRemoved: "Field registration removed.",
    quickPhoneSupportTitle: "Quick phone support",
    quickPhoneSupportDesc:
      "Call our support team for urgent help with your dashboard, field setup, or report issues.",
    emailSupportTitle: "Email support",
    emailSupportDesc:
      "Send your issue details by email and our team will respond with a solution.",
    call: "Call",
    email: "Email",
    submitComplaintTitle: "Submit a complaint",
    fullNameExample: "John Doe",
    assignedPositionExample: "Field Supervisor",
    selectIssueType: "Select issue type",
    issueTechnical: "Technical issue",
    issueDataMismatch: "Data mismatch",
    issueAccountAccess: "Account or access issue",
    issueOther: "Other",
    complaintValidationRequired: "Full name and complaint message are required.",
    complaintSubmittedSuccess: "Complaint submitted successfully.",
    complaintSubmitFailed: "Failed to submit complaint.",
    resolveAlertTitle: "Resolve Alert",
    resolutionNoteOptional: "Resolution Note (optional)",
    resolutionNotePlaceholder: "Describe how this was resolved...",
    confirmBtn: "Confirm",
    alertsRealtimeSubtitle: "Real-time field health intelligence",
    noPastThreats: "No past threats detected",
    noteLabel: "Note",
    alertsTutorialTabsTitle: "Alert Tabs",
    alertsTutorialTabsAction:
      "Click on different tabs to view different types of alerts.",
    alertsTutorialTabsOutcome:
      "You will see disasters, pest risks, or past resolved alerts.",
    alertsTutorialSearchTitle: "Search Alerts",
    alertsTutorialSearchAction:
      "Type in the search box to find specific alerts.",
    alertsTutorialSearchOutcome:
      "The alert list filters to show only matching results.",
    alertsTutorialResolveTitle: "Resolve Alert",
    alertsTutorialResolveAction:
      "Click the Resolve button on any active alert.",
    alertsTutorialResolveOutcome:
      "A dialog opens where you can add a resolution note.",
    alertsTutorialIgnoreTitle: "Ignore Alert",
    alertsTutorialIgnoreAction:
      "Click Ignore to dismiss an alert without resolving.",
    alertsTutorialIgnoreOutcome:
      "The alert moves to the Past Alerts tab.",
    alertsTutorialMapTitle: "View on Map",
    alertsTutorialMapAction:
      "Click View in Map to see the alert location.",
    alertsTutorialMapOutcome:
      "You are taken to the map showing the affected area.",
    fieldDataOverviewTitle: "Field Data Overview",
    fieldDataOverviewAction:
      "This page shows a summary of all your field statistics.",
    fieldDataOverviewOutcome:
      "You will see total fields, healthy count, stressed crops, and critical alerts.",
    fieldDataSummaryTitle: "Summary Statistics",
    fieldDataSummaryAction:
      "Check the stat cards for quick field health metrics.",
    fieldDataSummaryOutcome:
      "Green means healthy fields, yellow means stressed fields, and red means critical alerts.",
    fieldDataDistrictTableTitle: "District Comparison Table",
    fieldDataDistrictTableAction:
      "Scroll through the table to see field data for each district.",
    fieldDataDistrictTableOutcome:
      "Compare health, total yield, and stress across districts.",
    fieldDataViewMapTitle: "View on Map",
    fieldDataViewMapAction:
      "Use View in Map next to any district to open the map.",
    fieldDataViewMapOutcome:
      "The map opens focused on the selected district.",
    actionLabel: "Action",
    viewReportBtn: "View Report",
    weatherTutorialOverviewAction:
      "Explore current weather conditions including temperature, rain, and wind.",
    weatherTutorialOverviewOutcome:
      "You will see real-time weather measurements for your location.",
    weatherTutorialHourlyAction:
      "Open the hourly tab to view 24-hour weather progression.",
    weatherTutorialHourlyOutcome:
      "You will see temperature, rain, and wind changes for the next 24 hours.",
    weatherTutorialSoilAction:
      "Open the soil tab to view soil and agronomic conditions.",
    weatherTutorialSoilOutcome:
      "You will see soil temperature, moisture, VPD, and evapotranspiration data.",
    weatherTutorialForecastAction:
      "Open the forecast tab to view the extended 14-day outlook.",
    weatherTutorialForecastOutcome:
      "You will see daily predictions to plan field operations.",
    weatherTutorialHistoryAction:
      "Open the history tab to review past weather records.",
    weatherTutorialHistoryOutcome:
      "You will see recent patterns to compare seasonal behavior.",
    dsDivision: "DS Division",
    colombo: "Colombo",
    autoDetected: "Auto-detected",
    daytime: "Daytime",
    night: "Night",
    hourlyDetailTable: "Hourly Detail Table",
    soilTemperatureProfiles: "Soil Temperature Profiles",
    soilMoistureContent: "Soil Moisture Content",
    agronomicIndicators: "Agronomic Indicators",
    sprayFieldAdvisory: "Spray & Field Work Advisory",
    outlook14Day: "14-Day Outlook",
    weeklyAgroForecastDetail: "Weekly Agro Forecast Detail",
    past7DaysFieldHistory: "Past 7 Days - Field History",
    historicalDetailTable: "Historical Detail Table",
    reportTutorialOverviewAction:
      "Explore satellite-derived yield predictions and analysis.",
    reportTutorialOverviewOutcome:
      "You will see detailed forecasts with comparative metrics and export options.",
    reportTutorialModeTitle: "Single vs Compare",
    reportTutorialModeAction:
      "Switch between Single and Compare modes for side-by-side analysis.",
    reportTutorialModeOutcome:
      "You can analyze one district or compare two districts.",
    reportTutorialDistrictTitle: "District Selection",
    reportTutorialDistrictAction:
      "Select a district to view its yield analytics.",
    reportTutorialDistrictOutcome:
      "The report loads data and predictions for that district.",
    reportTutorialYieldTitle: "Yield Prediction",
    reportTutorialYieldAction:
      "Review predicted yield and historical comparison.",
    reportTutorialYieldOutcome:
      "You will see expected harvest and baseline values.",
    reportTutorialMetricsTitle: "Metrics and Export",
    reportTutorialMetricsAction:
      "Review pest and risk metrics, then export the report.",
    reportTutorialMetricsOutcome:
      "A complete analysis PDF can be downloaded.",
    dataUnavailable: "Data Unavailable",
    fetchingSatelliteData: "Fetching satellite data...",
    viewLabel: "View",
    primaryLabel: "Primary",
    comparisonLabel: "Comparison",
    predictedAverage: "Predicted Average",
    totalYieldLabel: "Total Yield",
    historicalBaseline: "Historical Baseline",
    pestCount: "Pest Count",
    riskFactor: "Risk Factor",
    exportComparisonReport: "Export Comparison Report",
    loginFailed: "Login failed",
    pleaseEnterEmail: "Please enter your email.",
    failedToSendResetEmail: "Failed to send reset email.",
    networkErrorTryAgain: "Network error. Please try again.",
    validEmailAddressError: "Please enter a valid email address.",
    signupFailed: "Signup failed",
    createAccountSubtitle: "Create your RiceVision account to get started.",
    sidebarTutorialNavTitle: "Sidebar Navigation",
    sidebarTutorialNavAction:
      "Use the left sidebar to navigate between main pages.",
    sidebarTutorialNavOutcome:
      "You can access Dashboard, Field Map, Alerts, Weather, Reports, and more from here.",
    sidebarTutorialTopTitle: "Top Navigation Links",
    sidebarTutorialTopAction:
      "Click Dashboard, Field Map, or other items to navigate.",
    sidebarTutorialTopOutcome:
      "The highlighted item shows your current page.",
    sidebarTutorialBottomTitle: "Bottom Options",
    sidebarTutorialBottomAction:
      "Open profile settings, support, or logout from the bottom section.",
    sidebarTutorialBottomOutcome:
      "You can manage your account quickly from any page.",
    systemVersionTag: "System Version Alpha-1.0.4 - RiceVision Core",
    dashboardTutorialWelcome:
      "Welcome. This is your field control center overview.",
    dashboardTutorialSync:
      "Check this icon to ensure your data is freshly synced.",
    dashboardTutorialHealth:
      "See crop health as a pie chart. Green means optimal.",
    dashboardTutorialYield:
      "View your expected total harvest here in metric tons.",
    dashboardTutorialSupply:
      "Track expected shortfalls and national demand risks quickly.",
    dashboardTutorialThreats:
      "Review active disease outbreaks and critical pest risks.",
    dashboardTutorialThreatDetails:
      "Open detailed recommendations for this threat.",
    dashboardTutorialThreatToggle:
      "Expand or collapse your threat list.",
    dashboardTutorialStageChart:
      "Check what percentage of your crops are in each growth stage.",
    dashboardTutorialDistrictTable:
      "Compare health metrics across all your districts in one table.",
    dashboardTutorialDistrictToggle:
      "Use this button to expand the full district list.",
    fieldsLabel: "fields",
    countLabel: "Count",
    statusSafe: "SAFE",
    statusModerate: "MODERATE",
    statusCritical: "CRITICAL",
    statusStable: "STABLE",
    statusWarning: "WARNING",
    statusHighRisk: "HIGH RISK",
    wmoClearSky: "Clear Sky",
    wmoPartlyCloudy: "Partly Cloudy",
    wmoOvercast: "Overcast",
    wmoFoggyHaze: "Foggy / Haze",
    wmoDrizzle: "Drizzle",
    wmoRain: "Rain",
    wmoSnowIce: "Snow / Ice",
    wmoRainShowers: "Rain Showers",
    wmoHeavySnowShowers: "Heavy Snow Showers",
    wmoThunderstorm: "Thunderstorm",
    wmoUnknown: "Unknown",
    weatherAdvisoryFeels: "Feels {temp}°C",
    weatherAdvisoryFungalRisk: "Fungal risk",
    weatherAdvisoryNormal: "Normal",
    weatherAdvisoryMoistureThreshold: "Moisture saturation threshold",
    weatherAdvisoryPoorSunlight: "Poor sunlight",
    weatherAdvisoryGoodForCrops: "Good for crops",
    weatherAdvisoryMeanSeaLevel: "Mean sea level",
    weatherAdvisoryAvoidSpraying: "Avoid spraying",
    weatherAdvisorySafeForSpraying: "Safe for spraying",
    weatherAdvisoryHighGusts: "High gusts",
    weatherAdvisorySafe: "Safe",
    weatherAdvisoryCurrentHour: "Current hour",
    weatherAdvisoryUVVeryHigh: "Very high",
    weatherAdvisoryUVModerate: "Moderate",
    weatherAdvisoryUVLow: "Low",
    weatherAdvisoryPoorVisibility: "Poor visibility",
    weatherAdvisoryGood: "Good",
    weatherAdvisoryHoursWithRain: "Hours with rain",
    weatherAdvisoryTodayTotal: "Today total",
    weatherAdvisoryIrrigationGuide: "Irrigation guide",
    weatherAdvisoryCropStress: "Crop stress",
    weatherAdvisoryTotalRainToday: "Total rain today",
    weatherAdvisoryMaxChanceToday: "Max chance today",
    weatherTableColTime: "Time",
    weatherTableColCondition: "Condition",
    weatherTableColTemp: "Temp",
    weatherTableColFeels: "Feels",
    weatherTableColHumidity: "Humidity",
    weatherTableColRainPercent: "Rain%",
    weatherTableColRainMm: "Rain mm",
    weatherTableColWind: "Wind",
    weatherTableColUV: "UV",
    weatherTableColET0: "ET0",
    weatherTableColVisibility: "Visibility",
    weatherTableColDate: "Date",
    weatherTableColMaxTemp: "Max C",
    weatherTableColMinTemp: "Min C",
    weatherTableColWindMax: "Wind Max",
    weatherTableColUvMax: "UV Max",
    weatherTableColRadiation: "Radiation",
    weatherTableColSunrise: "Sunrise",
    weatherTableColSunset: "Sunset",
    weatherTableColConditions: "Conditions",
    weatherTableColRainSum: "Rain Sum",
    weatherTableColRainHours: "Rain Hrs",
    soilTempSurfaceLabel: "Surface (0 cm)",
    soilTempSurfaceDesc: "Top layer - seed germination zone",
    soilTempShallowLabel: "Shallow (6 cm)",
    soilTempShallowDesc: "Root zone for seedlings",
    soilTempMediumLabel: "Medium (18 cm)",
    soilTempMediumDesc: "Active root zone - paddy growth",
    soilAdvisoryTooCold: "Too cold for germination",
    soilAdvisoryHeatStress: "Heat stress risk",
    soilAdvisoryOptimal: "Optimal for paddy",
    soilMoistureDepth0to1: "0-1 cm",
    soilMoistureDepth0to1Desc: "Topsoil - surface evaporation layer",
    soilMoistureDepth1to3: "1-3 cm",
    soilMoistureDepth1to3Desc: "Seedling root zone",
    soilMoistureDepth3to9: "3-9 cm",
    soilMoistureDepth3to9Desc: "Primary root absorption zone",
    soilMoistureLabel: "Soil Moisture",
    soilMoistureLow: "Low - consider irrigation",
    soilMoistureSaturated: "Saturated",
    soilMoistureGood: "Good moisture level",
    et0EvapotranspirationToday: "ET0 Evapotranspiration Today",
    et0Description:
      "Reference evapotranspiration (FAO-56) is the amount of water crops would use under optimal conditions.",
    et0HighDemand: "High demand - increase irrigation",
    et0ModerateDemand: "Moderate - normal irrigation",
    et0LowDemand: "Low demand - reduce irrigation",
    vapourPressureDeficit: "Vapour Pressure Deficit",
    vpdDescription: "High VPD can increase crop water stress.",
    vpdSevereStress: "Severe stress",
    vpdModerateStress: "Moderate stress",
    vpdGoodConditions: "Good conditions",
    solarRadiationToday: "Solar Radiation Today",
    solarRadiationDescription:
      "Higher radiation drives evapotranspiration and photosynthesis.",
    solarRadiationHigh: "High radiation day",
    solarRadiationNormal: "Normal radiation",
    advisorySprayingTitle: "Pesticide / Herbicide Spraying",
    advisoryIrrigationTitle: "Irrigation Recommended",
    advisoryFungalRiskTitle: "Fungal Disease Risk",
    advisoryFieldMachineryTitle: "Field Machinery Work",
    advisoryHarvestTitle: "Harvest Conditions",
    advisoryUvRiskTitle: "UV Exposure Risk",
    advisoryWindDriftRisk: "Wind {speed} km/h - drift risk",
    advisoryRainWashOffRisk: "Active rain - wash-off risk",
    advisoryHeavyCloudPoorDrying: "Heavy cloud - poor drying",
    advisoryAllConditionsMet: "All conditions met",
    advisoryEt0Low: "ET0 low ({et0} mm)",
    advisorySoilMoistureSufficient: "Soil moisture sufficient",
    advisoryEt0MoistureLow: "ET0 = {et0} mm, moisture low",
    advisoryHumidityMonitorBlast: "Humidity {humidity}% - monitor for blast",
    advisoryHumidityLowRisk: "Humidity {humidity}% - low risk",
    advisoryRainSoilWaterlogged: "Rain present - soil waterlogged",
    advisorySoilTooWetMachinery: "Soil too wet for machinery",
    advisoryConditionsSuitable: "Conditions suitable",
    advisoryRainAvoidHarvest: "Rain - avoid harvest",
    advisoryHighHumidityGrainMoistureRisk:
      "High humidity - grain moisture risk",
    advisoryGoodHarvestWindow: "Good harvest window",
    advisoryUvVeryHigh: "UV {uv} - very high, use protection",
    advisoryUvWearProtection: "UV {uv} - wear protective gear",
    advisoryUvSafe: "UV {uv} - safe",
    advisoryStatusMonitor: "Monitor",
    advisoryStatusGo: "Go",
    advisoryStatusHold: "Hold",
    weatherRainShort: "Rain",
  },

  si: {
    // ── Nav ──
    dashboard: "උපකරණ පුවරුව",
    fieldData: "කෙත් දත්ත",
    map: "සිතියම",
    weather: "කාලගුණය",
    alerts: "අනතුරු ඇඟවීම්",
    report: "වාර්තාව",
    help: "උදව්",
    searchPlaceholder: "සොයන්න...",
    noResults: "ප්‍රතිඵල නොමැත",

    // ── Navigation Button Tutorials (FLAT KEYS) ──
    dashboardTutTitle: "ඔබගේ සියලු ක්ෂේත්‍ර බලන්න",
    dashboardTutAction: "බෝග සෞඛ්‍ය, අස්වැන්න, තර්ජන පරීක්ෂා කරන්න",
    dashboardTutOutcome: "එකම ස්ථානයේ සියලු ක්ෂේත්‍ර තොරතුරු",
    
    fieldDataTutTitle: "ඔබේ ක්ෂේත්‍ර වාර්තා",
    fieldDataTutAction: "ක්ෂේත්‍ර සංඛ්‍යා සහ දත්ත පරීක්ෂා කරන්න",
    fieldDataTutOutcome: "සියලු ක්ෂේත්‍ර විස්තර සහ ඉතිහාසය බලන්න",
    
    mapTutTitle: "චන්ද්‍රිකා ක්ෂේත්‍ර දර්ශනය",
    mapTutAction: "ක්ෂේත්‍ර පින්තූර සහ ස්ථර බලන්න",
    mapTutOutcome: "සිතියමේ සෞඛ්‍ය බලන්න",
    
    weatherTutTitle: "කාලගුණ අනාවැකිය පරීක්ෂා කරන්න",
    weatherTutAction: "උෂ්ණත්වය, වර්ෂා සහ පස බලන්න",
    weatherTutOutcome: "කාලගුණය මත පදනම්ව ගොවිතැන සැලසුම් කරන්න",
    
    alertsTutTitle: "පළිබෝධ හා රෝග අනතුරු ඇඟවීම් ලබා ගන්න",
    alertsTutAction: "බෝගවලට ඇති සක්‍රිය තර්ජන බලන්න",
    alertsTutOutcome: "ඔබේ බෝගවලට තර්ජන ගැන දැන ගන්න",
    
    reportTutTitle: "අස්වැන්න කාර්ය සාධනය විශ්ලේෂණය කරන්න",
    reportTutAction: "දිස්ත්‍රික් සහ අස්වැන්න සංසන්දනය කරන්න",
    reportTutOutcome: "අස්වැන්න ප්‍රතිඵල තේරුම් ගන්න",
    
    helpTutTitle: "සහාය සහ ආධාර ලබා ගන්න",
    helpTutAction: "පිළිතුරු සහ FAQ සොයන්න",
    helpTutOutcome: "ඔබට අවශ්‍ය විට සහාය ලබා ගන්න",
    
    chatbotTutTitle: "ක්ෂණික AI උපදෙස් ලබා ගන්න",
    chatbotTutAction: "චැට් සහායකය විවෘත කිරීමට ක්ලික් කරන්න",
    chatbotTutOutcome: "ප්‍රශ්න අසන්න සහ ක්ෂණික පිළිතුරු ලබා ගන්න",
    
    // ── Header Action Button Tutorials (FLAT KEYS) ──
    searchHeaderTitle: "පිටු ඉක්මනින් සොයන්න",
    searchHeaderAction: "පිටුවේ හෝ දිස්ත්‍රික්කයේ නාමය ටයිප් කරන්න",
    searchHeaderOutcome: "ඕනෑම පිටුවට ක්ෂණිකව පනින්න",
    
    languageTitle: "භාෂාව මාරු කරන්න",
    languageAction: "ඉංග්‍රීසි, සිංහල හෝ දෙමළ තෝරා ගැනීමට ක්ලික් කරන්න",
    languageOutcome: "යෙදුම ඔබේ භාෂාවෙන් පෙන්වයි",
    
    themeTitle: "දර්ශන මාදිලිය වෙනස් කරන්න",
    themeAction: "සඳ/සූර්ය අයිකනය ක්ලික් කරන්න",
    themeOutcome: "අඳුරු හෝ ආලෝක මාදිලිය අතර මාරු කරන්න",
    
    notificationsTitle: "පණිවිඩ පරීක්ෂා කරන්න",
    notificationsAction: "අනතුරු ඇඟවීම් සහ යාවත්කාලීන බලන්න",
    notificationsOutcome: "වැදගත් දැනුම්දීම් පිළිබඳ යාවත්කාලීනව සිටින්න",
    
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
        title: "වාර්තාව නිර්යාත කරන්න",
        action: "'PDF බාගන්න' ක්ලික් කර කෙත් විශ්ලේෂණ වාර්තාව ලබා ගන්න",
        outcome: "කෙත් දත්ත සහ විශ්ලේෂණ සමඟ විස්තරාත්මක PDF ලේඛනයක් සාදනු ලැබේ",
      },
    },

    // ── Dashboard ──
    welcomeTitle: "RiceVision වෙත සාදරයෙන් පිළිගනිමු",
    welcomeSubtitle: "බුද්ධිමත් ගොවිතැන සඳහා අවබෝධය",
    systemSynced: "පද්ධතිය සමමුහුර්ත කර ඇත",
    cropHealthDist: "බෝග සෞඛ්‍ය බෙදාහැරීම",
    analysing: "විශ්ලේෂණය කරමින්...",
    optimal: "ශ්‍රේෂ්ඨ",
    mildStress: "මධ්‍යම ආතතිය",
    severeStress: "දැඩි ආතතිය",
    outputProjection: "නිෂ්පාදන අනාවැකිය",
    metricTons: "මෙට්‍රික් ටොන් (ඇ.)",
    highPerformance: "ඉහළ කාර්ය සාධන ප්‍රදේශ",
    supplyStability: "සැපයුම් ස්ථාවරත්වය",
    expectedShortfall: "අපේක්ෂිත හිඟය (MT)",
    nationalDemand: "ජාතික ඉල්ලුම සපුරාලීම",
    referenceThreshold: "ආශ්‍රිතය: MT 3.0M සීමාව",
    diseaseOutbreak: "රෝග හා ව්‍යසන ආගමනය",
    checkingFields: "කෙත් පරීක්ෂා කරමින්...",
    alertsDetected: "ඇඟවීම් හඳුනාගෙන ඇත",
    viewDetails: "විස්තර බලන්න",
    showLess: "අඩු කරන්න",
    showAll: "සියල්ල බලන්න",
    growthAnalysis: "වර්ධන විශ්ලේෂණය",
    cropStageDistribution: "බෝග අදියර බෙදාහැරීම",
    totalFieldsTracked: "අධීක්ෂණය වන මුළු කෙත් ගණන",
    loadingStageData: "බෝග අදියර දත්ත පූරණය කරමින්...",
    districtOverview: "දිස්ත්‍රික් සාරාංශය",
    districtPestHealthStatus: "දිස්ත්‍රික් පළිබෝධ හා සෞඛ්‍ය තත්ත්වය",
    districtHealthMap: "දිස්ත්‍රික් සෞඛ්‍ය සිතියම",

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
    viewInMap: "සිතියමේ බලන්න",

    // ── Help ──
    helpSupport: "උදව් සහ සහාය",
    quickAssistance: "ඉක්මන් සහාය",
    quickAssistanceDesc: "අත්‍යවශ්‍ය ගැටලු සඳහා ඉක්මන් සහාය ලබා ගන්න.",
    dialConcierge: "ඇමතුම ගන්න",
    askTeam: "කණ්ඩායමෙන් අසන්න",
    askTeamDesc: "හදිසි නොවන ප්‍රශ්න හෝ ප්‍රතිචාර අපට යවන්න.",
    transmitEmail: "ඊමේල් යවන්න",
    feedbackLoop: "ප්‍රතිචාර පෝරමය",
    fullOperatorName: "සම්පූර්ණ නාමය",
    assignedPosition: "නිශ්චිත තනතුර",
    province: "පළාත",
    district: "දිස්ත්‍රික්කය",
    anomalyType: "ගැටලු වර්ගය",
    selectSeverity: "බරපතල බව තෝරන්න",
    detailedMessage: "විස්තරාත්මක පණිවිඩය",
    describeIssue: "ගැටලුව සවිස්තරාත්මකව විස්තර කරන්න...",
    transmitting: "යවමින්...",
    submitReport: "වාර්තාව ඉදිරිපත් කරන්න",
    quickHelp: "ඉක්මන් උදව්",
    decryptingFaqs: "නිතර අසන ප්‍රශ්න පූරණය කරමින්...",

    // ── Field Data ──
    fieldIntelligence: "කෙත් බුද්ධිය",
    liveStream: "සජීව දත්ත ප්‍රවාහය",
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
    tabHourly: "පැයෙන් පැය",
    tab14Day: "දින 14",
    tabSoil: "පස",
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
      "RiceVision තුළ හොඳ අත්දැකීමක් සඳහා ඔබේ පැතිකඩ තොරතුරු යාවත්කාලීනව තබා ගන්න.",
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
    updateProfile: "පැතිකඩ යාවත්කාලීන කරන්න",

    // ── Notifications ──
    notifications: "දැනුම්දීම්",
    noNotifications: "දැනුම්දීම් නොමැත",

    // ── Sign In ──
    welcomeBack: "ආයුබෝවන්",
    signInDetails: "ඔබේ ගිණුම ප්‍රවේශ වීමට විස්තර ඇතුළත් කරන්න.",
    emailAddress: "ඊමේල් ලිපිනය",
    password: "මුරපදය",
    forgotPassword: "මුරපදය අමතකද?",
    keepLoggedIn: "ලොගින් වී සිටින්න",
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
    fieldMap: "කෙත් සිතියම",
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
      "තහවුරු කිරීමේ ඊමේල් එකක් යවා ඇත. ගෙවීම සම්පූර්ණ කිරීමට පෙර ඊමේල් තහවුරු කරන්න — ඔබට දැන් සිතියම පෙරදසුන් කළ හැකිය.",
    registerPaddyTitle: "ඔබේ ගොළු කෙත ලියාපදිංචි කරන්න",
    registerPaddySubtitle:
      "ගොළු කෙත් සීමාව ඇඳීමෙන් චන්ද්‍රිකා-ශක්තිය සෞඛ්‍ය නිරීක්ෂණය, රෝග ඇඟවීම්, අස්වැන්න අනාවැකි සහ ව්‍යසන වාර්තා ලබා ගන්න.",
    drawFreely: "නිදහසේ ඇඳීම",
    drawFreelyDesc:
      "සජීව චන්ද්‍රිකා සිතියම මත ඔබේ ගොළු කෙත් සීමාව බහුකෝණය හෝ ආයාතය මෙවලමෙන් ඇඳන්න.",
    satelliteInsightsTitle: "චන්ද්‍රිකා තොරතුරු",
    satelliteInsightsDesc:
      "Sentinel රූපවලින් යාවත්කාලීන NDVI, EVI, VV/VH SAR අධ-ස්ථරීකරණ සහ සෞඛ්‍ය වර්ගීකරණ ලැබේ.",
    pricingCardTitle: "රු. 1,000 / acre",
    pricingCardDesc:
      "සරල ස්ථාවර මිල ගනන් — ඔබ ලියාපදිංචි කළ ප්‍රදේශය පමණක් ගෙවන්න. වාර්ෂිකව.",
    getStartedBtn: "ආරම්භ කරන්න — කෙත ඇඳීම",
    skipForNow: "දැනට අත්හරින්න — පසුව පැතිකඩෙන් සකසන්න →",
    drawYourPaddyField: "ඔබේ ගොළු කෙත ඇඳීම",
    drawYourPaddyDesc:
      "ගොළු කලාප සීමා පූරණය කිරීමට දිස්ත්‍රික්කය තෝරන්න, ඉන්පසු ඔබේ කෙත ඇඳීමට ඇඳීමේ මෙවලම් භාවිත කරන්න.",
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
      "ගෙවීම් ද්වාරය ඉක්මනින් ලැබේ. ඔබේ ස්ථානය රක්ෂා කිරීමට දැන් කෙත සුරකින්න.",
    securedSSL:
      "SSL සහිත ආරක්ෂිතව · PayHere විසින් ධාවනය · ඔබේ කාඩ් දත්ත ගබඩා නොවේ",
    backToMapBtn: "← සිතියමට ආපසු",
    savingField: "සුරකිමින්...",
    completeRegistrationBtn: "ලියාපදිංචිය සම්පූර්ණ කරන්න",

    // ── My Field Tab ──
    fieldRegistry: "කෙත් ලේඛනාගාරය",
    fieldRegistryExisting:
      "ඔබේ ලියාපදිංචි ගොළු කෙත. සීමාව යාවත්කාලීන කිරීමට සංස්කරණය කරන්න හෝ ප්‍රතිස්ථාපනය සඳහා නව බහුකෝණයක් ඇඳන්න.",
    fieldRegistryNew:
      "ඔබ තවම ගොළු කෙතක් ලියාපදිංචි කර නැත. පහත ඔබේ කෙත් සීමාව ඇඳීම කරන්න.",
    editBtn: "සංස්කරණය",
    removeBtn: "ඉවත් කරන්න",
    loadingFieldData: "කෙත් දත්ත පූරණය",
    fieldNameStat: "කෙත් නම",
    areaStat: "ප්‍රදේශය",
    annualFeeStat: "වාර්ෂික ගාස්තු",
    editModeInfo:
      "නව බහුකෝණයක් ඇඳීමෙන් ඔබේ පවතින සීමාව ප්‍රතිස්ථාපනය කරන්න. ඉරි ගසා ඇති නිල් සීමාව ඔබේ වත්මන් කෙත පෙන්වයි.",
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
    uvIndexMax: "උපරිම UV දර්ශකය",
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

    // ── Cross-Page Missing Keys ──
    districtStat: "දිස්ත්‍රික්කය",
    hourlyForecast: "පැයෙන් පැය අනාවැකිය",
    soilAgronomic: "පස සහ කෘෂි දත්ත",
    historyData: "ඉතිහාස දත්ත",
    confirmEmailLoginBeforeSave:
      "ඔබේ කෙත සුරැකීමට පෙර ඔබේ ඊමේල් තහවුරු කර ලොගින් වන්න.",
    saveFieldFailedPrefix: "කෙත සුරැකීම අසාර්ථකයි",
    fieldMonitoringTitle: "RiceVision කෙත් නිරීක්ෂණය",
    sriLanka: "ශ්‍රී ලංකාව",
    payNow: "ගෙවන්න",
    perYear: "වසරකට",
    saveFailedPrefix: "සුරැකීම අසාර්ථකයි",
    fieldBoundarySaved: "කෙත් සීමාව සාර්ථකව සුරැකීය.",
    confirmRemoveFieldRegistration:
      "ඔබේ කෙත් ලියාපදිංචිය ඉවත් කිරීමට තහවුරුද? මෙය ආපසු හැරවිය නොහැක.",
    deleteFailedPrefix: "මැකීම අසාර්ථකයි",
    fieldRegistrationRemoved: "කෙත් ලියාපදිංචිය ඉවත් කර ඇත.",
    quickPhoneSupportTitle: "ඉක්මන් දුරකථන සහාය",
    quickPhoneSupportDesc:
      "උපකරණ පුවරුව, කෙත් සැකසුම හෝ වාර්තා ගැටලු සඳහා අප අමතන්න.",
    emailSupportTitle: "ඊමේල් සහාය",
    emailSupportDesc:
      "ගැටලුව විස්තර සමඟ ඊමේල් යවන්න. අපගේ කණ්ඩායම විසඳුමක් සමඟ ප්‍රතිචාර දක්වයි.",
    call: "අමතන්න",
    email: "ඊමේල්",
    submitComplaintTitle: "පැමිණිල්ලක් ඉදිරිපත් කරන්න",
    fullNameExample: "නිදසුන: කසුන් පෙරේරා",
    assignedPositionExample: "නිදසුන: ක්ෂේත්‍ර පරීක්ෂක",
    selectIssueType: "ගැටලු වර්ගය තෝරන්න",
    issueTechnical: "තාක්ෂණික ගැටලුව",
    issueDataMismatch: "දත්ත නොගැළපීම",
    issueAccountAccess: "ගිණුම් හෝ ප්‍රවේශ ගැටලුව",
    issueOther: "වෙනත්",
    complaintValidationRequired: "සම්පූර්ණ නම සහ පැමිණිලි පණිවිඩය අනිවාර්යයි.",
    complaintSubmittedSuccess: "පැමිණිල්ල සාර්ථකව යවන ලදී.",
    complaintSubmitFailed: "පැමිණිල්ල යැවීම අසාර්ථකයි.",
    resolveAlertTitle: "අනතුරු ඇඟවීම විසඳන්න",
    resolutionNoteOptional: "විසඳුම් සටහන (විකල්ප)",
    resolutionNotePlaceholder: "මෙය කොහොම විසඳා දැයි ලියන්න...",
    confirmBtn: "තහවුරු කරන්න",
    alertsRealtimeSubtitle: "සජීව කෙත් සෞඛ්‍ය තොරතුරු",
    noPastThreats: "පසුගිය තර්ජන හඳුනාගැනීම් නොමැත",
    noteLabel: "සටහන",
    alertsTutorialTabsTitle: "අනතුරු ටැබ්",
    alertsTutorialTabsAction: "විවිධ අනතුරු වර්ග බැලීමට ටැබ් මාරු කරන්න.",
    alertsTutorialTabsOutcome: "ව්‍යසන, පළිබෝධ හෝ පසුගිය ඇඟවීම් ඔබට පෙන්වයි.",
    alertsTutorialSearchTitle: "අනතුරු සොයන්න",
    alertsTutorialSearchAction: "නිශ්චිත ඇඟවීම් සොයා සෙවුම් කොටුව භාවිත කරන්න.",
    alertsTutorialSearchOutcome: "ගැළපෙන ඇඟවීම් පමණක් ලැයිස්තුගත වේ.",
    alertsTutorialResolveTitle: "අනතුරු විසඳන්න",
    alertsTutorialResolveAction: "සක්‍රිය අනතුරක් මත විසඳන්න බොත්තම ඔබන්න.",
    alertsTutorialResolveOutcome: "විසඳුම් සටහන එක් කිරීමට කවුළුවක් විවෘත වේ.",
    alertsTutorialIgnoreTitle: "අනතුර නොසලකන්න",
    alertsTutorialIgnoreAction: "විසඳීමකින් තොරව ඉවත් කිරීමට නොසලකන්න ඔබන්න.",
    alertsTutorialIgnoreOutcome: "එය පසුගිය ඇඟවීම් ටැබ් එකට ගමන් කරයි.",
    alertsTutorialMapTitle: "සිතියමේ බලන්න",
    alertsTutorialMapAction: "ස්ථානය බැලීමට සිතියමේ බලන්න ඔබන්න.",
    alertsTutorialMapOutcome: "අදාළ ප්‍රදේශය පෙන්වමින් සිතියම විවෘත වේ.",
    fieldDataOverviewTitle: "කෙත් දත්ත සාරාංශය",
    fieldDataOverviewAction: "මෙම පිටුව ඔබේ සියලු කෙත් සංඛ්‍යාලේඛන සාරාංශයක් පෙන්වයි.",
    fieldDataOverviewOutcome: "මුළු කෙත්, සෞඛ්‍ය සම්පන්න, ආතති සහ අනතුරු අගයන් පෙන්වයි.",
    fieldDataSummaryTitle: "සාරාංශ සංඛ්‍යාලේඛන",
    fieldDataSummaryAction: "ක්ෂණික සෞඛ්‍ය දත්ත සඳහා කාඩ්පත් බලන්න.",
    fieldDataSummaryOutcome: "කොළ=සෞඛ්‍ය, කහ=ආතති, රතු=ගැටලු.",
    fieldDataDistrictTableTitle: "දිස්ත්‍රික් සංසන්දන වගුව",
    fieldDataDistrictTableAction: "දිස්ත්‍රික් අනුව දත්ත බැලීමට වගුව සෙට් කරන්න.",
    fieldDataDistrictTableOutcome: "සෞඛ්‍යය, අස්වැන්න සහ ආතතිය දිස්ත්‍රික් අනුව සංසන්දනය කරන්න.",
    fieldDataViewMapTitle: "සිතියමේ බලන්න",
    fieldDataViewMapAction: "දිස්ත්‍රික්කයක් සඳහා සිතියම විවෘත කිරීමට බොත්තම භාවිත කරන්න.",
    fieldDataViewMapOutcome: "තෝරාගත් දිස්ත්‍රික්කය සමඟ සිතියම විවෘත වේ.",
    actionLabel: "ක්‍රියාව",
    viewReportBtn: "වාර්තාව බලන්න",
    weatherTutorialOverviewAction:
      "උෂ්ණත්වය, වැසි සහ සුළං ඇතුළු වත්මන් කාලගුණ තත්ත්ව බලන්න.",
    weatherTutorialOverviewOutcome:
      "ඔබේ ස්ථානයට අදාල සජීව කාලගුණ මිනුම් පෙන්වයි.",
    weatherTutorialHourlyAction:
      "පැය 24 ක ප්‍රගතිය බැලීමට පැය අනාවැකි ටැබ් විවෘත කරන්න.",
    weatherTutorialHourlyOutcome:
      "ඊළඟ පැය 24 සඳහා කාලගුණ වෙනස්කම් පෙන්වයි.",
    weatherTutorialSoilAction:
      "පස සහ කෘෂි තත්ත්ව බැලීමට පස ටැබ් විවෘත කරන්න.",
    weatherTutorialSoilOutcome:
      "පස් උෂ්ණත්වය, ආර්ද්‍රතාව, VPD සහ ET දත්ත පෙන්වයි.",
    weatherTutorialForecastAction:
      "දිගු දින 14 පෙරදසුන බැලීමට අනාවැකි ටැබ් විවෘත කරන්න.",
    weatherTutorialForecastOutcome:
      "කෙත් ක්‍රියා සැලසුම් කිරීමට දෛනික අනාවැකි ලැබේ.",
    weatherTutorialHistoryAction:
      "පසුගිය කාලගුණ වාර්තා බැලීමට ඉතිහාස ටැබ් විවෘත කරන්න.",
    weatherTutorialHistoryOutcome:
      "සෘතුමය රටා සංසන්දනයට අතීත දත්ත පෙන්වයි.",
    dsDivision: "ප්‍රාදේශීය ලේකම් කොට්ඨාසය",
    colombo: "කොළඹ",
    autoDetected: "ස්වයංක්‍රීයව හඳුනාගත්",
    daytime: "දවාල",
    night: "රාත්‍රිය",
    hourlyDetailTable: "පැය විස්තර වගුව",
    soilTemperatureProfiles: "පස් උෂ්ණත්ව පැතිකඩ",
    soilMoistureContent: "පස් ආර්ද්‍රතා අන්තර්ගතය",
    agronomicIndicators: "කෘෂි දර්ශක",
    sprayFieldAdvisory: "ඉසිවීම සහ කෙත් වැඩ උපදෙස්",
    outlook14Day: "දින 14 පෙරදසුන",
    weeklyAgroForecastDetail: "සතිපතා කෘෂි අනාවැකි විස්තර",
    past7DaysFieldHistory: "පසුගිය දින 7 කෙත් ඉතිහාසය",
    historicalDetailTable: "ඉතිහාස විස්තර වගුව",
    reportTutorialOverviewAction:
      "චන්ද්‍රිකා පදනම් අස්වැන්න අනාවැකි සහ විශ්ලේෂණ බලන්න.",
    reportTutorialOverviewOutcome:
      "සංසන්දන දර්ශක සහ නිර්යාත විකල්ප සමඟ විස්තරාත්මක වාර්තා පෙන්වයි.",
    reportTutorialModeTitle: "තනි හෝ සංසන්දනය",
    reportTutorialModeAction:
      "තනි සහ සංසන්දන මාදිලි අතර මාරු කරන්න.",
    reportTutorialModeOutcome:
      "තනි දිස්ත්‍රික්කයක් හෝ දෙකක් සංසන්දනය කළ හැක.",
    reportTutorialDistrictTitle: "දිස්ත්‍රික් තේරීම",
    reportTutorialDistrictAction: "අස්වැන්න දත්ත බැලීමට දිස්ත්‍රික්කය තෝරන්න.",
    reportTutorialDistrictOutcome:
      "තෝරාගත් දිස්ත්‍රික්කයට අදාල අනාවැකි දත්ත පූරණය වේ.",
    reportTutorialYieldTitle: "අස්වැන්න අනාවැකිය",
    reportTutorialYieldAction: "අනාවැකි අස්වැන්න සහ ඉතිහාස අගය සංසන්දනය බලන්න.",
    reportTutorialYieldOutcome: "අපේක්ෂිත අස්වැන්න සහ මූලික අගය පෙන්වයි.",
    reportTutorialMetricsTitle: "දර්ශක සහ නිර්යාත",
    reportTutorialMetricsAction:
      "පළිබෝධ සහ අවදානම් දර්ශක බලලා PDF ලෙස නිර්යාත කරන්න.",
    reportTutorialMetricsOutcome: "සම්පූර්ණ විශ්ලේෂණ වාර්තාව බාගත කළ හැක.",
    dataUnavailable: "දත්ත නොමැත",
    fetchingSatelliteData: "චන්ද්‍රිකා දත්ත ලබාගනිමින්...",
    viewLabel: "දර්ශනය",
    primaryLabel: "ප්‍රධාන",
    comparisonLabel: "සංසන්දන",
    predictedAverage: "අනාවැකි සාමාන්‍යය",
    totalYieldLabel: "මුළු අස්වැන්න",
    historicalBaseline: "ඉතිහාස මූලික අගය",
    pestCount: "පළිබෝධ ගණන",
    riskFactor: "අවදානම් සාධකය",
    exportComparisonReport: "සංසන්දන වාර්තාව නිර්යාත කරන්න",
    loginFailed: "ලොගින් අසාර්ථකයි",
    pleaseEnterEmail: "කරුණාකර ඊමේල් ලිපිනය ඇතුළත් කරන්න.",
    failedToSendResetEmail: "නැවත සැකසුම් ඊමේල් යැවීමට අසමත් විය.",
    networkErrorTryAgain: "ජාල දෝෂයක්. කරුණාකර නැවත උත්සාහ කරන්න.",
    validEmailAddressError: "වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.",
    signupFailed: "ලියාපදිංචිය අසාර්ථකයි",
    createAccountSubtitle: "ආරම්භ කිරීමට ඔබේ RiceVision ගිණුම සාදන්න.",
    sidebarTutorialNavTitle: "පැති තීරු නාවිගේෂන්",
    sidebarTutorialNavAction:
      "ප්‍රධාන පිටු අතර ගමන් කිරීමට වම් පැති තීරුව භාවිත කරන්න.",
    sidebarTutorialNavOutcome:
      "උපකරණ පුවරුව, සිතියම, ඇඟවීම්, කාලගුණය සහ වාර්තා මෙතැනින් ලැබේ.",
    sidebarTutorialTopTitle: "ඉහළ නාවිගේෂන් සබැඳි",
    sidebarTutorialTopAction:
      "ගමන් කිරීමට ඩෑෂ්බෝඩ්, සිතියම හෝ වෙනත් මෙනු අයිතමයක් තෝරන්න.",
    sidebarTutorialTopOutcome:
      "හයිලයිට් වී ඇති අයිතමය වත්මන් පිටුව පෙන්වයි.",
    sidebarTutorialBottomTitle: "පහළ විකල්ප",
    sidebarTutorialBottomAction:
      "පහළ කොටසින් පැතිකඩ, උදව් හෝ ලොග්අවුට් විකල්ප භාවිත කරන්න.",
    sidebarTutorialBottomOutcome:
      "ඕනෑම පිටුවකින් ගිණුම් කළමනාකරණයට ඉක්මන් ප්‍රවේශය ලැබේ.",
    systemVersionTag: "පද්ධති අනුවාදය Alpha-1.0.4 - RiceVision Core",
    dashboardTutorialWelcome:
      "සාදරයෙන් පිළිගනිමු. මෙය ඔබගේ කෙත් පාලන මධ්‍යස්ථානයයි.",
    dashboardTutorialSync:
      "දත්ත අලුත් බව තහවුරු කිරීමට මෙම ලකුණ පරීක්ෂා කරන්න.",
    dashboardTutorialHealth:
      "බෝග සෞඛ්‍ය පයි චාට් එකෙන් බලන්න. කොළ වර්ණය හොඳ තත්ත්වයයි.",
    dashboardTutorialYield:
      "අපේක්ෂිත මුළු අස්වැන්න මෙට්‍රික් ටොන්වලින් මෙහි බලන්න.",
    dashboardTutorialSupply:
      "අපේක්ෂිත හිඟය සහ ජාතික ඉල්ලුම් අවදානම් ඉක්මනින් නිරීක්ෂණය කරන්න.",
    dashboardTutorialThreats:
      "සක්‍රිය රෝග පැතිරීම් සහ පළිබෝධ අවදානම් බලන්න.",
    dashboardTutorialThreatDetails:
      "මෙම තර්ජනය සඳහා විස්තරාත්මක නිර්දේශ විවෘත කරන්න.",
    dashboardTutorialThreatToggle:
      "තර්ජන ලැයිස්තුව විහිදුවීමට හෝ සඟවීමට මෙය භාවිත කරන්න.",
    dashboardTutorialStageChart:
      "බෝග වර්ධන අදියරවල ප්‍රතිශත මෙතැනින් බලන්න.",
    dashboardTutorialDistrictTable:
      "සියලු දිස්ත්‍රික් සෞඛ්‍ය දත්ත එකම වගුවක සංසන්දනය කරන්න.",
    dashboardTutorialDistrictToggle:
      "සම්පූර්ණ දිස්ත්‍රික් ලැයිස්තුව විහිදුවීමට මෙම බොත්තම භාවිත කරන්න.",
    fieldsLabel: "කෙත්",
    countLabel: "ගණන",
    statusSafe: "ආරක්ෂිත",
    statusModerate: "මධ්‍යම",
    statusCritical: "ගැඹුරු අවදානම්",
    statusStable: "ස්ථාවර",
    statusWarning: "අවවාදය",
    statusHighRisk: "ඉහළ අවදානම",
    wmoClearSky: "පැහැදිලි අහස",
    wmoPartlyCloudy: "අඩක් වලාකුළු",
    wmoOvercast: "සම්පූර්ණ වලාකුළු",
    wmoFoggyHaze: "මීදුම / මළුව",
    wmoDrizzle: "සුළු වැසි",
    wmoRain: "වැසි",
    wmoSnowIce: "හිම / අයිස්",
    wmoRainShowers: "වැසි වැටීම්",
    wmoHeavySnowShowers: "දැඩි හිම වැටීම්",
    wmoThunderstorm: "ගිගුරුම් වැසි",
    wmoUnknown: "නොදන්නා",
    weatherAdvisoryFeels: "දැනෙන උෂ්ණත්වය {temp}°C",
    weatherAdvisoryFungalRisk: "දිලීර අවදානම",
    weatherAdvisoryNormal: "සාමාන්‍ය",
    weatherAdvisoryMoistureThreshold: "ආර්ද්‍රතා සංතෘප්ති සීමාව",
    weatherAdvisoryPoorSunlight: "අඩු හිරු එළිය",
    weatherAdvisoryGoodForCrops: "බෝගයට හොඳයි",
    weatherAdvisoryMeanSeaLevel: "මධ්‍යම මුහුදු මට්ටම",
    weatherAdvisoryAvoidSpraying: "ඉසීමෙන් වළකින්න",
    weatherAdvisorySafeForSpraying: "ඉසීමට සුදුසුයි",
    weatherAdvisoryHighGusts: "දැඩි සුළං ගැස්ම",
    weatherAdvisorySafe: "ආරක්ෂිත",
    weatherAdvisoryCurrentHour: "දැනට පැය",
    weatherAdvisoryUVVeryHigh: "UV ඉතා ඉහළ",
    weatherAdvisoryUVModerate: "මධ්‍යම",
    weatherAdvisoryUVLow: "අඩු",
    weatherAdvisoryPoorVisibility: "අඩු දෘශ්‍යතාව",
    weatherAdvisoryGood: "හොඳ",
    weatherAdvisoryHoursWithRain: "වැසි ඇති පැය",
    weatherAdvisoryTodayTotal: "අද එකතුව",
    weatherAdvisoryIrrigationGuide: "ජලසෙචන මාර්ගෝපදේශය",
    weatherAdvisoryCropStress: "බෝග ආතතිය",
    weatherAdvisoryTotalRainToday: "අද මුළු වැසි",
    weatherAdvisoryMaxChanceToday: "අද උපරිම සම්භාවිතාව",
    weatherTableColTime: "වේලාව",
    weatherTableColCondition: "තත්ත්වය",
    weatherTableColTemp: "උෂ්ණත්වය",
    weatherTableColFeels: "දැනෙන",
    weatherTableColHumidity: "ආර්ද්‍රතාව",
    weatherTableColRainPercent: "වැසි%",
    weatherTableColRainMm: "වැසි mm",
    weatherTableColWind: "සුළං",
    weatherTableColUV: "UV",
    weatherTableColET0: "ET0",
    weatherTableColVisibility: "දෘශ්‍යතාව",
    weatherTableColDate: "දිනය",
    weatherTableColMaxTemp: "උපරිම C",
    weatherTableColMinTemp: "අවම C",
    weatherTableColWindMax: "සුළං උපරිම",
    weatherTableColUvMax: "UV උපරිම",
    weatherTableColRadiation: "විකිරණ",
    weatherTableColSunrise: "ඉර උදාව",
    weatherTableColSunset: "ඉර බැසීම",
    weatherTableColConditions: "තත්ත්වයන්",
    weatherTableColRainSum: "වැසි එකතුව",
    weatherTableColRainHours: "වැසි පැය",
    soilTempSurfaceLabel: "පෘෂ්ඨය (0 cm)",
    soilTempSurfaceDesc: "ඉහළ ස්ථරය - බීජ මතුකිරීමේ කලාපය",
    soilTempShallowLabel: "අඩු ගැඹුර (6 cm)",
    soilTempShallowDesc: "බීජලද පැළ සඳහා මුල් කලාපය",
    soilTempMediumLabel: "මධ්‍යම (18 cm)",
    soilTempMediumDesc: "ක්‍රියාකාරී මුල් කලාපය - ගොයම් වර්ධනය",
    soilAdvisoryTooCold: "මතුකිරීමට ඉතා සීතලයි",
    soilAdvisoryHeatStress: "උෂ්ණ ආතති අවදානම",
    soilAdvisoryOptimal: "ගොයම් සඳහා සුදුසු",
    soilMoistureDepth0to1: "0-1 cm",
    soilMoistureDepth0to1Desc: "ඉහළ පස - වාෂ්පීභවනය කලාපය",
    soilMoistureDepth1to3: "1-3 cm",
    soilMoistureDepth1to3Desc: "පැළ මුල් කලාපය",
    soilMoistureDepth3to9: "3-9 cm",
    soilMoistureDepth3to9Desc: "ප්‍රධාන මුල් අවශෝෂණ කලාපය",
    soilMoistureLabel: "පස ආර්ද්‍රතාව",
    soilMoistureLow: "අඩුයි - ජලසෙචනය සලකා බලන්න",
    soilMoistureSaturated: "සංතෘප්ත",
    soilMoistureGood: "හොඳ ආර්ද්‍රතා මට්ටම",
    et0EvapotranspirationToday: "අද ET0 වාෂ්පීකරණ-උද්ගිරණය",
    et0Description:
      "FAO-56 අනුව හොඳ තත්ත්වයේ බෝග භාවිතා කරන ජල ප්‍රමාණය සඳහා සඳහනකි.",
    et0HighDemand: "ඉහළ අවශ්‍යතාව - ජලසෙචනය වැඩි කරන්න",
    et0ModerateDemand: "මධ්‍යම - සාමාන්‍ය ජලසෙචනය",
    et0LowDemand: "අඩු අවශ්‍යතාව - ජලසෙචනය අඩු කරන්න",
    vapourPressureDeficit: "වාෂ්ප පීඩන ඌනතාව",
    vpdDescription: "ඉහළ VPD නිසා බෝග ජල ආතතිය වැඩිවිය හැක.",
    vpdSevereStress: "දැඩි ආතතිය",
    vpdModerateStress: "මධ්‍යම ආතතිය",
    vpdGoodConditions: "හොඳ තත්ත්වය",
    solarRadiationToday: "අද සූර්ය විකිරණය",
    solarRadiationDescription:
      "ඉහළ විකිරණය වාෂ්පීභවනය සහ ප්‍රභාසංස්ලේෂණය වැඩි කරයි.",
    solarRadiationHigh: "ඉහළ විකිරණ දිනය",
    solarRadiationNormal: "සාමාන්‍ය විකිරණය",
    advisorySprayingTitle: "පළිබෝධ නාශක / වල් නාශක ඉසීම",
    advisoryIrrigationTitle: "ජලසෙචනය නිර්දේශිතයි",
    advisoryFungalRiskTitle: "දිලීර රෝග අවදානම",
    advisoryFieldMachineryTitle: "කෙත් යන්ත්‍ර වැඩ",
    advisoryHarvestTitle: "අස්වනු තත්ත්වය",
    advisoryUvRiskTitle: "UV නිරාවරණ අවදානම",
    advisoryWindDriftRisk: "සුළං {speed} km/h - වැළඳී යාමේ අවදානම",
    advisoryRainWashOffRisk: "වැසි පවතී - සෝදා යාමේ අවදානම",
    advisoryHeavyCloudPoorDrying: "දැඩි වලාකුළු - වියළීම අඩු",
    advisoryAllConditionsMet: "සියලු තත්ත්ව සපුරා ඇත",
    advisoryEt0Low: "ET0 අඩුයි ({et0} mm)",
    advisorySoilMoistureSufficient: "පස ආර්ද්‍රතාව ප්‍රමාණවත්",
    advisoryEt0MoistureLow: "ET0 = {et0} mm, ආර්ද්‍රතාව අඩුයි",
    advisoryHumidityMonitorBlast: "ආර්ද්‍රතාව {humidity}% - බ්ලාස්ට් නිරීක්ෂණය කරන්න",
    advisoryHumidityLowRisk: "ආර්ද්‍රතාව {humidity}% - අඩු අවදානම",
    advisoryRainSoilWaterlogged: "වැසි ඇත - පස ජලයෙන් පිරී ඇත",
    advisorySoilTooWetMachinery: "පස යන්ත්‍ර සඳහා ඉතා තෙත්",
    advisoryConditionsSuitable: "තත්ත්ව සුදුසුයි",
    advisoryRainAvoidHarvest: "වැසි - අස්වනු මඟහරින්න",
    advisoryHighHumidityGrainMoistureRisk:
      "ඉහළ ආර්ද්‍රතාව - ධාන්‍ය ආර්ද්‍රතා අවදානම",
    advisoryGoodHarvestWindow: "අස්වනු සඳහා හොඳ කාල කවුළුව",
    advisoryUvVeryHigh: "UV {uv} - ඉතා ඉහළ, ආරක්ෂාව භාවිත කරන්න",
    advisoryUvWearProtection: "UV {uv} - ආරක්ෂිත උපකරණ පැළඳින්න",
    advisoryUvSafe: "UV {uv} - ආරක්ෂිතයි",
    advisoryStatusMonitor: "නිරීක්ෂණය",
    advisoryStatusGo: "යන්න",
    advisoryStatusHold: "නවත්වන්න",
    weatherRainShort: "වැසි",
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
    mapTutAction: "வயல் படங்கள் மற்றும் அடுக்குகளை பார்க்கவும்",
    mapTutOutcome: "வரைபடத்தில் ஆரோக்கியம் பார்க்கவும்",
    
    weatherTutTitle: "வானிலை முன்னறிவிப்பை சரிபார்க்கவும்",
    weatherTutAction: "வெப்பநிலை, மழை, மண் பார்க்கவும்",
    weatherTutOutcome: "வானிலையின் அடிப்படையில் விவசாய திட்டமிடுங்கள்",
    
    alertsTutTitle: "பூச்சி மற்றும் நோய் எச்சரிக்கைகளைப் பெறுங்கள்",
    alertsTutAction: "பயிர்களுக்கான செயலில் அச்சுறுத்தல்கள் பார்க்கவும்",
    alertsTutOutcome: "உங்கள் பயிர்களுக்கான ஆபத்து பற்றி அறிந்து கொள்ளுங்கள்",
    
    reportTutTitle: "மகசூல் செயல்திறனை பகுப்பாய்வு செய்யவும்",
    reportTutAction: "மாவட்டம் மற்றும் மகசூல் ஒப்பிடுங்கள்",
    reportTutOutcome: "மகசூல் முடிவுகளை புரிந்து கொள்ளுங்கள்",
    
    helpTutTitle: "உதவி மற்றும் ஆதரவு பெறுங்கள்",
    helpTutAction: "பதில்கள் மற்றும் FAQ-ஐ கண்டுபிடிக்கவும்",
    helpTutOutcome: "உங்களுக்கு தேவை எனில் உதவி பெறுங்கள்",
    
    chatbotTutTitle: "உடனடி AI ஆலோசனை பெறுங்கள்",
    chatbotTutAction: "அரட்டை உதவியாளரை திறக்க கிளிக் செய்யவும்",
    chatbotTutOutcome: "கேள்விகள் கேட்டு உடனடி பதில்கள் பெறுங்கள்",
    
    // ── Header Action Button Tutorials (FLAT KEYS) ──
    searchHeaderTitle: "பக்கங்களை விரைவாக கண்டுபிடிக்கவும்",
    searchHeaderAction: "பக்கம் அல்லது மாவட்ட பெயர் தட்டச்சு செய்யவும்",
    searchHeaderOutcome: "எந்த பக்கத்திற்கும் உடனடியாக குதிக்கவும்",
    
    languageTitle: "மொழி மாற்றவும்",
    languageAction: "ஆங்கிலம், சிங்களம் அல்லது தமிழை தேர்வு செய்யவும்",
    languageOutcome: "பயன்பாடு உங்கள் மொழியில் தோன்றும்",
    
    themeTitle: "காட்சி முறையை மாற்றவும்",
    themeAction: "சந்திரன்/சூரியன் ஐகனைக் கிளிக் செய்யவும்",
    themeOutcome: "இருள் அல்லது வெளிச்ச முறையை மாற்றவும்",
    
    notificationsTitle: "செய்திகளை சரிபார்க்கவும்",
    notificationsAction: "எச்சரிக்கைகள் மற்றும் புதுப்பிப்புகளைப் பார்க்கவும்",
    notificationsOutcome: "முக்கிய அறிவிப்புகளை உடனுக்குடன் தெரிந்து கொள்ளுங்கள்",
    
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
    welcomeSubtitle: "சிறந்த விவசாயத்திற்கான நுண்ணறிவு",
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
    loadingStageData: "பயிர் கட்ட தரவு ஏற்றப்படுகிறது...",
    districtOverview: "மாவட்ட மேலோட்டம்",
    districtPestHealthStatus: "மாவட்ட பூச்சி மற்றும் ஆரோக்கிய நிலை",
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
    quickAssistanceDesc: "அவசரமான பிரச்சினைகளுக்கு விரைவான உதவி பெறுங்கள்.",
    dialConcierge: "அழைக்கவும்",
    askTeam: "எங்கள் குழுவிடம் கேளுங்கள்",
    askTeamDesc: "அவசர அல்லாத கோரிக்கைகள் அல்லது கருத்துக்களை சமர்ப்பிக்கவும்.",
    transmitEmail: "மின்னஞ்சல் அனுப்பவும்",
    feedbackLoop: "கருத்து படிவம்",
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
    decryptingFaqs: "அடிக்கடி கேட்கப்படும் கேள்விகள் ஏற்றப்படுகிறது...",

    // ── Field Data ──
    fieldIntelligence: "வயல் நுண்ணறிவு",
    liveStream: "நேரடி தரவு ஓடை",
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
      "RiceVision-இல் சிறந்த அனுபவத்திற்காக உங்கள் சுயவிவர தகவலை புதுப்பித்த நிலையில் வைத்திருங்கள்.",
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
    updateProfile: "சுயவிவரத்தை புதுப்பிக்கவும்",

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
      "நெல் மண்டல எல்லைகளை ஏற்ற மாவட்டத்தை தேர்வு செய்து, பின்னர் உங்கள் வயலை வரைய கருவிகளை பயன்படுத்துங்கள்.",
    back: "← பின்",
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
      "புதிய பலகோணத்தை வரைந்து உங்கள் தற்போதைய எல்லையை மாற்றவும். புள்ளியிட்ட நீல கோடு உங்கள் தற்போதைய வயலை காட்டுகிறது.",
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

    // ── Cross-Page Missing Keys ──
    districtStat: "மாவட்டம்",
    hourlyForecast: "மணிநேர முன்னறிவிப்பு",
    soilAgronomic: "மண் மற்றும் விவசாய தரவு",
    historyData: "வரலாற்றுத் தரவு",
    confirmEmailLoginBeforeSave:
      "வயலை சேமிப்பதற்கு முன் உங்கள் மின்னஞ்சலை உறுதிப்படுத்தி உள்நுழையவும்.",
    saveFieldFailedPrefix: "வயல் சேமிப்பு தோல்வி",
    fieldMonitoringTitle: "RiceVision வயல் கண்காணிப்பு",
    sriLanka: "இலங்கை",
    payNow: "செலுத்தவும்",
    perYear: "வருடம்",
    saveFailedPrefix: "சேமித்தல் தோல்வி",
    fieldBoundarySaved: "வயல் எல்லை வெற்றிகரமாக சேமிக்கப்பட்டது.",
    confirmRemoveFieldRegistration:
      "உங்கள் வயல் பதிவை நீக்க விரும்புகிறீர்களா? இதை மீண்டும் மாற்ற முடியாது.",
    deleteFailedPrefix: "நீக்கம் தோல்வி",
    fieldRegistrationRemoved: "வயல் பதிவு நீக்கப்பட்டது.",
    quickPhoneSupportTitle: "விரைவு தொலைபேசி ஆதரவு",
    quickPhoneSupportDesc:
      "டாஷ்போர்டு, வயல் அமைப்பு அல்லது அறிக்கை பிரச்சினைகளுக்கு எங்களை அழைக்கவும்.",
    emailSupportTitle: "மின்னஞ்சல் ஆதரவு",
    emailSupportDesc:
      "உங்கள் பிரச்சினை விவரங்களை மின்னஞ்சலில் அனுப்புங்கள். குழு தீர்வுடன் பதிலளிக்கும்.",
    call: "அழை",
    email: "மின்னஞ்சல்",
    submitComplaintTitle: "புகார் சமர்ப்பிக்கவும்",
    fullNameExample: "எ.கா.: கமல் பெரேரா",
    assignedPositionExample: "எ.கா.: வயல் மேற்பார்வையாளர்",
    selectIssueType: "பிரச்சினை வகையைத் தேர்வு செய்யவும்",
    issueTechnical: "தொழில்நுட்ப பிரச்சினை",
    issueDataMismatch: "தரவு பொருந்தாமை",
    issueAccountAccess: "கணக்கு அல்லது அணுகல் பிரச்சினை",
    issueOther: "மற்றவை",
    complaintValidationRequired: "முழு பெயரும் புகார் செய்தியும் அவசியம்.",
    complaintSubmittedSuccess: "புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.",
    complaintSubmitFailed: "புகார் சமர்ப்பிப்பு தோல்வியுற்றது.",
    resolveAlertTitle: "எச்சரிக்கையை தீர்க்கவும்",
    resolutionNoteOptional: "தீர்வு குறிப்பு (விருப்பம்)",
    resolutionNotePlaceholder: "இது எப்படி தீர்க்கப்பட்டது என்பதை எழுதவும்...",
    confirmBtn: "உறுதிப்படுத்து",
    alertsRealtimeSubtitle: "நேரடி வயல் ஆரோக்கிய நுண்ணறிவு",
    noPastThreats: "முன்னைய அச்சுறுத்தல்கள் இல்லை",
    noteLabel: "குறிப்பு",
    alertsTutorialTabsTitle: "எச்சரிக்கை தாவல்கள்",
    alertsTutorialTabsAction:
      "வேறு எச்சரிக்கை வகைகளைப் பார்க்க தாவல்களை மாற்றவும்.",
    alertsTutorialTabsOutcome:
      "பேரழிவு, பூச்சி அபாயம் அல்லது கடந்த எச்சரிக்கைகள் காட்டப்படும்.",
    alertsTutorialSearchTitle: "எச்சரிக்கைகளைத் தேடு",
    alertsTutorialSearchAction:
      "குறிப்பிட்ட எச்சரிக்கைகளை கண்டுபிடிக்க தேடல் பெட்டியைப் பயன்படுத்தவும்.",
    alertsTutorialSearchOutcome:
      "பொருந்தும் எச்சரிக்கைகள் மட்டும் காட்டப்படும்.",
    alertsTutorialResolveTitle: "எச்சரிக்கையை தீர்க்கவும்",
    alertsTutorialResolveAction:
      "செயலில் உள்ள எச்சரிக்கையில் தீர்க்கவும் பொத்தானை அழுத்தவும்.",
    alertsTutorialResolveOutcome:
      "தீர்வு குறிப்பைச் சேர்க்க ஒரு பெட்டி திறக்கும்.",
    alertsTutorialIgnoreTitle: "எச்சரிக்கையை புறக்கணிக்கவும்",
    alertsTutorialIgnoreAction:
      "தீர்க்காமல் நீக்க புறக்கணிக்கவும் பொத்தானை அழுத்தவும்.",
    alertsTutorialIgnoreOutcome:
      "அது கடந்த எச்சரிக்கைகள் தாவலுக்கு நகரும்.",
    alertsTutorialMapTitle: "வரைபடத்தில் காண்க",
    alertsTutorialMapAction:
      "இடத்தைப் பார்க்க வரைபடத்தில் காண்க பொத்தானை அழுத்தவும்.",
    alertsTutorialMapOutcome:
      "பாதிக்கப்பட்ட பகுதியுடன் வரைபடம் திறக்கும்.",
    fieldDataOverviewTitle: "வயல் தரவு மேலோட்டம்",
    fieldDataOverviewAction:
      "இந்த பக்கம் உங்கள் வயல் புள்ளிவிவரங்களின் சுருக்கத்தை காட்டுகிறது.",
    fieldDataOverviewOutcome:
      "மொத்த வயல்கள், ஆரோக்கியம், அழுத்தம் மற்றும் எச்சரிக்கைகள் காட்டப்படும்.",
    fieldDataSummaryTitle: "சுருக்க புள்ளிவிவரங்கள்",
    fieldDataSummaryAction:
      "விரைவான ஆரோக்கிய அளவுகோல்களுக்கு அட்டைகளைப் பாருங்கள்.",
    fieldDataSummaryOutcome:
      "பச்சை=ஆரோக்கியம், மஞ்சள்=அழுத்தம், சிவப்பு=முக்கிய எச்சரிக்கை.",
    fieldDataDistrictTableTitle: "மாவட்ட ஒப்பீட்டு அட்டவணை",
    fieldDataDistrictTableAction:
      "ஒவ்வொரு மாவட்டத்தின் தரவையும் அட்டவணையில் ஸ்க்ரோல் செய்து பாருங்கள்.",
    fieldDataDistrictTableOutcome:
      "மாவட்டங்களுக்கிடையிலான ஆரோக்கியம் மற்றும் மகசூலை ஒப்பிடலாம்.",
    fieldDataViewMapTitle: "வரைபடத்தில் காண்க",
    fieldDataViewMapAction:
      "ஏதேனும் மாவட்டத்திற்கு வரைபடம் திறக்க பொத்தானைப் பயன்படுத்தவும்.",
    fieldDataViewMapOutcome:
      "தேர்ந்தெடுத்த மாவட்டத்துடன் வரைபடம் திறக்கும்.",
    actionLabel: "செயல்",
    viewReportBtn: "அறிக்கையை காண்க",
    weatherTutorialOverviewAction:
      "வெப்பநிலை, மழை மற்றும் காற்று உள்ளிட்ட தற்போதைய வானிலை பார்க்கவும்.",
    weatherTutorialOverviewOutcome:
      "உங்கள் இடத்திற்கான நேரடி வானிலை அளவீடுகள் காட்டப்படும்.",
    weatherTutorialHourlyAction:
      "அடுத்த 24 மணி முன்னேற்றம் பார்க்க மணிநேர தாவலைத் திறக்கவும்.",
    weatherTutorialHourlyOutcome:
      "வெப்பநிலை, மழை, காற்று மாற்றங்கள் காட்டப்படும்.",
    weatherTutorialSoilAction:
      "மண் மற்றும் விவசாய நிலை பார்க்க மண் தாவலைத் திறக்கவும்.",
    weatherTutorialSoilOutcome:
      "மண் வெப்பநிலை, ஈரப்பதம், VPD, ET தரவு காட்டப்படும்.",
    weatherTutorialForecastAction:
      "14 நாள் நீண்ட முன்னறிவிப்பைப் பார்க்க முன்னறிவிப்பு தாவலைத் திறக்கவும்.",
    weatherTutorialForecastOutcome:
      "தினசரி கணிப்புகள் மூலம் வேலைத் திட்டமிடலாம்.",
    weatherTutorialHistoryAction:
      "கடந்த பதிவுகளைப் பார்க்க வரலாறு தாவலைத் திறக்கவும்.",
    weatherTutorialHistoryOutcome:
      "சமீபத்திய வானிலை முறைபாடுகளை ஒப்பிடலாம்.",
    dsDivision: "பிரதேச செயலகப் பிரிவு",
    colombo: "கொழும்பு",
    autoDetected: "தானாக கண்டறியப்பட்டது",
    daytime: "பகல்",
    night: "இரவு",
    hourlyDetailTable: "மணிநேர விரிவான அட்டவணை",
    soilTemperatureProfiles: "மண் வெப்பநிலை சுயவிவரங்கள்",
    soilMoistureContent: "மண் ஈரப்பத அளவு",
    agronomicIndicators: "விவசாய குறியீடுகள்",
    sprayFieldAdvisory: "தெளிப்பு மற்றும் வயல் வேலை ஆலோசனை",
    outlook14Day: "14 நாள் முன்னோக்கு",
    weeklyAgroForecastDetail: "வாராந்திர விவசாய முன்னறிவிப்பு விவரம்",
    past7DaysFieldHistory: "கடந்த 7 நாட்கள் வயல் வரலாறு",
    historicalDetailTable: "வரலாற்று விரிவான அட்டவணை",
    reportTutorialOverviewAction:
      "செயற்கைக்கோள் அடிப்படையிலான மகசூல் கணிப்புகளை ஆய்வு செய்யுங்கள்.",
    reportTutorialOverviewOutcome:
      "ஒப்பீட்டு அளவுகோல்களுடன் விரிவான அறிக்கைகள் காணலாம்.",
    reportTutorialModeTitle: "ஒற்றை அல்லது ஒப்பீடு",
    reportTutorialModeAction:
      "ஒற்றை மற்றும் ஒப்பீட்டு முறைகளுக்கு இடையில் மாற்றவும்.",
    reportTutorialModeOutcome:
      "ஒரு மாவட்டம் அல்லது இரண்டு மாவட்டங்களை ஒப்பிடலாம்.",
    reportTutorialDistrictTitle: "மாவட்டத் தேர்வு",
    reportTutorialDistrictAction:
      "மகசூல் பகுப்பாய்வு பார்க்க மாவட்டத்தைத் தேர்வு செய்யவும்.",
    reportTutorialDistrictOutcome:
      "தேர்ந்தெடுத்த மாவட்டத்திற்கான தரவு ஏற்றப்படும்.",
    reportTutorialYieldTitle: "மகசூல் கணிப்பு",
    reportTutorialYieldAction:
      "கணிக்கப்பட்ட மகசூல் மற்றும் வரலாற்று ஒப்பீட்டை பார்க்கவும்.",
    reportTutorialYieldOutcome:
      "எதிர்பார்க்கப்படும் மகசூல் மற்றும் அடிப்படை மதிப்பு காட்டப்படும்.",
    reportTutorialMetricsTitle: "அளவுகோல்கள் மற்றும் ஏற்றுமதி",
    reportTutorialMetricsAction:
      "பூச்சி/அபாய அளவுகோல்கள் பார்த்து அறிக்கையை ஏற்றுமதி செய்யவும்.",
    reportTutorialMetricsOutcome:
      "முழுமையான பகுப்பாய்வு PDF பதிவிறக்கம் செய்யலாம்.",
    dataUnavailable: "தரவு கிடைக்கவில்லை",
    fetchingSatelliteData: "செயற்கைக்கோள் தரவைப் பெறுகிறது...",
    viewLabel: "காட்சி",
    primaryLabel: "முதன்மை",
    comparisonLabel: "ஒப்பீடு",
    predictedAverage: "கணிக்கப்பட்ட சராசரி",
    totalYieldLabel: "மொத்த மகசூல்",
    historicalBaseline: "வரலாற்று அடிப்படை",
    pestCount: "பூச்சி எண்ணிக்கை",
    riskFactor: "அபாய காரணி",
    exportComparisonReport: "ஒப்பீட்டு அறிக்கையை ஏற்றுமதி செய்",
    loginFailed: "உள்நுழைவு தோல்வி",
    pleaseEnterEmail: "தயவுசெய்து உங்கள் மின்னஞ்சலை உள்ளிடவும்.",
    failedToSendResetEmail: "கடவுச்சொல் மீட்டமைவு மின்னஞ்சல் அனுப்ப முடியவில்லை.",
    networkErrorTryAgain: "பிணைய பிழை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    validEmailAddressError: "செல்லுபடியாகும் மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
    signupFailed: "பதிவு தோல்வி",
    createAccountSubtitle:
      "தொடங்க உங்கள் RiceVision கணக்கை உருவாக்குங்கள்.",
    sidebarTutorialNavTitle: "பக்கப்பட்டி வழிசெலுத்தல்",
    sidebarTutorialNavAction:
      "முக்கிய பக்கங்களுக்கு செல்ல இடது பக்கப்பட்டியை பயன்படுத்துங்கள்.",
    sidebarTutorialNavOutcome:
      "டாஷ்போர்டு, வரைபடம், எச்சரிக்கைகள், வானிலை, அறிக்கைகள் அனைத்தையும் இங்கிருந்து திறக்கலாம்.",
    sidebarTutorialTopTitle: "மேல் வழிசெலுத்தல் இணைப்புகள்",
    sidebarTutorialTopAction:
      "செல்ல வேண்டிய பக்கத்தை மேல் இணைப்புகளில் கிளிக் செய்யவும்.",
    sidebarTutorialTopOutcome:
      "ஒளிரும் இணைப்பு நீங்கள் இருக்கும் தற்போதைய பக்கத்தை காட்டும்.",
    sidebarTutorialBottomTitle: "கீழ் விருப்பங்கள்",
    sidebarTutorialBottomAction:
      "கீழ்பகுதியில் சுயவிவரம், உதவி மற்றும் வெளியேறல் விருப்பங்கள் உள்ளன.",
    sidebarTutorialBottomOutcome:
      "எந்த பக்கத்திலிருந்தும் கணக்கு மேலாண்மைக்கு விரைவான அணுகல் கிடைக்கும்.",
    systemVersionTag: "அமைப்பு பதிப்பு Alpha-1.0.4 - RiceVision Core",
    dashboardTutorialWelcome:
      "வரவேற்பு. இது உங்கள் வயல் கட்டுப்பாட்டு மையத்தின் மேலோட்டம்.",
    dashboardTutorialSync:
      "உங்கள் தரவு புதுப்பிக்கப்பட்டதா என்பதை இந்த குறியீட்டில் சரிபார்க்கவும்.",
    dashboardTutorialHealth:
      "பயிர் ஆரோக்கியத்தை பை சார்டில் பாருங்கள். பச்சை சிறந்த நிலை.",
    dashboardTutorialYield:
      "எதிர்பார்க்கப்படும் மொத்த மகசூலை மெட்ரிக் டன்னில் இங்கே பாருங்கள்.",
    dashboardTutorialSupply:
      "எதிர்பார்க்கப்படும் பற்றாக்குறை மற்றும் தேசிய தேவை அபாயங்களை வேகமாக கண்காணிக்கவும்.",
    dashboardTutorialThreats:
      "செயலில் உள்ள நோய் பரவல்கள் மற்றும் பூச்சி அபாயங்களை பாருங்கள்.",
    dashboardTutorialThreatDetails:
      "இந்த அச்சுறுத்தலுக்கான விரிவான பரிந்துரைகளை திறக்கவும்.",
    dashboardTutorialThreatToggle:
      "அச்சுறுத்தல் பட்டியலை விரிவாக்க / சுருக்க இதைப் பயன்படுத்தவும்.",
    dashboardTutorialStageChart:
      "உங்கள் பயிர்கள் எந்த வளர்ச்சி கட்டத்தில் உள்ளன என்பதை சதவீதமாக பாருங்கள்.",
    dashboardTutorialDistrictTable:
      "அனைத்து மாவட்டங்களின் ஆரோக்கிய அளவுகோல்களை ஒரே அட்டவணையில் ஒப்பிடுங்கள்.",
    dashboardTutorialDistrictToggle:
      "முழு மாவட்ட பட்டியலை விரிவாக்க இந்த பொத்தானை பயன்படுத்துங்கள்.",
    fieldsLabel: "வயல்கள்",
    countLabel: "எண்ணிக்கை",
    statusSafe: "பாதுகாப்பான",
    statusModerate: "மிதமான",
    statusCritical: "முக்கிய",
    statusStable: "நிலையான",
    statusWarning: "எச்சரிக்கை",
    statusHighRisk: "உயர் அபாயம்",
    wmoClearSky: "தெளிந்த வானம்",
    wmoPartlyCloudy: "பகுதி மேகமூட்டம்",
    wmoOvercast: "முழு மேகமூட்டம்",
    wmoFoggyHaze: "மூடுபனி / பனித்தூள்",
    wmoDrizzle: "சிறு தூறல்",
    wmoRain: "மழை",
    wmoSnowIce: "பனி / ஐஸ்",
    wmoRainShowers: "மழை சாரல்கள்",
    wmoHeavySnowShowers: "கனமழை பனிச்சாரல்",
    wmoThunderstorm: "இடி மின்னல் மழை",
    wmoUnknown: "அறியப்படாதது",
    weatherAdvisoryFeels: "உணரப்படும் வெப்பம் {temp}°C",
    weatherAdvisoryFungalRisk: "பூஞ்சை அபாயம்",
    weatherAdvisoryNormal: "சாதாரணம்",
    weatherAdvisoryMoistureThreshold: "ஈரப்பத நிறைவு வரம்பு",
    weatherAdvisoryPoorSunlight: "குறைந்த சூரிய ஒளி",
    weatherAdvisoryGoodForCrops: "பயிர்களுக்கு நல்லது",
    weatherAdvisoryMeanSeaLevel: "சராசரி கடல் மட்டம்",
    weatherAdvisoryAvoidSpraying: "தெளிப்பதை தவிர்க்கவும்",
    weatherAdvisorySafeForSpraying: "தெளிப்பதற்கு பாதுகாப்பானது",
    weatherAdvisoryHighGusts: "கன காற்றடிகள்",
    weatherAdvisorySafe: "பாதுகாப்பானது",
    weatherAdvisoryCurrentHour: "தற்போதைய மணி",
    weatherAdvisoryUVVeryHigh: "UV மிகவும் உயரம்",
    weatherAdvisoryUVModerate: "மிதமான",
    weatherAdvisoryUVLow: "குறைவு",
    weatherAdvisoryPoorVisibility: "குறைந்த தெளிவு",
    weatherAdvisoryGood: "நல்லது",
    weatherAdvisoryHoursWithRain: "மழை பெய்த மணிநேரங்கள்",
    weatherAdvisoryTodayTotal: "இன்றைய மொத்தம்",
    weatherAdvisoryIrrigationGuide: "பாசன வழிகாட்டி",
    weatherAdvisoryCropStress: "பயிர் அழுத்தம்",
    weatherAdvisoryTotalRainToday: "இன்றைய மொத்த மழை",
    weatherAdvisoryMaxChanceToday: "இன்றைய அதிகபட்ச வாய்ப்பு",
    weatherTableColTime: "நேரம்",
    weatherTableColCondition: "நிலை",
    weatherTableColTemp: "வெப்பம்",
    weatherTableColFeels: "உணர்வு",
    weatherTableColHumidity: "ஈரப்பதம்",
    weatherTableColRainPercent: "மழை%",
    weatherTableColRainMm: "மழை mm",
    weatherTableColWind: "காற்று",
    weatherTableColUV: "UV",
    weatherTableColET0: "ET0",
    weatherTableColVisibility: "தெளிவு",
    weatherTableColDate: "தேதி",
    weatherTableColMaxTemp: "அதிகபட்ச C",
    weatherTableColMinTemp: "குறைந்தபட்ச C",
    weatherTableColWindMax: "காற்று அதிகபட்சம்",
    weatherTableColUvMax: "UV அதிகபட்சம்",
    weatherTableColRadiation: "கதிர்வீச்சு",
    weatherTableColSunrise: "சூரிய உதயம்",
    weatherTableColSunset: "சூரிய அஸ்தமனம்",
    weatherTableColConditions: "நிலைகள்",
    weatherTableColRainSum: "மழை மொத்தம்",
    weatherTableColRainHours: "மழை மணிநேரம்",
    soilTempSurfaceLabel: "மேற்பரப்பு (0 cm)",
    soilTempSurfaceDesc: "மேல் அடுக்கு - விதை முளைப்பு பகுதி",
    soilTempShallowLabel: "ஆழமற்ற (6 cm)",
    soilTempShallowDesc: "நாற்று வேர் பகுதி",
    soilTempMediumLabel: "மத்திய (18 cm)",
    soilTempMediumDesc: "செயலில் உள்ள வேர் பகுதி - நெல் வளர்ச்சி",
    soilAdvisoryTooCold: "முளைப்பதற்கு மிகவும் குளிர்",
    soilAdvisoryHeatStress: "வெப்ப அழுத்த அபாயம்",
    soilAdvisoryOptimal: "நெலுக்கு சிறந்தது",
    soilMoistureDepth0to1: "0-1 cm",
    soilMoistureDepth0to1Desc: "மேல் மண் - மேற்பரப்பு ஆவியாகும் அடுக்கு",
    soilMoistureDepth1to3: "1-3 cm",
    soilMoistureDepth1to3Desc: "நாற்று வேர் பகுதி",
    soilMoistureDepth3to9: "3-9 cm",
    soilMoistureDepth3to9Desc: "முக்கிய வேர் உறிஞ்சும் பகுதி",
    soilMoistureLabel: "மண் ஈரப்பதம்",
    soilMoistureLow: "குறைவு - பாசனம் பரிசீலிக்கவும்",
    soilMoistureSaturated: "நிறைவு",
    soilMoistureGood: "நல்ல ஈரப்பத நிலை",
    et0EvapotranspirationToday: "இன்றைய ET0 ஆவியீடு-உமிழ்வு",
    et0Description:
      "FAO-56 குறியீட்டின் படி, சிறந்த சூழலில் பயிர் பயன்படுத்தும் நீர் அளவு.",
    et0HighDemand: "அதிக தேவை - பாசனம் அதிகரிக்கவும்",
    et0ModerateDemand: "மிதமானது - சாதாரண பாசனம்",
    et0LowDemand: "குறைந்த தேவை - பாசனம் குறைக்கவும்",
    vapourPressureDeficit: "ஆவியழுத்த குறைவு",
    vpdDescription: "உயர் VPD பயிரில் நீர் அழுத்தத்தை அதிகரிக்கலாம்.",
    vpdSevereStress: "கடுமையான அழுத்தம்",
    vpdModerateStress: "மிதமான அழுத்தம்",
    vpdGoodConditions: "நல்ல நிலை",
    solarRadiationToday: "இன்றைய சூரிய கதிர்வீச்சு",
    solarRadiationDescription:
      "அதிக கதிர்வீச்சு ஆவியீடு மற்றும் ஒளிச்சேர்க்கையை உயர்த்தும்.",
    solarRadiationHigh: "அதிக கதிர்வீச்சு நாள்",
    solarRadiationNormal: "சாதாரண கதிர்வீச்சு",
    advisorySprayingTitle: "பூச்சிக்கொல்லி / களைக்கொல்லி தெளித்தல்",
    advisoryIrrigationTitle: "பாசனம் பரிந்துரை",
    advisoryFungalRiskTitle: "பூஞ்சை நோய் அபாயம்",
    advisoryFieldMachineryTitle: "வயல் இயந்திரப் பணி",
    advisoryHarvestTitle: "அறுவடை நிலை",
    advisoryUvRiskTitle: "UV வெளிப்பாடு அபாயம்",
    advisoryWindDriftRisk: "காற்று {speed} km/h - சிதறல் அபாயம்",
    advisoryRainWashOffRisk: "மழை உள்ளது - கழுவிச் செல்லும் அபாயம்",
    advisoryHeavyCloudPoorDrying: "கன மேகம் - உலர்வு குறைவு",
    advisoryAllConditionsMet: "அனைத்து நிபந்தனைகளும் பூர்த்தி",
    advisoryEt0Low: "ET0 குறைவு ({et0} mm)",
    advisorySoilMoistureSufficient: "மண் ஈரப்பதம் போதுமானது",
    advisoryEt0MoistureLow: "ET0 = {et0} mm, ஈரப்பதம் குறைவு",
    advisoryHumidityMonitorBlast: "ஈரப்பதம் {humidity}% - பிளாஸ்ட் கண்காணிக்கவும்",
    advisoryHumidityLowRisk: "ஈரப்பதம் {humidity}% - குறைந்த அபாயம்",
    advisoryRainSoilWaterlogged: "மழை உள்ளது - மண் நீர்நிலையாகியுள்ளது",
    advisorySoilTooWetMachinery: "இயந்திரப் பணிக்கு மண் மிக ஈரமாக உள்ளது",
    advisoryConditionsSuitable: "நிலைகள் பொருத்தமானவை",
    advisoryRainAvoidHarvest: "மழை - அறுவடை தவிர்க்கவும்",
    advisoryHighHumidityGrainMoistureRisk:
      "அதிக ஈரப்பதம் - தானிய ஈரத்தன்மை அபாயம்",
    advisoryGoodHarvestWindow: "அறுவடைக்கு நல்ல நேர சாளரம்",
    advisoryUvVeryHigh: "UV {uv} - மிகவும் உயரம், பாதுகாப்பு பயன்படுத்தவும்",
    advisoryUvWearProtection: "UV {uv} - பாதுகாப்பு உபகரணம் அணியவும்",
    advisoryUvSafe: "UV {uv} - பாதுகாப்பானது",
    advisoryStatusMonitor: "கண்காணி",
    advisoryStatusGo: "செல்",
    advisoryStatusHold: "நிறுத்து",
    weatherRainShort: "மழை",
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

  const getByPath = (obj, key) => {
    if (!obj || !key) return undefined;
    return key.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
  };

  const t = (key) =>
    getByPath(translations[language], key) ??
    getByPath(translations["en"], key) ??
    key;

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
