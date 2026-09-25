export const BOOTH_TARGETS = 20;

// Angle = max deviation (deg) from a pure crossing path; 90 lets hogs charge straight at the booth.
export const LEVELS = [
  { level: 1, name: "Yard Fence", rangeYd: [25, 100], speedMph: [2, 6], angle: 15, windMph: [0, 0], passHits: 10, blurb: "Slow hogs, short lanes. Learn your zero." },
  { level: 2, name: "Tree Line", rangeYd: [50, 200], speedMph: [5, 12], angle: 35, windMph: [0, 0], passHits: 11, blurb: "Faster crossings. Start leading the target." },
  { level: 3, name: "Mire Edge", rangeYd: [100, 400], speedMph: [8, 18], angle: 55, windMph: [0, 6], passHits: 12, blurb: "Wind picks up. Read the mil-dots." },
  { level: 4, name: "Standing Stones", rangeYd: [150, 600], speedMph: [12, 24], angle: 75, windMph: [3, 10], passHits: 13, blurb: "Long lanes, hard wind, charging hogs." },
  { level: 5, name: "Fog Rim", rangeYd: [200, 1000], speedMph: [15, 30], angle: 90, windMph: [5, 15], passHits: 14, blurb: "Out to a thousand yards. Master class." },
];

export const getLevel = (n) => LEVELS[Math.min(LEVELS.length, Math.max(1, n)) - 1];

export const hitScore = (rangeYd, speedMph, streak) =>
  Math.round(100 * (1 + rangeYd / 200) * (1 + speedMph / 30) * Math.min(2, 1 + streak * 0.1));
