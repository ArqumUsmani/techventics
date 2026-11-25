"use client";

import { Edges, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { facets, notch, traces, type Facet, type FacetTone, type Point } from "./vmarkShape";

/* ---------------------------------------------------------------
   Logo units → world units. The mark is 64 × 58 logo units → 4 × 3.6 world units,
   centred on the origin.
---------------------------------------------------------------- */
const UNIT = 1 / 16;
const CENTER: Point = [32, 29];

export const toWorld = ([x, y]: Point): [number, number] => [(x - CENTER[0]) * UNIT, -(y - CENTER[1]) * UNIT];

function centroid(points: readonly (readonly [number, number])[]): [number, number] {
  const n = points.length;
  return [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n];
}

/** World-space centre of the V's opening: the fly-through target. */
export const NOTCH_CENTER = centroid(notch.map(toWorld));

const EMBER = new THREE.Color("#FC5400");
const BEVEL = 0.022;
const GAP = 0.05; // inset per facet so the shards read as separate pieces

type BuiltFacet = {
  facet: Facet;
  geometry: THREE.ExtrudeGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
};

function buildFacet(facet: Facet, smooth: boolean): BuiltFacet {
  const world = facet.points.map(toWorld);
  const c = centroid(world);
  const local = world.map(([x, y]) => {
    const dx = x - c[0];
    const dy = y - c[1];
    const len = Math.hypot(dx, dy);
    const k = Math.max(0, (len - GAP - BEVEL) / len);
    return new THREE.Vector2(dx * k, dy * k);
  });

  const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(local), {
    depth: facet.depth,
    steps: 1,
    curveSegments: 1,
    bevelEnabled: true,
    bevelThickness: BEVEL * 1.4,
    bevelSize: BEVEL,
    bevelSegments: smooth ? 2 : 1,
  });
  geometry.translate(0, 0, -facet.depth / 2);
  geometry.computeVertexNormals();

  return { facet, geometry, position: [c[0], c[1], facet.z], rotation: [facet.tilt[0], facet.tilt[1], 0] };
}

/* Black metal for the dark arm; black metal with a low ember glow for the orange arm. */
const toneEmissive: Record<FacetTone, number> = { dark: 0, flare: 0.16, ember: 0.11, burnt: 0.06 };
const toneColor: Record<FacetTone, string> = {
  dark: "#141414",
  flare: "#FF7A1F",
  ember: "#FC5400",
  burnt: "#E04808",
};

function makeMaterial(tone: FacetTone) {
  if (tone === "dark") {
    return new THREE.MeshPhysicalMaterial({
      color: "#2a2a2a",
      metalness: 0.92,
      roughness: 0.34,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
    });
  }
  return new THREE.MeshPhysicalMaterial({
    color: "#2c160b",
    metalness: 0.78,
    roughness: 0.36,
    clearcoat: 1,
    clearcoatRoughness: 0.22,
    emissive: new THREE.Color(toneColor[tone]),
    emissiveIntensity: toneEmissive[tone],
  });
}

type VMarkProps = {
  quality: "high" | "low";
  /** Lean toward the cursor (lerped). */
  lean?: boolean;
  /** Scroll fly-through progress 0–1. Idle motion fades out as it rises. */
  progressRef?: RefObject<number>;
};

export function VMark({ quality, lean = true, progressRef }: VMarkProps) {
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 });

  const built = useMemo(() => facets.map((f) => buildFacet(f, quality === "high")), [quality]);
  const materials = useMemo(() => {
    const m = new Map<FacetTone, THREE.MeshPhysicalMaterial>();
    (["dark", "flare", "ember", "burnt"] as FacetTone[]).forEach((t) => m.set(t, makeMaterial(t)));
    return m;
  }, []);

  const traceLines = useMemo(
    () =>
      traces.map((t) => ({
        id: t.id,
        points: t.points.map((p) => {
          const [x, y] = toWorld(p);
          return new THREE.Vector3(x, y, 0);
        }),
      })),
    [],
  );

  useEffect(
    () => () => {
      built.forEach((b) => b.geometry.dispose());
    },
    [built],
  );
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  // Pointer tracked on window, so it works while the canvas sits behind page content.
  useEffect(() => {
    if (!lean) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [lean]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const idle = 1 - Math.min(1, (progressRef?.current ?? 0) * 2.5); // calm down during the fly-through
    const px = lean ? pointer.current.x : 0;
    const py = lean ? pointer.current.y : 0;

    const targetY = (Math.sin(t * 0.21) * 0.3 + px * 0.2) * idle;
    const targetX = (Math.sin(t * 0.16) * 0.05 + py * 0.12) * idle;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 2.4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 2.4, delta);

    // Circuit nodes pulse, staggered.
    nodeRefs.current.forEach((node, i) => {
      if (!node) return;
      const pulse = Math.pow(Math.sin(t * 1.6 - i * 1.1) * 0.5 + 0.5, 3);
      (node.material as THREE.MeshBasicMaterial).color.copy(EMBER).multiplyScalar(1 + pulse * 1.15);
      node.scale.setScalar(1 + pulse * 0.3);
    });
  });

  const edgeWidth = quality === "high" ? 1.6 : 1.2;

  return (
    <group ref={group}>
      {built.map(({ facet, geometry, position, rotation }) => {
        const dark = facet.tone === "dark";
        return (
          <mesh key={facet.id} geometry={geometry} position={position} rotation={rotation} material={materials.get(facet.tone)}>
            <Edges
              threshold={25}
              lineWidth={edgeWidth}
              // Values above 1 survive tone mapping and feed the bloom pass.
              color={dark ? EMBER.clone().multiplyScalar(0.55) : EMBER.clone().multiplyScalar(1.9)}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {traceLines.map((trace, i) => (
        <group key={trace.id}>
          <Line points={trace.points} color={EMBER.clone().multiplyScalar(1.2)} lineWidth={edgeWidth} toneMapped={false} />
          <mesh
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            position={trace.points[trace.points.length - 1]}
          >
            <sphereGeometry args={[0.05, 16, 12]} />
            <meshBasicMaterial color={EMBER} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
