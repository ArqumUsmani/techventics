#!/usr/bin/env node
/**
 * Renders a live 3D scene in headless Chrome and saves it as its static fallback image,
 * used for reduced motion, weak GPUs and first paint.
 *
 * Usage (with `npm run dev` running):
 *   npm run capture:vmark   → public/images/vmark-fallback.webp (+ -960)  (hero mark)
 *   npm run capture:globe   → public/images/globe-fallback.webp (+ -500)  (Home globe)
 * Options (env): BASE_URL (default http://localhost:3000), CHROME_PATH.
 * Re-run after changing a scene (e.g. when the real logo SVG is dropped in).
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const TARGETS = {
  // small: a half-size copy for phones (used via srcset, as there is no image optimiser on static hosting)
  vmark: { path: "/capture/vmark?capture=1&tier=high", flag: "vmarkLive", out: "vmark-fallback.webp", width: 1920, height: 1200, small: 960 },
  globe: { path: "/capture/globe?capture=1", flag: "globeLive", out: "globe-fallback.webp", width: 1000, height: 1000, small: 500 },
};
const name = process.argv[2] ?? "vmark";
const target = TARGETS[name];
if (!target) throw new Error(`Unknown target "${name}". Use one of: ${Object.keys(TARGETS).join(", ")}`);
const WIDTH = target.width;
const HEIGHT = target.height;
const OUT = join(root, "public", "images", target.out);
const PORT = 9400 + Math.floor(Math.random() * 400);

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) throw new Error("Chrome not found. Set CHROME_PATH.");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), "scene-capture-"));
const proc = spawn(
  chrome,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--hide-scrollbars",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    `--window-size=${WIDTH},${HEIGHT}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function main() {
  let page;
  for (let i = 0; i < 60 && !page; i++) {
    try {
      page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page");
    } catch {}
    if (!page) await sleep(250);
  }
  if (!page) throw new Error("Could not connect to headless Chrome");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id) pending.get(msg.id)?.(msg);
  });
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.result?.value;

  await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: `${BASE}${target.path}` });

  // Wait for the first live frame, then let the scene settle.
  const started = Date.now();
  while ((await evaluate(`document.documentElement.dataset.${target.flag}`)) !== "true") {
    if (Date.now() - started > 90_000) throw new Error("Scene never went live (is the dev server running?)");
    await sleep(500);
  }
  await sleep(4000);

  // Hide the header and dev overlay so only the scene is captured.
  await evaluate(
    "document.querySelector('header')?.style.setProperty('visibility','hidden'); document.querySelectorAll('nextjs-portal').forEach((n) => n.remove())",
  );
  await sleep(300);

  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  mkdirSync(dirname(OUT), { recursive: true });
  const png = Buffer.from(shot.result.data, "base64");
  const info = await sharp(png).webp({ quality: 82, effort: 6 }).toFile(OUT);
  console.log(`Saved ${OUT} (${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} KB)`);
  const smallOut = OUT.replace(".webp", `-${target.small}.webp`);
  const small = await sharp(png).resize({ width: target.small }).webp({ quality: 80, effort: 6 }).toFile(smallOut);
  console.log(`Saved ${smallOut} (${small.width}×${small.height}, ${(small.size / 1024).toFixed(0)} KB)`);
  ws.close();
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    proc.once("exit", () => {
      try {
        rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
      } catch {
        // Chrome can hold the temp profile briefly on Windows; the OS temp cleaner will remove it.
      }
    });
    proc.kill();
  });
