import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { CopyDict } from "../data/i18n";
import { PROFILE_LINKS } from "../data/profile";
import { ScrambleText } from "./ScrambleText";

interface ProjectsSectionProps {
  copy: CopyDict;
  vibeRgb: [number, number, number];
}

const EASE = [0.22, 1, 0.36, 1] as const;
const RING_CHARS = "01#%&=+*<>@A-Z";

/**
 * Circular swirling ASCII breach portal for engineering project cards.
 */
function AsciiBreachRing({
  vibeRgb,
  label,
}: {
  vibeRgb: [number, number, number];
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rgbRef = useRef(vibeRgb);
  rgbRef.current = vibeRgb;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = 210;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cur: [number, number, number] = [...rgbRef.current];
    let rafId = 0;

    const draw = (now: number) => {
      const t = reduceMotion ? 0 : now * 0.001;
      const tgt = rgbRef.current;
      cur[0] += (tgt[0] - cur[0]) * 0.08;
      cur[1] += (tgt[1] - cur[1]) * 0.08;
      cur[2] += (tgt[2] - cur[2]) * 0.08;

      const rgbStr = `${Math.round(cur[0])}, ${Math.round(cur[1])}, ${Math.round(cur[2])}`;
      ctx.clearRect(0, 0, size, size);
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cx = size * 0.5;
      const cy = size * 0.5;

      // 3 concentric rotating ASCII rings
      [
        { radius: 88, count: 36, speed: 0.28, alpha: 0.72 },
        { radius: 66, count: 26, speed: -0.42, alpha: 0.55 },
        { radius: 44, count: 16, speed: 0.65, alpha: 0.42 },
      ].forEach((ring, rIdx) => {
        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2 + t * ring.speed;
          const x = cx + Math.cos(angle) * ring.radius;
          const y = cy + Math.sin(angle) * ring.radius;
          const ch = RING_CHARS[(i + rIdx * 5 + Math.floor(t * 4)) % RING_CHARS.length];
          ctx.fillStyle = `rgba(${rgbStr}, ${ring.alpha})`;
          ctx.fillText(ch, x, y);
        }
      });

      ctx.font = '700 12px "Chakra Petch", monospace';
      ctx.fillStyle = "#f2f4f5";
      ctx.fillText(label, cx, cy);

      if (!reduceMotion && !document.hidden) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [label]);

  return (
    <canvas
      ref={canvasRef}
      width={210}
      height={210}
      aria-hidden="true"
      className="h-[180px] w-[180px] shrink-0 sm:h-[210px] sm:w-[210px]"
    />
  );
}

export function ProjectsSection({ copy, vibeRgb }: ProjectsSectionProps) {
  return (
    <section id="projects" aria-labelledby="projects-title" className="border-b border-rule py-20">
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mb-12"
        >
          <p className="vibe-sync inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-accent">
            <span className="vibe-sync h-[2px] w-6 bg-accent" aria-hidden="true" />
            03 // {copy.projKicker}
          </p>
          <h2
            id="projects-title"
            className="mt-3 font-display text-[clamp(2rem,1.4rem+2.5vw,3.4rem)] font-bold leading-tight text-ink"
          >
            <ScrambleText text={copy.projTitle} />
          </h2>
          <p className="mt-2 max-w-[66ch] text-sm text-ink-muted sm:text-base">{copy.projSub}</p>
        </motion.header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 01: Major Machine Learning Project (Active Build) */}
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.42, ease: EASE }}
            className="bracket-box flex min-w-0 flex-col gap-6 border border-rule bg-black/85 p-6 sm:flex-row sm:items-center sm:p-7"
          >
            <div className="flex justify-center">
              <AsciiBreachRing vibeRgb={vibeRgb} label="ML // 01" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
                <span className="vibe-sync font-semibold text-accent">01</span>
                <span className="vibe-sync border border-accent px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {copy.p1Status}
                </span>
              </div>

              <h3 className="mt-3 font-display text-2xl font-bold text-ink">{copy.p1Title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{copy.p1Desc}</p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {["Machine Learning", "Data Engineering", "Model Training", "4IIRF"].map((t) => (
                  <li
                    key={t}
                    className="border border-rule bg-void/90 px-2.5 py-1 font-mono text-[11px] text-ink/90"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              <p className="mt-4 font-mono text-xs text-ink-muted">{copy.p1Note}</p>
            </div>
          </motion.article>

          {/* 02: Personal Database & Software Projects (Publishing Soon) */}
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.42, delay: 0.08, ease: EASE }}
            className="flex min-w-0 flex-col gap-6 border border-rule bg-black/85 p-6 sm:flex-row sm:items-center sm:p-7"
          >
            <div className="flex justify-center">
              <AsciiBreachRing vibeRgb={vibeRgb} label="DB // 02" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
                <span className="vibe-sync font-semibold text-accent">02</span>
                <span className="border border-rule-strong px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
                  {copy.p2Status}
                </span>
              </div>

              <h3 className="mt-3 font-display text-2xl font-bold text-ink">{copy.p2Title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{copy.p2Desc}</p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {["Oracle", "PostgreSQL", "PL/SQL", "Java", "C / C++", "PHP"].map((t) => (
                  <li
                    key={t}
                    className="border border-rule bg-void/90 px-2.5 py-1 font-mono text-[11px] text-ink/90"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <a
                  href={PROFILE_LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vibe-sync group inline-flex min-h-10 items-center gap-2 border border-rule-strong px-4 font-mono text-xs font-semibold uppercase tracking-wider text-ink hover:border-accent hover:text-accent"
                >
                  <span>{copy.p2Cta}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
