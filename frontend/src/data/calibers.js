// Training Booth arsenal, organised by ballistic caliber.
// v0 = muzzle velocity (m/s), bc = G1 ballistic coefficient (drives drag), zoom = optic magnification.
// `model` is a placeholder — makes/models to be filled in later.
export const CATEGORIES = {
  rifle: { name: "Rifles", order: 1 },
  lever: { name: "Lever Actions", order: 2 },
  shotgun: { name: "Shotguns", order: 3 },
  revolver: { name: "Revolvers", order: 4 },
  pistol: { name: "Pistols", order: 5 },
};

export const CALIBERS = {
  // ---- rifles ----
  r22lr: { key: "r22lr", name: ".22 LR", model: "TBD", category: "rifle", v0: 380, bc: 0.13, mag: 10, action: "semi", cycleMs: 180, reloadMs: 1500, zoom: 4, recoil: 0.15, sound: "rifle" },
  r22mag: { key: "r22mag", name: ".22 Magnum", model: "TBD", category: "rifle", v0: 580, bc: 0.125, mag: 9, action: "semi", cycleMs: 200, reloadMs: 1600, zoom: 4, recoil: 0.25, sound: "rifle" },
  r223: { key: "r223", name: ".223 / 5.56 NATO", model: "AR-style · TBD", category: "rifle", v0: 990, bc: 0.27, mag: 30, action: "auto", cycleMs: 90, reloadMs: 1800, zoom: 3, recoil: 0.5, sound: "rifle" },
  r762ak: { key: "r762ak", name: "7.62×39", model: "AK-47 style · TBD", category: "rifle", v0: 715, bc: 0.28, mag: 30, action: "auto", cycleMs: 100, reloadMs: 2000, zoom: 2, recoil: 0.9, sound: "rifle" },
  r30carb: { key: "r30carb", name: ".30 Carbine", model: "TBD", category: "rifle", v0: 600, bc: 0.18, mag: 15, action: "semi", cycleMs: 160, reloadMs: 1700, zoom: 2, recoil: 0.5, sound: "rifle" },
  r3006: { key: "r3006", name: ".30-06 Springfield", model: "Bolt action · TBD", category: "rifle", v0: 850, bc: 0.45, mag: 5, action: "bolt", cycleMs: 1200, reloadMs: 2400, zoom: 6, recoil: 1.8, sound: "marksman" },
  rgarand: { key: "rgarand", name: ".30-06 M1 Garand", model: "M1 Garand · TBD", category: "rifle", v0: 850, bc: 0.45, mag: 8, action: "semi", cycleMs: 220, reloadMs: 1900, zoom: 2, recoil: 1.6, sound: "marksman" },
  r300wm: { key: "r300wm", name: ".300 Winchester Magnum", model: "Bolt action · TBD", category: "rifle", v0: 900, bc: 0.5, mag: 3, action: "bolt", cycleMs: 1300, reloadMs: 2600, zoom: 10, recoil: 2.4, sound: "marksman" },
  r50ar: { key: "r50ar", name: ".50 Beowulf AR Pistol", model: "AR pup pistol · TBD", category: "rifle", v0: 580, bc: 0.24, mag: 10, action: "auto", cycleMs: 130, reloadMs: 2000, zoom: 2, recoil: 2.0, sound: "shotgun" },
  // ---- lever actions ----
  l3030: { key: "l3030", name: ".30-30 Winchester", model: "Lever action · TBD", category: "lever", v0: 730, bc: 0.25, mag: 6, action: "lever", cycleMs: 900, reloadMs: 3000, zoom: 2, recoil: 1.2, sound: "rifle" },
  l4570: { key: "l4570", name: ".45-70 Government", model: "Lever action · TBD", category: "lever", v0: 560, bc: 0.3, mag: 4, action: "lever", cycleMs: 1000, reloadMs: 3200, zoom: 2, recoil: 2.6, sound: "shotgun" },
  l357: { key: "l357", name: ".357 Magnum Carbine", model: "Lever action · TBD", category: "lever", v0: 540, bc: 0.17, mag: 8, action: "lever", cycleMs: 850, reloadMs: 3000, zoom: 2, recoil: 0.7, sound: "rifle" },
  // ---- shotguns ----
  s12ga: { key: "s12ga", name: "12 Gauge 00 Buck", model: "Pump · TBD", category: "shotgun", v0: 400, bc: 0.08, mag: 5, action: "pump", cycleMs: 800, reloadMs: 2800, zoom: 1, recoil: 2.8, pellets: 9, spread: 0.02, sound: "shotgun" },
  // ---- revolvers ----
  v357: { key: "v357", name: ".357 Magnum", model: "Revolver · TBD", category: "revolver", v0: 430, bc: 0.16, mag: 6, action: "semi", cycleMs: 260, reloadMs: 2600, zoom: 1, recoil: 1.4, sound: "rifle" },
  v45colt: { key: "v45colt", name: ".45 Colt", model: "Revolver · TBD", category: "revolver", v0: 280, bc: 0.15, mag: 6, action: "semi", cycleMs: 300, reloadMs: 2800, zoom: 1, recoil: 1.5, sound: "shotgun" },
  // ---- pistols ----
  p9mm: { key: "p9mm", name: "9 mm", model: "Pistol · TBD", category: "pistol", v0: 360, bc: 0.14, mag: 17, action: "semi", cycleMs: 140, reloadMs: 1500, zoom: 1, recoil: 0.6, sound: "rifle" },
  p10mm: { key: "p10mm", name: "10 mm Auto", model: "Pistol · TBD", category: "pistol", v0: 400, bc: 0.16, mag: 15, action: "semi", cycleMs: 160, reloadMs: 1500, zoom: 1, recoil: 0.9, sound: "rifle" },
  p45acp: { key: "p45acp", name: ".45 ACP", model: "Pistol · TBD", category: "pistol", v0: 260, bc: 0.16, mag: 8, action: "semi", cycleMs: 170, reloadMs: 1600, zoom: 1, recoil: 1.0, sound: "shotgun" },
};

export const CALIBER_LIST = Object.values(CALIBERS);

export function calibersByCategory() {
  return Object.keys(CATEGORIES)
    .sort((a, b) => CATEGORIES[a].order - CATEGORIES[b].order)
    .map((cat) => ({ key: cat, ...CATEGORIES[cat], items: CALIBER_LIST.filter((c) => c.category === cat) }));
}
