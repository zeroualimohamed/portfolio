import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, RotateCcw } from "lucide-react";
import { GALLERY_DATA, type Artwork, type Orientation } from "../data/gallery";
import type { CopyDict } from "../data/i18n";
import type { ActiveVibe } from "../hooks/useVibe";
import { formatBytes, pad2, preloadImage } from "../lib/preload";
import { BreachPortalCard } from "./BreachPortalCard";
import { ScrambleText } from "./ScrambleText";
import { soundEngine } from "../lib/sound";

type FilterKey = "all" | Orientation;

interface ArchiveSectionProps {
  copy: CopyDict;
  vibe: ActiveVibe;
  onPreviewVibe: (work: Artwork | null) => void;
  onLockVibe: (work: Artwork | null) => void;
  onResetVibe: () => void;
  onInspect: (list: Artwork[], index: number) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring" as const, stiffness: 300, damping: 28, mass: 0.85 };

export function ArchiveSection({
  copy,
  vibe,
  onPreviewVibe,
  onLockVibe,
  onResetVibe,
  onInspect,
}: ArchiveSectionProps) {
  const [mode, setMode] = useState<"deck" | "portals">("deck");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [deckIdx, setDeckIdx] = useState(0);
  const draggedRef = useRef(false);

  const filtered = useMemo(() => {
    if (filter === "all") return GALLERY_DATA.works;
    return GALLERY_DATA.works.filter((w) => w.orientation === filter);
  }, [filter]);

  const count = filtered.length;
  const safeIdx = count > 0 ? ((deckIdx % count) + count) % count : 0;
  const current = filtered[safeIdx];

  const step = useCallback(
    (delta: number) => {
      if (!count) return;
      const nextIdx = (safeIdx + delta + count) % count;
      setDeckIdx(nextIdx);
      onLockVibe(filtered[nextIdx]);
      soundEngine.playTick(560);
    },
    [count, safeIdx, filtered, onLockVibe],
  );

  useEffect(() => {
    if (!count) return;
    for (let o = 0; o < Math.min(4, count); o++) {
      const w = filtered[(safeIdx + o) % count];
      preloadImage(w.thumb);
      if (o <= 1) preloadImage(w.full);
    }
    if (count > 1) preloadImage(filtered[(safeIdx - 1 + count) % count].full);
  }, [filtered, safeIdx, count]);

  const visibleLayers = useMemo(() => {
    const layers: { work: Artwork; workIdx: number; depth: number }[] = [];
    const maxL = Math.min(4, count);
    for (let d = maxL - 1; d >= 0; d--) {
      const wi = (safeIdx + d) % count;
      layers.push({ work: filtered[wi], workIdx: wi, depth: d });
    }
    return layers;
  }, [filtered, safeIdx, count]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -65 || info.velocity.x < -360) step(1);
    else if (info.offset.x > 65 || info.velocity.x > 360) step(-1);
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 60);
  };

  const counts = GALLERY_DATA.stats.counts;
  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: copy.filterAll },
    { key: "landscape", label: copy.filterLandscape },
    { key: "portrait", label: copy.filterPortrait },
    { key: "square", label: copy.filterSquare },
  ];

  return (
    <section id="archive" aria-labelledby="archive-title" className="border-b border-rule py-20">
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mb-8 flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <p className="vibe-sync inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-accent">
              <span className="vibe-sync h-[2px] w-6 bg-accent" aria-hidden="true" />
              04 // {copy.archKicker}
            </p>
            <h2
              id="archive-title"
              className="mt-3 font-display text-[clamp(2rem,1.4rem+2.5vw,3.4rem)] font-bold leading-tight text-ink"
            >
              <ScrambleText text={copy.archTitle} />
            </h2>
            <p className="mt-2 max-w-[66ch] text-sm text-ink-muted sm:text-base">{copy.archSub}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {vibe.sourceTitle && (
              <button
                type="button"
                onClick={onResetVibe}
                className="vibe-sync inline-flex h-11 cursor-pointer items-center gap-2 border border-accent/60 bg-black px-3.5 font-mono text-xs text-accent hover:bg-accent hover:text-on-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{copy.archResetVibe}</span>
              </button>
            )}

            <div role="group" aria-label="Archive View" className="inline-flex border border-rule bg-black">
              {(["deck", "portals"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => {
                    soundEngine.playTick(620);
                    setMode(m);
                  }}
                  className={`vibe-sync h-11 cursor-pointer px-4 font-mono text-xs font-semibold uppercase tracking-wider first:border-r first:border-rule ${
                    mode === m ? "bg-accent text-on-accent" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {m === "deck" ? copy.modeStack : copy.modePortals}
                </button>
              ))}
            </div>
          </div>
        </motion.header>

        {/* Filter & Compression Telemetry Strip */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-y border-rule py-3">
          <div role="group" aria-label="Orientation filter" className="grid max-w-full grid-cols-2 border border-rule bg-black sm:inline-flex">
            {filters.map((f, i) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    soundEngine.playTick(540);
                    setFilter(f.key);
                    setDeckIdx(0);
                  }}
                  className={`vibe-sync h-10 cursor-pointer px-3 font-mono text-xs font-semibold uppercase tracking-wider ${
                    i > 0 ? "sm:border-l sm:border-rule" : ""
                  } ${i >= 2 ? "border-t border-rule sm:border-t-0" : ""} ${
                    i % 2 === 1 ? "border-l border-rule" : ""
                  } ${active ? "bg-accent text-on-accent" : "text-ink-muted hover:text-ink"}`}
                >
                  {f.label} <span className="ml-1 opacity-75">{counts[f.key]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-ink-muted">
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 border border-white/20"
                style={{ backgroundColor: vibe.accent }}
                aria-hidden="true"
              />
              <span className="uppercase tracking-wider text-ink">
                {vibe.sourceTitle ? `${vibe.sourceTitle} · ${vibe.accent}` : copy.archVibeHint}
              </span>
            </span>
            <span className="hidden text-rule-strong sm:inline">|</span>
            <span>
              WebP: {formatBytes(GALLERY_DATA.stats.totalThumbBytes)} /{" "}
              {formatBytes(GALLERY_DATA.stats.totalOrigBytes)}
            </span>
          </div>
        </div>

        {/* MODE A: Compact Spring-Physics Stacked Deck ("one behind another") */}
        {mode === "deck" && current && (
          <div className="grid gap-4">
            <div className="bracket-box grid max-w-full grid-cols-1 overflow-hidden border border-rule bg-black/90 lg:grid-cols-[1.28fr_0.72fr]">
              <div
                tabIndex={0}
                aria-label="2D and 3D artwork stack"
                onMouseEnter={() => onPreviewVibe(current)}
                onMouseLeave={() => onPreviewVibe(null)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    step(1);
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    step(-1);
                  } else if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onInspect(filtered, safeIdx);
                  }
                }}
                className="relative flex h-[320px] min-w-0 select-none items-center justify-start overflow-hidden bg-black px-4 pt-5 pb-7 sm:h-[420px] sm:px-7 sm:pt-6 sm:pb-9"
              >
                <div className="relative h-full w-[calc(100%-44px)] max-w-[540px] sm:w-[calc(100%-82px)]">
                  <AnimatePresence initial={false} mode="popLayout">
                    {visibleLayers.map(({ work, workIdx, depth }) => {
                      const isFront = depth === 0;
                      const xOffset = depth * 22;
                      const yOffset = depth * 9;
                      const scale = 1 - depth * 0.05;
                      const opacity =
                        depth === 0 ? 1 : depth === 1 ? 0.78 : depth === 2 ? 0.45 : 0.2;

                      return (
                        <motion.div
                          key={work.slug}
                          data-pos={depth}
                          initial={{ x: 84, y: 34, scale: 0.82, opacity: 0 }}
                          animate={{
                            x: xOffset,
                            y: yOffset,
                            scale,
                            opacity,
                            rotate: 0,
                            zIndex: 10 - depth,
                          }}
                          exit={{
                            x: -115,
                            y: 12,
                            rotate: -3,
                            scale: 0.94,
                            opacity: 0,
                            zIndex: 20,
                            transition: { duration: 0.24, ease: EASE },
                          }}
                          transition={SPRING}
                          drag={isFront ? "x" : false}
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.62}
                          whileDrag={isFront ? { cursor: "grabbing", scale: 1.01 } : undefined}
                          whileHover={
                            depth === 1 ? { x: xOffset + 7, opacity: 0.95 } : undefined
                          }
                          onMouseEnter={() => onPreviewVibe(work)}
                          onDragStart={() => {
                            draggedRef.current = true;
                          }}
                          onDragEnd={isFront ? handleDragEnd : undefined}
                          onClick={() => {
                            if (isFront) {
                              if (!draggedRef.current) {
                                onLockVibe(work);
                                onInspect(filtered, safeIdx);
                              }
                            } else if (depth <= 2) {
                              setDeckIdx(workIdx);
                              onLockVibe(work);
                              soundEngine.playTick(580);
                            }
                          }}
                          role="button"
                          tabIndex={isFront || depth === 1 ? 0 : -1}
                          aria-label={`${work.title}, ${work.series}`}
                          style={{
                            borderColor: isFront ? work.vibe.accent : undefined,
                          }}
                          className={`absolute inset-0 overflow-hidden border bg-black ${
                            isFront
                              ? "cursor-grab"
                              : depth <= 2
                                ? "cursor-pointer border-rule-strong"
                                : "pointer-events-none border-rule"
                          }`}
                        >
                          <img
                            src={work.thumb}
                            alt={`${work.title}, ${work.series}`}
                            width={work.thumbWidth}
                            height={work.thumbHeight}
                            draggable={false}
                            decoding="async"
                            className="pointer-events-none h-full w-full object-contain"
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex min-w-0 flex-col justify-between gap-6 border-t border-rule p-5 sm:p-7 lg:border-t-0 lg:border-l">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span className="vibe-sync font-semibold tracking-wider text-accent">
                      {pad2(safeIdx + 1)} / {pad2(count)}
                    </span>
                    <span className="inline-flex items-center gap-2 text-ink-muted">
                      <span
                        className="h-2 w-2"
                        style={{ backgroundColor: current.vibe.accent }}
                        aria-hidden="true"
                      />
                      {current.vibe.mood}
                    </span>
                  </div>

                  <div className="h-[2px] w-full overflow-hidden bg-rule" aria-hidden="true">
                    <motion.div
                      className="vibe-sync h-full origin-left bg-accent"
                      animate={{ scaleX: (safeIdx + 1) / count }}
                      transition={{ type: "spring", stiffness: 280, damping: 32 }}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.slug}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="mt-1 grid gap-1.5"
                    >
                      <h3 className="font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
                        {current.title}
                      </h3>
                      <p className="font-mono text-xs text-ink-muted">
                        {current.series} · {current.origWidth}&times;{current.origHeight} ·{" "}
                        {current.vibe.accent.toUpperCase()}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label={copy.deckPrev}
                      className="vibe-sync grid h-11 w-11 cursor-pointer place-items-center border border-rule bg-black text-ink hover:border-accent hover:text-accent"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={copy.deckNext}
                      className="vibe-sync grid h-11 w-11 cursor-pointer place-items-center border border-rule bg-black text-ink hover:border-accent hover:text-accent"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLockVibe(current);
                        onInspect(filtered, safeIdx);
                      }}
                      className="vibe-sync inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 border border-accent bg-accent px-4 font-mono text-xs font-semibold uppercase tracking-wider text-on-accent hover:opacity-90"
                    >
                      <Maximize2 className="h-4 w-4" />
                      <span>{copy.deckInspect}</span>
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-ink-muted">{copy.deckHint}</p>
                </div>
              </div>
            </div>

            <div
              aria-label="Artwork filmstrip"
              onMouseLeave={() => onPreviewVibe(null)}
              className="flex gap-2 overflow-x-auto py-1"
            >
              {filtered.map((w, i) => {
                const active = i === safeIdx;
                return (
                  <button
                    key={w.slug}
                    type="button"
                    aria-label={`${w.title} (${w.vibe.mood})`}
                    aria-current={active ? "true" : undefined}
                    onMouseEnter={() => onPreviewVibe(w)}
                    onFocus={() => onPreviewVibe(w)}
                    onClick={() => {
                      setDeckIdx(i);
                      onLockVibe(w);
                      soundEngine.playTick(600);
                    }}
                    style={{ borderColor: active ? w.vibe.accent : undefined }}
                    className={`relative h-[64px] w-[86px] shrink-0 cursor-pointer border bg-black transition-all ${
                      active ? "opacity-100" : "border-rule opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={w.thumb}
                      alt=""
                      width={w.thumbWidth}
                      height={w.thumbHeight}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute right-1 bottom-1 h-1.5 w-1.5"
                      style={{ backgroundColor: w.vibe.accent }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE B: All 21 Circular Swirling ASCII Breach Portals */}
        {mode === "portals" && (
          <div
            onMouseLeave={() => onPreviewVibe(null)}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((w, i) => (
              <BreachPortalCard
                key={w.slug}
                work={w}
                eager={i < 6}
                onHover={onPreviewVibe}
                onClick={() => {
                  setDeckIdx(i);
                  onLockVibe(w);
                  onInspect(filtered, i);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
