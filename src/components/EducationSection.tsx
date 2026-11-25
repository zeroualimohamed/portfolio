import { motion } from "motion/react";
import type { CopyDict } from "../data/i18n";
import { ScrambleText } from "./ScrambleText";

interface EducationSectionProps {
  copy: CopyDict;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function EducationSection({ copy }: EducationSectionProps) {
  const entries = [
    {
      date: copy.edu1Date,
      badge: copy.edu1Badge,
      active: true,
      track: "4IIRF · CYBERSECURITY (S2)",
      school: copy.edu1School,
      degree: copy.edu1Degree,
      desc: copy.edu1Desc,
      tags: ["4IIRF", "Cybersecurity (S2)", "Machine Learning", "Software Engineering"],
    },
    {
      date: copy.edu2Date,
      badge: copy.edu2Badge,
      active: false,
      track: "INFORMATION SYSTEMS & DATABASES",
      school: copy.edu2School,
      degree: copy.edu2Degree,
      desc: copy.edu2Desc,
      tags: ["Information Systems", "Databases", "SQL / PL-SQL", "Operating Systems"],
    },
    {
      date: copy.edu3Date,
      badge: copy.edu3Badge,
      active: false,
      track: "PHYSICAL SCIENCES",
      school: copy.edu3School,
      degree: copy.edu3Degree,
      desc: copy.edu3Desc,
      tags: ["Physics", "Mathematics"],
    },
  ];

  return (
    <section id="education" aria-labelledby="education-title" className="border-b border-rule py-20">
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
            01 // {copy.eduKicker}
          </p>
          <h2
            id="education-title"
            className="mt-3 font-display text-[clamp(2rem,1.4rem+2.5vw,3.4rem)] font-bold leading-tight text-ink"
          >
            <ScrambleText text={copy.eduTitle} />
          </h2>
          <p className="mt-2 max-w-[66ch] text-sm text-ink-muted sm:text-base">{copy.eduSub}</p>
        </motion.header>

        {/* Full-width 3-column horizontal hairline rows */}
        <div className="divide-y divide-accent/40 border-y border-accent/40">
          {entries.map((item, idx) => (
            <motion.article
              key={item.degree}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.4, delay: idx * 0.06, ease: EASE }}
              className="grid grid-cols-1 items-baseline gap-4 py-8 lg:grid-cols-[210px_1.15fr_1.65fr] lg:gap-10"
            >
              {/* Col 1: Accent Date & Crisp Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 lg:flex-col lg:items-start">
                <span className="vibe-sync font-mono text-sm font-semibold tracking-[0.1em] text-accent">
                  {item.date}
                </span>
                <span
                  className={`border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    item.active
                      ? "border-accent text-accent"
                      : "border-rule-strong text-ink-muted"
                  }`}
                >
                  {item.badge}
                </span>
              </div>

              {/* Col 2: Bold Degree & Uppercase Track */}
              <div className="min-w-0">
                <h3 className="font-display text-xl font-bold leading-snug text-ink sm:text-[1.45rem]">
                  {item.degree}
                </h3>
                <p className="vibe-sync mt-1.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  {item.track}
                </p>
              </div>

              {/* Col 3: Institution, Description & Minimal Tags */}
              <div className="min-w-0">
                <p className="font-sans text-base font-medium text-ink">{item.school}</p>
                <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-muted">
                  {item.desc}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      className="border border-rule bg-black/80 px-2.5 py-1 font-mono text-[11px] text-ink-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
