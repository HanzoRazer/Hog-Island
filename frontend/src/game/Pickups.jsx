import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ModelSlot } from "./ModelSlot";

export const PICKUP_DEFS = {
  health: { name: "Vitality Moss", color: "#10B981", amount: 35 },
  ammo: { name: "Warden Cache", color: "#E6B325" },
};

const PICKUP_COUNT = 8;
const COLLECT_RADIUS = 2.1;

export function makePickupPoints() {
  return Array.from({ length: PICKUP_COUNT }).map((_, i) => {
    const a = (i / PICKUP_COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const r = 10 + Math.random() * 26;
    return { id: i + 1, type: i % 2 === 0 ? "health" : "ammo", x: Math.cos(a) * r, z: Math.sin(a) * r, active: true };
  });
}

function HealthFallback() {
  return (
    <>
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.24, 0.24]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.9} />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[0.24, 0.7, 0.24]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.9} />
      </mesh>
    </>
  );
}

function AmmoFallback() {
  return (
    <>
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.45, 0.45]} />
        <meshStandardMaterial color="#E6B325" emissive="#E6B325" emissiveIntensity={0.5} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.72, 0.12, 0.47]} />
        <meshStandardMaterial color="#15181c" />
      </mesh>
    </>
  );
}

function Pickup({ data }) {
  const ref = useRef();
  const def = PICKUP_DEFS[data.type];
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime + data.id;
    g.position.y = 1.0 + Math.sin(t * 2) * 0.15;
    g.rotation.y = t * 1.2;
  });
  return (
    <group position={[data.x, 0, data.z]}>
      <group ref={ref}>
        <ModelSlot slot={`pickup_${data.type}`} fallback={data.type === "health" ? <HealthFallback /> : <AmmoFallback />} />
      </group>
      <pointLight position={[0, 1.2, 0]} color={def.color} intensity={1.4} distance={6} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.7, 0.9, 32]} />
        <meshBasicMaterial color={def.color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export function Pickups({ pickups, playerPosRef, onCollect, active }) {
  useFrame(() => {
    if (!active.current) return;
    const p = playerPosRef.current;
    for (const pk of pickups) {
      if (!pk.active) continue;
      const dx = p.x - pk.x;
      const dz = p.z - pk.z;
      if (dx * dx + dz * dz < COLLECT_RADIUS * COLLECT_RADIUS) onCollect(pk.id);
    }
  });
  return pickups.filter((p) => p.active).map((pk) => <Pickup key={pk.id} data={pk} />);
}
