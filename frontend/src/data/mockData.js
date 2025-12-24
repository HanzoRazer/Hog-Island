// Mock data for Hog Island game

export const WEAPONS = {
  rifle: {
    id: 'rifle',
    name: 'M14 Rifle',
    damage: 100,
    accuracy: 0.95,
    reloadTime: 2000,
    magazineSize: 10,
    bulletSpeed: 800,
    description: 'Standard issue rifle - reliable and accurate'
  }
};

export const TARGET_TYPES = {
  stationary: {
    id: 'stationary',
    name: 'Stationary Target',
    points: 10,
    speed: 0
  },
  slowMoving: {
    id: 'slowMoving',
    name: 'Slow Moving',
    points: 25,
    speed: 50
  },
  fastMoving: {
    id: 'fastMoving',
    name: 'Fast Moving',
    points: 50,
    speed: 120
  },
  charging: {
    id: 'charging',
    name: 'Charging Hog',
    points: 75,
    speed: 200
  }
};

export const HIT_ZONES = {
  vital: {
    name: 'Vital',
    multiplier: 3,
    color: '#ef4444',
    radius: 15
  },
  body: {
    name: 'Body',
    multiplier: 1,
    color: '#f97316',
    radius: 40
  },
  graze: {
    name: 'Graze',
    multiplier: 0.5,
    color: '#eab308',
    radius: 55
  }
};

export const RANGE_DISTANCES = [50, 100, 150, 200, 300];

export const PRACTICE_SCENARIOS = [
  {
    id: 'zeroing',
    name: 'Weapon Zeroing',
    description: 'Learn to sight in your rifle at various distances',
    targetCount: 5,
    targetTypes: ['stationary'],
    timeLimit: null
  },
  {
    id: 'stationary_drill',
    name: 'Stationary Targets',
    description: 'Hit stationary targets at increasing distances',
    targetCount: 10,
    targetTypes: ['stationary'],
    timeLimit: 60
  },
  {
    id: 'moving_targets',
    name: 'Moving Targets',
    description: 'Track and hit moving hog silhouettes',
    targetCount: 10,
    targetTypes: ['slowMoving', 'fastMoving'],
    timeLimit: 90
  },
  {
    id: 'mixed_drill',
    name: 'Combat Readiness',
    description: 'Mixed targets preparing you for the real thing',
    targetCount: 20,
    targetTypes: ['stationary', 'slowMoving', 'fastMoving', 'charging'],
    timeLimit: 120
  }
];

export const PLAYER_STATS_INITIAL = {
  totalShots: 0,
  hits: 0,
  misses: 0,
  vitalHits: 0,
  bodyHits: 0,
  grazeHits: 0,
  accuracy: 0,
  highScore: 0,
  scenariosCompleted: []
};

export const GAME_SETTINGS = {
  practiceRange: {
    width: 1200,
    height: 600,
    groundLevel: 500,
    skyColor: '#87CEEB',
    groundColor: '#8B7355'
  }
};
