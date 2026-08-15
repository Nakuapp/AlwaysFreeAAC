import { lazy, Suspense, useState, useCallback, useRef } from "react";
import type { Symbol } from "../domain";
import { useSpeech } from "../speech";
import { useAppSettings } from "../features/settings/state";
import { useBoards, CategoryNav, SymbolGrid } from "../features/board";
import { useSentence, SentenceBar } from "../features/sentence";
import { NotificationRegion } from "../components/feedback";
import { DialogLoading } from "../components/dialog";
import { t, type Language } from "../i18n";
import { useAppDialogs } from "./useAppDialogs";
import { useNotifications } from "./useNotifications";
import "./App.css";

const Settings = lazy(() =>
  import("../features/settings").then((module) => ({ default: module.Settings })),
);
const AddTileDialog = lazy(() =>
  import("../features/tile-editor").then((module) => ({ default: module.AddTileDialog })),
);

export default function App() {
  const { notifications, notify, dismiss } = useNotifications();
  const languageRef = useRef<Language>("en");
  const handleSettingsError = useCallback(
    () => notify(t(languageRef.current, "settingsPersistenceError"), "error"),
    [notify],
  );
  const { settings, updateSetting, applyVoicePreset, updateRate, updatePitch } =
    useAppSettings(handleSettingsError);
  languageRef.current = settings.language;
  const handleBoardError = useCallback(
    () => notify(t(languageRef.current, "boardPersistenceError"), "error"),
    [notify],
  );
  const {
    boards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    allSymbols,
    addTile,
    deleteTile,
    reorderTiles,
    updateTile,
    createBoard,
    deleteBoard,
    renameBoard,
    moveBoard,
    importBoards,
  } = useBoards(handleBoardError);
  const [isEditingTiles, setIsEditingTiles] = useState(false);
  const { dialog, openAddTile, openEditTile, openManageBoards, closeDialog } = useAppDialogs();

  const { speak, previewVoice, speaking, voices } = useSpeech({
    rate: settings.rate,
    pitch: settings.pitch,
    volume: settings.volume,
    voiceName: settings.voiceName || undefined,
    onError: () => notify(t(settings.language, "speechOperationError"), "error"),
  });

  const { sentence, selectSymbol, speakSentence, speakWord, removeLast, removeWord, clear } =
    useSentence({
      sentenceBuilderEnabled: settings.sentenceBuilderEnabled,
      volume: settings.volume,
      speak,
      onError: () => notify(t(settings.language, "audioPlaybackError"), "error"),
    });

  const handleAddCustomTile = useCallback(
    (tile: Omit<Symbol, "id">) => {
      addTile(tile);
      closeDialog();
    },
    [addTile, closeDialog],
  );

  const handleUpdateCustomTile = useCallback(
    (sym: Symbol, data: Omit<Symbol, "id">) => {
      updateTile(sym, data);
      closeDialog();
    },
    [closeDialog, updateTile],
  );

  const handlePreviewVoice = useCallback(
    (voiceId: string) => {
      const sampleText = t(settings.language, "voicePreviewSample");
      previewVoice(voiceId, sampleText);
    },
    [previewVoice, settings.language],
  );

  return (
    <div
      className={`app${settings.sentenceBuilderEnabled ? " app--sentence-builder-enabled" : " app--sentence-builder-disabled"}`}
      data-layout={settings.layoutOrder}
    >
      <NotificationRegion
        notifications={notifications}
        closeLabel={t(settings.language, "close")}
        onDismiss={dismiss}
      />
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
          onAddToBoard={openAddTile}
        />
      )}

      <CategoryNav
        categories={boards}
        activeId={activeBoardId}
        onSelect={(id) => {
          setActiveBoardId(id);
          setIsEditingTiles(false);
        }}
        onManageBoards={openManageBoards}
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
        onAddWord={() => openAddTile()}
        onDeleteSymbol={deleteTile}
        onEditSymbol={openEditTile}
        onReorderSymbols={reorderTiles}
        isEditMode={isEditingTiles}
      />

      <Suspense fallback={<DialogLoading language={settings.language} />}>
        {dialog?.type === "settings" && (
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
            initialTab={dialog.tab}
            userBoards={boards}
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
            onCreateBoard={createBoard}
            onDeleteBoard={deleteBoard}
            onRenameBoard={renameBoard}
            onMoveBoard={moveBoard}
            onImportBoards={importBoards}
            onExportError={() => notify(t(settings.language, "boardExportError"), "error")}
            onClose={closeDialog}
          />
        )}

        {dialog?.type === "addTile" && (
          <AddTileDialog
            language={settings.language}
            defaultTileSize={settings.tileSize}
            initialLabel={dialog.initialLabel}
            onSave={handleAddCustomTile}
            onClose={closeDialog}
            onError={() => notify(t(settings.language, "audioPlaybackError"), "error")}
          />
        )}

        {dialog?.type === "editTile" && (
          <AddTileDialog
            language={settings.language}
            initialSymbol={dialog.symbol}
            defaultTileSize={settings.tileSize}
            onSave={(data) => handleUpdateCustomTile(dialog.symbol, data)}
            onClose={closeDialog}
            onError={() => notify(t(settings.language, "audioPlaybackError"), "error")}
          />
        )}
      </Suspense>
    </div>
  );
}
