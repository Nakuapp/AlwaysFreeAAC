import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { ImageIcon, Music, Palette, Search, Upload, X } from "lucide-react";
import type { TileSize, TileHeight, Symbol } from "../data/vocabulary";
import { TILE_SIZES, TILE_HEIGHTS } from "../tileSize";
import { t, type Language } from "../i18n";
import { type AppIconName, type AppIconStyle } from "../icons";
import { CUSTOM_TILE_ICON_OPTIONS, getAppIconName, getAppIconStyle, isRasterImageDataUrl, isExternalImageUrl, toAppIconValue } from "../iconUtils";
import { ICON_COLOR_HEX } from "../colors";
import { IconVisual } from "./IconVisual";
import { Dialog } from "./Dialog";
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

type IconColorLabelKey =
  | "tileIconColorDefault"
  | "tileColorRed"
  | "tileColorOrange"
  | "tileColorYellow"
  | "tileColorGreen"
  | "tileColorBlue"
  | "tileColorPurple"
  | "tileColorPink"
  | "tileColorTeal"
  | "tileColorGray";

const ICON_COLOR_OPTIONS = [
  { value: "", color: null, labelKey: "tileIconColorDefault" },
  { value: "red", color: ICON_COLOR_HEX.red, labelKey: "tileColorRed" },
  { value: "orange", color: ICON_COLOR_HEX.orange, labelKey: "tileColorOrange" },
  { value: "yellow", color: ICON_COLOR_HEX.yellow, labelKey: "tileColorYellow" },
  { value: "green", color: ICON_COLOR_HEX.green, labelKey: "tileColorGreen" },
  { value: "blue", color: ICON_COLOR_HEX.blue, labelKey: "tileColorBlue" },
  { value: "purple", color: ICON_COLOR_HEX.purple, labelKey: "tileColorPurple" },
  { value: "pink", color: ICON_COLOR_HEX.pink, labelKey: "tileColorPink" },
  { value: "teal", color: ICON_COLOR_HEX.teal, labelKey: "tileColorTeal" },
  { value: "gray", color: ICON_COLOR_HEX.gray, labelKey: "tileColorGray" },
] as const satisfies ReadonlyArray<{ value: string; color: string | null; labelKey: IconColorLabelKey }>;

interface AddTileDialogProps {
  language: Language;
  onSave: (symbol: Omit<Symbol, "id">) => void;
  onClose: () => void;
  /** When provided, pre-fills the dialog for editing an existing tile */
  initialSymbol?: Symbol;
  /** When provided, pre-fills just the label (used when adding from keyboard search) */
  initialLabel?: string;
  /** Global tile size (used to show "Default" label in the size picker) */
  defaultTileSize?: TileSize;
}

function deriveIconState(emoji: string | undefined): {
  iconMode: "icon" | "image";
  iconName: AppIconName;
  iconStyle: AppIconStyle;
  imageDataUrl: string | null;
  rawIconValue: string | null;
} {
  if (emoji && (isRasterImageDataUrl(emoji) || isExternalImageUrl(emoji))) {
    return { iconMode: "image", iconName: "star", iconStyle: "outline", imageDataUrl: emoji, rawIconValue: null };
  }
  if (emoji) {
    const detectedName = getAppIconName(emoji);
    const name = detectedName ?? "star";
    const style = getAppIconStyle(emoji);
    return { iconMode: "icon", iconName: name, iconStyle: style, imageDataUrl: null, rawIconValue: detectedName ? null : emoji };
  }
  return { iconMode: "icon", iconName: "star", iconStyle: "outline", imageDataUrl: null, rawIconValue: null };
}

export function AddTileDialog({ language, onSave, onClose, initialSymbol, initialLabel, defaultTileSize }: AddTileDialogProps) {
  const isEditing = initialSymbol !== undefined;
  const initial = deriveIconState(initialSymbol?.emoji);

  const [activeTab, setActiveTab] = useState<"icon" | "style" | "media">("icon");
  const [label, setLabel] = useState(initialSymbol?.label ?? initialLabel ?? "");
  const [speakOverride, setSpeakOverride] = useState(initialSymbol?.speak ?? "");
  const [iconMode, setIconMode] = useState<"icon" | "image">(initial.iconMode);
  const [iconFilter, setIconFilter] = useState("");
  const [selectedIconName, setSelectedIconName] = useState<AppIconName>(initial.iconName);
  const [selectedIconStyle, setSelectedIconStyle] = useState<AppIconStyle>(initial.iconStyle);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initial.imageDataUrl);
  const [rawIconValue, setRawIconValue] = useState<string | null>(initial.rawIconValue);
  const [color, setColor] = useState(initialSymbol?.color ?? "blue");
  const [iconColor, setIconColor] = useState(initialSymbol?.iconColor ?? "");
  const [tileSize, setTileSize] = useState<TileSize | "">(initialSymbol?.tileSize ?? "");
  const [tileHeight, setTileHeight] = useState<TileHeight | "">(initialSymbol?.tileHeight ?? "");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(initialSymbol?.backgroundImage ?? null);
  const [soundFile, setSoundFile] = useState<string | null>(initialSymbol?.soundFile ?? null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const soundInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  function readUploadedFile(
    e: ChangeEvent<HTMLInputElement>,
    acceptPattern: RegExp,
    onAccept: (dataUrl: string) => void,
    maxBytes?: number
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (maxBytes && file.size > maxBytes) {
      setMediaError(t(language, "mediaFileTooLarge"));
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result && acceptPattern.test(result)) {
        onAccept(result);
        setMediaError(null);
      }
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  }

  const IMAGE_PATTERN = /^data:image\/(png|jpeg|gif|webp|bmp|avif);base64,/;
  const AUDIO_PATTERN = /^data:audio\/(mpeg|ogg|wav|mp4|webm|aac|flac);base64,/;

  const MAX_IMAGE_BYTES = 1_500_000;
  const MAX_AUDIO_BYTES = 1_500_000;

  function handlePreviewSound() {
    if (!soundFile) return;
    const audio = new Audio(soundFile);
    audio.play().catch(() => {});
  }

  function handleSave() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;
    const icon =
      iconMode === "image" && imageDataUrl
        ? imageDataUrl
        : (rawIconValue ?? toAppIconValue(selectedIconName, selectedIconStyle));
    onSave({
      label: trimmedLabel,
      emoji: icon,
      speak: speakOverride.trim() || undefined,
      color,
      iconColor: iconColor || undefined,
      tileSize: tileSize || undefined,
      tileHeight: tileHeight || undefined,
      backgroundImage: backgroundImage ?? undefined,
      soundFile: soundFile ?? undefined,
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
      : (rawIconValue ?? toAppIconValue(selectedIconName, selectedIconStyle));

  const _foundIconColorOpt = iconColor ? ICON_COLOR_OPTIONS.find((o) => o.value === iconColor) : undefined;
  const previewIconColor: string | undefined = _foundIconColorOpt?.color ?? undefined;

  return (
    <Dialog
      title={t(language, isEditing ? "editTileTitle" : "addTileTitle")}
      titleId="add-tile-title"
      closeLabel={t(language, "close")}
      onClose={onClose}
      maxWidth="420px"
      panelClassName="add-tile-panel dialog-panel--round-close"
      bodyClassName="add-tile-panel__body"
      initialFocusRef={labelInputRef}
      headerExtension={
        <>
          {/* Preview */}
          <div className="add-tile-preview-row">
            <div className="add-tile-preview" style={{ background: `var(--color-${color}, var(--color-default))` }}>
              <span className="add-tile-preview__icon" aria-hidden="true">
                <IconVisual value={previewIcon} className="add-tile-preview__icon-value" iconColor={previewIconColor} />
              </span>
              <span className="add-tile-preview__label">{label || "…"}</span>
            </div>
          </div>

          {/* Dialog tabs */}
          <div className="dialog-tabs" role="group" aria-label={t(language, isEditing ? "editTileTitle" : "addTileTitle")}>
            <button
              type="button"
              aria-pressed={activeTab === "icon"}
              className={`dialog-tab${activeTab === "icon" ? " dialog-tab--active" : ""}`}
              onClick={() => setActiveTab("icon")}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setActiveTab("style");
                else if (e.key === "ArrowLeft") setActiveTab("media");
              }}
            >
              <ImageIcon className="dialog-tab__icon" aria-hidden="true" focusable="false" />
              {t(language, "tileDlgTabIcon")}
            </button>
            <button
              type="button"
              aria-pressed={activeTab === "style"}
              className={`dialog-tab${activeTab === "style" ? " dialog-tab--active" : ""}`}
              onClick={() => setActiveTab("style")}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setActiveTab("media");
                else if (e.key === "ArrowLeft") setActiveTab("icon");
              }}
            >
              <Palette className="dialog-tab__icon" aria-hidden="true" focusable="false" />
              {t(language, "tileDlgTabStyle")}
            </button>
            <button
              type="button"
              aria-pressed={activeTab === "media"}
              className={`dialog-tab${activeTab === "media" ? " dialog-tab--active" : ""}${(backgroundImage || soundFile) ? " dialog-tab--has-content" : ""}`}
              onClick={() => setActiveTab("media")}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setActiveTab("icon");
                else if (e.key === "ArrowLeft") setActiveTab("style");
              }}
            >
              <Music className="dialog-tab__icon" aria-hidden="true" focusable="false" />
              {t(language, "tileDlgTabMedia")}
            </button>
          </div>
        </>
      }
      footer={
        <>
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
        </>
      }
    >
      {/* ── Icon tab ── */}
      {activeTab === "icon" && (
        <>
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
                onClick={() => {
                  setIconMode("image");
                  setRawIconValue(null);
                }}
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
                    onClick={() => {
                      setSelectedIconStyle("outline");
                      setRawIconValue(null);
                    }}
                    aria-pressed={selectedIconStyle === "outline"}
                  >
                    {t(language, "tileIconStyleOutline")}
                  </button>
                  <button
                    type="button"
                    className={`add-tile-tabs__btn${selectedIconStyle === "filled" ? " add-tile-tabs__btn--active" : ""}`}
                    onClick={() => {
                      setSelectedIconStyle("filled");
                      setRawIconValue(null);
                    }}
                    aria-pressed={selectedIconStyle === "filled"}
                  >
                    {t(language, "tileIconStyleFilled")}
                  </button>
                </div>
                <div className="add-tile-icon-grid" role="group" aria-label={t(language, "tileIcon")}>
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      className={`add-tile-icon-grid__btn${selectedIconName === icon.value ? " add-tile-icon-grid__btn--selected" : ""}`}
                      onClick={() => {
                        setSelectedIconName(icon.value);
                        setRawIconValue(null);
                      }}
                      aria-label={icon.label}
                      aria-pressed={selectedIconName === icon.value}
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
                  onChange={(e) => readUploadedFile(e, IMAGE_PATTERN, setImageDataUrl, MAX_IMAGE_BYTES)}
                  onClick={() => setMediaError(null)}
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
            )}
          </div>

          {/* Spoken text override (shown when label has text) */}
          {label.trim().length > 0 && (
            <div className="add-tile-field">
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
            </div>
          )}
        </>
      )}

      {/* ── Style tab ── */}
      {activeTab === "style" && (
        <>
          {/* Tile Color */}
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

          {/* Icon Color (only relevant when using icon mode) */}
          {iconMode === "icon" && (
            <div className="add-tile-field">
              <span className="add-tile-field__label">{t(language, "tileIconColor")}</span>
              <div className="add-tile-colors">
                {ICON_COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value === "" ? "__default__" : opt.value}
                    type="button"
                    className={`add-tile-colors__swatch add-tile-colors__swatch--icon-color${iconColor === opt.value ? " add-tile-colors__swatch--selected" : ""}`}
                    style={opt.color ? { background: opt.color } : undefined}
                    onClick={() => setIconColor(opt.value)}
                    aria-label={t(language, opt.labelKey)}
                    aria-pressed={iconColor === opt.value}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tile Size (width) */}
          <div className="add-tile-field">
            <label className="add-tile-field__label" htmlFor="tile-size-select">
              {t(language, "tileSizeLabel")}
            </label>
            <select
              id="tile-size-select"
              className="add-tile-field__input"
              value={tileSize}
              onChange={(e) => setTileSize(e.target.value as TileSize | "")}
            >
              <option value="">
                {t(language, "tileSizeDefault")}
                {defaultTileSize ? ` (${defaultTileSize.toUpperCase()})` : ""}
              </option>
              {TILE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {t(language, `tileSize${s.charAt(0).toUpperCase() + s.slice(1)}` as Parameters<typeof t>[1])}
                </option>
              ))}
            </select>
          </div>

          {/* Tile Height (row span) */}
          <div className="add-tile-field">
            <label className="add-tile-field__label" htmlFor="tile-height-select">
              {t(language, "tileHeightLabel")}
            </label>
            <select
              id="tile-height-select"
              className="add-tile-field__input"
              value={tileHeight}
              onChange={(e) => setTileHeight(e.target.value as TileHeight | "")}
            >
              <option value="">{t(language, "tileHeightNormal")}</option>
              {TILE_HEIGHTS.map((h) => (
                <option key={h} value={h}>
                  {t(language, h === "tall" ? "tileHeightTall" : "tileHeightTaller")}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* ── Media tab ── */}
      {activeTab === "media" && (
        <>
          {/* Background Image */}
          <div className="add-tile-field">
            <span className="add-tile-field__label">{t(language, "tileBackgroundImage")}</span>
            <div className="add-tile-image-upload">
              {backgroundImage && (
                <img src={backgroundImage} alt="" className="add-tile-image-upload__preview" />
              )}
              <button
                type="button"
                className="add-tile-image-upload__btn"
                onClick={() => bgImageInputRef.current?.click()}
              >
                <ImageIcon className="add-tile-image-upload__btn-icon" aria-hidden="true" focusable="false" />
                {backgroundImage ? t(language, "changeImage") : t(language, "uploadImage")}
              </button>
              {backgroundImage && (
                <button
                  type="button"
                  className="add-tile-image-upload__remove"
                  onClick={() => setBackgroundImage(null)}
                  aria-label={t(language, "removeBackgroundImage")}
                >
                  <X className="add-tile-image-upload__btn-icon" aria-hidden="true" focusable="false" />
                </button>
              )}
              <input
                ref={bgImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,image/bmp,image/avif"
                className="add-tile-image-upload__input"
                onChange={(e) => readUploadedFile(e, IMAGE_PATTERN, setBackgroundImage, MAX_IMAGE_BYTES)}
                onClick={() => setMediaError(null)}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Sound File */}
          <div className="add-tile-field">
            <span className="add-tile-field__label">{t(language, "tileSoundFile")}</span>
            <div className="add-tile-sound-upload">
              <button
                type="button"
                className="add-tile-image-upload__btn"
                onClick={() => soundInputRef.current?.click()}
              >
                <Music className="add-tile-image-upload__btn-icon" aria-hidden="true" focusable="false" />
                {soundFile ? t(language, "changeSoundFile") : t(language, "uploadSoundFile")}
              </button>
              {soundFile && (
                <>
                  <button
                    type="button"
                    className="add-tile-sound-upload__preview-btn"
                    onClick={handlePreviewSound}
                    aria-label={t(language, "previewSound")}
                  >
                    <Music className="add-tile-image-upload__btn-icon" aria-hidden="true" focusable="false" />
                    {t(language, "previewSound")}
                  </button>
                  <button
                    type="button"
                    className="add-tile-image-upload__remove"
                    onClick={() => setSoundFile(null)}
                    aria-label={t(language, "removeSoundFile")}
                  >
                    <X className="add-tile-image-upload__btn-icon" aria-hidden="true" focusable="false" />
                  </button>
                </>
              )}
              <input
                ref={soundInputRef}
                type="file"
                accept="audio/mpeg,audio/ogg,audio/wav,audio/mp4,audio/webm,audio/aac,audio/flac"
                className="add-tile-image-upload__input"
                onChange={(e) => readUploadedFile(e, AUDIO_PATTERN, setSoundFile, MAX_AUDIO_BYTES)}
                onClick={() => setMediaError(null)}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
            {mediaError && (
              <p className="add-tile-field__hint" role="alert">{mediaError}</p>
            )}
            {soundFile && (
              <p className="add-tile-field__hint">{t(language, "soundFileHint")}</p>
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}
