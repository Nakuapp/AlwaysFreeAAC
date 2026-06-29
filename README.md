# AlwaysFreeAAC 💬

**A free, accessible AAC (Augmentative and Alternative Communication) app — available on mobile, tablet, and desktop.**

AlwaysFreeAAC helps people with communication difficulties express themselves using symbol-based communication boards and text-to-speech technology.

---

## Features

- **Symbol boards** — 8 categories with 100+ symbols using emoji visuals and clear text labels
- **Sentence builder** — tap symbols to compose sentences in the display bar
- **Text-to-speech** — native speech on Android/iOS with web fallback
- **Category navigation** — Core, People, Actions, Feelings, Food & Drink, Places, Describe, Social
- **Responsive design** — works on any screen size (mobile, tablet, desktop)
- **PWA installable** — install on any device for offline-capable use
- **Accessible** — ARIA labels, keyboard navigation, and `prefers-reduced-motion` support
- **Customisable** — adjust voice, speech rate/pitch, grid size, font size, language/theme, and custom tiles
- **Icon picker modes** — choose outlined or filled icon styles for custom tiles
- **Persistent settings** — preferences saved to localStorage

---

## Getting Started

```bash
npm install
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Lint source files
```

---

## Releases

- Run the `Release Apps` GitHub Actions workflow with a version number such as `1.2.3` or `v1.2.3`.
- The workflow normalizes the version tag, builds the web zip, Android debug APK, and iOS IPA, then publishes one GitHub release with generated release notes and all artifacts.

---

## App Logo & Native App Icons

- Brand source icon: `resources/icon.png` (1024×1024)
- Web icons: `public/app-icon.svg`, `public/app-icon-192.png`, `public/app-icon-512.png`, `public/favicon.svg`
- Android/iOS launch icons are generated in CI with `@capacitor/assets` during Android and iOS workflows.

To regenerate native icons locally (after `npx cap add android` / `npx cap add ios`):

```bash
npx @capacitor/assets generate --android --ios
npx cap sync
```

---

## Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Framework   | React 19 + TypeScript       |
| Runtime     | Capacitor 8 (Android + iOS) |
| Bundler     | Vite 8                      |
| Speech      | @capgo/capacitor-speech-synthesis + Web Speech fallback |
| Icons       | lucide-react + custom picker |
| Styling     | Plain CSS                   |
| Linter      | oxlint                      |
| PWA         | vite-plugin-pwa             |

---

## Project Structure

```
src/
├── components/
│   ├── CategoryNav.tsx   # Horizontal scrollable category tabs
│   ├── SentenceBar.tsx   # Sentence builder + speak/clear controls
│   ├── Settings.tsx      # Settings dialog (voice, speed, grid)
│   ├── SymbolButton.tsx  # Individual symbol tile
│   └── SymbolGrid.tsx    # Responsive grid of symbol buttons
├── data/
│   └── vocabulary.ts     # All categories and symbols
├── hooks/
│   └── useSpeech.ts      # Native speech + web fallback React hook
├── icons.tsx             # Shared Lucide icon registry/helpers
├── App.tsx               # Root application component
├── App.css               # App shell styles
└── index.css             # Global reset + CSS variables
public/
├── app-icon-192.png      # PWA icon
├── app-icon-512.png      # PWA icon + maskable icon
├── app-icon.svg          # Scalable app icon
├── app-logo.svg          # Marketing/app logo
├── favicon.svg           # Browser tab icon
└── icons.svg             # Additional SVG icon sheet
resources/
└── icon.png              # Source image for native Android/iOS icon generation
```

---

## Accessibility

AlwaysFreeAAC is built with accessibility at its core:

- Every symbol button has an `aria-label` announcing its spoken word
- The sentence bar uses `aria-live="polite"` so screen readers announce additions
- Category tabs use `aria-pressed` to indicate the active state
- The settings dialog uses `role="dialog"` and `aria-modal="true"`
- All interactive elements are reachable by keyboard
- Focus indicators meet WCAG 2.1 AA contrast requirements
- Motion is suppressed for users who prefer `prefers-reduced-motion`

---

## Inspiration

Inspired by user-centric AAC solutions such as Proloquo2Go — designed to be free and open for everyone.

---

## License

Free to use. Contributions welcome.
