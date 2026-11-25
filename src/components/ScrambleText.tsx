import { useCallback, useEffect, useRef, useState } from "react";

const GLYPHS = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ#%&$=+*<>";

interface ScrambleTextProps {
  text: string;
  className?: string;
}

/**
 * 3-part terminal scramble wave (decoded left + glowing accent frontier + dim ghost remainder).
 * Clamps rAF progress safely >= 0 and locks dimensions via an invisible sizer so hovering never jumps or duplicates text.
 */
export function ScrambleText({ text, className = "" }: ScrambleTextProps) {
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const [revealed, setRevealed] = useState(text.length);
  const [headNoise, setHeadNoise] = useState("");
  const [active, setActive] = useState(false);

  const rafRef = useRef<number>(0);
  const runIdRef = useRef<number>(0);
  const hasPlayedRef = useRef(false);
  const activeRef = useRef(false);

  const runScramble = useCallback((target: string) => {
    const myRun = ++runIdRef.current;
    cancelAnimationFrame(rafRef.current);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      activeRef.current = false;
      setRevealed(target.length);
      setHeadNoise("");
      setActive(false);
      return;
    }

    activeRef.current = true;
    setRevealed(0);
    setHeadNoise("");
    setActive(true);

    const start = performance.now();
    const duration = Math.min(680, Math.max(280, target.length * 14));

    const tick = (now: number) => {
      if (runIdRef.current !== myRun) return;
      const progress = Math.max(0, Math.min(1, (now - start) / duration));
      if (progress >= 1) {
        activeRef.current = false;
        setRevealed(target.length);
        setHeadNoise("");
        setActive(false);
        return;
      }

      const rev = Math.max(0, Math.min(target.length, Math.floor(progress * target.length)));
      const step = Math.floor(Math.max(0, now) / 38);
      const headLen = Math.max(0, Math.min(3, target.length - rev));
      let head = "";
      for (let i = 0; i < headLen; i++) {
        const ch = target[rev + i];
        head += ch === " " ? " " : GLYPHS[(rev * 7 + i * 13 + step) % GLYPHS.length];
      }

      setRevealed(rev);
      setHeadNoise(head);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    if (hasPlayedRef.current) {
      runScramble(text);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasPlayedRef.current) {
          hasPlayedRef.current = true;
          runScramble(text);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
    };
  }, [text, runScramble]);

  useEffect(() => {
    return () => {
      runIdRef.current++;
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const safeRev = Math.max(0, Math.min(text.length, revealed));
  const headLen = active ? Math.max(0, Math.min(headNoise.length, text.length - safeRev)) : 0;
  const shownPart = text.slice(0, safeRev);
  const headPart = headNoise.slice(0, headLen);
  const ghostPart = text.slice(safeRev + headLen);

  return (
    <span
      ref={hostRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => {
        if (activeRef.current) return;
        hasPlayedRef.current = true;
        runScramble(text);
      }}
    >
      {active ? (
        <>
          <span className="invisible select-none" aria-hidden="true">
            {text}
          </span>
          <span className="pointer-events-none absolute inset-0" aria-hidden="true">
            <span>{shownPart}</span>
            {headLen > 0 && <span className="vibe-sync text-accent">{headPart}</span>}
            {ghostPart.length > 0 && <span className="opacity-[0.12]">{ghostPart}</span>}
          </span>
        </>
      ) : (
        text
      )}
    </span>
  );
}
