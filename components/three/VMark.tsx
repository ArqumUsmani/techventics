"use client";

import { Edges, Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
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

/** Centre of the V's opening in mark space: the fly-through target. */
export const NOTCH_CENTER = centroid(notch.map(toWorld));

/** Half width of the mark incl. traces, for camera fitting. */
export const MARK_HALF_WIDTH = 2.7;

const EMBER = new THREE.Color("#FC5400");
const BONE = new THREE.Color("#F6F1EA");
const BEVEL = 0.022;
const GAP = 0.05; // inset per facet so the shards read as separate pieces

type BuiltFacet = {
  facet: Facet;
  geometry: THREE.ExtrudeGeometry;
  local: THREE.Vector2[];
  matrix: THREE.Matrix4;
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

  const position: [number, number, number] = [c[0], c[1], facet.z];
  const rotation: [number, number, number] = [facet.tilt[0], facet.tilt[1], 0];
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(1, 1, 1),
  );

  return { facet, geometry, local, matrix, position, rotation };
}

/* ---------------------------------------------------------------
   Cursor "hole": shared uniforms injected into every facet material.
   Fragments inside the radius are discarded; a thin ember rim glows around it.
---------------------------------------------------------------- */
type HoleUniforms = {
  uHole: { value: THREE.Vector3 };
  uHoleRadius: { value: number };
  uRimColor: { value: THREE.Color };
  uRimWidth: { value: number };
};

function withHole(material: THREE.MeshPhysicalMaterial, uniforms: HoleUniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vHoleWorld;")
      .replace("#include <fog_vertex>", "#include <fog_vertex>\nvHoleWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vHoleWorld;\nuniform vec3 uHole;\nuniform float uHoleRadius;\nuniform vec3 uRimColor;\nuniform float uRimWidth;",
      )
      .replace(
        "#include <clipping_planes_fragment>",
        "#include <clipping_planes_fragment>\nfloat holeD = distance(vHoleWorld.xy, uHole.xy);\nif (uHoleRadius > 0.001 && holeD < uHoleRadius) discard;",
      )
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\nif (uHoleRadius > 0.001) totalEmissiveRadiance += uRimColor * (1.0 - smoothstep(uHoleRadius, uHoleRadius + uRimWidth, holeD));",
      );
  };
  material.customProgramCacheKey = () => "vmark-hole";
  return material;
}

/* Black metal for the dark arm; black metal with a low ember glow for the orange arm. */
const toneEmissive: Record<FacetTone, number> = { dark: 0, flare: 0.16, ember: 0.11, burnt: 0.06 };
const toneColor: Record<FacetTone, string> = { dark: "#141414", flare: "#FF7A1F", ember: "#FC5400", burnt: "#E04808" };

function makeMaterial(tone: FacetTone, uniforms: HoleUniforms) {
  const material =
    tone === "dark"
      ? new THREE.MeshPhysicalMaterial({ color: "#2a2a2a", metalness: 0.92, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.18 })
      : new THREE.MeshPhysicalMaterial({
          color: "#2c160b",
          metalness: 0.78,
          roughness: 0.36,
          clearcoat: 1,
          clearcoatRoughness: 0.22,
          emissive: new THREE.Color(toneColor[tone]),
          emissiveIntensity: toneEmissive[tone],
        });
  return withHole(material, uniforms);
}

/* ---------------------------------------------------------------
   Surface particles: sampled on the front face of each facet. At rest they are a
   faint dotted texture; near the cursor they peel off and spring back.
---------------------------------------------------------------- */
const particleVertex = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aGlow;
  attribute vec3 aColor;
  varying float vGlow;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(uSize * uPixelRatio * (1.0 + aGlow) * (10.0 / -mv.z), 7.0 * uPixelRatio);
    vGlow = aGlow;
    vColor = aColor;
  }
`;
const particleFragment = /* glsl */ `
  uniform float uRest;
  uniform float uFade;
  varying float vGlow;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.15, d) * mix(uRest, 1.0, vGlow) * uFade;
    gl_FragColor = vec4(vColor * (1.0 + vGlow * 0.9), a);
  }
`;

function sampleParticles(built: BuiltFacet[], count: number) {
  const areas = built.map(({ local }) => {
    const [a, b, c] = local;
    return Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2;
  });
  const total = areas.reduce((s, a) => s + a, 0);
  const home = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  let i = 0;
  built.forEach((b, fi) => {
    const n = fi === built.length - 1 ? count - i : Math.round((areas[fi] / total) * count);
    const [p0, p1, p2] = b.local;
    const tint = b.facet.tone === "dark" ? BONE : EMBER;
    const front = b.facet.depth / 2 + BEVEL * 1.4 + 0.006;
    for (let k = 0; k < n && i < count; k++, i++) {
      let r1 = Math.random();
      let r2 = Math.random();
      if (r1 + r2 > 1) {
        r1 = 1 - r1;
        r2 = 1 - r2;
      }
      v.set(p0.x + r1 * (p1.x - p0.x) + r2 * (p2.x - p0.x), p0.y + r1 * (p1.y - p0.y) + r2 * (p2.y - p0.y), front);
      v.applyMatrix4(b.matrix);
      home.set([v.x, v.y, v.z], i * 3);
      color.set([tint.r, tint.g, tint.b], i * 3);
    }
  });
  return { home, color };
}

type VMarkProps = {
  quality: "high" | "low";
  /** Lean toward the cursor and react with the hole + particles. */
  interactive?: boolean;
  /** Scroll fly-through progress 0–1. Idle motion and effects fade out as it rises. */
  progressRef?: RefObject<number>;
  /** Vertical offset of the mark (world units) to match the hero framing. */
  offsetY?: number;
};

export function VMark({ quality, interactive = true, progressRef, offsetY = 0 }: VMarkProps) {
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0, ndcX: 0, ndcY: 0, movedAt: -Infinity });
  const { camera, gl } = useThree();

  const built = useMemo(() => facets.map((f) => buildFacet(f, quality === "high")), [quality]);

  const hole = useMemo<HoleUniforms>(
    () => ({
      uHole: { value: new THREE.Vector3(0, 0, 0) },
      uHoleRadius: { value: 0 },
      uRimColor: { value: EMBER.clone().multiplyScalar(1.6) },
      uRimWidth: { value: 0.07 },
    }),
    [],
  );

  const materials = useMemo(() => {
    const m = new Map<FacetTone, THREE.MeshPhysicalMaterial>();
    (["dark", "flare", "ember", "burnt"] as FacetTone[]).forEach((t) => m.set(t, makeMaterial(t, hole)));
    return m;
  }, [hole]);

  // Particles
  const particleCount = quality === "high" ? 3200 : 1400;
  const particles = useMemo(() => {
    const { home, color } = sampleParticles(built, particleCount);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(home), 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    geometry.setAttribute("aGlow", new THREE.BufferAttribute(new Float32Array(particleCount), 1).setUsage(THREE.DynamicDrawUsage));
    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uSize: { value: 2.2 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uRest: { value: 0.2 },
        uFade: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return {
      geometry,
      material,
      home,
      velocity: new Float32Array(particleCount * 3),
      seed: Float32Array.from({ length: particleCount }, () => Math.random()),
    };
  }, [built, particleCount, gl]);

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

  useEffect(() => () => built.forEach((b) => b.geometry.dispose()), [built]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);
  useEffect(
    () => () => {
      particles.geometry.dispose();
      particles.material.dispose();
    },
    [particles],
  );

  // Pointer tracked on window, so it works while the canvas sits behind page content.
  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = gl.domElement.getBoundingClientRect();
      const p = pointer.current;
      p.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.y = (e.clientY / window.innerHeight) * 2 - 1;
      p.ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      p.ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      p.movedAt = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive, gl]);

  const scratch = useMemo(
    () => ({
      raycaster: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.2),
      hit: new THREE.Vector3(),
      target: new THREE.Vector3(),
      local: new THREE.Vector3(),
      ndc: new THREE.Vector2(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const progress = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1);
    const idle = 1 - Math.min(1, progress * 2.5); // calm down during the fly-through
    const px = interactive ? pointer.current.x : 0;
    const py = interactive ? pointer.current.y : 0;

    // Sway + lean
    const targetY = (Math.sin(t * 0.21) * 0.3 + px * 0.2) * idle;
    const targetX = (Math.sin(t * 0.16) * 0.05 + py * 0.12) * idle;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 2.4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 2.4, delta);

    // Orange facets go dark up close, so orange never floods the screen.
    materials.forEach((m, tone) => {
      if (tone !== "dark") m.emissiveIntensity = toneEmissive[tone] * idle;
    });

    // Cursor hole: follows the pointer on the mark's plane while the cursor moves over it.
    let holeTarget = 0;
    if (interactive && idle > 0.99) {
      scratch.ndc.set(pointer.current.ndcX, pointer.current.ndcY);
      scratch.raycaster.setFromCamera(scratch.ndc, camera);
      if (scratch.raycaster.ray.intersectPlane(scratch.plane, scratch.hit)) {
        const recent = performance.now() - pointer.current.movedAt < 1400;
        const over = Math.abs(scratch.hit.x) < 2.2 && Math.abs(scratch.hit.y - offsetY) < 2.1;
        if (recent && over) holeTarget = 0.3;
        scratch.target.copy(scratch.hit);
      }
    }
    const h = hole.uHole.value;
    h.x = THREE.MathUtils.damp(h.x, scratch.target.x, 12, delta);
    h.y = THREE.MathUtils.damp(h.y, scratch.target.y, 12, delta);
    hole.uHoleRadius.value = THREE.MathUtils.damp(hole.uHoleRadius.value, holeTarget, holeTarget > 0 ? 7 : 3, delta);

    // Particles: pushed out of a ring around the hole, spring back home.
    scratch.local.copy(h);
    g.worldToLocal(scratch.local);
    const reach = hole.uHoleRadius.value * 2.1;
    const pos = particles.geometry.attributes.position.array as Float32Array;
    const glow = particles.geometry.attributes.aGlow.array as Float32Array;
    const { home, velocity, seed } = particles;
    const k = 1 - Math.exp(-delta * 9); // spring
    const damping = Math.exp(-delta * 5);
    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3;
      const hx = home[ix];
      const hy = home[ix + 1];
      const hz = home[ix + 2];
      let tx = hx;
      let ty = hy;
      let tz = hz;
      if (reach > 0.01) {
        const dx = hx - scratch.local.x;
        const dy = hy - scratch.local.y;
        const d = Math.hypot(dx, dy);
        if (d < reach) {
          const f = 1 - d / reach;
          const s = seed[i];
          const nx = d > 1e-4 ? dx / d : Math.cos(s * 6.283);
          const ny = d > 1e-4 ? dy / d : Math.sin(s * 6.283);
          const push = f * (0.35 + s * 0.45);
          tx += nx * push;
          ty += ny * push;
          tz += f * (0.4 + s * 0.9);
        }
      }
      velocity[ix] = (velocity[ix] + (tx - pos[ix]) * k) * damping;
      velocity[ix + 1] = (velocity[ix + 1] + (ty - pos[ix + 1]) * k) * damping;
      velocity[ix + 2] = (velocity[ix + 2] + (tz - pos[ix + 2]) * k) * damping;
      pos[ix] += velocity[ix];
      pos[ix + 1] += velocity[ix + 1];
      pos[ix + 2] += velocity[ix + 2];
      glow[i] = Math.min(1, Math.hypot(pos[ix] - hx, pos[ix + 1] - hy, pos[ix + 2] - hz) * 4);
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.aGlow.needsUpdate = true;
    particles.material.uniforms.uFade.value = idle;

    // Circuit nodes pulse, staggered (kept within the ember → flare range).
    nodeRefs.current.forEach((node, i) => {
      if (!node) return;
      const pulse = Math.pow(Math.sin(t * 1.6 - i * 1.1) * 0.5 + 0.5, 3);
      (node.material as THREE.MeshBasicMaterial).color.copy(EMBER).multiplyScalar(1 + pulse * 1.15);
      node.scale.setScalar(1 + pulse * 0.3);
    });
  });

  const edgeWidth = quality === "high" ? 1.6 : 1.2;

  return (
    <group ref={group} position-y={offsetY}>
      {built.map(({ facet, geometry, position, rotation }) => {
        const dark = facet.tone === "dark";
        return (
          <mesh key={facet.id} geometry={geometry} position={position} rotation={rotation} material={materials.get(facet.tone)}>
            <Edges
              threshold={25}
              lineWidth={edgeWidth}
              // Values above 1 survive tone mapping and feed the bloom pass (stays within ember → flare).
              color={dark ? EMBER.clone().multiplyScalar(0.55) : EMBER.clone().multiplyScalar(1.9)}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      <points geometry={particles.geometry} material={particles.material} frustumCulled={false} />

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
