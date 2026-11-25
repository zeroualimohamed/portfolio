import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { CopyDict } from "../data/i18n";
import { TICKER_ROW_1, TICKER_ROW_2 } from "../data/profile";
import { AsciiMonsterCanvas } from "./AsciiMonsterCanvas";
import { ScrambleText } from "./ScrambleText";

interface HeroSectionProps {
  copy: CopyDict;
  vibeRgb: [number, number, number];
  pingSignal: number;
  onJump: (id: string) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ copy, vibeRgb, pingSignal, onJump }: HeroSectionProps) {
  return (
    <section id="top" className="relative overflow-hidden border-b border-rule">
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-10">
        <div className="grid min-h-[calc(100svh-120px)] grid-cols-1 items-center gap-8 py-10 lg:grid-cols-[0.98fr_1.02fr] lg:py-12">
          {/* Left Hero Editorial Copy */}
          <div className="relative z-10 min-w-0">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="vibe-sync inline-flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.16em] text-accent"
            >
              <span className="vibe-sync h-[2px] w-7 bg-accent" aria-hidden="true" />
              <ScrambleText text={copy.heroKicker} />
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06, ease: EASE }}
              className="mt-5 font-display text-[clamp(2.65rem,1.6rem+4.5vw,4.85rem)] font-bold leading-[0.98] tracking-[-0.02em] text-ink"
            >
              <span className="block">
                <ScrambleText text={copy.heroTitleLine1} />
              </span>
              <span className="block">
                <ScrambleText text={copy.heroTitleLine2} />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14, ease: EASE }}
              className="mt-6 max-w-[60ch] text-sm leading-[1.7] text-ink-muted sm:text-[1.02rem]"
            >
              {copy.heroBio}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: EASE }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  onJump("projects");
                }}
                className="vibe-sync group inline-flex min-h-11 items-center gap-2 border border-accent bg-accent px-6 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-on-accent hover:opacity-90"
              >
                <span>{copy.heroCtaWork}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#archive"
                onClick={(e) => {
                  e.preventDefault();
                  onJump("archive");
                }}
                className="vibe-sync inline-flex min-h-11 items-center border border-rule-strong bg-panel/80 px-6 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink hover:border-accent hover:text-accent"
              >
                {copy.heroCtaArchive}
              </a>
            </motion.div>

            {/* Three accent stats under hairline rule */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28, ease: EASE }}
              className="vibe-sync mt-10 grid grid-cols-1 gap-6 border-t border-accent/40 pt-7 sm:grid-cols-3"
            >
              {[
                [copy.stat1Val, copy.stat1Label],
                [copy.stat2Val, copy.stat2Label],
                [copy.stat3Val, copy.stat3Label],
              ].map(([val, label]) => (
                <div key={val}>
                  <div className="vibe-sync font-display text-2xl font-bold tracking-wider text-accent sm:text-3xl">
                    {val}
                  </div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Borderless 3D-Projected ASCII Monster Bust */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
            className="relative h-[460px] w-full sm:h-[580px] lg:h-[690px] lg:-mr-8 lg:-my-6"
          >
            <AsciiMonsterCanvas vibeRgb={vibeRgb} pingSignal={pingSignal} />
          </motion.div>
        </div>
      </div>

      {/* Opposing Bordered Marquee Strips */}
      <div className="ticker-wrap max-w-full overflow-hidden border-t border-rule bg-black/75 py-3" aria-hidden="true">
        <div className="flex w-max animate-ticker gap-3">
          {[...TICKER_ROW_1, ...TICKER_ROW_1].map((item, idx) => (
            <span
              key={`r1-${idx}`}
              className="vibe-sync whitespace-nowrap border border-rule bg-void/80 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-ink-muted"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-2 flex w-max animate-ticker-rev gap-3">
          {[...TICKER_ROW_2, ...TICKER_ROW_2].map((item, idx) => (
            <span
              key={`r2-${idx}`}
              className="vibe-sync whitespace-nowrap border border-accent/25 bg-void/80 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-ink/80"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
