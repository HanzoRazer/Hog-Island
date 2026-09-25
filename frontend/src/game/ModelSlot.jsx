import React, { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { MODELS, modelUrl, useModelAvailability } from "./assets.config";

class ModelBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function GLB({ slot, userData }) {
  const cfg = MODELS[slot];
  const { scene } = useGLTF(modelUrl(slot));
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (userData) o.userData = { ...userData };
      }
    });
    return c;
  }, [scene, userData]);
  return <primitive object={obj} scale={cfg.scale} position={cfg.position} rotation={cfg.rotation} />;
}

// Renders the user-provided .glb for `slot` if it exists in public/assets, else the placeholder.
export function ModelSlot({ slot, fallback = null, userData, scale = 1 }) {
  const { available } = useModelAvailability();
  if (!available[slot]) return fallback;
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <group scale={scale}>
          <GLB slot={slot} userData={userData} />
        </group>
      </Suspense>
    </ModelBoundary>
  );
}
