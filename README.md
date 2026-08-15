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

- **Welcome board** — starts with a single customisable board containing a curated welcome layout with varied tile sizes; add more boards whenever you're ready
- **Sentence builder** — tap symbols or type into the built-in search bar to compose sentences
- **Keyboard search** — type any word to find matching tiles instantly; tap a result to add it to the sentence; if a word isn't on any board and a custom board is active, an "Add to board" shortcut opens the tile editor pre-filled
- **Text-to-speech** — speaks sentences aloud using your device's built-in voice
- **Custom boards** — create as many boards as you need, each with its own tiles, icon, and name; rename, reorder, and delete at any time
- **Works everywhere** — mobile, tablet, and desktop
- **Install on your device** — add to home screen for offline use (no app store needed)
- **Accessible** — targets WCAG 2.1 AA; works with screen readers, keyboard navigation, and respects reduced-motion preferences
- **Customisable** — settings panel with three tabs (Speech, Display, App); adjust voice, vocal style, speed, pitch, volume, tile size (XS–XL), font size, language, theme, and layout order
- **Layout order** — choose "Tabs on top, speech at bottom" (default) or "Speech on top, tabs below" to suit your workflow
- **Icon styles & colours** — choose outlined or filled icon styles and a custom accent colour for each tile
- **In-place tile editing** — tap any custom tile in edit mode to update its label, icon, colour, and spoken text
- **Per-tile size override** — set an individual tile to a different size so important symbols stand out
- **Drag-and-drop reorder** — drag tiles in edit mode to arrange them however you like
- **Logo = settings** — the app logo in the navigation bar opens the settings panel; no separate header bar
- **Your preferences are saved** — settings and custom boards are remembered between sessions

---

## Releases

Download the latest web zip, Android Play Store bundle (`.aab`), and iOS App Store IPA (`.ipa`) from the [Releases](../../releases) page.

---

## Installing on Android (Sideloading)

1. **Run** the `Test Mobile Builds` workflow with `platform=android` (or `both`) and download the `alwaysfreeaac-*-android-debug.apk` artifact.
2. **Enable unknown sources.** The exact path varies by manufacturer and Android version:
   - Android 8+: _Settings → Apps → Special app access → Install unknown apps_, then select the app you'll use to open the APK (e.g. Chrome or Files).
   - Older Android: _Settings → Security → Unknown sources_.
3. **Open the APK** file from your downloads and tap **Install**.
4. If prompted about Play Protect, tap **Install anyway** (the APK is a debug build signed with a local key, not the Play Store).

> **Note:** The APK is a debug build. It is fully functional but is not optimised or signed for distribution through the Play Store.

---

## Installing on iOS (Sideloading)

iOS requires every app to be code-signed before it can be installed on a device. The test-build IPA from CI is **unsigned**, so you need a tool that re-signs it with your own Apple ID's free development certificate.

### Option A — AltStore (Windows / Mac, no jailbreak required)

1. Install [AltStore](https://altstore.io) on your PC or Mac and pair it with your iPhone/iPad via the AltStore documentation.
2. Run the `Test Mobile Builds` workflow with `platform=ios` (or `both`) and download the `alwaysfreeaac-*-ios.ipa` artifact.
3. In AltStore on your device, tap **+** and select the downloaded IPA.
4. AltStore re-signs the app with your Apple ID and installs it.
5. **Refresh every 7 days** — free Apple developer certificates expire after 7 days. AltStore can auto-refresh when your device and PC/Mac are on the same Wi-Fi.

### Option B — Sideloadly (Windows / Mac, no jailbreak required)

1. Download [Sideloadly](https://sideloadly.io) for your computer.
2. Connect your iPhone/iPad via USB.
3. Drop the test-build IPA onto the Sideloadly window, enter your Apple ID, and click **Start**.
4. Trust the developer certificate on your device: _Settings → General → VPN & Device Management → [your Apple ID] → Trust_.
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
3. Under _Source_, select **GitHub Actions**.
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

To publish a new release, run the `Release Apps` GitHub Actions workflow with a version number (e.g. `1.2.3`). It builds the web zip, a signed Android Play Store app bundle (`.aab`), and a signed iOS App Store IPA (`.ipa`) and publishes a GitHub release with all artifacts.

Store release signing requires these repository secrets:

- `ANDROID_SIGNING_KEYSTORE_BASE64`
- `ANDROID_SIGNING_KEY_ALIAS`
- `ANDROID_SIGNING_KEYSTORE_PASSWORD`
- `ANDROID_SIGNING_KEY_PASSWORD`
- `IOS_SIGNING_CERTIFICATE_P12_BASE64`
- `IOS_SIGNING_CERTIFICATE_PASSWORD`
- `IOS_SIGNING_PROVISIONING_PROFILE_BASE64`
- `IOS_SIGNING_TEAM_ID`
- `IOS_SIGNING_BUNDLE_ID`

To generate a branch-specific test build without publishing a release, run the `Test Mobile Builds` workflow from the branch you want using the **Run workflow** branch selector. Choose Android, iOS, or both, and optionally provide a custom artifact label. Test mobile builds default to a debug Android APK and a sideload-friendly iOS IPA.

---

## App Logo & Native App Icons

- Brand source icon: `resources/icon.png` (1024×1024)
- Web brand images: `public/brand/logo-150.png`, `public/brand/logo-300.png`
- PWA icons: `public/icons/app-icon-192.png`, `public/icons/app-icon-512.png`
- Android/iOS launch icons are generated in CI with `@capacitor/assets` during Android and iOS workflows.

To regenerate native icons locally (after `npx cap add android` / `npx cap add ios`):

```bash
npx @capacitor/assets generate --android --ios
npx cap sync
```

---

## Tech Stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Framework | React 19 + TypeScript                                   |
| Runtime   | Capacitor 8 (Android + iOS)                             |
| Bundler   | Vite 8                                                  |
| Speech    | @capgo/capacitor-speech-synthesis + Web Speech fallback |
| Icons     | lucide-react + custom picker                            |
| Styling   | Plain CSS                                               |
| Linter    | oxlint                                                  |
| PWA       | vite-plugin-pwa                                         |

---

## Project Structure

```
src/
├── app/                  # App composition root, shell styles, dialogs, notifications, focus restore
├── components/
│   ├── dialog/           # Shared dialog, loading state, and focus trap
│   ├── feedback/         # Error boundary and notification region
│   └── icon/             # Shared icon/image renderer
├── features/
│   ├── board/            # Board navigation, symbol grid/tiles, and board state
│   ├── board-manager/    # Board CRUD and OBF/OBZ transfer dialog
│   ├── sentence/         # Sentence builder UI and state
│   ├── settings/         # Settings dialog, tabs, and persisted settings state
│   └── tile-editor/      # Add/edit tile dialog, tabs, options, and form state
├── domain/               # Models, vocabulary, board reducer, operation results
├── i18n/                 # Translation facade and en/es/fr locale dictionaries
├── openboard/            # OBF/OBZ conversion, archive, validation, and file APIs
├── persistence/          # Settings, boards, media, migrations, and storage adapters
├── services/             # Browser media APIs
├── speech/               # Speech hook, drivers, and speech types
├── ui/                   # Shared colors, icons, icon helpers, and tile sizing
├── utils/                # General runtime, ID, tab, and voice-label helpers
├── main.tsx              # App entry point
└── index.css             # Global reset + CSS variables
public/
├── brand/                # Navigation and error-state brand images
├── icons/                # PWA icons and browser favicon
└── privacy-policy.html   # Static privacy policy
resources/
└── icon.png              # Source image for native Android/iOS icon generation
```

---

## Accessibility

AlwaysFreeAAC is built with accessibility at its core, targeting WCAG 2.1 AA:

- Every symbol button has an `aria-label` announcing its spoken word
- The sentence bar uses `aria-live="polite"` so screen readers announce additions
- Category tabs use `aria-pressed` to indicate the active state
- All dialogs use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing at the heading
- The settings dialog uses `role="tablist"` / `role="tab"` / `role="tabpanel"` with full arrow-key navigation (←/→/Home/End) and `aria-selected`
- Clicking the backdrop closes the settings dialog (in addition to the close button and Escape key)
- Range inputs carry `aria-valuetext` with a human-readable description (e.g. "Slow (0.7×)")
- Grid size buttons carry descriptive `aria-label` (e.g. "MD – 4 columns")
- Decorative `aria-hidden="true"` range endpoint labels avoid redundant readout
- Keyboard focus is restored to the trigger element when a dialog closes (`useRestoreFocus`)
- All interactive elements are reachable by keyboard
- Focus indicators and text contrast meet WCAG 2.1 AA requirements
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
