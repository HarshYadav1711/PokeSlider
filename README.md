# PokeSlider

Production-style **React 19 + Vite 8 + TypeScript** rebuild of the 3D Poké Ball carousel. Data comes from the free public [PokeAPI](https://pokeapi.co/) only (no paid APIs).

## Scripts

- `npm install` — install dependencies  
- `npm run dev` — Vite dev server (default `http://localhost:5173`)  
- `npm run build` — TypeScript project references + production bundle  
- `npm run lint` — ESLint (flat config + typescript-eslint)  
- `npm run preview` — serve the production build locally  

## Layout

| Path | Role |
|------|------|
| `src/data/pokeballs.ts` | Single source of truth for Poké Ball definitions |
| `src/services/pokeapi/*` | Typed HTTP client, catalog builder, details, evolution, mega, types, locations |
| `src/services/ballSuggestions.ts` | Deterministic “which Pokémon for this ball?” logic |
| `src/store/*` | Zustand stores (catalog hydration + UI / overlay) |
| `src/hooks/*` | Carousel, media query, detail fetch, cry playback |
| `src/features/*` | Route-level UI (carousel + overlay panels) |
| `src/components/*` | Shared UI (type badges, async feedback) |
| `src/types/*` | Shared TypeScript models |
| `legacy/` | Original vanilla `index.html` / `script.js` / `styles.css` (reference) |

## Stack

- **React 19** + **Vite 8** + **TypeScript 5.9** (strict)  
- **Tailwind CSS 4** (`@tailwindcss/vite`, design tokens in `src/index.css`)  
- **Motion 12** (`motion/react`) for overlay / modal motion  
- **Zustand** for global catalog + overlay state  

The catalog loads in the background with bounded concurrency (8 parallel species+pokemon pairs) and reports progress while the carousel stays interactive.
