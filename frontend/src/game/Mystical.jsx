import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FOG_COLOR, SURGE_COLOR } from "./constants";

const ORBS = 14;

// The Veil thins: fog turns violet, the lens breathes, spectral orbs orbit the survivor.
export function MysticalFX({ surgeRef }) {
  const { scene, camera } = useThree();
  const k = useRef(0);
  const orbs = useRef();
  const orbMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#c084fc", transparent: true, opacity: 0, depthWrite: false }), []);
  const colors = useMemo(() => ({ base: new THREE.Color(FOG_COLOR), surge: new THREE.Color(SURGE_COLOR) }), []);
  const seeds = useMemo(
    () => Array.from({ length: ORBS }).map((_, i) => ({ a: (i / ORBS) * Math.PI * 2, r: 5 + (i % 4) * 2.5, h: 1 + (i % 3) * 1.2, sp: 0.4 + (i % 5) * 0.12 })),
    []
  );

  useFrame(({ clock }, dt) => {
    const target = surgeRef.current ? 1 : 0;
    k.current += (target - k.current) * Math.min(1, dt * 1.6);
    const t = k.current;
    const el = clock.elapsedTime;
    if (scene.fog) {
      scene.fog.color.copy(colors.base).lerp(colors.surge, t);
      scene.fog.density = 0.028 + 0.018 * t;
    }
    if (scene.background && scene.background.isColor) scene.background.copy(colors.base).lerp(colors.surge, t);
    camera.fov = 78 + Math.sin(el * 2.3) * 7 * t;
    camera.updateProjectionMatrix();
    orbMat.opacity = t * 0.85;
    if (orbs.current) {
      orbs.current.position.set(camera.position.x, 0, camera.position.z);
      orbs.current.children.forEach((o, i) => {
        const s = seeds[i];
        const a = s.a + el * s.sp;
        o.position.set(Math.cos(a) * s.r, s.h + Math.sin(el * 1.7 + i) * 0.5, Math.sin(a) * s.r);
        o.scale.setScalar(0.2 + t * 0.35);
      });
    }
  });

  return (
    <group ref={orbs}>
      {seeds.map((_, i) => (
        <mesh key={i} material={orbMat}>
          <sphereGeometry args={[1, 10, 10]} />
        </mesh>
      ))}
    </group>
  );
}
