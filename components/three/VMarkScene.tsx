"use client";

import { Environment, Grid, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { NOTCH_CENTER, VMark } from "./VMark";

export type SceneQuality = "high" | "low";

export type VMarkSceneProps = {
  quality: SceneQuality;
  /** Scroll fly-through progress 0–1 (written by ScrollTrigger in the hero). */
  progressRef?: RefObject<number>;
  lean?: boolean;
  /** Stop rendering (e.g. while scrolled out of view). */
  paused?: boolean;
  /** Called after the first frame has been drawn. */
  onReady?: () => void;
};

const INK = "#0B0B0B";
const CAMERA_START = new THREE.Vector3(0, 0, 10);

/**
 * Moves the camera along a path that ends by passing through the V's opening.
 * Progress is damped so scrubbing feels smooth rather than stepped.
 */
function CameraRig({ progressRef }: { progressRef?: RefObject<number> }) {
  const camera = useThree((s) => s.camera);
  const smoothed = useRef(0);
  const [nx, ny] = NOTCH_CENTER;

  const { curve, tmp, tangent, look } = useMemo(
    () => ({
      curve: new THREE.CatmullRomCurve3(
        [
          CAMERA_START.clone(),
          new THREE.Vector3(nx * 0.4, ny * 0.45, 6.5),
          new THREE.Vector3(nx, ny, 2.6),
          new THREE.Vector3(nx, ny, 0),
          new THREE.Vector3(nx, ny, -5),
        ],
        false,
        "centripetal",
      ),
      tmp: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      look: new THREE.Vector3(),
    }),
    [nx, ny],
  );

  useFrame((_, delta) => {
    const target = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1);
    smoothed.current = THREE.MathUtils.damp(smoothed.current, target, 7, delta);
    const p = smoothed.current;

    curve.getPointAt(p, tmp);
    camera.position.copy(tmp);
    if (p < 0.001) {
      camera.lookAt(0, 0, 0);
    } else {
      // Blend from looking at the mark to looking down the path.
      curve.getTangentAt(p, tangent);
      look.copy(tmp).add(tangent);
      const toMark = new THREE.Vector3(0, 0, 0);
      look.lerp(toMark, Math.max(0, 1 - p * 3));
      camera.lookAt(look);
    }
  });

  return null;
}

export default function VMarkScene({ quality, progressRef, lean = true, paused = false, onReady }: VMarkSceneProps) {
  const [degraded, setDegraded] = useState(false);
  const q: SceneQuality = degraded ? "low" : quality;
  const high = q === "high";

  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={high ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: !high, alpha: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: 32, position: CAMERA_START.toArray(), near: 0.05, far: 60 }}
      onCreated={({ gl }) => {
        gl.setClearColor(INK);
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
    >
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, 10, 24]} />

      {/* Drop to the light path if the frame rate can't hold. */}
      <PerformanceMonitor onDecline={() => setDegraded(true)} flipflops={2} />

      <ambientLight intensity={0.12} />
      <directionalLight position={[-4, 6, 6]} intensity={1.1} color="#F6F1EA" />
      <pointLight position={[3.5, -1, -2]} intensity={14} distance={12} color="#FC5400" />

      {/* Reflections from procedural light panels: no HDR download. */}
      <Environment resolution={high ? 256 : 64} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#F6F1EA" position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 1.4, 1]} />
        <Lightformer form="rect" intensity={3} color="#FC5400" position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[1.2, 8, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#F6F1EA" position={[-6, 1, 3]} rotation-y={Math.PI / 2} scale={[1, 6, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#E04808" position={[0, -4, -3]} rotation-x={-Math.PI / 2} scale={[8, 1, 1]} />
        {/* soft frontal panel: gives the black facets a graded metal sheen */}
        <Lightformer form="rect" intensity={0.9} color="#F6F1EA" position={[-2, 2.5, 8]} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#F6F1EA" position={[3, 3, 6]} scale={1.5} />
      </Environment>

      <VMark quality={q} lean={lean} progressRef={progressRef} />

      {/* Steel floor grid: engineered, not glowy. */}
      <Grid
        position={[0, -2.7, 0]}
        infiniteGrid
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#1d1d1d"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#303030"
        fadeDistance={20}
        fadeStrength={2}
      />

      <CameraRig progressRef={progressRef} />

      {high && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.15} intensity={0.75} radius={0.6} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
