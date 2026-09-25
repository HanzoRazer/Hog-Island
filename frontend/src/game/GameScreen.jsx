import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Sky } from "@react-three/drei";
import * as THREE from "three";
import { CREATURES, pickCreatureForWave } from "../data/creatures";
import { WEAPONS, WEAPON_ORDER, AMMO_PICKUP, initialAmmo } from "./weapons";
import { ARENA_RADIUS, EYE_HEIGHT, MOVE_SPEED, MAX_ENEMIES, PICKUP_RESPAWN_MS, SURGE_DELAY_MS, SURGE_DURATION_MS, FOG_COLOR } from "./constants";
import { audio } from "./audio";
import { useModelAvailability } from "./assets.config";
import { ModelSlot } from "./ModelSlot";
import { Creature } from "./Creature";
import { Island } from "./Island";
import { Pickups, PICKUP_DEFS, makePickupPoints } from "./Pickups";
import { MysticalFX } from "./Mystical";
import HUD from "./HUD";

let ENEMY_SEQ = 0;

function useKeys() {
  const keys = useRef({});
  useEffect(() => {
    const down = (e) => (keys.current[e.code] = true);
    const up = (e) => (keys.current[e.code] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return keys;
}

function Player({ playerPosRef, keys, active }) {
  const { camera } = useThree();
  const up = useRef(new THREE.Vector3(0, 1, 0));
  useFrame((_, delta) => {
    playerPosRef.current.copy(camera.position);
    if (!active.current) return;
    const dt = Math.min(delta, 0.05);
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() > 0) forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, up.current).normalize();
    const move = new THREE.Vector3();
    const k = keys.current;
    if (k["KeyW"] || k["ArrowUp"]) move.add(forward);
    if (k["KeyS"] || k["ArrowDown"]) move.sub(forward);
    if (k["KeyD"] || k["ArrowRight"]) move.add(right);
    if (k["KeyA"] || k["ArrowLeft"]) move.sub(right);
    if (move.lengthSq() > 0) {
      move.normalize();
      camera.position.addScaledVector(move, MOVE_SPEED * dt);
    }
    camera.position.y = EYE_HEIGHT;
    const r = Math.hypot(camera.position.x, camera.position.z);
    if (r > ARENA_RADIUS) {
      camera.position.x *= ARENA_RADIUS / r;
      camera.position.z *= ARENA_RADIUS / r;
    }
    playerPosRef.current.copy(camera.position);
  });
  return null;
}

// hitscan; shotgun fires several pellets with random spread
function Shooter({ enemiesGroupRef, onHit, onFire, active }) {
  const { camera, raycaster } = useThree();
  useEffect(() => {
    const findEnemy = (obj) => {
      let o = obj;
      while (o) {
        if (o.userData && o.userData.enemyId) return o.userData.enemyId;
        o = o.parent;
      }
      return null;
    };
    const onDown = (e) => {
      if (e.button !== 0 || !active.current || document.pointerLockElement == null) return;
      const weapon = onFire();
      if (!weapon) return;
      const grp = enemiesGroupRef.current;
      if (!grp) return;
      for (let i = 0; i < weapon.pellets; i++) {
        const sx = weapon.spread ? (Math.random() - 0.5) * 2 * weapon.spread : 0;
        const sy = weapon.spread ? (Math.random() - 0.5) * 2 * weapon.spread : 0;
        raycaster.setFromCamera({ x: sx, y: sy }, camera);
        const hits = raycaster.intersectObjects(grp.children, true);
        const hit = hits.find((h) => findEnemy(h.object));
        if (hit) onHit(findEnemy(hit.object), weapon.damage);
      }
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [camera, raycaster, enemiesGroupRef, onHit, onFire, active]);
  return null;
}

// first-person weapon model (only when a .glb is provided for the current weapon)
function WeaponView({ weaponKey }) {
  const { camera } = useThree();
  return (
    <primitive object={camera}>
      <ModelSlot slot={`weapon_${weaponKey}`} />
    </primitive>
  );
}

function Scene(props) {
  const { playerPosRef, keys, active, enemies, pickups, onHit, onFire, onDamagePlayer, onCollect, controlsRef, onLockChange, surgeRef, weaponKey } = props;
  const enemiesGroupRef = useRef();
  return (
    <>
      <PointerLockControls ref={controlsRef} selector="#pointer-lock-disabled" onLock={() => onLockChange(true)} onUnlock={() => onLockChange(false)} />
      <color attach="background" args={[FOG_COLOR]} />
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.028]} />
      <Sky sunPosition={[5, 1, 8]} turbidity={12} rayleigh={0.4} inclination={0.48} />
      <hemisphereLight args={["#3a5a4a", "#0a0f0c", 0.5]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[20, 30, 10]} intensity={0.8} color="#9fb8c9" castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#1fd3a3" distance={60} />

      <Island />
      <MysticalFX surgeRef={surgeRef} />
      <Player playerPosRef={playerPosRef} keys={keys} active={active} />
      <Shooter enemiesGroupRef={enemiesGroupRef} onHit={onHit} onFire={onFire} active={active} />
      <WeaponView weaponKey={weaponKey} />
      <Pickups pickups={pickups} playerPosRef={playerPosRef} onCollect={onCollect} active={active} />

      <group ref={enemiesGroupRef}>
        {enemies.map((e) => (
          <Creature key={e.id} data={e} playerPosRef={playerPosRef} onDamagePlayer={onDamagePlayer} active={active} surgeRef={surgeRef} />
        ))}
      </group>
    </>
  );
}

export default function GameScreen({ player, onExit, onGameOver }) {
  const keys = useKeys();
  const playerPosRef = useRef(new THREE.Vector3(0, EYE_HEIGHT, 12));
  const controlsRef = useRef();
  const active = useRef(false);
  const { available } = useModelAvailability();

  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState("playing");
  const [enemies, setEnemies] = useState([]);
  const [pickups, setPickups] = useState(makePickupPoints);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [kills, setKills] = useState(0);
  const [wave, setWave] = useState(1);
  const [hitMarker, setHitMarker] = useState(null);
  const [muzzle, setMuzzle] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);
  const [surge, setSurge] = useState(false);
  const [notice, setNotice] = useState(null);
  const [audioPrefs, setAudioPrefs] = useState(audio.prefs());

  const [weaponKey, setWeaponKey] = useState("rifle");
  const [ammoView, setAmmoView] = useState(initialAmmo);
  const [reloading, setReloading] = useState(false);
  const weaponKeyRef = useRef("rifle");
  const ammoRef = useRef(initialAmmo());
  const reloadingRef = useRef(false);
  const reloadTimer = useRef(null);
  const lastShot = useRef(0);

  const startRef = useRef(Date.now());
  const healthRef = useRef(100);
  const waveRef = useRef(1);
  const surgeRef = useRef(false);
  const enemiesRef = useRef([]);
  const timers = useRef([]);
  enemiesRef.current = enemies;

  active.current = locked && phase === "playing";

  const later = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  const showNotice = useCallback((text, color) => setNotice({ id: Date.now(), text, color }), []);

  const syncAmmo = useCallback(() => {
    const snap = {};
    for (const k of WEAPON_ORDER) snap[k] = { ...ammoRef.current[k] };
    setAmmoView(snap);
  }, []);

  // ---- audio lifecycle ----
  useEffect(() => audio.subscribe(setAudioPrefs), []);
  useEffect(() => {
    if (locked && phase === "playing") {
      audio.init();
      audio.startAmbient();
    }
  }, [locked, phase]);
  useEffect(
    () => () => {
      audio.stopAmbient();
      audio.setMystical(false);
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const damagePlayer = useCallback(
    (dmg) => {
      if (phase !== "playing") return;
      audio.hurt();
      setDamageFlash(true);
      later(() => setDamageFlash(false), 160);
      setHealth((h) => {
        const nh = Math.max(0, h - dmg);
        healthRef.current = nh;
        return nh;
      });
    },
    [phase, later]
  );

  // ---- weapons ----
  const reload = useCallback(() => {
    const key = weaponKeyRef.current;
    const w = WEAPONS[key];
    const st = ammoRef.current[key];
    if (reloadingRef.current || st.mag === w.magSize || st.reserve <= 0) return;
    reloadingRef.current = true;
    setReloading(true);
    audio.reload(w.reloadMs);
    reloadTimer.current = later(() => {
      const take = Math.min(w.magSize - st.mag, st.reserve);
      st.mag += take;
      st.reserve -= take;
      reloadingRef.current = false;
      setReloading(false);
      syncAmmo();
    }, w.reloadMs);
  }, [later, syncAmmo]);

  const fire = useCallback(() => {
    const key = weaponKeyRef.current;
    const w = WEAPONS[key];
    const st = ammoRef.current[key];
    const now = performance.now();
    if (reloadingRef.current || now - lastShot.current < w.fireDelayMs) return null;
    if (st.mag <= 0) {
      audio.dryfire();
      reload();
      return null;
    }
    lastShot.current = now;
    st.mag -= 1;
    syncAmmo();
    audio.shot(key);
    setMuzzle(true);
    later(() => setMuzzle(false), 70);
    return w;
  }, [later, syncAmmo, reload]);

  const selectWeapon = useCallback((key) => {
    if (!WEAPONS[key] || key === weaponKeyRef.current) return;
    if (reloadTimer.current) clearTimeout(reloadTimer.current);
    reloadingRef.current = false;
    setReloading(false);
    weaponKeyRef.current = key;
    setWeaponKey(key);
    audio.swap();
  }, []);

  const cycleWeapon = useCallback(
    (dir) => {
      const i = WEAPON_ORDER.indexOf(weaponKeyRef.current);
      selectWeapon(WEAPON_ORDER[(i + dir + WEAPON_ORDER.length) % WEAPON_ORDER.length]);
    },
    [selectWeapon]
  );

  const hitEnemy = useCallback(
    (id, damage) => {
      setEnemies((list) => {
        const idx = list.findIndex((e) => e.id === id);
        if (idx === -1) return list;
        const e = list[idx];
        const nh = e.hp - damage;
        const next = list.slice();
        if (nh <= 0) {
          const c = CREATURES[e.type];
          const mult = surgeRef.current ? 2 : 1;
          setScore((s) => s + c.points * mult);
          setKills((k) => k + 1);
          setHitMarker("kill");
          audio.kill();
          later(() => setHitMarker(null), 220);
          next.splice(idx, 1);
          return next;
        }
        setHitMarker("hit");
        audio.hit();
        later(() => setHitMarker(null), 120);
        next[idx] = { ...e, hp: nh };
        return next;
      });
    },
    [later]
  );

  // ---- pickups ----
  const collectPickup = useCallback(
    (id) => {
      const pk = pickups.find((p) => p.id === id);
      if (!pk || !pk.active) return;
      setPickups((list) => list.map((p) => (p.id === id ? { ...p, active: false } : p)));
      if (pk.type === "health") {
        setHealth((h) => {
          const nh = Math.min(100, h + PICKUP_DEFS.health.amount);
          healthRef.current = nh;
          return nh;
        });
        showNotice(`+${PICKUP_DEFS.health.amount} VITALITY`, PICKUP_DEFS.health.color);
      } else {
        for (const k of Object.keys(AMMO_PICKUP)) ammoRef.current[k].reserve += AMMO_PICKUP[k];
        syncAmmo();
        showNotice("WARDEN CACHE — SHELLS & ROUNDS", PICKUP_DEFS.ammo.color);
      }
      audio.pickup();
      later(() => setPickups((list) => list.map((p) => (p.id === id ? { ...p, active: true } : p))), PICKUP_RESPAWN_MS);
    },
    [pickups, later, syncAmmo, showNotice]
  );

  // ---- keyboard / wheel ----
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "KeyR") reload();
      else if (e.code === "KeyM") audio.toggleMute();
      else if (e.code === "KeyQ") cycleWeapon(1);
      else if (e.code === "Digit1") selectWeapon("rifle");
      else if (e.code === "Digit2") selectWeapon("shotgun");
      else if (e.code === "Digit3") selectWeapon("marksman");
    };
    const onWheel = (e) => {
      if (document.pointerLockElement != null) cycleWeapon(e.deltaY > 0 ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [reload, cycleWeapon, selectWeapon]);

  useEffect(() => {
    const h = () => setLocked(document.pointerLockElement != null);
    document.addEventListener("pointerlockchange", h);
    return () => document.removeEventListener("pointerlockchange", h);
  }, []);

  // ---- waves ----
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      waveRef.current += 1;
      setWave(waveRef.current);
      audio.wave();
      showNotice(`WAVE ${waveRef.current}`, "#E6B325");
    }, 30000);
    return () => clearInterval(t);
  }, [phase, showNotice]);

  // ---- mystical surge: the Veil thins partway through every wave from wave 2 ----
  useEffect(() => {
    if (phase !== "playing" || wave < 2) return;
    let endT;
    const startT = setTimeout(() => {
      surgeRef.current = true;
      setSurge(true);
      audio.setMystical(true);
      audio.surge(true);
      showNotice("THE VEIL THINS — REALITY DISTORTS", "#c084fc");
      setEnemies((list) =>
        list.map((e) => {
          if (Math.random() > 0.5) return e;
          const type = pickCreatureForWave(waveRef.current);
          if (type === e.type) return e;
          const ratio = e.hp / e.maxHp;
          const maxHp = Math.round(CREATURES[type].hp * (1 + (waveRef.current - 1) * 0.12));
          return { ...e, type, maxHp, hp: Math.max(1, Math.round(maxHp * ratio)) };
        })
      );
      endT = setTimeout(() => {
        surgeRef.current = false;
        setSurge(false);
        audio.setMystical(false);
        audio.surge(false);
      }, SURGE_DURATION_MS);
    }, SURGE_DELAY_MS);
    return () => {
      clearTimeout(startT);
      clearTimeout(endT);
      surgeRef.current = false;
      setSurge(false);
      audio.setMystical(false);
    };
  }, [phase, wave, showNotice]);

  // ---- spawner ----
  useEffect(() => {
    if (phase !== "playing") return;
    const spawn = () => {
      if (enemiesRef.current.length >= MAX_ENEMIES) return;
      const a = Math.random() * Math.PI * 2;
      const r = ARENA_RADIUS - 2;
      const type = pickCreatureForWave(waveRef.current);
      const hp = Math.round(CREATURES[type].hp * (1 + (waveRef.current - 1) * 0.12));
      ENEMY_SEQ += 1;
      setEnemies((list) => [...list, { id: ENEMY_SEQ, type, x: Math.cos(a) * r, z: Math.sin(a) * r, hp, maxHp: hp }]);
    };
    const delay = Math.max(700, 2600 - waveRef.current * 220);
    const t = setInterval(spawn, delay);
    spawn();
    return () => clearInterval(t);
  }, [phase, wave]);

  // ---- death ----
  useEffect(() => {
    if (health <= 0 && phase === "playing") {
      setPhase("over");
      audio.stopAmbient();
      audio.setMystical(false);
      if (controlsRef.current) controlsRef.current.unlock();
      const survival = Math.round((Date.now() - startRef.current) / 1000);
      onGameOver({ score, kills, wave, survival_time: survival });
    }
  }, [health, phase, score, kills, wave, onGameOver]);

  const requestLock = () => {
    audio.init();
    if (phase === "playing" && controlsRef.current) controlsRef.current.lock();
  };

  return (
    <div className="fixed inset-0 bg-[#0a1512]" data-testid="game-screen">
      <Canvas shadows camera={{ position: [0, EYE_HEIGHT, 12], fov: 78, near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <Scene
          playerPosRef={playerPosRef}
          keys={keys}
          active={active}
          enemies={enemies}
          pickups={pickups}
          onHit={hitEnemy}
          onFire={fire}
          onDamagePlayer={damagePlayer}
          onCollect={collectPickup}
          controlsRef={controlsRef}
          onLockChange={setLocked}
          surgeRef={surgeRef}
          weaponKey={weaponKey}
        />
      </Canvas>

      <HUD
        player={player}
        health={health}
        weaponKey={weaponKey}
        ammo={ammoView}
        reloading={reloading}
        score={score}
        kills={kills}
        wave={wave}
        enemyCount={enemies.length}
        hitMarker={hitMarker}
        muzzle={muzzle}
        damageFlash={damageFlash}
        surge={surge}
        notice={notice}
        locked={locked}
        phase={phase}
        audioPrefs={audioPrefs}
        hasWeaponModel={!!available[`weapon_${weaponKey}`]}
        onVolume={(v) => audio.setVolume(v)}
        onToggleMute={() => audio.toggleMute()}
        onSelectWeapon={selectWeapon}
        onResume={requestLock}
        onExit={onExit}
      />
    </div>
  );
}
