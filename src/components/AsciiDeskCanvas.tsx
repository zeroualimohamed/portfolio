import { useEffect, useRef } from "react";
import { soundEngine } from "../lib/sound";

interface AsciiDeskCanvasProps {
  vibeRgb: [number, number, number];
  activeSkill: string | null;
}

const NOISE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%&$?+*/=[]{}<>";

interface KeyDef {
  text: string;
  key: string;
  rowIdx: number;
  gridRow: number;
  colStart: number;
  colCenter: number;
  hand: "left" | "right";
  finger: number; // 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
}

const RAW_KEY_ROWS: { gridRow: number; startCol: number; keys: { text: string; key: string }[] }[] = [
  {
    gridRow: 23,
    startCol: 10,
    keys: [
      { text: "[']", key: "`" },
      { text: "[1]", key: "1" },
      { text: "[2]", key: "2" },
      { text: "[3]", key: "3" },
      { text: "[4]", key: "4" },
      { text: "[5]", key: "5" },
      { text: "[6]", key: "6" },
      { text: "[7]", key: "7" },
      { text: "[8]", key: "8" },
      { text: "[9]", key: "9" },
      { text: "[0]", key: "0" },
      { text: "[-]", key: "-" },
      { text: "[=]", key: "=" },
      { text: "[<-]", key: "BACKSPACE" },
    ],
  },
  {
    gridRow: 25,
    startCol: 7,
    keys: [
      { text: "[TAB]", key: "TAB" },
      { text: "[Q]", key: "Q" },
      { text: "[W]", key: "W" },
      { text: "[E]", key: "E" },
      { text: "[R]", key: "R" },
      { text: "[T]", key: "T" },
      { text: "[Y]", key: "Y" },
      { text: "[U]", key: "U" },
      { text: "[I]", key: "I" },
      { text: "[O]", key: "O" },
      { text: "[P]", key: "P" },
      { text: "[[]", key: "[" },
      { text: "[]]", key: "]" },
      { text: "[\\]", key: "\\" },
    ],
  },
  {
    gridRow: 27,
    startCol: 6,
    keys: [
      { text: "[CAPS]", key: "CAPS" },
      { text: "[A]", key: "A" },
      { text: "[S]", key: "S" },
      { text: "[D]", key: "D" },
      { text: "[F]", key: "F" },
      { text: "[G]", key: "G" },
      { text: "[H]", key: "H" },
      { text: "[J]", key: "J" },
      { text: "[K]", key: "K" },
      { text: "[L]", key: "L" },
      { text: "[;]", key: ";" },
      { text: "[']", key: "'" },
      { text: "[ENTER]", key: "ENTER" },
    ],
  },
  {
    gridRow: 29,
    startCol: 5,
    keys: [
      { text: "[SHIFT]", key: "SHIFT" },
      { text: "[Z]", key: "Z" },
      { text: "[X]", key: "X" },
      { text: "[C]", key: "C" },
      { text: "[V]", key: "V" },
      { text: "[B]", key: "B" },
      { text: "[N]", key: "N" },
      { text: "[M]", key: "M" },
      { text: "[,]", key: "," },
      { text: "[.]", key: "." },
      { text: "[/]", key: "/" },
      { text: "[SHIFT]", key: "SHIFT" },
    ],
  },
  {
    gridRow: 31,
    startCol: 6,
    keys: [
      { text: "[CTRL]", key: "CTRL" },
      { text: "[ALT]", key: "ALT" },
      { text: "[     SPACE     ]", key: " " },
      { text: "[ALT]", key: "ALT" },
      { text: "[CTRL]", key: "CTRL" },
    ],
  },
];

function buildKeys(): KeyDef[] {
  const out: KeyDef[] = [];
  RAW_KEY_ROWS.forEach((rowObj, rowIdx) => {
    let col = rowObj.startCol;
    rowObj.keys.forEach((k) => {
      const colCenter = col + k.text.length * 0.5;
      const hand: "left" | "right" = colCenter < 33 ? "left" : "right";
      let finger = 2;
      if (k.key === " ") finger = 0;
      else if (hand === "left") {
        finger = colCenter > 26 ? 1 : colCenter > 21 ? 2 : colCenter > 15 ? 3 : 4;
      } else {
        finger = colCenter < 40 ? 1 : colCenter < 45 ? 2 : colCenter < 51 ? 3 : 4;
      }
      out.push({
        text: k.text,
        key: k.key,
        rowIdx,
        gridRow: rowObj.gridRow,
        colStart: col,
        colCenter,
        hand,
        finger,
      });
      col += k.text.length + 1;
    });
  });
  return out;
}

const SNIPPETS: Record<string, { file: string; lang: string; lines: string[] }> = {
  default: {
    file: "ml_pipeline.py",
    lang: "PY",
    lines: [
      "import torch, pandas as pd",
      "from core import PortfolioModel",
      "",
      "# EMSI 4IIRF // ML + Cyber S2",
      "model = PortfolioModel(dim=512)",
      "model.train(epochs=40, lr=3e-4)",
      "metrics = model.eval(val_split=0.2)",
      "print(f'val_acc={metrics.acc:.3f}')",
    ],
  },
  databases: {
    file: "schema.sql",
    lang: "SQL",
    lines: [
      "CREATE TABLE students (",
      "  id SERIAL PRIMARY KEY,",
      "  track VARCHAR(32) NOT NULL,",
      "  school VARCHAR(64) DEFAULT 'EMSI'",
      ");",
      "-- 3NF verified & indexed",
      "SELECT track, COUNT(*) FROM students",
      "GROUP BY track ORDER BY 2 DESC;",
    ],
  },
  security: {
    file: "cyber_s2.sh",
    lang: "SH",
    lines: [
      "#!/usr/bin/env bash",
      "# EMSI Semester 2 // Cyber Audit",
      "nmap -sV -Pn 10.42.0.0/24",
      "openssl x509 -in cert.pem -noout",
      "ss -tulnp | awk '{print $1,$5}'",
      "echo '[OK] attack surface mapped'",
    ],
  },
  systems: {
    file: "solver.cpp",
    lang: "CPP",
    lines: [
      "#include <iostream>",
      "#include <vector>",
      "int main() {",
      "  // Low-level C / C++ / Java core",
      "  std::vector<int> nodes(1024);",
      "  return solve_graph(nodes);",
      "}",
    ],
  },
  visual: {
    file: "render.py",
    lang: "PY",
    lines: [
      "import bpy",
      "# Blender 3D + Photoshop Assets",
      "scene = bpy.context.scene",
      "scene.render.engine = 'CYCLES'",
      "scene.cycles.samples = 128",
      "bpy.ops.render.render(write_still=1)",
    ],
  },
};

function selectSnippetKey(skill: string | null): keyof typeof SNIPPETS {
  if (!skill) return "default";
  const s = skill.toLowerCase();
  if (s.includes("oracle") || s.includes("sql") || s.includes("relational") || s.includes("norm")) {
    return "databases";
  }
  if (s.includes("cyber") || s.includes("security") || s.includes("analysis")) {
    return "security";
  }
  if (s.includes("blender") || s.includes("photoshop")) {
    return "visual";
  }
  if (s.includes("c++") || s.includes("java") || s === "c" || s.includes("algo") || s.includes("php")) {
    return "systems";
  }
  return "default";
}

function gridHash(c: number, r: number): number {
  const s = Math.sin(c * 127.1 + r * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function sdCapsule(px: number, py: number, ax: number, ay: number, bx: number, by: number, rad: number): number {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay || 1)));
  return Math.hypot(pax - bax * h, pay - bay * h) - rad;
}

interface Hand2DState {
  cx: number;
  cy: number;
  restX: number;
  restY: number;
  tx: number;
  ty: number;
  strikeTimer: number;
  activeFinger: number;
}

/**
 * High-resolution sub-grid SDF (96x59 coords) with compact palm + 5 widely separated crisp fingers
 * so all 5 fingers (thumb + index + middle + ring + pinky) show clear multi-char dark gaps over rows 23..30.
 */
function evalHandSDF(cxSub: number, rySub: number, side: "left" | "right", h: Hand2DState): number {
  const dir = side === "left" ? 1 : -1;
  // Convert hand center (in 68x42 grid coords) into 1.45x finer sub-grid coords
  const px = cxSub;
  const py = rySub * 1.48;
  const hx = h.cx * 1.45;
  const hy = h.cy * 1.45 * 1.48;

  // Forearm sweeping down cleanly to bottom left/right corners
  const armEndX = hx - dir * 7.6;
  const armEndY = hy + 23.0;
  let d = sdCapsule(px, py, hx - dir * 1.0, hy + 4.2, armEndX, armEndY, 5.6);

  // Compact palm so finger roots remain distinctly separated
  const dPalm = sdCapsule(px, py, hx - dir * 3.0, hy + 1.2, hx + dir * 3.2, hy - 0.8, 3.8);
  d = Math.min(d, dPalm);

  // 1. Separated Thumb angled toward Spacebar
  const thumbPress = h.activeFinger === 0 ? h.strikeTimer * 1.8 : 0;
  const dThumb = sdCapsule(
    px,
    py,
    hx + dir * 6.0,
    hy + 0.8,
    hx + dir * (13.0 - thumbPress * 0.5),
    hy - (5.0 - thumbPress),
    1.55,
  );
  d = Math.min(d, dThumb);

  // 2..5: Four clearly separated typing fingers (index, middle, ring, pinky), ~5.2 sub-cols spacing!
  const fingerOffsets = [
    { idx: 1, bx: dir * 4.4, by: -3.2, tx: dir * 6.0, ty: -16.5, rad: 1.45 },
    { idx: 2, bx: dir * 0.4, by: -3.8, tx: dir * 0.4, ty: -18.8, rad: 1.48 },
    { idx: 3, bx: dir * -3.6, by: -3.2, tx: dir * -5.2, ty: -17.0, rad: 1.42 },
    { idx: 4, bx: dir * -7.6, by: -2.0, tx: dir * -10.4, ty: -12.6, rad: 1.3 },
  ];

  for (let i = 0; i < fingerOffsets.length; i++) {
    const f = fingerOffsets[i];
    const press = h.activeFinger === f.idx ? h.strikeTimer * 2.2 : 0;
    const df = sdCapsule(px, py, hx + f.bx, hy + f.by, hx + f.tx, hy + f.ty + press, f.rad);
    d = Math.min(d, df);
  }

  return d;
}

interface FloatingGlyph {
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

/**
 * Unified Single-Grid Monospace ASCII Workstation:
 * CRT monitor + live Vim code typing + Z R W L X bezel + perspective mechanical keyboard
 * + single-grid shaded organic typing hands occluding lower keys cleanly.
 */
export function AsciiDeskCanvas({ vibeRgb, activeSkill }: AsciiDeskCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRgbRef = useRef<[number, number, number]>(vibeRgb);
  const skillRef = useRef<string | null>(activeSkill);
  targetRgbRef.current = vibeRgb;

  const snippetRef = useRef<{
    file: string;
    lang: string;
    lines: string[];
    typedCount: number;
    pauseUntil: number;
  }>({
    file: SNIPPETS.default.file,
    lang: SNIPPETS.default.lang,
    lines: SNIPPETS.default.lines,
    typedCount: 115,
    pauseUntil: 0,
  });

  const triggerKeyRef = useRef<((char: string, fromUser?: boolean) => void) | null>(null);

  useEffect(() => {
    skillRef.current = activeSkill;
    const key = selectSnippetKey(activeSkill);
    const sn = SNIPPETS[key];
    snippetRef.current = {
      file: sn.file,
      lang: sn.lang,
      lines: sn.lines,
      typedCount: activeSkill ? 42 : 115,
      pauseUntil: 0,
    };
    if (activeSkill) {
      triggerKeyRef.current?.(activeSkill.charAt(0), false);
    }
  }, [activeSkill]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const keys = buildKeys();
    const pressedMap = new Map<KeyDef, number>();
    const floating: FloatingGlyph[] = [];

    const leftHand: Hand2DState = {
      cx: 18.0,
      cy: 35.6,
      restX: 18.0,
      restY: 35.6,
      tx: 18.0,
      ty: 35.6,
      strikeTimer: 0,
      activeFinger: 1,
    };
    const rightHand: Hand2DState = {
      cx: 49.0,
      cy: 35.6,
      restX: 49.0,
      restY: 35.6,
      tx: 49.0,
      ty: 35.6,
      strikeTimer: 0,
      activeFinger: 1,
    };

    const COLS = 68;
    const ROWS = 42;
    let width = 560;
    let height = 560;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const strikeCharacter = (rawChar: string, playSfx = false) => {
      const upper = rawChar.toUpperCase();
      let matched = keys.find((k) => k.key === upper);
      if (!matched && (upper === "\n" || upper === "\r")) {
        matched = keys.find((k) => k.key === "ENTER");
      }
      if (!matched) {
        matched = keys[Math.floor(Math.random() * 28) + 14];
      }
      if (!matched) return;

      const now = performance.now();
      pressedMap.set(matched, now + 185);

      const h = matched.hand === "left" ? leftHand : rightHand;
      h.tx = Math.max(
        matched.hand === "left" ? 13 : 40,
        Math.min(matched.hand === "left" ? 27 : 54, matched.colCenter),
      );
      h.ty = 34.4 + (matched.gridRow - 27) * 0.35;
      h.strikeTimer = 1.0;
      h.activeFinger = matched.finger;

      if (rawChar.trim().length > 0 && floating.length < 18) {
        const fontSize = Math.max(8, Math.min(11.4, width / 49));
        const cw = fontSize * 0.64;
        const ch = fontSize * 1.24;
        const ox = (width - COLS * cw) * 0.5;
        const oy = (height - ROWS * ch) * 0.5;
        floating.push({
          char: rawChar === " " ? "_" : rawChar,
          x: ox + matched.colCenter * cw + (Math.random() - 0.5) * 6,
          y: oy + matched.gridRow * ch - 4,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -1.15 - Math.random() * 0.6,
          life: 1.0,
        });
      }

      if (playSfx) {
        soundEngine.playTick(540 + (matched.rowIdx * 5 + 2) * 18, 0.022);
      }
    };
    triggerKeyRef.current = strikeCharacter;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key.length === 1 || e.key === "Enter" || e.key === " ") {
        strikeCharacter(e.key === "Enter" ? "\n" : e.key, true);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const updateSize = () => {
      const r = host.getBoundingClientRect();
      width = Math.max(300, Math.floor(r.width));
      height = Math.max(380, Math.floor(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawTriggerRef?.();
    };
    let drawTriggerRef: (() => void) | null = null;
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(host);

    let inView = true;
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 },
    );
    io.observe(host);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const curRgb: [number, number, number] = [...targetRgbRef.current];
    let nextAutoType = performance.now() + 180;
    let rafId = 0;

    const animate = (now: number, forceDraw = false) => {
      if ((inView || forceDraw) && !document.hidden) {
        const t = reduceMotion ? 0 : now * 0.001;
        const tgt = targetRgbRef.current;
        curRgb[0] += (tgt[0] - curRgb[0]) * 0.08;
        curRgb[1] += (tgt[1] - curRgb[1]) * 0.08;
        curRgb[2] += (tgt[2] - curRgb[2]) * 0.08;

        const sn = snippetRef.current;
        const fullText = sn.lines.join("\n");
        const isNormalMode = now < sn.pauseUntil;

        if (!reduceMotion && now >= nextAutoType && !isNormalMode) {
          if (sn.typedCount >= fullText.length) {
            sn.pauseUntil = now + 1550;
          } else {
            const nextChar = fullText[sn.typedCount] ?? " ";
            sn.typedCount += 1;
            strikeCharacter(nextChar, false);
          }
          nextAutoType = now + (skillRef.current ? 72 : 125 + Math.random() * 130);
        } else if (!reduceMotion && sn.pauseUntil > 0 && now >= sn.pauseUntil) {
          sn.pauseUntil = 0;
          sn.typedCount = 12;
        }

        // Smooth hand motion (lowers gently during -- NORMAL -- pause)
        [leftHand, rightHand].forEach((h, idx) => {
          const restOffsetY = isNormalMode ? 1.8 : 0;
          const bob = reduceMotion ? 0 : Math.sin(t * 2.2 + idx * 1.5) * 0.22;
          h.tx += (h.restX - h.tx) * 0.032;
          h.ty += (h.restY + restOffsetY - h.ty) * 0.032;
          h.cx += (h.tx - h.cx) * 0.2;
          h.cy += (h.ty + bob - h.cy) * 0.2;
          if (h.strikeTimer > 0.01) h.strikeTimer *= 0.82;
          else h.strikeTimer = 0;
        });

        ctx.clearRect(0, 0, width, height);

        const cr = Math.round(curRgb[0]);
        const cg = Math.round(curRgb[1]);
        const cb = Math.round(curRgb[2]);

        const fontSize = Math.max(8.0, Math.min(11.4, width / 49));
        const cw = fontSize * 0.64;
        const ch = fontSize * 1.24;
        const ox = (width - COLS * cw) * 0.5;
        const oy = (height - ROWS * ch) * 0.5;

        const tick = Math.floor(t * 7);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `600 ${fontSize.toFixed(1)}px "IBM Plex Mono", "Consolas", monospace`;

        // ---------------------------------------------------------------------
        // 1. CRT MONITOR OUTER ASCII SHELL (Rows 0..17, Cols 4..63)
        // ---------------------------------------------------------------------
        for (let r = 0; r <= 17; r++) {
          const py = oy + (r + 0.5) * ch;
          for (let c = 4; c <= 63; c++) {
            const insideScreen = r >= 3 && r <= 14 && c >= 9 && c <= 58;
            const brandGap = r === 16 && c >= 25 && c <= 42;
            if (insideScreen || brandGap) continue;

            const px = ox + (c + 0.5) * cw;
            const edge = r <= 1 || r >= 16 || c <= 6 || c >= 61;
            const chIdx = (c * 19 + r * 37 + tick) % NOISE_CHARS.length;
            ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${edge ? 0.56 : 0.34})`;
            ctx.fillText(NOISE_CHARS[chIdx], px, py);
          }
        }

        // CRT Terminal Editor Screen (Rows 3..14, Cols 9..58)
        const scrX = ox + 9 * cw;
        const scrY = oy + 3 * ch;
        const scrW = 50 * cw;
        const scrH = 12 * ch;

        ctx.save();
        ctx.beginPath();
        ctx.rect(scrX, scrY, scrW, scrH);
        ctx.clip();
        ctx.fillStyle = "#000000";
        ctx.fillRect(scrX, scrY, scrW, scrH);

        ctx.textAlign = "left";
        const otherTabs =
          sn.file === "ml_pipeline.py"
            ? "   schema.sql   cyber_s2.sh"
            : "   ml_pipeline.py   render.py";
        ctx.fillStyle = "rgba(240, 245, 250, 0.88)";
        ctx.fillText(`${sn.file} x${otherTabs}`, scrX + cw, oy + 3.6 * ch);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.45)`;
        ctx.fillRect(scrX + cw, oy + 4.35 * ch, scrW - cw * 2, 1);

        const visible = fullText.slice(0, sn.typedCount).split("\n");
        for (let i = 0; i < sn.lines.length; i++) {
          const lineRow = 5.3 + i * 0.96;
          if (lineRow > 13.1) break;
          const ly = oy + lineRow * ch;

          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.48)`;
          ctx.fillText(String(i + 1).padStart(2, "0") + "|", scrX + cw, ly);

          const textLine = visible[i] ?? "";
          if (textLine.length > 0 || i === visible.length - 1) {
            const isCur = i === visible.length - 1;
            const isCmt =
              textLine.trim().startsWith("#") ||
              textLine.trim().startsWith("--") ||
              textLine.trim().startsWith("//");
            ctx.fillStyle = isCmt
              ? `rgba(${cr}, ${cg}, ${cb}, 0.72)`
              : isCur
                ? "rgba(255, 252, 248, 0.96)"
                : "rgba(236, 242, 246, 0.84)";
            const cursor = isCur && Math.floor(t * 2.8) % 2 === 0 ? "█" : "";
            ctx.fillText(textLine + cursor, scrX + cw * 4.6, ly);
          }
        }

        const ln = visible.length;
        const col = (visible[ln - 1]?.length ?? 0) + 1;
        const statusY = oy + 14.1 * ch;
        ctx.fillStyle = isNormalMode ? "rgba(236, 242, 246, 0.68)" : `rgba(${cr}, ${cg}, ${cb}, 0.9)`;
        ctx.fillText(isNormalMode ? "-- NORMAL --" : "-- INSERT --", scrX + cw, statusY);
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(236, 242, 246, 0.72)";
        ctx.fillText(`${sn.lang}  UTF-8  Ln ${ln}, Col ${col}`, scrX + scrW - cw, statusY);
        ctx.restore();

        // Brand badge Z R W L X + CRT indicators
        ctx.textAlign = "center";
        ctx.font = `700 ${(fontSize * 0.96).toFixed(1)}px "Tektur", "IBM Plex Mono", monospace`;
        ctx.fillStyle = "rgba(244, 248, 252, 0.94)";
        ctx.fillText("Z   R   W   L   X", ox + 33.5 * cw, oy + 16.4 * ch);

        ctx.font = `600 ${fontSize.toFixed(1)}px "IBM Plex Mono", "Consolas", monospace`;
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.7)`;
        ctx.fillText("=   =   o", ox + 52 * cw, oy + 16.4 * ch);

        // ---------------------------------------------------------------------
        // 2. CRT STAND & STATUS LEDS (Rows 18..21)
        // ---------------------------------------------------------------------
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.56)`;
        ctx.fillText("==========", ox + 33.5 * cw, oy + 18.5 * ch);
        ctx.fillText("||||||", ox + 33.5 * cw, oy + 19.5 * ch);
        for (let c = 18; c <= 49; c++) {
          const idx = (c * 13 + tick * 3) % NOISE_CHARS.length;
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.36)`;
          ctx.fillText(NOISE_CHARS[idx], ox + (c + 0.5) * cw, oy + 20.6 * ch);
        }
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.72)`;
        ctx.fillText("o   o   o", ox + 52 * cw, oy + 21.7 * ch);

        // ---------------------------------------------------------------------
        // 3. PERSPECTIVE MECHANICAL KEYBOARD ON GRID ROWS 22..32
        // ---------------------------------------------------------------------
        // Alternating switch-gap texture + trapezoidal housing cheeks
        [22, 24, 26, 28, 30, 32].forEach((gr, gi) => {
          const leftBound = Math.max(3, 9 - gi);
          const rightBound = Math.min(64, 58 + gi);
          const py = oy + (gr + 0.5) * ch;
          for (let c = leftBound; c <= rightBound; c++) {
            const h = gridHash(c, gr);
            if (h < 0.28) continue;
            ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${gr === 32 ? 0.24 : 0.16})`;
            const chGlyph = h > 0.72 ? NOISE_CHARS[(c + gr + tick) % NOISE_CHARS.length] : "-";
            ctx.fillText(chGlyph, ox + (c + 0.5) * cw, py);
          }
        });

        keys.forEach((k) => {
          const activeUntil = pressedMap.get(k) ?? 0;
          const isDown = now < activeUntil;
          const px = ox + k.colCenter * cw;
          const py = oy + (k.gridRow + 0.5) * ch;

          if (isDown) {
            ctx.fillStyle = "#ffffff";
            ctx.fillText(k.text, px, py);
          } else {
            const depthAlpha = 0.42 + k.rowIdx * 0.08;
            ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${depthAlpha})`;
            ctx.fillText(k.text, px, py);
          }
        });

        // Rising typed glyphs bursting off struck keys
        ctx.font = `700 ${(fontSize * 1.4).toFixed(1)}px "Tektur", "IBM Plex Mono", monospace`;
        for (let i = floating.length - 1; i >= 0; i--) {
          const g = floating[i];
          g.x += g.vx;
          g.y += g.vy;
          g.life -= 0.022;
          if (g.life <= 0) {
            floating.splice(i, 1);
            continue;
          }
          const a = Math.sin(g.life * Math.PI) * 0.9;
          ctx.fillStyle = `rgba(${Math.min(255, cr + 35)}, ${Math.min(255, cg + 35)}, ${Math.min(255, cb + 35)}, ${a})`;
          ctx.fillText(g.char, g.x, g.y);
        }

        // ---------------------------------------------------------------------
        // 4. FINE-GRAIN (1.45x) SDF SHADED 5-FINGER ASCII HANDS (Rows 22..41)
        // ---------------------------------------------------------------------
        const subScale = 1.45;
        const scw = cw / subScale;
        const sch = ch / subScale;
        const sCols = Math.floor(COLS * subScale);
        const sRows = Math.floor(ROWS * subScale);
        const startSR = Math.floor(20 * subScale);

        ctx.font = `700 ${(fontSize * 0.78).toFixed(1)}px "IBM Plex Mono", "Consolas", monospace`;
        const handIntensity = isNormalMode ? 0.44 : 1.0;

        for (let sr = startSR; sr < sRows; sr++) {
          const py = oy + (sr + 0.5) * sch;
          const vFade = sr > 37 * subScale ? 1 - (sr - 37 * subScale) / (4.5 * subScale) : 1;
          if (vFade <= 0.04) continue;

          for (let sc = 2; sc < sCols - 2; sc++) {
            const dL = evalHandSDF(sc, sr, "left", leftHand);
            const dR = evalHandSDF(sc, sr, "right", rightHand);
            const d = Math.min(dL, dR);
            if (d > 0.12) continue;

            const px = ox + (sc + 0.5) * scw;

            // Clean black interior occlusion so underlying keyboard gaps separate the 5 fingers cleanly
            if (d < -0.15) {
              ctx.fillStyle = "rgba(0, 0, 0, 0.94)";
              ctx.fillRect(ox + sc * scw - 0.5, oy + sr * sch - 0.5, scw + 1, sch + 1);
            }

            const rim = Math.max(0, Math.min(1, 1 - Math.abs(d) / 2.2));
            const h = gridHash(sc, sr);

            let alpha = 0;
            let isHotEdge = false;
            let isFingerGlint = false;
            if (sr < 31 * subScale && rim > 0.45) {
              alpha = (0.72 + rim * 0.28) * vFade * handIntensity;
              isHotEdge = rim > 0.62;
              isFingerGlint = sr < 29 * subScale && rim > 0.7;
            } else if (sr >= 31 * subScale && rim > 0.58) {
              alpha = (0.58 + rim * 0.34) * vFade * handIntensity;
              isHotEdge = rim > 0.72;
            } else if (h > 0.34) {
              alpha = (0.14 + rim * 0.2 + h * 0.1) * vFade * handIntensity;
            }

            if (alpha < 0.05) continue;

            const glyph = NOISE_CHARS[(sc * 11 + sr * 29 + Math.floor(tick * 0.7)) % NOISE_CHARS.length];
            if (isFingerGlint) {
              ctx.fillStyle = `rgba(255, 84, 68, ${alpha})`;
            } else if (isHotEdge) {
              ctx.fillStyle = `rgba(${Math.min(255, cr + 95)}, ${Math.min(255, cg + 90)}, ${Math.min(255, cb + 90)}, ${alpha})`;
            } else {
              ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
            }
            ctx.fillText(glyph, px, py);
          }
        }
      }

      if (!reduceMotion) {
        rafId = requestAnimationFrame((ts) => animate(ts, false));
      }
    };

    drawTriggerRef = () => animate(performance.now(), true);
    animate(performance.now(), true);
    rafId = requestAnimationFrame((ts) => animate(ts, false));

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="ascii-bottom-fade relative h-full w-full select-none"
      role="img"
      aria-label="Interactive ASCII CRT workstation with live typing terminal, perspective keyboard, and shaded ASCII hands"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
