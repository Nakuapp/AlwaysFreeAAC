import { useState, useCallback, useEffect, useMemo } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { CATEGORIES } from "./data/vocabulary";
import type { Symbol } from "./data/vocabulary";
import { useSpeech } from "./hooks/useSpeech";
import { SentenceBar } from "./components/SentenceBar";
import { CategoryNav } from "./components/CategoryNav";
import { SymbolGrid } from "./components/SymbolGrid";
import { Settings } from "./components/Settings";
import { AddTileDialog } from "./components/AddTileDialog";
import { localizeCategories, t, type Language, type Theme } from "./i18n";
import { exportCategoryToOBF, downloadOBF, readOBFFile, importOBFToSymbols } from "./utils/openboard";
import "./App.css";

const STORAGE_KEY = "aac_settings";
const CUSTOM_TILES_KEY = "aac_custom_tiles";
const MY_WORDS_CATEGORY_ID = "my-words";

interface AppSettings {
  voiceName: string;
  voicePreset: string;
  rate: number;
  pitch: number;
  volume: number;
  columns: number;
  fontSize: number;
  language: Language;
  theme: Theme;
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
    language: "en",
    theme: "light",
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

const VALID_LANGUAGES = new Set<Language>(["en", "es", "fr"]);
const VALID_THEMES = new Set<Theme>(["light", "dark"]);

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
      const normalizedLanguage =
        typeof parsed.language === "string" && VALID_LANGUAGES.has(parsed.language as Language)
          ? (parsed.language as Language)
          : "en";
      const normalizedTheme =
        typeof parsed.theme === "string" && VALID_THEMES.has(parsed.theme as Theme)
          ? (parsed.theme as Theme)
          : "light";

      return {
        ...defaultSettings(),
        ...parsed,
        voicePreset: normalizedPreset,
        language: normalizedLanguage,
        theme: normalizedTheme,
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

function loadCustomTiles(): Symbol[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TILES_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((tile): tile is Record<string, unknown> => {
          if (typeof tile !== "object" || tile === null) return false;
          const candidate = tile as Record<string, unknown>;
          return (
            typeof candidate.id === "string" &&
            typeof candidate.label === "string" &&
            (typeof candidate.emoji === "string" || typeof candidate.icon === "string")
          );
        })
        .map(
          (tile): Symbol => ({
            id: tile.id as string,
            label: tile.label as string,
            emoji: (tile.emoji as string) || (tile.icon as string),
            speak: typeof tile.speak === "string" ? tile.speak : undefined,
            color: typeof tile.color === "string" ? tile.color : undefined,
            isCustom: true,
          })
        );
    }
  } catch {
    // ignore
  }
  return [];
}

function saveCustomTiles(tiles: Symbol[]) {
  try {
    localStorage.setItem(CUSTOM_TILES_KEY, JSON.stringify(tiles));
  } catch {
    // ignore
  }
}

export default function App() {
  const [sentence, setSentence] = useState<Symbol[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].id);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [customTiles, setCustomTiles] = useState<Symbol[]>(loadCustomTiles);
  const [showAddTile, setShowAddTile] = useState(false);
  const [isEditingTiles, setIsEditingTiles] = useState(false);

  const categories = useMemo(() => {
    const base = localizeCategories(settings.language, CATEGORIES);
    return [
      ...base,
      {
        id: MY_WORDS_CATEGORY_ID,
        label: t(settings.language, "myWords"),
        emoji: "pen-square",
        symbols: customTiles,
      },
    ];
  }, [settings.language, customTiles]);

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0];

  const { speak, previewVoice, speaking, voices } = useSpeech({
    rate: settings.rate,
    pitch: settings.pitch,
    volume: settings.volume,
    voiceName: settings.voiceName || undefined,
  });

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveCustomTiles(customTiles);
  }, [customTiles]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-font-size",
      `${settings.fontSize}px`
    );
  }, [settings.fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

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

  const handleAddCustomTile = useCallback((tile: Omit<Symbol, "id">) => {
    const newTile: Symbol = {
      ...tile,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setCustomTiles((prev) => [...prev, newTile]);
    setShowAddTile(false);
  }, []);

  const handleDeleteCustomTile = useCallback((sym: Symbol) => {
    setCustomTiles((prev) => prev.filter((t) => t.id !== sym.id));
  }, []);

  const handleExportBoard = useCallback(() => {
    const myWordsCategory = {
      id: MY_WORDS_CATEGORY_ID,
      label: t(settings.language, "myWords"),
      emoji: "pen-square",
      symbols: customTiles,
    };
    const board = exportCategoryToOBF(myWordsCategory, settings.language);
    downloadOBF(board);
  }, [customTiles, settings.language]);

  const handleImportBoard = useCallback(async (file: File) => {
    try {
      const board = await readOBFFile(file);
      const imported = importOBFToSymbols(board);
      if (imported.length === 0) {
        alert(t(settings.language, "importBoardError"));
        return;
      }
      setCustomTiles((prev) => [...prev, ...imported]);
    } catch {
      alert(t(settings.language, "importBoardError"));
    }
  }, [settings.language]);

  const handlePreviewVoice = useCallback((voiceId: string) => {
    const sampleText = t(settings.language, "appName");
    previewVoice(voiceId, sampleText);
  }, [previewVoice, settings.language]);

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
    <div className="app" aria-label={t(settings.language, "appName")}>
      <header className="app-header">
        <div className="app-header__brand">
          <img src="/app-logo.svg" className="app-header__logo" alt="" aria-hidden="true" />
          <span className="app-header__title">{t(settings.language, "appName")}</span>
        </div>
        <button
          className="app-header__settings-btn"
          onClick={() => setShowSettings(true)}
          aria-label={t(settings.language, "openSettings")}
          aria-haspopup="dialog"
          type="button"
        >
          <SettingsIcon className="app-header__settings-icon" aria-hidden="true" focusable="false" />
          <span className="app-header__settings-label">{t(settings.language, "settings")}</span>
        </button>
      </header>

      <SentenceBar
        sentence={sentence}
        speaking={speaking}
        onSpeak={handleSpeak}
        onClear={handleClear}
        onRemoveLast={handleRemoveLast}
        onSpeakWord={handleSpeakWord}
        language={settings.language}
      />

      <CategoryNav
        categories={categories}
        activeId={activeCategoryId}
        onSelect={(id) => {
          setActiveCategoryId(id);
          setIsEditingTiles(false);
        }}
        language={settings.language}
      />

      <SymbolGrid
        symbols={activeCategory.symbols}
        columns={settings.columns}
        onSelect={handleSymbolSelect}
        language={settings.language}
        onAddWord={activeCategoryId === MY_WORDS_CATEGORY_ID ? () => setShowAddTile(true) : undefined}
        onDeleteSymbol={activeCategoryId === MY_WORDS_CATEGORY_ID ? handleDeleteCustomTile : undefined}
        isEditMode={isEditingTiles}
        onToggleEditMode={() => setIsEditingTiles((prev) => !prev)}
        onExportBoard={activeCategoryId === MY_WORDS_CATEGORY_ID ? handleExportBoard : undefined}
        onImportBoard={activeCategoryId === MY_WORDS_CATEGORY_ID ? handleImportBoard : undefined}
      />

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
          language={settings.language}
          theme={settings.theme}
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
          onLanguageChange={(language) => updateSetting("language", language)}
          onThemeChange={(theme) => updateSetting("theme", theme)}
          onPreviewVoice={handlePreviewVoice}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAddTile && (
        <AddTileDialog
          language={settings.language}
          onSave={handleAddCustomTile}
          onClose={() => setShowAddTile(false)}
        />
      )}
    </div>
  );
}
