# ZRWLX // Portfolio

Personal engineering and 2D/3D archive site for **Mohamed Zerouali** (`zrwlx`): 4th-year Computer and Network Engineering student (`4IIRF`) at EMSI Fes, Cybersecurity track (Semester 2), Licence in Information Systems and Databases from Faculte Polydisciplinaire de Taza.

Live site: [zerouali.me](https://zerouali.me) / [github.com/zeroualimohamed/portfolio](https://github.com/zeroualimohamed/portfolio)

## Stack

- **Core**: React 19, TypeScript 5.7, Vite 6, Tailwind CSS v4
- **Motion & Input**: `motion` (`motion/react`), `lenis` smooth scroll, `lucide-react`
- **Graphics & Audio**: HTML5 2D Canvas (`requestAnimationFrame` + pointer tracking), Web Audio API synthesis (zero external audio files)
- **Messaging**: FormSubmit AJAX POST with automatic `mailto:` fallback

## How It Was Built

### 1. Custom 2D ASCII Canvas Engines
Instead of heavy WebGL scenes or pre-rendered video loops, every visual system on the page renders deterministically onto `<canvas>` grids scaled by `devicePixelRatio`:

- **`src/components/AsciiMonsterCanvas.tsx`**: Sweeps a monochrome character field inside a jagged negative-space cavity framing twin `11x5` blazing ASCII eyes that track cursor coordinates and react with glitch offsets on trigger.
- **`src/components/AsciiDeskCanvas.tsx`**: Single monospace grid (`CRT editor` + `Z R W L X` bezel + perspective keyboard + `1.45x` sub-grid SDF hands with 5 separated fingers per hand). Typing on your physical keyboard or hovering tech-stack chips swaps the active Vim snippet and drives real-time finger strikes on matching keys.
- **`src/components/AmbientGlyphField.tsx`**: Full-viewport drifting ASCII layer with cursor repulsion and click shockwaves.
- **`src/components/BugHunterOverlay.tsx`**: Interactive HUD event (`Summon bug & catch`). Fractures the viewport overlay, crawls an ASCII beetle into open space, tears open a 3-ring portal underneath it, reaches out with a portal-clipped 5-finger hand to snatch it, and seals back cleanly.

### 2. Live Artwork Vibe Takeover (`useVibe.ts` + `ArchiveSection.tsx`)
The `2D & 3D` section hosts 21 Photoshop and Blender 3D works converted to lightweight WebP thumbnails (plus full-resolution lightbox images) in `public/assets/gallery/`. Hovering or flipping through any piece extracts its dominant color profile via `useVibe.ts` and updates `--accent` / `--accent-rgb` globally, shifting typography highlights, borders, and every active canvas in real time. Three base presets (`Blood Crimson`, `Ice`, `Ash`) can also be toggled from the header.

### 3. Procedural Web Audio Engine (`src/lib/sound.ts`)
When enabled from the header audio button, `sound.ts` builds a continuous ambient bed from dual-detuned sawtooth/triangle oscillators (`55 Hz` and `58.2 Hz`) routed through an LFO-modulated lowpass filter and bandpass noise wind, paired with synthesized crack, grab, scatter, and heart click SFX. No `.mp3` or `.wav` assets are fetched.

### 4. Terminal Typography, i18n & Contact Form
- **`src/components/ScrambleText.tsx`**: 3-part scramble wave (decoded text, glowing frontier glyph, dim remainder) anchored to an invisible sizer span so hovering headings never causes layout shifts.
- **`src/data/i18n.ts`**: Full English and French switchable copy persisted in `localStorage`.
- **`src/components/ContactSection.tsx`**: Client-validated contact form with honeypot field (`_honey`), posting JSON directly to FormSubmit (`https://formsubmit.co/ajax/...`) on live domains and falling back to `mailto:` if offline or blocked.

### 5. Offline `file://` Compatibility (`vite.config.ts`)
`fileProtocolCompat()` strips `crossorigin` module attributes and configures Rollup to output a single classic IIFE bundle (`dist/assets/app.js`) with relative `./` paths, so opening `dist/index.html` directly from disk works alongside standard static hosting on GitHub Pages.

## Project Structure

```text
.
├── .github/workflows/deploy.yml   # GitHub Actions build + Pages deploy
├── index.html                     # Document shell, fonts, favicon links
├── package.json
├── public/
│   ├── .nojekyll                  # Bypass Jekyll on GitHub Pages
│   ├── CNAME                      # Custom domain (zerouali.me)
│   ├── favicon.ico
│   └── assets/
│       ├── favicon/               # 16x16, 32x32, 180x180, 192x192, 512x512, manifest
│       ├── gallery/               # WebP thumbnails and full artwork files
│       ├── portrait.jpg
│       └── portrait.webp
├── src/
│   ├── App.tsx
│   ├── index.css                  # Tailwind v4 theme variables & HUD rules
│   ├── main.tsx
│   ├── components/
│   │   ├── AboutSection.tsx
│   │   ├── AmbientGlyphField.tsx
│   │   ├── ArchiveSection.tsx
│   │   ├── AsciiDeskCanvas.tsx
│   │   ├── AsciiMonsterCanvas.tsx
│   │   ├── BreachPortalCard.tsx
│   │   ├── BugHunterOverlay.tsx
│   │   ├── ContactSection.tsx
│   │   ├── EducationSection.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HudHeader.tsx
│   │   ├── Lightbox.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── ScrambleText.tsx
│   │   └── StackSection.tsx
│   ├── data/
│   │   ├── gallery.ts
│   │   ├── i18n.ts
│   │   └── profile.ts
│   ├── hooks/
│   │   ├── useLang.ts
│   │   ├── useLenis.ts
│   │   └── useVibe.ts
│   └── lib/
│       ├── preload.ts
│       └── sound.ts
└── vite.config.ts
```

## Local Development

```bash
npm install
npm run dev
```

Available scripts:

```bash
npm run typecheck   # TypeScript verification (tsc --noEmit)
npm run build       # TypeScript project build + Vite production bundle in dist/
npm run preview     # Serve dist/ locally on port 8766
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs dependencies with `npm ci`, runs `npm run typecheck` and `npm run build`, uploads `./dist` as a GitHub Pages artifact, and deploys via `actions/deploy-pages`.

## Contact

- Email: [mohamed.zeroualixxx@gmail.com](mailto:mohamed.zeroualixxx@gmail.com)
- GitHub: [github.com/zeroualimohamed](https://github.com/zeroualimohamed)
- LinkedIn: [linkedin.com/in/mohamed-zerouali-aa413b407](https://www.linkedin.com/in/mohamed-zerouali-aa413b407/)
