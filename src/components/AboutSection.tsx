import { motion } from "motion/react";
import type { CopyDict } from "../data/i18n";
import { ScrambleText } from "./ScrambleText";

interface AboutSectionProps {
  copy: CopyDict;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function AboutSection({ copy }: AboutSectionProps) {
  return (
    <section id="about" aria-labelledby="about-title" className="border-b border-rule py-20">
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
            05 // {copy.aboutKicker}
          </p>
          <h2
            id="about-title"
            className="mt-3 font-display text-[clamp(2rem,1.4rem+2.5vw,3.4rem)] font-bold leading-tight text-ink"
          >
            <ScrambleText text={copy.aboutTitle} />
          </h2>
        </motion.header>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          {/* Framed studio portrait */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="min-w-0"
          >
            <figure className="bracket-box border border-rule bg-panel p-2.5">
              <picture>
                <source srcSet="./assets/portrait.webp" type="image/webp" />
                <img
                  src="./assets/portrait.jpg"
                  alt="Portrait of Mohamed Zerouali"
                  width={900}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] h-auto w-full object-cover object-[center_15%]"
                />
              </picture>
            </figure>
            <p className="mt-3 font-mono text-xs text-ink-muted">
              FIG.00 // MOHAMED ZEROUALI · ZRWLX
            </p>
          </motion.div>

          {/* Bio + Meta + Off the Code */}
          <div className="grid min-w-0 gap-8">
            <div className="grid gap-4 text-sm leading-[1.75] text-ink-muted sm:text-base">
              <p className="max-w-[68ch] text-ink">{copy.aboutP1}</p>
              <p className="max-w-[68ch]">{copy.aboutP2}</p>
            </div>

            <dl className="grid grid-cols-1 gap-px border border-rule bg-rule sm:grid-cols-2">
              {[
                ["INSTITUTION", copy.aboutMetaSchool],
                ["FOCUS", copy.aboutMetaTrack],
                ["LANGUAGES", copy.aboutMetaLang],
                ["VISUAL CRAFT", copy.aboutMetaArt],
              ].map(([k, v]) => (
                <div key={k} className="bg-black/90 p-4">
                  <dt className="vibe-sync font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
                    {k}
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {/* Off the code block */}
            <div className="border-t border-rule pt-6">
              <div className="flex items-center gap-2.5">
                <span className="vibe-sync h-2.5 w-2.5 bg-accent" aria-hidden="true" />
                <h3 className="font-display text-lg font-bold uppercase tracking-wider text-ink">
                  {copy.offCodeTitle}
                </h3>
              </div>
              <p className="mt-1.5 text-sm text-ink-muted">{copy.offCodeSub}</p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="border border-rule bg-black/85 p-5">
                  <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                    {copy.offCodeCard1Title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {copy.offCodeCard1Desc}
                  </p>
                </div>
                <div className="border border-rule bg-black/85 p-5">
                  <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                    {copy.offCodeCard2Title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {copy.offCodeCard2Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
