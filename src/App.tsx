import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { GALLERY_DATA, type Artwork } from "./data/gallery";
import { useLang } from "./hooks/useLang";
import { useLenis } from "./hooks/useLenis";
import { useVibe } from "./hooks/useVibe";
import { AmbientGlyphField } from "./components/AmbientGlyphField";
import { BugHunterOverlay } from "./components/BugHunterOverlay";
import { HudHeader } from "./components/HudHeader";
import { HeroSection } from "./components/HeroSection";
import { EducationSection } from "./components/EducationSection";
import { StackSection } from "./components/StackSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { ArchiveSection } from "./components/ArchiveSection";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";
import { Lightbox } from "./components/Lightbox";

export default function App() {
  const { lang, setLang, copy } = useLang();
  const { vibe, basePresetId, selectBasePreset, previewArtworkVibe, lockArtworkVibe, resetVibe } = useVibe();

  const [activeSection, setActiveSection] = useState("education");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pingSignal, setPingSignal] = useState(0);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [lightboxState, setLightboxState] = useState<{
    works: Artwork[];
    index: number | null;
  }>({ works: GALLERY_DATA.works, index: null });

  const lenisRef = useLenis(lightboxState.index !== null || drawerOpen);

  const setSafeHash = useCallback((hash: string) => {
    try {
      window.history.replaceState(null, "", hash);
    } catch {
      /* file:// compatibility */
    }
  }, []);

  const jumpSection = useCallback(
    (id: string) => {
      setDrawerOpen(false);
      const target = document.getElementById(id);
      if (!target) return;
      if (lenisRef.current) {
        lenisRef.current.start();
        lenisRef.current.scrollTo(target, { offset: -74, force: true });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setSafeHash(`#${id}`);
    },
    [lenisRef, setSafeHash],
  );

  // Scrollspy & floating back-to-top button
  useEffect(() => {
    const ids = ["education", "stack", "projects", "archive", "about", "contact"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActiveSection(en.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));

    const onScroll = () => setShowTopBtn(window.scrollY > 520);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Live ambient wash + drifting ASCII symbols synced with hovered 2D/3D artwork vibe */}
      <div className="vibe-wash" aria-hidden="true" />
      <AmbientGlyphField vibeRgb={vibe.rgb} />
      <BugHunterOverlay triggerSignal={pingSignal} vibeRgb={vibe.rgb} />
      <div className="crt-grain" aria-hidden="true" />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:font-semibold focus:text-on-accent"
      >
        {copy.skip}
      </a>

      <HudHeader
        activeSection={activeSection}
        onJump={jumpSection}
        lang={lang}
        onLangChange={setLang}
        copy={copy}
        vibe={vibe}
        basePresetId={basePresetId}
        onSelectPreset={selectBasePreset}
        onResetVibe={resetVibe}
        onPingMonster={() => setPingSignal((s) => s + 1)}
        onDrawerToggle={setDrawerOpen}
      />

      <main id="main" className="relative z-10 overflow-x-clip">
        {/* Direct post-entrance Hero + ASCII Creature (no BIOS/entrance gate!) */}
        <HeroSection
          copy={copy}
          vibeRgb={vibe.rgb}
          pingSignal={pingSignal}
          onJump={jumpSection}
        />

        {/* 01: Education & Degree (HIGH UP: EMSI Fès 4IIRF + FP Taza Licence Earned + Bac) */}
        <EducationSection copy={copy} />

        {/* 02: Tech Stack + Live ASCII Hands Typing on PC Workstation */}
        <StackSection copy={copy} vibeRgb={vibe.rgb} />

        {/* 03: Projects (Active Machine Learning Build + Upcoming Personal DB/Software Projects) */}
        <ProjectsSection copy={copy} vibeRgb={vibe.rgb} />

        {/* 04: 2D & 3D Breach Archive (Stacked Deck + 21 Portals + Live Artwork Vibe Takeover) */}
        <ArchiveSection
          copy={copy}
          vibe={vibe}
          onPreviewVibe={previewArtworkVibe}
          onLockVibe={lockArtworkVibe}
          onResetVibe={resetVibe}
          onInspect={(works, index) => setLightboxState({ works, index })}
        />

        {/* 05: About + Off the Code */}
        <AboutSection copy={copy} />

        {/* 06: Contact + > like.exe ASCII Heart */}
        <ContactSection
          copy={copy}
          onHeartPulse={() => setPingSignal((s) => s + 1)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-rule bg-void/90 py-10">
        <div className="mx-auto flex max-w-[1260px] flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <span className="vibe-sync border border-accent/60 bg-panel px-2.5 py-1 font-display text-sm font-bold tracking-[0.12em] text-ink">
              ZR<span className="text-accent">W</span>LX
            </span>
            <p className="font-mono text-xs text-ink-muted">&copy; 2026 {copy.ftRights}</p>
          </div>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="vibe-sync cursor-pointer font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-accent"
          >
            {copy.ftTop} &uarr;
          </button>
        </div>
      </footer>

      {/* Fixed Bottom-Right Back-to-Top Square Button */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={copy.ftTop}
            className="vibe-sync fixed right-5 bottom-5 z-30 grid h-11 w-11 cursor-pointer place-items-center border border-accent bg-void/90 text-accent hover:bg-accent hover:text-on-accent"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Instant Thumb-First Fullscreen Lightbox */}
      <Lightbox
        works={lightboxState.works}
        index={lightboxState.index}
        onIndexChange={(next) => setLightboxState((s) => ({ ...s, index: next }))}
        onClose={() => setLightboxState((s) => ({ ...s, index: null }))}
        onSyncVibe={(work) => lockArtworkVibe(work)}
        copy={copy}
      />
    </div>
  );
}
