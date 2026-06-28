# AlwaysFreeAAC 💬

**A free, accessible AAC (Augmentative and Alternative Communication) app — available on mobile, tablet, and desktop.**

AlwaysFreeAAC helps people with communication difficulties express themselves using symbol-based communication boards and text-to-speech technology.

---

## Features

- **Symbol boards** — 8 categories with 100+ symbols using emoji visuals and clear text labels
- **Sentence builder** — tap symbols to compose sentences in the display bar
- **Text-to-speech** — speak individual words or full sentences using the Web Speech API
- **Category navigation** — Core, People, Actions, Feelings, Food & Drink, Places, Describe, Social
- **Responsive design** — works on any screen size (mobile, tablet, desktop)
- **PWA installable** — install on any device for offline-capable use
- **Accessible** — ARIA labels, keyboard navigation, and `prefers-reduced-motion` support
- **Customisable** — adjust voice, speech rate/pitch, grid size, and font size in Settings
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

## Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Framework   | React 19 + TypeScript       |
| Bundler     | Vite 8                      |
| Speech      | Web Speech API              |
| Styling     | Plain CSS                   |
| Linter      | oxlint                      |
| PWA         | Web App Manifest            |

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
│   └── useSpeech.ts      # Web Speech API React hook
├── App.tsx               # Root application component
├── App.css               # App shell styles
└── index.css             # Global reset + CSS variables
public/
├── favicon.svg           # App icon used in PWA manifest
└── icons.svg             # Additional SVG icon sheet
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
