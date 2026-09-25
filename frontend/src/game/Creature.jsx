import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CREATURES } from "../data/creatures";
import { ModelSlot } from "./ModelSlot";
import { audio } from "./audio";

function PlaceholderBeast({ c, s }) {
  const legs = [
    [0.35, 0.7],
    [-0.35, 0.7],
    [0.35, -0.7],
    [-0.35, -0.7],
  ];
  return (
    <>
      <mesh castShadow>
        <boxGeometry args={[0.9 * s, 0.8 * s, 1.7 * s]} />
        <meshStandardMaterial color={c.color} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.25 * s, 1.05 * s]}>
        <boxGeometry args={[0.7 * s, 0.6 * s, 0.7 * s]} />
        <meshStandardMaterial color={c.color} roughness={0.8} />
      </mesh>
      {[0.2, -0.2].map((ex) => (
        <mesh key={ex} position={[ex * s, 0.32 * s, 1.4 * s]}>
          <sphereGeometry args={[0.08 * s, 8, 8]} />
          <meshStandardMaterial color={c.eye} emissive={c.eye} emissiveIntensity={2.2} />
        </mesh>
      ))}
      {legs.map(([lx, lz], i) => (
        <mesh key={i} castShadow position={[lx * s, -0.6 * s, lz * s]}>
          <boxGeometry args={[0.22 * s, 0.7 * s, 0.22 * s]} />
          <meshStandardMaterial color={c.color} roughness={0.9} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.15 * s, -1.1 * s]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.18 * s, 0.18 * s, 0.9 * s]} />
        <meshStandardMaterial color={c.color} roughness={0.9} />
      </mesh>
    </>
  );
}

export function Creature({ data, playerPosRef, onDamagePlayer, active, surgeRef }) {
  const c = CREATURES[data.type];
  const group = useRef();
  const bar = useRef();
  const pos = useRef(new THREE.Vector3(data.x, 0, data.z));
  const attackCd = useRef(0);
  const roarCd = useRef(0.4 + Math.random() * 3);
  const { camera } = useThree();
  const s = c.scale;
  const bodyH = 0.9 * s;
  const ud = useMemo(() => ({ enemyId: data.id }), [data.id]);

  useFrame((_, delta) => {
    const g = group.current;
    const p = playerPosRef.current;
    if (!g || !p) return;
    const dt = Math.min(delta, 0.05);
    const dir = new THREE.Vector3(p.x - pos.current.x, 0, p.z - pos.current.z);
    const dist = dir.length();
    const reach = 2.4 * s;
    const speed = c.speed * (surgeRef.current ? 1.25 : 1);
    if (active.current && dist > reach) {
      dir.normalize();
      pos.current.x += dir.x * speed * dt;
      pos.current.z += dir.z * speed * dt;
    } else if (active.current) {
      attackCd.current -= dt;
      if (attackCd.current <= 0) {
        attackCd.current = 1;
        onDamagePlayer(c.damage);
      }
    }
    if (active.current) {
      roarCd.current -= dt;
      if (roarCd.current <= 0) {
        roarCd.current = 7 + Math.random() * 9;
        if (dist < 48) {
          const sp = audio.spatial(pos.current, camera);
          audio.roar(c.key, s, sp.pan, sp.gain);
        }
      }
    }
    const bob = Math.sin(performance.now() * 0.006 + data.id) * 0.06 * s;
    g.position.set(pos.current.x, bodyH + bob, pos.current.z);
    g.lookAt(p.x, bodyH, p.z);
    if (bar.current) bar.current.lookAt(camera.position);
  });

  const ratio = Math.max(0, Math.min(1, data.hp / data.maxHp));

  return (
    <group ref={group}>
      <group userData={ud}>
        <ModelSlot slot={c.key} scale={s} fallback={<PlaceholderBeast c={c} s={s} />} userData={ud} />
      </group>
      <group ref={bar} position={[0, 1.0 * s, 0]}>
        <mesh>
          <planeGeometry args={[1.1 * s, 0.14 * s]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-(1.1 * s) / 2 + (1.05 * s * ratio) / 2, 0, 0.01]}>
          <planeGeometry args={[Math.max(0.001, 1.05 * s * ratio), 0.1 * s]} />
          <meshBasicMaterial color={ratio > 0.5 ? "#10B981" : ratio > 0.25 ? "#E6B325" : "#FF3B30"} />
        </mesh>
      </group>
    </group>
  );
}
