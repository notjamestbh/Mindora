// Default demo data for Mindora
// Patient: Amma (Lakshmi Baruah), Caregiver: Anu (Daughter), Region: North Eastern Region (NER)

export const initialPatient = {
  id: "patient_001",
  name: "Amma",
  fullName: "Lakshmi Baruah",
  age: 68,
  caregiver: "Anu",
  caregiverRelation: "Daughter",
  caregiverPhone: "+91 98765 43210",
  preferredLanguage: "en",
  region: "North Eastern Region (Assam)",
  culturalPreferences: [
    "Morning Tea & Sewali Flowers",
    "Namghar Prayer Bells",
    "Bihu Folk Melodies",
    "Traditional Loom & Gamosa",
    "Verandah Garden Walk"
  ],
  preferredActivityTime: "Morning (10:00 AM)",
  currentDifficulty: "medium",
  notes: "Responds warmly to familiar family faces and morning routine consistency. Prefers gentle pacing."
};

export const initialMemories = [
  // People
  {
    id: "mem_p1",
    type: "person",
    category: "people",
    name: "Anu",
    relation: "Daughter",
    description: "Visits every Sunday. Loves sharing morning tea on the verandah and tending the garden.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    hint: "Your daughter who visits on weekends",
    voiceProfile: "daughter",
    voicePitch: 1.15,
    voiceRate: 0.88,
    voiceGreeting: "Namaste Amma! It's Anu. I made some warm ginger tea for you and brought fresh tea leaves from the garden."
  },
  {
    id: "mem_p2",
    type: "person",
    category: "people",
    name: "Arun",
    relation: "Son",
    description: "Civil engineer living in Guwahati. Calls every evening at 6 PM to ask about your day.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    hint: "Your son who calls every evening",
    voiceProfile: "son",
    voicePitch: 0.85,
    voiceRate: 0.90,
    voiceGreeting: "Hello Amma, this is Arun calling from Guwahati! How was your morning walk today?"
  },
  {
    id: "mem_p3",
    type: "person",
    category: "people",
    name: "Maya",
    relation: "Granddaughter",
    description: "7 years old. Loves drawing colorful birds and listening to Amma's folk tales.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    hint: "Your 7-year-old granddaughter who loves drawing",
    voiceProfile: "grandchild",
    voicePitch: 1.35,
    voiceRate: 0.94,
    voiceGreeting: "Amma! It's Maya! Look at the colorful singing bird I drew for you today! Will you tell me a story?"
  },
  {
    id: "mem_p4",
    type: "person",
    category: "people",
    name: "Ravi",
    relation: "Husband",
    description: "Beloved companion of 45 years. Retired school headmaster who loved morning river walks.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    hint: "Your husband and lifelong companion",
    voiceProfile: "husband",
    voicePitch: 0.78,
    voiceRate: 0.84,
    voiceGreeting: "Good morning, Lakshmi. The breeze on the verandah is so calm and peaceful today."
  },

  // Places
  {
    id: "mem_pl1",
    type: "place",
    category: "places",
    name: "Family Home Verandah",
    relation: "Home",
    description: "The breezy front verandah overlooking the garden where three generations gather for tea.",
    avatarUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    hint: "Your peaceful front verandah"
  },
  {
    id: "mem_pl2",
    type: "place",
    category: "places",
    name: "Upper Assam Tea Hills",
    relation: "Birthplace",
    description: "The fragrant green rolling hills where Amma spent her childhood summers.",
    avatarUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
    hint: "The lush green tea gardens"
  },
  {
    id: "mem_pl3",
    type: "place",
    category: "places",
    name: "Local Namghar",
    relation: "Community",
    description: "The traditional prayer hall with the resonant brass bell and evening hymns.",
    avatarUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
    hint: "The peaceful neighborhood prayer hall"
  },

  // Things
  {
    id: "mem_t1",
    type: "thing",
    category: "things",
    name: "Bell-Metal Chai Cup",
    relation: "Daily Comfort",
    description: "Handcrafted traditional Kahi-Bati brass cup that keeps morning ginger tea warm.",
    avatarUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    hint: "Your favorite morning brass tea cup"
  },
  {
    id: "mem_t2",
    type: "thing",
    category: "things",
    name: "Vintage Valve Radio",
    relation: "Morning Routine",
    description: "Beloved wooden transistor radio tuned to All India Radio morning classical tunes.",
    avatarUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    hint: "Your wooden morning music radio"
  },
  {
    id: "mem_t3",
    type: "thing",
    category: "things",
    name: "Sewali Flowers",
    relation: "Garden",
    description: "Delicate orange-stemmed night-blooming jasmine picked from the courtyard tree.",
    avatarUrl: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80",
    hint: "Fresh white garden flowers"
  },

  // Moments
  {
    id: "mem_m1",
    type: "moment",
    category: "moments",
    name: "Rongali Bihu Gathering",
    relation: "Celebration",
    description: "Spring festival afternoon making rice pitha cakes with Anu and Maya dancing to folk rhythm.",
    avatarUrl: "https://images.unsplash.com/photo-1609137144822-263a2a900dc2?auto=format&fit=crop&w=600&q=80",
    hint: "Spring family festival celebration"
  },
  {
    id: "mem_m2",
    type: "moment",
    category: "moments",
    name: "Maya's 7th Birthday",
    relation: "Milestone",
    description: "Amma gifted Maya a handwoven red-bordered stole; Maya blew the candles and hugged Amma.",
    avatarUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
    hint: "Maya's happy birthday celebration"
  }
];

export const initialReminders = [
  {
    id: "rem_1",
    title: "Morning Warm Ginger Tea & Breakfast",
    time: "08:00 AM",
    category: "meal",
    completed: true,
    completedAt: "08:15 AM",
    notes: "Fresh fruit and rice porridge"
  },
  {
    id: "rem_2",
    title: "Morning Blood Pressure Medicine",
    time: "09:00 AM",
    category: "medication",
    completed: true,
    completedAt: "09:08 AM",
    notes: "Take with half glass warm water"
  },
  {
    id: "rem_3",
    title: "Mindora Memory Activity",
    time: "10:30 AM",
    category: "activity",
    completed: false,
    completedAt: null,
    notes: "Short enjoyable memory puzzle"
  },
  {
    id: "rem_4",
    title: "Nutritious Lunch & Quiet Rest",
    time: "12:30 PM",
    category: "meal",
    completed: false,
    completedAt: null,
    notes: "Steamed rice, lentils and mild seasonal greens"
  },
  {
    id: "rem_5",
    title: "Verandah Walk & Fresh Courtyard Air",
    time: "04:30 PM",
    category: "wellness",
    completed: false,
    completedAt: null,
    notes: "Gentle 15-minute stroll"
  },
  {
    id: "rem_6",
    title: "Evening Medicine & Warm Milk",
    time: "07:30 PM",
    category: "medication",
    completed: false,
    completedAt: null,
    notes: "Evening tablet after light supper"
  }
];

export const initialActivities = [
  {
    id: "act_01",
    type: "memory-match",
    name: "Memory Match",
    date: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 min ago today
    timeStr: "Today, 10:12 AM",
    accuracy: 100,
    responseTimeSec: 68,
    difficulty: "medium",
    moves: 9,
    matches: 4,
    notes: "Completed smoothly with steady confidence"
  },
  {
    id: "act_02",
    type: "who-is-this",
    name: "Who Is This?",
    date: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // Yesterday
    timeStr: "Yesterday, 10:45 AM",
    accuracy: 100,
    responseTimeSec: 32,
    difficulty: "medium",
    moves: 4,
    matches: 4,
    notes: "Recognized Anu and Maya immediately"
  },
  {
    id: "act_03",
    type: "pattern",
    name: "Pattern Recall",
    date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    timeStr: "Yesterday, 04:10 PM",
    accuracy: 75,
    responseTimeSec: 84,
    difficulty: "medium",
    moves: 4,
    matches: 3,
    notes: "Maintained good focus through 4-symbol sequence"
  },
  {
    id: "act_04",
    type: "routine",
    name: "What Comes Next?",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    timeStr: "2 days ago, 11:00 AM",
    accuracy: 100,
    responseTimeSec: 42,
    difficulty: "easy",
    moves: 3,
    matches: 3,
    notes: "Ordered morning sequence accurately"
  },
  {
    id: "act_05",
    type: "pair",
    name: "Find the Pair",
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    timeStr: "3 days ago, 10:20 AM",
    accuracy: 85,
    responseTimeSec: 60,
    difficulty: "medium",
    moves: 5,
    matches: 3,
    notes: "Paired tea cup and leaves without hesitation"
  }
];

// 7-day longitudinal activity data (not clinical diagnoses, but activity engagement metrics)
export const initialTrendData7d = [
  { day: "Mon", date: "Sep 2", memory: 72, attention: 68, recognition: 76, responseTimeSec: 84 },
  { day: "Tue", date: "Sep 3", memory: 75, attention: 70, recognition: 78, responseTimeSec: 78 },
  { day: "Wed", date: "Sep 4", memory: 74, attention: 72, recognition: 77, responseTimeSec: 74 },
  { day: "Thu", date: "Sep 5", memory: 79, attention: 71, recognition: 81, responseTimeSec: 71 },
  { day: "Fri", date: "Sep 6", memory: 81, attention: 74, recognition: 82, responseTimeSec: 68 },
  { day: "Sat", date: "Sep 7", memory: 78, attention: 75, recognition: 80, responseTimeSec: 69 },
  { day: "Sun", date: "Today", memory: 83, attention: 76, recognition: 85, responseTimeSec: 65 }
];

export const initialTrendData30d = [
  { day: "Week 1", memory: 71, attention: 67, recognition: 74, responseTimeSec: 88 },
  { day: "Week 2", memory: 73, attention: 69, recognition: 76, responseTimeSec: 81 },
  { day: "Week 3", memory: 77, attention: 72, recognition: 80, responseTimeSec: 73 },
  { day: "Week 4", memory: 80, attention: 75, recognition: 83, responseTimeSec: 68 }
];

export const initialAlerts = [
  {
    id: "alt_1",
    type: "observation",
    title: "Routine Timing Note",
    description: "Evening medicine reminder was completed 35 minutes later than usual yesterday.",
    timestamp: "Yesterday, 8:15 PM",
    read: false,
    severity: "low",
    actionLabel: "View Today",
    actionRoute: "/today"
  },
  {
    id: "alt_2",
    type: "positive",
    title: "Memory Engagement Steady",
    description: "Personal family recognition ('Who Is This?') was completed with 100% accuracy and calm pacing.",
    timestamp: "Yesterday, 10:50 AM",
    read: false,
    severity: "info",
    actionLabel: "View Activity",
    actionRoute: "/caregiver/activity"
  }
];

export const initialSettings = {
  textSize: "normal", // small, normal, large, xlarge
  soundEnabled: true,
  highContrast: false,
  language: "en",
  region: "NER",
  speechVoice: "default"
};
