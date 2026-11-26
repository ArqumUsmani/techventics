import { LOGO_FILES, MARK_NODES } from "@/components/brand/logoFiles";

/**
 * The hero's dotted mark, drawn on a plain 2D canvas for the splash (no three.js, so it
 * shows straight away). Dots are sampled from the logo artwork exactly like the 3D mark:
 * bone where the logo is white, ember where it is orange, pulsing clusters in the three
 * circuit nodes. The white and ember strokes take separate tube levels, so they can
 * flicker independently.
 */
export type DotMark = { draw(white: number, ember: number, t: number): void };

const BONE = [221, 217, 211];
const EMBER = [252, 84, 0];
const FLARE = [255, 122, 31];
// Same density as the desktop hero mark: dots per square CSS pixel of the mark's box.
const DENSITY = 0.1;

type Dot = { x: number; y: number; r: number; a: number };

export async function createDotMark(canvas: HTMLCanvasElement): Promise<DotMark | null> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const img = new Image();
  img.src = LOGO_FILES.mark.srcOnDark;
  await img.decode();

  // Sample the artwork at a fixed resolution, split ink by colour (as the 3D mark does).
  const sw = 480;
  const sh = Math.round(sw * (LOGO_FILES.mark.height / LOGO_FILES.mark.width));
  const off = document.createElement("canvas");
  off.width = sw;
  off.height = sh;
  const octx = off.getContext("2d", { willReadFrequently: true });
  if (!octx) return null;
  octx.drawImage(img, 0, 0, sw, sh);
  const { data } = octx.getImageData(0, 0, sw, sh);
  const bonePx: number[] = [];
  const emberPx: number[] = [];
  for (let i = 0; i < sw * sh; i++) {
    if (data[i * 4 + 3] < 140) continue;
    (data[i * 4] - data[i * 4 + 2] > 110 ? emberPx : bonePx).push(i);
  }
  const ink = bonePx.length + emberPx.length;
  if (!ink) return null;

  // Number of dots from the drawn size, so the density matches the hero.
  const total = Math.round(w * h * DENSITY);
  // The hero's dots are about 1.5 CSS px across; match that rather than scaling with size.
  // On 1x screens a dot that small is mostly edge blur and reads grey, so go a little larger.
  const dotR = dpr < 1.5 ? 0.95 : 0.78;
  const bone: Dot[] = [];
  const ember: Dot[] = [];
  const flare: Dot[] = [];
  for (let k = 0; k < total; k++) {
    const fromEmber = Math.random() < emberPx.length / ink;
    const list = fromEmber ? emberPx : bonePx;
    const idx = list[(Math.random() * list.length) | 0];
    const dot = {
      x: (((idx % sw) + Math.random()) / sw) * w,
      y: ((((idx / sw) | 0) + Math.random()) / sh) * h,
      r: dotR * (0.75 + Math.random() * 0.5),
      a: Math.random(),
    };
    (fromEmber ? (Math.random() < 0.25 ? flare : ember) : bone).push(dot);
  }

  // Node clusters (pulsing, like the hero).
  const nodes = MARK_NODES.map((n) => {
    const dots: Dot[] = [];
    for (let k = 0; k < 40; k++) {
      const ang = Math.random() * Math.PI * 2;
      const rr = Math.sqrt(Math.random()) * n.r * 0.6;
      dots.push({ x: (n.u + Math.cos(ang) * rr) * w, y: (n.v + Math.sin(ang) * rr * (LOGO_FILES.mark.width / LOGO_FILES.mark.height)) * h, r: dotR, a: 1 });
    }
    return dots;
  });

  const paint = (dots: Dot[], rgb: number[], level: number, scale = 1) => {
    // Unlit tubes still show faintly, as in the hero (10% when off).
    const lit = 0.1 + 0.9 * Math.min(1, level);
    const hot = level > 1 ? level : 1;
    // Two brightness groups keep the fills batched while dots still vary a little.
    for (const [lo, hi, alpha] of [
      [0, 0.35, 0.8],
      [0.35, 1.01, 1],
    ]) {
      ctx.fillStyle = `rgba(${Math.min(255, rgb[0] * hot)},${Math.min(255, rgb[1] * hot)},${Math.min(255, rgb[2] * hot)},${lit * alpha})`;
      ctx.beginPath();
      for (const d of dots) {
        if (d.a < lo || d.a >= hi) continue;
        const r = d.r * scale;
        ctx.moveTo(d.x + r, d.y);
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  };

  return {
    draw(white, emberLevel, t) {
      ctx.clearRect(0, 0, w, h);
      paint(bone, BONE, white);
      paint(ember, EMBER, emberLevel);
      paint(flare, FLARE, emberLevel);
      nodes.forEach((dots, i) => {
        const pulse = 1 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.6 - (i + 1) * 1.1), 3);
        paint(dots, EMBER, emberLevel * Math.min(1.25, pulse), pulse);
      });
    },
  };
}
