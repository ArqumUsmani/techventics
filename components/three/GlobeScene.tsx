"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";
import type { Office } from "@/content/types";
import { Globe, GLOBE_RADIUS } from "./Globe";

export type GlobeSceneProps = {
  offices: Office[];
  hubId: string;
  quality: "high" | "low";
  paused?: boolean;
  interactive?: boolean;
  /** DOM labels rendered over the canvas by GlobeStage, one per office. */
  labelsRef?: RefObject<(HTMLElement | null)[]>;
  onReady?: () => void;
};

const FOV = 30;

export default function GlobeScene({ offices, hubId, quality, paused = false, interactive = true, labelsRef, onReady }: GlobeSceneProps) {
  const distance = (GLOBE_RADIUS * 1.3) / Math.tan((FOV / 2) * (Math.PI / 180));
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: FOV, position: [0, 0, distance], near: 0.1, far: 50 }}
      onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()))}
    >
      {/* Limb: a thin steel outline defines the sphere without a glow. */}
      <mesh>
        <ringGeometry args={[GLOBE_RADIUS * 1.002, GLOBE_RADIUS * 1.008, 128]} />
        <meshBasicMaterial color="#303030" />
      </mesh>
      <Globe offices={offices} hubId={hubId} quality={quality} interactive={interactive} labelsRef={labelsRef} />
    </Canvas>
  );
}
