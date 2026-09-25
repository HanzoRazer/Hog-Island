import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Sky } from "@react-three/drei";
import * as THREE from "three";
import { CREATURES, pickCreatureForWave } from "../data/creatures";
import HUD from "./HUD";

const ARENA_RADIUS = 46;
const EYE_HEIGHT = 1.7;
const MOVE_SPEED = 6.2;
const MAG_SIZE = 12;
const RELOAD_MS = 1200;
const WEAPON_DAMAGE = 34;
const MAX_ENEMIES = 14;

let ENEMY_SEQ = 0;

// ------------------------- input hook -------------------------
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

// ------------------------- player controller -------------------------
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

// ------------------------- a single beast -------------------------
function Creature({ data, playerPosRef, onDamagePlayer, active }) {
  const c = CREATURES[data.type];
  const group = useRef();
  const bar = useRef();
  const pos = useRef(new THREE.Vector3(data.x, 0, data.z));
  const attackCd = useRef(0);
  const { camera } = useThree();
  const s = c.scale;
  const bodyH = 0.9 * s;

  useFrame((_, delta) => {
    const g = group.current;
    const p = playerPosRef.current;
    if (!g || !p) return;
    const dt = Math.min(delta, 0.05);
    const dir = new THREE.Vector3(p.x - pos.current.x, 0, p.z - pos.current.z);
    const dist = dir.length();
    const reach = 2.4 * s;
    if (active.current && dist > reach) {
      dir.normalize();
      pos.current.x += dir.x * c.speed * dt;
      pos.current.z += dir.z * c.speed * dt;
    } else if (active.current) {
      attackCd.current -= dt;
      if (attackCd.current <= 0) {
        attackCd.current = 1;
        onDamagePlayer(c.damage);
      }
    }
    const bob = Math.sin(performance.now() * 0.006 + data.id) * 0.06 * s;
    g.position.set(pos.current.x, bodyH + bob, pos.current.z);
    g.lookAt(p.x, bodyH, p.z);
    if (bar.current) bar.current.lookAt(camera.position);
  });

  const ratio = Math.max(0, data.hp / c.hp);
  const ud = { enemyId: data.id };

  return (
    <group ref={group}>
      {/* torso */}
      <mesh castShadow userData={ud} position={[0, 0, 0]}>
        <boxGeometry args={[0.9 * s, 0.8 * s, 1.7 * s]} />
        <meshStandardMaterial color={c.color} roughness={0.85} />
      </mesh>
      {/* head */}
      <mesh castShadow userData={ud} position={[0, 0.25 * s, 1.05 * s]}>
        <boxGeometry args={[0.7 * s, 0.6 * s, 0.7 * s]} />
        <meshStandardMaterial color={c.color} roughness={0.8} />
      </mesh>
      {/* eyes */}
      <mesh position={[0.2 * s, 0.32 * s, 1.4 * s]}>
        <sphereGeometry args={[0.08 * s, 8, 8]} />
        <meshStandardMaterial color={c.eye} emissive={c.eye} emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[-0.2 * s, 0.32 * s, 1.4 * s]}>
        <sphereGeometry args={[0.08 * s, 8, 8]} />
        <meshStandardMaterial color={c.eye} emissive={c.eye} emissiveIntensity={2.2} />
      </mesh>
      {/* legs */}
      {[
        [0.35, 0.7],
        [-0.35, 0.7],
        [0.35, -0.7],
        [-0.35, -0.7],
      ].map(([lx, lz], i) => (
        <mesh key={i} castShadow userData={ud} position={[lx * s, -0.6 * s, lz * s]}>
          <boxGeometry args={[0.22 * s, 0.7 * s, 0.22 * s]} />
          <meshStandardMaterial color={c.color} roughness={0.9} />
        </mesh>
      ))}
      {/* tail / crest for larger beasts */}
      <mesh castShadow userData={ud} position={[0, 0.15 * s, -1.1 * s]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.18 * s, 0.18 * s, 0.9 * s]} />
        <meshStandardMaterial color={c.color} roughness={0.9} />
      </mesh>
      {/* health bar */}
      <group ref={bar} position={[0, 1.0 * s, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.1 * s, 0.14 * s]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-(1.1 * s) / 2 + (1.05 * s * ratio) / 2, 0, 0.01]}>
          <planeGeometry args={[1.05 * s * ratio, 0.1 * s]} />
          <meshBasicMaterial color={ratio > 0.5 ? "#10B981" : ratio > 0.25 ? "#E6B325" : "#FF3B30"} />
        </mesh>
      </group>
    </group>
  );
}

// ------------------------- shooting (hitscan) -------------------------
function Shooter({ enemiesGroupRef, onHit, onFire, active }) {
  const { camera, raycaster } = useThree();
  useEffect(() => {
    const onDown = () => {
      if (!active.current || document.pointerLockElement == null) return;
      const fired = onFire();
      if (!fired) return;
      raycaster.setFromCamera({ x: 0, y: 0 }, camera);
      const grp = enemiesGroupRef.current;
      if (!grp) return;
      const hits = raycaster.intersectObjects(grp.children, true);
      const hit = hits.find((h) => {
        let o = h.object;
        while (o) {
          if (o.userData && o.userData.enemyId) return true;
          o = o.parent;
        }
        return false;
      });
      if (hit) {
        let o = hit.object;
        while (o && !(o.userData && o.userData.enemyId)) o = o.parent;
        if (o) onHit(o.userData.enemyId);
      }
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [camera, raycaster, enemiesGroupRef, onHit, onFire, active]);
  return null;
}

// ------------------------- environment / map -------------------------
function Island() {
  const rocks = useRef(
    Array.from({ length: 22 }).map(() => {
      const a = Math.random() * Math.PI * 2;
      const r = 8 + Math.random() * 34;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        s: 0.6 + Math.random() * 2.2,
        rot: Math.random() * Math.PI,
        type: Math.random() > 0.5 ? "rock" : "tree",
      };
    })
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[ARENA_RADIUS + 6, 64]} />
        <meshStandardMaterial color="#1c2b24" roughness={1} />
      </mesh>
      {/* mire pools */}
      {[
        [14, -10, 5],
        [-18, 8, 6],
        [6, 20, 4],
      ].map(([x, z, r], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
          <circleGeometry args={[r, 32]} />
          <meshStandardMaterial color="#05100e" emissive="#062b25" emissiveIntensity={0.4} roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
      {rocks.current.map((o, i) =>
        o.type === "rock" ? (
          <mesh key={i} position={[o.x, o.s * 0.5, o.z]} rotation={[0, o.rot, 0]} castShadow>
            <dodecahedronGeometry args={[o.s, 0]} />
            <meshStandardMaterial color="#2b2f33" roughness={1} />
          </mesh>
        ) : (
          <group key={i} position={[o.x, 0, o.z]}>
            <mesh position={[0, 1.4 * o.s, 0]} castShadow>
              <cylinderGeometry args={[0.18 * o.s, 0.26 * o.s, 2.8 * o.s, 6]} />
              <meshStandardMaterial color="#3a2a1e" roughness={1} />
            </mesh>
            <mesh position={[0, 3.0 * o.s, 0]} castShadow>
              <coneGeometry args={[1.3 * o.s, 2.4 * o.s, 7]} />
              <meshStandardMaterial color="#16341f" roughness={1} />
            </mesh>
          </group>
        )
      )}
      {/* ring wall of standing stones marking the arena edge */}
      {Array.from({ length: 40 }).map((_, i) => {
        const a = (i / 40) * Math.PI * 2;
        return (
          <mesh
            key={`w${i}`}
            position={[Math.cos(a) * (ARENA_RADIUS + 2), 1.6, Math.sin(a) * (ARENA_RADIUS + 2)]}
            rotation={[0, -a, 0]}
            castShadow
          >
            <boxGeometry args={[1.4, 3.2, 0.8]} />
            <meshStandardMaterial color="#20242a" roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// ------------------------- scene root -------------------------
function Scene({ playerPosRef, keys, active, enemies, onHit, onFire, onDamagePlayer, controlsRef, onLockChange }) {
  const enemiesGroupRef = useRef();
  return (
    <>
      <PointerLockControls
        ref={controlsRef}
        onLock={() => onLockChange(true)}
        onUnlock={() => onLockChange(false)}
      />
      <color attach="background" args={["#0a1512"]} />
      <fogExp2 attach="fog" args={["#0a1512", 0.028]} />
      <Sky sunPosition={[5, 1, 8]} turbidity={12} rayleigh={0.4} inclination={0.48} />
      <hemisphereLight args={["#3a5a4a", "#0a0f0c", 0.5]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[20, 30, 10]} intensity={0.8} color="#9fb8c9" castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#1fd3a3" distance={60} />

      <Island />

      <Player playerPosRef={playerPosRef} keys={keys} active={active} />
      <Shooter enemiesGroupRef={enemiesGroupRef} onHit={onHit} onFire={onFire} active={active} />

      <group ref={enemiesGroupRef}>
        {enemies.map((e) => (
          <Creature
            key={e.id}
            data={e}
            playerPosRef={playerPosRef}
            onDamagePlayer={onDamagePlayer}
            active={active}
          />
        ))}
      </group>
    </>
  );
}

// ------------------------- game screen wrapper -------------------------
export default function GameScreen({ player, onExit, onGameOver }) {
  const keys = useKeys();
  const playerPosRef = useRef(new THREE.Vector3(0, EYE_HEIGHT, 12));
  const controlsRef = useRef();
  const active = useRef(false); // gameplay running (pointer locked, not over)

  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState("playing"); // playing | over
  const [enemies, setEnemies] = useState([]);
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(MAG_SIZE);
  const [reloading, setReloading] = useState(false);
  const [score, setScore] = useState(0);
  const [kills, setKills] = useState(0);
  const [wave, setWave] = useState(1);
  const [hitMarker, setHitMarker] = useState(null); // 'hit' | 'kill'
  const [muzzle, setMuzzle] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);

  const startRef = useRef(Date.now());
  const healthRef = useRef(100);
  const waveRef = useRef(1);
  const enemiesRef = useRef([]);
  enemiesRef.current = enemies;
  const reloadingRef = useRef(false);

  active.current = locked && phase === "playing";

  // damage the player
  const damagePlayer = useCallback((dmg) => {
    if (phase !== "playing") return;
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 160);
    setHealth((h) => {
      const nh = Math.max(0, h - dmg);
      healthRef.current = nh;
      return nh;
    });
  }, [phase]);

  // fire a round; returns whether a shot was fired
  const fire = useCallback(() => {
    if (reloadingRef.current) return false;
    if (ammoRef.current <= 0) return false;
    ammoRef.current -= 1;
    setAmmo(ammoRef.current);
    setMuzzle(true);
    setTimeout(() => setMuzzle(false), 70);
    return true;
  }, []);
  const ammoRef = useRef(MAG_SIZE);

  const reload = useCallback(() => {
    if (reloadingRef.current || ammoRef.current === MAG_SIZE) return;
    reloadingRef.current = true;
    setReloading(true);
    setTimeout(() => {
      ammoRef.current = MAG_SIZE;
      setAmmo(MAG_SIZE);
      reloadingRef.current = false;
      setReloading(false);
    }, RELOAD_MS);
  }, []);

  // register a bullet hit on an enemy id
  const hitEnemy = useCallback((id) => {
    setEnemies((list) => {
      const idx = list.findIndex((e) => e.id === id);
      if (idx === -1) return list;
      const e = list[idx];
      const nh = e.hp - WEAPON_DAMAGE;
      if (nh <= 0) {
        const c = CREATURES[e.type];
        setScore((s) => s + c.points);
        setKills((k) => k + 1);
        setHitMarker("kill");
        setTimeout(() => setHitMarker(null), 220);
        const next = list.slice();
        next.splice(idx, 1);
        return next;
      }
      setHitMarker("hit");
      setTimeout(() => setHitMarker(null), 120);
      const next = list.slice();
      next[idx] = { ...e, hp: nh };
      return next;
    });
  }, []);

  // reload key
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "KeyR") reload();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reload]);

  // pointer lock change safety (also handled by controls callbacks)
  useEffect(() => {
    const h = () => setLocked(document.pointerLockElement != null);
    document.addEventListener("pointerlockchange", h);
    return () => document.removeEventListener("pointerlockchange", h);
  }, []);

  // wave escalation timer
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      waveRef.current += 1;
      setWave(waveRef.current);
    }, 30000);
    return () => clearInterval(t);
  }, [phase]);

  // spawner
  useEffect(() => {
    if (phase !== "playing") return;
    const spawn = () => {
      if (enemiesRef.current.length >= MAX_ENEMIES) return;
      const a = Math.random() * Math.PI * 2;
      const r = ARENA_RADIUS - 2;
      const type = pickCreatureForWave(waveRef.current);
      const base = CREATURES[type];
      const hpScale = 1 + (waveRef.current - 1) * 0.12;
      const hp = Math.round(base.hp * hpScale);
      ENEMY_SEQ += 1;
      setEnemies((list) => [
        ...list,
        {
          id: ENEMY_SEQ,
          type,
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          hp,
        },
      ]);
    };
    const delay = Math.max(700, 2600 - waveRef.current * 220);
    const t = setInterval(spawn, delay);
    // immediate first spawn
    spawn();
    return () => clearInterval(t);
  }, [phase, wave]);

  // game over on death
  useEffect(() => {
    if (health <= 0 && phase === "playing") {
      setPhase("over");
      if (controlsRef.current) controlsRef.current.unlock();
      const survival = Math.round((Date.now() - startRef.current) / 1000);
      onGameOver({ score, kills, wave, survival_time: survival });
    }
  }, [health, phase, score, kills, wave, onGameOver]);

  const requestLock = () => {
    if (phase === "playing" && controlsRef.current) controlsRef.current.lock();
  };

  return (
    <div className="fixed inset-0 bg-[#0a1512]" data-testid="game-screen">
      <Canvas
        shadows
        camera={{ position: [0, EYE_HEIGHT, 12], fov: 78, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        <Scene
          playerPosRef={playerPosRef}
          keys={keys}
          active={active}
          enemies={enemies}
          onHit={hitEnemy}
          onFire={fire}
          onDamagePlayer={damagePlayer}
          controlsRef={controlsRef}
          onLockChange={setLocked}
        />
      </Canvas>

      <HUD
        player={player}
        health={health}
        ammo={ammo}
        magSize={MAG_SIZE}
        reloading={reloading}
        score={score}
        kills={kills}
        wave={wave}
        enemyCount={enemies.length}
        hitMarker={hitMarker}
        muzzle={muzzle}
        damageFlash={damageFlash}
        locked={locked}
        phase={phase}
        onResume={requestLock}
        onReload={reload}
        onExit={onExit}
      />
    </div>
  );
}
