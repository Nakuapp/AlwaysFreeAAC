import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import type { VoiceOption } from "../hooks/useSpeech";
import { LANGUAGE_OPTIONS, t, type Language, type Theme } from "../i18n";
import "./Settings.css";

interface SettingsProps {
  voices: VoiceOption[];
  selectedVoice: string;
  voicePreset: string;
  rate: number;
  pitch: number;
  volume: number;
  columns: number;
  fontSize: number;
  language: Language;
  theme: Theme;
  onVoiceChange: (name: string) => void;
  onVoicePresetChange: (preset: string) => void;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onVolumeChange: (volume: number) => void;
  onColumnsChange: (cols: number) => void;
  onFontSizeChange: (size: number) => void;
  onLanguageChange: (language: Language) => void;
  onThemeChange: (theme: Theme) => void;
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
  columns,
  fontSize,
  language,
  theme,
  onVoiceChange,
  onVoicePresetChange,
  onRateChange,
  onPitchChange,
  onVolumeChange,
  onColumnsChange,
  onFontSizeChange,
  onLanguageChange,
  onThemeChange,
  onPreviewVoice,
  onClose,
}: SettingsProps) {
  const [voiceFilter, setVoiceFilter] = useState("");
  const platform = Capacitor.getPlatform();

  const normalizedFilter = voiceFilter.trim().toLowerCase();
  const filteredVoices = normalizedFilter
    ? voices.filter(
        (v) =>
          v.name.toLowerCase().includes(normalizedFilter) ||
          v.lang.toLowerCase().includes(normalizedFilter)
      )
    : voices;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-label={t(language, "settings")}>
      <div className="settings-panel">
        <div className="settings-panel__header">
          <h2 className="settings-panel__title">⚙️ {t(language, "settings")}</h2>
          <button
            className="settings-panel__close"
            onClick={onClose}
            aria-label={t(language, "closeSettings")}
            type="button"
            autoFocus
          >
            ✕
          </button>
        </div>

        <div className="settings-panel__body">
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="language-select">
              🌍 {t(language, "language")}
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

          <div className="settings-field">
            <label className="settings-field__label" htmlFor="theme-select">
              🌓 {t(language, "theme")}
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

          <div className="settings-field">
            <label className="settings-field__label" htmlFor="voice-select">
              🗣️ {t(language, "voice")}
            </label>
            {voices.length === 0 ? (
              <p className="settings-field__hint">{t(language, "noVoices")}</p>
            ) : (
              <>
                <input
                  id="voice-filter"
                  type="search"
                  className="settings-field__search"
                  placeholder={t(language, "voiceFilterPlaceholder")}
                  aria-label={t(language, "voiceFilterLabel")}
                  value={voiceFilter}
                  onChange={(e) => setVoiceFilter(e.target.value)}
                />
                <div className="settings-field__voice-row">
                  <select
                    id="voice-select"
                    className="settings-field__select settings-field__select--voice"
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
                              {v.isNetworkConnectionRequired ? " 🌐" : ""}
                            </option>
                          ))}
                        </optgroup>
                      )
                    )}
                  </select>
                  <button
                    type="button"
                    className="settings-field__preview-btn"
                    onClick={() => onPreviewVoice(selectedVoice || (filteredVoices[0]?.id ?? ""))}
                    aria-label={t(language, "previewVoice")}
                    title={t(language, "previewVoice")}
                  >
                    🔊
                  </button>
                </div>
                {filteredVoices.length === 0 && voiceFilter.trim() && (
                  <p className="settings-field__hint">{t(language, "voiceFilterNoMatch")}</p>
                )}
                {platform !== "ios" && (
                  <p className="settings-field__tip">
                    ℹ️{" "}
                    {t(
                      language,
                      platform === "android"
                        ? "moreVoicesTipAndroid"
                        : "moreVoicesTipWeb"
                    )}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="settings-field">
            <label className="settings-field__label" htmlFor="voice-preset-select">
              🎼 {t(language, "vocalStyle")}
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

          <div className="settings-field">
            <label className="settings-field__label" htmlFor="rate-range">
              ⏱️ {t(language, "speed")}: <strong>{rate === 1 ? t(language, "normal") : rate < 1 ? t(language, "slow") : t(language, "fast")} ({rate}×)</strong>
            </label>
            <input
              id="rate-range"
              type="range"
              className="settings-field__range"
              min={0.5}
              max={2}
              step={0.1}
              value={rate}
              onChange={(e) => onRateChange(Number(e.target.value))}
            />
            <div className="settings-field__range-labels">
              <span>{t(language, "slower")}</span>
              <span>{t(language, "faster")}</span>
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-field__label" htmlFor="pitch-range">
              🎵 {t(language, "pitch")}: <strong>{pitch === 1 ? t(language, "normal") : pitch < 1 ? t(language, "lower") : t(language, "higher")} ({pitch})</strong>
            </label>
            <input
              id="pitch-range"
              type="range"
              className="settings-field__range"
              min={0.5}
              max={2}
              step={0.1}
              value={pitch}
              onChange={(e) => onPitchChange(Number(e.target.value))}
            />
            <div className="settings-field__range-labels">
              <span>{t(language, "lower")}</span>
              <span>{t(language, "higher")}</span>
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-field__label" htmlFor="volume-range">
              🔊 {t(language, "volume")}: <strong>{Math.round(volume * 100)}%</strong>
            </label>
            <input
              id="volume-range"
              type="range"
              className="settings-field__range"
              min={0.2}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
            />
            <div className="settings-field__range-labels">
              <span>{t(language, "softer")}</span>
              <span>{t(language, "louder")}</span>
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-field__label" htmlFor="columns-range">
              ⊞ {t(language, "gridSize")}: <strong>{columns} {t(language, "columns")}</strong>
            </label>
            <input
              id="columns-range"
              type="range"
              className="settings-field__range"
              min={2}
              max={8}
              step={1}
              value={columns}
              onChange={(e) => onColumnsChange(Number(e.target.value))}
            />
            <div className="settings-field__range-labels">
              <span>{t(language, "fewerLarger")}</span>
              <span>{t(language, "moreSmaller")}</span>
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-field__label" htmlFor="font-range">
              🔤 {t(language, "textSize")}: <strong>{fontSize}px</strong>
            </label>
            <input
              id="font-range"
              type="range"
              className="settings-field__range"
              min={12}
              max={24}
              step={1}
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
            />
            <div className="settings-field__range-labels">
              <span>{t(language, "smaller")}</span>
              <span>{t(language, "larger")}</span>
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
