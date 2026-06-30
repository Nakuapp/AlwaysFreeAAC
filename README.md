# AlwaysFreeAAC 💬

**A free, accessible AAC (Augmentative and Alternative Communication) app — available on mobile, tablet, and desktop.**

AlwaysFreeAAC helps people with communication difficulties express themselves using symbol-based communication boards and text-to-speech technology.

---

## 🌐 Try It Now

Use AlwaysFreeAAC instantly in your browser — no download or account required:

**[https://nakuapp.github.io/AlwaysFreeAAC/](https://nakuapp.github.io/AlwaysFreeAAC/)**

The web app works on any device and can be added to your home screen for quick access.

> **More voices on native apps:** The Android and iOS apps have access to a wider range of voices and speech synthesizers built into the device, and also support third-party text-to-speech apps (such as Acapela, Vocalizer, or any TTS engine installed on your device). If voice variety matters, the native apps are the best choice.

---

## Features

- **Symbol boards** — 8 categories with 100+ symbols using emoji visuals and clear text labels
- **Sentence builder** — tap symbols to compose sentences in the display bar
- **Text-to-speech** — speaks sentences aloud using your device's built-in voice
- **Category navigation** — Core, People, Actions, Feelings, Food & Drink, Places, Describe, Social
- **Works everywhere** — mobile, tablet, and desktop
- **Install on your device** — add to home screen for offline use (no app store needed)
- **Accessible** — works with screen readers, keyboard navigation, and respects reduced-motion preferences
- **Customisable** — adjust voice, speech rate/pitch, grid size, font size, language, theme, and custom tiles
- **Icon styles** — choose outlined or filled icon styles for custom tiles
- **Your preferences are saved** — settings are remembered between sessions

---

## Releases

Download the latest web zip, Android Play Store bundle (`.aab`), and iOS App Store archive (`.xcarchive.zip`) from the [Releases](../../releases) page.

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

## Self-Hosting (Web App)

Want to host your own copy? The app is a fully static PWA — no server or database required.

**GitHub Pages** is a free, simple option. A `Deploy to GitHub Pages` workflow is already included in this repository:

1. Fork this repository on GitHub.
2. Go to **Settings → Pages** in your forked repository.
3. Under *Source*, select **GitHub Actions**.
4. The workflow runs automatically on every push to `main` and publishes the app to `https://<your-username>.github.io/AlwaysFreeAAC/`.

The workflow automatically sets the correct base URL for the deployment.

---

## Developer Setup

```bash
npm install
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Lint source files
```

To publish a new release, run the `Release Apps` GitHub Actions workflow with a version number (e.g. `1.2.3`). It builds the web zip, Android Play Store app bundle (`.aab`), and iOS App Store archive (`.xcarchive.zip`) and publishes a GitHub release with all artifacts.

To generate a branch-specific test build without publishing a release, run the `Test Mobile Builds` workflow from the branch you want using the **Run workflow** branch selector. Choose Android, iOS, or both, and optionally provide a custom artifact label. Test mobile builds default to a debug Android APK and a sideload-friendly iOS IPA.

---

## App Logo & Native App Icons

- Brand source icon: `resources/icon.png` (1024×1024)
- Web icons: `public/app-logo.png`, `public/app-icon-192.png`, `public/app-icon-512.png`
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
├── assets/               # Static assets bundled by Vite
├── components/
│   ├── AddTileDialog.tsx # Add/edit custom tile dialog (with icon picker & image upload)
│   ├── CategoryNav.tsx   # Horizontal scrollable category tabs + Manage Boards / Import-Export buttons
│   ├── IconVisual.tsx    # Renders icon or image for a tile
│   ├── ImportExportDialog.tsx # Centralized OBF/OBZ import & multi-board export panel
│   ├── ManageBoardsDialog.tsx # Manage custom boards (create, rename, reorder, delete) and toggle built-in board visibility
│   ├── SentenceBar.tsx   # Sentence builder + speak/clear controls
│   ├── Settings.tsx      # Settings dialog (voice, speed, grid, language, theme)
│   ├── SymbolButton.tsx  # Individual symbol tile
│   └── SymbolGrid.tsx    # Responsive grid of symbol buttons
├── data/
│   └── vocabulary.ts     # Built-in categories and symbols
├── hooks/
│   ├── useFocusTrap.ts   # Focus trap for accessible modal dialogs
│   └── useSpeech.ts      # Native speech + web fallback React hook
├── utils/
│   └── openboard.ts      # OBF/OBZ import & export helpers (single-board and multi-board zip)
├── i18n.ts               # Internationalisation strings (en / es / fr)
├── iconUtils.ts          # Lucide icon search and utility helpers
├── icons.tsx             # Shared Lucide icon registry
├── App.tsx               # Root application component
├── App.css               # App shell styles
├── main.tsx              # App entry point
└── index.css             # Global reset + CSS variables
public/
├── app-icon-192.png      # PWA icon + browser favicon
├── app-icon-512.png      # PWA icon + maskable icon
└── app-logo.png          # Header/app logo
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

## Privacy Policy

AlwaysFreeAAC collects no personal data. All settings and custom boards are stored locally on your device and never sent to any server.

Read the full [Privacy Policy](https://nakuapp.github.io/AlwaysFreeAAC/privacy-policy.html).

---

## License

Free to use. Contributions welcome.
