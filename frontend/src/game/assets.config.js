import { useEffect, useState } from "react";

// Drop your own .glb / .ogg / .mp3 files into frontend/public/assets/ at the paths below.
// Missing files automatically fall back to the built-in placeholder geometry / synthesized audio.
export const ASSET_BASE = `${process.env.PUBLIC_URL || ""}/assets`;

// position/rotation/scale are applied to the loaded model inside its slot.
// Creatures: origin should sit at the feet, facing +Z. Slot group is scaled by the creature's `scale`.
export const MODELS = {
  map: { file: "map/hog_island.glb", scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },

  shifthog: { file: "creatures/shifthog.glb", scale: 1, position: [0, -0.9, 0], rotation: [0, 0, 0] },
  feralpack: { file: "creatures/feralpack.glb", scale: 1, position: [0, -0.9, 0], rotation: [0, 0, 0] },
  nightpanther: { file: "creatures/nightpanther.glb", scale: 1, position: [0, -0.9, 0], rotation: [0, 0, 0] },
  urshade: { file: "creatures/urshade.glb", scale: 1, position: [0, -0.9, 0], rotation: [0, 0, 0] },
  direbuffalo: { file: "creatures/direbuffalo.glb", scale: 1, position: [0, -0.9, 0], rotation: [0, 0, 0] },
  mireraptor: { file: "creatures/mireraptor.glb", scale: 1, position: [0, -0.9, 0], rotation: [0, 0, 0] },

  pickup_health: { file: "pickups/health.glb", scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
  pickup_ammo: { file: "pickups/ammo.glb", scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },

  // first-person viewmodels, positioned relative to the camera
  weapon_rifle: { file: "weapons/rifle.glb", scale: 1, position: [0.32, -0.28, -0.6], rotation: [0, Math.PI, 0] },
  weapon_shotgun: { file: "weapons/shotgun.glb", scale: 1, position: [0.32, -0.28, -0.6], rotation: [0, Math.PI, 0] },
  weapon_marksman: { file: "weapons/marksman.glb", scale: 1, position: [0.32, -0.28, -0.6], rotation: [0, Math.PI, 0] },
};

export const SOUND_FILES = {
  ambient: "sfx/ambient.ogg",
  shot_rifle: "sfx/shot_rifle.ogg",
  shot_shotgun: "sfx/shot_shotgun.ogg",
  shot_marksman: "sfx/shot_marksman.ogg",
  dryfire: "sfx/dryfire.ogg",
  reload: "sfx/reload.ogg",
  swap: "sfx/swap.ogg",
  hit: "sfx/hit.ogg",
  kill: "sfx/kill.ogg",
  hurt: "sfx/hurt.ogg",
  pickup: "sfx/pickup.ogg",
  wave: "sfx/wave.ogg",
  surge: "sfx/surge.ogg",
  roar: "sfx/roar.ogg",
  roar_shifthog: "sfx/roar_shifthog.ogg",
  roar_feralpack: "sfx/roar_feralpack.ogg",
  roar_nightpanther: "sfx/roar_nightpanther.ogg",
  roar_urshade: "sfx/roar_urshade.ogg",
  roar_direbuffalo: "sfx/roar_direbuffalo.ogg",
  roar_mireraptor: "sfx/roar_mireraptor.ogg",
};

export const modelUrl = (slot) => `${ASSET_BASE}/${MODELS[slot].file}`;
export const soundUrl = (key) => `${ASSET_BASE}/${SOUND_FILES[key]}`;

// The dev server answers missing files with index.html (200/text/html), so check the content-type.
export async function fileExists(url) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    const ct = r.headers.get("content-type") || "";
    return r.ok && !ct.includes("text/html");
  } catch {
    return false;
  }
}

const state = { ready: false, available: {}, promise: null };

export function probeModels() {
  if (state.promise) return state.promise;
  state.promise = Promise.all(
    Object.keys(MODELS).map(async (slot) => {
      if (await fileExists(modelUrl(slot))) state.available[slot] = true;
    })
  ).then(() => {
    state.ready = true;
    return state;
  });
  return state.promise;
}

export function useModelAvailability() {
  const [s, setS] = useState({ ready: state.ready, available: { ...state.available } });
  useEffect(() => {
    let alive = true;
    probeModels().then(() => alive && setS({ ready: true, available: { ...state.available } }));
    return () => {
      alive = false;
    };
  }, []);
  return s;
}
