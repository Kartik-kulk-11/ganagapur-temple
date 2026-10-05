/* ============================================================
   Shri Kshetra Ganagapur — site content
   Edit this file to update timings, sevas, places, festivals.
   ============================================================ */

const TEMPLE = {
  name: "Shri Kshetra Ganagapur",
  deity: "Shri Guru Dattatreya · Shri Nrusimha Saraswati",
  address: "Shri Dutta Nirguna Math, Ganagapura, Afzalpur Taluk, Kalaburagi District, Karnataka 585212",
  coords: [17.17885, 76.53466],
  // Placeholders — replace with the temple office's verified details before launch.
  phone: "+91-00000-00000",
  whatsapp: "910000000000",
  email: "office@example.org",
};

/* Daily schedule (approx. — changes on festivals, Purnima, Amavasya, crowded days).
   Times are 24h IST. `darshan:true` means general darshan is open during that window. */
const SCHEDULE = [
  { start: "02:30", end: "03:00", name: "Kakad Arati", desc: "Waking of the Guru with lamps and bhajans — the first darshan of the day.", darshan: true, icon: "🪔" },
  { start: "03:00", end: "05:00", name: "Morning Rituals", desc: "Snana, alankara and Panchamruta abhisheka of the Nirguna Padukas.", darshan: false, icon: "🌅" },
  { start: "05:00", end: "06:00", name: "Darshan", desc: "General darshan resumes.", darshan: true, icon: "🙏" },
  { start: "06:00", end: "06:30", name: "Guru Arati", desc: "Morning arati to Shri Nrusimha Saraswati.", darshan: true, icon: "🔔" },
  { start: "06:30", end: "11:30", name: "Puja · Abhisheka · Darshan", desc: "Devotee sevas, Rudrabhisheka and Guru Charitra parayana.", darshan: true, icon: "🌸" },
  { start: "11:30", end: "12:30", name: "Maha Mangalarati & Naivedya", desc: "Mid-day Maha Naivedya followed by Annadana (Mahaprasad).", darshan: true, icon: "🍚" },
  { start: "12:30", end: "14:30", name: "Temple Rest", desc: "Garbhagriha closed; Madhukari continues in the village.", darshan: false, icon: "🌿" },
  { start: "14:30", end: "19:30", name: "Darshan", desc: "Afternoon & evening general darshan.", darshan: true, icon: "🙏" },
  { start: "19:30", end: "20:15", name: "Evening Maha Mangalarati", desc: "Arati with Digambara bhajan; Palakhi on Thursdays.", darshan: true, icon: "🔥" },
  { start: "20:15", end: "21:00", name: "Darshan", desc: "Last darshan of the day.", darshan: true, icon: "🙏" },
  { start: "21:00", end: "21:30", name: "Shejarati", desc: "Night arati — the Guru is put to rest.", darshan: true, icon: "🌙" },
];

const SEVAS = [
  { id: "rudra", name: "Panchamruta Rudrabhisheka", price: 1100, dur: "45 min", time: "06:30 – 11:00", img: "assets/img/nirguna-paduka.jpg", desc: "Abhisheka of the Nirguna Padukas with milk, curd, ghee, honey and sugar while Rudra is chanted.", popular: true },
  { id: "suvarna", name: "Suvarna Paduka Pooja", price: 2100, dur: "30 min", time: "07:00 – 11:00", img: "assets/img/silver-shrine.jpg", desc: "Worship of the golden padukas of Shri Guru with archana and arati.", popular: true },
  { id: "maha", name: "Maha Pooja", price: 5001, dur: "1 hr", time: "07:00 – 10:30", img: "assets/img/garbhagriha-door.jpg", desc: "Complete shodashopachara pooja with abhisheka, alankara, naivedya and arati.", popular: true },
  { id: "keshar", name: "Keshar Lepan Paduka Pooja", price: 1501, dur: "30 min", time: "07:00 – 11:00", img: "assets/img/stone-deity.jpg", desc: "Anointing of the padukas with saffron paste — a cherished offering of Datta bhaktas." },
  { id: "parayan", name: "Shri Guru Charitra Parayan", price: 3001, dur: "7 days", time: "Saptaha", img: "assets/img/abhishek-hall.jpg", desc: "Seven-day recitation of all 53 adhyayas of Shri Guru Charitra by temple vaidikas in your name." },
  { id: "madhukari", name: "Madhukari Seva", price: 501, dur: "—", time: "11:00 – 13:00", img: "assets/img/horse-carriage.jpg", desc: "Sponsor the sacred bhiksha tradition — Shri Guru is believed to receive alms in Ganagapur at noon." },
  { id: "naivedya", name: "Maha Naivedya", price: 2501, dur: "—", time: "11:30", img: "assets/img/sabha-mandap.jpg", desc: "Offer the noon Maha Naivedya that is later distributed as Mahaprasad.", popular: true },
  { id: "palakhi", name: "Palakhi Seva", price: 2101, dur: "1 hr", time: "Thursdays · 20:00", img: "assets/img/gopuram-entrance.jpg", desc: "Sponsor the palanquin procession of Shri Guru around the temple prakara.", popular: true },
  { id: "nandadeep", name: "Nandadeep Seva", price: 1001, dur: "1 year", time: "Daily", img: "assets/img/sanctum-stone.jpg", desc: "Keep the eternal ghee lamp burning in the Garbhagriha for a full year." },
];

const DARSHAN_TYPES = [
  { id: "general", name: "General Darshan", price: 0, note: "Free · Standard queue" },
  { id: "special", name: "Special Darshan", price: 300, note: "Separate quick queue" },
  { id: "senior", name: "Senior Citizen (60+)", price: 0, note: "Assisted queue · ID required" },
  { id: "divyang", name: "Divyang Darshan", price: 0, note: "Wheelchair access · one attendant" },
  { id: "family", name: "Group / Family (6+)", price: 0, note: "Single slot for the group" },
];

const SLOTS = ["05:00", "07:00", "09:00", "10:30", "14:30", "16:00", "17:30", "20:15"];

/* Places — map coordinates are approximate; Directions open Google Maps by name. */
const PLACES = [
  { id: "math", cat: "temple", name: "Shri Dutta Nirguna Math (Main Temple)", lat: 17.17885, lng: 76.53466, img: "assets/img/gopuram-hero.jpg", desc: "The abode of Shri Nrusimha Saraswati, where the self-manifest Nirguna Padukas are worshipped. The guru stayed here for over two decades before leaving for Shri Shaila.", q: "Shri Dattatreya Temple Ganagapur" },
  { id: "sangam", cat: "temple", name: "Bhima – Amarja Sangam", lat: 17.16858, lng: 76.51587, img: "assets/img/sangam-2.jpg", desc: "The holy confluence about 2 km south-west of the math, where Shri Guru performed his daily anushthana. Devotees bathe here before darshan.", q: "Sangam Ganagapur" },
  { id: "audumbar", cat: "temple", name: "Ashwattha & Audumbar Tree", lat: 17.1689, lng: 76.5163, img: "assets/img/audumbar.jpg", desc: "The sacred Audumbar (fig) at the Sangam beneath which Shri Guru meditated; Datta is believed to reside in it.", q: "Sangameshwar Temple Ganagapur" },
  { id: "sangameshwar", cat: "temple", name: "Sangameshwar Temple", lat: 17.1683, lng: 76.5165, img: "assets/img/sangam-ghat.jpg", desc: "Ancient Shiva temple at the confluence, worshipped by Shri Guru during his stay.", q: "Sangameshwar Temple Ganagapur" },
  { id: "kalleshwar", cat: "temple", name: "Kalleshwar Temple", lat: 17.1772, lng: 76.5318, img: "assets/img/sanctum-corridor.jpg", desc: "Shiva temple on the bank of the Bhima, linked with Manmatha Teertha. Worship here is equated with Mahabaleshwar of Gokarna.", q: "Kalleshwar Temple Ganagapur" },
  { id: "hanuman", cat: "temple", name: "Hanuman Statue", lat: 17.181, lng: 76.53, img: "assets/img/hanuman.jpg", desc: "Towering image of Shri Anjaneya on the approach to the village — a favourite landmark for pilgrims.", q: "Hanuman statue Ganagapur" },
  { id: "bus", cat: "transport", name: "KSRTC Bus Stand", lat: 17.1796, lng: 76.5352, img: "assets/img/mahadwara.jpg", desc: "Right opposite the temple Mahadwara. Frequent buses from Kalaburagi, Afzalpur and Solapur.", q: "Ganagapur Bus Stand" },
  { id: "rail", cat: "transport", name: "Ganagapur Road Railway Station", lat: 17.34075, lng: 76.5895, img: "assets/img/station-train.jpg", desc: "On the Solapur–Wadi line, ~20 km from the temple. Udyan, Hussainsagar and other expresses halt here. Autos & buses to the temple.", q: "Ganagapur Road Railway Station" },
  { id: "parking", cat: "facility", name: "Pilgrim Parking", lat: 17.18, lng: 76.536, img: "assets/img/gopuram-street.jpg", desc: "Car and two-wheeler parking near the bus stand. Fills up early on Thursdays and Purnima.", q: "Parking Ganagapur temple" },
  { id: "stay", cat: "facility", name: "Bhakta Niwas & Dharmashalas", lat: 17.1782, lng: 76.5338, img: "assets/img/skyline.jpg", desc: "Temple and trust run rooms plus private lodges within walking distance of the math.", q: "Lodges Ganagapur" },
  { id: "annadan", cat: "facility", name: "Annadana Hall (Mahaprasad)", lat: 17.1786, lng: 76.5352, img: "assets/img/sabha-mandap.jpg", desc: "Free Mahaprasad served after the noon Maha Naivedya.", q: "Annadan Ganagapur" },
  { id: "phc", cat: "facility", name: "Primary Health Centre", lat: 17.1815, lng: 76.5365, img: "assets/img/skyline.jpg", desc: "Government health centre for first aid and emergencies. Nearest full hospital: Kalaburagi (~40 km).", q: "Primary Health Centre Ganagapur" },
];

const TEERTHAS = [
  { n: "Shatakula Teertha", m: "Bathing here equals a dip at the Triveni Sangam of Prayag." },
  { n: "Nrusimha Teertha", m: "Fulfils wishes; followed by worship of Sangameshwara." },
  { n: "Bhagirathi (Kashi) Teertha", m: "As holy as Manikarnika Kund at Kashi." },
  { n: "Papavinashini Teertha", m: "Washes away sins; site of the healing of Shri Guru's sister Ratnai." },
  { n: "Koti Teertha", m: "Equal to bathing in all the teerthas of Jambudweepa." },
  { n: "Rudrapada Teertha", m: "Rites for ancestors here equal those performed at Gaya." },
  { n: "Chakra Teertha", m: "Holier than a bath at Dwaraka; home of Keshava." },
  { n: "Manmatha Teertha", m: "With worship of Kalleshwara, equals Mahabaleshwar of Gokarna." },
];

/* 2026–27 festivals — dates are tentative; confirm with the temple Panchang. */
const FESTIVALS = [
  { date: "2026-10-11", end: "2026-10-20", name: "Sharad Navaratri & Vijayadashami", desc: "Nine nights of special alankara; Seemollanghan on Dasara.", crowd: "med" },
  { date: "2026-10-26", name: "Kojagiri (Ashwin) Purnima", desc: "Full-moon night — Sangam snana and palakhi.", crowd: "high" },
  { date: "2026-11-05", name: "Shri Guru Dwadashi", desc: "Day Shri Nrusimha Saraswati departed for Shri Shaila — one of Ganagapur's holiest days.", crowd: "high" },
  { date: "2026-11-08", name: "Deepavali", desc: "Lamps around the math, Lakshmi puja and special naivedya.", crowd: "med" },
  { date: "2026-11-24", name: "Kartika Purnima", desc: "Deepotsava at the Sangam.", crowd: "high" },
  { date: "2026-12-17", end: "2026-12-23", name: "Datta Jayanti Utsav", desc: "Week-long Guru Charitra saptaha culminating in Datta Janma at sunset on Margashirsha Purnima.", crowd: "high", big: true },
  { date: "2027-01-10", name: "Shri Nrusimha Saraswati Jayanti", desc: "Birth anniversary of Shri Guru (Paush Shuddha Dwitiya).", crowd: "high" },
  { date: "2027-02-20", name: "Magha Purnima Jatra", desc: "The great annual fair of Ganagapur — rathotsava and lakhs of pilgrims.", crowd: "high", big: true },
  { date: "2027-03-06", name: "Maha Shivaratri", desc: "All-night worship at Sangameshwar and Kalleshwar.", crowd: "med" },
];

const GALLERY = [
  { src: "assets/img/gopuram-hero.jpg", cap: "Rajagopuram of Shri Dutta Nirguna Math", tag: "temple" },
  { src: "assets/img/mahadwara.jpg", cap: "Shri Dutta Mahadwara — the welcome arch", tag: "temple" },
  { src: "assets/img/temple-gopuram-tall.jpg", cap: "Gopuram rising above the temple street", tag: "temple" },
  { src: "assets/img/garbhagriha-door.jpg", cap: "Door of the Garbhagriha", tag: "temple" },
  { src: "assets/img/silver-shrine.jpg", cap: "Silver-clad shrine of the Nirguna Padukas", tag: "temple" },
  { src: "assets/img/nirguna-paduka.jpg", cap: "Offerings at the Nirguna Padukas", tag: "temple" },
  { src: "assets/img/sanctum-stone.jpg", cap: "Black-stone vimana of the sanctum", tag: "temple" },
  { src: "assets/img/sanctum-corridor.jpg", cap: "Pradakshina corridor", tag: "temple" },
  { src: "assets/img/stone-deity.jpg", cap: "Stone image in a sanctum niche", tag: "temple" },
  { src: "assets/img/carved-pillar.jpg", cap: "Carved pillar smeared with sindoor", tag: "temple" },
  { src: "assets/img/inner-prakara.jpg", cap: "Inner prakara", tag: "temple" },
  { src: "assets/img/abhishek-hall.jpg", cap: "Abhishek Hall", tag: "temple" },
  { src: "assets/img/sabha-mandap.jpg", cap: "Devotees performing seva in the sabha mandapa", tag: "temple" },
  { src: "assets/img/audumbar.jpg", cap: "Sacred Audumbar enclosure", tag: "temple" },
  { src: "assets/img/gopuram-entrance.jpg", cap: "Temple entrance at dusk", tag: "temple" },
  { src: "assets/img/sangam-2.jpg", cap: "Bhima–Amarja Sangam in monsoon", tag: "sangam" },
  { src: "assets/img/sangam-1.jpg", cap: "Bathing ghat at the Sangam", tag: "sangam" },
  { src: "assets/img/sangam-3.jpg", cap: "The wide Bhima at the confluence", tag: "sangam" },
  { src: "assets/img/sangam-ghat.jpg", cap: "Sangam Kshetra and riverside shrines", tag: "sangam" },
  { src: "assets/img/sangam-offering.jpg", cap: "A floating offering at the Sangam", tag: "sangam" },
  { src: "assets/img/hanuman.jpg", cap: "Hanuman statue at Ganagapur", tag: "around" },
  { src: "assets/img/skyline.jpg", cap: "Ganagapura village skyline", tag: "around" },
  { src: "assets/img/gopuram-street.jpg", cap: "Temple street and bazaar", tag: "around" },
  { src: "assets/img/horse-carriage.jpg", cap: "A tonga waiting for pilgrims", tag: "around" },
  { src: "assets/img/station-train.jpg", cap: "Express arriving at Ganagapur Road", tag: "around" },
  { src: "assets/img/station-platform.jpg", cap: "Ganagapur Road railway station", tag: "around" },
];

const ROUTES = {
  bengaluru: { label: "Bengaluru", dist: "≈ 620 km", modes: [
    ["🚆", "Train", "Udyan Express (11302) and others halt at Ganagapur Road (GUR). ~12 hrs overnight. Take an auto/bus 20 km to the temple."],
    ["🚗", "Road", "NH 44 → Hyderabad Rd → Kalaburagi → Afzalpur Rd. ~11 hrs."],
    ["🚌", "Bus", "KSRTC overnight buses to Kalaburagi; frequent local buses to Ganagapur (1 hr)."] ] },
  kalaburagi: { label: "Kalaburagi", dist: "≈ 40 km", modes: [
    ["🚌", "Bus", "KSRTC buses every 20–30 minutes from Kalaburagi Central bus stand. ~1 hr."],
    ["🚗", "Road", "Kalaburagi → Afzalpur road → Ganagapur. ~50 min by car or taxi."],
    ["✈️", "Air", "Kalaburagi Airport (~52 km) has flights from Bengaluru and Hyderabad."] ] },
  hyderabad: { label: "Hyderabad", dist: "≈ 260 km", modes: [
    ["🚆", "Train", "Trains to Kalaburagi or Ganagapur Road via Wadi. ~5–6 hrs."],
    ["🚗", "Road", "NH 65/NH 50 via Zaheerabad → Humnabad → Kalaburagi. ~5 hrs."],
    ["🚌", "Bus", "TSRTC & KSRTC buses to Kalaburagi, then local bus."] ] },
  pune: { label: "Pune / Mumbai", dist: "≈ 350 / 500 km", modes: [
    ["🚆", "Train", "Udyan Express & Mumbai–Chennai line trains halt at Ganagapur Road via Solapur."],
    ["🚗", "Road", "NH 65 to Solapur → Akkalkot → Afzalpur → Ganagapur."],
    ["🚌", "Bus", "MSRTC buses from Pune/Solapur run directly to Ganagapur."] ] },
  solapur: { label: "Solapur / Akkalkot", dist: "≈ 100 / 60 km", modes: [
    ["🚌", "Bus", "Direct MSRTC/KSRTC buses — pilgrims often pair Ganagapur with Akkalkot Swami Samarth."],
    ["🚗", "Road", "Solapur → Akkalkot → Dudhani → Afzalpur → Ganagapur. ~2 hrs."],
    ["🚆", "Train", "Short hop from Solapur to Ganagapur Road (~1.5 hrs)."] ] },
};

const STAY = [
  { name: "Temple Bhakta Niwas", type: "Trust run", price: 400, feat: ["Non-AC", "Walk to temple", "Hot water"], img: "assets/img/skyline.jpg" },
  { name: "Dattatreya Dharmashala", type: "Dharmashala", price: 200, feat: ["Dormitory", "Common bath", "Budget"], img: "assets/img/gopuram-street.jpg" },
  { name: "Family AC Rooms", type: "Trust run", price: 1200, feat: ["AC", "4 beds", "Attached bath"], img: "assets/img/abhishek-hall.jpg" },
  { name: "Private Lodges", type: "Partner", price: 800, feat: ["AC / Non-AC", "Parking", "Near Sangam"], img: "assets/img/mahadwara.jpg" },
];

const AUDIO = [
  { t: "Digambara Digambara", s: "Shripad Vallabh Digambara — naama japa" },
  { t: "Kakad Arati", s: "Early morning arati of Ganagapur" },
  { t: "Shri Datta Stotra", s: "Jatadharam Pandurangam…" },
  { t: "Ghora Kashtoddharana Stotra", s: "by Shri Vasudevananda Saraswati" },
  { t: "Guru Charitra · Adhyaya 1", s: "Mangalacharana" },
  { t: "Karunatripadi", s: "Shanta ho Shri Guru Datta" },
];

const GC_CHAPTERS = [
  "Mangalacharana", "Siddha Muni meets Namdharak", "Ambarisha & Durvasa", "Datta Avatar — Anasuya", "Shripad Shrivallabh Avatar",
  "Gokarna Mahatmya", "Gokarna — Mitrasaha", "Shripad blesses the dull son", "Rajaka (washerman) blessed", "Vallabhesha saved from thieves",
  "Nrusimha Saraswati's birth", "Thread ceremony & renunciation", "Brahmin cured of colic", "Sayamdev saved", "Pilgrimage of teerthas",
  "Guru-bhakti — Dipaka", "Dull Brahmin becomes learned", "Glories of Bhuvaneshwari", "Audumbar & Yoginis", "Gangadhar's son revived",
];

/* Minimal i18n — key UI strings only. Add more keys as content is translated. */
const I18N = {
  en: { nav_darshan: "Darshan", nav_seva: "Seva", nav_timings: "Timings", nav_explore: "Explore", nav_stay: "Stay", nav_visit: "Visit", nav_gallery: "Gallery", hero_kicker: "Shri Kshetra Ganagapur", hero_title: "Shri Guru Dattatreya", hero_sub: "Abode of Shri Nrusimha Saraswati — where the Nirguna Padukas bless every devotee who comes with faith.", btn_darshan: "Book Darshan", btn_seva: "Book Seva", btn_plan: "Plan your Yatra", mantra: "Digambara Digambara Shripad Vallabha Digambara" },
  kn: { nav_darshan: "ದರ್ಶನ", nav_seva: "ಸೇವೆ", nav_timings: "ಸಮಯ", nav_explore: "ಕ್ಷೇತ್ರ", nav_stay: "ವಸತಿ", nav_visit: "ಪ್ರಯಾಣ", nav_gallery: "ಚಿತ್ರಗಳು", hero_kicker: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗಾಣಗಾಪುರ", hero_title: "ಶ್ರೀ ಗುರು ದತ್ತಾತ್ರೇಯ", hero_sub: "ಶ್ರೀ ನೃಸಿಂಹ ಸರಸ್ವತಿಯವರ ನೆಲೆ — ನಿರ್ಗುಣ ಪಾದುಕೆಗಳು ಭಕ್ತರನ್ನು ಹರಸುವ ಪುಣ್ಯಕ್ಷೇತ್ರ.", btn_darshan: "ದರ್ಶನ ಬುಕ್ ಮಾಡಿ", btn_seva: "ಸೇವೆ ಬುಕ್ ಮಾಡಿ", btn_plan: "ಯಾತ್ರೆ ಯೋಜಿಸಿ", mantra: "ದಿಗಂಬರಾ ದಿಗಂಬರಾ ಶ್ರೀಪಾದ ವಲ್ಲಭ ದಿಗಂಬರಾ" },
  mr: { nav_darshan: "दर्शन", nav_seva: "सेवा", nav_timings: "वेळा", nav_explore: "क्षेत्र", nav_stay: "निवास", nav_visit: "प्रवास", nav_gallery: "छायाचित्रे", hero_kicker: "श्री क्षेत्र गाणगापूर", hero_title: "श्री गुरु दत्तात्रेय", hero_sub: "श्री नृसिंह सरस्वतींचे निवासस्थान — जेथे निर्गुण पादुका प्रत्येक भक्ताला आशीर्वाद देतात.", btn_darshan: "दर्शन बुक करा", btn_seva: "सेवा बुक करा", btn_plan: "यात्रा नियोजन", mantra: "दिगंबरा दिगंबरा श्रीपाद वल्लभ दिगंबरा" },
  hi: { nav_darshan: "दर्शन", nav_seva: "सेवा", nav_timings: "समय", nav_explore: "क्षेत्र", nav_stay: "आवास", nav_visit: "यात्रा", nav_gallery: "गैलरी", hero_kicker: "श्री क्षेत्र गाणगापुर", hero_title: "श्री गुरु दत्तात्रेय", hero_sub: "श्री नृसिंह सरस्वती का धाम — जहाँ निर्गुण पादुकाएँ हर श्रद्धालु को आशीर्वाद देती हैं।", btn_darshan: "दर्शन बुक करें", btn_seva: "सेवा बुक करें", btn_plan: "यात्रा योजना", mantra: "दिगंबरा दिगंबरा श्रीपाद वल्लभ दिगंबरा" },
  te: { nav_darshan: "దర్శనం", nav_seva: "సేవ", nav_timings: "సమయాలు", nav_explore: "క్షేత్రం", nav_stay: "వసతి", nav_visit: "ప్రయాణం", nav_gallery: "చిత్రాలు", hero_kicker: "శ్రీ క్షేత్ర గాణగాపూర్", hero_title: "శ్రీ గురు దత్తాత్రేయ", hero_sub: "శ్రీ నృసింహ సరస్వతి నివాసం — నిర్గుణ పాదుకలు భక్తులను ఆశీర్వదించే పుణ్యక్షేత్రం.", btn_darshan: "దర్శనం బుక్ చేయండి", btn_seva: "సేవ బుక్ చేయండి", btn_plan: "యాత్ర ప్రణాళిక", mantra: "దిగంబరా దిగంబరా శ్రీపాద వల్లభ దిగంబరా" },
};

/* Knowledge base for the "Ask Guru Datta" assistant (keyword matched, official info only). */
const FAQ = [
  { k: ["kakad", "morning arati", "first arati", "open", "opening"], a: "Kakad Arati is at about 2:30 – 3:00 AM. The temple opens for the day at Brahmi Muhurta (~2:30 AM)." },
  { k: ["timing", "time", "schedule", "close", "closing", "today"], a: "Darshan is open roughly 2:30 AM – 12:30 PM and 2:30 PM – 9:30 PM, with Maha Mangalarati at 11:30 AM and 7:30 PM, and Shejarati at 9:00 PM. See the Timings section for today's live status." },
  { k: ["hyderabad"], a: "From Hyderabad (~260 km): train to Kalaburagi or Ganagapur Road via Wadi (5–6 hrs), or drive via Zaheerabad–Humnabad–Kalaburagi (~5 hrs)." },
  { k: ["bengaluru", "bangalore"], a: "From Bengaluru (~620 km): the Udyan Express halts at Ganagapur Road station (~20 km from the temple). Overnight KSRTC buses also run to Kalaburagi." },
  { k: ["pune", "mumbai", "solapur", "akkalkot"], a: "From Pune/Mumbai, go via Solapur. MSRTC runs direct buses to Ganagapur; trains halt at Ganagapur Road. Many pilgrims combine the trip with Akkalkot." },
  { k: ["reach", "how to", "train", "bus", "railway", "station"], a: "Nearest railway station: Ganagapur Road (~20 km). Bus stand: right opposite the temple. Nearest city: Kalaburagi (~40 km) with buses every 20–30 minutes." },
  { k: ["madhukari", "bhiksha", "alms"], a: "Madhukari is the tradition of seeking alms (bhiksha) in Ganagapur at noon. It is believed Shri Guru still visits homes in disguise to accept bhiksha. You can also sponsor Madhukari Seva online." },
  { k: ["sangam", "river", "confluence", "bath"], a: "The Bhima–Amarja Sangam is about 2 km south-west of the main temple. Devotees bathe here first, worship at Sangameshwar and the Audumbar tree, then go for darshan." },
  { k: ["teertha", "tirtha", "ashta"], a: "The Ashta Teerthas are: Shatakula, Nrusimha, Bhagirathi, Papavinashini, Koti, Rudrapada, Chakra and Manmatha. See the Explore section for their significance." },
  { k: ["seva", "pooja", "puja", "abhishek"], a: "Popular sevas: Panchamruta Rudrabhisheka, Suvarna Paduka Pooja, Maha Pooja, Keshar Lepan, Guru Charitra Parayan, Maha Naivedya, Palakhi and Nandadeep. Tap 'Book Seva' to choose one." },
  { k: ["stay", "room", "accommodation", "lodge", "hotel"], a: "Temple Bhakta Niwas, dharmashalas and private lodges are all within walking distance. Book early for Thursdays, Purnima and Datta Jayanti." },
  { k: ["prasad", "annadan", "food", "lunch", "meal"], a: "Free Mahaprasad (Annadana) is served after the noon Maha Naivedya, around 12:00 – 2:00 PM. You can sponsor Annadana from ₹501." },
  { k: ["thursday", "crowd", "rush", "best time"], a: "Thursdays, Purnima, Amavasya and festivals are the busiest. Weekday afternoons (2:30 – 5:00 PM) are usually the calmest." },
  { k: ["dress", "rule", "phone", "camera"], a: "Traditional attire is recommended. Mobile phones and photography are not allowed inside the Garbhagriha. Please follow the instructions of temple staff." },
  { k: ["nrusimha", "narasimha", "guru", "history", "who"], a: "Shri Nrusimha Saraswati (1378–1459), the second incarnation of Dattatreya in Kali Yuga after Shripad Shrivallabh, lived at Ganagapur for about 23 years. Before leaving for Shri Shaila he installed the Nirguna Padukas, promising to remain here eternally." },
  { k: ["guru charitra", "gurucharitra", "charitra"], a: "Shri Guru Charitra, written by Saraswati Gangadhar, narrates the lives of Shripad Shrivallabh and Shri Nrusimha Saraswati in 53 chapters. Read it in the Guru Charitra section." },
  { k: ["datta jayanti", "festival", "jayanti", "utsav"], a: "Major festivals: Datta Jayanti (Margashirsha Purnima), Shri Guru Dwadashi, Nrusimha Saraswati Jayanti, Magha Purnima Jatra and Guru Purnima. See the Festival calendar." },
];
