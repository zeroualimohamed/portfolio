import { useEffect, useRef } from "react";
import { soundEngine } from "../lib/sound";

interface BugHunterOverlayProps {
  triggerSignal: number;
  vibeRgb: [number, number, number];
}

const HAND_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$?+*/=";

function hash2(c: number, r: number): number {
  const s = Math.sin(c * 127.1 + r * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function sdCapsule(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  rad: number,
): number {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay || 1)));
  return Math.hypot(pax - bax * h, pay - bay * h) - rad;
}

/**
 * Separated-finger SDF for the portal-emerging catching hand (matching Image 2):
 * visible dark column gaps separate all 5 fingers, then curl shut tightly on grab!
 */
function evalCatchHandSDF(px: number, py: number, closeAmt: number): number {
  let d = sdCapsule(px, py, -0.6, 5, 0.8, 36, 4.4);

  // Compact palm so finger gaps read crisply
  const dPalm = sdCapsule(px, py, -2.8, 1.8, 2.8, -0.4, 3.3);
  d = Math.min(d, dPalm);

  const curl = closeAmt;
  const fingers = [
    // Separated Thumb swinging inward across palm
    { bx: -4.2, by: 1.6, tx: -9.2 + curl * 7.8, ty: -4.4 + curl * 4.8, r: 0.98 },
    // Separated Index
    { bx: -3.2, by: -2.6, tx: -5.4 + curl * 2.6, ty: -13.6 + curl * 10.6, r: 0.94 },
    // Separated Middle
    { bx: -0.6, by: -3.2, tx: -0.8 + curl * 0.4, ty: -15.2 + curl * 12.0, r: 0.98 },
    // Separated Ring
    { bx: 2.0, by: -2.6, tx: 3.6 - curl * 1.8, ty: -13.8 + curl * 10.8, r: 0.92 },
    // Separated Pinky
    { bx: 4.4, by: -1.6, tx: 7.8 - curl * 4.2, ty: -10.4 + curl * 8.2, r: 0.84 },
  ];

  for (let i = 0; i < fingers.length; i++) {
    const f = fingers[i];
    const df = sdCapsule(px, py, f.bx, f.by, f.tx, f.ty, f.r);
    d = Math.min(d, df);
  }

  return d;
}

interface CrackSegment {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  width: number;
  startFrac: number;
  endFrac: number;
}

function generateCrackBranches(cx: number, cy: number): CrackSegment[] {
  const segments: CrackSegment[] = [];
  const arms = 9;

  for (let a = 0; a < arms; a++) {
    const baseAngle = (a / arms) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    let x = cx;
    let y = cy;
    let angle = baseAngle;
    const steps = 4 + Math.floor(Math.random() * 3);
    const stepLen = 24 + Math.random() * 18;

    for (let s = 0; s < steps; s++) {
      angle += (Math.random() - 0.5) * 0.72;
      const nx = x + Math.cos(angle) * stepLen;
      const ny = y + Math.sin(angle) * stepLen;
      segments.push({
        x0: x,
        y0: y,
        x1: nx,
        y1: ny,
        width: Math.max(1.0, 2.8 - s * 0.4),
        startFrac: s / steps,
        endFrac: (s + 1) / steps,
      });

      // Occasional secondary offshoot crack
      if (s >= 1 && Math.random() > 0.45) {
        const subAngle = angle + (Math.random() > 0.5 ? 0.68 : -0.68);
        const sx = x + Math.cos(subAngle) * (stepLen * 0.85);
        const sy = y + Math.sin(subAngle) * (stepLen * 0.85);
        segments.push({
          x0: x,
          y0: y,
          x1: sx,
          y1: sy,
          width: 1.15,
          startFrac: (s + 0.2) / steps,
          endFrac: Math.min(1, (s + 0.9) / steps),
        });
      }
      x = nx;
      y = ny;
    }
  }
  return segments;
}

/**
 * Full-viewport overlay summoned by the Flame button in HudHeader:
 * 1. Fractures screen with jagged cracking glass + crackling fracture audio.
 * 2. ASCII beetle crawls out straight from the crack fissure.
 * 3. Circular swirling ASCII breach portal rips open below the bug.
 * 4. 5-separated-finger ASCII hand rises OUT OF THE PORTAL, grabs & drags the bug back in.
 * 5. Portal collapses & screen cracks zip shut cleanly back to normal.
 */
export function BugHunterOverlay({ triggerSignal, vibeRgb }: BugHunterOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRgbRef = useRef<[number, number, number]>(vibeRgb);
  targetRgbRef.current = vibeRgb;

  const startEventRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (triggerSignal > 0) {
      startEventRef.current?.();
    }
  }, [triggerSignal]);

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
    window.addEventListener("resize", resize);

    let active = false;
    let startTime = 0;
    let spawnPlayed = false;
    let grabPlayed = false;
    let crackX = 0;
    let crackY = 0;
    let bugTargetX = 0;
    let bugTargetY = 0;
    let portalX = 0;
    let portalY = 0;
    let crackSegments: CrackSegment[] = [];
    let rafId = 0;

    const curRgb: [number, number, number] = [...targetRgbRef.current];

    const render = (now: number) => {
      if (!active) return;

      const tgt = targetRgbRef.current;
      curRgb[0] += (tgt[0] - curRgb[0]) * 0.1;
      curRgb[1] += (tgt[1] - curRgb[1]) * 0.1;
      curRgb[2] += (tgt[2] - curRgb[2]) * 0.1;

      const cr = Math.round(curRgb[0]);
      const cg = Math.round(curRgb[1]);
      const cb = Math.round(curRgb[2]);

      const elapsed = (now - startTime) * 0.001; // 0..4.35s
      if (elapsed >= 4.4 || reduceMotion) {
        active = false;
        ctx.clearRect(0, 0, w, h);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      const t = now * 0.001;

      // -----------------------------------------------------------------------
      // PHASE A: SCREEN CRACK AT BUG ORIGIN (spreads 0..0.55s, heals 3.65..4.35s)
      // -----------------------------------------------------------------------
      let crackProgress = 0;
      if (elapsed < 0.55) {
        crackProgress = Math.min(1, elapsed / 0.55);
      } else if (elapsed < 3.65) {
        crackProgress = 1;
      } else {
        crackProgress = Math.max(0, 1 - (elapsed - 3.65) / 0.7);
      }

      if (crackProgress > 0.01) {
        // Dark void core hole at center of impact
        const coreR = (10 + 18 * crackProgress);
        const holeGrad = ctx.createRadialGradient(crackX, crackY, 1, crackX, crackY, coreR * 1.9);
        holeGrad.addColorStop(0, `rgba(0, 0, 0, ${0.95 * crackProgress})`);
        holeGrad.addColorStop(0.55, `rgba(${cr}, ${cg}, ${cb}, ${0.28 * crackProgress})`);
        holeGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = holeGrad;
        ctx.beginPath();
        ctx.arc(crackX, crackY, coreR * 1.9, 0, Math.PI * 2);
        ctx.fill();

        // Jagged glowing fracture lines radiating cleanly
        ctx.lineCap = "round";
        crackSegments.forEach((seg) => {
          if (crackProgress <= seg.startFrac) return;
          const localP = Math.min(1, (crackProgress - seg.startFrac) / (seg.endFrac - seg.startFrac || 0.2));
          const sx1 = seg.x0 + (seg.x1 - seg.x0) * localP;
          const sy1 = seg.y0 + (seg.y1 - seg.y0) * localP;

          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.72 * crackProgress})`;
          ctx.lineWidth = seg.width;
          ctx.beginPath();
          ctx.moveTo(seg.x0, seg.y0);
          ctx.lineTo(sx1, sy1);
          ctx.stroke();

          if (seg.width > 1.6) {
            ctx.strokeStyle = `rgba(255, 240, 232, ${0.55 * crackProgress})`;
            ctx.lineWidth = seg.width * 0.38;
            ctx.beginPath();
            ctx.moveTo(seg.x0, seg.y0);
            ctx.lineTo(sx1, sy1);
            ctx.stroke();
          }
        });

        // Tiny ASCII fracture debris around crack edge
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = '700 10px "IBM Plex Mono", monospace';
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.65 * crackProgress})`;
        ["*", "#", "/", "!", ";", "x"].forEach((ch, idx) => {
          const ang = (idx / 6) * Math.PI * 2 + 0.4;
          const r = 24 + (idx % 3) * 18 * crackProgress;
          ctx.fillText(ch, crackX + Math.cos(ang) * r, crackY + Math.sin(ang) * r);
        });
      }

      // -----------------------------------------------------------------------
      // PHASE B: BEETLE POSITION (emerges from crack 0.35..1.45s -> grabbed -> pulled into portal)
      // -----------------------------------------------------------------------
      let bugX = crackX;
      let bugY = crackY;
      let bugAngle = Math.atan2(bugTargetY - crackY, bugTargetX - crackX);
      let showBug = false;

      if (elapsed >= 0.35 && elapsed < 1.45) {
        if (!spawnPlayed) {
          spawnPlayed = true;
          soundEngine.playBugSpawn();
        }
        showBug = true;
        const p = (elapsed - 0.35) / 1.1;
        const ease = 1 - Math.pow(1 - p, 2);
        const wig = Math.sin(elapsed * 16) * 11 * (1 - p * 0.4);
        bugX = crackX + (bugTargetX - crackX) * ease;
        bugY = crackY + (bugTargetY - crackY) * ease + wig;
        bugAngle += Math.cos(elapsed * 16) * 0.22;
      } else if (elapsed >= 1.45 && elapsed < 2.95) {
        showBug = elapsed < 2.92;
        bugX = bugTargetX + Math.sin(elapsed * 22) * 2.5;
        bugY = bugTargetY + Math.cos(elapsed * 18) * 2.5;
        bugAngle += Math.sin(elapsed * 14) * 0.28;
      } else if (elapsed >= 2.95 && elapsed < 3.65) {
        showBug = false; // swallowed into fist
        const dp = (elapsed - 2.95) / 0.7;
        bugY = bugTargetY + (portalY + 120 - bugTargetY) * (dp * dp);
      }

      // -----------------------------------------------------------------------
      // PHASE C: SWIRLING ASCII PORTAL BELOW BUG (opens 1.15..3.65s, collapses 3.65..4.35s)
      // -----------------------------------------------------------------------
      let portalOpen = 0;
      if (elapsed >= 1.15 && elapsed < 1.65) {
        portalOpen = Math.min(1, (elapsed - 1.15) / 0.5);
      } else if (elapsed >= 1.65 && elapsed < 3.65) {
        portalOpen = 1;
      } else if (elapsed >= 3.65 && elapsed < 4.35) {
        portalOpen = Math.max(0, 1 - (elapsed - 3.65) / 0.7);
      }

      const portalR = 88 * portalOpen;

      if (portalOpen > 0.02) {
        // Deep dimensional portal crater with bright inner rift rim
        const pGrad = ctx.createRadialGradient(portalX, portalY, portalR * 0.22, portalX, portalY, portalR * 1.45);
        pGrad.addColorStop(0, `rgba(0, 0, 0, ${0.98 * portalOpen})`);
        pGrad.addColorStop(0.58, `rgba(${cr}, ${cg}, ${cb}, ${0.32 * portalOpen})`);
        pGrad.addColorStop(0.75, `rgba(0, 0, 0, ${0.88 * portalOpen})`);
        pGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.ellipse(portalX, portalY, portalR * 1.45, portalR * 1.08, 0, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glowing oval portal fissure ring so portal silhouette pops cleanly against #000
        ctx.strokeStyle = `rgba(${Math.min(255, cr + 75)}, ${Math.min(255, cg + 75)}, ${Math.min(255, cb + 75)}, ${0.65 * portalOpen})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(portalX, portalY, portalR * 1.05, portalR * 0.68, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 3 swirling glowing ASCII portal rings
        const tickP = Math.floor(t * 9);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = '700 11px "IBM Plex Mono", monospace';
        const ringChars = 48;
        for (let ring = 0; ring < 3; ring++) {
          const baseR = portalR * (0.76 + ring * 0.22);
          const dirR = ring % 2 === 0 ? 1 : -1;
          for (let i = 0; i < ringChars; i++) {
            const a = (i / ringChars) * Math.PI * 2 + t * 1.8 * dirR;
            const px = portalX + Math.cos(a) * baseR * 1.18;
            const py = portalY + Math.sin(a) * baseR * 0.76;
            const ch = HAND_CHARS[(i * 7 + ring * 13 + tickP) % HAND_CHARS.length];
            const al = (0.55 + 0.45 * Math.sin(t * 4 + i)) * portalOpen;
            ctx.fillStyle =
              ring === 0 && i % 3 === 0
                ? `rgba(255, 236, 228, ${al})`
                : `rgba(${cr}, ${cg}, ${cb}, ${al})`;
            ctx.fillText(ch, px, py);
          }
        }
      }

      // Draw crisp glowing beetle clearly before hand obscures/grabs it
      if (showBug) {
        ctx.save();
        ctx.translate(bugX, bugY);
        ctx.rotate(bugAngle);

        const bGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 32);
        bGlow.addColorStop(0, `rgba(255, 225, 210, 0.38)`);
        bGlow.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, 0.28)`);
        bGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bGlow;
        ctx.fillRect(-32, -32, 64, 64);

        ctx.strokeStyle = "rgba(255, 240, 230, 0.96)";
        ctx.lineWidth = 1.85;
        [-8, 0, 8].forEach((lx, i) => {
          const wig = Math.sin(t * 28 + i * 2.1) * 4.5;
          ctx.beginPath();
          ctx.moveTo(lx, -5);
          ctx.lineTo(lx + wig * 0.6, -15);
          ctx.moveTo(lx, 5);
          ctx.lineTo(lx - wig * 0.6, 15);
          ctx.stroke();
        });

        ctx.beginPath();
        ctx.moveTo(15, -2.5);
        ctx.lineTo(23, -7);
        ctx.moveTo(15, 2.5);
        ctx.lineTo(23, 7);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = '800 15px "IBM Plex Mono", monospace';
        ctx.fillStyle = "#fff4ed";
        ctx.fillText("~(███@>", 0, 0.5);
        ctx.restore();
      }

      // -----------------------------------------------------------------------
      // PHASE D: SEPARATED-FINGER ASCII HAND EMERGING OUT OF THE PORTAL (1.35..3.65s)
      // Clipped below portalY + portalR * 0.45 so the arm comes strictly OUT of the portal!
      // -----------------------------------------------------------------------
      if (elapsed >= 1.35 && elapsed < 3.65 && portalOpen > 0.2) {
        let handY = portalY + 95;
        let closeAmt = 0;

        if (elapsed < 2.55) {
          const rp = (elapsed - 1.35) / 1.2;
          const easeR = 1 - Math.pow(1 - rp, 2.5);
          handY = portalY + 85 + (bugTargetY + 14 - (portalY + 85)) * easeR;
        } else if (elapsed < 3.0) {
          handY = bugTargetY + 14;
          const gp = (elapsed - 2.55) / 0.45;
          closeAmt = Math.min(1, gp * 1.15);
          if (!grabPlayed && gp > 0.3) {
            grabPlayed = true;
            soundEngine.playBugGrab();
          }
        } else {
          closeAmt = 1;
          const dp = (elapsed - 3.0) / 0.65;
          handY = bugTargetY + 14 + (portalY + 95 - (bugTargetY + 14)) * (dp * dp);
        }

        ctx.save();
        // Portal horizon clip: never draw hand below the bottom rim of the portal!
        ctx.beginPath();
        ctx.rect(0, 0, w, portalY + portalR * 0.42);
        ctx.clip();

        const cw = 7.4;
        const ch = 10.6;
        const tick = Math.floor(t * 8.5);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = '700 10.5px "IBM Plex Mono", "Consolas", monospace';

        for (let r = -17; r <= 34; r++) {
          const py = handY + r * ch;
          if (py < -20 || py > portalY + portalR * 0.45) continue;

          for (let c = -16; c <= 16; c++) {
            const d = evalCatchHandSDF(c, r * (ch / cw) * 0.68, closeAmt);
            if (d > 0.16) continue;

            const px = portalX + c * cw;
            if (d < -0.2) {
              ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
              ctx.fillRect(px - cw * 0.52, py - ch * 0.52, cw + 1, ch + 1);
            }

            const rim = Math.max(0, Math.min(1, 1 - Math.abs(d) / 2.0));
            const hv = hash2(c, r);
            if (rim < 0.25 && hv < 0.35) continue;

            const alpha = rim > 0.48 ? 0.56 + rim * 0.42 : 0.16 + rim * 0.24 + hv * 0.1;
            const glyph = HAND_CHARS[(Math.abs(c) * 13 + Math.abs(r) * 29 + tick) % HAND_CHARS.length];

            if (rim > 0.66) {
              ctx.fillStyle = `rgba(${Math.min(255, cr + 95)}, ${Math.min(255, cg + 90)}, ${Math.min(255, cb + 90)}, ${alpha})`;
            } else {
              ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
            }
            ctx.fillText(glyph, px, py);
          }
        }
        ctx.restore();
      }

      // Grab spark ring at contact (2.55..3.05s)
      if (elapsed >= 2.55 && elapsed <= 3.05) {
        const sp = (elapsed - 2.55) / 0.5;
        const ringR = 14 + sp * 62;
        const ringAlpha = (1 - sp) * 0.88;
        ctx.save();
        ctx.strokeStyle = `rgba(${Math.min(255, cr + 90)}, ${Math.min(255, cg + 90)}, ${Math.min(255, cb + 90)}, ${ringAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bugTargetX, bugTargetY, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      rafId = requestAnimationFrame(render);
    };

    startEventRef.current = () => {
      cancelAnimationFrame(rafId);
      crackX = w * (w < 640 ? 0.72 : 0.54);
      crackY = h * (h < 640 ? 0.24 : 0.17);
      bugTargetX = w * (w < 640 ? 0.54 : 0.45);
      bugTargetY = h * 0.43;
      portalX = bugTargetX;
      portalY = bugTargetY + 145;
      crackSegments = generateCrackBranches(crackX, crackY);
      spawnPlayed = false;
      grabPlayed = false;
      startTime = performance.now();
      active = true;
      soundEngine.playScreenCrack();
      rafId = requestAnimationFrame(render);
    };

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 h-full w-full"
    />
  );
}
