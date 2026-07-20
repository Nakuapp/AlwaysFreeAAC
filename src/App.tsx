import { useState, useCallback, useEffect, useMemo } from "react";
import type { Symbol } from "./data/vocabulary";
import { useSpeech } from "./hooks/useSpeech";
import { SentenceBar } from "./components/SentenceBar";
import { CategoryNav } from "./components/CategoryNav";
import { SymbolGrid } from "./components/SymbolGrid";
import { Settings } from "./components/Settings";
import { AddTileDialog } from "./components/AddTileDialog";
import { ManageBoardsDialog } from "./components/ManageBoardsDialog";
import { t } from "./i18n";
import { useRestoreFocus } from "./hooks/useRestoreFocus";
import { loadSettings, saveSettings, type AppSettings } from "./appState/settings";
import { DEFAULT_WELCOME_BOARD, loadUserBoards, saveUserBoards } from "./appState/userBoards";
import "./App.css";

export type { UserBoard } from "./types/userBoard";

export default function App() {
  const [sentence, setSentence] = useState<Symbol[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [userBoards, setUserBoards] = useState(() => {
    const boards = loadUserBoards();
    return boards.length > 0 ? boards : [DEFAULT_WELCOME_BOARD];
  });
  const [showAddTile, setShowAddTile] = useState(false);
  const [addTileInitialLabel, setAddTileInitialLabel] = useState<string | undefined>();
  const [editingTile, setEditingTile] = useState<Symbol | null>(null);
  const [showManageBoards, setShowManageBoards] = useState(false);
  const [isEditingTiles, setIsEditingTiles] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    () => userBoards[0].id
  );

  useEffect(() => {
    if (userBoards.length > 0 && !userBoards.find((c) => c.id === activeCategoryId)) {
      setActiveCategoryId(userBoards[0].id);
    }
  }, [userBoards, activeCategoryId]);

  const activeCategory = userBoards.find((c) => c.id === activeCategoryId) ?? userBoards[0];

  const allSymbols = useMemo(
    () => userBoards.flatMap((c) => c.symbols),
    [userBoards]
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
      handleOpenAddTile(word);
    },
    [handleOpenAddTile]
  );

  const handleOpenManageBoards = useCallback(() => {
    captureFocus();
    setShowManageBoards(true);
  }, [captureFocus]);

  const handleCloseManageBoards = useCallback(() => {
    setShowManageBoards(false);
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
    document.documentElement.setAttribute("data-accent", settings.themeAccent);
  }, [settings.themeAccent]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  const playSymbol = useCallback((sym: Symbol) => {
    if (sym.soundFile) {
      const audio = new Audio(sym.soundFile);
      audio.volume = settings.volume;
      audio.play().catch(() => {});
    } else {
      speak(sym.speak ?? sym.label, { queueStrategy: "queue" });
    }
  }, [settings.volume, speak]);

  const handleSymbolSelect = useCallback((sym: Symbol) => {
    if (!settings.sentenceBuilderEnabled) {
      playSymbol(sym);
    } else {
      setSentence((prev) => [...prev, sym]);
    }
  }, [settings.sentenceBuilderEnabled, playSymbol]);

  const handleSpeak = useCallback(() => {
    if (sentence.length === 0) return;
    const text = sentence.map((s) => s.speak ?? s.label).join(" ");
    speak(text, { queueStrategy: "flush" });
  }, [sentence, speak]);

  const handleSpeakWord = useCallback(
    (sym: Symbol) => playSymbol(sym),
    [playSymbol]
  );

  const handleRemoveLast = useCallback(() => {
    setSentence((prev) => prev.slice(0, -1));
  }, []);

  const handleRemoveWord = useCallback((index: number) => {
    setSentence((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClear = useCallback(() => {
    setSentence([]);
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
        setSettings((prev) => ({ ...prev, voicePreset: "baritone", rate: 0.95, pitch: 0.75 }));
        return;
      case "alto":
        setSettings((prev) => ({ ...prev, voicePreset: "alto", rate: 1.05, pitch: 1.25 }));
        return;
      case "soprano":
        setSettings((prev) => ({ ...prev, voicePreset: "soprano", rate: 1.15, pitch: 1.45 }));
        return;
      case "bass":
        setSettings((prev) => ({ ...prev, voicePreset: "bass", rate: 0.85, pitch: 0.6 }));
        return;
      default:
        setSettings((prev) => ({ ...prev, voicePreset: "custom" }));
    }
  };

  return (
    <div className="app" data-layout={settings.layoutOrder}>
      <a href="#main-content" className="skip-link">
        {t(settings.language, "skipToMain")}
      </a>

      {settings.sentenceBuilderEnabled && (
        <SentenceBar
          sentence={sentence}
          speaking={speaking}
          onSpeak={handleSpeak}
          onClear={handleClear}
          onRemoveLast={handleRemoveLast}
          onRemoveWord={handleRemoveWord}
          onSpeakWord={handleSpeakWord}
          language={settings.language}
          allSymbols={allSymbols}
          onSelectSymbol={handleSymbolSelect}
          onAddToBoard={handleAddToBoard}
        />
      )}

      <CategoryNav
        categories={userBoards}
        activeId={activeCategoryId}
        onSelect={(id) => {
          setActiveCategoryId(id);
          setIsEditingTiles(false);
        }}
        onManageBoards={handleOpenManageBoards}
        onOpenSettings={handleOpenSettings}
        language={settings.language}
        sentenceBuilderEnabled={settings.sentenceBuilderEnabled}
        onToggleSentenceBuilder={() => updateSetting("sentenceBuilderEnabled", !settings.sentenceBuilderEnabled)}
        canEditActiveBoard={activeCategory.symbols.length > 0}
        isEditingActiveBoard={isEditingTiles}
        onToggleEditActiveBoard={() => setIsEditingTiles((prev) => !prev)}
      />

      <SymbolGrid
        symbols={activeCategory?.symbols ?? []}
        tileSize={settings.tileSize}
        onSelect={handleSymbolSelect}
        language={settings.language}
        onAddWord={handleOpenAddTile}
        onDeleteSymbol={handleDeleteCustomTile}
        onEditSymbol={handleOpenEditTile}
        onReorderSymbols={handleReorderTiles}
        isEditMode={isEditingTiles}
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
          sentenceBuilderEnabled={settings.sentenceBuilderEnabled}
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
          onSentenceBuilderToggle={(enabled) => updateSetting("sentenceBuilderEnabled", enabled)}
          onThemeAccentChange={(accent) => updateSetting("themeAccent", accent)}
          themeAccent={settings.themeAccent}
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
          onUpdateUserBoards={setUserBoards}
          onClose={handleCloseManageBoards}
        />
      )}
    </div>
  );
}
