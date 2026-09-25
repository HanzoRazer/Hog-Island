// Combat + lore stats for the shape-shifting beasts of Hog Island.
export const CREATURES = {
  shifthog: {
    key: "shifthog",
    name: "Shifthog",
    epithet: "The Tusked Trickster",
    color: "#b06a34",
    eye: "#ffcf4d",
    hp: 45,
    speed: 4.6,
    damage: 8,
    points: 100,
    scale: 0.85,
    threat: "Low",
    threatColor: "#10B981",
    lore:
      "Once ordinary boars, the Shifthogs drank from the Mire and learned to fold their bones. In dim light they wear the shape of harmless swine — until the tusks unfurl and the true grin appears.",
  },
  feralpack: {
    key: "feralpack",
    name: "Feral Wildhound",
    epithet: "The Hunger That Runs",
    color: "#7c7364",
    eye: "#e6b325",
    hp: 32,
    speed: 6.0,
    damage: 6,
    points: 80,
    scale: 0.7,
    threat: "Low",
    threatColor: "#10B981",
    lore:
      "They move as one mind split across many bodies. Fast, thin, relentless — the Wildhounds test your reflexes before the heavier beasts arrive.",
  },
  nightpanther: {
    key: "nightpanther",
    name: "Nightpanther",
    epithet: "The Walking Absence",
    color: "#15151d",
    eye: "#06b6d4",
    hp: 60,
    speed: 6.6,
    damage: 12,
    points: 180,
    scale: 0.9,
    threat: "High",
    threatColor: "#FF3B30",
    lore:
      "It does not hide in shadow — it is the shadow that hides. The Nightpanther closes distance faster than the eye can track and vanishes between heartbeats.",
  },
  urshade: {
    key: "urshade",
    name: "Urshade Bear",
    epithet: "The Old Mountain",
    color: "#3b2f2c",
    eye: "#ff6a3d",
    hp: 105,
    speed: 3.0,
    damage: 15,
    points: 220,
    scale: 1.25,
    threat: "High",
    threatColor: "#FF3B30",
    lore:
      "The Urshade remember the island before the Mire. Slow, immense, and impossibly patient, they carry grudges older than your bloodline.",
  },
  direbuffalo: {
    key: "direbuffalo",
    name: "Direbuffalo",
    epithet: "The Living Avalanche",
    color: "#524236",
    eye: "#e6b325",
    hp: 125,
    speed: 2.6,
    damage: 18,
    points: 250,
    scale: 1.35,
    threat: "Severe",
    threatColor: "#FF3B30",
    lore:
      "When a Direbuffalo lowers its crown of horns, the ground itself seems to flinch. Do not stand your ground. There is no ground left where it has passed.",
  },
  primordon: {
    key: "primordon",
    name: "Primordon",
    epithet: "The First Thing That Woke",
    color: "#47593a",
    eye: "#b6ff3d",
    hp: 210,
    speed: 3.6,
    damage: 25,
    points: 400,
    scale: 1.7,
    threat: "Apex",
    threatColor: "#E6B325",
    lore:
      "Older than the hogs, older than the panthers — the Primordon slept beneath the roots of the island until the Mire sang it awake. It is not a beast. It is a reminder.",
  },
};

export const CREATURE_LIST = Object.values(CREATURES);

// Spawn weighting by wave: earlier waves = weaker beasts.
export function spawnTableForWave(wave) {
  const table = [
    { key: "shifthog", weight: 5 },
    { key: "feralpack", weight: 5 },
  ];
  if (wave >= 2) table.push({ key: "nightpanther", weight: 3 });
  if (wave >= 3) table.push({ key: "urshade", weight: 2 });
  if (wave >= 4) table.push({ key: "direbuffalo", weight: 2 });
  if (wave >= 5) table.push({ key: "primordon", weight: 1 });
  return table;
}

export function pickCreatureForWave(wave) {
  const table = spawnTableForWave(wave);
  const total = table.reduce((s, t) => s + t.weight, 0);
  let roll = Math.random() * total;
  for (const t of table) {
    roll -= t.weight;
    if (roll <= 0) return t.key;
  }
  return table[0].key;
}
