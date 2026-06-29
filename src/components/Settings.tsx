import { useEffect } from "react";
import type { VoiceOption } from "../hooks/useSpeech";
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
  onVoiceChange: (name: string) => void;
  onVoicePresetChange: (preset: string) => void;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onVolumeChange: (volume: number) => void;
  onColumnsChange: (cols: number) => void;
  onFontSizeChange: (size: number) => void;
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
  onVoiceChange,
  onVoicePresetChange,
  onRateChange,
  onPitchChange,
  onVolumeChange,
  onColumnsChange,
  onFontSizeChange,
  onClose,
}: SettingsProps) {
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
    <div
      className="settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="settings-panel">
        <div className="settings-panel__header">
          <h2 className="settings-panel__title">⚙️ Settings</h2>
          <button
            className="settings-panel__close"
            onClick={onClose}
            aria-label="Close settings"
            type="button"
            autoFocus
          >
            ✕
          </button>
        </div>

        <div className="settings-panel__body">
          {/* Voice */}
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="voice-select">
              🗣️ Voice
            </label>
            {voices.length === 0 ? (
              <p className="settings-field__hint">
                No voices available — your browser may not support speech
                synthesis.
              </p>
            ) : (
              <select
                id="voice-select"
                className="settings-field__select"
                value={selectedVoice}
                onChange={(e) => onVoiceChange(e.target.value)}
              >
                <option value="">Default voice</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Voice profile */}
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="voice-preset-select">
              🎭 Voice profile
            </label>
            <select
              id="voice-preset-select"
              className="settings-field__select"
              value={voicePreset}
              onChange={(e) => onVoicePresetChange(e.target.value)}
            >
              <option value="custom">Custom / Natural</option>
              <option value="male">Masculine</option>
              <option value="female">Feminine</option>
              <option value="child">Child-like</option>
              <option value="deep">Deep</option>
            </select>
          </div>

          {/* Rate */}
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="rate-range">
              ⏱️ Speed:{" "}
              <strong>
                {rate === 1 ? "Normal" : rate < 1 ? "Slow" : "Fast"} ({rate}×)
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
              onChange={(e) => onRateChange(Number(e.target.value))}
            />
            <div className="settings-field__range-labels">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>

          {/* Pitch */}
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="pitch-range">
              🎵 Pitch:{" "}
              <strong>
                {pitch === 1
                  ? "Normal"
                  : pitch < 1
                    ? "Lower"
                    : "Higher"}{" "}
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
              onChange={(e) => onPitchChange(Number(e.target.value))}
            />
            <div className="settings-field__range-labels">
              <span>Lower</span>
              <span>Higher</span>
            </div>
          </div>

          {/* Volume */}
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="volume-range">
              🔊 Volume: <strong>{Math.round(volume * 100)}%</strong>
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
              <span>Softer</span>
              <span>Louder</span>
            </div>
          </div>

          {/* Grid columns */}
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="columns-range">
              ⊞ Grid size: <strong>{columns} columns</strong>
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
              <span>Fewer (larger)</span>
              <span>More (smaller)</span>
            </div>
          </div>

          {/* Font size */}
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="font-range">
              🔤 Text size: <strong>{fontSize}px</strong>
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
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>
        </div>

        <div className="settings-panel__footer">
          <button
            className="settings-panel__done"
            onClick={onClose}
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
