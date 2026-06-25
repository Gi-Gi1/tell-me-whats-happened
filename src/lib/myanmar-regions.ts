// Comprehensive Myanmar States & Regions with all official townships.
// Source: Myanmar General Administration Department township list.

export const MYANMAR_REGIONS: Record<string, string[]> = {
  Kachin: [
    "Myitkyina", "Waingmaw", "Injangyang", "Tanai", "Chipwi", "Tsawlaw",
    "Hpakant", "Mogaung", "Mohnyin", "Bhamo", "Shwegu", "Momauk",
    "Mansi", "Putao", "Sumprabum", "Machanbaw", "Nawngmun", "Khaunglanhpu",
  ],
  Kayah: [
    "Loikaw", "Demoso", "Hpruso", "Shadaw", "Bawlake", "Hpasawng", "Mese",
  ],
  Kayin: [
    "Hpa-an", "Hlaingbwe", "Hpapun", "Thandaunggyi", "Myawaddy", "Kawkareik",
    "Kyainseikgyi",
  ],
  Chin: [
    "Hakha", "Thantlang", "Falam", "Tedim", "Tonzang", "Mindat", "Matupi",
    "Kanpetlet", "Paletwa",
  ],
  Sagaing: [
    "Sagaing", "Myinmu", "Myaung", "Ayadaw", "Monywa", "Budalin", "Salingyi",
    "Yinmabin", "Pale", "Kani", "Shwebo", "Khin-U", "Wetlet", "Kyaukmyaung",
    "Kanbalu", "Ye-U", "Tabayin", "Taze", "Dabayin",
    "Katha", "Indaw", "Tigyaing", "Wuntho", "Pinlebu", "Banmauk",
    "Kawlin", "Kyunhla", "Mawlaik", "Kalewa", "Mingin", "Kalay", "Tamu",
    "Hkamti", "Homalin", "Lahe", "Layshi", "Nanyun", "Paungbyin", "Pinlon",
    "Pyinoolwin", // Pinlebu duplicate guarded by unique key in UI
  ],
  Tanintharyi: [
    "Dawei", "Launglon", "Thayetchaung", "Yebyu", "Myeik", "Kyunsu",
    "Palaw", "Tanintharyi", "Kawthaung", "Bokpyin",
  ],
  Bago: [
    "Bago", "Thanatpin", "Kawa", "Waw", "Nyaunglebin", "Kyauktaga",
    "Daik-U", "Shwegyin", "Taungoo", "Yedashe", "Oktwin", "Htantabin",
    "Phyu", "Kyaukkyi",
    "Pyay", "Paungde", "Padaung", "Paukkhaung", "Shwedaung", "Thegon",
    "Tharrawaddy", "Letpadan", "Minhla", "Okpho", "Gyobingauk", "Zigon",
    "Nattalin", "Monyo",
  ],
  Magway: [
    "Magway", "Yenangyaung", "Chauk", "Taungdwingyi", "Myothit", "Natmauk",
    "Minbu", "Pwintbyu", "Ngape", "Salin", "Sidoktaya",
    "Thayet", "Aunglan", "Kamma", "Mindon", "Sinbaungwe", "Minhla",
    "Pakokku", "Yesagyo", "Myaing", "Pauk", "Seikphyu",
    "Gangaw", "Saw", "Tilin", "Htilin",
  ],
  Mandalay: [
    "Aungmyethazan", "Chanayethazan", "Chanmyathazi", "Mahaaungmye",
    "Pyigyitagon", "Amarapura", "Patheingyi",
    "Kyaukse", "Sintgaing", "Myittha", "Tada-U",
    "Nyaung-U", "Kyaukpadaung",
    "Myingyan", "Taungtha", "Natogyi", "Kyaukpadaung",
    "Meiktila", "Mahlaing", "Thazi", "Wundwin",
    "Yamethin", "Pyawbwe",
    "Pyin Oo Lwin", "Madaya", "Mogok", "Singu", "Thabeikkyin",
  ],
  Yangon: [
    "Ahlone", "Bahan", "Botahtaung", "Dagon", "Dawbon", "Hlaing",
    "Insein", "Kamayut", "Kyauktada", "Kyimyindaing", "Lanmadaw",
    "Latha", "Mayangone", "Mingala Taungnyunt", "North Okkalapa",
    "Pabedan", "Pazundaung", "Sanchaung", "Seikkan", "South Okkalapa",
    "Tamwe", "Thingangyun", "Yankin",
    "Dagon Seikkan", "East Dagon", "North Dagon", "South Dagon",
    "Dala", "Seikkyi Kanaungto", "Thaketa", "Thanlyin", "Kyauktan",
    "Thongwa", "Kayan", "Kawhmu", "Kungyangon", "Twante",
    "Hlegu", "Hmawbi", "Htantabin", "Taikkyi", "Hlaingthaya",
    "Mingaladon", "Shwepyithar",
  ],
  Shan: [
    "Taunggyi", "Nyaungshwe", "Hopong", "Hsihseng", "Kalaw", "Pindaya",
    "Ywangan", "Pinlaung", "Pekon", "Lawksawk", "Loilen", "Laihka",
    "Kunhing", "Kyethi", "Mongkaing", "Mongnai", "Mongpan", "Langkho",
    "Mongton", "Mawkmai", "Linkhay",
    "Lashio", "Hsenwi", "Hseni", "Mongyai", "Tangyan", "Hsipaw", "Namtu",
    "Namhsan", "Kyaukme", "Nawnghkio", "Kutkai", "Muse", "Namhkam",
    "Kunlong", "Laukkaing", "Konkyan", "Hopang", "Mongmao", "Pangwaun",
    "Pangsang", "Narphan",
    "Kengtung", "Mongkhet", "Mongla", "Mongping", "Mongyang", "Monghsat",
    "Monghpyak", "Mongton", "Tachileik",
  ],
  Ayeyarwady: [
    "Pathein", "Kangyidaunt", "Thabaung", "Yegyi", "Kyonpyaw", "Kyaunggon",
    "Ngapudaw",
    "Hinthada", "Zalun", "Lemyethna", "Myanaung", "Ingapu", "Kyangin",
    "Myaungmya", "Einme", "Wakema",
    "Maubin", "Pantanaw", "Nyaungdon", "Danubyu",
    "Pyapon", "Bogale", "Kyaiklat", "Dedaye",
    "Labutta", "Mawlamyinegyun",
  ],
  Mon: [
    "Mawlamyine", "Mudon", "Thanbyuzayat", "Kyaikmaraw", "Chaungzon",
    "Ye", "Thaton", "Paung", "Kyaikto", "Bilin",
  ],
  Rakhine: [
    "Sittwe", "Ponnagyun", "Pauktaw", "Myebon", "Mrauk-U", "Minbya",
    "Kyauktaw", "Kyaukpyu", "Manaung", "Ramree", "Ann", "Thandwe",
    "Toungup", "Gwa", "Maungdaw", "Buthidaung", "Rathedaung",
  ],
  Naypyidaw: [
    "Zabuthiri", "Dekkhinathiri", "Ottarathiri", "Pobbathiri", "Zeyathiri",
    "Pyinmana", "Lewe", "Tatkon",
  ],
};

// De-duplicate while preserving order (some townships exist in multiple districts).
for (const k of Object.keys(MYANMAR_REGIONS)) {
  MYANMAR_REGIONS[k] = Array.from(new Set(MYANMAR_REGIONS[k]));
}

export const REGION_NAMES = Object.keys(MYANMAR_REGIONS);

export const CROP_UNITS = ["kg", "ton", "basket", "viss"] as const;
export type CropUnit = (typeof CROP_UNITS)[number];

// Myanmar (Unicode) display names — used for UI labels while DB values stay in English.
export const REGION_LABEL_MY: Record<string, string> = {
  Yangon: "ရန်ကုန်တိုင်းဒေသကြီး",
  Mandalay: "မန္တလေးတိုင်းဒေသကြီး",
  Naypyidaw: "နေပြည်တော်",
  Sagaing: "စစ်ကိုင်းတိုင်းဒေသကြီး",
  Bago: "ပဲခူးတိုင်းဒေသကြီး",
  Magway: "မကွေးတိုင်းဒေသကြီး",
  Ayeyarwady: "ဧရာဝတီတိုင်းဒေသကြီး",
  Tanintharyi: "တနင်္သာရီတိုင်းဒေသကြီး",
  Shan: "ရှမ်းပြည်နယ်",
  Kachin: "ကချင်ပြည်နယ်",
  Kayah: "ကယားပြည်နယ်",
  Kayin: "ကရင်ပြည်နယ်",
  Chin: "ချင်းပြည်နယ်",
  Mon: "မွန်ပြည်နယ်",
  Rakhine: "ရခိုင်ပြည်နယ်",
};

// Comprehensive Myanmar (Unicode) township labels covering every entry in
// MYANMAR_REGIONS. Storage values remain English so DB rows stay stable;
// these labels render in the UI when the active language is Myanmar.
export const TOWNSHIP_LABEL_MY: Record<string, string> = {
  // Kachin
  Myitkyina: "မြစ်ကြီးနား", Waingmaw: "ဝိုင်းမော်", Injangyang: "အင်ဂျန်းယန်",
  Tanai: "တနိုင်း", Chipwi: "ချီဖွေ", Tsawlaw: "ဆော့လော်", Hpakant: "ဖားကန့်",
  Mogaung: "မိုးကောင်း", Mohnyin: "မိုးညှင်း", Bhamo: "ဗန်းမော်", Shwegu: "ရွှေကူ",
  Momauk: "မိုးမောက်", Mansi: "မံစီ", Putao: "ပူတာအို", Sumprabum: "ဆွမ်ပရာဘွမ်",
  Machanbaw: "မချမ်းဘော", Nawngmun: "နောင်မွန်း", Khaunglanhpu: "ခေါင်လန်ဖူး",
  // Kayah
  Loikaw: "လွိုင်ကော်", Demoso: "ဒီးမော့ဆို", Hpruso: "ဖရူဆို", Shadaw: "ရှားတော",
  Bawlake: "ဘောလခဲ", Hpasawng: "ဖားဆောင်း", Mese: "မယ်စဲ့",
  // Kayin
  "Hpa-an": "ဘားအံ", Hlaingbwe: "လှိုင်းဘွဲ့", Hpapun: "ဖာပွန်",
  Thandaunggyi: "သံတောင်ကြီး", Myawaddy: "မြဝတီ", Kawkareik: "ကော့ကရိတ်",
  Kyainseikgyi: "ကြာအင်းဆိပ်ကြီး",
  // Chin
  Hakha: "ဟားခါး", Thantlang: "ထန်တလန်", Falam: "ဖလမ်း", Tedim: "တီးတိန်",
  Tonzang: "တွန်းဇံ", Mindat: "မင်းတပ်", Matupi: "မတူပီ", Kanpetlet: "ကန်ပက်လက်",
  Paletwa: "ပလက်ဝ",
  // Sagaing
  Sagaing: "စစ်ကိုင်း", Myinmu: "မြင်းမူ", Myaung: "မြောင်", Ayadaw: "အရာတော်",
  Monywa: "မုံရွာ", Budalin: "ဘုတလင်", Salingyi: "ဆားလင်းကြီး", Yinmabin: "ယင်းမာပင်",
  Pale: "ပုလဲ", Kani: "ကနီ", Shwebo: "ရွှေဘို", "Khin-U": "ခင်ဦး", Wetlet: "ဝက်လက်",
  Kyaukmyaung: "ကျောက်မြောင်း", Kanbalu: "ကံဘလူ", "Ye-U": "ရေဦး", Tabayin: "တဘယင်း",
  Taze: "တန့်ဆည်", Dabayin: "ဒီပဲယင်း", Katha: "ကသာ", Indaw: "အင်းတော်",
  Tigyaing: "တိဂျိုင်း", Wuntho: "ဝန်းသို", Pinlebu: "ပင်လယ်ဘူး", Banmauk: "ဘန်းမောက်",
  Kawlin: "ကောလင်း", Kyunhla: "ကျွန်းလှ", Mawlaik: "မော်လိုက်", Kalewa: "ကလေးဝ",
  Mingin: "မင်းကင်း", Kalay: "ကလေး", Tamu: "တမူး", Hkamti: "ခန္တီး",
  Homalin: "ဟုမ္မလင်း", Lahe: "လဟယ်", Layshi: "လေရှီး", Nanyun: "နန်းယွန်း",
  Paungbyin: "ပေါင်းပြင်", Pinlon: "ပင်လုံ", Pyinoolwin: "ပြင်ဦးလွင်",
  // Tanintharyi
  Dawei: "ထားဝယ်", Launglon: "လောင်းလုံ", Thayetchaung: "သရက်ချောင်း",
  Yebyu: "ရေဖြူ", Myeik: "မြိတ်", Kyunsu: "ကျွန်းစု", Palaw: "ပုလော",
  Tanintharyi: "တနင်္သာရီ", Kawthaung: "ကော့သောင်း", Bokpyin: "ဘုတ်ပြင်း",
  // Bago
  Bago: "ပဲခူး", Thanatpin: "သနပ်ပင်", Kawa: "ကဝ", Waw: "ဝေါ", Nyaunglebin: "ညောင်လေးပင်",
  Kyauktaga: "ကျောက်တံခါး", "Daik-U": "ဒိုက်ဦး", Shwegyin: "ရွှေကျင်",
  Taungoo: "တောင်ငူ", Yedashe: "ရေတာရှည်", Oktwin: "အုတ်တွင်း", Htantabin: "ထန်းတပင်",
  Phyu: "ဖြူး", Kyaukkyi: "ကျောက်ကြီး", Pyay: "ပြည်", Paungde: "ပေါင်းတည်",
  Padaung: "ပန်းတောင်း", Paukkhaung: "ပေါက်ခေါင်း", Shwedaung: "ရွှေတောင်",
  Thegon: "သဲကုန်း", Tharrawaddy: "သာယာဝတီ", Letpadan: "လက်ပံတန်း", Minhla: "မင်းလှ",
  Okpho: "အုတ်ဖို", Gyobingauk: "ကြို့ပင်ကောက်", Zigon: "ဇီးကုန်း", Nattalin: "နတ်တလင်း",
  Monyo: "မိုးညို",
  // Magway
  Magway: "မကွေး", Yenangyaung: "ရေနံချောင်း", Chauk: "ချောက်", Taungdwingyi: "တောင်တွင်းကြီး",
  Myothit: "မြို့သစ်", Natmauk: "နတ်မောက်", Minbu: "မင်းဘူး", Pwintbyu: "ပွင့်ဖြူ",
  Ngape: "ငဖဲ", Salin: "ဆလင်", Sidoktaya: "စဒုံတရာ", Thayet: "သရက်",
  Aunglan: "အောင်လံ", Kamma: "ကံမ", Mindon: "မင်းတုန်း", Sinbaungwe: "ဆင်ပေါင်ဝဲ",
  Pakokku: "ပခုက္ကူ", Yesagyo: "ရေစကြို", Myaing: "မြိုင်", Pauk: "ပေါက်",
  Seikphyu: "ဆိပ်ဖြူ", Gangaw: "ဂန့်ဂေါ", Saw: "ဆော", Tilin: "ထီးလင်း", Htilin: "ထီးလင်း",
  // Mandalay
  Aungmyethazan: "အောင်မြေသာစံ", Chanayethazan: "ချမ်းအေးသာဇံ",
  Chanmyathazi: "ချမ်းမြသာစည်", Mahaaungmye: "မဟာအောင်မြေ", Pyigyitagon: "ပြည်ကြီးတံခွန်",
  Amarapura: "အမရပူရ", Patheingyi: "ပုသိမ်ကြီး", Kyaukse: "ကျောက်ဆည်",
  Sintgaing: "စဉ့်ကိုင်း", Myittha: "မြစ်သား", "Tada-U": "တံတားဦး",
  "Nyaung-U": "ညောင်ဦး", Kyaukpadaung: "ကျောက်ပန်းတောင်း", Myingyan: "မြင်းခြံ",
  Taungtha: "တောင်သာ", Natogyi: "နတ်တော်ကြီး", Meiktila: "မိတ္ထီလာ",
  Mahlaing: "မလှိုင်", Thazi: "သာစည်", Wundwin: "ဝမ်းတွင်း", Yamethin: "ရမည်းသင်း",
  Pyawbwe: "ပျော်ဘွယ်", "Pyin Oo Lwin": "ပြင်ဦးလွင်", Madaya: "မတ္တရာ",
  Mogok: "မိုးကုတ်", Singu: "စဉ့်ကူ", Thabeikkyin: "သပိတ်ကျင်း",
  // Yangon
  Ahlone: "အလုံ", Bahan: "ဗဟန်း", Botahtaung: "ဗိုလ်တထောင်", Dagon: "ဒဂုံ",
  Dawbon: "ဒေါပုံ", Hlaing: "လှိုင်", Insein: "အင်းစိန်", Kamayut: "ကမာရွတ်",
  Kyauktada: "ကျောက်တံတား", Kyimyindaing: "ကြည့်မြင်တိုင်", Lanmadaw: "လမ်းမတော်",
  Latha: "လသာ", Mayangone: "မရမ်းကုန်း", "Mingala Taungnyunt": "မင်္ဂလာတောင်ညွန့်",
  "North Okkalapa": "မြောက်ဥက္ကလာပ", Pabedan: "ပန်းဘဲတန်း", Pazundaung: "ပုဇွန်တောင်",
  Sanchaung: "စမ်းချောင်း", Seikkan: "ဆိပ်ကမ်း", "South Okkalapa": "တောင်ဥက္ကလာပ",
  Tamwe: "တာမွေ", Thingangyun: "သင်္ဃန်းကျွန်း", Yankin: "ရန်ကင်း",
  "Dagon Seikkan": "ဒဂုံဆိပ်ကမ်း", "East Dagon": "ဒဂုံအရှေ့ပိုင်း",
  "North Dagon": "ဒဂုံမြောက်ပိုင်း", "South Dagon": "ဒဂုံတောင်ပိုင်း",
  Dala: "ဒလ", "Seikkyi Kanaungto": "ဆိပ်ကြီးခနောင်တို", Thaketa: "သာကေတ",
  Thanlyin: "သန်လျင်", Kyauktan: "ကျောက်တန်း", Thongwa: "သုံးခွ", Kayan: "ကရံ",
  Kawhmu: "ကော့မှူး", Kungyangon: "ကွမ်းခြံကုန်း", Twante: "တွံတေး",
  Hlegu: "လှည်းကူး", Hmawbi: "မှော်ဘီ", Taikkyi: "တိုက်ကြီး",
  Hlaingthaya: "လှိုင်သာယာ", Mingaladon: "မင်္ဂလာဒုံ", Shwepyithar: "ရွှေပြည်သာ",
  // Shan
  Taunggyi: "တောင်ကြီး", Nyaungshwe: "ညောင်ရွှေ", Hopong: "ဟိုပုံး", Hsihseng: "ဆီဆိုင်",
  Kalaw: "ကလော", Pindaya: "ပင်းတယ", Ywangan: "ရွာငံ", Pinlaung: "ပင်လောင်း",
  Pekon: "ဖယ်ခုံ", Lawksawk: "ရပ်စောက်", Loilen: "လွိုင်လင်", Laihka: "လဲချား",
  Kunhing: "ကွန်ဟိန်း", Kyethi: "ကျေးသီး", Mongkaing: "မိုင်းကိုင်", Mongnai: "မိုင်းနဲ",
  Mongpan: "မိုင်းပန်", Langkho: "လင်းခေး", Mongton: "မိုင်းတုံ", Mawkmai: "မောက်မယ်",
  Linkhay: "လင်းခေး", Lashio: "လားရှိုး", Hsenwi: "သိန္နီ", Hseni: "သိန္နီ",
  Mongyai: "မိုင်းရယ်", Tangyan: "တန့်ယန်း", Hsipaw: "သီပေါ", Namtu: "နမ့်ဆန်",
  Namhsan: "နမ့်ဆန်", Kyaukme: "ကျောက်မဲ", Nawnghkio: "နောင်ချို", Kutkai: "ကွတ်ခိုင်",
  Muse: "မူဆယ်", Namhkam: "နမ့်ခမ်း", Kunlong: "ကွမ်းလုံ", Laukkaing: "လောက်ကိုင်",
  Konkyan: "ကုန်းကြမ်း", Hopang: "ဟိုပန်", Mongmao: "မိုင်းမော", Pangwaun: "ပန်ဝန်",
  Pangsang: "ပန်ဆန်း", Narphan: "နားဖန်း", Kengtung: "ကျိုင်းတုံ",
  Mongkhet: "မိုင်းခတ်", Mongla: "မိုင်းလား", Mongping: "မိုင်းပျဉ်း",
  Mongyang: "မိုင်းယန်း", Monghsat: "မိုင်းဆတ်", Monghpyak: "မိုင်းဖြတ်",
  Tachileik: "တာချီလိတ်",
  // Ayeyarwady
  Pathein: "ပုသိမ်", Kangyidaunt: "ကန်ကြီးထောင့်", Thabaung: "သာပေါင်း",
  Yegyi: "ရေကြည်", Kyonpyaw: "ကျုံပျော်", Kyaunggon: "ကျောင်းကုန်း",
  Ngapudaw: "ငပုတော", Hinthada: "ဟင်္သာတ", Zalun: "ဇလွန်", Lemyethna: "လေးမျက်နှာ",
  Myanaung: "မြန်အောင်", Ingapu: "အင်္ဂပူ", Kyangin: "ကြံခင်း", Myaungmya: "မြောင်းမြ",
  Einme: "အိမ်မဲ", Wakema: "ဝါးခယ်မ", Maubin: "မအူပင်", Pantanaw: "ပန်းတနော်",
  Nyaungdon: "ညောင်တုန်း", Danubyu: "ဓနုဖြူ", Pyapon: "ဖျာပုံ", Bogale: "ဘိုကလေး",
  Kyaiklat: "ကျိုက်လတ်", Dedaye: "ဒေးဒရဲ", Labutta: "လပွတ္တာ",
  Mawlamyinegyun: "မော်လမြိုင်ကျွန်း",
  // Mon
  Mawlamyine: "မော်လမြိုင်", Mudon: "မုဒုံ", Thanbyuzayat: "သံဖြူဇရပ်",
  Kyaikmaraw: "ကျိုက်မရော", Chaungzon: "ချောင်းဆုံ", Ye: "ရေး", Thaton: "သထုံ",
  Paung: "ပေါင်", Kyaikto: "ကျိုက်ထို", Bilin: "ဘီးလင်း",
  // Rakhine
  Sittwe: "စစ်တွေ", Ponnagyun: "ပုဏ္ဏားကျွန်း", Pauktaw: "ပေါက်တော", Myebon: "မြေပုံ",
  "Mrauk-U": "မြောက်ဦး", Minbya: "မင်းပြား", Kyauktaw: "ကျောက်တော်",
  Kyaukpyu: "ကျောက်ဖြူ", Manaung: "မာန်အောင်", Ramree: "ရမ်းဗြဲ", Ann: "အမ်း",
  Thandwe: "သံတွဲ", Toungup: "တောင်ကုတ်", Gwa: "ဂွ", Maungdaw: "မောင်တော",
  Buthidaung: "ဘူးသီးတောင်", Rathedaung: "ရသေ့တောင်",
  // Naypyidaw
  Zabuthiri: "ဇဗ္ဗူသီရိ", Dekkhinathiri: "ဒက္ခိဏသီရိ", Ottarathiri: "ဥတ္တရသီရိ",
  Pobbathiri: "ပုဗ္ဗသီရိ", Zeyathiri: "ဇေယျာသီရိ", Pyinmana: "ပျဉ်းမနား",
  Lewe: "လယ်ဝေး", Tatkon: "တပ်ကုန်း",
};

export const UNIT_LABEL_MY: Record<(typeof CROP_UNITS)[number], string> = {
  kg: "ကီလိုဂရမ်",
  ton: "တန်",
  basket: "တင်း",
  viss: "ပိဿာ",
};
