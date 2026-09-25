export const WEAPON_ORDER = ["rifle", "shotgun", "marksman"];

export const WEAPONS = {
  rifle: {
    key: "rifle",
    slot: 1,
    name: "Warden Carbine",
    short: "CARBINE",
    damage: 34,
    magSize: 12,
    reserve: Infinity,
    reloadMs: 1200,
    fireDelayMs: 140,
    pellets: 1,
    spread: 0,
    color: "#F1F5F9",
  },
  shotgun: {
    key: "shotgun",
    slot: 2,
    name: "Mire Breaker",
    short: "SHOTGUN",
    damage: 14,
    magSize: 6,
    reserve: 18,
    reloadMs: 1800,
    fireDelayMs: 720,
    pellets: 8,
    spread: 0.075,
    color: "#E6B325",
  },
  marksman: {
    key: "marksman",
    slot: 3,
    name: "Fogpiercer",
    short: "MARKSMAN",
    damage: 125,
    magSize: 5,
    reserve: 10,
    reloadMs: 2000,
    fireDelayMs: 900,
    pellets: 1,
    spread: 0,
    color: "#06b6d4",
  },
};

export const AMMO_PICKUP = { shotgun: 6, marksman: 5 };

export function initialAmmo() {
  const out = {};
  for (const k of WEAPON_ORDER) out[k] = { mag: WEAPONS[k].magSize, reserve: WEAPONS[k].reserve };
  return out;
}
