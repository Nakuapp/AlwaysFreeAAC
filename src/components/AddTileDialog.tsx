import { useState, useRef, useEffect } from "react";
import type { Symbol } from "../data/vocabulary";
import { t, type Language } from "../i18n";
import "./AddTileDialog.css";

const COLOR_OPTIONS = [
  { value: "green", bg: "#c8e6c9" },
  { value: "blue", bg: "#bbdefb" },
  { value: "orange", bg: "#ffe0b2" },
  { value: "yellow", bg: "#fff9c4" },
  { value: "red", bg: "#ffcdd2" },
  { value: "purple", bg: "#e1bee7" },
  { value: "pink", bg: "#fce4ec" },
  { value: "teal", bg: "#b2dfdb" },
  { value: "gray", bg: "#e0e0e0" },
];

interface AddTileDialogProps {
  language: Language;
  onSave: (symbol: Omit<Symbol, "id">) => void;
  onClose: () => void;
}

export function AddTileDialog({ language, onSave, onClose }: AddTileDialogProps) {
  const [label, setLabel] = useState("");
  const [speakOverride, setSpeakOverride] = useState("");
  const [iconMode, setIconMode] = useState<"emoji" | "image">("emoji");
  const [emoji, setEmoji] = useState("⭐");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [color, setColor] = useState("blue");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Auto-focus label on mount
  useEffect(() => {
    labelInputRef.current?.focus();
  }, []);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;
    const icon = iconMode === "image" && imageDataUrl ? imageDataUrl : emoji;
    onSave({
      label: trimmedLabel,
      emoji: icon,
      speak: speakOverride.trim() || undefined,
      color,
      isCustom: true,
    });
  }

  const isValid = label.trim().length > 0 && (iconMode === "emoji" ? emoji.trim().length > 0 : imageDataUrl !== null);
  const previewIcon = iconMode === "image" && imageDataUrl ? imageDataUrl : emoji;

  return (
    <div className="add-tile-overlay" role="dialog" aria-modal="true" aria-label={t(language, "addTileTitle")}>
      <div className="add-tile-panel">
        <div className="add-tile-panel__header">
          <h2 className="add-tile-panel__title">✨ {t(language, "addTileTitle")}</h2>
          <button
            className="add-tile-panel__close"
            onClick={onClose}
            aria-label={t(language, "cancel")}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="add-tile-panel__body">
          {/* Preview */}
          <div className="add-tile-preview" style={{ background: `var(--color-${color}, var(--color-default))` }}>
            <span className="add-tile-preview__icon" aria-hidden="true">
              {previewIcon.startsWith("data:") ? (
                <img src={previewIcon} alt="" className="add-tile-preview__img" />
              ) : (
                previewIcon
              )}
            </span>
            <span className="add-tile-preview__label">{label || "…"}</span>
          </div>

          {/* Label */}
          <div className="add-tile-field">
            <label className="add-tile-field__label" htmlFor="tile-label">
              {t(language, "tileLabel")}
            </label>
            <input
              id="tile-label"
              ref={labelInputRef}
              type="text"
              className="add-tile-field__input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t(language, "tileLabelPlaceholder")}
              maxLength={40}
            />
          </div>

          {/* Icon */}
          <div className="add-tile-field">
            <span className="add-tile-field__label">{t(language, "tileIcon")}</span>
            <div className="add-tile-tabs">
              <button
                type="button"
                className={`add-tile-tabs__btn${iconMode === "emoji" ? " add-tile-tabs__btn--active" : ""}`}
                onClick={() => setIconMode("emoji")}
              >
                {t(language, "tileIconEmoji")}
              </button>
              <button
                type="button"
                className={`add-tile-tabs__btn${iconMode === "image" ? " add-tile-tabs__btn--active" : ""}`}
                onClick={() => setIconMode("image")}
              >
                {t(language, "tileIconImage")}
              </button>
            </div>
            {iconMode === "emoji" ? (
              <input
                type="text"
                className="add-tile-field__input"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder={t(language, "tileIconEmojiPlaceholder")}
                maxLength={8}
              />
            ) : (
              <div className="add-tile-image-upload">
                {imageDataUrl && (
                  <img src={imageDataUrl} alt="" className="add-tile-image-upload__preview" />
                )}
                <button
                  type="button"
                  className="add-tile-image-upload__btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageDataUrl ? t(language, "changeImage") : t(language, "uploadImage")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="add-tile-image-upload__input"
                  onChange={handleImageUpload}
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
            )}
          </div>

          {/* Color */}
          <div className="add-tile-field">
            <span className="add-tile-field__label">{t(language, "tileColor")}</span>
            <div className="add-tile-colors">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`add-tile-colors__swatch${color === opt.value ? " add-tile-colors__swatch--selected" : ""}`}
                  style={{ background: opt.bg }}
                  onClick={() => setColor(opt.value)}
                  aria-label={opt.value}
                  aria-pressed={color === opt.value}
                />
              ))}
            </div>
          </div>

          {/* Spoken text override */}
          <details className="add-tile-advanced">
            <summary className="add-tile-advanced__summary">{t(language, "tileSpeak")}</summary>
            <input
              type="text"
              className="add-tile-field__input"
              value={speakOverride}
              onChange={(e) => setSpeakOverride(e.target.value)}
              placeholder={t(language, "tileSpeakPlaceholder")}
              maxLength={120}
            />
          </details>
        </div>

        <div className="add-tile-panel__footer">
          <button type="button" className="add-tile-panel__cancel" onClick={onClose}>
            {t(language, "cancel")}
          </button>
          <button
            type="button"
            className="add-tile-panel__save"
            onClick={handleSave}
            disabled={!isValid}
          >
            {t(language, "save")}
          </button>
        </div>
      </div>
    </div>
  );
}
