import { useState, useId, type ReactNode } from "react";
import { AppWindow, Languages, Settings as SettingsIcon, Volume2 } from "lucide-react";
import type { VoiceOption } from "../hooks/useSpeech";
import { t, type Language, type Theme, type LayoutOrder } from "../i18n";
import type { TileSize } from "../data/vocabulary";
import type { ThemeAccent } from "../domain/models";
import { Dialog } from "./Dialog";
import { AppSettingsTab } from "./settings/AppSettingsTab";
import { DisplaySettingsTab } from "./settings/DisplaySettingsTab";
import { SpeechSettingsTab } from "./settings/SpeechSettingsTab";
import "./Settings.css";

type SettingsTab = "speech" | "display" | "app";

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
  onClose,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("speech");
  const tabPanelId = useId();

  const tabs: Array<{ id: SettingsTab; label: string; icon: ReactNode }> = [
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
          <SettingsIcon
            className="settings-panel__title-icon"
            aria-hidden="true"
            focusable="false"
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
              onKeyDown={(e) => {
                const ids = tabs.map((t) => t.id);
                const idx = ids.indexOf(tab.id);
                if (e.key === "ArrowRight") {
                  setActiveTab(ids[(idx + 1) % ids.length]);
                } else if (e.key === "ArrowLeft") {
                  setActiveTab(ids[(idx - 1 + ids.length) % ids.length]);
                } else if (e.key === "Home") {
                  setActiveTab(ids[0]);
                } else if (e.key === "End") {
                  setActiveTab(ids[ids.length - 1]);
                }
              }}
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
