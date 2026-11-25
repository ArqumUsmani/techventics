"use client";

import { Grid, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { MARK_HALF_WIDTH, NOTCH_CENTER, VMark } from "./VMark";

export type SceneQuality = "high" | "low";

export type VMarkSceneProps = {
  quality: SceneQuality;
  /** Scroll fly-through progress 0–1 (written by ScrollTrigger in the hero). */
  progressRef?: RefObject<number>;
  /** Cursor lean, hole and particles. */
  interactive?: boolean;
  /** Stop rendering (e.g. while scrolled out of view). */
  paused?: boolean;
  /** Mark centre as a fraction of the canvas height from the top (0.5 = centred). */
  focusY?: number;
  /** Called after the first frame has been drawn. */
  onReady?: () => void;
};

const INK = "#0B0B0B";
const FOV = 32;
const MIN_DISTANCE = 10.5;
const FIT = 0.78; // mark width as a share of the canvas width on narrow screens

/**
 * Frames the mark for the canvas aspect, then moves the camera along a path that
 * ends by passing through the V's opening. Progress is damped for smooth scrubbing.
 */
function CameraRig({ progressRef, offsetY }: { progressRef?: RefObject<number>; offsetY: number }) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const smoothed = useRef(0);
  const [nx, ny] = NOTCH_CENTER;

  const distance = useMemo(() => {
    const halfTan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    return Math.max(MIN_DISTANCE, MARK_HALF_WIDTH / FIT / (halfTan * aspect));
  }, [aspect]);

  const { curve, tmp, tangent, look, origin } = useMemo(() => {
    const ty = ny + offsetY;
    return {
      curve: new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 0, distance),
          new THREE.Vector3(nx * 0.4, ty * 0.45, distance * 0.62),
          new THREE.Vector3(nx, ty, 2.6),
          new THREE.Vector3(nx, ty, 0),
          new THREE.Vector3(nx, ty, -5),
        ],
        false,
        "centripetal",
      ),
      tmp: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      look: new THREE.Vector3(),
      origin: new THREE.Vector3(0, 0, 0),
    };
  }, [nx, ny, offsetY, distance]);

  useFrame((_, delta) => {
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = distance;
      scene.fog.far = distance + 14;
    }
    const target = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1);
    smoothed.current = THREE.MathUtils.damp(smoothed.current, target, 7, delta);
    const p = smoothed.current;

    curve.getPointAt(p, tmp);
    camera.position.copy(tmp);
    if (p < 0.001) {
      camera.lookAt(origin);
    } else {
      // Blend from looking at the frame centre to looking down the path.
      curve.getTangentAt(p, tangent);
      look.copy(tmp).add(tangent).lerp(origin, Math.max(0, 1 - p * 3));
      camera.lookAt(look);
    }
  });

  return null;
}

export default function VMarkScene({ quality, progressRef, interactive = true, paused = false, focusY = 0.5, onReady }: VMarkSceneProps) {
  const [degraded, setDegraded] = useState(false);
  const q: SceneQuality = degraded ? "low" : quality;
  const high = q === "high";

  // Convert the desired screen position into a world offset at the start distance.
  // (Visible height at distance d = 2·d·tan(fov/2); positive focusY moves the mark down.)
  const offsetY = useMemo(() => -(focusY - 0.5) * 2 * MIN_DISTANCE * Math.tan(THREE.MathUtils.degToRad(FOV / 2)), [focusY]);

  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={high ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: !high, alpha: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: FOV, position: [0, 0, MIN_DISTANCE], near: 0.05, far: 80 }}
      onCreated={({ gl }) => {
        gl.setClearColor(INK);
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
    >
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, MIN_DISTANCE, MIN_DISTANCE + 14]} />

      {/* Drop to the light path if the frame rate can't hold. */}
      <PerformanceMonitor onDecline={() => setDegraded(true)} flipflops={2} />

      <VMark quality={q} interactive={interactive} progressRef={progressRef} offsetY={offsetY} />

      {/* Steel floor grid: engineered, not glowy. */}
      <Grid
        position={[0, -2.7 + offsetY, 0]}
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

      <CameraRig progressRef={progressRef} offsetY={offsetY} />

      {high && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.15} intensity={0.75} radius={0.6} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
