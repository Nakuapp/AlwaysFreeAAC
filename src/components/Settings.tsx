import { useEffect, useRef, useState, useCallback, useId, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import {
  AppWindow,
  Grid3X3,
  Languages,
  MoonStar,
  Music,
  PanelTop,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Type,
  Volume2,
  X,
  Cpu,
  Info,
} from "lucide-react";
import type { VoiceOption } from "../hooks/useSpeech";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { LANGUAGE_OPTIONS, t, type Language, type Theme, type LayoutOrder } from "../i18n";
import type { TileSize } from "../data/vocabulary";
import { TILE_SIZES, TILE_SIZE_COLUMNS } from "../tileSize";
import "./Settings.css";

type SettingsTab = "speech" | "display" | "app";

interface SettingsProps {
  voices: VoiceOption[];
  availableEngines: string[];
  selectedVoice: string;
  voicePreset: string;
  rate: number;
  pitch: number;
  volume: number;
  tileSize: TileSize;
  fontSize: number;
  language: Language;
  theme: Theme;
  layoutOrder: LayoutOrder;
  onVoiceChange: (name: string) => void;
  onVoicePresetChange: (preset: string) => void;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onVolumeChange: (volume: number) => void;
  onTileSizeChange: (size: TileSize) => void;
  onFontSizeChange: (size: number) => void;
  onLanguageChange: (language: Language) => void;
  onThemeChange: (theme: Theme) => void;
  onLayoutOrderChange: (order: LayoutOrder) => void;
  onPreviewVoice: (voiceId: string) => void;
  onClose: () => void;
}

export function Settings({
  voices,
  availableEngines,
  selectedVoice,
  voicePreset,
  rate,
  pitch,
  volume,
  tileSize,
  fontSize,
  language,
  theme,
  layoutOrder,
  onVoiceChange,
  onVoicePresetChange,
  onRateChange,
  onPitchChange,
  onVolumeChange,
  onTileSizeChange,
  onFontSizeChange,
  onLanguageChange,
  onThemeChange,
  onLayoutOrderChange,
  onPreviewVoice,
  onClose,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("speech");
  const [voiceFilter, setVoiceFilter] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<string>("");
  const platform = Capacitor.getPlatform();
  const panelRef = useRef<HTMLDivElement>(null);
  const tabPanelId = useId();
  useFocusTrap(panelRef);

  // When the engine selection changes, reset voice filter
  const handleEngineChange = useCallback((engine: string) => {
    setSelectedEngine(engine);
    setVoiceFilter("");
  }, []);

  // When engine changes and current voice is from a different engine, switch to first available
  useEffect(() => {
    if (!selectedEngine) return;
    const currentVoiceEngine = voices.find((v) => v.id === selectedVoice)?.engine;
    if (currentVoiceEngine && currentVoiceEngine !== selectedEngine) {
      const firstVoiceForEngine = voices.find((v) => v.engine === selectedEngine);
      if (firstVoiceForEngine) onVoiceChange(firstVoiceForEngine.id);
    }
  }, [selectedEngine, selectedVoice, voices, onVoiceChange]);

  const normalizedFilter = voiceFilter.trim().toLowerCase();

  const engineFilteredVoices = selectedEngine
    ? voices.filter((v) => v.engine === selectedEngine)
    : voices;

  const filteredVoices = normalizedFilter
    ? engineFilteredVoices.filter(
        (v) =>
          v.name.toLowerCase().includes(normalizedFilter) ||
          v.lang.toLowerCase().includes(normalizedFilter)
      )
    : engineFilteredVoices;

  const showEngineSelector = availableEngines.length > 1;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const tabs: Array<{ id: SettingsTab; label: string; icon: ReactNode }> = [
    {
      id: "speech",
      label: t(language, "settingsTabSpeech"),
      icon: <Volume2 className="settings-tab__icon" aria-hidden="true" focusable="false" />,
    },
    {
      id: "display",
      label: t(language, "settingsTabDisplay"),
      icon: <AppWindow className="settings-tab__icon" aria-hidden="true" focusable="false" />,
    },
    {
      id: "app",
      label: t(language, "settingsTabApp"),
      icon: <Languages className="settings-tab__icon" aria-hidden="true" focusable="false" />,
    },
  ];

  return (
    <div className="settings-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        ref={panelRef}
      >
        {/* Header */}
        <div className="settings-panel__header">
          <h2 className="settings-panel__title" id="settings-title">
            <SettingsIcon className="settings-panel__title-icon" aria-hidden="true" focusable="false" />
            {t(language, "settings")}
          </h2>
          <button
            className="settings-panel__close"
            onClick={onClose}
            aria-label={t(language, "closeSettings")}
            type="button"
            autoFocus
          >
            <X className="settings-panel__close-icon" aria-hidden="true" focusable="false" />
          </button>
        </div>

        {/* Tab bar */}
        <div
          className="settings-tabs"
          role="tablist"
          aria-label={t(language, "settings")}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`settings-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`${tabPanelId}-${tab.id}`}
              className={`settings-tab${activeTab === tab.id ? " settings-tab--active" : ""}`}
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
              <span className="settings-tab__label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="settings-panel__body">

          {/* ── Speech tab ── */}
          <div
            id={`${tabPanelId}-speech`}
            role="tabpanel"
            aria-labelledby="settings-tab-speech"
            hidden={activeTab !== "speech"}
            className="settings-tabpanel"
          >
            {/* TTS Engine (only shown when multiple engines detected) */}
            {showEngineSelector && (
              <div className="settings-field">
                <label className="settings-field__label" htmlFor="engine-select">
                  <Cpu className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                  {t(language, "ttsEngine")}
                </label>
                <select
                  id="engine-select"
                  className="settings-field__select"
                  value={selectedEngine}
                  onChange={(e) => handleEngineChange(e.target.value)}
                >
                  <option value="">{t(language, "ttsEngineAll")}</option>
                  {availableEngines.map((eng) => (
                    <option key={eng} value={eng}>{eng}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Voice selection */}
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="voice-select">
                <Volume2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "voice")}
              </label>
              {voices.length === 0 ? (
                <p className="settings-field__hint">{t(language, "noVoices")}</p>
              ) : (
                <>
                  <div className="settings-field__voice-row">
                    <input
                      id="voice-filter"
                      type="search"
                      className="settings-field__search settings-field__search--inline"
                      placeholder={t(language, "voiceFilterPlaceholder")}
                      aria-label={t(language, "voiceFilterLabel")}
                      value={voiceFilter}
                      onChange={(e) => setVoiceFilter(e.target.value)}
                    />
                    <button
                      type="button"
                      className="settings-field__preview-btn"
                      onClick={() => onPreviewVoice(selectedVoice || (filteredVoices[0]?.id ?? ""))}
                      aria-label={t(language, "previewVoice")}
                      title={t(language, "previewVoice")}
                    >
                      <Volume2 className="settings-field__preview-icon" aria-hidden="true" focusable="false" />
                    </button>
                  </div>
                  <select
                    id="voice-select"
                    className="settings-field__select"
                    value={selectedVoice}
                    onChange={(e) => onVoiceChange(e.target.value)}
                  >
                    <option value="">{t(language, "defaultVoice")}</option>
                    {Array.from(
                      filteredVoices.reduce((groups, v) => {
                        const lang = v.lang.split("-")[0].toUpperCase();
                        if (!groups.has(lang)) groups.set(lang, []);
                        groups.get(lang)!.push(v);
                        return groups;
                      }, new Map<string, VoiceOption[]>()),
                      ([lang, group]) => (
                        <optgroup key={lang} label={lang}>
                          {group.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                              {v.isNetworkConnectionRequired ? ` ${t(language, "onlineVoiceSuffix")}` : ""}
                            </option>
                          ))}
                        </optgroup>
                      )
                    )}
                  </select>
                  {filteredVoices.length === 0 && voiceFilter.trim() && (
                    <p className="settings-field__hint">{t(language, "voiceFilterNoMatch")}</p>
                  )}
                  {platform !== "ios" && (
                    <p className="settings-field__tip">
                      <Info className="settings-field__tip-icon" aria-hidden="true" focusable="false" />{" "}
                      {t(language, platform === "android" ? "moreVoicesTipAndroid" : "moreVoicesTipWeb")}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Vocal style */}
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="voice-preset-select">
                <Music className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "vocalStyle")}
              </label>
              <select
                id="voice-preset-select"
                className="settings-field__select"
                value={voicePreset}
                onChange={(e) => onVoicePresetChange(e.target.value)}
              >
                <option value="custom">{t(language, "customNatural")}</option>
                <option value="baritone">{t(language, "baritone")}</option>
                <option value="alto">{t(language, "alto")}</option>
                <option value="soprano">{t(language, "soprano")}</option>
                <option value="bass">{t(language, "bass")}</option>
              </select>
            </div>

            {/* Speed */}
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="rate-range">
                <SlidersHorizontal className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "speed")}:{" "}
                <strong>{rate === 1 ? t(language, "normal") : rate < 1 ? t(language, "slow") : t(language, "fast")} ({rate}×)</strong>
              </label>
              <input
                id="rate-range"
                type="range"
                className="settings-field__range"
                min={0.5}
                max={2}
                step={0.1}
                value={rate}
                aria-valuetext={`${rate === 1 ? t(language, "normal") : rate < 1 ? t(language, "slow") : t(language, "fast")} (${rate}×)`}
                onChange={(e) => onRateChange(Number(e.target.value))}
              />
              <div className="settings-field__range-labels" aria-hidden="true">
                <span>{t(language, "slower")}</span>
                <span>{t(language, "faster")}</span>
              </div>
            </div>

            {/* Pitch */}
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="pitch-range">
                <Music className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "pitch")}:{" "}
                <strong>{pitch === 1 ? t(language, "normal") : pitch < 1 ? t(language, "lower") : t(language, "higher")} ({pitch})</strong>
              </label>
              <input
                id="pitch-range"
                type="range"
                className="settings-field__range"
                min={0.5}
                max={2}
                step={0.1}
                value={pitch}
                aria-valuetext={`${pitch === 1 ? t(language, "normal") : pitch < 1 ? t(language, "lower") : t(language, "higher")} (${pitch})`}
                onChange={(e) => onPitchChange(Number(e.target.value))}
              />
              <div className="settings-field__range-labels" aria-hidden="true">
                <span>{t(language, "lower")}</span>
                <span>{t(language, "higher")}</span>
              </div>
            </div>

            {/* Volume */}
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="volume-range">
                <Volume2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "volume")}:{" "}
                <strong>{Math.round(volume * 100)}%</strong>
              </label>
              <input
                id="volume-range"
                type="range"
                className="settings-field__range"
                min={0.2}
                max={1}
                step={0.1}
                value={volume}
                aria-valuetext={`${Math.round(volume * 100)}%`}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
              />
              <div className="settings-field__range-labels" aria-hidden="true">
                <span>{t(language, "softer")}</span>
                <span>{t(language, "louder")}</span>
              </div>
            </div>
          </div>

          {/* ── Display tab ── */}
          <div
            id={`${tabPanelId}-display`}
            role="tabpanel"
            aria-labelledby="settings-tab-display"
            hidden={activeTab !== "display"}
            className="settings-tabpanel"
          >
            {/* Theme */}
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="theme-select">
                <MoonStar className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "theme")}
              </label>
              <select
                id="theme-select"
                className="settings-field__select"
                value={theme}
                onChange={(e) => onThemeChange(e.target.value as Theme)}
              >
                <option value="light">{t(language, "light")}</option>
                <option value="dark">{t(language, "dark")}</option>
              </select>
            </div>

            {/* Layout order */}
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="layout-order-select">
                <PanelTop className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "layoutOrder")}
              </label>
              <select
                id="layout-order-select"
                className="settings-field__select"
                value={layoutOrder}
                onChange={(e) => onLayoutOrderChange(e.target.value as LayoutOrder)}
              >
                <option value="tabs-top">{t(language, "layoutTabsTop")}</option>
                <option value="speech-top">{t(language, "layoutSpeechTop")}</option>
              </select>
            </div>

            {/* Grid size */}
            <div className="settings-field">
              <span className="settings-field__label" id="grid-size-label">
                <Grid3X3 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "gridSize")}
              </span>
              <div
                className="settings-tile-size-picker"
                role="group"
                aria-labelledby="grid-size-label"
              >
                {TILE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`settings-tile-size-btn${tileSize === size ? " settings-tile-size-btn--active" : ""}`}
                    onClick={() => onTileSizeChange(size)}
                    aria-pressed={tileSize === size}
                    aria-label={`${size.toUpperCase()} – ${TILE_SIZE_COLUMNS[size]} ${t(language, "columns")}`}
                  >
                    <span className="settings-tile-size-btn__label">{size.toUpperCase()}</span>
                    <span className="settings-tile-size-btn__hint" aria-hidden="true">{TILE_SIZE_COLUMNS[size]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text size */}
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="font-range">
                <Type className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "textSize")}:{" "}
                <strong>{fontSize}px</strong>
              </label>
              <input
                id="font-range"
                type="range"
                className="settings-field__range"
                min={12}
                max={24}
                step={1}
                value={fontSize}
                aria-valuetext={`${fontSize}px`}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
              />
              <div className="settings-field__range-labels" aria-hidden="true">
                <span>{t(language, "smaller")}</span>
                <span>{t(language, "larger")}</span>
              </div>
            </div>
          </div>

          {/* ── App tab ── */}
          <div
            id={`${tabPanelId}-app`}
            role="tabpanel"
            aria-labelledby="settings-tab-app"
            hidden={activeTab !== "app"}
            className="settings-tabpanel"
          >
            {/* Language */}
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="language-select">
                <Languages className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "language")}
              </label>
              <select
                id="language-select"
                className="settings-field__select"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="settings-panel__footer">
          <button className="settings-panel__done" onClick={onClose} type="button">
            {t(language, "done")}
          </button>
        </div>
      </div>
    </div>
  );
}
