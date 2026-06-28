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
  rate: number;
  pitch: number;
  columns: number;
  fontSize: number;
}

function defaultSettings(): AppSettings {
  return { voiceName: "", rate: 1, pitch: 1, columns: 4, fontSize: 14 };
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings(), ...JSON.parse(raw) };
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
    volume: 1,
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

  return (
    <div className="app" role="application" aria-label="AlwaysFreeAAC">
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
          rate={settings.rate}
          pitch={settings.pitch}
          columns={settings.columns}
          fontSize={settings.fontSize}
          onVoiceChange={(v) => updateSetting("voiceName", v)}
          onRateChange={(r) => updateSetting("rate", r)}
          onPitchChange={(p) => updateSetting("pitch", p)}
          onColumnsChange={(c) => updateSetting("columns", c)}
          onFontSizeChange={(f) => updateSetting("fontSize", f)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
