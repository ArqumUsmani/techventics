/**
 * Hero background engines, drawn on one 2D canvas by HeroBackdrop.
 * Each reacts to the pointer (hover) and to clicks. Pick one with ?hero=<name>.
 */

export type Pointer = { x: number; y: number; inside: boolean; speed: number };
export type Engine = {
  resize(w: number, h: number, small: boolean, dpr: number): void;
  frame(ctx: CanvasRenderingContext2D, dt: number, t: number, p: Pointer): void;
  click(x: number, y: number): void;
};

export const HERO_BACKDROPS = ["circuit", "signal", "network", "sparks"] as const;
export type HeroBackdropName = (typeof HERO_BACKDROPS)[number];

const EMBER = "252,84,0";
const HOT = "255,214,170";
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const gauss = (d: number, r: number) => Math.exp(-(d * d) / (2 * r * r));

/** Soft ember pools that breathe: the shared "lighting" under every backdrop. */
function lighting(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, strength = 1) {
  const pools: [number, number, number, number][] = [
    [w * 0.16, h * 0.86, Math.max(w, h) * 0.5, (0.09 + Math.sin(t * 0.6) * 0.03) * strength],
    [w * 0.88, h * 0.18, Math.max(w, h) * 0.42, (0.07 + Math.sin(t * 0.45 + 2) * 0.025) * strength],
  ];
  for (const [x, y, r, a] of pools) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${EMBER},${a})`);
    g.addColorStop(1, `rgba(${EMBER},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

/** Expanding ring left by a click. */
type Ripple = { x: number; y: number; t: number };
function drawRipples(ctx: CanvasRenderingContext2D, ripples: Ripple[], dt: number, speed = 520, life = 1.1) {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.t += dt;
    if (r.t > life) {
      ripples.splice(i, 1);
      continue;
    }
    const k = 1 - r.t / life;
    ctx.strokeStyle = `rgba(${EMBER},${0.55 * k * k})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.t * speed, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ circuit */

type Trace = { pts: [number, number][]; cum: number[]; len: number };
type Pulse = { tr: Trace; s: number; v: number; tail: number; hot: boolean };
type Flash = { x: number; y: number; t: number };

function traceAt(tr: Trace, s: number): [number, number] {
  s = Math.max(0, Math.min(tr.len, s));
  let i = 1;
  while (i < tr.cum.length - 1 && tr.cum[i] < s) i++;
  const [ax, ay] = tr.pts[i - 1];
  const [bx, by] = tr.pts[i];
  const seg = tr.cum[i] - tr.cum[i - 1] || 1;
  const k = (s - tr.cum[i - 1]) / seg;
  return [ax + (bx - ax) * k, ay + (by - ay) * k];
}

/** Circuit board: traces and chips; current pulses run along the traces. Hover lights the board, a click sends current out. */
export function circuit(): Engine {
  let w = 0;
  let h = 0;
  let traces: Trace[] = [];
  let base: HTMLCanvasElement | null = null;
  let lit: HTMLCanvasElement | null = null;
  let scratch: HTMLCanvasElement | null = null;
  const pulses: Pulse[] = [];
  const flashes: Flash[] = [];
  const ripples: Ripple[] = [];
  let spawn = 0;
  let hoverSpawn = 0;
  let dpr = 1;

  // Offscreen layers at device resolution, drawn in CSS pixels.
  const layer = () => {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * dpr));
    c.height = Math.max(1, Math.round(h * dpr));
    c.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
    return c;
  };

  // Keep the centre (where the mark sits) quieter.
  const inCore = (x: number, y: number) => ((x - w / 2) / (w * 0.2)) ** 2 + ((y - h * 0.5) / (h * 0.3)) ** 2 < 1;

  const build = (small: boolean) => {
    const g = small ? 22 : 30;
    const dirs: [number, number][] = [
      [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
    ];
    traces = [];
    const count = small ? 46 : 96;
    let guard = 0;
    while (traces.length < count && guard++ < count * 20) {
      let x = Math.round(rand(0, w) / g) * g;
      let y = Math.round(rand(0, h) / g) * g;
      if (inCore(x, y)) continue;
      // Head away from the centre, mostly horizontally/vertically like a real board.
      let d = Math.abs(x - w / 2) / w > Math.abs(y - h / 2) / h ? (x < w / 2 ? 4 : 0) : y < h / 2 ? 6 : 2;
      if (Math.random() < 0.5) d = (d + 4) % 8; // half run toward the centre and stop at its edge
      const pts: [number, number][] = [[x, y]];
      const steps = Math.round(rand(5, small ? 12 : 18));
      for (let i = 0; i < steps; i++) {
        if (Math.random() < 0.28) d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;
        const nx = x + dirs[d][0] * g;
        const ny = y + dirs[d][1] * g;
        if (nx < -g || ny < -g || nx > w + g || ny > h + g || inCore(nx, ny)) break;
        x = nx;
        y = ny;
        pts.push([x, y]);
      }
      if (pts.length < 3) continue;
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      traces.push({ pts, cum, len: cum[cum.length - 1] });
    }

    // Chips: a few IC packages with pins, out of the mark's way.
    const chips: [number, number, number, number][] = [];
    for (let i = 0; i < (small ? 2 : 5); i++) {
      const cw = g * Math.round(rand(2, 4));
      const ch = g * 2;
      const cx = Math.round(rand(0, w - cw) / g) * g;
      const cy = Math.round(rand(0, h - ch) / g) * g;
      if (inCore(cx + cw / 2, cy + ch / 2)) continue;
      chips.push([cx, cy, cw, ch]);
    }

    const paint = (c: HTMLCanvasElement, line: string, via: string, fillVias: boolean, chipStroke: string) => {
      const x = c.getContext("2d")!;
      x.lineWidth = 1;
      x.lineJoin = "round";
      x.strokeStyle = line;
      for (const tr of traces) {
        x.beginPath();
        tr.pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)));
        x.stroke();
      }
      for (const tr of traces) {
        for (const [px, py] of [tr.pts[0], tr.pts[tr.pts.length - 1]]) {
          x.beginPath();
          x.arc(px, py, 2.6, 0, Math.PI * 2);
          if (fillVias) {
            x.fillStyle = via;
            x.fill();
          } else {
            x.strokeStyle = via;
            x.stroke();
          }
        }
      }
      x.strokeStyle = chipStroke;
      for (const [cx, cy, cw, ch] of chips) {
        x.strokeRect(cx + 0.5, cy + 0.5, cw, ch);
        for (let px = cx + 8; px < cx + cw - 4; px += 8) {
          x.beginPath();
          x.moveTo(px, cy);
          x.lineTo(px, cy - 5);
          x.moveTo(px, cy + ch);
          x.lineTo(px, cy + ch + 5);
          x.stroke();
        }
      }
    };
    base = layer();
    lit = layer();
    scratch = layer();
    paint(base, "rgba(246,241,234,0.075)", "rgba(246,241,234,0.14)", false, "rgba(246,241,234,0.1)");
    paint(lit, `rgba(${EMBER},0.85)`, `rgba(${EMBER},1)`, true, `rgba(${EMBER},0.7)`);
  };

  const pulseOn = (tr: Trace, from = 0, hot = false) => pulses.push({ tr, s: from, v: rand(160, 320) * (hot ? 1.6 : 1), tail: rand(40, 90), hot });

  const nearest = (x: number, y: number, radius: number) => {
    const out: { tr: Trace; s: number; d: number }[] = [];
    for (const tr of traces) {
      let best = Infinity;
      let bestS = 0;
      tr.pts.forEach(([px, py], i) => {
        const d = Math.hypot(px - x, py - y);
        if (d < best) {
          best = d;
          bestS = tr.cum[i];
        }
      });
      if (best < radius) out.push({ tr, s: bestS, d: best });
    }
    return out.sort((a, b) => a.d - b.d);
  };

  return {
    resize(nw, nh, small, ratio) {
      w = nw;
      h = nh;
      dpr = ratio;
      pulses.length = 0;
      build(small);
    },
    click(x, y) {
      ripples.push({ x, y, t: 0 });
      flashes.push({ x, y, t: 0 });
      for (const n of nearest(x, y, 220).slice(0, 14)) pulseOn(n.tr, n.s, true);
    },
    frame(ctx, dt, t, p) {
      if (!base || !lit || !scratch) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(base, 0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      lighting(ctx, w, h, t, 0.9);

      // Hover: reveal the board in ember around the pointer.
      if (p.inside) {
        const sc = scratch.getContext("2d")!;
        sc.globalCompositeOperation = "source-over";
        sc.clearRect(0, 0, w, h);
        sc.drawImage(lit, 0, 0, w, h);
        sc.globalCompositeOperation = "destination-in";
        const r = 170 + Math.min(p.speed, 1200) * 0.05;
        const g = sc.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, "rgba(0,0,0,0.9)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        sc.fillStyle = g;
        sc.fillRect(0, 0, w, h);
        ctx.drawImage(scratch, 0, 0, w, h);
        hoverSpawn -= dt;
        if (hoverSpawn <= 0) {
          const n = nearest(p.x, p.y, 160);
          if (n.length) pulseOn(n[Math.floor(Math.random() * Math.min(4, n.length))].tr, 0);
          hoverSpawn = 0.14;
        }
      }

      // Ambient current.
      spawn -= dt;
      if (spawn <= 0 && traces.length) {
        pulseOn(traces[Math.floor(Math.random() * traces.length)]);
        spawn = rand(0.12, 0.3);
      }

      ctx.lineCap = "round";
      for (let i = pulses.length - 1; i >= 0; i--) {
        const q = pulses[i];
        q.s += q.v * dt;
        if (q.s - q.tail > q.tr.len) {
          pulses.splice(i, 1);
          continue;
        }
        if (q.s >= q.tr.len && q.s - q.v * dt < q.tr.len) {
          const [ex, ey] = q.tr.pts[q.tr.pts.length - 1];
          flashes.push({ x: ex, y: ey, t: 0 });
        }
        // Trail: a few samples behind the head.
        const steps = 8;
        for (let k = 0; k < steps; k++) {
          const s1 = q.s - (q.tail * k) / steps;
          const s0 = q.s - (q.tail * (k + 1)) / steps;
          if (s1 < 0 || s0 > q.tr.len) continue;
          const [ax, ay] = traceAt(q.tr, s0);
          const [bx, by] = traceAt(q.tr, s1);
          const a = (1 - k / steps) * (q.hot ? 1 : 0.75);
          ctx.strokeStyle = `rgba(${EMBER},${a})`;
          ctx.lineWidth = q.hot ? 2.2 : 1.6;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
        if (q.s <= q.tr.len) {
          const [hx, hy] = traceAt(q.tr, q.s);
          ctx.fillStyle = `rgba(${HOT},0.95)`;
          ctx.beginPath();
          ctx.arc(hx, hy, q.hot ? 2.2 : 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.t += dt;
        const k = 1 - f.t / 0.5;
        if (k <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 26);
        g.addColorStop(0, `rgba(${HOT},${0.8 * k})`);
        g.addColorStop(0.3, `rgba(${EMBER},${0.5 * k})`);
        g.addColorStop(1, `rgba(${EMBER},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(f.x - 26, f.y - 26, 52, 52);
      }
      drawRipples(ctx, ripples, dt);
    },
  };
}

/* ------------------------------------------------------------------- signal */

/** Oscilloscope: layered signal lines that bend around the pointer; a click sends a shockwave through them. */
export function signal(): Engine {
  let w = 0;
  let h = 0;
  let lines: { y: number; amp: number; f: number; sp: number; ph: number; a: number }[] = [];
  const shocks: Ripple[] = [];
  const packets: { line: number; x: number; v: number }[] = [];
  let packetT = 0;
  return {
    resize(nw, nh, small) {
      w = nw;
      h = nh;
      const n = small ? 16 : 30;
      lines = Array.from({ length: n }, (_, i) => {
        const y = (h * (i + 0.5)) / n;
        const edge = Math.abs(y - h / 2) / (h / 2); // brighter toward top and bottom, quieter behind the mark
        return { y, amp: rand(4, 14), f: rand(0.006, 0.016), sp: rand(0.6, 1.6), ph: rand(0, 6.28), a: 0.05 + edge * 0.16 };
      });
    },
    click(x, y) {
      shocks.push({ x, y, t: 0 });
      for (let i = 0; i < 3; i++) packets.push({ line: Math.floor(Math.random() * lines.length), x: x, v: rand(-900, 900) });
    },
    frame(ctx, dt, t, p) {
      ctx.globalCompositeOperation = "lighter";
      lighting(ctx, w, h, t);
      const step = w < 768 ? 10 : 7;
      for (let i = shocks.length - 1; i >= 0; i--) {
        shocks[i].t += dt;
        if (shocks[i].t > 1.6) shocks.splice(i, 1);
      }
      const yOf = (L: (typeof lines)[number], x: number) => {
        let y = L.y + Math.sin(x * L.f + t * L.sp + L.ph) * L.amp * (0.6 + 0.4 * Math.sin(x * 0.002 + t * 0.3 + L.ph));
        if (p.inside) {
          // Lines bend away from the pointer, like a field around a charge.
          const dx = x - p.x;
          const dy = L.y - p.y;
          const push = gauss(Math.hypot(dx, dy * 0.8), 120) * 46;
          y += Math.sign(dy || 1) * push;
        }
        for (const s of shocks) {
          const d = Math.hypot(x - s.x, L.y - s.y);
          const front = s.t * 700;
          y += Math.sin((d - front) * 0.05) * 22 * Math.exp(-Math.abs(d - front) / 60) * (1 - s.t / 1.6);
        }
        return y;
      };
      for (const L of lines) {
        let near = 0;
        if (p.inside) near = gauss(Math.abs(L.y - p.y), 90);
        ctx.strokeStyle = `rgba(${EMBER},${Math.min(0.9, L.a + near * 0.6)})`;
        ctx.lineWidth = 1 + near * 0.8;
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          const y = yOf(L, x);
          if (x < 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // Packets: bright signals running along random lines.
      packetT -= dt;
      if (packetT <= 0) {
        packets.push({ line: Math.floor(Math.random() * lines.length), x: Math.random() < 0.5 ? -20 : w + 20, v: 0 });
        const last = packets[packets.length - 1];
        last.v = last.x < 0 ? rand(300, 600) : -rand(300, 600);
        packetT = rand(0.35, 0.9);
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const k = packets[i];
        k.x += k.v * dt;
        if (k.x < -60 || k.x > w + 60) {
          packets.splice(i, 1);
          continue;
        }
        const L = lines[k.line];
        if (!L) continue;
        const dir = Math.sign(k.v);
        for (let j = 0; j < 10; j++) {
          const x0 = k.x - dir * j * 6;
          const a = 1 - j / 10;
          ctx.fillStyle = j === 0 ? `rgba(${HOT},0.95)` : `rgba(${EMBER},${0.6 * a})`;
          ctx.beginPath();
          ctx.arc(x0, yOf(L, x0), j === 0 ? 2 : 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Shock rings, faint.
      for (const s of shocks) {
        const k = 1 - s.t / 1.6;
        ctx.strokeStyle = `rgba(${EMBER},${0.3 * k * k})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.t * 700, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  };
}

/* ------------------------------------------------------------------ network */

type Node = { x: number; y: number; ox: number; oy: number; ph: number; hub: boolean; links: number[]; glow: number };
type Packet = { a: number; b: number; k: number; v: number; hops: number };

/** Network: devices linked like a topology map, with packets moving between them. Hover wires nodes to the cursor; a click floods packets outward. */
export function network(): Engine {
  let w = 0;
  let h = 0;
  let nodes: Node[] = [];
  const packets: Packet[] = [];
  const ripples: Ripple[] = [];
  let spawn = 0;
  let hoverSpawn = 0;

  const send = (a: number, hops: number) => {
    for (const b of nodes[a].links) if (Math.random() < 0.8) packets.push({ a, b, k: 0, v: rand(0.8, 1.6), hops });
  };
  const closest = (x: number, y: number) => {
    let best = -1;
    let bd = Infinity;
    nodes.forEach((n, i) => {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return { i: best, d: bd };
  };

  return {
    resize(nw, nh, small) {
      w = nw;
      h = nh;
      packets.length = 0;
      const n = small ? 30 : 64;
      nodes = [];
      let guard = 0;
      while (nodes.length < n && guard++ < n * 30) {
        const x = rand(20, w - 20);
        const y = rand(20, h - 20);
        if (((x - w / 2) / (w * 0.16)) ** 2 + ((y - h / 2) / (h * 0.26)) ** 2 < 1) continue; // leave the mark clear
        if (nodes.some((m) => Math.hypot(m.x - x, m.y - y) < (small ? 50 : 80))) continue;
        nodes.push({ x, y, ox: x, oy: y, ph: rand(0, 6.28), hub: Math.random() < 0.14, links: [], glow: 0 });
      }
      // Link each node to its nearest neighbours (both ways).
      nodes.forEach((a, i) => {
        const near = nodes
          .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
          .filter((o) => o.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, a.hub ? 4 : 2);
        for (const { j } of near) {
          if (!a.links.includes(j)) a.links.push(j);
          if (!nodes[j].links.includes(i)) nodes[j].links.push(i);
        }
      });
    },
    click(x, y) {
      ripples.push({ x, y, t: 0 });
      const c = closest(x, y);
      if (c.i >= 0) {
        nodes[c.i].glow = 1;
        send(c.i, 4);
      }
    },
    frame(ctx, dt, t, p) {
      ctx.globalCompositeOperation = "lighter";
      lighting(ctx, w, h, t);
      for (const n of nodes) {
        n.x = n.ox + Math.sin(t * 0.3 + n.ph) * 6;
        n.y = n.oy + Math.cos(t * 0.25 + n.ph) * 6;
        n.glow = Math.max(0, n.glow - dt * 1.4);
      }
      // Links
      ctx.lineWidth = 1;
      nodes.forEach((a, i) => {
        for (const j of a.links) {
          if (j < i) continue;
          const b = nodes[j];
          const lit = Math.max(a.glow, b.glow);
          ctx.strokeStyle = lit > 0 ? `rgba(${EMBER},${0.12 + lit * 0.5})` : "rgba(246,241,234,0.07)";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      });
      // Hover: nearby nodes wire up to the cursor.
      if (p.inside) {
        nodes.forEach((n, i) => {
          const d = Math.hypot(n.x - p.x, n.y - p.y);
          if (d < 200) {
            const a = 1 - d / 200;
            ctx.strokeStyle = `rgba(${EMBER},${a * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
            n.glow = Math.max(n.glow, a * 0.7);
            hoverSpawn -= dt * a;
            if (hoverSpawn <= 0) {
              send(i, 1);
              hoverSpawn = 0.5;
            }
          }
        });
        ctx.fillStyle = `rgba(${HOT},0.9)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Ambient traffic.
      spawn -= dt;
      if (spawn <= 0 && nodes.length) {
        send(Math.floor(Math.random() * nodes.length), 1);
        spawn = rand(0.25, 0.6);
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const q = packets[i];
        q.k += q.v * dt;
        const a = nodes[q.a];
        const b = nodes[q.b];
        if (!a || !b) {
          packets.splice(i, 1);
          continue;
        }
        if (q.k >= 1) {
          b.glow = 1;
          packets.splice(i, 1);
          if (q.hops > 1) for (const c of b.links) if (c !== q.a && Math.random() < 0.6) packets.push({ a: q.b, b: c, k: 0, v: rand(0.9, 1.6), hops: q.hops - 1 });
          continue;
        }
        const x = a.x + (b.x - a.x) * q.k;
        const y = a.y + (b.y - a.y) * q.k;
        const tx = a.x + (b.x - a.x) * Math.max(0, q.k - 0.12);
        const ty = a.y + (b.y - a.y) * Math.max(0, q.k - 0.12);
        ctx.strokeStyle = `rgba(${EMBER},0.8)`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = `rgba(${HOT},0.95)`;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // Nodes: small device squares; hubs get a ring.
      for (const n of nodes) {
        const s = n.hub ? 5 : 3;
        ctx.fillStyle = n.glow > 0 ? `rgba(${EMBER},${0.35 + n.glow * 0.65})` : "rgba(246,241,234,0.28)";
        ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
        if (n.hub) {
          ctx.strokeStyle = `rgba(${EMBER},${0.25 + n.glow * 0.6})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 9 + Math.sin(t * 2 + n.ph) * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      drawRipples(ctx, ripples, dt);
    },
  };
}

/* ------------------------------------------------------------------- sparks */

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; w: number };
type Ember = { x: number; y: number; vx: number; vy: number; drift: number; phase: number; r: number; a: number };
type Arc = { x: number; y: number; t: number; arc: [number, number][] };

/** Electrical sparks and drifting embers. Embers swirl away from the pointer, a fast swipe throws sparks, a click makes a burst. */
export function sparks(): Engine {
  let w = 0;
  let h = 0;
  let small = false;
  const list: Spark[] = [];
  const arcs: Arc[] = [];
  let embers: Ember[] = [];
  let next = 0.6;
  let trail = 0;
  const newEmber = (anywhere = false): Ember => ({ x: rand(0, w), y: anywhere ? rand(0, h) : h + 10, vx: 0, vy: rand(10, 34), drift: rand(6, 18), phase: rand(0, 6.28), r: rand(0.6, 1.8), a: rand(0.25, 0.8) });

  const burst = (x: number, y: number, power = 1) => {
    const n = Math.round((small ? rand(20, 34) : rand(32, 58)) * power);
    for (let i = 0; i < n; i++) {
      const angle = rand(-Math.PI, 0) + rand(-0.35, 0.35);
      const speed = rand(180, 640);
      const max = rand(0.6, 1.5);
      list.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: max, max, w: rand(1, 2.2) });
    }
    const ex = x + rand(-90, 90);
    const ey = y + rand(-70, 30);
    const arc: [number, number][] = [];
    for (let i = 0; i <= 7; i++) {
      const k = i / 7;
      const j = i === 0 || i === 7 ? 0 : rand(-14, 14);
      arc.push([x + (ex - x) * k + j, y + (ey - y) * k + j * 0.6]);
    }
    arcs.push({ x, y, t: 0, arc });
  };

  return {
    resize(nw, nh, isSmall) {
      w = nw;
      h = nh;
      small = isSmall;
      embers = Array.from({ length: small ? 22 : 46 }, () => newEmber(true));
    },
    click(x, y) {
      burst(x, y, 1.3);
    },
    frame(ctx, dt, t, p) {
      ctx.globalCompositeOperation = "lighter";
      lighting(ctx, w, h, t, 1.1);

      for (const e of embers) {
        if (p.inside) {
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 160) {
            const f = (1 - d / 160) * 260;
            e.vx += (dx / d) * f * dt;
            e.vy -= (dy / d) * f * dt;
          }
        }
        e.vx *= 1 - 2 * dt;
        e.y -= e.vy * dt;
        e.vy += (rand(10, 34) - e.vy) * dt * 0.5;
        e.x += (Math.sin(t * 0.8 + e.phase) * e.drift + e.vx) * dt;
        if (e.y < -10 || e.x < -20 || e.x > w + 20) Object.assign(e, newEmber());
        const flicker = 0.6 + 0.4 * Math.sin(t * 3 + e.phase * 3);
        ctx.fillStyle = `rgba(255,${120 + Math.round(flicker * 60)},40,${e.a * flicker})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${EMBER},${0.12 * e.a * flicker})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fast pointer movement throws a few sparks off the cursor.
      if (p.inside && p.speed > 700) {
        trail -= dt;
        if (trail <= 0) {
          for (let i = 0; i < 3; i++) {
            const max = rand(0.3, 0.7);
            list.push({ x: p.x, y: p.y, vx: rand(-160, 160), vy: rand(-220, -40), life: max, max, w: rand(0.8, 1.6) });
          }
          trail = 0.03;
        }
      }

      next -= dt;
      if (next <= 0) {
        const side = Math.random() < 0.5 ? -1 : 1;
        burst(w / 2 + side * rand(w * 0.08, w * 0.46), rand(h * 0.18, h * 0.78));
        next = rand(0.8, 2.1);
      }

      for (let i = arcs.length - 1; i >= 0; i--) {
        const f = arcs[i];
        f.t += dt;
        const k = Math.max(0, 1 - f.t / 0.45);
        if (k <= 0) {
          arcs.splice(i, 1);
          continue;
        }
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 190);
        g.addColorStop(0, `rgba(${HOT},${0.5 * k * k})`);
        g.addColorStop(0.25, `rgba(${EMBER},${0.25 * k})`);
        g.addColorStop(1, `rgba(${EMBER},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(f.x - 190, f.y - 190, 380, 380);
        if (f.t < 0.18 && Math.random() > 0.2) {
          ctx.strokeStyle = `rgba(255,236,214,${0.9 * k})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          f.arc.forEach(([ax, ay], j) => (j ? ctx.lineTo(ax + rand(-3, 3), ay + rand(-3, 3)) : ctx.moveTo(ax, ay)));
          ctx.stroke();
        }
      }

      ctx.lineCap = "round";
      for (let i = list.length - 1; i >= 0; i--) {
        const s = list[i];
        s.life -= dt;
        if (s.life <= 0 || s.y > h + 20) {
          list.splice(i, 1);
          continue;
        }
        s.vy += 760 * dt;
        s.vx *= 1 - 1.6 * dt;
        s.vy *= 1 - 0.6 * dt;
        const px = s.x;
        const py = s.y;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const k = s.life / s.max;
        ctx.strokeStyle = `rgba(255,${Math.round(90 + 150 * k)},${Math.round(20 + 180 * k * k)},${Math.min(1, k * 1.4)})`;
        ctx.lineWidth = s.w;
        ctx.beginPath();
        ctx.moveTo(px - s.vx * 0.03, py - s.vy * 0.03);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
    },
  };
}

export const ENGINES: Record<HeroBackdropName, () => Engine> = { circuit, signal, network, sparks };
