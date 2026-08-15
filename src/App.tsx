import { useState, useCallback } from "react";
import type { Symbol } from "./data/vocabulary";
import { useSpeech } from "./hooks/useSpeech";
import { useAppSettings } from "./hooks/useAppSettings";
import { useBoards } from "./hooks/useBoards";
import { useSentence } from "./hooks/useSentence";
import { SentenceBar } from "./components/SentenceBar";
import { CategoryNav } from "./components/CategoryNav";
import { SymbolGrid } from "./components/SymbolGrid";
import { Settings } from "./components/Settings";
import { AddTileDialog } from "./components/AddTileDialog";
import { ManageBoardsDialog } from "./components/ManageBoardsDialog";
import { t } from "./i18n";
import { useRestoreFocus } from "./hooks/useRestoreFocus";
import "./App.css";

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSetting, applyVoicePreset, updateRate, updatePitch } = useAppSettings();
  const {
    boards,
    setBoards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    allSymbols,
    addTile,
    deleteTile,
    reorderTiles,
    updateTile,
  } = useBoards();
  const [showAddTile, setShowAddTile] = useState(false);
  const [addTileInitialLabel, setAddTileInitialLabel] = useState<string | undefined>();
  const [editingTile, setEditingTile] = useState<Symbol | null>(null);
  const [showManageBoards, setShowManageBoards] = useState(false);
  const [isEditingTiles, setIsEditingTiles] = useState(false);

  const { capture: captureFocus, restore: restoreFocus } = useRestoreFocus();

  const handleOpenSettings = useCallback(() => {
    captureFocus();
    setShowSettings(true);
  }, [captureFocus]);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    restoreFocus();
  }, [restoreFocus]);

  const handleOpenAddTile = useCallback(
    (initialLabel?: string) => {
      captureFocus();
      setEditingTile(null);
      setAddTileInitialLabel(initialLabel);
      setShowAddTile(true);
    },
    [captureFocus],
  );

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
    [captureFocus],
  );

  const handleCloseEditTile = useCallback(() => {
    setEditingTile(null);
    restoreFocus();
  }, [restoreFocus]);

  const handleAddToBoard = useCallback(
    (word: string) => {
      handleOpenAddTile(word);
    },
    [handleOpenAddTile],
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

  const { sentence, selectSymbol, speakSentence, speakWord, removeLast, removeWord, clear } =
    useSentence({
      sentenceBuilderEnabled: settings.sentenceBuilderEnabled,
      volume: settings.volume,
      speak,
    });

  const handleAddCustomTile = useCallback(
    (tile: Omit<Symbol, "id">) => {
      addTile(tile);
      handleCloseAddTile();
    },
    [addTile, handleCloseAddTile],
  );

  const handleUpdateCustomTile = useCallback(
    (sym: Symbol, data: Omit<Symbol, "id">) => {
      updateTile(sym, data);
      handleCloseEditTile();
    },
    [handleCloseEditTile, updateTile],
  );

  const handlePreviewVoice = useCallback(
    (voiceId: string) => {
      const sampleText = t(settings.language, "voicePreviewSample");
      previewVoice(voiceId, sampleText);
    },
    [previewVoice, settings.language],
  );

  return (
    <div className="app" data-layout={settings.layoutOrder}>
      <a href="#main-content" className="skip-link">
        {t(settings.language, "skipToMain")}
      </a>

      {settings.sentenceBuilderEnabled && (
        <SentenceBar
          sentence={sentence}
          speaking={speaking}
          onSpeak={speakSentence}
          onClear={clear}
          onRemoveLast={removeLast}
          onRemoveWord={removeWord}
          onSpeakWord={speakWord}
          language={settings.language}
          allSymbols={allSymbols}
          onSelectSymbol={selectSymbol}
          onAddToBoard={handleAddToBoard}
        />
      )}

      <CategoryNav
        categories={boards}
        activeId={activeBoardId}
        onSelect={(id) => {
          setActiveBoardId(id);
          setIsEditingTiles(false);
        }}
        onManageBoards={handleOpenManageBoards}
        onOpenSettings={handleOpenSettings}
        language={settings.language}
        sentenceBuilderEnabled={settings.sentenceBuilderEnabled}
        onToggleSentenceBuilder={() =>
          updateSetting("sentenceBuilderEnabled", !settings.sentenceBuilderEnabled)
        }
        canEditActiveBoard={(activeBoard?.symbols.length ?? 0) > 0}
        isEditingActiveBoard={isEditingTiles}
        onToggleEditActiveBoard={() => setIsEditingTiles((prev) => !prev)}
      />

      <SymbolGrid
        symbols={activeBoard?.symbols ?? []}
        tileSize={settings.tileSize}
        onSelect={selectSymbol}
        language={settings.language}
        onAddWord={handleOpenAddTile}
        onDeleteSymbol={deleteTile}
        onEditSymbol={handleOpenEditTile}
        onReorderSymbols={reorderTiles}
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
          onRateChange={updateRate}
          onPitchChange={updatePitch}
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
          userBoards={boards}
          onUpdateUserBoards={setBoards}
          onClose={handleCloseManageBoards}
        />
      )}
    </div>
  );
}
