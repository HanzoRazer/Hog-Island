// Mock data for Hog Island game - Expanded Weapons & Ballistics

// Weapons organized by caliber with realistic ballistic properties
export const WEAPONS = {
  // .22 Caliber - Light, minimal recoil, short range
  rifle_22lr: {
    id: 'rifle_22lr',
    name: '.22 Long Rifle',
    caliber: '.22 LR',
    category: 'rimfire',
    damage: 25,
    accuracy: 0.98,
    reloadTime: 1500,
    magazineSize: 10,
    muzzleVelocity: 1200, // fps
    effectiveRange: 150, // yards
    maxRange: 300,
    recoil: 0.1,
    bulletDrop: { // inches of drop at each yardage
      25: 0, 50: 0.5, 100: 3, 150: 8, 200: 18, 300: 45, 500: 150, 750: 400, 1000: 800
    },
    description: 'Perfect for beginners. Low recoil, accurate at short range.',
    unlockLevel: 1
  },
  rifle_22mag: {
    id: 'rifle_22mag',
    name: '.22 Magnum',
    caliber: '.22 WMR',
    category: 'rimfire',
    damage: 35,
    accuracy: 0.96,
    reloadTime: 1500,
    magazineSize: 10,
    muzzleVelocity: 2000,
    effectiveRange: 200,
    maxRange: 400,
    recoil: 0.15,
    bulletDrop: {
      25: 0, 50: 0.3, 100: 2, 150: 5, 200: 12, 300: 32, 500: 110, 750: 300, 1000: 600
    },
    description: 'More punch than .22 LR with flatter trajectory.',
    unlockLevel: 1
  },

  // .223/5.56 - Varmint & tactical
  rifle_223swift: {
    id: 'rifle_223swift',
    name: '.223 Swift',
    caliber: '.223 Rem',
    category: 'centerfire',
    damage: 55,
    accuracy: 0.95,
    reloadTime: 2000,
    magazineSize: 5,
    muzzleVelocity: 3200,
    effectiveRange: 400,
    maxRange: 600,
    recoil: 0.25,
    bulletDrop: {
      25: 0, 50: 0.1, 100: 0.5, 150: 1.5, 200: 3, 300: 8, 500: 28, 750: 75, 1000: 160
    },
    description: 'Fast, flat-shooting varmint rifle. Excellent accuracy.',
    unlockLevel: 2
  },
  rifle_nato_ar: {
    id: 'rifle_nato_ar',
    name: 'NATO AR-15 Style',
    caliber: '5.56 NATO',
    category: 'tactical',
    damage: 60,
    accuracy: 0.93,
    reloadTime: 1800,
    magazineSize: 30,
    muzzleVelocity: 3100,
    effectiveRange: 500,
    maxRange: 700,
    recoil: 0.3,
    bulletDrop: {
      25: 0, 50: 0.1, 100: 0.8, 150: 2, 200: 4, 300: 10, 500: 32, 750: 85, 1000: 180
    },
    description: 'Standard military rifle. High capacity, moderate recoil.',
    unlockLevel: 2
  },

  // 7.62 - AK style
  rifle_ak47: {
    id: 'rifle_ak47',
    name: 'AK-47 Style 7.62',
    caliber: '7.62x39mm',
    category: 'tactical',
    damage: 75,
    accuracy: 0.88,
    reloadTime: 2200,
    magazineSize: 30,
    muzzleVelocity: 2350,
    effectiveRange: 400,
    maxRange: 600,
    recoil: 0.45,
    bulletDrop: {
      25: 0, 50: 0.2, 100: 1.5, 150: 4, 200: 8, 300: 20, 500: 60, 750: 150, 1000: 320
    },
    description: 'Legendary reliability. Heavy round with more drop.',
    unlockLevel: 2
  },

  // .30 Caliber family - Hunting classics
  rifle_30_30: {
    id: 'rifle_30_30',
    name: '.30-30 Winchester',
    caliber: '.30-30 Win',
    category: 'lever-action',
    damage: 80,
    accuracy: 0.90,
    reloadTime: 2500,
    magazineSize: 6,
    muzzleVelocity: 2400,
    effectiveRange: 200,
    maxRange: 350,
    recoil: 0.4,
    bulletDrop: {
      25: 0, 50: 0.3, 100: 2, 150: 5, 200: 11, 300: 28, 500: 90, 750: 220, 1000: 450
    },
    description: 'Classic lever-action. The deer hunter\'s choice for generations.',
    unlockLevel: 3
  },
  rifle_30cal: {
    id: 'rifle_30cal',
    name: '.30 Caliber Carbine',
    caliber: '.30 Carbine',
    category: 'carbine',
    damage: 65,
    accuracy: 0.89,
    reloadTime: 1800,
    magazineSize: 15,
    muzzleVelocity: 1990,
    effectiveRange: 200,
    maxRange: 300,
    recoil: 0.3,
    bulletDrop: {
      25: 0, 50: 0.4, 100: 2.5, 150: 6, 200: 13, 300: 35, 500: 110, 750: 280, 1000: 550
    },
    description: 'Light and handy. Good for close to medium range.',
    unlockLevel: 3
  },
  rifle_30_06: {
    id: 'rifle_30_06',
    name: '.30-06 Springfield',
    caliber: '.30-06 Sprg',
    category: 'bolt-action',
    damage: 95,
    accuracy: 0.94,
    reloadTime: 3000,
    magazineSize: 5,
    muzzleVelocity: 2900,
    effectiveRange: 600,
    maxRange: 1000,
    recoil: 0.55,
    bulletDrop: {
      25: 0, 50: 0.1, 100: 1, 150: 2.5, 200: 5, 300: 12, 500: 38, 750: 95, 1000: 190
    },
    description: 'The American classic. Excellent long-range performance.',
    unlockLevel: 3
  },
  rifle_m1_garand: {
    id: 'rifle_m1_garand',
    name: 'M-1 Garand',
    caliber: '.30-06 Sprg',
    category: 'semi-auto',
    damage: 90,
    accuracy: 0.92,
    reloadTime: 2000,
    magazineSize: 8,
    muzzleVelocity: 2800,
    effectiveRange: 550,
    maxRange: 900,
    recoil: 0.5,
    bulletDrop: {
      25: 0, 50: 0.1, 100: 1.2, 150: 3, 200: 6, 300: 14, 500: 42, 750: 105, 1000: 210
    },
    description: 'WWII legend. Semi-auto with that iconic ping!',
    unlockLevel: 3
  },

  // Heavy hitters
  rifle_45_70: {
    id: 'rifle_45_70',
    name: '.45-70 Government',
    caliber: '.45-70 Govt',
    category: 'lever-action',
    damage: 120,
    accuracy: 0.85,
    reloadTime: 3000,
    magazineSize: 4,
    muzzleVelocity: 1800,
    effectiveRange: 200,
    maxRange: 400,
    recoil: 0.7,
    bulletDrop: {
      25: 0, 50: 0.5, 100: 3.5, 150: 9, 200: 18, 300: 48, 500: 140, 750: 350, 1000: 700
    },
    description: 'Buffalo gun. Massive stopping power, rainbow trajectory.',
    unlockLevel: 4
  },
  rifle_300win: {
    id: 'rifle_300win',
    name: '.300 Winchester Magnum',
    caliber: '.300 Win Mag',
    category: 'bolt-action',
    damage: 110,
    accuracy: 0.96,
    reloadTime: 3200,
    magazineSize: 4,
    muzzleVelocity: 3150,
    effectiveRange: 800,
    maxRange: 1200,
    recoil: 0.65,
    bulletDrop: {
      25: 0, 50: 0.05, 100: 0.6, 150: 1.8, 200: 3.5, 300: 9, 500: 28, 750: 70, 1000: 140
    },
    description: 'Long-range magnum. Flat shooting with authority.',
    unlockLevel: 4
  },
  rifle_50cal: {
    id: 'rifle_50cal',
    name: '.50 BMG',
    caliber: '.50 BMG',
    category: 'anti-material',
    damage: 200,
    accuracy: 0.94,
    reloadTime: 4000,
    magazineSize: 5,
    muzzleVelocity: 2900,
    effectiveRange: 1500,
    maxRange: 2000,
    recoil: 0.9,
    bulletDrop: {
      25: 0, 50: 0.02, 100: 0.3, 150: 1, 200: 2, 300: 5, 500: 16, 750: 40, 1000: 80
    },
    description: 'The big fifty. Extreme range, extreme power.',
    unlockLevel: 5
  },
  pistol_ar_pup: {
    id: 'pistol_ar_pup',
    name: 'AR Pup Pistol',
    caliber: '5.56 NATO',
    category: 'pistol',
    damage: 55,
    accuracy: 0.82,
    reloadTime: 1500,
    magazineSize: 30,
    muzzleVelocity: 2500,
    effectiveRange: 200,
    maxRange: 400,
    recoil: 0.5,
    fireMode: 'full-auto',
    rateOfFire: 800, // rounds per minute
    bulletDrop: {
      25: 0, 50: 0.3, 100: 1.8, 150: 4.5, 200: 9, 300: 24, 500: 75, 750: 190, 1000: 380
    },
    description: 'Compact full-auto. High rate of fire, harder to control.',
    unlockLevel: 5
  }
};

// Range distances in yards
export const RANGE_DISTANCES = [25, 50, 100, 150, 200, 300, 500, 750, 1000];

// Hog speed configurations (mph)
export const HOG_SPEEDS = {
  stationary: 0,
  grazing: 2,      // Slow walk
  walking: 5,      // Normal walk
  trotting: 10,    // Light jog
  running: 18,     // Full run
  charging: 25,    // Aggressive charge
  sprinting: 30    // Maximum speed
};

// Convert mph to pixels per second for game canvas
export const mphToPixelsPerSecond = (mph) => mph * 2.5; // Scaled for gameplay

// Target types with speed ranges
export const TARGET_TYPES = {
  stationary: {
    id: 'stationary',
    name: 'Stationary Target',
    points: 10,
    speedRange: [0, 0],
    angleRange: [0, 0] // degrees from center
  },
  grazing: {
    id: 'grazing',
    name: 'Grazing Hog',
    points: 15,
    speedRange: [2, 5],
    angleRange: [-30, 30]
  },
  walking: {
    id: 'walking',
    name: 'Walking Hog',
    points: 25,
    speedRange: [5, 10],
    angleRange: [-45, 45]
  },
  trotting: {
    id: 'trotting',
    name: 'Trotting Hog',
    points: 40,
    speedRange: [10, 18],
    angleRange: [-60, 60]
  },
  running: {
    id: 'running',
    name: 'Running Hog',
    points: 60,
    speedRange: [18, 25],
    angleRange: [-90, 90]
  },
  charging: {
    id: 'charging',
    name: 'Charging Boar',
    points: 100,
    speedRange: [25, 30],
    angleRange: [-120, 120]
  }
};

// Hit zones with multipliers
export const HIT_ZONES = {
  vital: {
    name: 'Vital',
    multiplier: 3,
    color: '#ef4444',
    radius: 0.2 // relative to target size
  },
  body: {
    name: 'Body',
    multiplier: 1,
    color: '#f97316',
    radius: 0.5
  },
  graze: {
    name: 'Graze',
    multiplier: 0.5,
    color: '#eab308',
    radius: 0.7
  }
};

// Level progression system (1-5)
export const LEVELS = {
  1: {
    name: 'Novice',
    description: 'Learn the basics of marksmanship',
    targetTypes: ['stationary', 'grazing'],
    maxSpeed: 5,
    angleVariation: 15, // degrees
    spawnInterval: [3000, 5000], // ms between spawns
    targetCount: 10,
    simultaneousTargets: 1,
    requiredAccuracy: 40,
    timeBonus: false,
    weapons: ['rifle_22lr', 'rifle_22mag']
  },
  2: {
    name: 'Shooter',
    description: 'Track moving targets at various speeds',
    targetTypes: ['stationary', 'grazing', 'walking'],
    maxSpeed: 10,
    angleVariation: 30,
    spawnInterval: [2500, 4000],
    targetCount: 15,
    simultaneousTargets: 2,
    requiredAccuracy: 50,
    timeBonus: true,
    weapons: ['rifle_22lr', 'rifle_22mag', 'rifle_223swift', 'rifle_nato_ar', 'rifle_ak47']
  },
  3: {
    name: 'Marksman',
    description: 'Handle fast movers and multiple targets',
    targetTypes: ['grazing', 'walking', 'trotting'],
    maxSpeed: 18,
    angleVariation: 60,
    spawnInterval: [2000, 3500],
    targetCount: 20,
    simultaneousTargets: 3,
    requiredAccuracy: 55,
    timeBonus: true,
    weapons: ['rifle_223swift', 'rifle_nato_ar', 'rifle_ak47', 'rifle_30_30', 'rifle_30cal', 'rifle_30_06', 'rifle_m1_garand']
  },
  4: {
    name: 'Expert',
    description: 'Rapid target acquisition under pressure',
    targetTypes: ['walking', 'trotting', 'running'],
    maxSpeed: 25,
    angleVariation: 90,
    spawnInterval: [1500, 3000],
    targetCount: 25,
    simultaneousTargets: 4,
    requiredAccuracy: 60,
    timeBonus: true,
    weapons: ['rifle_30_06', 'rifle_m1_garand', 'rifle_45_70', 'rifle_300win']
  },
  5: {
    name: 'Master Hunter',
    description: 'Face the ultimate challenge - charging boars',
    targetTypes: ['trotting', 'running', 'charging'],
    maxSpeed: 30,
    angleVariation: 120,
    spawnInterval: [1000, 2500],
    targetCount: 30,
    simultaneousTargets: 5,
    requiredAccuracy: 65,
    timeBonus: true,
    weapons: ['rifle_300win', 'rifle_50cal', 'pistol_ar_pup']
  }
};

// Training scenarios
export const PRACTICE_SCENARIOS = [
  {
    id: 'zeroing',
    name: 'Weapon Zeroing',
    description: 'Learn to sight in your rifle at various distances',
    type: 'zeroing',
    targetCount: 10,
    targetTypes: ['stationary'],
    timeLimit: null,
    level: 1,
    distances: [25, 50, 100]
  },
  {
    id: 'ballistics_101',
    name: 'Ballistics 101',
    description: 'Understand bullet drop compensation at range',
    type: 'ballistics',
    targetCount: 15,
    targetTypes: ['stationary'],
    timeLimit: 180,
    level: 1,
    distances: [100, 150, 200, 300]
  },
  {
    id: 'moving_basics',
    name: 'Moving Target Basics',
    description: 'Track slow-moving targets',
    type: 'tracking',
    targetCount: 12,
    targetTypes: ['grazing', 'walking'],
    timeLimit: 120,
    level: 2,
    distances: [50, 100, 150]
  },
  {
    id: 'speed_drill',
    name: 'Speed Drill',
    description: 'Fast target acquisition challenge',
    type: 'speed',
    targetCount: 20,
    targetTypes: ['walking', 'trotting'],
    timeLimit: 90,
    level: 3,
    distances: [100, 150, 200]
  },
  {
    id: 'long_range',
    name: 'Long Range Precision',
    description: 'Master shots beyond 500 yards',
    type: 'precision',
    targetCount: 10,
    targetTypes: ['stationary', 'grazing'],
    timeLimit: 300,
    level: 4,
    distances: [500, 750, 1000]
  },
  {
    id: 'charging_boars',
    name: 'Charging Boars',
    description: 'Stop aggressive hogs before they reach you',
    type: 'defense',
    targetCount: 15,
    targetTypes: ['running', 'charging'],
    timeLimit: 120,
    level: 5,
    distances: [50, 100, 150, 200]
  },
  {
    id: 'combat_readiness',
    name: 'Combat Readiness',
    description: 'Full random simulation - prepare for Hog Island',
    type: 'combat',
    targetCount: 30,
    targetTypes: ['grazing', 'walking', 'trotting', 'running', 'charging'],
    timeLimit: 180,
    level: 5,
    distances: [50, 100, 150, 200, 300, 500]
  }
];

// Initial player stats
export const PLAYER_STATS_INITIAL = {
  totalShots: 0,
  hits: 0,
  misses: 0,
  vitalHits: 0,
  bodyHits: 0,
  grazeHits: 0,
  accuracy: 0,
  highScore: 0,
  currentLevel: 1,
  experience: 0,
  scenariosCompleted: [],
  weaponsUnlocked: ['rifle_22lr', 'rifle_22mag'],
  calibersZeroed: {} // { weaponId: [distances zeroed] }
};

// Experience needed per level
export const XP_PER_LEVEL = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3500,
  5: 7000
};

// Game settings
export const GAME_SETTINGS = {
  practiceRange: {
    width: 1400,
    height: 700,
    groundLevel: 580,
    skyColor: '#1e3a5f',
    groundColor: '#3d4f21'
  }
};

// Wind conditions (future feature)
export const WIND_CONDITIONS = {
  calm: { speed: 0, name: 'Calm' },
  light: { speed: 5, name: 'Light Breeze' },
  moderate: { speed: 10, name: 'Moderate Wind' },
  strong: { speed: 20, name: 'Strong Wind' },
  gusty: { speed: 30, name: 'Gusty' }
};
