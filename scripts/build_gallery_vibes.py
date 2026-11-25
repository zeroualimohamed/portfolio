"""Extract real dominant vibe colors from all 21 optimized artworks and write src/data/gallery.ts."""
import colorsys
import json
import pathlib
from PIL import Image

root = pathlib.Path(r"C:\Users\2points\Desktop\portfolio 3")
gallery_dir = root / "public" / "assets" / "gallery"
data = json.loads((gallery_dir / "manifest.json").read_text(encoding="utf-8"))


def rgb_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}"


def extract_vibe(img_path: pathlib.Path) -> dict:
    im = Image.open(img_path).convert("RGB").resize((96, 96))
    quant = im.quantize(colors=12, method=Image.Quantize.MEDIANCUT).convert("RGB")
    palette = quant.getcolors(maxcolors=256) or []

    best = None
    best_score = -1.0
    for count, (r, g, b) in palette:
        h, s, v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
        # Prefer expressive, visible chromatic colors that are neither near-black nor blown white
        chroma = s ** 1.35
        luma_fit = max(0.05, 1.0 - abs(v - 0.62) * 1.35)
        score = chroma * luma_fit * (count ** 0.25)
        if score > best_score:
            best_score = score
            best = (r, g, b, h, s, v)

    r, g, b, h, s, v = best if best else (242, 100, 48, 0.04, 0.8, 0.95)

    # Guarantee crisp visibility on obsidian #050607 dark background
    if s < 0.18:
        # Monochrome / noir artwork -> crisp cool silver-steel accent
        ar, ag, ab = 198, 210, 224
        tr, tg, tb = 16, 20, 26
        mood = "Monochrome Noir"
    else:
        nr, ng, nb = colorsys.hsv_to_rgb(h, max(0.64, min(0.90, s)), max(0.88, min(0.98, v + 0.16)))
        ar, ag, ab = int(nr * 255), int(ng * 255), int(nb * 255)
        # Deep ambient tint wash (very dark, keeps WCAG AAA text contrast intact)
        dr, dg, db = colorsys.hsv_to_rgb(h, min(0.68, s), 0.11)
        tr, tg, tb = int(dr * 255), int(dg * 255), int(db * 255)
        deg = h * 360.0
        if deg < 18 or deg >= 335:
            mood = "Crimson Ember"
        elif deg < 48:
            mood = "Amber Flame"
        elif deg < 75:
            mood = "Fallout Gold"
        elif deg < 165:
            mood = "Emerald Moss"
        elif deg < 215:
            mood = "Storm Cyan"
        elif deg < 265:
            mood = "Deep Cobalt"
        else:
            mood = "Ultraviolet"

    return {
        "accent": rgb_hex(ar, ag, ab),
        "rgb": f"{ar}, {ag}, {ab}",
        "tint": rgb_hex(tr, tg, tb),
        "mood": mood,
    }


for w in data["works"]:
    for key in ("thumb", "full", "fullJpg"):
        if not w[key].startswith("./"):
            w[key] = "./" + w[key]
    vibe = extract_vibe(gallery_dir / "thumbs" / f"{w['slug']}.webp")
    w["vibe"] = vibe
    print(f"{w['index']:2d} {w['slug']:<26} {vibe['accent']}  tint={vibe['tint']}  ({vibe['mood']})")

header = """export type Orientation = "landscape" | "portrait" | "square";

export interface ArtworkVibe {
  accent: string;
  rgb: string;
  tint: string;
  mood: string;
}

export interface Artwork {
  index: number;
  slug: string;
  title: string;
  series: string;
  featured: boolean;
  orientation: Orientation;
  origWidth: number;
  origHeight: number;
  origBytes: number;
  thumbWidth: number;
  thumbHeight: number;
  thumbBytes: number;
  fullWidth: number;
  fullHeight: number;
  fullBytes: number;
  fullJpgBytes: number;
  thumb: string;
  full: string;
  fullJpg: string;
  vibe: ArtworkVibe;
}

export interface GalleryManifest {
  stats: {
    count: number;
    totalOrigBytes: number;
    totalThumbBytes: number;
    totalFullBytes: number;
    counts: Record<"all" | Orientation, number>;
  };
  works: Artwork[];
}

export const GALLERY_DATA: GalleryManifest = """

out = root / "src" / "data" / "gallery.ts"
out.write_text(header + json.dumps(data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
print(f"\nWrote {out} ({len(data['works'])} works with real extracted palettes)")
