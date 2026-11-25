/*
 * Geometry of the triangular "V" mark, in logo units (SVG space: x right, y down, 64 × 58).
 * Shared by the 2D placeholder logo and the 3D model, so both stay in sync.
 *
 * PLACEHOLDER: approximated from the logo description. When the real SVG arrives, replace
 * the facet points (one polygon per facet) and the traces; nothing else needs to change.
 */

export type Point = readonly [number, number];

/** "dark" = the black half of the logo, "flare" / "ember" / "burnt" = the orange half. */
export type FacetTone = "dark" | "flare" | "ember" | "burnt";

export type Facet = {
  id: string;
  points: readonly Point[];
  tone: FacetTone;
  /** 2D opacity for dark facets (gives the flat logo its faceted read). */
  shade?: number;
  /** 3D only: extrusion depth (world units), z offset and small tilt [x, y] in radians. */
  depth: number;
  z: number;
  tilt: readonly [number, number];
};

export type Trace = {
  id: string;
  /** Polyline starting on an arm edge; the last point carries the node dot. */
  points: readonly Point[];
};

export const VIEWBOX = { x: -8, y: -2, width: 80, height: 70 } as const;

export const facets: readonly Facet[] = [
  // Left arm (black in the logo)
  { id: "L1", tone: "dark", shade: 1, points: [[0, 0], [18, 0], [32, 28]], depth: 0.34, z: 0.05, tilt: [0.03, 0.06] },
  { id: "L2", tone: "dark", shade: 0.7, points: [[0, 0], [16, 14], [32, 58]], depth: 0.3, z: 0, tilt: [-0.02, 0.09] },
  { id: "L3", tone: "dark", shade: 0.85, points: [[16, 14], [32, 28], [32, 58]], depth: 0.36, z: 0.03, tilt: [-0.04, 0.04] },
  // Right arm (orange in the logo)
  { id: "R1", tone: "flare", points: [[46, 0], [64, 0], [32, 28]], depth: 0.34, z: 0.05, tilt: [0.03, -0.06] },
  { id: "R2", tone: "ember", points: [[64, 0], [32, 58], [48, 14]], depth: 0.3, z: 0, tilt: [-0.01, -0.09] },
  { id: "R3", tone: "burnt", points: [[48, 14], [32, 58], [32, 28]], depth: 0.36, z: 0.03, tilt: [-0.04, -0.04] },
];

export const traces: readonly Trace[] = [
  { id: "T-right", points: [[57.4, 12], [62.4, 17], [70, 17]] },
  { id: "T-left", points: [[6.6, 12], [1.6, 17], [-6, 17]] },
  { id: "T-tip", points: [[32, 58], [32, 64.5]] },
];

/** The V's opening (the notch between the arms). The scroll fly-through passes through it. */
export const notch: readonly Point[] = [[18, 0], [46, 0], [32, 28]];

export const toneHex: Record<FacetTone, string> = {
  dark: "#F6F1EA", // drawn in bone in 2D so it reads on ink
  flare: "#FF7A1F",
  ember: "#FC5400",
  burnt: "#E04808",
};

export const pointsAttr = (pts: readonly Point[]) => pts.map(([x, y]) => `${x},${y}`).join(" ");
