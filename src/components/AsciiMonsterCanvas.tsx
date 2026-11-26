import { useEffect, useRef } from "react";
import { bugTrackState } from "./BugHunterOverlay";
import { soundEngine } from "../lib/sound";

interface AsciiMonsterCanvasProps {
  vibeRgb: [number, number, number];
  pingSignal: number;
}

const VOID_GLYPHS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$?+*/=[]{}<>:;~^!";

const FORE_SYMBOLS = [
  { char: "{", nx: 0.78, ny: 0.52, size: 54, rot: 0.06, depth: 22 },
  { char: "!", nx: 0.77, ny: 0.78, size: 50, rot: -0.05, depth: 26 },
  { char: "B", nx: 0.89, ny: 0.81, size: 34, rot: -0.22, depth: 18 },
  { char: "?", nx: 0.17, ny: 0.15, size: 22, rot: -0.14, depth: 14 },
  { char: "]", nx: 0.86, ny: 0.91, size: 42, rot: 0.08, depth: 20 },
];

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function fieldNoise(cx: number, cy: number, t: number): number {
  const n1 = Math.sin(cx * 0.24 + t * 0.55) * Math.cos(cy * 0.28 - t * 0.42);
  const n2 = Math.sin((cx + cy) * 0.18 - t * 0.35) * 0.5;
  const n3 = Math.cos(cx * 0.42 - cy * 0.37 + t * 0.7) * 0.35;
  return (n1 + n2 + n3 + 1.85) / 3.7; // normalized ~ [0..1]
}

// 11x5 wider chaotic crimson eye templates (wider eyes & jagged flickering fringes matching Image 3)
const EYE_LEFT_ROWS = [
  [" ", "~", "E", " ", "b", " ", "-", "t", " ", " ", " "],
  [" ", "=", "Z", "█", "█", "█", "t", "Q", "L", " ", " "],
  ["^", "r", "█", "█", "█", "█", "█", "█", "3", " ", "g"],
  [" ", "G", ",", ";", "{", "d", "y", "I", "G", " ", " "],
  [" ", " ", " ", "p", " ", "w", " ", " ", " ", " ", " "],
];

const EYE_RIGHT_ROWS = [
  [" ", " ", " ", "f", "H", "L", "-", " ", "#", " ", " "],
  [" ", "n", "█", "█", "h", "█", "█", "█", "5", " ", " "],
  ["\\", " ", "X", "█", "█", "█", "█", "█", "█", "7", "t"],
  [" ", " ", "+", "t", "A", "E", "B", "@", " ", " ", " "],
  [" ", " ", " ", " ", "9", " ", "c", " ", " ", " ", " "],
];

const EYE_ALT = "b]f&_oFJr6c0x#ZtQLh%@~;,+AEBW";

/**
 * Pure-2D Crisp Monospace Gaze Void:
 * swirling sparse circular terminal code framing an irregular pitch-black center
 * with two blazing red ASCII block eyes tracking the cursor smoothly.
 */
export function AsciiMonsterCanvas({ vibeRgb, pingSignal }: AsciiMonsterCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRgbRef = useRef<[number, number, number]>(vibeRgb);
  const glitchRef = useRef<number>(0);

  targetRgbRef.current = vibeRgb;

  useEffect(() => {
    if (pingSignal > 0) {
      glitchRef.current = 1.0;
    }
  }, [pingSignal]);

  useEffect(() => {
    const host = containerRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 560;
    let height = 560;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateSize = () => {
      const r = host.getBoundingClientRect();
      width = Math.max(280, Math.floor(r.width));
      height = Math.max(280, Math.floor(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(host);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, focus: 0.25 };
    const onPointerMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.5;
      pointer.tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.42)));
      pointer.ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.42)));
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let inView = true;
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 },
    );
    io.observe(host);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const curRgb: [number, number, number] = [...targetRgbRef.current];

    let nextBlink = performance.now() + 2900;
    let blinking = false;
    let rafId = 0;

    const render = (now: number) => {
      if (inView && !document.hidden) {
        const t = reduceMotion ? 0 : now * 0.001;

        const tgt = targetRgbRef.current;
        curRgb[0] += (tgt[0] - curRgb[0]) * 0.08;
        curRgb[1] += (tgt[1] - curRgb[1]) * 0.08;
        curRgb[2] += (tgt[2] - curRgb[2]) * 0.08;

        let targetX = pointer.tx;
        let targetY = pointer.ty;
        let gazeSpeed = 0.085;
        let gazeBoost = 1.0;

        if (bugTrackState.active) {
          const r = host.getBoundingClientRect();
          const cx = r.left + r.width * 0.5;
          const cy = r.top + r.height * 0.5;
          targetX = Math.max(-1.25, Math.min(1.25, (bugTrackState.x - cx) / (window.innerWidth * 0.36)));
          targetY = Math.max(-1.25, Math.min(1.25, (bugTrackState.y - cy) / (window.innerHeight * 0.36)));
          gazeSpeed = 0.22;
          gazeBoost = 1.35;
        }

        pointer.x += (targetX - pointer.x) * gazeSpeed;
        pointer.y += (targetY - pointer.y) * gazeSpeed;

        const distC = Math.hypot(targetX, targetY);
        const tgtFocus = bugTrackState.active ? 1.0 : Math.max(0, Math.min(1, 1.25 - distC));
        pointer.focus += (tgtFocus - pointer.focus) * 0.1;

        if (glitchRef.current > 0.01) glitchRef.current *= 0.9;
        else glitchRef.current = 0;

        if (bugTrackState.active) {
          blinking = false;
        } else if (!reduceMotion && now > nextBlink) {
          const dt = now - nextBlink;
          if (dt < 175) {
            blinking = true;
          } else {
            blinking = false;
            nextBlink = now + 2600 + Math.random() * 3400;
          }
        }

        ctx.clearRect(0, 0, width, height);

        const cr = Math.round(curRgb[0]);
        const cg = Math.round(curRgb[1]);
        const cb = Math.round(curRgb[2]);

        const minSide = Math.min(width, height);
        const fontSize = Math.max(9.5, Math.min(13.2, minSide / 47));
        const cw = fontSize * 0.66;
        const ch = fontSize * 1.22;

        const cols = Math.floor(width / cw);
        const rows = Math.floor(height / ch);
        const ox = (width - cols * cw) * 0.5;
        const oy = (height - rows * ch) * 0.5;

        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const radius = minSide * 0.48;

        // Gaze follow shift (tracks active bug or cursor)
        const lookX = pointer.x * cw * 2.2 * gazeBoost;
        const lookY = pointer.y * ch * 1.4 * gazeBoost;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${fontSize.toFixed(1)}px "IBM Plex Mono", "Consolas", monospace`;

        const slowTick = Math.floor(t * 4.5);

        // 1. Circular swirling sparse code halo around an irregular black center cavity
        for (let r = 0; r < rows; r++) {
          const py = oy + (r + 0.5) * ch;
          const glitchOffset =
            glitchRef.current > 0.05 && Math.sin(r * 1.7 + t * 26) > 0.55
              ? (hash2(r, slowTick) - 0.5) * 26 * glitchRef.current
              : 0;

          for (let c = 0; c < cols; c++) {
            const h = hash2(c, r);
            // Intentional ~36% dark empty gaps for a sparse living code texture
            if (h < 0.36) continue;

            const px = ox + (c + 0.5) * cw + glitchOffset;
            const dx = (px - centerX) / radius;
            const dy = (py - centerY) / radius;
            const dist = Math.hypot(dx, dy);
            if (dist > 0.99) continue;

            // Organic swirling noise field
            const n = fieldNoise(c, r, t);
            if (n < 0.24 && h < 0.72) continue;

            // Wider, rougher jagged dark cavity + sparse chaotic lone glyphs inside the void (Image 3 style)
            const cavDx = (px - (centerX + lookX * 0.52)) / (radius * 0.54);
            const cavDy = (py - (centerY + lookY * 0.52)) / (radius * 0.36);
            const cavDist = Math.hypot(cavDx, cavDy);
            const ang = Math.atan2(cavDy, cavDx);
            const teeth =
              (h - 0.5) * 0.36 +
              Math.sin(ang * 7 + t) * 0.12 +
              Math.cos(ang * 3 - t * 0.7) * 0.08;
            const inCavity = cavDist < 0.94 + teeth;
            if (inCavity && !(h > 0.94 && cavDist > 0.42)) continue;

            // Stronger outer circular cloud edges staying punchy up to r = 0.74
            const outerFade = 1 - Math.max(0, (dist - 0.74) / 0.25);
            const ringBoost = Math.exp(-Math.pow((dist - 0.68) / 0.26, 2));
            const cavRimGlow = cavDist < 1.24 ? 0.24 : 0;
            const sparkle = h > 0.89 ? 0.36 : 0;
            const magnetic =
              Math.hypot(dx - pointer.x * 0.5, dy - pointer.y * 0.5) < 0.28 ? 0.18 : 0;

            const alpha = inCavity
              ? 0.26
              : Math.min(
                  0.96,
                  outerFade * (0.24 + n * 0.44 + ringBoost * 0.34 + cavRimGlow + sparkle + magnetic),
                );
            if (alpha < 0.06) continue;

            const glyphShift = h > 0.65 ? slowTick : Math.floor(slowTick * 0.4);
            const chIdx = Math.floor((h * 200 + glyphShift + c + r * 3) % VOID_GLYPHS.length);

            if (sparkle > 0 && ringBoost > 0.5) {
              ctx.fillStyle = `rgba(${Math.min(255, cr + 70)}, ${Math.min(255, cg + 60)}, ${Math.min(255, cb + 60)}, ${alpha})`;
            } else {
              ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
            }
            ctx.fillText(VOID_GLYPHS[chIdx], px, py);
          }
        }

        // 2. Wider Chaotic Crimson Phosphor Glow + Big 11x5 Blazing Red Eyes
        const eyeLeftX = centerX - radius * 0.235 + lookX;
        const eyeRightX = centerX + radius * 0.235 + lookX;
        const eyeY = centerY + lookY;
        const eyeTick = Math.floor(t * 9.5);
        const flare = glitchRef.current * 0.3 + pointer.focus * 0.25;

        const drawEye = (ex: number, ey: number, template: string[][], sideSeed: number) => {
          const glowR = radius * (0.30 + flare * 0.07);
          const grad = ctx.createRadialGradient(ex, ey, 3, ex, ey, glowR);
          grad.addColorStop(0, `rgba(255, 22, 24, ${0.55 + flare * 0.25})`);
          grad.addColorStop(0.45, `rgba(195, 10, 14, ${0.20 + flare * 0.12})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(ex - glowR, ey - glowR, glowR * 2, glowR * 2);

          ctx.font = `700 ${(fontSize * 1.18).toFixed(1)}px "IBM Plex Mono", "Consolas", monospace`;

          if (blinking) {
            ctx.fillStyle = "rgba(255, 52, 38, 0.96)";
            for (let dc = -4; dc <= 4; dc++) {
              ctx.fillText("-", ex + dc * cw * 1.08, ey);
            }
            return;
          }

          for (let er = 0; er < 5; er++) {
            const dy = (er - 2) * ch * 1.06;
            for (let ec = 0; ec < 11; ec++) {
              const raw = template[er][ec];
              if (raw === " ") continue;

              const jx = reduceMotion
                ? 0
                : (hash2(ec + eyeTick * 0.3, er + sideSeed) - 0.5) * (1.2 + pointer.focus * 1.6);
              const jy = reduceMotion
                ? 0
                : (hash2(er + sideSeed, ec + eyeTick * 0.5) - 0.5) * (0.9 + pointer.focus * 1.1);
              const dx = (ec - 5) * cw * 1.05 + jx;
              const isSolidBlock = raw === "█";
              const isHotRow = er === 1 || er === 2;
              const isRimRow = er === 3;

              let glyph = raw;
              if (!isSolidBlock && hash2(ec + sideSeed, er + eyeTick) > 0.34) {
                glyph = EYE_ALT[(ec * 5 + er * 7 + eyeTick + sideSeed) % EYE_ALT.length];
              }

              if (isSolidBlock) {
                const centerBlock = er === 2 && ec >= 3 && ec <= 7;
                ctx.fillStyle = centerBlock
                  ? "rgba(255, 72, 48, 0.99)"
                  : "rgba(248, 26, 22, 0.96)";
              } else if (isHotRow) {
                ctx.fillStyle = `rgba(255, 50, 36, ${0.86 + flare * 0.12})`;
              } else if (isRimRow) {
                ctx.fillStyle = `rgba(255, 42, 32, ${0.74 + flare * 0.16})`;
              } else {
                ctx.fillStyle = `rgba(220, 26, 20, ${0.46 + flare * 0.18})`;
              }
              ctx.fillText(glyph, ex + dx, ey + dy + jy);
            }
          }
        };

        drawEye(eyeLeftX, eyeY, EYE_LEFT_ROWS, 11);
        drawEye(eyeRightX, eyeY, EYE_RIGHT_ROWS, 29);

        // 3. Large Crisp Tilted Tektur Foreground Glyphs along cloud perimeter
        FORE_SYMBOLS.forEach((sym, idx) => {
          const sx = sym.nx * width - pointer.x * sym.depth;
          const sy = sym.ny * height - pointer.y * sym.depth;
          const drift = reduceMotion ? 0 : Math.sin(t * 0.8 + idx * 1.7) * 5;
          ctx.save();
          ctx.translate(sx, sy + drift);
          ctx.rotate(sym.rot);
          ctx.font = `800 ${Math.round(sym.size * (minSide / 620))}px "Tektur", "IBM Plex Mono", monospace`;
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.82)`;
          ctx.fillText(sym.char, 0, 0);
          ctx.restore();
        });
      }

      if (!reduceMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={() => {
        glitchRef.current = 1.0;
        soundEngine.playGlitch();
      }}
      role="img"
      aria-label="Interactive ASCII gaze void with blazing red eyes tracking cursor movement"
      className="ascii-void-mask relative h-full w-full cursor-crosshair select-none"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
