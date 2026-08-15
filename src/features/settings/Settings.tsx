import { useState, useId, type ReactNode } from "react";
import { AppWindow, Languages, LayoutGrid, Volume2 } from "lucide-react";
import type { VoiceOption } from "../../speech";
import { t, type Language, type Theme, type LayoutOrder } from "../../i18n";
import type { ThemeAccent, TileSize, UserBoard } from "../../domain";
import { handleTabKeyDown } from "../../utils/tabNavigation";
import { Dialog } from "../../components/dialog";
import { BoardsSettingsTab } from "../board-manager";
import { AppSettingsTab } from "./AppSettingsTab";
import { DisplaySettingsTab } from "./DisplaySettingsTab";
import { SpeechSettingsTab } from "./SpeechSettingsTab";
import "./Settings.css";

export type SettingsTab = "speech" | "display" | "boards" | "app";

interface SettingsProps {
  voices: VoiceOption[];
  selectedVoice: string;
  voicePreset: string;
  rate: number;
  pitch: number;
  volume: number;
  tileSize: TileSize;
  fontSize: number;
  language: Language;
  theme: Theme;
  themeAccent: ThemeAccent;
  layoutOrder: LayoutOrder;
  sentenceBuilderEnabled: boolean;
  initialTab?: SettingsTab;
  userBoards: UserBoard[];
  onVoiceChange: (name: string) => void;
  onVoicePresetChange: (preset: string) => void;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onVolumeChange: (volume: number) => void;
  onTileSizeChange: (size: TileSize) => void;
  onFontSizeChange: (size: number) => void;
  onLanguageChange: (language: Language) => void;
  onThemeChange: (theme: Theme) => void;
  onThemeAccentChange: (accent: ThemeAccent) => void;
  onLayoutOrderChange: (order: LayoutOrder) => void;
  onSentenceBuilderToggle: (enabled: boolean) => void;
  onPreviewVoice: (voiceId: string) => void;
  onCreateBoard: (label: string, emoji: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onRenameBoard: (boardId: string, label: string) => void;
  onMoveBoard: (boardId: string, direction: -1 | 1) => void;
  onImportBoards: (boards: UserBoard[]) => void;
  onExportError?: (error: Error) => void;
  onClose: () => void;
}

export function Settings({
  voices,
  selectedVoice,
  voicePreset,
  rate,
  pitch,
  volume,
  tileSize,
  fontSize,
  language,
  theme,
  themeAccent,
  layoutOrder,
  sentenceBuilderEnabled,
  initialTab = "boards",
  userBoards,
  onVoiceChange,
  onVoicePresetChange,
  onRateChange,
  onPitchChange,
  onVolumeChange,
  onTileSizeChange,
  onFontSizeChange,
  onLanguageChange,
  onThemeChange,
  onThemeAccentChange,
  onLayoutOrderChange,
  onSentenceBuilderToggle,
  onPreviewVoice,
  onCreateBoard,
  onDeleteBoard,
  onRenameBoard,
  onMoveBoard,
  onImportBoards,
  onExportError,
  onClose,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const tabPanelId = useId();

  const tabs: Array<{ id: SettingsTab; label: string; icon: ReactNode }> = [
    {
      id: "boards",
      label: t(language, "manageBoards"),
      icon: <LayoutGrid className="dialog-tab__icon" aria-hidden="true" focusable="false" />,
    },
    {
      id: "speech",
      label: t(language, "settingsTabSpeech"),
      icon: <Volume2 className="dialog-tab__icon" aria-hidden="true" focusable="false" />,
    },
    {
      id: "display",
      label: t(language, "settingsTabDisplay"),
      icon: <AppWindow className="dialog-tab__icon" aria-hidden="true" focusable="false" />,
    },
    {
      id: "app",
      label: t(language, "settingsTabApp"),
      icon: <Languages className="dialog-tab__icon" aria-hidden="true" focusable="false" />,
    },
  ];

  return (
    <Dialog
      title={
        <>
          <img
            src={import.meta.env.BASE_URL + "brand/logo-150.png"}
            className="category-nav__logo"
            alt=""
            aria-hidden="true"
          />
          {t(language, "settings")}
        </>
      }
      titleId="settings-title"
      closeLabel={t(language, "closeSettings")}
      onClose={onClose}
      maxWidth="480px"
      maxHeight="90vh"
      dismissOnOverlayClick
      panelClassName="settings-panel dialog-panel--round-close"
      bodyClassName="settings-panel__body"
      headerExtension={
        <div className="dialog-tabs" role="tablist" aria-label={t(language, "settings")}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`settings-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`${tabPanelId}-${tab.id}`}
              className={`dialog-tab${activeTab === tab.id ? " dialog-tab--active" : ""}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onKeyDown={(event) =>
                handleTabKeyDown(
                  event,
                  tabs.map((item) => item.id),
                  tab.id,
                  setActiveTab,
                )
              }
            >
              {tab.icon}
              <span className="dialog-tab__label">{tab.label}</span>
            </button>
          ))}
        </div>
      }
      footer={
        <button className="dialog-done-btn" onClick={onClose} type="button">
          {t(language, "done")}
        </button>
      }
    >
      <SpeechSettingsTab
        id={`${tabPanelId}-speech`}
        hidden={activeTab !== "speech"}
        language={language}
        voices={voices}
        selectedVoice={selectedVoice}
        voicePreset={voicePreset}
        rate={rate}
        pitch={pitch}
        volume={volume}
        onVoiceChange={onVoiceChange}
        onVoicePresetChange={onVoicePresetChange}
        onRateChange={onRateChange}
        onPitchChange={onPitchChange}
        onVolumeChange={onVolumeChange}
        onPreviewVoice={onPreviewVoice}
      />

      <DisplaySettingsTab
        id={`${tabPanelId}-display`}
        hidden={activeTab !== "display"}
        language={language}
        theme={theme}
        themeAccent={themeAccent}
        layoutOrder={layoutOrder}
        tileSize={tileSize}
        fontSize={fontSize}
        onThemeChange={onThemeChange}
        onThemeAccentChange={onThemeAccentChange}
        onLayoutOrderChange={onLayoutOrderChange}
        onTileSizeChange={onTileSizeChange}
        onFontSizeChange={onFontSizeChange}
      />
      <BoardsSettingsTab
        id={`${tabPanelId}-boards`}
        hidden={activeTab !== "boards"}
        language={language}
        userBoards={userBoards}
        onCreateBoard={onCreateBoard}
        onDeleteBoard={onDeleteBoard}
        onRenameBoard={onRenameBoard}
        onMoveBoard={onMoveBoard}
        onImportBoards={onImportBoards}
        onExportError={onExportError}
      />
      <AppSettingsTab
        id={`${tabPanelId}-app`}
        hidden={activeTab !== "app"}
        language={language}
        sentenceBuilderEnabled={sentenceBuilderEnabled}
        onLanguageChange={onLanguageChange}
        onSentenceBuilderToggle={onSentenceBuilderToggle}
      />
    </Dialog>
  );
}
