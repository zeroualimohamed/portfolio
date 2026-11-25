import { useCallback, useEffect, useState } from "react";
import type { Artwork } from "../data/gallery";

export type BasePresetId = "ice" | "crimson" | "ash";

export interface BasePreset {
  id: BasePresetId;
  label: string;
  accent: string;
  rgb: [number, number, number];
  rgbString: string;
  tint: string;
  mood: string;
}

export const BASE_VIBE_PRESETS: BasePreset[] = [
  {
    id: "crimson",
    label: "Blood Crimson",
    accent: "#e63946",
    rgb: [230, 57, 70],
    rgbString: "230, 57, 70",
    tint: "#1a0709",
    mood: "Blood Crimson",
  },
  {
    id: "ice",
    label: "Phantom Ice",
    accent: "#4cc9f0",
    rgb: [76, 201, 240],
    rgbString: "76, 201, 240",
    tint: "#06141d",
    mood: "Phantom Ice",
  },
  {
    id: "ash",
    label: "Ghost Ash",
    accent: "#cfd6de",
    rgb: [207, 214, 222],
    rgbString: "207, 214, 222",
    tint: "#101216",
    mood: "Ghost Ash",
  },
];

export interface ActiveVibe {
  accent: string;
  rgb: [number, number, number];
  rgbString: string;
  tint: string;
  mood: string;
  sourceTitle: string | null;
  locked: boolean;
}

export const DEFAULT_VIBE: ActiveVibe = {
  accent: BASE_VIBE_PRESETS[0].accent,
  rgb: BASE_VIBE_PRESETS[0].rgb,
  rgbString: BASE_VIBE_PRESETS[0].rgbString,
  tint: BASE_VIBE_PRESETS[0].tint,
  mood: BASE_VIBE_PRESETS[0].mood,
  sourceTitle: null,
  locked: false,
};

function parseRgb(str: string): [number, number, number] {
  const parts = str.split(",").map((n) => Number(n.trim()));
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return [parts[0], parts[1], parts[2]];
  }
  return DEFAULT_VIBE.rgb;
}

export function useVibe() {
  const [basePresetId, setBasePresetId] = useState<BasePresetId>("crimson");
  const [hoveredWork, setHoveredWork] = useState<Artwork | null>(null);
  const [lockedWork, setLockedWork] = useState<Artwork | null>(null);

  const basePreset = BASE_VIBE_PRESETS.find((p) => p.id === basePresetId) ?? BASE_VIBE_PRESETS[0];
  const baseVibe: ActiveVibe = {
    accent: basePreset.accent,
    rgb: basePreset.rgb,
    rgbString: basePreset.rgbString,
    tint: basePreset.tint,
    mood: basePreset.mood,
    sourceTitle: null,
    locked: false,
  };

  const effective = hoveredWork ?? lockedWork;

  const vibe: ActiveVibe = effective
    ? {
        accent: effective.vibe.accent,
        rgb: parseRgb(effective.vibe.rgb),
        rgbString: effective.vibe.rgb,
        tint: effective.vibe.tint,
        mood: effective.vibe.mood,
        sourceTitle: effective.title,
        locked: lockedWork !== null && hoveredWork === null,
      }
    : baseVibe;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", vibe.accent);
    root.style.setProperty("--accent-rgb", vibe.rgbString);
    root.style.setProperty("--vibe-tint", vibe.tint);
  }, [vibe.accent, vibe.rgbString, vibe.tint]);

  const selectBasePreset = useCallback((id: BasePresetId) => {
    setBasePresetId(id);
    setHoveredWork(null);
    setLockedWork(null);
  }, []);

  const previewArtworkVibe = useCallback((work: Artwork | null) => {
    setHoveredWork(work);
  }, []);

  const lockArtworkVibe = useCallback((work: Artwork | null) => {
    setLockedWork(work);
  }, []);

  const resetVibe = useCallback(() => {
    setHoveredWork(null);
    setLockedWork(null);
  }, []);

  return {
    vibe,
    basePresetId,
    selectBasePreset,
    previewArtworkVibe,
    lockArtworkVibe,
    resetVibe,
  };
}
