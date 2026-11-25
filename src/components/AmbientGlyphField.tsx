import { useEffect, useRef } from "react";
import { soundEngine } from "../lib/sound";

interface AmbientGlyphFieldProps {
  vibeRgb: [number, number, number];
}

const SYMBOLS = [
  "%",
  "&",
  "?",
  "!",
  "=",
  "[",
  "]",
  "{",
  "}",
  "<",
  ">",
  ";",
  "7",
  "K",
  "E",
  "O",
  "$",
  "@",
  "#",
];

interface GlyphParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  rot: number;
  vrot: number;
  baseVrot: number;
  char: string;
  size: number;
  alpha: number;
  depth: number;
  energy: number;
  plane: "far" | "mid" | "fore";
}

/**
 * Interactive 3-plane floating ASCII symbols reacting physically to cursor repulsion
 * and click shockwaves while staying bold & readable across the #000 obsidian backdrop.
 */
export function AmbientGlyphField({ vibeRgb }: AmbientGlyphFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRgbRef = useRef<[number, number, number]>(vibeRgb);
  targetRgbRef.current = vibeRgb;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const farCount = w < 768 ? 9 : 16;
    const midCount = w < 768 ? 7 : 14;
    const foreCount = w < 768 ? 4 : 9;

    const particles: GlyphParticle[] = [];

    for (let i = 0; i < farCount; i++) {
      const bvx = ((i % 5) - 2) * 0.055 || 0.04;
      const bvy = -0.045 - (i % 3) * 0.03;
      const bvr = 0.0005;
      particles.push({
        x: ((i * 197.3) % 100) * 0.01 * w,
        y: ((i * 73.7) % 100) * 0.01 * h,
        vx: bvx,
        vy: bvy,
        baseVx: bvx,
        baseVy: bvy,
        rot: ((i % 7) - 3) * 0.09,
        vrot: bvr,
        baseVrot: bvr,
        char: SYMBOLS[i % SYMBOLS.length],
        size: 16 + (i % 4) * 3,
        alpha: 0.14 + (i % 3) * 0.035,
        depth: 0.25,
        energy: 0,
        plane: "far",
      });
    }

    for (let i = 0; i < midCount; i++) {
      const bvx = ((i % 4) - 1.5) * 0.085 || -0.06;
      const bvy = -0.08 - (i % 4) * 0.035;
      const bvr = (i % 2 === 0 ? 1 : -1) * 0.0008;
      particles.push({
        x: (((i + 3) * 149.1) % 100) * 0.01 * w,
        y: (((i + 5) * 89.3) % 100) * 0.01 * h,
        vx: bvx,
        vy: bvy,
        baseVx: bvx,
        baseVy: bvy,
        rot: ((i % 5) - 2) * 0.16,
        vrot: bvr,
        baseVrot: bvr,
        char: SYMBOLS[(i + 4) % SYMBOLS.length],
        size: 34 + (i % 5) * 7,
        alpha: 0.26 + (i % 3) * 0.06,
        depth: 0.65,
        energy: 0,
        plane: "mid",
      });
    }

    for (let i = 0; i < foreCount; i++) {
      const leftMargin = i % 2 === 0;
      const bvx = (leftMargin ? 1 : -1) * 0.045;
      const bvy = -0.11 - (i % 3) * 0.04;
      const bvr = (i % 2 === 0 ? 1 : -1) * 0.0006;
      particles.push({
        x: leftMargin ? w * (0.04 + ((i * 0.05) % 0.2)) : w * (0.76 + ((i * 0.05) % 0.2)),
        y: ((i * 131.7 + 19) % 100) * 0.01 * h,
        vx: bvx,
        vy: bvy,
        baseVx: bvx,
        baseVy: bvy,
        rot: (i % 2 === 0 ? -1 : 1) * (0.14 + (i % 3) * 0.1),
        vrot: bvr,
        baseVrot: bvr,
        char: ["K", "]", "=", "7", "[", "E", "O", "$", "#"][i % 9],
        size: 68 + (i % 3) * 18,
        alpha: 0.42 + (i % 2) * 0.14,
        depth: 1.25,
        energy: 0,
        plane: "fore",
      });
    }

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, rawX: -9999, rawY: -9999 };
    let lastScroll = window.scrollY;
    let scrollVel = 0;

    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / Math.max(1, w) - 0.5) * 32;
      pointer.ty = (e.clientY / Math.max(1, h) - 0.5) * 22;
      pointer.rawX = e.clientX;
      pointer.rawY = e.clientY;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reduceMotion) return;
      const cx = e.clientX;
      const cy = e.clientY;
      let pushed = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const drawX = p.x - pointer.x * p.depth;
        const drawY = p.y - pointer.y * p.depth;
        const dx = drawX - cx;
        const dy = drawY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < 280 && dist > 1) {
          const force = (1 - dist / 280) * 8.5 * (0.45 + p.depth * 0.5);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.vrot += ((i % 2 === 0 ? 1 : -1) * 0.045) * (1 - dist / 280);
          p.energy = Math.min(1, p.energy + 0.9);
          pushed = true;
        }
      }
      if (pushed) {
        soundEngine.playScatter();
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    const curRgb: [number, number, number] = [...targetRgbRef.current];
    let rafId = 0;

    const render = () => {
      const tgt = targetRgbRef.current;
      curRgb[0] += (tgt[0] - curRgb[0]) * 0.06;
      curRgb[1] += (tgt[1] - curRgb[1]) * 0.06;
      curRgb[2] += (tgt[2] - curRgb[2]) * 0.06;

      pointer.x += (pointer.tx - pointer.x) * 0.055;
      pointer.y += (pointer.ty - pointer.y) * 0.055;

      const sy = window.scrollY;
      scrollVel += ((sy - lastScroll) * 0.35 - scrollVel) * 0.15;
      lastScroll = sy;

      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const r = Math.round(curRgb[0]);
      const g = Math.round(curRgb[1]);
      const b = Math.round(curRgb[2]);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const drawX = p.x - pointer.x * p.depth;
        const drawY = p.y - pointer.y * p.depth;

        if (!reduceMotion) {
          // Smooth cursor proximity repulsion + rotation spin + highlight energy
          const dx = drawX - pointer.rawX;
          const dy = drawY - pointer.rawY;
          const dist = Math.hypot(dx, dy);
          if (dist < 160 && dist > 1) {
            const push = (1 - dist / 160) * 0.65 * (0.5 + p.depth * 0.5);
            p.vx += (dx / dist) * push;
            p.vy += (dy / dist) * push;
            p.vrot += ((i % 2 === 0 ? 1 : -1) * 0.008) * (1 - dist / 160);
            p.energy = Math.min(1, p.energy + 0.16);
          }

          p.vx += (p.baseVx - p.vx) * 0.045;
          p.vy += (p.baseVy - p.vy) * 0.045;
          p.vrot += (p.baseVrot - p.vrot) * 0.05;
          p.energy *= 0.94;

          p.x += p.vx;
          p.y += p.vy - scrollVel * 0.065 * p.depth;
          p.rot += p.vrot;

          if (p.y < -100) p.y = h + 100;
          if (p.y > h + 100) p.y = -100;
          if (p.x < -90) p.x = w + 90;
          if (p.x > w + 90) p.x = -90;
        }

        const boostR = Math.round(r + (255 - r) * p.energy * 0.55);
        const boostG = Math.round(g + (242 - g) * p.energy * 0.55);
        const boostB = Math.round(b + (235 - b) * p.energy * 0.55);
        const finalAlpha = Math.min(0.95, p.alpha + p.energy * 0.48);

        ctx.save();
        ctx.translate(p.x - pointer.x * p.depth, p.y - pointer.y * p.depth);
        ctx.rotate(p.rot);
        ctx.font =
          p.plane === "fore"
            ? `800 ${p.size}px "Tektur", "IBM Plex Mono", monospace`
            : `700 ${p.size}px "IBM Plex Mono", monospace`;
        ctx.fillStyle = `rgba(${boostR}, ${boostG}, ${boostB}, ${finalAlpha})`;
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }

      if (!reduceMotion && !document.hidden) {
        rafId = requestAnimationFrame(render);
      }
    };

    const onVis = () => {
      if (!document.hidden && !reduceMotion) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
