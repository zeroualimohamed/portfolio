import { useEffect, useRef, useState } from "react";
import type { Artwork } from "../data/gallery";
import { pad2 } from "../lib/preload";

interface BreachPortalCardProps {
  work: Artwork;
  eager: boolean;
  onHover: (work: Artwork | null) => void;
  onClick: () => void;
}

const PORTAL_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz#%&$?+*/=[]{}KTXA";

function cellHash(c: number, r: number): number {
  const n = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Circular Jagged-ASCII Breach Portal framing a 2D/3D artwork.
 * Idle: dense dim-to-mid swirling code wall around a dark pixelated breach.
 * Hover: circular ASCII breach tears wide open in vivid artwork accent colors
 * with CRT horizontal glitch slices & triggers full-site Artwork Vibe Takeover.
 */
export function BreachPortalCard({ work, eager, onHover, onClick }: BreachPortalCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  hoveredRef.current = hovered;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = 360;
    const h = 270;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let inView = false;
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0.02 },
    );
    io.observe(canvas);

    let expand = 0;
    let glitchBurst = 0;
    let prevHovered = false;
    let rafId = 0;

    const cols = 34;
    const rows = 24;
    const cw = w / cols;
    const ch = h / rows;

    const draw = (now: number) => {
      if ((inView || hoveredRef.current) && !document.hidden) {
        const t = reduceMotion ? 0 : now * 0.001;
        const isHov = hoveredRef.current;
        if (isHov && !prevHovered) {
          glitchBurst = 1.0;
        }
        prevHovered = isHov;

        expand += ((isHov ? 1 : 0) - expand) * 0.14;
        glitchBurst *= 0.9;
        if (glitchBurst < 0.01) glitchBurst = 0;

        ctx.clearRect(0, 0, w, h);

        // Outer pure-black void fade outside the circular portal perimeter
        const outerR = Math.min(w, h) * 0.49;
        const innerR = (0.37 + expand * 0.34) * outerR;

        // Paint opaque black cells outside the jagged stepped breach hole
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${Math.floor(ch * 0.88)}px "IBM Plex Mono", monospace`;

        const tick = Math.floor(t * (isHov ? 9 : 4));

        for (let r = 0; r < rows; r++) {
          const py = (r + 0.5) * ch;
          const dy = (py - h * 0.5) / outerR;

          // Subtle CRT row tear slice on hover enter
          const rowGlitch =
            glitchBurst > 0.05 && Math.sin(r * 1.9 + t * 24) > 0.55
              ? (cellHash(r, tick) - 0.5) * 14 * glitchBurst
              : 0;

          for (let c = 0; c < cols; c++) {
            const px = (c + 0.5) * cw + rowGlitch;
            const dx = (px - w * 0.5) / outerR;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const hVal = cellHash(c, r);

            // Jagged stepped breach threshold creates authentic torn-ASCII edge
            const angle = Math.atan2(dy, dx);
            const teeth = 0.075 * Math.sin(angle * 7 + t * 1.4) + (hVal - 0.5) * 0.11;
            const breachRadius = 0.36 + expand * 0.32 + teeth;

            // Center breach window left open so the artwork thumbnail shines through
            if (dist < breachRadius) continue;

            // Black cell mask occludes outer rectangular edges of thumbnail cleanly
            ctx.fillStyle = "rgba(0, 0, 0, 0.96)";
            ctx.fillRect(c * cw - 0.5, r * ch - 0.5, cw + 1, ch + 1);

            // Circular ASCII cloud visible within normalized portal disk [0..0.98]
            if (dist > 0.98) continue;

            const ringEdge = Math.exp(-Math.pow((dist - (breachRadius + 0.09)) / 0.18, 2));
            const outerFade = 1 - Math.max(0, (dist - 0.72) / 0.26);
            const shimmer = 0.45 + 0.55 * Math.sin(t * 2.2 + hVal * 12);

            const baseAlpha = isHov
              ? (0.28 + ringEdge * 0.72) * outerFade * shimmer
              : (0.12 + ringEdge * 0.44) * outerFade * shimmer;

            if (baseAlpha < 0.05) continue;

            const glyphIdx = Math.floor((hVal * 100 + tick + (isHov ? r : 0)) % PORTAL_CHARS.length);
            const glyph = PORTAL_CHARS[glyphIdx];

            // Rim flashes hot pale-white accent right along breach border on hover
            if (isHov && ringEdge > 0.74 && hVal > 0.58) {
              ctx.fillStyle = `rgba(255, 240, 224, ${Math.min(0.95, baseAlpha * 1.15)})`;
            } else {
              ctx.fillStyle = `rgba(${work.vibe.rgb}, ${Math.min(0.96, baseAlpha)})`;
            }
            ctx.fillText(glyph, px, py);
          }
        }

        // Faint horizontal chromatic glitch streak across the open portal on hover
        if (glitchBurst > 0.08 && !reduceMotion) {
          const sliceY = h * (0.28 + ((t * 3.7) % 0.44));
          ctx.fillStyle = `rgba(${work.vibe.rgb}, ${glitchBurst * 0.28})`;
          ctx.fillRect(w * 0.5 - innerR, sliceY, innerR * 2, 2.5);
        }
      }

      if (!reduceMotion) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
    };
  }, [work.vibe.rgb]);

  return (
    <button
      type="button"
      onMouseEnter={() => {
        setHovered(true);
        onHover(work);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHover(null);
      }}
      onFocus={() => {
        setHovered(true);
        onHover(work);
      }}
      onBlur={() => {
        setHovered(false);
        onHover(null);
      }}
      onClick={onClick}
      className="group relative block w-full cursor-pointer bg-black text-left focus-visible:outline-2 focus-visible:outline-accent"
    >
      {/* Borderless Pure-Black Circular ASCII Portal */}
      <span className="relative block aspect-[4/3] overflow-hidden bg-black">
        <img
          src={work.thumb}
          alt={`${work.title}, ${work.series}`}
          width={work.thumbWidth}
          height={work.thumbHeight}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-contain transition-all duration-300 brightness-[0.68] saturate-[0.52] group-hover:scale-[1.06] group-hover:brightness-[1.06] group-hover:saturate-[1.12]"
        />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2 right-2 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            borderColor: work.vibe.accent,
            color: work.vibe.accent,
            backgroundColor: "rgba(0,0,0,0.88)",
          }}
        >
          {work.vibe.mood}
        </span>
      </span>

      {/* Borderless Editorial Caption Below Left */}
      <span className="mt-2 block border-t border-accent/25 pt-3 transition-colors group-hover:border-accent">
        <span className="flex items-center justify-between gap-3">
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold" style={{ color: work.vibe.accent }}>
                {pad2(work.index)}
              </span>
              <span className="truncate font-display text-base font-bold text-ink transition-colors group-hover:text-accent">
                {work.title}
              </span>
            </span>
            <span className="mt-0.5 block font-mono text-[11px] text-ink-muted">
              {work.series} · {work.origWidth}&times;{work.origHeight}
            </span>
          </span>
          <span
            className="h-2.5 w-2.5 shrink-0 border border-white/20 transition-transform group-hover:scale-125"
            style={{ backgroundColor: work.vibe.accent }}
            aria-hidden="true"
          />
        </span>
      </span>
    </button>
  );
}
