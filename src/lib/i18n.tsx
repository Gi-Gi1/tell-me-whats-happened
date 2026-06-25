import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Supported languages
 * ---------------------------------
 * All entries use proper Unicode (no Zawgyi).
 * Native script labels are shown in the language selector.
 */
export type Lang =
  | "my"   // မြန်မာ (Myanmar / Burmese — Unicode)
  | "en";  // English

export const LANG_META: Record<Lang, { label: string; english: string; short: string; flag: string }> = {
  my:  { label: "မြန်မာ",          english: "Burmese (Myanmar)", short: "မြန်", flag: "🇲🇲" },
  en:  { label: "English",          english: "English",           short: "EN",   flag: "🌐" },
};

export const LANG_ORDER: Lang[] = ["my", "en"];


const STORAGE_KEY = "agri.lang";

type Resource = Record<string, string>;

const EN: Resource = {
  appName: "Orvia",
  language: "Language",
  search: "Search",
  save: "Save",
  cancel: "Cancel",
  loading: "Loading…",
  pleaseWait: "Please wait…",
  required: "Required",
  back: "Back",
  success: "Success",
  error: "An error occurred",
  retry: "Retry",
  less: "Less",
  more: "More",
  noResults: "No results",
  unicodeOnly: "Unicode only — no Zawgyi",
  notFoundTitle: "Page not found",
  notFoundBody: "The page you are looking for no longer exists or has moved.",
  backHome: "Back to home",
  pageErrorTitle: "This page cannot be opened",
  pageErrorBody: "Something went wrong. Please try again or return to the home page.",
  tryAgain: "Try again",

  signIn: "Sign In",
  signUp: "Sign Up",
  signOut: "Sign Out",
  email: "Email",
  emailOrPhone: "Email or Phone",
  phone: "Phone Number",
  password: "Password",
  confirmPassword: "Confirm Password",
  displayName: "Full Name",
  rememberMe: "Remember me",
  forgotPassword: "Forgot password?",
  resetPassword: "Reset password",
  setNewPassword: "Set a new password",
  newPassword: "New password",
  updatePassword: "Update password",
  passwordUpdated: "Password updated",
  checkingResetLink: "Checking your reset link…",
  invalidResetLink: "This reset link is expired or invalid. Please request a new one.",
  requestAgain: "Request again",
  backToSignIn: "Back to sign in",
  sendResetLink: "Send reset link",
  resetLinkSent: "Reset link sent",
  resetLinkHelp: "We'll email you a secure link to set a new password.",
  resetLinkCheckInbox: "Check your inbox and spam folder for the reset link.",
  chooseRole: "Choose your role",
  createAccount: "Create Account",
  accountCreated: "Account created",
  welcomeBack: "Welcome back",
  checkYourEmail: "Check your email to confirm your account, then sign in.",
  yourProfile: "Your profile",
  editProfile: "Edit profile",
  editProfileHint: "Update your name, contact and location. Changes apply across the app.",
  profileSaved: "Profile saved",
  profileSavedLocal: "Saved locally — run the auth SQL setup to persist in the database.",
  goToDashboard: "Go to dashboard",
  openMarketplace: "Open marketplace",
  alreadyHaveAccount: "Already have an account?",
  noAccountYet: "No account yet?",
  region: "State / Region",
  township: "Township",
  invalidPhone: "Invalid Myanmar phone number.",
  selectRole: "Please select a role.",
  passwordsDoNotMatch: "Passwords do not match.",
  passwordTooShort: "Password must be at least 8 characters.",
  invalidLogin: "Invalid email or password.",
  emailAlreadyUsed: "An account with this email already exists.",
  authRateLimited: "Too many attempts. Please wait and try again.",
  networkError: "Network connection failed. Please check your internet.",
  actionFailed: "Action failed. Please try again.",

  home: "Home",
  dashboard: "Dashboard",
  market: "Market",
  marketplace: "Marketplace",
  analytics: "Analytics",
  aiInsights: "AI Insights",
  impact: "Impact",
  doctor: "Crop Doctor AI",
  notifications: "Notifications",
  settings: "Settings",
  cropHealth: "Crop Health",
  postCrop: "Post Crop",
  postShort: "Post",
  cropDoctor: "Crop Doctor",
  analyticsNav: "Analytics",
  aiInsightsNav: "AI Insights",
  footerMarket: "Myanmar agricultural marketplace",
  footerBuiltForFarmers: "Built for farmers, with farmers.",

  homeSubtitle: "AI-powered agricultural marketplace for Myanmar farmers.",
  enterMarketplace: "Enter marketplace",
  signInOrRegister: "Sign in / Register",
  heroBadge: "Farmer-first marketplace",
  heroTitle: "Sell your crops directly to buyers across Myanmar",
  heroBody: "No middlemen, better prices, faster connections — a simple way for farmers and buyers to meet.",
  heroDoctorCta: "Check disease with AI",
  todayRicePrice: "Today's rice price (Yangon)",
  avgPrice: "Average price",
  kyatPerBasket: "75,000 MMK / basket",
  featureTitle: "AI marketplace built for Myanmar farmers",
  featureBody: "Simple tools for listing, discovering and trading crops.",
  featureDirectTitle: "Direct farmer-buyer connection",
  featureDirectDesc: "Avoid middlemen and earn better income.",
  featurePriceTitle: "Fair market prices",
  featurePriceDesc: "Transparent prices for every crop and region.",
  featureRegionalTitle: "Regional listings",
  featureRegionalDesc: "Find buyers and sellers near your township.",
  featureMobileTitle: "Mobile optimized",
  featureMobileDesc: "Low data usage and crop posting in under one minute.",
  featureDoctorTitle: "AI crop health clinic",
  featureDoctorDesc: "Upload a crop photo and get disease guidance instantly.",
  featureAlertsTitle: "Weather and price alerts",
  featureAlertsDesc: "Stay updated on rain, heat and market changes.",
  featureTransportTitle: "Vehicle & Transport Hub",
  featureTransportDesc: "Find trucks, pickups, vans, tractors and motorbikes — book agricultural transport directly.",
  transportNav: "Transport",

  recentListings: "Recent crop listings",
  recentListingsBody: "Fresh listings from farmers across Myanmar.",
  postYourCrop: "Post your crop",
  noListings: "No listings yet.",
  beFirstListing: "Be the first to post a listing",
  quantity: "Quantity",
  call: "Call",

  postTitle: "Post a new crop listing",
  postSubtitle: "Add basic details so buyers can find your listing immediately.",
  cropName: "Crop name",
  cropNamePlaceholder: "Example — rice, green gram, mango",
  unit: "Unit",
  pricePerUnit: "Price per unit (MMK)",
  selectRegion: "Select state / region",
  selectTownship: "Select township",
  selectRegionFirst: "Select state / region first",
  contactPhoneViber: "Contact (Phone / Viber)",
  description: "Description",
  descriptionPlaceholder: "Quality, variety, packaging — details buyers should know",
  cropImages: "Crop images",
  deliveryOptions: "Delivery option",
  harvestDate: "Harvest date",
  harvestHelp: "When was the crop harvested or when will it be ready?",
  submitting: "Submitting…",
  submitListing: "Submit listing",
  signInToPost: "Please sign in to post a crop.",
  uploadingImages: "Uploading images…",
  listingCreated: "Your crop listing has been posted.",
  listingFailed: "Unable to post listing.",
  validationCropName: "Crop name is too short",
  validationPositiveNumber: "Enter a positive number",
  validationPrice: "Enter a price",
  validationRegion: "Choose a state / region",
  validationTownship: "Choose a township",
  validationContact: "Enter a phone or Viber number",
  additionalInfo: "Additional information (optional)",
  additionalInfoDesc: "Photos, delivery and harvest date increase buyer trust.",
  hide: "Hide",
  addMore: "Add more",
  deliveryAvailable: "Delivery available",
  deliveryAvailableDesc: "The seller can deliver to the buyer.",
  pickupOnly: "Pickup only",
  pickupOnlyDesc: "The buyer should collect from the seller's location.",
  selectHarvestDate: "Select harvest date",
  imageDrop: "Drag images here — or click to browse files",
  imageHelp: "Add clear photos to attract buyers • JPG, PNG, WEBP • max 5MB • up to 6 images",
  invalidImageType: "Only JPG, PNG or WEBP images are allowed.",
  imageTooLarge: "Each image must be smaller than 5MB.",
  removeImage: "Remove image",

  doctorTitle: "AI Crop Health Clinic",
  doctorSubtitle: "Upload a leaf, plant or fruit photo. AI will suggest disease status, severity and treatment guidance instantly.",
  doctorDrop: "Drop an image — or click to browse files",
  doctorHelp: "JPG, PNG, WEBP • max 5MB • phone camera supported.",
  selectedCropImage: "Selected crop image",
  removeSelectedImage: "Remove image",
  doctorChecksTitle: "What AI will check",
  doctorCheckDisease: "Disease, pest or nutrient deficiency name",
  doctorCheckSeverity: "Severity level and confidence percentage",
  doctorCheckCauses: "Likely causes",
  doctorCheckTreatment: "Suitable chemical and organic treatments",
  doctorCheckPrevention: "Prevention methods",
  analyzeWithAi: "Analyze with AI",
  analyzing: "AI is analyzing…",
  analyzingImage: "AI is carefully reviewing the image…",
  waitSeconds: "Please wait about 10–20 seconds.",
  aiAnalysisComplete: "AI analysis completed.",
  aiAnalysisFailed: "AI analysis failed.",
  fileReadFailed: "Unable to read file",
  normal: "Normal",
  low: "Low",
  medium: "Medium",
  high: "High",
  diagnosisResult: "AI diagnosis result",
  cropHealthy: "The crop appears healthy",
  severity: "Severity",
  confidence: "Confidence",
  likelyCauses: "Likely causes",
  recommendedTreatments: "Recommended treatments",
  organicAlternatives: "Organic alternatives",
  preventionMethods: "Prevention methods",
  recoveryTime: "Estimated recovery time",
  aiDisclaimer: "These results are AI estimates only. Consult local agricultural experts before making final decisions.",

  notificationsTitle: "Notifications",
  notificationsSubtitle: "Weather, disease, price and AI recommendations gathered in one place.",
  markAllRead: "Mark all as read",
  all: "All",
  categoryWeather: "Weather",
  categoryDisease: "Disease",
  categoryPrice: "Price",
  categoryAi: "AI advice",
  categoryCalendar: "Calendar",
  categoryGov: "Government",
  categoryEquipment: "Equipment",
  important: "Important",
  markRead: "Mark as read",
  noNotificationsCategory: "No notifications for this category yet.",
  notificationFootnote: "Notifications are generated automatically from weather, AI forecasts and market data.",

  "role.farmer": "Farmer",
  "role.buyer": "Buyer",
  "role.trader": "Trader",
  "role.agribusiness": "Agribusiness",
  "role.student": "Student",
  "role.officer": "Officer",
  "roleDesc.farmer": "Grow and sell crops",
  "roleDesc.buyer": "Buy crops",
  "roleDesc.trader": "Wholesale trading",
  "roleDesc.agribusiness": "Agricultural business",
  "roleDesc.student": "Research and education",
  "roleDesc.officer": "Agricultural officer and reporting",
  dashboardFor: "Dashboard for {role}",
  farmerDashboardTitle: "Farmer Dashboard",
  farmerDashboardSubtitle: "Post your crops, diagnose diseases with AI, and connect directly with markets and buyers.",
  buyerDashboardTitle: "Buyer Dashboard",
  buyerDashboardSubtitle: "Buy fresh crops directly from farmers and compare market prices.",
  traderDashboardTitle: "Trader Dashboard",
  traderDashboardSubtitle: "Track market opportunities for bulk buying and selling.",
  agribusinessDashboardTitle: "Agribusiness Dashboard",
  agribusinessDashboardSubtitle: "Manage supply, services and contract farming operations in one place.",
  studentDashboardTitle: "Student Dashboard",
  studentDashboardSubtitle: "Explore agricultural knowledge, AI tools and research resources.",
  officerDashboardTitle: "Agricultural Officer Dashboard",
  officerDashboardSubtitle: "View regional reports, crop disease alerts and analytics in one place.",
  goToMarketplace: "Go to marketplace",
  profile: "Profile",
  profileTileDesc: "Manage your account",
};

const MY: Resource = {
  appName: "Orvia",
  language: "ဘာသာစကား",
  search: "ရှာဖွေရန်",
  save: "သိမ်းမည်",
  cancel: "ပယ်ဖျက်မည်",
  loading: "ခေတ္တစောင့်ပါ…",
  pleaseWait: "ခေတ္တစောင့်ပါ…",
  required: "လိုအပ်သည်",
  back: "ပြန်သွားရန်",
  success: "အောင်မြင်ပါသည်",
  error: "အမှားဖြစ်ပေါ်ပါသည်",
  retry: "ထပ်ကြိုးစားရန်",
  less: "လျှော့ပြရန်",
  more: "ပိုမိုပြရန်",
  noResults: "ရလဒ်မရှိပါ",
  unicodeOnly: "Unicode သာ အသုံးပြုသည် — Zawgyi မဟုတ်ပါ",
  notFoundTitle: "စာမျက်နှာ ရှာမတွေ့ပါ",
  notFoundBody: "သင်ရှာဖွေနေသော စာမျက်နှာသည် မရှိတော့ပါ သို့မဟုတ် နေရာပြောင်းရွှေ့ထားပါသည်။",
  backHome: "ပင်မစာမျက်နှာသို့ ပြန်သွားရန်",
  pageErrorTitle: "ဤစာမျက်နှာကို ဖွင့်၍ မရပါ",
  pageErrorBody: "အမှားအယွင်း တစ်စုံတစ်ရာ ဖြစ်ပေါ်နေပါသည်။ စာမျက်နှာကို ပြန်လည်ဖွင့်ကြည့်ပါ သို့မဟုတ် ပင်မစာမျက်နှာသို့ ပြန်သွားပါ။",
  tryAgain: "ထပ်မံကြိုးစားရန်",

  signIn: "ဝင်ရောက်ရန်",
  signUp: "အကောင့်ဖွင့်ရန်",
  signOut: "ထွက်ရန်",
  email: "အီးမေးလ်",
  emailOrPhone: "အီးမေးလ် သို့မဟုတ် ဖုန်း",
  phone: "ဖုန်းနံပါတ်",
  password: "စကားဝှက်",
  confirmPassword: "စကားဝှက် အတည်ပြုရန်",
  displayName: "အမည် အပြည့်အစုံ",
  rememberMe: "မှတ်ထားရန်",
  forgotPassword: "စကားဝှက် မေ့နေသလား?",
  resetPassword: "စကားဝှက် ပြန်လည် သတ်မှတ်ရန်",
  setNewPassword: "စကားဝှက် အသစ် သတ်မှတ်ရန်",
  newPassword: "စကားဝှက် အသစ်",
  updatePassword: "စကားဝှက် သိမ်းမည်",
  passwordUpdated: "စကားဝှက် ပြောင်းလဲပြီးပါပြီ",
  checkingResetLink: "စစ်ဆေးနေပါသည်…",
  invalidResetLink: "ဤလင့်ခ်သည် သက်တမ်းကုန်ဆုံးပြီ သို့မဟုတ် မမှန်ကန်ပါ။ ပြန်လည် တောင်းခံပါ။",
  requestAgain: "ပြန်လည် တောင်းခံရန်",
  backToSignIn: "ဝင်ရောက်ရန် စာမျက်နှာသို့",
  sendResetLink: "ပြန်လည် သတ်မှတ်ရန် လင့်ခ် ပို့မည်",
  resetLinkSent: "ပြန်လည် သတ်မှတ်ရန် လင့်ခ် ပို့ပြီးပါပြီ",
  resetLinkHelp: "သင်၏ အီးမေးလ်လိပ်စာသို့ ပြန်လည် သတ်မှတ်ရန် လင့်ခ်ကို ပို့ပေးပါမည်။",
  resetLinkCheckInbox: "အီးမေးလ်ကို စစ်ဆေးပါ။ Spam folder ထဲတွင်လည်း ကြည့်ပါ။",
  chooseRole: "သင့်အခန်းကဏ္ဍ ရွေးချယ်ပါ",
  createAccount: "အကောင့်ဖန်တီးရန်",
  accountCreated: "အကောင့် ဖန်တီးပြီးပါပြီ",
  welcomeBack: "ပြန်လည် ကြိုဆိုပါသည်",
  checkYourEmail: "အကောင့်အတည်ပြုရန် အီးမေးလ်ကို စစ်ဆေးပြီး ဝင်ရောက်ပါ။",
  yourProfile: "သင်၏ ပရိုဖိုင်",
  editProfile: "ပရိုဖိုင် ပြင်ဆင်ရန်",
  editProfileHint: "အမည်၊ ဖုန်းနှင့် တည်နေရာ ပြောင်းလဲနိုင်ပါသည်။",
  profileSaved: "ပရိုဖိုင် သိမ်းပြီးပါပြီ",
  profileSavedLocal: "ဒေသန္တရ သိမ်းပြီး — Database တွင် သိမ်းရန် auth SQL ကို run ပါ။",
  goToDashboard: "ဒက်ရှ်ဘုတ်သို့",
  openMarketplace: "ဈေးကွက် ဖွင့်ရန်",
  alreadyHaveAccount: "အကောင့်ရှိပြီးသား",
  noAccountYet: "အကောင့် မရှိသေးပါက",
  region: "ပြည်နယ်/တိုင်း",
  township: "မြို့နယ်",
  invalidPhone: "မြန်မာဖုန်းနံပါတ် ပုံစံ မှားယွင်းနေပါသည်။",
  selectRole: "အခန်းကဏ္ဍ ရွေးချယ်ပါ။",
  passwordsDoNotMatch: "စကားဝှက် မတူညီပါ။",
  passwordTooShort: "စကားဝှက် အနည်းဆုံး စာလုံး ၈ လုံး ရှိရပါမည်။",
  invalidLogin: "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။",
  emailAlreadyUsed: "ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ထားပြီး ဖြစ်ပါသည်။",
  authRateLimited: "ကြိုးစားမှု များလွန်းပါသည်။ ခဏနေပြီးမှ ပြန်လည် ကြိုးစားပါ။",
  networkError: "ကွန်ရက် ချိတ်ဆက်မှု ပြတ်တောက်နေပါသည်။ အင်တာနက်ကို စစ်ဆေးပါ။",
  actionFailed: "လုပ်ဆောင်ချက် မအောင်မြင်ပါ။ ထပ်မံ ကြိုးစားကြည့်ပါ။",

  home: "ပင်မ",
  dashboard: "ဒက်ရှ်ဘုတ်",
  market: "ဈေးကွက်",
  marketplace: "ဈေးကွက်",
  analytics: "ဈေးကွက် ခွဲခြမ်းစိတ်ဖြာ",
  aiInsights: "AI အကြံပြုချက်များ",
  impact: "ထိရောက်မှု",
  doctor: "သီးနှံ ဆရာဝန် AI",
  notifications: "အသိပေးချက်များ",
  settings: "ဆက်တင်",
  cropHealth: "သီးနှံကျန်းမာရေး",
  postCrop: "သီးနှံတင်ရန်",
  postShort: "တင်ရန်",
  cropDoctor: "သီးနှံကျန်းမာရေး AI",
  analyticsNav: "ဈေးကွက် ခွဲခြမ်းစိတ်ဖြာ",
  aiInsightsNav: "AI အကြံပြုချက်",
  footerMarket: "မြန်မာ့လယ်ယာဈေးကွက်",
  footerBuiltForFarmers: "တောင်သူများအတွက်၊ တောင်သူများနှင့်အတူ တည်ဆောက်ထားသည်။",

  homeSubtitle: "မြန်မာတောင်သူများအတွက် AI ဖြင့်ပံ့ပိုးထားသော လယ်ယာဈေးကွက်။",
  enterMarketplace: "ဈေးကွက်သို့ ဝင်ရောက်ရန်",
  signInOrRegister: "ဝင်ရောက်/စာရင်းသွင်း",
  heroBadge: "တောင်သူဦးစားပေး ဈေးကွက်",
  heroTitle: "သင့်သီးနှံများကို မြန်မာတစ်နိုင်ငံလုံးရှိ ဝယ်ယူသူများထံ တိုက်ရိုက် ရောင်းချပါ",
  heroBody: "ကြားပွဲစားများ မပါ၊ စျေးနှုန်းပိုကောင်း၊ ဆက်သွယ်မှု ပိုမြန်ဆန် — တောင်သူနှင့် ဝယ်ယူသူများ တွေ့ဆုံနိုင်ရန် ရိုးရှင်းသော နည်းလမ်း။",
  heroDoctorCta: "AI ဖြင့် ရောဂါစစ်ဆေးရန်",
  todayRicePrice: "ယနေ့ စပါးဈေး (ရန်ကုန်)",
  avgPrice: "ပျမ်းမျှဈေးနှုန်း",
  kyatPerBasket: "၇၅,၀၀၀ ကျပ် / တင်း",
  featureTitle: "မြန်မာတောင်သူများအတွက် အထူးပြုလုပ်ထားသော AI ဈေးကွက်",
  featureBody: "သီးနှံများကို စာရင်းသွင်းခြင်း၊ ရှာဖွေခြင်းနှင့် ရောင်းဝယ်ခြင်းအတွက် ရိုးရှင်းသော တန်ဆာပလာများ။",
  featureDirectTitle: "တောင်သူနှင့် ဝယ်ယူသူ တိုက်ရိုက်ဆက်သွယ်မှု",
  featureDirectDesc: "ကြားပွဲစားများကို ကျော်လွှား၍ ဝင်ငွေ ပိုမိုရရှိနိုင်ပါသည်။",
  featurePriceTitle: "မျှတသော ဈေးကွက်နှုန်းထား",
  featurePriceDesc: "သီးနှံတိုင်း၊ ဒေသတိုင်းအတွက် ပွင့်လင်းမြင်သာသော ဈေးနှုန်းများ။",
  featureRegionalTitle: "ဒေသအလိုက် ကြော်ငြာများ",
  featureRegionalDesc: "သင့်မြို့နယ်အနီးရှိ ဝယ်ယူသူနှင့် ရောင်းချသူများကို ရှာဖွေနိုင်ပါသည်။",
  featureMobileTitle: "မိုဘိုင်းဖုန်းအတွက် အသင့်တော်ဆုံး",
  featureMobileDesc: "ဒေတာအသုံးပြုမှု နည်းပါးပြီး ၁ မိနစ်အတွင်း ကြော်ငြာတင်နိုင်ပါသည်။",
  featureDoctorTitle: "AI သီးနှံကျန်းမာရေး ဆေးခန်း",
  featureDoctorDesc: "သီးနှံပုံကို တင်ပြီး ရောဂါနှင့် ကုသနည်းကို ချက်ချင်းသိရှိနိုင်သည်။",
  featureAlertsTitle: "ရာသီဥတုနှင့် ဈေးနှုန်း သတိပေးချက်",
  featureAlertsDesc: "မိုး၊ အပူချိန်နှင့် ဈေးနှုန်းပြောင်းလဲမှုများကို အချိန်နှင့်တပြေးညီ သိရှိနိုင်ပါသည်။",
  featureTransportTitle: "ယာဉ်နှင့် သယ်ယူပို့ဆောင်ရေး",
  featureTransportDesc: "ထရပ်ကား၊ ပစ်ကပ်၊ ဗန်ကား၊ ထွန်စက်နှင့် ဆိုင်ကယ်များဖြင့် လယ်ယာထွက်ကုန် တိုက်ရိုက် မှာယူပါ။",
  transportNav: "သယ်ယူပို့ဆောင်",

  recentListings: "လတ်တလော သီးနှံကြော်ငြာများ",
  recentListingsBody: "မြန်မာတစ်နိုင်ငံလုံးမှ တောင်သူများ၏ လတ်ဆတ်သော ကြော်ငြာများ။",
  postYourCrop: "သင့်သီးနှံကို တင်ရန်",
  noListings: "ကြော်ငြာ မရှိသေးပါ။",
  beFirstListing: "ပထမဆုံး ကြော်ငြာတင်သူ ဖြစ်လိုက်ပါ",
  quantity: "ပမာဏ",
  call: "ဖုန်းခေါ်ရန်",

  postTitle: "သီးနှံ ကြော်ငြာသစ် တင်ရန်",
  postSubtitle: "အခြေခံ အချက်အလက်များကို ဖြည့်ပါ — ဝယ်ယူသူများသည် သင့်ကြော်ငြာကို ချက်ချင်း တွေ့ရှိနိုင်ပါသည်။",
  cropName: "သီးနှံအမည်",
  cropNamePlaceholder: "ဥပမာ — စပါး၊ ပဲတီစိမ်း၊ သရက်သီး",
  unit: "ယူနစ်",
  pricePerUnit: "တစ်ယူနစ်လျှင် ဈေးနှုန်း (ကျပ်)",
  selectRegion: "ပြည်နယ်/တိုင်းကို ရွေးပါ",
  selectTownship: "မြို့နယ်ကို ရွေးပါ",
  selectRegionFirst: "ပြည်နယ်/တိုင်းကို ဦးစွာ ရွေးပါ",
  contactPhoneViber: "ဆက်သွယ်ရန် (ဖုန်း / Viber)",
  description: "အသေးစိတ် ဖော်ပြချက်",
  descriptionPlaceholder: "အရည်အသွေး၊ မျိုးကွဲ၊ ထုပ်ပိုးပုံ — ဝယ်ယူသူ သိရှိစေလိုသော အချက်များ",
  cropImages: "သီးနှံပုံများ တင်ရန်",
  deliveryOptions: "ပို့ဆောင်ရေး ရွေးချယ်မှု",
  harvestDate: "ရိတ်သိမ်းသည့်ရက်",
  harvestHelp: "သီးနှံကို မည်သည့်ရက်တွင် ရိတ်သိမ်းခဲ့သနည်း သို့မဟုတ် မည်သည့်ရက်တွင် အသင့်ဖြစ်မည်နည်း။",
  submitting: "တင်နေပါသည်…",
  submitListing: "ကြော်ငြာတင်ရန်",
  signInToPost: "သီးနှံတင်ရန် အကောင့်ဝင်ပါ။",
  uploadingImages: "ပုံများ တင်နေပါသည်…",
  listingCreated: "သင့်သီးနှံကို ကြော်ငြာတင်ပြီးပါပြီ။",
  listingFailed: "ကြော်ငြာတင်၍ မရပါ",
  validationCropName: "သီးနှံအမည် တိုလွန်းပါသည်",
  validationPositiveNumber: "အပြုသဘောရှိသော ဂဏန်း ထည့်ပါ",
  validationPrice: "ဈေးနှုန်း ထည့်ပါ",
  validationRegion: "ပြည်နယ်/တိုင်းဒေသကြီးကို ရွေးပါ",
  validationTownship: "မြို့နယ်ကို ရွေးပါ",
  validationContact: "ဖုန်းနံပါတ် သို့မဟုတ် Viber နံပါတ်ကို ထည့်ပါ",
  additionalInfo: "အပိုဆောင်း အချက်အလက်များ (လိုအပ်ပါက)",
  additionalInfoDesc: "ဓာတ်ပုံ၊ ပို့ဆောင်ရေး၊ ရိတ်သိမ်းရက် — ဝယ်ယူသူ၏ ယုံကြည်မှု ပိုမိုရရှိစေပါသည်။",
  hide: "ဖျောက်ထားရန်",
  addMore: "ထပ်မံ ဖြည့်စွက်ရန်",
  deliveryAvailable: "ပို့ဆောင်ပေးနိုင်သည်",
  deliveryAvailableDesc: "ရောင်းသူက ဝယ်ယူသူထံသို့ ပို့ဆောင်ပေးပါမည်။",
  pickupOnly: "လာရောက်ထုတ်ယူရန်",
  pickupOnlyDesc: "ဝယ်ယူသူက ရောင်းသူ၏ နေရာသို့ လာရောက်ထုတ်ယူရပါမည်။",
  selectHarvestDate: "ရိတ်သိမ်းရက် ရွေးချယ်ပါ",
  imageDrop: "ဤနေရာသို့ ပုံများကို ဆွဲထည့်ပါ — သို့မဟုတ် ဖိုင်ရှာဖွေရန် နှိပ်ပါ",
  imageHelp: "ဝယ်ယူသူပိုမိုစိတ်ဝင်စားရန် ပုံကြည်လင်သော ဓာတ်ပုံများ ထည့်ပါ • JPG, PNG, WEBP • အများဆုံး 5MB • ပုံ 6 ပုံအထိ",
  invalidImageType: "JPG, PNG သို့မဟုတ် WEBP ပုံများသာ တင်နိုင်ပါသည်။",
  imageTooLarge: "ပုံတစ်ပုံစီသည် 5MB ထက် ငယ်ရပါမည်။",
  removeImage: "ပုံကို ဖယ်ရှားရန်",

  doctorTitle: "AI သီးနှံကျန်းမာရေး ဆေးခန်း",
  doctorSubtitle: "သီးနှံ၏ အရွက်၊ အပင် သို့မဟုတ် အသီးပုံကို တင်ပါ။ AI က ရောဂါအခြေအနေ၊ ပြင်းထန်မှုနှင့် ကုသနည်းကို ချက်ချင်း အကြံပြုပေးပါမည်။",
  doctorDrop: "ပုံကို ဆွဲထည့်ပါ — သို့မဟုတ် ဖိုင်ရှာဖွေရန် နှိပ်ပါ",
  doctorHelp: "JPG, PNG, WEBP • အများဆုံး 5MB • ဖုန်းကင်မရာဖြင့်လည်း တိုက်ရိုက်ရိုက်ကူးနိုင်ပါသည်။",
  selectedCropImage: "ရွေးချယ်ထားသော သီးနှံပုံ",
  removeSelectedImage: "ပုံကို ဖျက်ရန်",
  doctorChecksTitle: "AI က ဘာတွေ စစ်ဆေးပေးပါမည်လဲ",
  doctorCheckDisease: "ရောဂါ၊ ပိုးမွှား သို့မဟုတ် ဓာတ်ချို့တဲ့မှု အမည်",
  doctorCheckSeverity: "ပြင်းထန်မှု အဆင့်နှင့် ယုံကြည်နိုင်မှု ရာခိုင်နှုန်း",
  doctorCheckCauses: "ဖြစ်နိုင်ခြေ အကြောင်းရင်းများ",
  doctorCheckTreatment: "သင့်လျော်သော ဆေးဝါးနှင့် သဘာဝနည်းလမ်း ကုသချက်များ",
  doctorCheckPrevention: "နောက်တစ်ကြိမ် မဖြစ်ပွားစေရန် ကာကွယ်နည်းများ",
  analyzeWithAi: "AI ဖြင့် စစ်ဆေးရန်",
  analyzing: "AI က စစ်ဆေးနေပါသည်…",
  analyzingImage: "AI က ပုံကို ဂရုတစိုက် ကြည့်ရှုနေပါသည်…",
  waitSeconds: "၁၀–၂၀ စက္ကန့်ခန့် စောင့်ပေးပါ။",
  aiAnalysisComplete: "AI စစ်ဆေးခြင်း ပြီးစီးပါပြီ။",
  aiAnalysisFailed: "AI စစ်ဆေးခြင်း မအောင်မြင်ပါ။",
  fileReadFailed: "ဖိုင်ဖတ်၍ မရပါ",
  normal: "ပုံမှန်",
  low: "အနည်းငယ်",
  medium: "အလယ်အလတ်",
  high: "ပြင်းထန်",
  diagnosisResult: "AI စစ်ဆေးမှု ရလဒ်",
  cropHealthy: "သီးနှံ ကျန်းမာသန်စွမ်းနေပါသည်",
  severity: "ပြင်းထန်မှု",
  confidence: "ယုံကြည်နိုင်မှု",
  likelyCauses: "ဖြစ်နိုင်ခြေ အကြောင်းရင်းများ",
  recommendedTreatments: "အကြံပြု ကုသနည်းများ",
  organicAlternatives: "သဘာဝနည်းလမ်း အစားထိုးချက်များ",
  preventionMethods: "ကာကွယ်နည်းများ",
  recoveryTime: "ပြန်လည် ကောင်းမွန်လာရန် ခန့်မှန်းကာလ",
  aiDisclaimer: "ဤရလဒ်များသည် AI ၏ ခန့်မှန်းချက်သာ ဖြစ်ပါသည်။ ဆုံးဖြတ်ချက် ချမှတ်ခြင်းမပြုမီ ဒေသခံ စိုက်ပျိုးရေး ပညာရှင်များနှင့်လည်း တိုင်ပင်ပါ။",

  notificationsTitle: "အသိပေးချက်များ",
  notificationsSubtitle: "ရာသီဥတု၊ ရောဂါ၊ ဈေးနှုန်းနှင့် AI အကြံပြုချက် အားလုံးကို တစ်နေရာတည်းတွင် စုစည်းပြထားသည်။",
  markAllRead: "အားလုံးကို ဖတ်ပြီးအဖြစ် မှတ်ရန်",
  all: "အားလုံး",
  categoryWeather: "ရာသီဥတု",
  categoryDisease: "ရောဂါ",
  categoryPrice: "ဈေးနှုန်း",
  categoryAi: "AI အကြံပြုချက်",
  categoryCalendar: "ပြက္ခဒိန်",
  categoryGov: "အစိုးရ",
  categoryEquipment: "ယန္တရား",
  important: "အရေးကြီး",
  markRead: "ဖတ်ပြီးပါပြီ",
  noNotificationsCategory: "ဤအမျိုးအစားအတွက် အသိပေးချက် မရှိသေးပါ။",
  notificationFootnote: "အသိပေးချက်များသည် ရာသီဥတု၊ AI ခန့်မှန်းချက်နှင့် ဈေးကွက်အချက်အလက်များမှ အလိုအလျောက် ထုတ်ပေးထားခြင်း ဖြစ်ပါသည်။",

  "role.farmer": "စိုက်ပျိုးသူ",
  "role.buyer": "ဝယ်သူ",
  "role.trader": "ကုန်သည်",
  "role.agribusiness": "လုပ်ငန်းရှင်",
  "role.student": "ကျောင်းသား",
  "role.officer": "စိုက်ပျိုးရေးအရာရှိ",
  "roleDesc.farmer": "သီးနှံ စိုက်ပျိုး၊ ရောင်းချ",
  "roleDesc.buyer": "သီးနှံ ဝယ်ယူ",
  "roleDesc.trader": "ဝယ်ရောင်း ကုန်သည်",
  "roleDesc.agribusiness": "လယ်ယာ လုပ်ငန်းရှင်",
  "roleDesc.student": "သုတေသန၊ ပညာရေး",
  "roleDesc.officer": "လယ်ယာ အရာရှိ၊ အစီရင်ခံ",
  dashboardFor: "{role} အတွက် ပင်မမျက်နှာစာ",
  farmerDashboardTitle: "တောင်သူ ပင်မမျက်နှာစာ",
  farmerDashboardSubtitle: "သင်၏ သီးနှံများကို ကြော်ငြာတင်ပါ၊ AI ဖြင့် ရောဂါ စစ်ဆေးပါ၊ ဈေးကွက်နှင့် ဝယ်ယူသူများထံ တိုက်ရိုက် ဆက်သွယ်နိုင်ပါသည်။",
  buyerDashboardTitle: "ဝယ်ယူသူ ပင်မမျက်နှာစာ",
  buyerDashboardSubtitle: "တောင်သူများထံမှ လတ်ဆတ်သော သီးနှံများကို တိုက်ရိုက် ဝယ်ယူနိုင်ပြီး ဈေးနှုန်းများကို နှိုင်းယှဉ်ကြည့်ရှုနိုင်ပါသည်။",
  traderDashboardTitle: "ကုန်သည် ပင်မမျက်နှာစာ",
  traderDashboardSubtitle: "အစုလိုက်အပြုံလိုက် ဝယ်ယူရောင်းချရန် ဈေးကွက် အလားအလာများကို ခြေရာခံပြီး အရောင်းအဝယ် အကောင်းဆုံး အခွင့်အလမ်းများကို ရှာဖွေပါ။",
  agribusinessDashboardTitle: "လုပ်ငန်းရှင် ပင်မမျက်နှာစာ",
  agribusinessDashboardSubtitle: "ပစ္စည်း ထောက်ပံ့မှု၊ ဝန်ဆောင်မှုနှင့် စာချုပ်စိုက်ပျိုးရေး လုပ်ငန်းများကို တစ်နေရာတည်းတွင် စီမံခန့်ခွဲနိုင်ပါသည်။",
  studentDashboardTitle: "ကျောင်းသား ပင်မမျက်နှာစာ",
  studentDashboardSubtitle: "လယ်ယာ စိုက်ပျိုးရေး အသိပညာ၊ AI တန်ဆာပလာများနှင့် သုတေသန ရင်းမြစ်များကို လေ့လာနိုင်ပါသည်။",
  officerDashboardTitle: "စိုက်ပျိုးရေးအရာရှိ ပင်မမျက်နှာစာ",
  officerDashboardSubtitle: "ဒေသအလိုက် အစီရင်ခံစာများ၊ သီးနှံရောဂါ သတိပေးချက်များနှင့် ခွဲခြမ်းစိတ်ဖြာချက်များကို တစ်စုတစ်စည်းတည်း ကြည့်ရှုနိုင်ပါသည်။",
  goToMarketplace: "ဈေးကွက်သို့ သွားရန်",
  profile: "ကိုယ်ရေး အချက်အလက်",
  profileTileDesc: "သင်၏ အကောင့်ကို စီမံပါ",
};

const OTHER_LANGUAGE_OVERRIDES: Partial<Record<Lang, Partial<Resource>>> = {};


function expandResources(en: Resource, my: Resource): Record<string, Record<Lang, string>> {
  const keys = new Set([...Object.keys(en), ...Object.keys(my)]);
  const out: Record<string, Record<Lang, string>> = {};
  for (const key of keys) {
    const english = en[key] ?? my[key] ?? "";
    out[key] = LANG_ORDER.reduce((acc, l) => {
      acc[l] = l === "my" ? (my[key] ?? english) : l === "en" ? english : (OTHER_LANGUAGE_OVERRIDES[l]?.[key] ?? english);
      return acc;
    }, {} as Record<Lang, string>);
  }
  return out;
}

export const DICT = expandResources(EN, MY);

export type DictKey = keyof typeof DICT;

// Inline dictionary for ad-hoc strings not promoted to a permanent key.
export type InlineDict = Partial<Record<Lang, string>> & { en: string };

type Translator = {
  (k: DictKey): string;
  (k: string, inline: InlineDict): string;
  (k: string, params?: Record<string, string | number>): string;
};

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  cycleLang: () => void;
  t: Translator;
}>({
  lang: "my",
  setLang: () => {},
  cycleLang: () => {},
  t: ((k: string) => k) as Translator,
});

function readStoredLang(): Lang | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    return stored && LANG_ORDER.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function interpolate(value: string, params?: Record<string, string | number>) {
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ""));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with "my" on both server and client to avoid SSR hydration
  // mismatch. The stored preference is applied right after mount.
  const [lang, setLangState] = useState<Lang>("my");

  useEffect(() => {
    const stored = readStoredLang();
    if (stored && stored !== lang) setLangState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
  }, [lang]);

  useEffect(() => {
    let mounted = true;

    const syncUserPreference = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const pref = data.user?.user_metadata?.preferred_language as Lang | undefined;
        if (mounted && pref && LANG_ORDER.includes(pref) && !localStorage.getItem(STORAGE_KEY)) {
          setLangState(pref);
        }
      } catch { /* noop */ }
    };

    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      const pref = session?.user?.user_metadata?.preferred_language as Lang | undefined;
      if (pref && LANG_ORDER.includes(pref) && !localStorage.getItem(STORAGE_KEY)) setLangState(pref);
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue && LANG_ORDER.includes(event.newValue as Lang)) {
        setLangState(event.newValue as Lang);
      }
    };

    syncUserPreference();
    window.addEventListener("storage", onStorage);

    return () => {
      mounted = false;
      authSub.subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    if (!LANG_ORDER.includes(l)) return;
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* noop */ }
    supabase.auth.updateUser({ data: { preferred_language: l } }).catch(() => { /* not signed in */ });
  }, []);

  const cycleLang = () => {
    const idx = LANG_ORDER.indexOf(lang);
    setLang(LANG_ORDER[(idx + 1) % LANG_ORDER.length]);
  };

  const t = useMemo<Translator>(() => {
    const fn = (k: string, inlineOrParams?: InlineDict | Record<string, string | number>): string => {
      if (inlineOrParams && "en" in inlineOrParams) {
        return (inlineOrParams as InlineDict)[lang] ?? (inlineOrParams as InlineDict).en ?? "";
      }
      const entry = (DICT as Record<string, Record<string, string>>)[k];
      const value = entry?.[lang] ?? entry?.en ?? "";
      return interpolate(value, inlineOrParams as Record<string, string | number> | undefined);
    };
    return fn as Translator;
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang, cycleLang, t }}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return useContext(LangContext);
}
