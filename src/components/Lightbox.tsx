import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import type { Artwork } from "../data/gallery";
import type { CopyDict } from "../data/i18n";
import { decodeImage, pad2, preloadImage } from "../lib/preload";

interface LightboxProps {
  works: Artwork[];
  index: number | null;
  onIndexChange: (next: number) => void;
  onClose: () => void;
  onSyncVibe: (work: Artwork) => void;
  copy: CopyDict;
}

export function Lightbox({
  works,
  index,
  onIndexChange,
  onClose,
  onSyncVibe,
  copy,
}: LightboxProps) {
  const isOpen = index !== null && works.length > 0;
  const safeIdx = isOpen ? ((index % works.length) + works.length) % works.length : 0;
  const work = isOpen ? works[safeIdx] : null;

  const [fullSrc, setFullSrc] = useState("");
  const [fullReady, setFullReady] = useState(false);
  const [loadingSlow, setLoadingSlow] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const step = useCallback(
    (delta: number) => {
      if (!works.length) return;
      onIndexChange((safeIdx + delta + works.length) % works.length);
    },
    [works.length, safeIdx, onIndexChange],
  );

  useEffect(() => {
    if (!work) return;
    let active = true;
    onSyncVibe(work);
    setFullReady(false);
    setZoomed(false);
    setLoadingSlow(false);

    const slowTimer = window.setTimeout(() => {
      if (active) setLoadingSlow(true);
    }, 90);

    decodeImage(work.full)
      .catch(() => decodeImage(work.fullJpg))
      .then((resolved) => {
        if (!active) return;
        window.clearTimeout(slowTimer);
        setLoadingSlow(false);
        setFullSrc(resolved);
        requestAnimationFrame(() => {
          if (active) setFullReady(true);
        });
      })
      .catch(() => {
        if (active) {
          window.clearTimeout(slowTimer);
          setLoadingSlow(false);
        }
      });

    if (works.length > 1) {
      preloadImage(works[(safeIdx + 1) % works.length].full);
      preloadImage(works[(safeIdx - 1 + works.length) % works.length].full);
    }

    return () => {
      active = false;
      window.clearTimeout(slowTimer);
    };
  }, [work, safeIdx, works, onSyncVibe]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "z" || e.key === "Z") setZoomed((z) => !z);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, step]);

  useEffect(() => {
    const el = stageRef.current;
    if (zoomed && el) {
      requestAnimationFrame(() => {
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
      });
    }
  }, [zoomed]);

  return (
    <AnimatePresence>
      {isOpen && work && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={copy.lbDialog}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#040506]/96 text-ink"
        >
          <div className="flex items-center gap-3 border-b border-rule px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0"
                  style={{ backgroundColor: work.vibe.accent }}
                  aria-hidden="true"
                />
                <span className="truncate font-display text-lg font-bold text-ink">
                  {work.title}
                </span>
              </div>
              <div className="truncate font-mono text-xs text-ink-muted">
                {pad2(safeIdx + 1)} / {pad2(works.length)} · {work.series} · {work.origWidth}
                &times;{work.origHeight} · {work.vibe.mood}
              </div>
            </div>

            <button
              type="button"
              aria-pressed={zoomed}
              onClick={() => setZoomed((z) => !z)}
              className={`inline-flex h-11 cursor-pointer items-center gap-2 border px-4 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                zoomed
                  ? "border-accent bg-accent text-on-accent"
                  : "border-rule-strong text-ink hover:border-accent hover:text-accent"
              }`}
            >
              {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              <span className="hidden sm:inline">{zoomed ? copy.lbFit : copy.lbZoom}</span>
            </button>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="inline-flex h-11 cursor-pointer items-center gap-1.5 border border-rule-strong px-4 font-mono text-xs font-semibold uppercase tracking-wider text-ink hover:border-accent hover:text-accent"
            >
              <X className="h-4 w-4" />
              <span>{copy.lbClose}</span>
            </button>
          </div>

          <div
            ref={stageRef}
            onClick={(e) => {
              if (zoomed) setZoomed(false);
              else if (e.target === stageRef.current) onClose();
            }}
            onTouchStart={(e) => {
              touchStartX.current = zoomed ? null : e.changedTouches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
              touchStartX.current = null;
            }}
            className={`relative min-h-0 flex-1 ${
              zoomed
                ? "grid cursor-zoom-out place-items-start overflow-auto p-0"
                : "grid place-items-center overflow-hidden p-4 sm:p-8"
            }`}
          >
            {!zoomed && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label={copy.lbPrev}
                  className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center border border-rule-strong bg-void/85 text-ink hover:border-accent hover:text-accent"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label={copy.lbNext}
                  className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center border border-rule-strong bg-void/85 text-ink hover:border-accent hover:text-accent"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div
              style={{
                aspectRatio: `${work.fullWidth} / ${work.fullHeight}`,
                width: zoomed
                  ? `${work.fullWidth}px`
                  : `min(100%, calc((100vh - 150px) * ${(work.fullWidth / work.fullHeight).toFixed(5)}))`,
              }}
              className="relative flex-none"
            >
              <img
                src={work.thumb}
                alt=""
                decoding="async"
                className="absolute inset-0 h-full w-full object-contain"
              />
              <img
                id="lb-full"
                src={fullSrc || work.thumb}
                alt={`${work.title}, ${work.series}`}
                decoding="async"
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${
                  fullReady ? "is-ready opacity-100" : "opacity-0"
                }`}
              />
              {loadingSlow && (
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 0.9 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute inset-x-0 top-0 h-[2px] origin-left bg-accent"
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
