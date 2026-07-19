import { useState, useId, useMemo, type ReactNode } from "react";
import type React from "react";
import { Capacitor } from "@capacitor/core";
import {
  AppWindow,
  Grid3X3,
  Languages,
  MoonStar,
  Music2,
  Palette,
  PanelTop,
  Search,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Type,
  Volume2,
  Info,
} from "lucide-react";
import type { VoiceOption } from "../hooks/useSpeech";
import { LANGUAGE_OPTIONS, t, type Language, type Theme, type LayoutOrder } from "../i18n";
import type { TileSize } from "../data/vocabulary";
import { TILE_SIZES, TILE_SIZE_COLUMNS } from "../tileSize";
import { Dialog } from "./Dialog";
import "./Settings.css";

type SettingsTab = "speech" | "display" | "app";
type ThemeAccent = "blue" | "green" | "purple" | "teal" | "orange";

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

interface VoiceListOption extends VoiceOption {
  displayLabel: string;
  groupLabel: string;
  searchText: string;
}

const ACCENT_OPTIONS: Array<{ value: ThemeAccent; label: string; color: string }> = [
  { value: "blue",   label: "Blue",   color: "#1a73e8" },
  { value: "teal",   label: "Teal",   color: "#0d9488" },
  { value: "green",  label: "Green",  color: "#16a34a" },
  { value: "purple", label: "Purple", color: "#7c3aed" },
  { value: "orange", label: "Orange", color: "#ea6c00" },
];

const FRIENDLY_VOICE_TOKEN_LABELS: Record<string, string> = {
  neural: "Neural",
  neural2: "Neural 2",
  standard: "Standard",
  studio: "Studio",
  wavenet: "WaveNet",
  news: "News",
  journey: "Journey",
  premium: "Premium",
  natural: "Natural",
  compact: "Compact",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatLocaleLabel(locale: string, displayLocale: string): string {
  if (!locale) return "Voice";

  try {
    const canonical = Intl.getCanonicalLocales(locale)[0];
    const displayNames = new Intl.DisplayNames([displayLocale], { type: "language" });
    return displayNames.of(canonical) ?? canonical;
  } catch {
    return locale.replace(/-/g, " ");
  }
}

function humanizeVoiceToken(token: string): string {
  const normalized = token.trim().toLowerCase();
  if (!normalized) return "";
  if (FRIENDLY_VOICE_TOKEN_LABELS[normalized]) return FRIENDLY_VOICE_TOKEN_LABELS[normalized];

  return token
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([0-9])([A-Za-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractVoiceDescriptor(voice: VoiceOption): string | null {
  const candidates = [voice.name, voice.id];

  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;

    const looksTechnical =
      /^[a-z]{2,3}(?:[-_][A-Za-z0-9]{2,8}){2,}$/i.test(trimmed) ||
      (!/\s/.test(trimmed) && /\b(?:neural|wavenet|standard|studio|journey|news|premium|compact)\b/i.test(trimmed));

    if (!looksTechnical) continue;

    const withoutLocalePrefix = voice.lang
      ? trimmed.replace(new RegExp(`^${escapeRegExp(voice.lang)}[-_]?`, "i"), "")
      : trimmed;
    const descriptor = withoutLocalePrefix.replace(/^[a-z]{2,3}(?:[-_][A-Za-z0-9]{2,8}){1,2}[-_]?/i, "");
    const label = descriptor
      .split(/[-_]+/)
      .map(humanizeVoiceToken)
      .filter(Boolean)
      .join(" ")
      .trim();

    if (label) return label;
  }

  return null;
}

function formatVoiceLabel(voice: VoiceOption, displayLocale: string): string {
  const localeLabel = formatLocaleLabel(voice.lang, displayLocale);
  const technicalDescriptor = extractVoiceDescriptor(voice);
  if (technicalDescriptor) return `${localeLabel} — ${technicalDescriptor}`;

  const trimmedName = voice.name.trim();
  if (!trimmedName) return localeLabel;
  if (trimmedName.toLocaleLowerCase().includes(localeLabel.toLocaleLowerCase())) return trimmedName;
  return `${localeLabel} — ${trimmedName}`;
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
  const [voiceSearch, setVoiceSearch] = useState("");
  const platform = Capacitor.getPlatform();
  const tabPanelId = useId();

  const voiceDisplayLocale = language === "es" ? "es" : language === "fr" ? "fr" : "en";
  const voiceOptions = useMemo<VoiceListOption[]>(
    () =>
      voices
        .map((voice) => {
          const groupLabel = formatLocaleLabel(voice.lang, voiceDisplayLocale);
          const displayLabel = formatVoiceLabel(voice, voiceDisplayLocale);
          return {
            ...voice,
            displayLabel,
            groupLabel,
            searchText: [
              displayLabel,
              groupLabel,
              voice.name,
              voice.id,
              voice.lang,
              voice.engine,
            ]
              .join(" ")
              .toLocaleLowerCase(),
          };
        })
        .sort(
          (a, b) =>
            a.groupLabel.localeCompare(b.groupLabel, voiceDisplayLocale) ||
            a.displayLabel.localeCompare(b.displayLabel, voiceDisplayLocale)
        ),
    [voiceDisplayLocale, voices]
  );
  const visibleVoiceOptions = useMemo(() => {
    const query = voiceSearch.trim().toLocaleLowerCase();
    if (!query) return voiceOptions;

    const matched = voiceOptions.filter((voice) => voice.searchText.includes(query));
    if (selectedVoice && !matched.some((voice) => voice.id === selectedVoice)) {
      const selectedOption = voiceOptions.find((voice) => voice.id === selectedVoice);
      if (selectedOption) return [selectedOption, ...matched];
    }
    return matched;
  }, [selectedVoice, voiceOptions, voiceSearch]);
  const voiceGroups = useMemo(
    () =>
      Array.from(
        visibleVoiceOptions.reduce((groups, voice) => {
          if (!groups.has(voice.groupLabel)) groups.set(voice.groupLabel, []);
          groups.get(voice.groupLabel)!.push(voice);
          return groups;
        }, new Map<string, VoiceListOption[]>())
      ),
    [visibleVoiceOptions]
  );

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
    <Dialog
      title={
        <>
          <SettingsIcon className="settings-panel__title-icon" aria-hidden="true" focusable="false" />
          {t(language, "settings")}
        </>
      }
      titleId="settings-title"
      closeLabel={t(language, "closeSettings")}
      onClose={onClose}
      maxWidth="480px"
      maxHeight="90vh"
      dismissOnOverlayClick
      panelClassName="settings-panel"
      bodyClassName="settings-panel__body"
      headerExtension={
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
      }
      footer={
        <button className="dialog-done-btn" onClick={onClose} type="button">
          {t(language, "done")}
        </button>
      }
    >

          {/* ── Speech tab ── */}
          <div
            id={`${tabPanelId}-speech`}
            role="tabpanel"
            aria-labelledby="settings-tab-speech"
            hidden={activeTab !== "speech"}
            className="settings-tabpanel"
          >
            {/* Voice selection — shown whenever voices are available */}
            {voices.length > 0 && (
              <div className="settings-field">
                <label className="settings-field__label" htmlFor="voice-select">
                  <Volume2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                  {t(language, "voice")}
                </label>
                <label className="settings-field__label settings-field__label--subtle" htmlFor="voice-search">
                  <Search className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                  {t(language, "voiceFilterLabel")}
                </label>
                <input
                  id="voice-search"
                  type="search"
                  className="settings-field__search"
                  placeholder={t(language, "voiceFilterPlaceholder")}
                  value={voiceSearch}
                  onChange={(e) => setVoiceSearch(e.target.value)}
                />
                {visibleVoiceOptions.length === 0 ? (
                  <p className="settings-field__hint">{t(language, "voiceFilterNoMatch")}</p>
                ) : (
                  <>
                    <div className="settings-field__voice-row">
                      <select
                        id="voice-select"
                        className="settings-field__select settings-field__select--inline"
                        value={selectedVoice}
                        onChange={(e) => onVoiceChange(e.target.value)}
                      >
                        <option value="">{t(language, "defaultVoice")}</option>
                        {voiceGroups.map(([groupLabel, group]) => (
                          <optgroup key={groupLabel} label={groupLabel}>
                            {group.map((voice) => (
                              <option key={voice.id} value={voice.id}>
                                {voice.displayLabel}
                                {voice.isNetworkConnectionRequired ? ` ${t(language, "onlineVoiceSuffix")}` : ""}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="settings-field__preview-btn"
                        onClick={() => onPreviewVoice(selectedVoice || (visibleVoiceOptions[0]?.id ?? ""))}
                        aria-label={t(language, "previewVoice")}
                        title={t(language, "previewVoice")}
                      >
                        <Volume2 className="settings-field__preview-icon" aria-hidden="true" focusable="false" />
                      </button>
                    </div>
                    {platform !== "ios" && (
                      <p className="settings-field__tip">
                        <Info className="settings-field__tip-icon" aria-hidden="true" focusable="false" />{" "}
                        {t(language, platform === "android" ? "moreVoicesTipAndroid" : "moreVoicesTipWeb")}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Vocal style */}
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="voice-preset-select">
                <Music2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
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
                <Music2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
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

            {/* Accent color */}
            <div className="settings-field">
              <span className="settings-field__label" id="accent-color-label">
                <Palette className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "accentColor")}
              </span>
              <div
                className="settings-accent-picker"
                role="group"
                aria-labelledby="accent-color-label"
              >
                {ACCENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`settings-accent-swatch${themeAccent === opt.value ? " settings-accent-swatch--active" : ""}`}
                    style={{ "--swatch-color": opt.color } as React.CSSProperties}
                    onClick={() => onThemeAccentChange(opt.value)}
                    aria-pressed={themeAccent === opt.value}
                    aria-label={opt.label}
                    title={opt.label}
                  />
                ))}
              </div>
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

            {/* Sentence Builder toggle */}
            <div className="settings-field">
              <span className="settings-field__label">
                <Music2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
                {t(language, "sentenceBuilderMode")}
              </span>
              <div className="settings-toggle-group" role="group" aria-label={t(language, "sentenceBuilderMode")}>
                <button
                  type="button"
                  className={`settings-toggle-btn${sentenceBuilderEnabled ? " settings-toggle-btn--active" : ""}`}
                  onClick={() => onSentenceBuilderToggle(true)}
                  aria-pressed={sentenceBuilderEnabled}
                >
                  {t(language, "sentenceBuilderOn")}
                </button>
                <button
                  type="button"
                  className={`settings-toggle-btn${!sentenceBuilderEnabled ? " settings-toggle-btn--active" : ""}`}
                  onClick={() => onSentenceBuilderToggle(false)}
                  aria-pressed={!sentenceBuilderEnabled}
                >
                  {t(language, "sentenceBuilderOff")}
                </button>
              </div>
              <p className="settings-field__hint">
                {sentenceBuilderEnabled
                  ? t(language, "sentenceBuilderOnHint")
                  : t(language, "sentenceBuilderOffHint")}
              </p>
            </div>
          </div>

    </Dialog>
  );
}
