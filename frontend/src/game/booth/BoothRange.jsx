import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { YD, ZERO_RANGES_YD } from "./ballistics";
import { CREATURES } from "../../data/creatures";

export const HOG_HALF = { x: 0.75, y: 0.4, z: 0.25 };
export const HOG_CENTER_Y = 0.55;

// Open firing lane stretching 1000 yd down -Z, with range posts, berms and tree lines.
export function BoothRange() {
  const trees = useMemo(
    () =>
      Array.from({ length: 90 }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const z = -20 - Math.random() * 950;
        const spread = 40 + (-z / 1000) * 220;
        return { x: side * (spread + Math.random() * 60), z, s: 2 + Math.random() * 3 };
      }),
    []
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3000, 3000]} />
        <meshStandardMaterial color="#3b4a2f" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -500]} receiveShadow>
        <planeGeometry args={[260, 1000]} />
        <meshStandardMaterial color="#5a5a3a" roughness={1} />
      </mesh>
      {/* booth */}
      <mesh position={[0, 1.1, 0.9]} castShadow>
        <boxGeometry args={[2.6, 0.9, 0.5]} />
        <meshStandardMaterial color="#4a3a28" roughness={1} />
      </mesh>
      <mesh position={[0, 2.9, 0.4]} castShadow>
        <boxGeometry args={[3.2, 0.12, 2.4]} />
        <meshStandardMaterial color="#2b2f33" roughness={1} />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 1.5, 1.4]}>
          <boxGeometry args={[0.12, 3, 0.12]} />
          <meshStandardMaterial color="#2b2f33" />
        </mesh>
      ))}
      {/* range posts + berms */}
      {ZERO_RANGES_YD.map((yd) => {
        const z = -yd * YD;
        const w = 6 + yd * 0.03;
        return (
          <group key={yd} position={[0, 0, z]}>
            {[-1, 1].map((s) => (
              <group key={s} position={[s * (14 + yd * 0.04), 0, 0]}>
                <mesh position={[0, 1.5, 0]}>
                  <boxGeometry args={[0.3, 3, 0.3]} />
                  <meshStandardMaterial color="#e6b325" />
                </mesh>
                <mesh position={[0, 3.4, 0]}>
                  <boxGeometry args={[2.4, 1.2, 0.1]} />
                  <meshStandardMaterial color="#f1f5f9" />
                </mesh>
              </group>
            ))}
            <mesh position={[0, 0.5, -3]} receiveShadow>
              <boxGeometry args={[w, 1, 1.5]} />
              <meshStandardMaterial color="#6b5a3a" roughness={1} />
            </mesh>
          </group>
        );
      })}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, 1.4 * t.s, 0]}>
            <cylinderGeometry args={[0.18 * t.s, 0.26 * t.s, 2.8 * t.s, 5]} />
            <meshStandardMaterial color="#3a2a1e" />
          </mesh>
          <mesh position={[0, 3.0 * t.s, 0]}>
            <coneGeometry args={[1.3 * t.s, 2.6 * t.s, 6]} />
            <meshStandardMaterial color="#1f3a22" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// The running hog. Position/heading come from the sim ref; falls over when hit.
export function BoothHog({ targetRef }) {
  const group = useRef();
  const c = CREATURES.shifthog;
  const s = 1;
  useFrame((_, dt) => {
    const t = targetRef.current;
    const g = group.current;
    if (!t || !g) return;
    g.position.set(t.pos.x, 0, t.pos.z);
    g.rotation.y = t.yaw;
    if (t.hitAt != null) {
      g.rotation.z = Math.min(Math.PI / 2, g.rotation.z + dt * 5);
      g.position.y = -Math.min(0.3, (g.rotation.z / (Math.PI / 2)) * 0.3);
    }
    const bob = t.hitAt == null ? Math.abs(Math.sin(performance.now() * 0.012)) * 0.08 : 0;
    g.position.y += bob;
  });
  return (
    <group ref={group}>
      <group position={[0, HOG_CENTER_Y, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.5 * s, 0.8 * s, 0.5 * s]} />
          <meshStandardMaterial color={c.color} roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0.95 * s, 0.1 * s, 0]}>
          <boxGeometry args={[0.55 * s, 0.5 * s, 0.4 * s]} />
          <meshStandardMaterial color={c.color} roughness={0.8} />
        </mesh>
        {[0.2, -0.2].map((ez) => (
          <mesh key={ez} position={[1.2 * s, 0.2 * s, ez * s]}>
            <sphereGeometry args={[0.06 * s, 6, 6]} />
            <meshStandardMaterial color={c.eye} emissive={c.eye} emissiveIntensity={2} />
          </mesh>
        ))}
        {[
          [0.5, 0.18],
          [0.5, -0.18],
          [-0.5, 0.18],
          [-0.5, -0.18],
        ].map(([lx, lz], i) => (
          <mesh key={i} castShadow position={[lx * s, -0.55 * s, lz * s]}>
            <boxGeometry args={[0.18 * s, 0.5 * s, 0.18 * s]} />
            <meshStandardMaterial color={c.color} roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

const MAX_BULLETS = 48;
const MAX_PUFFS = 24;
const dummy = new THREE.Object3D();

// Instanced tracers + impact dust, driven straight from sim refs each frame.
export function BulletsLayer({ bulletsRef, puffsRef }) {
  const bullets = useRef();
  const puffs = useRef();
  useFrame(() => {
    const bm = bullets.current;
    if (bm) {
      const list = bulletsRef.current;
      for (let i = 0; i < MAX_BULLETS; i++) {
        const b = list[i];
        if (b) {
          dummy.position.copy(b.pos);
          const sc = 0.04 + b.pos.distanceTo(bm.parent.position) * 0.0025;
          dummy.scale.setScalar(sc);
        } else dummy.scale.setScalar(0);
        dummy.updateMatrix();
        bm.setMatrixAt(i, dummy.matrix);
      }
      bm.instanceMatrix.needsUpdate = true;
    }
    const pm = puffs.current;
    if (pm) {
      const now = performance.now();
      const list = puffsRef.current;
      for (let i = 0; i < MAX_PUFFS; i++) {
        const p = list[i];
        if (p) {
          const age = (now - p.at) / 1400;
          if (age >= 1) {
            list[i] = null;
            dummy.scale.setScalar(0);
          } else {
            dummy.position.set(p.x, p.y + age * 0.8, p.z);
            const sc = (0.3 + age * 1.6) * p.size;
            dummy.scale.set(sc, sc * 0.6, sc);
          }
        } else dummy.scale.setScalar(0);
        dummy.updateMatrix();
        pm.setMatrixAt(i, dummy.matrix);
      }
      pm.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group>
      <instancedMesh ref={bullets} args={[null, null, MAX_BULLETS]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#ffd27a" />
      </instancedMesh>
      <instancedMesh ref={puffs} args={[null, null, MAX_PUFFS]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#b9a88a" transparent opacity={0.65} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}
