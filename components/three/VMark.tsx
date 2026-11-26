"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { LOGO_FILES } from "@/components/brand/logoFiles";
import { blinkPattern, sampleTube, type TubePattern } from "@/lib/tube";

/* ---------------------------------------------------------------
   The Techventics mark drawn entirely in dots, sampled from the logo artwork
   (public/brand/techventics-mark-on-dark.svg): bone dots where the logo is black,
   ember dots where it is orange. The white circuit lines and node holes stay empty;
   the three nodes get small pulsing dot clusters.
   Hovering opens round holes that trail the cursor: dots are pushed out to a dense
   rim (a few scatter further) and the holes close smoothly. All displacement runs in
   the vertex shader, so there is no per-dot physics and nothing bounces.
---------------------------------------------------------------- */

const { mark } = LOGO_FILES;
const MARK_W = 4.4; // world units
const MARK_H = MARK_W * (mark.height / mark.width);

/** Half width of the mark plus a margin, for camera fitting. */
export const MARK_HALF_WIDTH = MARK_W / 2 + 0.3;

/** Logo space (0–1 across the mark artwork) → world. */
const toWorld = (u: number, v: number): [number, number] => [(u - 0.5) * MARK_W, (0.5 - v) * MARK_H];

/** Open space inside the V (logo space): the scroll fly-through passes through it. */
export const NOTCH_CENTER = toWorld(0.5, 0.44);

/** Circuit-node holes in the artwork (logo space; radius as a share of the mark width). */
const NODES = [
  { u: 0.15, v: 0.125, r: 0.022 },
  { u: 0.542, v: 0.125, r: 0.022 },
  { u: 0.834, v: 0.125, r: 0.026 },
];

/** The mark's corners (world units, local to the group), for placing the DOM glow. */
const GLOW_CORNERS: [number, number][] = [
  [-MARK_W / 2, MARK_H / 2],
  [MARK_W / 2, MARK_H / 2],
  [-MARK_W / 2, -MARK_H / 2],
  [MARK_W / 2, -MARK_H / 2],
];

const HOLE_RADIUS = 0.3; // world units (~7% of the mark's width across)
const TRAIL_SLOTS = 20;
const TRAIL_SPACING = 0.15;

const BONE = new THREE.Color("#F6F1EA").multiplyScalar(0.9);
const EMBER = new THREE.Color("#FC5400");
const FLARE = new THREE.Color("#FF7A1F");

/* ---------------------------------------------------------------
   Dot sampling (in the browser, from the logo SVG drawn to a canvas)
---------------------------------------------------------------- */
type DotBuffers = { position: Float32Array; color: Float32Array; seed: Float32Array; node: Float32Array };

async function sampleDots(total: number): Promise<DotBuffers> {
  const img = new Image();
  img.decoding = "async";
  img.src = mark.srcOnDark;
  await img.decode();

  const w = 720;
  const h = Math.round(w * (mark.height / mark.width));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  // Ink pixels, split by colour: the orange parts vs the bone (black in the logo) parts.
  const ember: number[] = [];
  const bone: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (data[i * 4 + 3] < 140) continue;
    (data[i * 4] - data[i * 4 + 2] > 110 ? ember : bone).push(i);
  }
  const ink = ember.length + bone.length;

  const pos: number[] = [];
  const col: number[] = [];
  const seed: number[] = [];
  const node: number[] = [];
  const push = (u: number, v: number, z: number, c: THREE.Color, n = 0) => {
    const [x, y] = toWorld(u, v);
    pos.push(x, y, z);
    col.push(c.r, c.g, c.b);
    seed.push(Math.random());
    node.push(n);
  };

  for (let k = 0; k < total; k++) {
    const fromEmber = Math.random() < ember.length / ink;
    const list = fromEmber ? ember : bone;
    const idx = list[(Math.random() * list.length) | 0];
    const u = ((idx % w) + Math.random()) / w;
    const v = (((idx / w) | 0) + Math.random()) / h;
    // Orange parts sit a touch forward, so the layers separate when the mark turns.
    const z = (Math.random() - 0.5) * 0.08 + (fromEmber ? 0.03 : 0);
    push(u, v, z, fromEmber ? (Math.random() < 0.25 ? FLARE : EMBER) : BONE);
  }

  // Pulsing dot clusters in the circuit-node holes (node index + 1 drives the pulse).
  NODES.forEach((n, i) => {
    for (let k = 0; k < 60; k++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * n.r * 0.6;
      push(n.u + Math.cos(a) * r, n.v + Math.sin(a) * r * (mark.width / mark.height), 0.02, EMBER, i + 1);
    }
  });

  return { position: new Float32Array(pos), color: new Float32Array(col), seed: new Float32Array(seed), node: new Float32Array(node) };
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
  uniform float uTubeA; // white strokes
  uniform float uTubeB; // ember strokes
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
    // Two tubes flicker independently: ember dots (red well above blue) and white dots.
    float tube = mix(uTubeA, uTubeB, step(0.5, aColor.r - aColor.b));
    vColor = aColor * (aNode > 0.5 ? pulse : 1.0) * (0.45 + 0.55 * tube);
    // Fade dots that get very close to the camera during the fly-through.
    vAlpha = uFade * smoothstep(0.25, 1.4, -mv.z) * (1.0 - scatter * 0.4) * (0.1 + 0.9 * min(tube, 1.0));
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
  /** Called once the dots exist and have been drawn. */
  onReady?: () => void;
  /** DOM glow over the mark: sized and placed over it each frame, brightness follows the tubes. */
  glowRef?: RefObject<HTMLDivElement | null>;
};

type Slot = { x: number; y: number; born: number; scale: number };

export function VMark({ quality, interactive = true, progressRef, offsetY = 0, onReady, glowRef }: VMarkProps) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, ndcX: 0, ndcY: 0, movedAt: -Infinity });
  const trail = useRef<Slot[]>(Array.from({ length: TRAIL_SLOTS }, () => ({ x: 0, y: 0, born: -100, scale: 1 })));
  const trailState = useRef({ next: 0, lastX: 0, lastY: 0, hasLast: false });
  const { camera, gl } = useThree();

  const [buffers, setBuffers] = useState<DotBuffers | null>(null);
  const readySent = useRef(false);

  // Sample the logo once per quality level (async: the artwork is an image).
  useEffect(() => {
    let alive = true;
    // Low tier (phones, modest laptops) still needs enough dots for the strokes to read solid:
    // too few and the orange/white bands look like random mixed specks.
    sampleDots(quality === "high" ? 28000 : 22000)
      .then((b) => alive && setBuffers(b))
      .catch((err) => console.error("[VMark] could not sample the logo artwork", err));
    return () => {
      alive = false;
    };
  }, [quality]);

  const dots = useMemo(() => {
    if (!buffers) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(buffers.position, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(buffers.color, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(buffers.seed, 1));
    geometry.setAttribute("aNode", new THREE.BufferAttribute(buffers.node, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uSize: { value: quality === "high" ? 1.9 : 2.35 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uTime: { value: 0 },
        uFade: { value: 1 },
        uTubeA: { value: 1 },
        uTubeB: { value: 1 },
        uTrail: { value: Array.from({ length: TRAIL_SLOTS }, () => new THREE.Vector3(0, 0, 0)) },
      },
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    return { geometry, material };
  }, [buffers, quality, gl]);

  useEffect(
    () => () => {
      dots?.geometry.dispose();
      dots?.material.dispose();
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

  // Hover flicker: a blink when the cursor arrives on the mark, then the odd stutter while it stays.
  const tubes = useRef({ over: false, nextAt: Infinity, a: { p: null as TubePattern | null, at: 0 }, b: { p: null as TubePattern | null, at: 0 } });

  const scratch = useMemo(
    () => ({
      raycaster: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      hit: new THREE.Vector3(),
      ndc: new THREE.Vector2(),
      lastMove: -Infinity,
      corner: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || !dots) return;
    if (!readySent.current) {
      readySent.current = true;
      requestAnimationFrame(() => onReady?.());
    }
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
        const over = Math.abs(scratch.hit.x) < MARK_W / 2 + 0.1 && Math.abs(scratch.hit.y) < MARK_H / 2 + 0.1;
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
        const tb = tubes.current;
        if (over && !tb.over) {
          tb.a = { p: blinkPattern(), at: t };
          tb.b = { p: blinkPattern(), at: t + 0.04 + Math.random() * 0.1 };
          tb.nextAt = t + 1.5 + Math.random() * 2;
        }
        tb.over = over;
      }
    }
    {
      const tb = tubes.current;
      if (interactive && tb.over && t > tb.nextAt && idle > 0.99) {
        // Usually one tube stutters, sometimes both.
        const pick = Math.random();
        if (pick < 0.4 || pick >= 0.75) tb.a = { p: blinkPattern(), at: t };
        if (pick >= 0.4) tb.b = { p: blinkPattern(), at: t + (pick >= 0.75 ? 0.06 : 0) };
        tb.nextAt = t + 1.8 + Math.random() * 2.5;
      }
      const levelA = tb.a.p ? sampleTube(tb.a.p, t - tb.a.at) : 1;
      const levelB = tb.b.p ? sampleTube(tb.b.p, t - tb.b.at) : 1;
      dots.material.uniforms.uTubeA.value = levelA;
      dots.material.uniforms.uTubeB.value = levelB;

      // Tube glow: place the DOM halo over the mark's on-screen box, brightness from the tubes.
      const glow = glowRef?.current;
      if (glow) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const [cx, cy] of GLOW_CORNERS) {
          scratch.corner.set(cx, cy, 0).applyMatrix4(g.matrixWorld).project(camera);
          const sx = ((scratch.corner.x + 1) / 2) * state.size.width;
          const sy = ((1 - scratch.corner.y) / 2) * state.size.height;
          minX = Math.min(minX, sx);
          maxX = Math.max(maxX, sx);
          minY = Math.min(minY, sy);
          maxY = Math.max(maxY, sy);
        }
        // Size is set only when it drifts noticeably (resize, fly-through); per-frame changes use a
        // scale transform, so the blurred layers are not re-rasterised every frame.
        const w = maxX - minX;
        const h = maxY - minY;
        let baseW = Number(glow.dataset.w) || 0;
        let baseH = Number(glow.dataset.h) || 0;
        if (!baseW || Math.abs(w / baseW - 1) > 0.15 || Math.abs(h / baseH - 1) > 0.15) {
          baseW = w;
          baseH = h;
          glow.dataset.w = String(w);
          glow.dataset.h = String(h);
          glow.style.width = `${w.toFixed(1)}px`;
          glow.style.height = `${h.toFixed(1)}px`;
        }
        glow.style.transformOrigin = "0 0";
        glow.style.transform = `translate3d(${minX.toFixed(1)}px, ${minY.toFixed(1)}px, 0) scale(${(w / baseW).toFixed(4)}, ${(h / baseH).toFixed(4)})`;
        // A faint mains hum while lit, plus the hover blinks; gone during the fly-through.
        const hum = 0.94 + Math.sin(t * 11) * 0.03 + Math.sin(t * 2.3) * 0.03;
        glow.style.opacity = String(Math.max(0, (idle * 1.4 - 0.4)) * hum * Math.min(1.2, (levelA + levelB) / 2));
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
      {dots && <points geometry={dots.geometry} material={dots.material} frustumCulled={false} />}
    </group>
  );
}
