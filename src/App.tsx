import { useState, useCallback, useEffect, useMemo } from "react";
import type { Symbol } from "./data/vocabulary";
import type { TileSize } from "./data/vocabulary";
import { columnsToTileSize } from "./tileSize";
import { useSpeech } from "./hooks/useSpeech";
import { SentenceBar } from "./components/SentenceBar";
import { CategoryNav } from "./components/CategoryNav";
import { SymbolGrid } from "./components/SymbolGrid";
import { Settings } from "./components/Settings";
import { AddTileDialog } from "./components/AddTileDialog";
import { ManageBoardsDialog } from "./components/ManageBoardsDialog";
import { ImportExportDialog } from "./components/ImportExportDialog";
import { t, type Language, type Theme, type LayoutOrder } from "./i18n";
import { useRestoreFocus } from "./hooks/useRestoreFocus";
import "./App.css";

const STORAGE_KEY = "aac_settings";
const LEGACY_CUSTOM_TILES_KEY = "aac_custom_tiles";
const USER_BOARDS_KEY = "aac_user_boards";

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
  tileSize: TileSize;
  fontSize: number;
  language: Language;
  theme: Theme;
  layoutOrder: LayoutOrder;
}

function defaultSettings(): AppSettings {
  return {
    voiceName: "",
    voicePreset: "custom",
    rate: 1,
    pitch: 1,
    volume: 1,
    tileSize: "md",
    fontSize: 14,
    language: "en",
    theme: "light",
    layoutOrder: "tabs-top",
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
const VALID_TILE_SIZES = new Set<TileSize>(["xs", "sm", "md", "lg", "xl"]);
const VALID_LAYOUT_ORDERS = new Set<LayoutOrder>(["tabs-top", "speech-top"]);

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
      const parsed = JSON.parse(raw) as Partial<AppSettings> & { columns?: number };
      const normalizedPreset = normalizeVoicePreset(parsed.voicePreset);
      const normalizedLanguage =
        typeof parsed.language === "string" && VALID_LANGUAGES.has(parsed.language as Language)
          ? (parsed.language as Language)
          : "en";
      const normalizedTheme =
        typeof parsed.theme === "string" && VALID_THEMES.has(parsed.theme as Theme)
          ? (parsed.theme as Theme)
          : "light";
      const normalizedLayoutOrder =
        typeof parsed.layoutOrder === "string" && VALID_LAYOUT_ORDERS.has(parsed.layoutOrder as LayoutOrder)
          ? (parsed.layoutOrder as LayoutOrder)
          : "tabs-top";

      // Migrate legacy numeric columns → named tileSize
      let normalizedTileSize: TileSize =
        typeof parsed.tileSize === "string" && VALID_TILE_SIZES.has(parsed.tileSize as TileSize)
          ? (parsed.tileSize as TileSize)
          : "md";
      if (normalizedTileSize === "md" && typeof parsed.columns === "number") {
        normalizedTileSize = columnsToTileSize(parsed.columns);
      }

      return {
        ...defaultSettings(),
        ...parsed,
        voicePreset: normalizedPreset,
        language: normalizedLanguage,
        theme: normalizedTheme,
        tileSize: normalizedTileSize,
        layoutOrder: normalizedLayoutOrder,
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
    iconColor: typeof tile.iconColor === "string" ? tile.iconColor : undefined,
    tileSize:
      typeof tile.tileSize === "string" && VALID_TILE_SIZES.has(tile.tileSize as TileSize)
        ? (tile.tileSize as TileSize)
        : undefined,
    isCustom: true,
  };
}

/** Default welcome board shown on first launch */
const DEFAULT_WELCOME_BOARD: UserBoard = {
  id: "welcome",
  label: "Welcome",
  emoji: "star",
  symbols: [
    // Row 1: full-width banner (xl = 4 cols at default grid)
    { id: "welcome-title", label: "Welcome!", emoji: "🎉", color: "yellow", tileSize: "xl", isCustom: true },
    // Row 2: greeting + pronouns
    { id: "welcome-hello", label: "Hello", emoji: "👋", color: "yellow", tileSize: "lg", isCustom: true },
    { id: "welcome-i", label: "I", emoji: "👤", color: "blue", tileSize: "sm", isCustom: true },
    { id: "welcome-you", label: "You", emoji: "👉", color: "blue", tileSize: "sm", isCustom: true },
    // Row 3: core responses (4 × 1 col)
    { id: "welcome-yes", label: "Yes", emoji: "✅", color: "green", tileSize: "sm", isCustom: true },
    { id: "welcome-no", label: "No", emoji: "❌", color: "red", tileSize: "sm", isCustom: true },
    { id: "welcome-please", label: "Please", emoji: "🙏", color: "purple", tileSize: "sm", isCustom: true },
    { id: "welcome-thank-you", label: "Thank You", emoji: "🙌", color: "green", tileSize: "sm", isCustom: true },
    // Row 4: help + quick actions
    { id: "welcome-help", label: "Help", emoji: "🆘", color: "red", tileSize: "lg", isCustom: true },
    { id: "welcome-more", label: "More", emoji: "➕", color: "orange", tileSize: "sm", isCustom: true },
    { id: "welcome-all-done", label: "All Done", emoji: "🏁", color: "purple", tileSize: "sm", isCustom: true },
    // Row 5: feelings + intent
    { id: "welcome-happy", label: "Happy", emoji: "😊", color: "yellow", tileSize: "sm", isCustom: true },
    { id: "welcome-want", label: "Want", emoji: "🌟", color: "orange", tileSize: "lg", isCustom: true },
    { id: "welcome-good", label: "Good", emoji: "⭐", color: "green", tileSize: "sm", isCustom: true },
  ],
};

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

export default function App() {
  const [sentence, setSentence] = useState<Symbol[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [userBoards, setUserBoards] = useState<UserBoard[]>(() => {
    const boards = loadUserBoards();
    return boards.length > 0 ? boards : [DEFAULT_WELCOME_BOARD];
  });
  const [showAddTile, setShowAddTile] = useState(false);
  const [addTileInitialLabel, setAddTileInitialLabel] = useState<string | undefined>();
  const [editingTile, setEditingTile] = useState<Symbol | null>(null);
  const [showManageBoards, setShowManageBoards] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [isEditingTiles, setIsEditingTiles] = useState(false);

  // All categories are user boards
  const allCategories = useMemo(() => userBoards, [userBoards]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
    const boards = loadUserBoards();
    return boards.length > 0 ? boards[0].id : DEFAULT_WELCOME_BOARD.id;
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

  // Flat list of all symbols across all categories for keyboard search in SentenceBar
  const allSymbols = useMemo(
    () => allCategories.flatMap((c) => c.symbols),
    [allCategories]
  );

  const { capture: captureFocus, restore: restoreFocus } = useRestoreFocus();

  const handleOpenSettings = useCallback(() => {
    captureFocus();
    setShowSettings(true);
  }, [captureFocus]);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    restoreFocus();
  }, [restoreFocus]);

  const handleOpenAddTile = useCallback((initialLabel?: string) => {
    captureFocus();
    setEditingTile(null);
    setAddTileInitialLabel(initialLabel);
    setShowAddTile(true);
  }, [captureFocus]);

  const handleCloseAddTile = useCallback(() => {
    setShowAddTile(false);
    setAddTileInitialLabel(undefined);
    restoreFocus();
  }, [restoreFocus]);

  const handleOpenEditTile = useCallback(
    (sym: Symbol) => {
      captureFocus();
      setShowAddTile(false);
      setEditingTile(sym);
    },
    [captureFocus]
  );

  const handleCloseEditTile = useCallback(() => {
    setEditingTile(null);
    restoreFocus();
  }, [restoreFocus]);

  const handleAddToBoard = useCallback(
    (word: string) => {
      if (!isUserBoard) return;
      handleOpenAddTile(word);
    },
    [isUserBoard, handleOpenAddTile]
  );

  const handleOpenManageBoards = useCallback(() => {
    captureFocus();
    setShowManageBoards(true);
  }, [captureFocus]);

  const handleCloseManageBoards = useCallback(() => {
    setShowManageBoards(false);
    restoreFocus();
  }, [restoreFocus]);

  const handleOpenImportExport = useCallback(() => {
    captureFocus();
    setShowImportExport(true);
  }, [captureFocus]);

  const handleCloseImportExport = useCallback(() => {
    setShowImportExport(false);
    restoreFocus();
  }, [restoreFocus]);

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
      handleCloseAddTile();
    },
    [activeCategoryId, handleCloseAddTile]
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

  const handleReorderTiles = useCallback(
    (fromIndex: number, toIndex: number) => {
      setUserBoards((prev) =>
        prev.map((b) => {
          if (b.id !== activeCategoryId) return b;
          const symbols = [...b.symbols];
          const [moved] = symbols.splice(fromIndex, 1);
          symbols.splice(toIndex, 0, moved);
          return { ...b, symbols };
        })
      );
    },
    [activeCategoryId]
  );

  const handleUpdateCustomTile = useCallback(
    (sym: Symbol, data: Omit<Symbol, "id">) => {
      setUserBoards((prev) =>
        prev.map((b) =>
          b.id === activeCategoryId
            ? { ...b, symbols: b.symbols.map((t) => (t.id === sym.id ? { ...data, id: sym.id } : t)) }
            : b
        )
      );
      handleCloseEditTile();
    },
    [activeCategoryId, handleCloseEditTile]
  );

  const handleImportBoards = useCallback((boards: UserBoard[]) => {
    setUserBoards((prev) => [...prev, ...boards]);
  }, []);

  const handleUpdateUserBoards = useCallback((boards: UserBoard[]) => {
    setUserBoards(boards);
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
    <div className="app" data-layout={settings.layoutOrder}>
      <a href="#main-content" className="skip-link">
        {t(settings.language, "skipToMain")}
      </a>

      <SentenceBar
        sentence={sentence}
        speaking={speaking}
        onSpeak={handleSpeak}
        onClear={handleClear}
        onRemoveLast={handleRemoveLast}
        onSpeakWord={handleSpeakWord}
        language={settings.language}
        allSymbols={allSymbols}
        onSelectSymbol={handleSymbolSelect}
        onAddToBoard={isUserBoard ? handleAddToBoard : undefined}
      />

      <CategoryNav
        categories={allCategories}
        activeId={activeCategoryId}
        onSelect={(id) => {
          setActiveCategoryId(id);
          setIsEditingTiles(false);
        }}
        onManageBoards={handleOpenManageBoards}
        onImportExport={handleOpenImportExport}
        onOpenSettings={handleOpenSettings}
        language={settings.language}
      />

      <SymbolGrid
        symbols={activeCategory?.symbols ?? []}
        tileSize={settings.tileSize}
        onSelect={handleSymbolSelect}
        language={settings.language}
        onAddWord={isUserBoard ? handleOpenAddTile : undefined}
        onDeleteSymbol={isUserBoard ? handleDeleteCustomTile : undefined}
        onEditSymbol={isUserBoard ? handleOpenEditTile : undefined}
        onReorderSymbols={isUserBoard ? handleReorderTiles : undefined}
        isEditMode={isEditingTiles}
        onToggleEditMode={() => setIsEditingTiles((prev) => !prev)}
      />

      {showSettings && (
        <Settings
          voices={voices}
          selectedVoice={settings.voiceName}
          voicePreset={settings.voicePreset}
          rate={settings.rate}
          pitch={settings.pitch}
          volume={settings.volume}
          tileSize={settings.tileSize}
          fontSize={settings.fontSize}
          language={settings.language}
          theme={settings.theme}
          layoutOrder={settings.layoutOrder}
          onVoiceChange={(v) => updateSetting("voiceName", v)}
          onVoicePresetChange={applyVoicePreset}
          onRateChange={(r) =>
            setSettings((prev) => ({ ...prev, rate: r, voicePreset: "custom" }))
          }
          onPitchChange={(p) =>
            setSettings((prev) => ({ ...prev, pitch: p, voicePreset: "custom" }))
          }
          onVolumeChange={(v) => updateSetting("volume", v)}
          onTileSizeChange={(s) => updateSetting("tileSize", s)}
          onFontSizeChange={(f) => updateSetting("fontSize", f)}
          onLanguageChange={(language) => updateSetting("language", language)}
          onThemeChange={(theme) => updateSetting("theme", theme)}
          onLayoutOrderChange={(order) => updateSetting("layoutOrder", order)}
          onPreviewVoice={handlePreviewVoice}
          onClose={handleCloseSettings}
        />
      )}

      {showAddTile && (
        <AddTileDialog
          language={settings.language}
          defaultTileSize={settings.tileSize}
          initialLabel={addTileInitialLabel}
          onSave={handleAddCustomTile}
          onClose={handleCloseAddTile}
        />
      )}

      {editingTile && (
        <AddTileDialog
          language={settings.language}
          initialSymbol={editingTile}
          defaultTileSize={settings.tileSize}
          onSave={(data) => handleUpdateCustomTile(editingTile, data)}
          onClose={handleCloseEditTile}
        />
      )}

      {showManageBoards && (
        <ManageBoardsDialog
          language={settings.language}
          userBoards={userBoards}
          onUpdateUserBoards={handleUpdateUserBoards}
          onClose={handleCloseManageBoards}
        />
      )}

      {showImportExport && (
        <ImportExportDialog
          language={settings.language}
          allCategories={allCategories}
          onImportBoards={handleImportBoards}
          onClose={handleCloseImportExport}
        />
      )}
    </div>
  );
}
