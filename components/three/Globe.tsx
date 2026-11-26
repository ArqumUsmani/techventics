"use client";

import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Office } from "@/content/types";
import { LAND_H, LAND_MASK_B64, LAND_W } from "./landMask";

export const GLOBE_RADIUS = 1.6;
const EMBER = new THREE.Color("#FC5400");
const BONE = new THREE.Color("#F6F1EA");
const DEG = Math.PI / 180;

/** lat/lng → point on the sphere. Longitude 0 faces +z (the camera) before rotation. */
export function latLngToVec(lat: number, lng: number, r = GLOBE_RADIUS) {
  const la = lat * DEG;
  const ln = lng * DEG;
  return new THREE.Vector3(r * Math.cos(la) * Math.sin(ln), r * Math.sin(la), r * Math.cos(la) * Math.cos(ln));
}

let maskCache: Uint8Array | null = null;
function landMask() {
  if (!maskCache) maskCache = Uint8Array.from(atob(LAND_MASK_B64), (c) => c.charCodeAt(0));
  return maskCache;
}
function isLand(lat: number, lng: number) {
  const x = Math.min(LAND_W - 1, Math.max(0, Math.floor(lng + 180)));
  const y = Math.min(LAND_H - 1, Math.max(0, Math.floor(90 - lat)));
  const i = y * LAND_W + x;
  return (landMask()[i >> 3] & (1 << (i & 7))) !== 0;
}

/* Dots: fade toward the limb and vanish on the far side (no occluder mesh needed). */
const dotVertex = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = dot(n, normalize(-mv.xyz));
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio;
  }
`;
const dotFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vFacing;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5 || vFacing < 0.0) discard;
    float a = smoothstep(0.0, 0.55, vFacing) * smoothstep(0.5, 0.25, d) * 0.85;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

function arcPoints(from: THREE.Vector3, to: THREE.Vector3, segments = 72) {
  const a = from.clone().normalize();
  const b = to.clone().normalize();
  const angle = a.angleTo(b);
  const lift = 0.1 + (angle / Math.PI) * 0.34;
  const pts: THREE.Vector3[] = [];
  const q = new THREE.Quaternion();
  const axis = new THREE.Vector3().crossVectors(a, b).normalize();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    q.setFromAxisAngle(axis, angle * t);
    pts.push(a.clone().applyQuaternion(q).multiplyScalar(GLOBE_RADIUS + Math.sin(Math.PI * t) * lift));
  }
  return pts;
}

type GlobeProps = {
  offices: Office[];
  /** Origin office id for the arcs (the HQ). */
  hubId: string;
  quality: "high" | "low";
  /** Longitude (deg) to face the viewer on average. */
  centerLng?: number;
  interactive?: boolean;
  /** DOM label elements (one per office, same order), positioned over the canvas each frame. */
  labelsRef?: RefObject<(HTMLElement | null)[]>;
};

export function Globe({ offices, hubId, quality, centerLng = -16, interactive = true, labelsRef }: GlobeProps) {
  const spin = useRef<THREE.Group>(null);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
  const travelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  // Drag to spin: yaw/pitch added on top of the sway, with momentum after release.
  const drag = useRef({ active: false, id: -1, x: 0, y: 0, yaw: 0, pitch: 0, vYaw: 0, vPitch: 0, swayT: 0 });
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    if (!interactive) return;
    const el = gl.domElement;
    // Vertical swipes still scroll the page on touch screens; sideways swipes spin the globe.
    el.style.touchAction = "pan-y";
    el.style.cursor = "grab";
    const d = drag.current;
    const down = (e: PointerEvent) => {
      d.active = true;
      d.id = e.pointerId;
      d.x = e.clientX;
      d.y = e.clientY;
      d.vYaw = 0;
      d.vPitch = 0;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!d.active || e.pointerId !== d.id) return;
      const size = Math.max(el.clientWidth, 1);
      const dx = ((e.clientX - d.x) / size) * Math.PI * 1.4;
      const dy = ((e.clientY - d.y) / size) * Math.PI * 1.4;
      d.x = e.clientX;
      d.y = e.clientY;
      d.yaw += dx;
      d.pitch = THREE.MathUtils.clamp(d.pitch + dy, -1.1, 0.9);
      // Remember the speed for the momentum after release.
      d.vYaw = dx * 60;
      d.vPitch = dy * 60;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== d.id) return;
      d.active = false;
      el.style.cursor = "grab";
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl, interactive]);

  // Land dots on a Fibonacci sphere.
  const dots = useMemo(() => {
    const n = quality === "high" ? 26000 : 13000;
    const pos: number[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const lat = Math.asin(y) / DEG;
      const lng = ((((i * golden) / DEG) % 360) + 360) % 360 - 180;
      if (lat < -60 || !isLand(lat, lng)) continue; // skip Antarctica: it crowds the bottom
      const v = latLngToVec(lat, lng, GLOBE_RADIUS);
      pos.push(v.x, v.y, v.z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    const material = new THREE.ShaderMaterial({
      vertexShader: dotVertex,
      fragmentShader: dotFragment,
      uniforms: {
        uSize: { value: quality === "high" ? 2.4 : 2.6 },
        uPixelRatio: { value: Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio, 2) },
        uColor: { value: BONE },
      },
      transparent: true,
      depthWrite: false,
    });
    return { geometry, material };
  }, [quality]);

  const hub = offices.find((o) => o.id === hubId) ?? offices[0];
  const pins = useMemo(
    () =>
      offices.map((o) => ({
        office: o,
        pos: latLngToVec(o.coordinates.lat, o.coordinates.lng, GLOBE_RADIUS * 1.005),
        quat: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          latLngToVec(o.coordinates.lat, o.coordinates.lng, 1).normalize(),
        ),
      })),
    [offices],
  );
  const arcs = useMemo(
    () =>
      offices
        .filter((o) => o.id !== hub.id)
        .map((o) => {
          const pts = arcPoints(
            latLngToVec(hub.coordinates.lat, hub.coordinates.lng),
            latLngToVec(o.coordinates.lat, o.coordinates.lng),
          );
          return { id: o.id, pts, curve: new THREE.CatmullRomCurve3(pts) };
        }),
    [offices, hub],
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const g = spin.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    const d = drag.current;
    if (interactive) {
      // The hover lean rests while dragging, so the globe follows the hand exactly.
      const leanX = d.active ? pointer.current.x : state.pointer.x;
      const leanY = d.active ? pointer.current.y : state.pointer.y;
      pointer.current.x = THREE.MathUtils.damp(pointer.current.x, leanX, 3, delta);
      pointer.current.y = THREE.MathUtils.damp(pointer.current.y, leanY, 3, delta);
      if (!d.active) {
        // Momentum after release, easing out.
        d.yaw += d.vYaw * delta;
        d.pitch = THREE.MathUtils.clamp(d.pitch + d.vPitch * delta, -1.1, 0.9);
        const decay = Math.exp(-2.5 * delta);
        d.vYaw *= decay;
        d.vPitch *= decay;
        // The sway clock only runs when the globe is left alone.
        d.swayT += delta;
      }
    }
    // Gentle sway around the offices' longitudes rather than a full spin, so they stay in view.
    // Non-interactive (static capture) holds the centre, where all three offices face the viewer.
    const sway = interactive ? Math.sin(d.swayT * 0.12) * 30 : 0;
    g.rotation.y = -(centerLng + sway) * DEG + pointer.current.x * 0.25 + d.yaw;
    // ~35° tilt puts the view centre near 35°N; the wider sway brings Texas and Karachi into view in turn.
    g.rotation.x = 0.6 + pointer.current.y * -0.12 + d.pitch;

    // Pin pulse rings
    pulseRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const p = ((t * 0.6 + i * 0.33) % 1 + 1) % 1;
      ring.scale.setScalar(1 + p * 2.6);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.7;
    });

    // Light travelling along each arc, hub → office
    travelRefs.current.forEach((dot, i) => {
      if (!dot) return;
      const p = ((t * 0.32 + i * 0.5) % 1 + 1) % 1;
      arcs[i].curve.getPointAt(p, dot.position);
      dot.scale.setScalar(Math.sin(Math.PI * p) * 1.2 + 0.2);
    });

    // DOM labels (rendered by GlobeStage over the canvas): follow each pin's screen
    // position and fade as the pin turns away.
    const labels = labelsRef?.current;
    if (labels) {
      camDir.copy(state.camera.position).normalize();
      pins.forEach((pin, i) => {
        const label = labels[i];
        if (!label) return;
        tmp.copy(pin.pos).applyMatrix4(g.matrixWorld);
        const facing = tmp.clone().normalize().dot(camDir);
        tmp.project(state.camera);
        const x = ((tmp.x + 1) / 2) * state.size.width;
        const y = ((1 - tmp.y) / 2) * state.size.height;
        label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        label.style.opacity = String(THREE.MathUtils.clamp((facing - 0.15) * 3, 0, 1));
      });
    }
  });

  return (
    <group ref={spin}>
      <points geometry={dots.geometry} material={dots.material} />

      {arcs.map((arc, i) => (
        <group key={arc.id}>
          <Line points={arc.pts} color={EMBER} lineWidth={1.2} transparent opacity={0.55} toneMapped={false} />
          <mesh
            ref={(el) => {
              travelRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[0.013, 12, 8]} />
            <meshBasicMaterial color={EMBER} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {pins.map(({ office, pos, quat }, i) => (
        <group key={office.id} position={pos} quaternion={quat}>
          <mesh>
            <circleGeometry args={[0.03, 24]} />
            <meshBasicMaterial color={EMBER} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh
            ref={(el) => {
              pulseRefs.current[i] = el;
            }}
          >
            <ringGeometry args={[0.032, 0.04, 32]} />
            <meshBasicMaterial color={EMBER} transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
