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
import { ManageBoardsDialog } from "./components/ManageBoardsDialog";
import { localizeCategories, t, type Language, type Theme } from "./i18n";
import { exportCategoryToOBF, downloadOBF, readOBFFile, importOBFToSymbols } from "./utils/openboard";
import "./App.css";

const STORAGE_KEY = "aac_settings";
const LEGACY_CUSTOM_TILES_KEY = "aac_custom_tiles";
const USER_BOARDS_KEY = "aac_user_boards";
const HIDDEN_BUILTIN_KEY = "aac_hidden_builtin";

export interface UserBoard {
  id: string;
  label: string;
  emoji: string;
  symbols: Symbol[];
}

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

function isValidSymbol(tile: unknown): tile is Record<string, unknown> {
  if (typeof tile !== "object" || tile === null) return false;
  const candidate = tile as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.label === "string" &&
    (typeof candidate.emoji === "string" || typeof candidate.icon === "string")
  );
}

function parseSymbol(tile: Record<string, unknown>): Symbol {
  return {
    id: tile.id as string,
    label: tile.label as string,
    emoji: (tile.emoji as string) || (tile.icon as string),
    speak: typeof tile.speak === "string" ? tile.speak : undefined,
    color: typeof tile.color === "string" ? tile.color : undefined,
    isCustom: true,
  };
}

function loadUserBoards(): UserBoard[] {
  try {
    const raw = localStorage.getItem(USER_BOARDS_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((board): board is Record<string, unknown> => {
          if (typeof board !== "object" || board === null) return false;
          const b = board as Record<string, unknown>;
          return (
            typeof b.id === "string" &&
            typeof b.label === "string" &&
            typeof b.emoji === "string" &&
            Array.isArray(b.symbols)
          );
        })
        .map(
          (board): UserBoard => ({
            id: board.id as string,
            label: board.label as string,
            emoji: board.emoji as string,
            symbols: (board.symbols as unknown[])
              .filter(isValidSymbol)
              .map(parseSymbol),
          })
        );
    }
  } catch {
    // ignore
  }

  // Migrate from legacy aac_custom_tiles key
  try {
    const legacy = localStorage.getItem(LEGACY_CUSTOM_TILES_KEY);
    if (legacy) {
      const tiles: unknown = JSON.parse(legacy);
      if (Array.isArray(tiles)) {
        const symbols = tiles.filter(isValidSymbol).map(parseSymbol);
        if (symbols.length > 0) {
          return [
            {
              id: "my-words",
              label: "My Words",
              emoji: "pen-square",
              symbols,
            },
          ];
        }
      }
    }
  } catch {
    // ignore
  }

  return [];
}

function saveUserBoards(boards: UserBoard[]) {
  try {
    localStorage.setItem(USER_BOARDS_KEY, JSON.stringify(boards));
  } catch {
    // ignore
  }
}

function loadHiddenBuiltinIds(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_BUILTIN_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((x): x is string => typeof x === "string"));
      }
    }
  } catch {
    // ignore
  }
  return new Set();
}

function saveHiddenBuiltinIds(ids: Set<string>) {
  try {
    localStorage.setItem(HIDDEN_BUILTIN_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export default function App() {
  const [sentence, setSentence] = useState<Symbol[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [userBoards, setUserBoards] = useState<UserBoard[]>(loadUserBoards);
  const [hiddenBuiltinIds, setHiddenBuiltinIds] = useState<Set<string>>(loadHiddenBuiltinIds);
  const [showAddTile, setShowAddTile] = useState(false);
  const [showManageBoards, setShowManageBoards] = useState(false);
  const [isEditingTiles, setIsEditingTiles] = useState(false);

  // Localized built-in categories (minus hidden ones)
  const localizedBuiltIn = useMemo(
    () => localizeCategories(settings.language, CATEGORIES),
    [settings.language]
  );

  // All categories: user boards first, then visible built-in boards
  const allCategories = useMemo(() => {
    const visible = localizedBuiltIn.filter((c) => !hiddenBuiltinIds.has(c.id));
    return [...userBoards, ...visible];
  }, [userBoards, localizedBuiltIn, hiddenBuiltinIds]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
    const boards = loadUserBoards();
    return boards.length > 0 ? boards[0].id : (CATEGORIES[0]?.id ?? "");
  });

  // Keep activeCategoryId valid when boards change
  useEffect(() => {
    if (allCategories.length > 0 && !allCategories.find((c) => c.id === activeCategoryId)) {
      setActiveCategoryId(allCategories[0].id);
    }
  }, [allCategories, activeCategoryId]);

  const activeCategory =
    allCategories.find((c) => c.id === activeCategoryId) ?? allCategories[0];

  const isUserBoard = userBoards.some((b) => b.id === activeCategoryId);

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
    saveUserBoards(userBoards);
  }, [userBoards]);

  useEffect(() => {
    saveHiddenBuiltinIds(hiddenBuiltinIds);
  }, [hiddenBuiltinIds]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-font-size",
      `${settings.fontSize}px`
    );
  }, [settings.fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
  }, [settings.language]);

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

  const handleAddCustomTile = useCallback(
    (tile: Omit<Symbol, "id">) => {
      const newTile: Symbol = {
        ...tile,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
      setUserBoards((prev) =>
        prev.map((b) =>
          b.id === activeCategoryId ? { ...b, symbols: [...b.symbols, newTile] } : b
        )
      );
      setShowAddTile(false);
    },
    [activeCategoryId]
  );

  const handleDeleteCustomTile = useCallback(
    (sym: Symbol) => {
      setUserBoards((prev) =>
        prev.map((b) =>
          b.id === activeCategoryId
            ? { ...b, symbols: b.symbols.filter((t) => t.id !== sym.id) }
            : b
        )
      );
    },
    [activeCategoryId]
  );

  const handleExportBoard = useCallback(() => {
    if (!activeCategory) return;
    const board = exportCategoryToOBF(activeCategory, settings.language);
    downloadOBF(board);
  }, [activeCategory, settings.language]);

  const handleImportBoard = useCallback(
    async (file: File) => {
      try {
        const board = await readOBFFile(file);
        const imported = importOBFToSymbols(board);
        if (imported.length === 0) {
          alert(t(settings.language, "importBoardError"));
          return;
        }
        setUserBoards((prev) =>
          prev.map((b) =>
            b.id === activeCategoryId ? { ...b, symbols: [...b.symbols, ...imported] } : b
          )
        );
      } catch {
        alert(t(settings.language, "importBoardError"));
      }
    },
    [activeCategoryId, settings.language]
  );

  const handleUpdateUserBoards = useCallback((boards: UserBoard[]) => {
    setUserBoards(boards);
  }, []);

  const handleToggleBuiltIn = useCallback((id: string) => {
    setHiddenBuiltinIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handlePreviewVoice = useCallback(
    (voiceId: string) => {
      const sampleText = t(settings.language, "voicePreviewSample");
      previewVoice(voiceId, sampleText);
    },
    [previewVoice, settings.language]
  );

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
      <a href="#main-content" className="skip-link">
        {t(settings.language, "skipToMain")}
      </a>
      <header className="app-header">
        <div className="app-header__brand">
          <img src="/app-logo.png" className="app-header__logo" alt="" aria-hidden="true" />
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
        categories={allCategories}
        activeId={activeCategoryId}
        onSelect={(id) => {
          setActiveCategoryId(id);
          setIsEditingTiles(false);
        }}
        onManageBoards={() => setShowManageBoards(true)}
        language={settings.language}
      />

      <SymbolGrid
        symbols={activeCategory?.symbols ?? []}
        columns={settings.columns}
        onSelect={handleSymbolSelect}
        language={settings.language}
        onAddWord={isUserBoard ? () => setShowAddTile(true) : undefined}
        onDeleteSymbol={isUserBoard ? handleDeleteCustomTile : undefined}
        isEditMode={isEditingTiles}
        onToggleEditMode={() => setIsEditingTiles((prev) => !prev)}
        onExportBoard={isUserBoard ? handleExportBoard : undefined}
        onImportBoard={isUserBoard ? handleImportBoard : undefined}
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

      {showManageBoards && (
        <ManageBoardsDialog
          language={settings.language}
          userBoards={userBoards}
          builtInCategories={localizedBuiltIn}
          hiddenBuiltinIds={hiddenBuiltinIds}
          onUpdateUserBoards={handleUpdateUserBoards}
          onToggleBuiltIn={handleToggleBuiltIn}
          onClose={() => setShowManageBoards(false)}
        />
      )}
    </div>
  );
}
