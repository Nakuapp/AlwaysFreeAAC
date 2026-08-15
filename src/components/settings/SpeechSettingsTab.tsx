import { useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Info, Music2, Search, SlidersHorizontal, Volume2 } from "lucide-react";
import type { VoiceOption } from "../../hooks/useSpeech";
import { t, type Language } from "../../i18n";
import { buildVoiceOptions, type VoiceListOption } from "../../utils/voiceLabels";

interface SpeechSettingsTabProps {
  id: string;
  hidden: boolean;
  language: Language;
  voices: VoiceOption[];
  selectedVoice: string;
  voicePreset: string;
  rate: number;
  pitch: number;
  volume: number;
  onVoiceChange: (name: string) => void;
  onVoicePresetChange: (preset: string) => void;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onVolumeChange: (volume: number) => void;
  onPreviewVoice: (voiceId: string) => void;
}

export function SpeechSettingsTab({
  id,
  hidden,
  language,
  voices,
  selectedVoice,
  voicePreset,
  rate,
  pitch,
  volume,
  onVoiceChange,
  onVoicePresetChange,
  onRateChange,
  onPitchChange,
  onVolumeChange,
  onPreviewVoice,
}: SpeechSettingsTabProps) {
  const [voiceSearch, setVoiceSearch] = useState("");
  const platform = Capacitor.getPlatform();
  const displayLocale = language === "es" ? "es" : language === "fr" ? "fr" : "en";
  const voiceOptions = useMemo(
    () => buildVoiceOptions(voices, displayLocale),
    [displayLocale, voices],
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
        }, new Map<string, VoiceListOption[]>()),
      ),
    [visibleVoiceOptions],
  );

  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby="settings-tab-speech"
      hidden={hidden}
      className="settings-tabpanel"
    >
      {voices.length > 0 && (
        <div className="settings-field">
          <label className="settings-field__label" htmlFor="voice-select">
            <Volume2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
            {t(language, "voice")}
          </label>
          <label
            className="settings-field__label settings-field__label--subtle"
            htmlFor="voice-search"
          >
            <Search className="settings-field__label-icon" aria-hidden="true" focusable="false" />
            {t(language, "voiceFilterLabel")}
          </label>
          <input
            id="voice-search"
            type="search"
            className="settings-field__search"
            placeholder={t(language, "voiceFilterPlaceholder")}
            value={voiceSearch}
            onChange={(event) => setVoiceSearch(event.target.value)}
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
                  onChange={(event) => onVoiceChange(event.target.value)}
                >
                  <option value="">{t(language, "defaultVoice")}</option>
                  {voiceGroups.map(([groupLabel, group]) => (
                    <optgroup key={groupLabel} label={groupLabel}>
                      {group.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.displayLabel}
                          {voice.isNetworkConnectionRequired
                            ? ` ${t(language, "onlineVoiceSuffix")}`
                            : ""}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button
                  type="button"
                  className="settings-field__preview-btn"
                  onClick={() =>
                    onPreviewVoice(selectedVoice || (visibleVoiceOptions[0]?.id ?? ""))
                  }
                  aria-label={t(language, "previewVoice")}
                  title={t(language, "previewVoice")}
                >
                  <Volume2
                    className="settings-field__preview-icon"
                    aria-hidden="true"
                    focusable="false"
                  />
                </button>
              </div>
              {platform !== "ios" && (
                <p className="settings-field__tip">
                  <Info className="settings-field__tip-icon" aria-hidden="true" focusable="false" />{" "}
                  {t(
                    language,
                    platform === "android" ? "moreVoicesTipAndroid" : "moreVoicesTipWeb",
                  )}
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="settings-field">
        <label className="settings-field__label" htmlFor="voice-preset-select">
          <Music2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
          {t(language, "vocalStyle")}
        </label>
        <select
          id="voice-preset-select"
          className="settings-field__select"
          value={voicePreset}
          onChange={(event) => onVoicePresetChange(event.target.value)}
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
          <SlidersHorizontal
            className="settings-field__label-icon"
            aria-hidden="true"
            focusable="false"
          />
          {t(language, "speed")}:{" "}
          <strong>
            {rate === 1
              ? t(language, "normal")
              : rate < 1
                ? t(language, "slow")
                : t(language, "fast")}{" "}
            ({rate}×)
          </strong>
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
          onChange={(event) => onRateChange(Number(event.target.value))}
        />
        <div className="settings-field__range-labels" aria-hidden="true">
          <span>{t(language, "slower")}</span>
          <span>{t(language, "faster")}</span>
        </div>
      </div>

      <div className="settings-field">
        <label className="settings-field__label" htmlFor="pitch-range">
          <Music2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
          {t(language, "pitch")}:{" "}
          <strong>
            {pitch === 1
              ? t(language, "normal")
              : pitch < 1
                ? t(language, "lower")
                : t(language, "higher")}{" "}
            ({pitch})
          </strong>
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
          onChange={(event) => onPitchChange(Number(event.target.value))}
        />
        <div className="settings-field__range-labels" aria-hidden="true">
          <span>{t(language, "lower")}</span>
          <span>{t(language, "higher")}</span>
        </div>
      </div>

      <div className="settings-field">
        <label className="settings-field__label" htmlFor="volume-range">
          <Volume2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
          {t(language, "volume")}: <strong>{Math.round(volume * 100)}%</strong>
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
          onChange={(event) => onVolumeChange(Number(event.target.value))}
        />
        <div className="settings-field__range-labels" aria-hidden="true">
          <span>{t(language, "softer")}</span>
          <span>{t(language, "louder")}</span>
        </div>
      </div>
    </div>
  );
}
