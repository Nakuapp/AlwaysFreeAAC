import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import { ImageIcon, Search, Upload, X } from "lucide-react";
import type { Symbol } from "../data/vocabulary";
import { t, type Language } from "../i18n";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { type AppIconName, type AppIconStyle, CUSTOM_TILE_ICON_OPTIONS, toAppIconValue } from "../icons";
import { IconVisual } from "./IconVisual";
import "./AddTileDialog.css";

type ColorLabelKey =
  | "tileColorGreen"
  | "tileColorBlue"
  | "tileColorOrange"
  | "tileColorYellow"
  | "tileColorRed"
  | "tileColorPurple"
  | "tileColorPink"
  | "tileColorTeal"
  | "tileColorGray";

const COLOR_OPTIONS = [
  { value: "green", bg: "#c8e6c9", labelKey: "tileColorGreen" },
  { value: "blue", bg: "#bbdefb", labelKey: "tileColorBlue" },
  { value: "orange", bg: "#ffe0b2", labelKey: "tileColorOrange" },
  { value: "yellow", bg: "#fff9c4", labelKey: "tileColorYellow" },
  { value: "red", bg: "#ffcdd2", labelKey: "tileColorRed" },
  { value: "purple", bg: "#e1bee7", labelKey: "tileColorPurple" },
  { value: "pink", bg: "#fce4ec", labelKey: "tileColorPink" },
  { value: "teal", bg: "#b2dfdb", labelKey: "tileColorTeal" },
  { value: "gray", bg: "#e0e0e0", labelKey: "tileColorGray" },
] as const satisfies ReadonlyArray<{ value: string; bg: string; labelKey: ColorLabelKey }>;

interface AddTileDialogProps {
  language: Language;
  onSave: (symbol: Omit<Symbol, "id">) => void;
  onClose: () => void;
}

export function AddTileDialog({ language, onSave, onClose }: AddTileDialogProps) {
  const [label, setLabel] = useState("");
  const [speakOverride, setSpeakOverride] = useState("");
  const [iconMode, setIconMode] = useState<"icon" | "image">("icon");
  const [iconFilter, setIconFilter] = useState("");
  const [selectedIconName, setSelectedIconName] = useState<AppIconName>("star");
  const [selectedIconStyle, setSelectedIconStyle] = useState<AppIconStyle>("outline");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [color, setColor] = useState("blue");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef);

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

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // Only accept raster image data URLs (no SVG which can embed scripts)
      if (result && /^data:image\/(png|jpeg|gif|webp|bmp|avif);base64,/.test(result)) {
        setImageDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;
    const icon =
      iconMode === "image" && imageDataUrl
        ? imageDataUrl
        : toAppIconValue(selectedIconName, selectedIconStyle);
    onSave({
      label: trimmedLabel,
      emoji: icon,
      speak: speakOverride.trim() || undefined,
      color,
      isCustom: true,
    });
  }

  const normalizedIconFilter = iconFilter.trim().toLowerCase();
  const filteredIcons = normalizedIconFilter
    ? CUSTOM_TILE_ICON_OPTIONS.filter(
        (icon) =>
          icon.label.toLowerCase().includes(normalizedIconFilter) ||
          icon.value.toLowerCase().includes(normalizedIconFilter) ||
          icon.keywords.some((keyword) => keyword.includes(normalizedIconFilter))
      )
    : CUSTOM_TILE_ICON_OPTIONS;

  const isValid =
    label.trim().length > 0 &&
    (iconMode === "icon" ? Boolean(selectedIconName) : imageDataUrl !== null);

  const previewIcon =
    iconMode === "image" && imageDataUrl
      ? imageDataUrl
      : toAppIconValue(selectedIconName, selectedIconStyle);

  return (
    <div className="add-tile-overlay" role="dialog" aria-modal="true" aria-label={t(language, "addTileTitle")}>
      <div className="add-tile-panel" ref={panelRef}>
        <div className="add-tile-panel__header">
          <h2 className="add-tile-panel__title">{t(language, "addTileTitle")}</h2>
          <button
            className="add-tile-panel__close"
            onClick={onClose}
            aria-label={t(language, "close")}
            type="button"
          >
            <X className="add-tile-panel__close-icon" aria-hidden="true" focusable="false" />
          </button>
        </div>

        <div className="add-tile-panel__body">
          {/* Preview */}
          <div className="add-tile-preview" style={{ background: `var(--color-${color}, var(--color-default))` }}>
            <span className="add-tile-preview__icon" aria-hidden="true">
              <IconVisual value={previewIcon} className="add-tile-preview__icon-value" />
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
            <div className="add-tile-tabs" role="group" aria-label={t(language, "tileIcon")}>
              <button
                type="button"
                className={`add-tile-tabs__btn${iconMode === "icon" ? " add-tile-tabs__btn--active" : ""}`}
                onClick={() => setIconMode("icon")}
                aria-pressed={iconMode === "icon"}
              >
                {t(language, "tileIcon")}
              </button>
              <button
                type="button"
                className={`add-tile-tabs__btn${iconMode === "image" ? " add-tile-tabs__btn--active" : ""}`}
                onClick={() => setIconMode("image")}
                aria-pressed={iconMode === "image"}
              >
                <ImageIcon className="add-tile-tabs__icon" aria-hidden="true" focusable="false" />
                {t(language, "tileIconImage")}
              </button>
            </div>
            {iconMode === "icon" ? (
              <>
                <label className="add-tile-field__sr-only" htmlFor="tile-icon-filter">
                  {t(language, "tileIconFilterLabel")}
                </label>
                <div className="add-tile-icon-search">
                  <Search className="add-tile-icon-search__icon" aria-hidden="true" focusable="false" />
                  <input
                    id="tile-icon-filter"
                    type="search"
                    className="add-tile-field__input add-tile-field__input--search"
                    value={iconFilter}
                    onChange={(e) => setIconFilter(e.target.value)}
                    placeholder={t(language, "tileIconFilterPlaceholder")}
                  />
                </div>
                <div className="add-tile-tabs" role="group" aria-label={t(language, "tileIconStyle")}>
                  <button
                    type="button"
                    className={`add-tile-tabs__btn${selectedIconStyle === "outline" ? " add-tile-tabs__btn--active" : ""}`}
                    onClick={() => setSelectedIconStyle("outline")}
                    aria-pressed={selectedIconStyle === "outline"}
                  >
                    {t(language, "tileIconStyleOutline")}
                  </button>
                  <button
                    type="button"
                    className={`add-tile-tabs__btn${selectedIconStyle === "filled" ? " add-tile-tabs__btn--active" : ""}`}
                    onClick={() => setSelectedIconStyle("filled")}
                    aria-pressed={selectedIconStyle === "filled"}
                  >
                    {t(language, "tileIconStyleFilled")}
                  </button>
                </div>
                <div className="add-tile-icon-grid" role="listbox" aria-label={t(language, "tileIcon")}>
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      className={`add-tile-icon-grid__btn${selectedIconName === icon.value ? " add-tile-icon-grid__btn--selected" : ""}`}
                      onClick={() => setSelectedIconName(icon.value)}
                      aria-label={icon.label}
                      aria-selected={selectedIconName === icon.value}
                      role="option"
                    >
                      <IconVisual value={toAppIconValue(icon.value, selectedIconStyle)} className="add-tile-icon-grid__icon" />
                    </button>
                  ))}
                </div>
                {filteredIcons.length === 0 && (
                  <p className="add-tile-field__hint">{t(language, "tileIconFilterNoMatch")}</p>
                )}
              </>
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
                  <Upload className="add-tile-image-upload__btn-icon" aria-hidden="true" focusable="false" />
                  {imageDataUrl ? t(language, "changeImage") : t(language, "uploadImage")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp,image/bmp,image/avif"
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
                  aria-label={t(language, opt.labelKey)}
                  aria-pressed={color === opt.value}
                />
              ))}
            </div>
          </div>

          {/* Spoken text override */}
          <details className="add-tile-advanced">
            <summary className="add-tile-advanced__summary">{t(language, "tileSpeak")}</summary>
            <label className="add-tile-field__label" htmlFor="tile-speak-override">
              {t(language, "tileSpeak")}
            </label>
            <input
              id="tile-speak-override"
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
