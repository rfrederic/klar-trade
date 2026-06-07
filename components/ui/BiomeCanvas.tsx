"use client";

import { useRef, useEffect } from "react";
import type { BiomeKey } from "@/lib/biomes";

// ─── Shared helpers ────────────────────────────────────────────────────────

const rnd  = (a: number, b: number) => a + Math.random() * (b - a);
const rndI = (a: number, b: number) => Math.floor(rnd(a, b));

type Tick = (w: number, h: number, time: number, dt: number) => void;

/** Draw a radial-gradient soft blob (cloud / fog shape). */
function blob(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rx: number, ry: number,
  alpha: number,
  r: number, g: number, b: number,
) {
  if (alpha <= 0 || rx <= 0 || ry <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  grad.addColorStop(0,    `rgba(${r},${g},${b},1)`);
  grad.addColorStop(0.55, `rgba(${r},${g},${b},0.45)`);
  grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

// ─── Storm Plains ──────────────────────────────────────────────────────────

function createStorm(ctx: CanvasRenderingContext2D): Tick {
  // Clouds — stored as 0..1 relative coords
  type Cloud = { x: number; y: number; rx: number; ry: number; spd: number; a: number; hue: number };
  const clouds: Cloud[] = Array.from({ length: 12 }, () => ({
    x:   Math.random(),
    y:   rnd(0.04, 0.88),
    rx:  rnd(0.16, 0.44),
    ry:  rnd(0.06, 0.19),
    spd: rnd(7, 24),          // px / s
    a:   rnd(0.1, 0.28),
    hue: rndI(248, 278),
  }));

  // Rain streaks — 0..1 relative
  type Drop = { x: number; y: number; len: number; spd: number; a: number };
  const rain: Drop[] = Array.from({ length: 220 }, () => ({
    x:   Math.random(),
    y:   Math.random(),
    len: rnd(7, 22),
    spd: rnd(260, 440),       // px / s
    a:   rnd(0.05, 0.18),
  }));

  // Lightning bolt state
  type Bolt = { pts: [number, number][]; branches: [number, number][][]; a: number };
  let bolt: Bolt | null = null;
  let nextBoltMs = rnd(1200, 4000);

  function genBolt(w: number, h: number): Bolt {
    const sx = w * rnd(0.15, 0.85);
    const pts: [number, number][] = [[sx, 0]];
    let cx = sx;
    const steps = 16;
    const endY  = h * rnd(0.45, 0.92);
    for (let i = 1; i <= steps; i++) {
      cx += rnd(-w * 0.065, w * 0.065);
      pts.push([cx, endY * (i / steps)]);
    }
    const branches: [number, number][][] = [];
    const numBr = rndI(1, 4);
    for (let b = 0; b < numBr; b++) {
      const idx   = rndI(Math.floor(steps * 0.25), Math.floor(steps * 0.72));
      const orig  = pts[idx];
      const bpts: [number, number][] = [orig];
      let bx = orig[0], by = orig[1];
      for (let i = 0; i < 5; i++) {
        bx += rnd(-w * 0.055, w * 0.055);
        by += w * 0.032;
        bpts.push([bx, by]);
      }
      branches.push(bpts);
    }
    return { pts, branches, a: 0.92 };
  }

  function drawBoltPath(pts: [number, number][], alpha: number, lw: number, color: string) {
    if (pts.length < 2 || alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineWidth   = lw;
    ctx.strokeStyle = color;
    ctx.shadowBlur  = lw * 8;
    ctx.shadowColor = "rgba(180,130,255,0.8)";
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.restore();
  }

  return function tick(w, h, time, dt) {
    ctx.clearRect(0, 0, w, h);
    const s = dt / 1000;

    // Clouds
    for (const c of clouds) {
      c.x -= c.spd * s / w;
      if (c.x + c.rx < -0.5) c.x = 1 + c.rx * 0.4;
      // hsl decomposed to rgb for the helper
      // dark violet-grey: approx (20, 14, 35) for hue~260
      const R = 18 + Math.round((c.hue - 248) * 0.4);
      blob(ctx, c.x * w, c.y * h, c.rx * w, c.ry * h, c.a, R, 14, 34);
    }

    // Rain
    ctx.save();
    ctx.lineWidth = 0.8;
    for (const r of rain) {
      r.y += r.spd * s / h;
      r.x += r.spd * 0.09 * s / w;
      if (r.y > 1 + r.len / h) { r.y = rnd(-0.05, 0); r.x = Math.random(); }
      ctx.globalAlpha = r.a;
      ctx.strokeStyle = "rgba(190,170,230,1)";
      ctx.beginPath();
      ctx.moveTo(r.x * w,                  r.y * h);
      ctx.lineTo(r.x * w + r.len * 0.11,   r.y * h + r.len);
      ctx.stroke();
    }
    ctx.restore();

    // Lightning
    if (time >= nextBoltMs) {
      bolt = genBolt(w, h);
      nextBoltMs = time + rnd(2800, 9000);
      ctx.fillStyle = "rgba(170,140,255,0.1)";
      ctx.fillRect(0, 0, w, h);
    }
    if (bolt && bolt.a > 0) {
      drawBoltPath(bolt.pts, bolt.a * 0.28, 6, "rgba(230,210,255,1)");   // outer glow
      drawBoltPath(bolt.pts, bolt.a,        1.5, "rgba(245,238,255,1)"); // core
      for (const br of bolt.branches) {
        drawBoltPath(br, bolt.a * 0.5, 1, "rgba(220,200,255,1)");
      }
      bolt.a -= dt / 380;
      if (bolt.a <= 0) bolt = null;
    }
  };
}

// ─── Deep Ocean ────────────────────────────────────────────────────────────

function createOcean(ctx: CanvasRenderingContext2D): Tick {
  type Particle = {
    x: number; y: number;
    vy: number; vxBase: number;
    size: number; a: number;
    phase: number; glow: boolean;
  };
  const N = 220;
  const particles: Particle[] = Array.from({ length: N }, () => ({
    x:      Math.random(),
    y:      Math.random(),
    vy:     rnd(12, 48),          // px / s downward
    vxBase: rnd(-5, 5),           // gentle horizontal base drift
    size:   rnd(0.7, 2.8),
    a:      rnd(0.12, 0.62),
    phase:  Math.random() * Math.PI * 2,
    glow:   Math.random() < 0.13,
  }));

  return function tick(w, h, time, dt) {
    ctx.clearRect(0, 0, w, h);
    const s = dt / 1000;

    // Gradient pulse overlay
    const pulse = (Math.sin(time * 0.00065) + 1) * 0.5;
    ctx.fillStyle = `rgba(4,40,82,${pulse * 0.045})`;
    ctx.fillRect(0, 0, w, h);

    // Particles
    for (const p of particles) {
      p.y += p.vy * s / h;
      // sinusoidal horizontal drift
      p.x += (p.vxBase + Math.sin(time * 0.0009 + p.phase) * 3) * s / w;
      if (p.y > 1 + p.size / h) { p.y = -p.size / h; p.x = Math.random(); }
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;

      const alpha = p.a * (0.55 + 0.45 * Math.sin(time * 0.0018 + p.phase));
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.glow) {
        ctx.shadowBlur  = 10;
        ctx.shadowColor = "rgba(6,182,212,0.9)";
      }
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.glow ? "rgba(6,182,212,0.95)" : "rgba(80,195,235,0.75)";
      ctx.fill();
      ctx.restore();
    }

    // Horizontal bioluminescent sweep every ~12s
    const sweep = Math.sin(time * 0.000524) * Math.sin(time * 0.000314);
    if (sweep > 0.92) {
      const sy = h * (0.25 + (sweep - 0.92) * 8 * 0.5);
      const sweepAlpha = (sweep - 0.92) / 0.08 * 0.06;
      ctx.save();
      const sg = ctx.createLinearGradient(0, sy - 4, 0, sy + 4);
      sg.addColorStop(0, "rgba(6,182,212,0)");
      sg.addColorStop(0.5, `rgba(6,182,212,${sweepAlpha})`);
      sg.addColorStop(1, "rgba(6,182,212,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 4, w, 8);
      ctx.restore();
    }
  };
}

// ─── Golden Forest ─────────────────────────────────────────────────────────

function createForest(ctx: CanvasRenderingContext2D): Tick {
  type Ray = { bx: number; angle: number; len: number; hw: number; phase: number; spd: number };
  const rays: Ray[] = Array.from({ length: 7 }, (_, i) => ({
    bx:    0.06 + i * 0.14,              // x start (relative)
    angle: 0.28 + i * 0.11,             // radians from vertical
    len:   rnd(0.72, 1.15),             // relative to h
    hw:    rnd(0.022, 0.068),           // half-width at tip (relative to h)
    phase: Math.random() * Math.PI * 2,
    spd:   rnd(0.38, 0.92),
  }));

  type Dust = { x: number; y: number; vy: number; phase: number; sz: number; a: number };
  const dust: Dust[] = Array.from({ length: 170 }, () => ({
    x:     Math.random(),
    y:     Math.random(),
    vy:    rnd(7, 28),                   // px / s upward
    phase: Math.random() * Math.PI * 2,
    sz:    rnd(0.35, 1.4),
    a:     rnd(0.18, 0.72),
  }));

  return function tick(w, h, time, dt) {
    ctx.clearRect(0, 0, w, h);
    const s = dt / 1000;

    // Light rays — "screen" mode brightens overlaps naturally
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const r of rays) {
      const opac = 0.055 + 0.07 * ((Math.sin(time * r.spd * 0.001 + r.phase) + 1) * 0.5);
      const sx   = r.bx * w;
      const sy   = -h * 0.08;
      const len  = r.len * h;
      const dx   = Math.sin(r.angle);
      const dy   = Math.cos(r.angle);
      const ex   = sx + dx * len;
      const ey   = sy + dy * len;
      const hw   = r.hw * h;
      const px   = -dy;                  // perpendicular
      const py   =  dx;

      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      grad.addColorStop(0,   `rgba(255,225,120,${opac * 1.1})`);
      grad.addColorStop(0.35, `rgba(255,215,100,${opac * 0.6})`);
      grad.addColorStop(1,    "rgba(255,200,80,0)");

      ctx.beginPath();
      ctx.moveTo(sx - 1,      sy);
      ctx.lineTo(sx + 1,      sy);
      ctx.lineTo(ex + px * hw, ey + py * hw);
      ctx.lineTo(ex - px * hw, ey - py * hw);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.restore();

    // Dust particles floating upward
    for (const d of dust) {
      d.y -= d.vy * s / h;
      d.x += Math.sin(time * 0.0007 + d.phase) * 0.00035;
      if (d.y < -d.sz / h) { d.y = 1 + d.sz / h; d.x = Math.random(); }

      const alpha = d.a * (0.45 + 0.55 * Math.abs(Math.sin(time * 0.0011 + d.phase)));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(d.x * w, d.y * h, d.sz, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,215,110,0.85)";
      ctx.fill();
      ctx.restore();
    }
  };
}

// ─── Mountain Summit ───────────────────────────────────────────────────────

function createSummit(ctx: CanvasRenderingContext2D): Tick {
  type Star = { x: number; y: number; sz: number; phase: number; spd: number };
  const stars: Star[] = Array.from({ length: 72 }, () => ({
    x:     Math.random(),
    y:     Math.random() * 0.62,
    sz:    rnd(0.5, 1.9),
    phase: Math.random() * Math.PI * 2,
    spd:   rnd(0.4, 1.6),
  }));

  type Fog = { x: number; y: number; rx: number; ry: number; spd: number; a: number };
  const fog: Fog[] = Array.from({ length: 7 }, () => ({
    x:   Math.random(),
    y:   rnd(0.32, 0.76),
    rx:  rnd(0.2, 0.55),
    ry:  rnd(0.025, 0.075),
    spd: rnd(5, 18),
    a:   rnd(0.035, 0.12),
  }));

  // Mountain silhouette — regenerated when canvas resizes
  let mtnPts: [number, number][] = [];
  let mtnW = 0, mtnH = 0;

  function buildMountains(w: number, h: number) {
    const hz = h * 0.56;
    const pts: [number, number][] = [[0, h]];
    let x = 0;
    while (x < w + 10) {
      const px = x + rnd(w * 0.07, w * 0.17);
      const py = hz - rnd(h * 0.07, h * 0.24);
      pts.push([px, py]);
      x = px + rnd(w * 0.04, w * 0.12);
      pts.push([x, hz + rnd(0, h * 0.04)]);
    }
    pts.push([w, h]);
    mtnPts = pts; mtnW = w; mtnH = h;
  }

  return function tick(w, h, time, dt) {
    ctx.clearRect(0, 0, w, h);
    const s = dt / 1000;

    if (w !== mtnW || h !== mtnH) buildMountains(w, h);

    // Stars
    for (const st of stars) {
      const alpha = 0.12 + 0.72 * ((Math.sin(time * st.spd * 0.001 + st.phase) + 1) * 0.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(st.x * w, st.y * h, st.sz, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(190,220,255,0.95)";
      ctx.fill();
      ctx.restore();
    }

    // Mountain silhouette
    ctx.save();
    ctx.beginPath();
    if (mtnPts.length > 1) {
      ctx.moveTo(mtnPts[0][0], mtnPts[0][1]);
      for (let i = 1; i < mtnPts.length; i++) ctx.lineTo(mtnPts[i][0], mtnPts[i][1]);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(4,10,20,0.88)";
    ctx.fill();

    // Sharp horizon glow
    const hz = h * 0.56;
    const hg = ctx.createLinearGradient(0, hz - 3, 0, hz + 12);
    hg.addColorStop(0,   "rgba(56,180,248,0.28)");
    hg.addColorStop(0.4, "rgba(56,160,240,0.1)");
    hg.addColorStop(1,   "rgba(56,120,200,0)");
    ctx.fillStyle = hg;
    ctx.fillRect(0, hz - 3, w, 15);
    ctx.restore();

    // Fog bands — slowly scrolling left
    for (const f of fog) {
      f.x -= f.spd * s / w;
      if (f.x + f.rx < -0.6) f.x = 1 + f.rx * 0.4;
      blob(ctx, f.x * w, f.y * h, f.rx * w, f.ry * h, f.a, 150, 185, 225);
    }
  };
}

// ─── Thawing River ─────────────────────────────────────────────────────────

function createRiver(ctx: CanvasRenderingContext2D): Tick {
  // Flow lines — precomputed per-line constants
  const NL = 11;
  const lineY    = Array.from({ length: NL }, (_, i) => 0.09 + i * 0.082);
  const lineSpd  = Array.from({ length: NL }, () => rnd(22, 62));   // px / s scroll
  const lineAmp  = Array.from({ length: NL }, () => rnd(2.5, 14));
  const lineFreq = Array.from({ length: NL }, () => rnd(0.007, 0.019));
  const lineA    = Array.from({ length: NL }, (_, i) => 0.038 + (i % 4) * 0.022);

  // Ice fragments — irregular convex polygons
  type Frag = {
    x: number; y: number; vx: number;
    rot: number; rotSpd: number;
    verts: [number, number][];
    sz: number; a: number;
  };
  function makeVerts(n: number): [number, number][] {
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 + rnd(-0.35, 0.35);
      const r = rnd(0.55, 1.0);
      return [Math.cos(angle) * r, Math.sin(angle) * r];
    });
  }
  const frags: Frag[] = Array.from({ length: 24 }, () => ({
    x:      Math.random(),
    y:      rnd(0.12, 0.88),
    vx:     rnd(14, 42),                   // px / s rightward
    rot:    Math.random() * Math.PI * 2,
    rotSpd: rnd(-0.28, 0.28),              // rad / s
    verts:  makeVerts(rndI(5, 9)),
    sz:     rnd(7, 30),
    a:      rnd(0.12, 0.42),
  }));

  // Shimmer state
  let shimmerY = 0;
  let prevSP   = 0;

  return function tick(w, h, time, dt) {
    ctx.clearRect(0, 0, w, h);
    const s = dt / 1000;

    // Flow lines
    ctx.save();
    ctx.lineWidth = 1;
    for (let i = 0; i < NL; i++) {
      const baseY  = lineY[i] * h;
      const scroll = time * 0.001 * lineSpd[i]; // scrolls in px
      ctx.beginPath();
      ctx.strokeStyle = `rgba(110,225,245,${lineA[i]})`;
      for (let px = 0; px <= w; px += 3) {
        const py = baseY + lineAmp[i] * Math.sin(px * lineFreq[i] + scroll * lineFreq[i] * 60);
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Ice fragments
    for (const f of frags) {
      f.x   += f.vx * s / w;
      f.rot += f.rotSpd * s;
      if (f.x > 1 + f.sz / w) { f.x = -f.sz / w; f.y = rnd(0.12, 0.88); }

      ctx.save();
      ctx.translate(f.x * w, f.y * h);
      ctx.rotate(f.rot);

      const v = f.verts;
      ctx.beginPath();
      ctx.moveTo(v[0][0] * f.sz, v[0][1] * f.sz);
      for (let i = 1; i < v.length; i++) ctx.lineTo(v[i][0] * f.sz, v[i][1] * f.sz);
      ctx.closePath();

      ctx.globalAlpha = f.a;
      ctx.fillStyle   = "rgba(190,238,255,0.7)";
      ctx.fill();
      ctx.strokeStyle = "rgba(220,248,255,0.85)";
      ctx.lineWidth   = 0.6;
      ctx.stroke();

      // Crack on larger fragments — simulates break-apart
      if (f.sz > 16) {
        ctx.beginPath();
        ctx.moveTo(-f.sz * 0.18, -f.sz * 0.28);
        ctx.lineTo( f.sz * 0.08,  f.sz * 0.10);
        ctx.lineTo( f.sz * 0.22,  f.sz * 0.30);
        ctx.strokeStyle = `rgba(140,210,235,${f.a * 0.55})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Water shimmer — triggered by compound sine crossing threshold
    const sp = Math.sin(time * 0.00285) * Math.sin(time * 0.00187);
    if (sp > 0.91 && prevSP <= 0.91) shimmerY = h * rnd(0.2, 0.78);
    prevSP = sp;
    if (sp > 0.91) {
      const shimmerA = ((sp - 0.91) / 0.09) * 0.18;
      const sg = ctx.createLinearGradient(0, shimmerY - 1, 0, shimmerY + 2);
      sg.addColorStop(0,   `rgba(170,240,255,0)`);
      sg.addColorStop(0.5, `rgba(170,240,255,${shimmerA})`);
      sg.addColorStop(1,   `rgba(170,240,255,0)`);
      ctx.save();
      ctx.fillStyle = sg;
      ctx.fillRect(0, shimmerY - 1, w, 3);
      ctx.restore();
    }
  };
}

// ─── Canvas component ──────────────────────────────────────────────────────

const CREATORS: Record<BiomeKey, (ctx: CanvasRenderingContext2D) => Tick> = {
  storm:  createStorm,
  ocean:  createOcean,
  forest: createForest,
  summit: createSummit,
  river:  createRiver,
};

interface Props {
  biomeKey: BiomeKey;
  className?: string;
}

export function BiomeCanvas({ biomeKey, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf: number;
    let startTime: number | null = null;
    let lastTime: number | null  = null;

    function setSize() {
      const dpr  = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width  = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setSize();

    const tick = CREATORS[biomeKey](ctx);

    function loop(ts: number) {
      if (startTime === null) startTime = ts;
      if (lastTime  === null) lastTime  = ts;
      const time = ts - startTime;
      const dt   = Math.min(ts - lastTime, 50);
      lastTime = ts;
      if (w > 0 && h > 0) tick(w, h, time, dt);
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => setSize());
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [biomeKey]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
