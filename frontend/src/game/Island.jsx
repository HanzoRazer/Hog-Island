import React, { useRef } from "react";
import { ARENA_RADIUS } from "./constants";
import { ModelSlot } from "./ModelSlot";

function PlaceholderIsland() {
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

export function Island() {
  return <ModelSlot slot="map" fallback={<PlaceholderIsland />} />;
}
