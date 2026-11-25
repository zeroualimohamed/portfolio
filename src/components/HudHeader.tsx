import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Flame, Menu, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import type { CopyDict, Lang } from "../data/i18n";
import { BASE_VIBE_PRESETS, type ActiveVibe, type BasePresetId } from "../hooks/useVibe";
import { soundEngine } from "../lib/sound";

interface HudHeaderProps {
  activeSection: string;
  onJump: (id: string) => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  copy: CopyDict;
  vibe: ActiveVibe;
  basePresetId: BasePresetId;
  onSelectPreset: (id: BasePresetId) => void;
  onResetVibe: () => void;
  onPingMonster: () => void;
  onDrawerToggle: (open: boolean) => void;
}

const NAV_ITEMS: { id: string; key: keyof CopyDict; num: string }[] = [
  { id: "education", key: "navEducation", num: "01" },
  { id: "stack", key: "navStack", num: "02" },
  { id: "projects", key: "navProjects", num: "03" },
  { id: "archive", key: "navArchive", num: "04" },
  { id: "about", key: "navAbout", num: "05" },
  { id: "contact", key: "navContact", num: "06" },
];

const SEGMENTS = 44;

export function HudHeader({
  activeSection,
  onJump,
  lang,
  onLangChange,
  copy,
  vibe,
  basePresetId,
  onSelectPreset,
  onResetVibe,
  onPingMonster,
  onDrawerToggle,
}: HudHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filledBlocks, setFilledBlocks] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [soundOn, setSoundOn] = useState(() => soundEngine.enabled);

  useEffect(() => {
    onDrawerToggle(drawerOpen);
  }, [drawerOpen, onDrawerToggle]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const sy = window.scrollY;
      setScrolled(sy > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.max(0, Math.min(1, sy / max)) : 0;
      setFilledBlocks(Math.max(1, Math.round(pct * SEGMENTS)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const handleNav = (id: string) => {
    soundEngine.playTick(680);
    setDrawerOpen(false);
    onDrawerToggle(false);
    requestAnimationFrame(() => onJump(id));
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEngine.setEnabled(next);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b transition-all duration-300 ${
          scrolled ? "hud-header-pinned border-accent/45" : "border-transparent bg-black/20"
        }`}
      >
        {/* Segmented block scroll progress bar */}
        <div
          aria-hidden="true"
          className="grid h-[5px] w-full gap-[2px] border-b border-rule/70 bg-black px-[2px] py-[1px]"
          style={{ gridTemplateColumns: `repeat(${SEGMENTS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span
              key={i}
              className="vibe-sync block h-full"
              style={{
                backgroundColor:
                  i < filledBlocks ? "var(--accent)" : "rgba(var(--accent-rgb), 0.14)",
              }}
            />
          ))}
        </div>

        <div className="mx-auto flex h-16 max-w-[1260px] items-center gap-3 px-4 sm:px-6 lg:px-10">
          {/* ZRWLX Wordmark */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playTick();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label="Mohamed Zerouali, back to top"
            className="vibe-sync group relative inline-flex h-10 shrink-0 cursor-pointer items-center border border-accent/60 bg-black px-3 font-display text-lg font-extrabold tracking-[0.14em] text-ink hover:border-accent"
          >
            <span>ZR</span>
            <span className="vibe-sync text-accent">W</span>
            <span>LX</span>
            <span
              aria-hidden="true"
              className="vibe-sync absolute -top-[3px] left-1/2 h-[3px] w-3 -translate-x-1/2 bg-accent"
            />
          </button>

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(item.id);
                  }}
                  aria-current={active ? "true" : undefined}
                  className={`relative inline-flex h-11 items-center px-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                    active ? "text-ink" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {copy[item.key]}
                  {active && (
                    <motion.span
                      layoutId="hud-nav-active"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="vibe-sync absolute inset-x-3 bottom-1 h-[2px] bg-accent"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right HUD Controls */}
          <div className="ml-auto flex items-center gap-2">
            <AnimatePresence>
              {vibe.sourceTitle && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="hidden items-center gap-2 border border-accent/60 bg-black px-2.5 py-1.5 font-mono text-[11px] text-ink xl:inline-flex"
                >
                  <span
                    className="h-2 w-2 shrink-0"
                    style={{ backgroundColor: vibe.accent }}
                    aria-hidden="true"
                  />
                  <span className="max-w-[140px] truncate uppercase tracking-wider">
                    {vibe.sourceTitle}
                  </span>
                  <button
                    type="button"
                    onClick={onResetVibe}
                    aria-label={copy.archResetVibe}
                    title={copy.archResetVibe}
                    className="cursor-pointer text-ink-muted hover:text-accent"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleNav("contact");
              }}
              className="vibe-sync hidden h-10 items-center border border-accent/80 px-4 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-accent hover:bg-accent hover:text-on-accent md:inline-flex"
            >
              {copy.ctaHeader}
            </a>

            <div role="group" aria-label="Base color theme" className="hidden border border-rule bg-black sm:inline-flex">
              {BASE_VIBE_PRESETS.map((preset) => {
                const selected = basePresetId === preset.id && !vibe.sourceTitle;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={preset.label}
                    title={preset.label}
                    aria-pressed={selected}
                    onClick={() => {
                      soundEngine.playTick(620);
                      onSelectPreset(preset.id);
                    }}
                    className={`grid h-10 w-8 cursor-pointer place-items-center border-r border-rule last:border-r-0 transition-colors ${
                      selected ? "bg-panel" : "hover:bg-panel/70"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 transition-transform ${
                        selected ? "scale-125 ring-1 ring-white/90 ring-offset-2 ring-offset-black" : "opacity-75"
                      }`}
                      style={{ backgroundColor: preset.accent }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            <div role="group" aria-label="Language" className="inline-flex border border-rule bg-black">
              {(["en", "fr"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  lang={code}
                  aria-pressed={lang === code}
                  onClick={() => {
                    soundEngine.playTick(580);
                    onLangChange(code);
                  }}
                  className={`vibe-sync h-10 w-10 cursor-pointer font-mono text-xs font-semibold uppercase tracking-wider first:border-r first:border-rule ${
                    lang === code ? "bg-accent text-on-accent" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playGlitch();
                onPingMonster();
              }}
              aria-label="Summon bug & catch"
              title="Summon bug & catch"
              className="vibe-sync grid h-10 w-10 cursor-pointer place-items-center border border-rule bg-black text-accent hover:border-accent"
            >
              <Flame className="h-4 w-4" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Mute HUD sound" : "Enable HUD sound"}
              title={soundOn ? "Mute sound" : "Enable sound"}
              className={`vibe-sync grid h-10 w-10 cursor-pointer place-items-center border bg-black ${
                soundOn
                  ? "border-accent text-accent"
                  : "border-rule text-ink-muted hover:border-accent hover:text-ink"
              }`}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-label={copy.menuOpen}
              className="grid h-10 w-10 cursor-pointer place-items-center border border-rule bg-black text-ink hover:border-accent lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/88"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="absolute inset-y-0 right-0 flex w-[min(320px,86vw)] flex-col border-l border-rule bg-black"
            >
              <div className="flex h-16 items-center justify-between border-b border-rule px-4">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                  // NAV_INDEX
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label={copy.menuClose}
                  className="grid h-11 w-11 cursor-pointer place-items-center border border-rule text-ink hover:border-accent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav aria-label="Mobile Navigation" className="flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(item.id);
                    }}
                    className="flex h-14 items-center justify-between border-b border-rule px-5 font-display text-lg font-bold uppercase tracking-wider text-ink transition-colors hover:bg-panel hover:text-accent"
                  >
                    <span>{copy[item.key]}</span>
                    <span className="font-mono text-xs text-accent">{item.num}</span>
                  </a>
                ))}
              </nav>
              <div className="mt-auto border-t border-rule p-5">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  // THEME_SWATCH
                </p>
                <div role="group" aria-label="Base color theme" className="grid grid-cols-3 gap-2">
                  {BASE_VIBE_PRESETS.map((preset) => {
                    const selected = basePresetId === preset.id && !vibe.sourceTitle;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          soundEngine.playTick(620);
                          onSelectPreset(preset.id);
                        }}
                        className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 border px-2 font-mono text-[10px] uppercase tracking-wider ${
                          selected
                            ? "border-accent text-ink bg-panel"
                            : "border-rule text-ink-muted hover:border-rule-strong"
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0"
                          style={{ backgroundColor: preset.accent }}
                          aria-hidden="true"
                        />
                        <span>{preset.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
