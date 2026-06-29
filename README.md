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

## Installing on Android (Sideloading)

1. **Download** the `alwaysfreeaac-*-android-debug.apk` file from the [GitHub Releases](../../releases) page onto your Android device.
2. **Enable unknown sources.** The exact path varies by manufacturer and Android version:
   - Android 8+: *Settings → Apps → Special app access → Install unknown apps*, then select the app you'll use to open the APK (e.g. Chrome or Files).
   - Older Android: *Settings → Security → Unknown sources*.
3. **Open the APK** file from your downloads and tap **Install**.
4. If prompted about Play Protect, tap **Install anyway** (the APK is a debug build signed with a local key, not the Play Store).

> **Note:** The APK is a debug build. It is fully functional but is not optimised or signed for distribution through the Play Store.

---

## Installing on iOS (Sideloading)

iOS requires every app to be code-signed before it can be installed on a device. The IPA released from CI is **unsigned**, so you need a tool that re-signs it with your own Apple ID's free development certificate.

### Option A — AltStore (Windows / Mac, no jailbreak required)

1. Install [AltStore](https://altstore.io) on your PC or Mac and pair it with your iPhone/iPad via the AltStore documentation.
2. Download the `alwaysfreeaac-*-ios.ipa` from the [GitHub Releases](../../releases) page.
3. In AltStore on your device, tap **+** and select the downloaded IPA.
4. AltStore re-signs the app with your Apple ID and installs it.
5. **Refresh every 7 days** — free Apple developer certificates expire after 7 days. AltStore can auto-refresh when your device and PC/Mac are on the same Wi-Fi.

### Option B — Sideloadly (Windows / Mac, no jailbreak required)

1. Download [Sideloadly](https://sideloadly.io) for your computer.
2. Connect your iPhone/iPad via USB.
3. Drop the IPA onto the Sideloadly window, enter your Apple ID, and click **Start**.
4. Trust the developer certificate on your device: *Settings → General → VPN & Device Management → [your Apple ID] → Trust*.
5. Same 7-day certificate limit applies — re-run Sideloadly to refresh.

### Option C — Xcode (Mac + Apple Developer account)

1. Open the project locally: `npx cap open ios` (requires Xcode installed).
2. Connect your device, select it as the build target, and click **Run**.
3. Free accounts can install directly on registered personal devices.

> **Note:** iOS sideloading is inherently more complex than Android due to Apple's code-signing requirements. If you encounter trust or certificate errors, consult [Apple's support article on trusting developer apps](https://support.apple.com/en-us/102445).

---

## Web App & GitHub Pages

The web build (`npm run build`) is a fully static PWA — no server required. You can host it anywhere that serves static files.

**GitHub Pages** is an easy free option and is perfectly within GitHub's [Acceptable Use Policy](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies) for an open-source accessibility app like this.

The `Deploy to GitHub Pages` workflow (`.github/workflows/pages.yml`) is already included in this repository. To enable it:

1. Go to **Settings → Pages** in your GitHub repository.
2. Under *Source*, select **GitHub Actions**.
3. The workflow runs automatically on every push to `main` and deploys the built app to `https://<your-org>.github.io/<repo-name>/`.

The workflow automatically sets the correct `base` URL for the sub-path deployment.

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
