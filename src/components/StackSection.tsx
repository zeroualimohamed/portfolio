import { useState } from "react";
import { motion } from "motion/react";
import type { CopyDict } from "../data/i18n";
import { STACK_GROUPS } from "../data/profile";
import { AsciiDeskCanvas } from "./AsciiDeskCanvas";
import { ScrambleText } from "./ScrambleText";
import { soundEngine } from "../lib/sound";

interface StackSectionProps {
  copy: CopyDict;
  vibeRgb: [number, number, number];
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function StackSection({ copy, vibeRgb }: StackSectionProps) {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const titleByKey = {
    databases: copy.gDatabases,
    programming: copy.gProgramming,
    systems: copy.gSystems,
    ai: copy.gAi,
    visual: copy.gVisual,
  };

  return (
    <section id="stack" aria-labelledby="stack-title" className="border-b border-rule py-20">
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
            02 // {copy.stackKicker}
          </p>
          <h2
            id="stack-title"
            className="mt-3 font-display text-[clamp(2rem,1.4rem+2.5vw,3.4rem)] font-bold leading-tight text-ink"
          >
            <ScrambleText text={copy.stackTitle} />
          </h2>
          <p className="mt-2 max-w-[66ch] text-sm text-ink-muted sm:text-base">{copy.stackSub}</p>
        </motion.header>

        {/* Left: Numbered Skill Grid | Right: Razor-Sharp ASCII CRT Monitor + Perspective Keyboard + 3D Hands */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="grid min-w-0 grid-cols-1 gap-7 sm:grid-cols-2">
            {STACK_GROUPS.map((group) => (
              <div
                key={group.no}
                className={`min-w-0 border-t border-accent/60 pt-4 ${
                  group.no === "05" ? "sm:col-span-2" : ""
                }`}
              >
                <div className="mb-3 flex items-baseline gap-2.5">
                  <span className="vibe-sync font-mono text-xs font-semibold text-accent">
                    {group.no}
                  </span>
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-ink">
                    {titleByKey[group.key]}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => {
                    const isHovered = activeSkill === skill;
                    return (
                      <button
                        key={skill}
                        type="button"
                        onMouseEnter={() => {
                          setActiveSkill(skill);
                          soundEngine.playTick(720, 0.018);
                        }}
                        onMouseLeave={() => setActiveSkill(null)}
                        onFocus={() => setActiveSkill(skill)}
                        onBlur={() => setActiveSkill(null)}
                        className={`vibe-sync min-h-9 cursor-pointer border px-3 py-1.5 font-mono text-xs transition-colors ${
                          isHovered
                            ? "border-accent bg-accent/15 text-accent"
                            : "border-rule bg-black/80 text-ink/90 hover:border-accent hover:text-accent"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Borderless ASCII Workstation & Anatomical 3D Typing Hands melting into #000 */}
          <div className="min-w-0">
            <div className="h-[520px] w-full sm:h-[620px] lg:h-[680px]">
              <AsciiDeskCanvas vibeRgb={vibeRgb} activeSkill={activeSkill} />
            </div>
            <p className="mt-1 text-center font-mono text-[11px] text-ink-muted">
              {activeSkill ? `EXEC // ${activeSkill.toUpperCase()}` : copy.stackHint}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
