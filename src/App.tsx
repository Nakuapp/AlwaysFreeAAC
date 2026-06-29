import { useState, useCallback, useEffect } from "react";
import { CATEGORIES } from "./data/vocabulary";
import type { Symbol } from "./data/vocabulary";
import { useSpeech } from "./hooks/useSpeech";
import { SentenceBar } from "./components/SentenceBar";
import { CategoryNav } from "./components/CategoryNav";
import { SymbolGrid } from "./components/SymbolGrid";
import { Settings } from "./components/Settings";
import "./App.css";

const STORAGE_KEY = "aac_settings";

interface AppSettings {
  voiceName: string;
  voicePreset: string;
  rate: number;
  pitch: number;
  volume: number;
  columns: number;
  fontSize: number;
}

function defaultSettings(): AppSettings {
  return {
    voiceName: "",
    voicePreset: "custom",
    rate: 1,
    pitch: 1,
    volume: 1,
    columns: 4,
    fontSize: 14,
  };
}

const LEGACY_VOICE_PRESET_MAP: Record<string, AppSettings["voicePreset"]> = {
  male: "baritone",
  female: "alto",
  child: "soprano",
  deep: "bass",
};

const VALID_VOICE_PRESETS = new Set<AppSettings["voicePreset"]>([
  "custom",
  "baritone",
  "alto",
  "soprano",
  "bass",
]);

function normalizeVoicePreset(preset: unknown): AppSettings["voicePreset"] {
  if (typeof preset !== "string") return "custom";
  const mapped = LEGACY_VOICE_PRESET_MAP[preset] ?? preset;
  return VALID_VOICE_PRESETS.has(mapped as AppSettings["voicePreset"])
    ? (mapped as AppSettings["voicePreset"])
    : "custom";
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      const normalizedPreset = normalizeVoicePreset(parsed.voicePreset);

      return {
        ...defaultSettings(),
        ...parsed,
        voicePreset: normalizedPreset,
      };
    }
  } catch {
    // ignore
  }
  return defaultSettings();
}

function saveSettings(s: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export default function App() {
  const [sentence, setSentence] = useState<Symbol[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].id);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const { speak, speaking, voices } = useSpeech({
    rate: settings.rate,
    pitch: settings.pitch,
    volume: settings.volume,
    voiceName: settings.voiceName || undefined,
  });

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Apply font-size to root
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-font-size",
      `${settings.fontSize}px`
    );
  }, [settings.fontSize]);

  const activeCategory =
    CATEGORIES.find((c) => c.id === activeCategoryId) ?? CATEGORIES[0];

  const handleSymbolSelect = useCallback((sym: Symbol) => {
    setSentence((prev) => [...prev, sym]);
  }, []);

  const handleSpeak = useCallback(() => {
    if (sentence.length === 0) return;
    const text = sentence.map((s) => s.speak ?? s.label).join(" ");
    speak(text);
  }, [sentence, speak]);

  const handleSpeakWord = useCallback(
    (sym: Symbol) => {
      speak(sym.speak ?? sym.label);
    },
    [speak]
  );

  const handleClear = useCallback(() => {
    setSentence([]);
  }, []);

  const handleRemoveLast = useCallback(() => {
    setSentence((prev) => prev.slice(0, -1));
  }, []);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const applyVoicePreset = (preset: string) => {
    switch (preset) {
      case "baritone":
      case "male":
        setSettings((prev) => ({
          ...prev,
          voicePreset: "baritone",
          rate: 0.95,
          pitch: 0.75,
        }));
        return;
      case "alto":
      case "female":
        setSettings((prev) => ({
          ...prev,
          voicePreset: "alto",
          rate: 1.05,
          pitch: 1.25,
        }));
        return;
      case "soprano":
      case "child":
        setSettings((prev) => ({
          ...prev,
          voicePreset: "soprano",
          rate: 1.15,
          pitch: 1.45,
        }));
        return;
      case "bass":
      case "deep":
        setSettings((prev) => ({
          ...prev,
          voicePreset: "bass",
          rate: 0.85,
          pitch: 0.6,
        }));
        return;
      default:
        setSettings((prev) => ({
          ...prev,
          voicePreset: "custom",
        }));
    }
  };

  return (
    <div className="app" aria-label="AlwaysFreeAAC">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__icon" aria-hidden="true">
            💬
          </span>
          <span className="app-header__title">AlwaysFreeAAC</span>
        </div>
        <button
          className="app-header__settings-btn"
          onClick={() => setShowSettings(true)}
          aria-label="Open settings"
          aria-haspopup="dialog"
          type="button"
        >
          <span aria-hidden="true">⚙️</span>
          <span className="app-header__settings-label">Settings</span>
        </button>
      </header>

      {/* Sentence builder */}
      <SentenceBar
        sentence={sentence}
        speaking={speaking}
        onSpeak={handleSpeak}
        onClear={handleClear}
        onRemoveLast={handleRemoveLast}
        onSpeakWord={handleSpeakWord}
      />

      {/* Category navigation */}
      <CategoryNav
        categories={CATEGORIES}
        activeId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />

      {/* Symbol grid */}
      <SymbolGrid
        symbols={activeCategory.symbols}
        columns={settings.columns}
        onSelect={handleSymbolSelect}
      />

      {/* Settings panel */}
      {showSettings && (
        <Settings
          voices={voices}
          selectedVoice={settings.voiceName}
          voicePreset={settings.voicePreset}
          rate={settings.rate}
          pitch={settings.pitch}
          volume={settings.volume}
          columns={settings.columns}
          fontSize={settings.fontSize}
          onVoiceChange={(v) => updateSetting("voiceName", v)}
          onVoicePresetChange={applyVoicePreset}
          onRateChange={(r) =>
            setSettings((prev) => ({ ...prev, rate: r, voicePreset: "custom" }))
          }
          onPitchChange={(p) =>
            setSettings((prev) => ({ ...prev, pitch: p, voicePreset: "custom" }))
          }
          onVolumeChange={(v) => updateSetting("volume", v)}
          onColumnsChange={(c) => updateSetting("columns", c)}
          onFontSizeChange={(f) => updateSetting("fontSize", f)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
