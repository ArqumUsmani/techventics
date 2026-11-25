"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { facets, notch, traces, type Facet, type FacetTone, type Point } from "./vmarkShape";

/* ---------------------------------------------------------------
   The V mark drawn entirely in dots.
   - Black half of the logo → dense bone dot noise.
   - Orange half → ember dots laid out in contour lines.
   - Circuit traces → dotted lines; nodes → small pulsing dot clusters.
   Hovering opens round holes that trail the cursor: dots are pushed out to a dense
   rim (a few scatter further) and the holes close smoothly. All displacement runs in
   the vertex shader, so there is no per-dot physics and nothing bounces.
---------------------------------------------------------------- */

const UNIT = 1 / 16; // logo units → world units (64 × 58 → 4 × 3.6)
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

const GAP = 0.05; // inset per facet so the facets still read as separate shards
const HOLE_RADIUS = 0.3; // world units (~15% of the mark's width across)
const TRAIL_SLOTS = 20;
const TRAIL_SPACING = 0.15;

const toneColor: Record<FacetTone, THREE.Color> = {
  dark: new THREE.Color("#F6F1EA").multiplyScalar(0.9),
  flare: new THREE.Color("#FF7A1F"),
  ember: new THREE.Color("#FC5400"),
  burnt: new THREE.Color("#E04808"),
};
const EMBER = new THREE.Color("#FC5400");

/* ---------------------------------------------------------------
   Dot sampling
---------------------------------------------------------------- */
type DotBuffers = { position: Float32Array; color: Float32Array; seed: Float32Array; node: Float32Array; count: number };

function facetTriangle(f: Facet) {
  const world = f.points.map(toWorld);
  const c = centroid(world);
  const shrunk = world.map(([x, y]) => {
    const dx = x - c[0];
    const dy = y - c[1];
    const len = Math.hypot(dx, dy);
    const k = Math.max(0, (len - GAP) / len);
    return new THREE.Vector2(dx * k, dy * k);
  });
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(c[0], c[1], f.z * 0.5),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(f.tilt[0], f.tilt[1], 0)),
    new THREE.Vector3(1, 1, 1),
  );
  const [a, b, d] = shrunk;
  const area = Math.abs((b.x - a.x) * (d.y - a.y) - (d.x - a.x) * (b.y - a.y)) / 2;
  return { pts: shrunk, matrix, area, origin: new THREE.Vector2(c[0], c[1]) };
}

// Contour-line field for the orange arm: lines run along the arm with a gentle wave.
const ARM_DIR = new THREE.Vector2(32 - 64, -(58 - 0)).normalize(); // (64,0) → (32,58) in world orientation
const ARM_NORMAL = new THREE.Vector2(-ARM_DIR.y, ARM_DIR.x);
function onContour(x: number, y: number) {
  const along = x * ARM_DIR.x + y * ARM_DIR.y;
  const across = x * ARM_NORMAL.x + y * ARM_NORMAL.y;
  return Math.sin(across * 68 + Math.sin(along * 2.4) * 1.6) > 0.25;
}

function sampleDots(total: number): DotBuffers {
  const tris = facets.map((f) => ({ f, ...facetTriangle(f) }));
  const area = tris.reduce((s, t) => s + t.area, 0);
  const pos: number[] = [];
  const col: number[] = [];
  const seed: number[] = [];
  const node: number[] = [];
  const v = new THREE.Vector3();

  const push = (x: number, y: number, z: number, c: THREE.Color, n = 0) => {
    pos.push(x, y, z);
    col.push(c.r, c.g, c.b);
    seed.push(Math.random());
    node.push(n);
  };

  // Facets
  for (const t of tris) {
    const dark = t.f.tone === "dark";
    // Orange facets are sampled more densely, then thinned to contour lines.
    const candidates = Math.round((t.area / area) * total * (dark ? 1 : 1.6));
    const [p0, p1, p2] = t.pts;
    for (let i = 0; i < candidates; i++) {
      let r1 = Math.random();
      let r2 = Math.random();
      if (r1 + r2 > 1) {
        r1 = 1 - r1;
        r2 = 1 - r2;
      }
      const lx = p0.x + r1 * (p1.x - p0.x) + r2 * (p2.x - p0.x);
      const ly = p0.y + r1 * (p1.y - p0.y) + r2 * (p2.y - p0.y);
      if (!dark && !onContour(lx + t.origin.x, ly + t.origin.y) && Math.random() > 0.06) continue;
      v.set(lx, ly, (Math.random() - 0.5) * 0.08).applyMatrix4(t.matrix);
      push(v.x, v.y, v.z, toneColor[t.f.tone]);
    }
  }

  // Circuit traces as dotted lines, nodes as dot clusters (node index + 1 drives the pulse).
  traces.forEach((trace, ti) => {
    const pts = trace.points.map(toWorld);
    for (let s = 0; s < pts.length - 1; s++) {
      const [ax, ay] = pts[s];
      const [bx, by] = pts[s + 1];
      const steps = Math.ceil(Math.hypot(bx - ax, by - ay) / 0.022);
      for (let k = 0; k <= steps; k++) {
        const u = k / steps;
        push(ax + (bx - ax) * u + (Math.random() - 0.5) * 0.008, ay + (by - ay) * u + (Math.random() - 0.5) * 0.008, 0, EMBER);
      }
    }
    const [nx, ny] = pts[pts.length - 1];
    for (let k = 0; k < 70; k++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.07;
      push(nx + Math.cos(a) * r, ny + Math.sin(a) * r, 0, EMBER, ti + 1);
    }
  });

  return {
    position: new Float32Array(pos),
    color: new Float32Array(col),
    seed: new Float32Array(seed),
    node: new Float32Array(node),
    count: seed.length,
  };
}

/* ---------------------------------------------------------------
   Shaders
---------------------------------------------------------------- */
const vertexShader = /* glsl */ `
  #define SLOTS ${TRAIL_SLOTS}
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uFade;
  uniform vec3 uTrail[SLOTS]; // xy = centre (mark space), z = radius
  attribute vec3 aColor;
  attribute float aSeed;
  attribute float aNode;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    vec2 disp = vec2(0.0);
    float scatter = 0.0;

    for (int i = 0; i < SLOTS; i++) {
      float r = uTrail[i].z;
      if (r < 0.001) continue;
      vec2 dv = p.xy - uTrail[i].xy;
      float d = length(dv);
      vec2 dir = d > 1e-4 ? dv / d : vec2(cos(aSeed * 6.2831), sin(aSeed * 6.2831));
      // Inside the hole: dots compress onto the rim. Outside: displacement falls off smoothly.
      float nd = d < r ? r + d * 0.28 : d + 0.28 * r * exp(-(d - r) / (0.5 * r));
      // A few dots get thrown further out.
      float infl = 1.0 - smoothstep(r * 0.5, r * 2.4, d);
      float thrown = step(0.88, aSeed) * infl;
      disp += dir * ((nd - d) + thrown * r * (0.5 + fract(aSeed * 37.0) * 1.8));
      scatter = max(scatter, thrown);
    }

    p.xy += disp;
    p.z += scatter * 0.25 * fract(aSeed * 91.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float pulse = 1.0;
    if (aNode > 0.5) pulse = 1.0 + 0.7 * pow(0.5 + 0.5 * sin(uTime * 1.6 - aNode * 1.1), 3.0);

    gl_PointSize = clamp(uSize * uPixelRatio * pulse * (10.0 / -mv.z), 0.75, 6.0 * uPixelRatio);
    vColor = aColor * (aNode > 0.5 ? pulse : 1.0);
    // Fade dots that get very close to the camera during the fly-through.
    vAlpha = uFade * smoothstep(0.25, 1.4, -mv.z) * (1.0 - scatter * 0.4);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.28, d));
    #include <colorspace_fragment>
  }
`;

/* ---------------------------------------------------------------
   Component
---------------------------------------------------------------- */
type VMarkProps = {
  quality: "high" | "low";
  /** Hover holes + gentle lean toward the cursor. */
  interactive?: boolean;
  /** Scroll fly-through progress 0–1. Idle motion and hover fade out as it rises. */
  progressRef?: RefObject<number>;
  /** Vertical offset of the mark (world units) to match the hero framing. */
  offsetY?: number;
};

type Slot = { x: number; y: number; born: number; scale: number };

export function VMark({ quality, interactive = true, progressRef, offsetY = 0 }: VMarkProps) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, ndcX: 0, ndcY: 0, movedAt: -Infinity });
  const trail = useRef<Slot[]>(Array.from({ length: TRAIL_SLOTS }, () => ({ x: 0, y: 0, born: -100, scale: 1 })));
  const trailState = useRef({ next: 0, lastX: 0, lastY: 0, hasLast: false });
  const { camera, gl } = useThree();

  const dots = useMemo(() => {
    const buffers = sampleDots(quality === "high" ? 28000 : 11000);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(buffers.position, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(buffers.color, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(buffers.seed, 1));
    geometry.setAttribute("aNode", new THREE.BufferAttribute(buffers.node, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uSize: { value: quality === "high" ? 1.9 : 2.1 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uTime: { value: 0 },
        uFade: { value: 1 },
        uTrail: { value: Array.from({ length: TRAIL_SLOTS }, () => new THREE.Vector3(0, 0, 0)) },
      },
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    return { geometry, material };
  }, [quality, gl]);

  useEffect(
    () => () => {
      dots.geometry.dispose();
      dots.material.dispose();
    },
    [dots],
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
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      hit: new THREE.Vector3(),
      ndc: new THREE.Vector2(),
      lastMove: -Infinity,
    }),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const progress = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1);
    const idle = 1 - Math.min(1, progress * 2.5);
    const px = interactive ? pointer.current.x : 0;
    const py = interactive ? pointer.current.y : 0;

    // Subtle lean only: the mark stays facing the viewer, like the reference.
    const targetY = (Math.sin(t * 0.2) * 0.08 + px * 0.1) * idle;
    const targetX = (Math.sin(t * 0.15) * 0.03 + py * 0.06) * idle;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 2.2, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 2.2, delta);

    // Drop a new hole each time the cursor travels TRAIL_SPACING across the mark.
    const moved = pointer.current.movedAt !== scratch.lastMove;
    scratch.lastMove = pointer.current.movedAt;
    if (interactive && moved && idle > 0.99) {
      scratch.ndc.set(pointer.current.ndcX, pointer.current.ndcY);
      scratch.raycaster.setFromCamera(scratch.ndc, camera);
      if (scratch.raycaster.ray.intersectPlane(scratch.plane, scratch.hit)) {
        g.worldToLocal(scratch.hit);
        const over = Math.abs(scratch.hit.x) < 2.3 && Math.abs(scratch.hit.y) < 2.2;
        const st = trailState.current;
        if (over && (!st.hasLast || Math.hypot(scratch.hit.x - st.lastX, scratch.hit.y - st.lastY) > TRAIL_SPACING)) {
          const slot = trail.current[st.next];
          slot.x = scratch.hit.x;
          slot.y = scratch.hit.y;
          slot.born = t;
          slot.scale = 0.55 + Math.random() * 0.45;
          st.next = (st.next + 1) % TRAIL_SLOTS;
          st.lastX = scratch.hit.x;
          st.lastY = scratch.hit.y;
          st.hasLast = true;
        }
        if (!over) st.hasLast = false;
      }
    }

    // Hole radius over its life: open fast, hold, then close smoothly.
    const uTrail = dots.material.uniforms.uTrail.value as THREE.Vector3[];
    trail.current.forEach((slot, i) => {
      const age = t - slot.born;
      const open = 1 - Math.pow(1 - Math.min(1, age / 0.14), 3);
      const close = 1 - THREE.MathUtils.smoothstep(age, 0.45, 1.35);
      const r = age < 0 || age > 1.35 ? 0 : HOLE_RADIUS * slot.scale * open * close * idle;
      uTrail[i].set(slot.x, slot.y, r);
    });

    dots.material.uniforms.uTime.value = t;
    dots.material.uniforms.uFade.value = 0.35 + 0.65 * idle;
  });

  return (
    <group ref={group} position-y={offsetY}>
      <points geometry={dots.geometry} material={dots.material} frustumCulled={false} />
    </group>
  );
}
