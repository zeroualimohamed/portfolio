import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import type { CopyDict } from "../data/i18n";
import { PROFILE_LINKS } from "../data/profile";
import { ScrambleText } from "./ScrambleText";
import { soundEngine } from "../lib/sound";

interface ContactSectionProps {
  copy: CopyDict;
  onHeartPulse: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIKE_COUNT_KEY = "zrwlx3-likes-cache";
const LIKED_FLAG_KEY = "zrwlx3-liked-v1";
const LIKE_API_BASE = "https://abacus.jasoncameron.dev";
const LIKE_NAMESPACE = "zerouali.me";
const LIKE_COUNTER_NAME = "likes";

const HEART_MASK = [
  "  .###.   .###.  ",
  " ####### ####### ",
  "#################",
  " ############### ",
  "  #############  ",
  "    #########    ",
  "      #####      ",
  "        #        ",
];

const HEART_GLYPHS = "+:/*%0[{$]}&=";

export function ContactSection({ copy, onHeartPulse }: ContactSectionProps) {
  const [likes, setLikes] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(LIKE_COUNT_KEY));
      return Number.isFinite(saved) && saved >= 0 ? saved : 0;
    } catch {
      return 0;
    }
  });
  const [hasLiked, setHasLiked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LIKED_FLAG_KEY) === "1";
    } catch {
      return false;
    }
  });
  const likingRef = useRef(false);
  const [heartPop, setHeartPop] = useState(0);
  const [heartFrame, setHeartFrame] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [status, setStatus] = useState<{ text: string; kind: "ok" | "err" | "" }>({
    text: "",
    kind: "",
  });
  const [sending, setSending] = useState(false);

  // Load global persistent like count on mount
  useEffect(() => {
    if (window.location.protocol === "file:") return;
    let cancelled = false;
    fetch(`${LIKE_API_BASE}/get/${LIKE_NAMESPACE}/${LIKE_COUNTER_NAME}`)
      .then(async (res) => {
        if (res.status === 404) return { value: 0 };
        if (!res.ok) return null;
        return (await res.json()) as { value?: number };
      })
      .then((data) => {
        if (cancelled || !data || typeof data.value !== "number") return;
        setLikes(data.value);
        try {
          localStorage.setItem(LIKE_COUNT_KEY, String(data.value));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* keep cached count */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Shimmering animated ASCII glyph heart
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setHeartFrame((f) => f + 1), 160);
    return () => window.clearInterval(id);
  }, []);

  const renderedHeart = HEART_MASK.map((row, r) =>
    row
      .split("")
      .map((ch, c) =>
        ch === " " ? " " : HEART_GLYPHS[(r * 7 + c * 3 + heartFrame) % HEART_GLYPHS.length],
      )
      .join(""),
  ).join("\n");

  const tapHeart = () => {
    if (hasLiked || likingRef.current) return;
    likingRef.current = true;
    setHasLiked(true);
    try {
      localStorage.setItem(LIKED_FLAG_KEY, "1");
    } catch {
      /* ignore */
    }

    soundEngine.playHeart();
    setLikes((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(LIKE_COUNT_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setHeartPop((p) => p + 1);
    onHeartPulse();

    if (window.location.protocol !== "file:") {
      fetch(`${LIKE_API_BASE}/hit/${LIKE_NAMESPACE}/${LIKE_COUNTER_NAME}`)
        .then((res) => (res.ok ? (res.json() as Promise<{ value?: number }>) : null))
        .then((data) => {
          if (data && typeof data.value === "number") {
            setLikes(data.value);
            try {
              localStorage.setItem(LIKE_COUNT_KEY, String(data.value));
            } catch {
              /* ignore */
            }
          }
        })
        .catch(() => {
          /* keep optimistic count */
        })
        .finally(() => {
          likingRef.current = false;
        });
    } else {
      likingRef.current = false;
    }
  };

  const validateField = (field: "name" | "email" | "message", val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return copy.errRequired;
    if (field === "email" && !EMAIL_RE.test(trimmed)) return copy.errEmail;
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrs = {
      name: validateField("name", name),
      email: validateField("email", email),
      message: validateField("message", message),
    };
    setErrors(nextErrs);

    if (nextErrs.name || nextErrs.email || nextErrs.message) {
      setStatus({ text: copy.fFix, kind: "err" });
      return;
    }

    if (honey.trim()) {
      setStatus({ text: copy.fSent, kind: "ok" });
      return;
    }

    const triggerMailto = () => {
      if (!PROFILE_LINKS.email) return false;
      const body = `${message.trim()}\n\n${name.trim()} <${email.trim()}>`;
      window.location.href = `mailto:${PROFILE_LINKS.email}?subject=${encodeURIComponent(
        `Portfolio message from ${name.trim()}`,
      )}&body=${encodeURIComponent(body)}`;
      setStatus({ text: copy.fMailto, kind: "ok" });
      return true;
    };

    if (PROFILE_LINKS.formEndpoint && window.location.protocol !== "file:") {
      setSending(true);
      setStatus({ text: copy.fSending, kind: "" });
      try {
        const res = await fetch(PROFILE_LINKS.formEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            _subject: `Portfolio message from ${name.trim()}`,
            _template: "table",
            _captcha: "false",
            _honey: honey,
          }),
        });
        const data = (await res.json().catch(() => null)) as
          | { success?: boolean | string; message?: string }
          | null;
        if (!res.ok || (data && data.success === false) || (data && data.success === "false")) {
          if (data?.message && /activat/i.test(data.message)) {
            setStatus({ text: data.message, kind: "err" });
            return;
          }
          throw new Error(data?.message || "Submit failed");
        }
        setName("");
        setEmail("");
        setMessage("");
        setStatus({ text: copy.fSent, kind: "ok" });
      } catch {
        if (!triggerMailto()) {
          setStatus({ text: copy.fFail, kind: "err" });
        }
      } finally {
        setSending(false);
      }
      return;
    }

    if (triggerMailto()) return;

    setStatus({ text: copy.fReadyNote, kind: "ok" });
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-20">
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
            06 // {copy.contactKicker}
          </p>
          <h2
            id="contact-title"
            className="mt-3 font-display text-[clamp(2rem,1.4rem+2.5vw,3.4rem)] font-bold leading-tight text-ink"
          >
            <ScrambleText text={copy.contactTitle} />
          </h2>
          <p className="mt-2 max-w-[66ch] text-sm text-ink-muted sm:text-base">{copy.contactSub}</p>
        </motion.header>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left: Hairline contact rows + shimmering > like.exe ASCII Heart */}
          <div className="grid min-w-0 gap-10">
            <div className="border-t border-rule">
              <a
                href={PROFILE_LINKS.email ? `mailto:${PROFILE_LINKS.email}` : "#name"}
                className="contact-row-glow group flex flex-wrap items-center justify-between gap-2 border-b border-rule px-2 py-5"
              >
                <span className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <span className="vibe-sync grid h-10 w-10 shrink-0 place-items-center border border-rule text-accent group-hover:border-accent">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span className="font-display text-xl font-bold text-ink transition-colors group-hover:text-accent sm:text-3xl">
                    {copy.ctEmail}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-ink-muted">
                  <span className="max-w-[210px] truncate sm:max-w-none">{PROFILE_LINKS.email || copy.ctEmailSub}</span>
                  <ArrowUpRight className="vibe-sync h-5 w-5 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>

              <a
                href={PROFILE_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row-glow group flex flex-wrap items-center justify-between gap-2 border-b border-rule px-2 py-5"
              >
                <span className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <span className="vibe-sync grid h-10 w-10 shrink-0 place-items-center border border-rule font-mono text-xs font-bold text-accent group-hover:border-accent">
                    in
                  </span>
                  <span className="font-display text-xl font-bold text-ink transition-colors group-hover:text-accent sm:text-3xl">
                    {copy.ctLi}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-ink-muted">
                  <span className="max-w-[210px] truncate sm:max-w-none">
                    {PROFILE_LINKS.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </span>
                  <ArrowUpRight className="vibe-sync h-5 w-5 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>

              <a
                href={PROFILE_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row-glow group flex flex-wrap items-center justify-between gap-2 border-b border-rule px-2 py-5"
              >
                <span className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <span className="vibe-sync grid h-10 w-10 shrink-0 place-items-center border border-rule font-mono text-xs font-bold text-accent group-hover:border-accent">
                    &lt;/&gt;
                  </span>
                  <span className="font-display text-xl font-bold text-ink transition-colors group-hover:text-accent sm:text-3xl">
                    {copy.ctGh}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-ink-muted">
                  <span className="max-w-[210px] truncate sm:max-w-none">
                    {PROFILE_LINKS.github.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </span>
                  <ArrowUpRight className="vibe-sync h-5 w-5 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </div>

            {/* Shimmering > like.exe ASCII Heart Widget */}
            <div className="flex flex-col items-start gap-5 border-t border-rule pt-6 sm:flex-row sm:items-center">
              <motion.button
                key={heartPop}
                type="button"
                onClick={tapHeart}
                disabled={hasLiked}
                aria-pressed={hasLiked}
                initial={{ scale: 0.94 }}
                animate={{ scale: [0.94, 1.09, 1] }}
                transition={{ duration: 0.28 }}
                aria-label={hasLiked ? "Already liked" : "Send a like"}
                className={`vibe-sync bg-transparent p-1 text-left font-mono text-[10px] leading-[1.15] text-accent drop-shadow-[0_0_12px_rgba(var(--accent-rgb),0.45)] ${
                  hasLiked ? "cursor-default opacity-85" : "cursor-pointer hover:opacity-90"
                }`}
              >
                <pre className="m-0">{renderedHeart}</pre>
                <span className="mt-2 block font-display text-lg font-bold text-accent">
                  {likes}{" "}
                  <span className="font-mono text-xs font-normal text-ink-muted">
                    {copy.likeCountLabel}
                    {hasLiked ? " · +1" : ""}
                  </span>
                </span>
              </motion.button>

              <div className="grid gap-1">
                <span className="vibe-sync font-mono text-xs font-semibold text-accent">
                  {copy.likeTitle}
                </span>
                <p className="max-w-[36ch] text-xs leading-relaxed text-ink-muted">
                  {copy.likeDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Corner-bracketed 3-field Contact Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bracket-box grid min-w-0 gap-5 border border-rule bg-black/90 p-6 sm:p-8"
          >
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-ink">
              {copy.formTitle}
            </h3>

            <input
              type="text"
              name="_honey"
              value={honey}
              onChange={(e) => setHoney(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="sr-only"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="name"
                  className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted"
                >
                  {copy.fName}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  placeholder={copy.phName}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby="name-err"
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name)
                      setErrors((p) => ({ ...p, name: validateField("name", e.target.value) }));
                  }}
                  onBlur={() => setErrors((p) => ({ ...p, name: validateField("name", name) }))}
                  className={`min-h-11 w-full border bg-black px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent ${
                    errors.name ? "border-red-500" : "border-rule-strong"
                  }`}
                />
                <span id="name-err" aria-live="polite" className="min-h-[1.1em] font-mono text-xs text-red-400">
                  {errors.name ?? ""}
                </span>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="email"
                  className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted"
                >
                  {copy.fEmail}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  placeholder={copy.phEmail}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby="email-err"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((p) => ({ ...p, email: validateField("email", e.target.value) }));
                  }}
                  onBlur={() => setErrors((p) => ({ ...p, email: validateField("email", email) }))}
                  className={`min-h-11 w-full border bg-black px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent ${
                    errors.email ? "border-red-500" : "border-rule-strong"
                  }`}
                />
                <span id="email-err" aria-live="polite" className="min-h-[1.1em] font-mono text-xs text-red-400">
                  {errors.email ?? ""}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="message"
                className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted"
              >
                {copy.fMessage}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={message}
                placeholder={copy.phMessage}
                aria-invalid={Boolean(errors.message)}
                aria-describedby="message-err"
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message)
                    setErrors((p) => ({ ...p, message: validateField("message", e.target.value) }));
                }}
                onBlur={() => setErrors((p) => ({ ...p, message: validateField("message", message) }))}
                className={`min-h-[132px] w-full resize-y border bg-black px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent ${
                  errors.message ? "border-red-500" : "border-rule-strong"
                }`}
              />
              <span id="message-err" aria-live="polite" className="min-h-[1.1em] font-mono text-xs text-red-400">
                {errors.message ?? ""}
              </span>
            </div>

            <div>
              <button
                type="submit"
                disabled={sending}
                className="vibe-sync group inline-flex min-h-11 cursor-pointer items-center gap-2 border border-accent bg-accent px-6 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-on-accent hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{sending ? copy.fSending : copy.fSend}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <p
              role="status"
              aria-live="polite"
              className={`min-h-[1.4em] font-mono text-xs ${
                status.kind === "ok"
                  ? "text-accent"
                  : status.kind === "err"
                    ? "text-red-400"
                    : "text-ink-muted"
              }`}
            >
              {status.text}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
