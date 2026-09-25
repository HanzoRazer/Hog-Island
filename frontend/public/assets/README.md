# Hog Island — Asset Drop-in

Drop your own models and sounds here. Anything missing falls back to the built-in placeholder
geometry / procedural audio, so you can add files one at a time.

Slot paths are defined in `src/game/assets.config.js` (change filenames, scale, offsets there).

## Models (.glb, binary glTF)

| Slot            | Path                              | Notes                                              |
|-----------------|-----------------------------------|----------------------------------------------------|
| map             | `map/hog_island.glb`              | Whole island. Player spawns at origin; arena clamp radius 46 (`constants.js`). |
| shifthog        | `creatures/shifthog.glb`          | Origin at feet, facing +Z, ~1 unit tall. Scaled by creature `scale`. |
| feralpack       | `creatures/feralpack.glb`         |                                                    |
| nightpanther    | `creatures/nightpanther.glb`      |                                                    |
| urshade         | `creatures/urshade.glb`           |                                                    |
| direbuffalo     | `creatures/direbuffalo.glb`       |                                                    |
| mireraptor      | `creatures/mireraptor.glb`        |                                                    |
| pickup_health   | `pickups/health.glb`              | ~0.7 units, floats & spins automatically.          |
| pickup_ammo     | `pickups/ammo.glb`                |                                                    |
| weapon_rifle    | `weapons/rifle.glb`               | First-person viewmodel, attached to camera.        |
| weapon_shotgun  | `weapons/shotgun.glb`             |                                                    |
| weapon_marksman | `weapons/marksman.glb`            |                                                    |

## Sounds (.ogg or .mp3 — change the extension in `SOUND_FILES` if using mp3)

`sfx/ambient.ogg` (loops), `shot_rifle`, `shot_shotgun`, `shot_marksman`, `dryfire`, `reload`,
`swap`, `hit`, `kill`, `hurt`, `pickup`, `wave`, `surge`, `roar` (generic) and per-creature
`roar_<slot>.ogg`.

Reload the page after adding files.
