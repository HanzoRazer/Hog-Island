import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Sky } from "@react-three/drei";
import * as THREE from "three";
import { CALIBERS } from "../../data/calibers";
import { getLevel, BOOTH_TARGETS, hitScore } from "./levels";
import { YD, MPH, G, ZERO_RANGES_YD, SIM_DT, dragK, solveZeroAngle, holdSolution, pointInHog } from "./ballistics";
import { BoothRange, BoothHog, BulletsLayer, HOG_HALF, HOG_CENTER_Y } from "./BoothRange";
import { audio } from "../audio";
import { submitBoothResult } from "../../lib/api";
import BoothHUD from "./BoothHUD";

const EYE = 1.6;
const BASE_FOV = 60;
const DEG = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);
const MAX_BULLETS = 48;
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let SEQ = 0;

const tmpStep = new THREE.Vector3();
const tmpPos = new THREE.Vector3();
const tmpCenter = new THREE.Vector3();
const euler = new THREE.Euler(0, 0, 0, "YXZ");

function pitchCamera(camera, d) {
  euler.setFromQuaternion(camera.quaternion, "YXZ");
  euler.x = clamp(euler.x + d, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
  camera.quaternion.setFromEuler(euler);
}

function stepBullets(s, dt) {
  let remaining = dt;
  while (remaining > 0) {
    const h = Math.min(SIM_DT, remaining);
    remaining -= h;
    for (let i = 0; i < s.bullets.length; i++) {
      let b = s.bullets[i];
      if (!b) continue;
      const v = b.vel.length();
      b.vel.addScaledVector(b.vel, -b.k * v * h);
      b.vel.y -= G * h;
      const windFactor = Math.max(0, 1 - b.vel.dot(b.bore) / b.v0);
      tmpStep.copy(b.vel).multiplyScalar(h).addScaledVector(s.windVec, windFactor * h);
      const t = s.target;
      if (t && t.hitAt == null) {
        const n = Math.ceil(tmpStep.length() / 0.15);
        tmpCenter.set(t.pos.x, HOG_CENTER_Y, t.pos.z);
        for (let j = 1; j <= n; j++) {
          tmpPos.copy(b.pos).addScaledVector(tmpStep, j / n);
          if (pointInHog(tmpPos, tmpCenter, t.yaw, HOG_HALF)) {
            s.registerHit(tmpPos);
            s.bullets[i] = null;
            b = null;
            break;
          }
        }
        if (!b) continue;
      }
      b.pos.add(tmpStep);
      b.t += h;
      if (t && !b.crossed) {
        const bd = Math.hypot(b.pos.x, b.pos.z);
        const td = Math.hypot(t.pos.x, t.pos.z);
        if (bd >= td) {
          b.crossed = true;
          const tx = t.pos.x / td;
          const tz = t.pos.z / td;
          b.missDy = b.pos.y - HOG_CENTER_Y;
          b.missDx = b.pos.x * -tz + b.pos.z * tx;
        }
      }
      if (b.pos.y <= 0) {
        s.addPuff(b.pos, 1);
        s.registerMiss(b);
        s.bullets[i] = null;
      } else if (b.t > 8 || b.pos.lengthSq() > 1600 * 1600) {
        s.registerMiss(b);
        s.bullets[i] = null;
      }
    }
  }
}

function Sim({ S, onTick }) {
  const { camera } = useThree();
  const acc = useRef(0);
  useFrame((_, delta) => {
    const s = S.current;
    s.camera = camera;
    const dt = Math.min(delta, 0.05);
    const targetFov = s.scoped ? BASE_FOV / Math.max(1.3, s.cal.zoom) : BASE_FOV;
    camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 12);
    camera.updateProjectionMatrix();
    s.fov = camera.fov;
    if (s.resetView) {
      camera.rotation.set(0, 0, 0);
      s.resetView = false;
    }
    if (s.recoil > 0) {
      const step = s.recoil * Math.min(1, dt * 7);
      pitchCamera(camera, -step);
      s.recoil -= step;
    }
    if (s.phase !== "running" || !s.locked) return;
    const t = s.target;
    if (t) {
      if (t.hitAt == null) {
        t.pos.addScaledVector(t.dir, t.speed * dt);
        t.traveled += t.speed * dt;
        if (t.traveled >= t.len || Math.hypot(t.pos.x, t.pos.z) < 6) s.finishTarget(false);
      } else if (performance.now() - t.hitAt > 800) s.finishTarget(true);
    }
    if (s.firing && s.cal.action === "auto") s.tryFire();
    stepBullets(s, dt);
    acc.current += dt;
    if (acc.current > 0.1) {
      acc.current = 0;
      onTick();
    }
  });
  return null;
}

function Scene({ S, controlsRef, onLockChange, targetId, onTick }) {
  return (
    <>
      <PointerLockControls ref={controlsRef} selector="#pointer-lock-disabled" onLock={() => onLockChange(true)} onUnlock={() => onLockChange(false)} />
      <color attach="background" args={["#a9b8c4"]} />
      <fogExp2 attach="fog" args={["#a9b8c4", 0.0011]} />
      <Sky sunPosition={[30, 18, -60]} turbidity={6} rayleigh={1.2} />
      <hemisphereLight args={["#cfd8dc", "#3b4a2f", 0.7]} />
      <directionalLight position={[40, 60, -30]} intensity={1.4} color="#fff2d6" castShadow />
      <BoothRange />
      <BulletsLayer bulletsRef={S.current.bulletsRef} puffsRef={S.current.puffsRef} />
      {targetId != null && <BoothHog key={targetId} targetRef={S.current.targetRef} />}
      <Sim S={S} onTick={onTick} />
    </>
  );
}

export default function BoothScreen({ player, levelNum, caliberKey, onExit, onRetry, onNext }) {
  const level = getLevel(levelNum);
  const cal = CALIBERS[caliberKey];
  const controlsRef = useRef();
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState("ready");
  const [targetId, setTargetId] = useState(null);
  const [hud, setHud] = useState(null);
  const [results, setResults] = useState(null);
  const [audioPrefs, setAudioPrefs] = useState(audio.prefs());
  const timers = useRef([]);

  const S = useRef(null);
  if (S.current === null) {
    const windMph = rnd(level.windMph[0], level.windMph[1]);
    const windSign = Math.random() < 0.5 ? -1 : 1;
    const zeroIdx = 2;
    S.current = {
      cal,
      level,
      phase: "ready",
      locked: false,
      camera: null,
      fov: BASE_FOV,
      scoped: false,
      firing: false,
      recoil: 0,
      mag: cal.mag,
      reloading: false,
      lastFire: 0,
      zeroIdx,
      zeroAngle: solveZeroAngle(cal.v0, cal.bc, ZERO_RANGES_YD[zeroIdx] * YD),
      windMph,
      windSign,
      windVec: new THREE.Vector3(windSign * windMph * MPH, 0, 0),
      bullets: new Array(MAX_BULLETS).fill(null),
      bulletsRef: null,
      puffs: new Array(24).fill(null),
      puffsRef: null,
      target: null,
      targetRef: null,
      targetsDone: 0,
      shots: 0,
      hits: 0,
      streak: 0,
      bestStreak: 0,
      longestHit: 0,
      score: 0,
      feedback: null,
      muzzle: false,
    };
    S.current.bulletsRef = { current: S.current.bullets };
    S.current.puffsRef = { current: S.current.puffs };
    S.current.targetRef = { current: null };
  }

  const later = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  const snap = useCallback(() => {
    const s = S.current;
    const t = s.target;
    let target = null;
    if (t && t.hitAt == null) {
      const rangeM = Math.hypot(t.pos.x, t.pos.z);
      let bearing = 0;
      if (s.camera) {
        const f = new THREE.Vector3();
        s.camera.getWorldDirection(f);
        const ux = t.pos.x / rangeM;
        const uz = t.pos.z / rangeM;
        bearing = Math.atan2(f.x * uz - f.z * ux, f.x * ux + f.z * uz) / DEG;
      }
      const sol = holdSolution(s.cal, s.zeroAngle, rangeM, s.windSign * s.windMph * MPH);
      target = { rangeYd: Math.round(rangeM / YD), speedMph: Math.round(t.speed / MPH), bearing, ...sol, leadM: t.speed * sol.tof };
    }
    return {
      mag: s.mag,
      magSize: s.cal.mag,
      reloading: s.reloading,
      zeroYd: ZERO_RANGES_YD[s.zeroIdx],
      windMph: Math.round(s.windMph),
      windSign: s.windSign,
      scoped: s.scoped,
      fov: s.fov,
      shots: s.shots,
      hits: s.hits,
      streak: s.streak,
      score: s.score,
      targetsDone: s.targetsDone,
      target,
      feedback: s.feedback,
      muzzle: s.muzzle,
    };
  }, []);
  const push = useCallback(() => setHud(snap()), [snap]);

  useEffect(() => {
    const s = S.current;
    s.addPuff = (pos, size) => {
      const idx = s.puffs.findIndex((p) => !p);
      if (idx !== -1) s.puffs[idx] = { x: pos.x, y: Math.max(0.05, pos.y), z: pos.z, at: performance.now(), size };
    };
    s.setFeedback = (type, text) => {
      s.feedback = { id: ++SEQ, type, text };
      push();
    };
    s.registerHit = (pos) => {
      const t = s.target;
      if (!t || t.hitAt != null) return;
      t.hitAt = performance.now();
      const rangeYd = Math.hypot(t.pos.x, t.pos.z) / YD;
      const pts = hitScore(rangeYd, t.speed / MPH, s.streak);
      s.streak += 1;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
      s.hits += 1;
      s.score += pts;
      s.longestHit = Math.max(s.longestHit, Math.round(rangeYd));
      s.addPuff(pos, 0.5);
      audio.kill();
      s.setFeedback("hit", `HIT · ${Math.round(rangeYd)} yd · +${pts}`);
    };
    s.registerMiss = (b) => {
      const t = s.target;
      if (!t || t.hitAt != null) return;
      if (b.crossed) {
        const fmt = (m) => {
          const inches = Math.abs(m) / 0.0254;
          return inches < 36 ? `${Math.round(inches)} in` : `${(Math.abs(m) / YD).toFixed(1)} yd`;
        };
        s.setFeedback("miss", `MISS · ${fmt(b.missDy)} ${b.missDy > 0 ? "HIGH" : "LOW"} · ${fmt(b.missDx)} ${b.missDx > 0 ? "RIGHT" : "LEFT"}`);
      } else {
        const shortYd = (Math.hypot(t.pos.x, t.pos.z) - Math.hypot(b.pos.x, b.pos.z)) / YD;
        s.setFeedback("miss", `MISS · SHORT by ${Math.max(1, Math.round(shortYd))} yd`);
      }
    };
    s.spawnTarget = () => {
      if (s.phase !== "running") return;
      const L = s.level;
      const rangeYd = rnd(L.rangeYd[0], L.rangeYd[1]);
      const r = rangeYd * YD;
      const side = Math.random() < 0.5 ? 1 : -1;
      const dev = (Math.random() * 2 - 1) * L.angle * DEG;
      const dir = new THREE.Vector3(side * Math.cos(dev), 0, Math.sin(dev)).normalize();
      const len = clamp(r * 0.5, 12, 160);
      const center = new THREE.Vector3((Math.random() - 0.5) * r * 0.1, 0, -r);
      const pos = center.clone().addScaledVector(dir, -len / 2);
      const speed = rnd(L.speedMph[0], L.speedMph[1]) * MPH;
      SEQ += 1;
      s.target = { id: SEQ, pos, dir, speed, len, traveled: 0, yaw: Math.atan2(-dir.z, dir.x), hitAt: null };
      s.targetRef.current = s.target;
      setTargetId(SEQ);
      if (s.camera) {
        const sp = audio.spatial(pos, s.camera);
        audio.roar("shifthog", 0.85, sp.pan, Math.max(0.15, sp.gain));
      }
      push();
    };
    s.finishTarget = (hit) => {
      if (!s.target) return;
      if (!hit) {
        s.streak = 0;
        s.setFeedback("escaped", "TARGET ESCAPED");
      }
      s.target = null;
      s.targetRef.current = null;
      setTargetId(null);
      s.targetsDone += 1;
      push();
      if (s.targetsDone >= BOOTH_TARGETS) s.endSession();
      else later(s.spawnTarget, 1200);
    };
    s.tryFire = () => {
      const now = performance.now();
      if (s.reloading || now - s.lastFire < s.cal.cycleMs) return;
      if (s.mag <= 0) {
        audio.dryfire();
        s.reload();
        return;
      }
      s.mag -= 1;
      s.lastFire = now;
      s.shots += 1;
      audio.shot(s.cal.sound);
      const cam = s.camera;
      const dir = new THREE.Vector3();
      cam.getWorldDirection(dir);
      const right = new THREE.Vector3().crossVectors(dir, UP).normalize();
      const upv = new THREE.Vector3().crossVectors(right, dir).normalize();
      const bore = dir.clone().applyAxisAngle(right, s.zeroAngle).normalize();
      const pellets = s.cal.pellets || 1;
      for (let i = 0; i < pellets; i++) {
        const d = bore.clone();
        if (s.cal.spread) d.addScaledVector(right, (Math.random() - 0.5) * 2 * s.cal.spread).addScaledVector(upv, (Math.random() - 0.5) * 2 * s.cal.spread).normalize();
        const idx = s.bullets.findIndex((b) => !b);
        if (idx === -1) break;
        s.bullets[idx] = { pos: cam.position.clone(), vel: d.clone().multiplyScalar(s.cal.v0), bore: d, v0: s.cal.v0, k: dragK(s.cal.bc), t: 0, crossed: false };
      }
      const kick = s.cal.recoil * DEG * rnd(0.8, 1.2);
      pitchCamera(cam, kick);
      s.recoil += kick;
      s.muzzle = true;
      later(() => {
        s.muzzle = false;
        push();
      }, 60);
      push();
    };
    s.reload = () => {
      if (s.reloading || s.mag === s.cal.mag) return;
      s.reloading = true;
      audio.reload(s.cal.reloadMs);
      push();
      later(() => {
        s.mag = s.cal.mag;
        s.reloading = false;
        push();
      }, s.cal.reloadMs);
    };
    s.adjustZero = (d) => {
      const idx = clamp(s.zeroIdx + d, 0, ZERO_RANGES_YD.length - 1);
      if (idx === s.zeroIdx) return;
      s.zeroIdx = idx;
      s.zeroAngle = solveZeroAngle(s.cal.v0, s.cal.bc, ZERO_RANGES_YD[idx] * YD);
      audio.swap();
      push();
    };
    s.endSession = () => {
      s.phase = "done";
      setPhase("done");
      audio.stopAmbient();
      if (controlsRef.current) controlsRef.current.unlock();
      const passed = s.hits >= s.level.passHits;
      const local = { hits: s.hits, shots: s.shots, score: s.score, bestStreak: s.bestStreak, longestHit: s.longestHit, passed, submitting: true, server: null };
      setResults(local);
      submitBoothResult({
        player_id: player.id,
        name: player.name,
        level: s.level.level,
        caliber: s.cal.name,
        hits: s.hits,
        shots: s.shots,
        score: s.score,
        best_streak: s.bestStreak,
        longest_hit_yd: s.longestHit,
      })
        .then((r) => setResults({ ...local, submitting: false, server: r }))
        .catch(() => setResults({ ...local, submitting: false, server: null }));
    };
    push();
  }, [later, push, player]);

  useEffect(() => audio.subscribe(setAudioPrefs), []);
  useEffect(() => {
    S.current.locked = locked;
    if (locked && phase === "ready") {
      S.current.phase = "running";
      S.current.resetView = true;
      setPhase("running");
      audio.startAmbient();
      later(S.current.spawnTarget, 900);
    }
  }, [locked, phase, later]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      audio.stopAmbient();
    },
    []
  );

  useEffect(() => {
    const s = S.current;
    const down = (e) => {
      if (document.pointerLockElement == null || s.phase !== "running") return;
      if (e.button === 0) {
        s.firing = true;
        if (s.cal.action !== "auto") s.tryFire();
      } else if (e.button === 2) {
        s.scoped = true;
        if (controlsRef.current) controlsRef.current.pointerSpeed = 1 / s.cal.zoom;
        push();
      }
    };
    const up = (e) => {
      if (e.button === 0) s.firing = false;
      if (e.button === 2) {
        s.scoped = false;
        if (controlsRef.current) controlsRef.current.pointerSpeed = 1;
        push();
      }
    };
    const key = (e) => {
      if (e.code === "KeyR") s.reload();
      else if (e.code === "KeyM") audio.toggleMute();
      else if (e.code === "ArrowUp" || e.code === "BracketRight") s.adjustZero(1);
      else if (e.code === "ArrowDown" || e.code === "BracketLeft") s.adjustZero(-1);
      else if (e.code === "Escape" && document.pointerLockElement) document.exitPointerLock();
    };
    const wheel = (e) => {
      if (document.pointerLockElement != null) s.adjustZero(e.deltaY < 0 ? 1 : -1);
    };
    const ctx = (e) => e.preventDefault();
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("keydown", key);
    window.addEventListener("wheel", wheel);
    window.addEventListener("contextmenu", ctx);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("keydown", key);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("contextmenu", ctx);
    };
  }, [push]);

  useEffect(() => {
    const h = () => setLocked(document.pointerLockElement != null);
    document.addEventListener("pointerlockchange", h);
    return () => document.removeEventListener("pointerlockchange", h);
  }, []);

  const requestLock = () => {
    audio.init();
    if (phase !== "done" && controlsRef.current) controlsRef.current.lock();
  };

  return (
    <div className="fixed inset-0 bg-[#a9b8c4]" data-testid="booth-screen">
      <Canvas shadows camera={{ position: [0, EYE, 0], rotation: [0, 0, 0], fov: BASE_FOV, near: 0.1, far: 3000 }} gl={{ antialias: true }}>
        <Scene S={S} controlsRef={controlsRef} onLockChange={setLocked} targetId={targetId} onTick={push} />
      </Canvas>
      {hud && (
        <BoothHUD
          hud={hud}
          cal={cal}
          level={level}
          locked={locked}
          phase={phase}
          results={results}
          audioPrefs={audioPrefs}
          onResume={requestLock}
          onExit={onExit}
          onRetry={onRetry}
          onNext={onNext}
          onZero={(d) => S.current.adjustZero(d)}
          onVolume={(v) => audio.setVolume(v)}
          onToggleMute={() => audio.toggleMute()}
        />
      )}
    </div>
  );
}
