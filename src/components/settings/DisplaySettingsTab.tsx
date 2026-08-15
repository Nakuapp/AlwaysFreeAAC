import type React from "react";
import { Grid3X3, MoonStar, Palette, PanelTop, Type } from "lucide-react";
import type { TileSize } from "../../data/vocabulary";
import type { ThemeAccent } from "../../domain/models";
import { t, type Language, type LayoutOrder, type Theme } from "../../i18n";
import { TILE_SIZE_COLUMNS, TILE_SIZES } from "../../tileSize";

const ACCENT_OPTIONS: Array<{ value: ThemeAccent; label: string; color: string }> = [
  { value: "blue", label: "Blue", color: "#1a73e8" },
  { value: "teal", label: "Teal", color: "#0d9488" },
  { value: "green", label: "Green", color: "#16a34a" },
  { value: "purple", label: "Purple", color: "#7c3aed" },
  { value: "orange", label: "Orange", color: "#ea6c00" },
];

interface DisplaySettingsTabProps {
  id: string;
  hidden: boolean;
  language: Language;
  theme: Theme;
  themeAccent: ThemeAccent;
  layoutOrder: LayoutOrder;
  tileSize: TileSize;
  fontSize: number;
  onThemeChange: (theme: Theme) => void;
  onThemeAccentChange: (accent: ThemeAccent) => void;
  onLayoutOrderChange: (order: LayoutOrder) => void;
  onTileSizeChange: (size: TileSize) => void;
  onFontSizeChange: (size: number) => void;
}

export function DisplaySettingsTab({
  id,
  hidden,
  language,
  theme,
  themeAccent,
  layoutOrder,
  tileSize,
  fontSize,
  onThemeChange,
  onThemeAccentChange,
  onLayoutOrderChange,
  onTileSizeChange,
  onFontSizeChange,
}: DisplaySettingsTabProps) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby="settings-tab-display"
      hidden={hidden}
      className="settings-tabpanel"
    >
      <div className="settings-field">
        <label className="settings-field__label" htmlFor="theme-select">
          <MoonStar className="settings-field__label-icon" aria-hidden="true" focusable="false" />
          {t(language, "theme")}
        </label>
        <select
          id="theme-select"
          className="settings-field__select"
          value={theme}
          onChange={(event) => onThemeChange(event.target.value as Theme)}
        >
          <option value="light">{t(language, "light")}</option>
          <option value="dark">{t(language, "dark")}</option>
        </select>
      </div>

      <div className="settings-field">
        <span className="settings-field__label" id="accent-color-label">
          <Palette className="settings-field__label-icon" aria-hidden="true" focusable="false" />
          {t(language, "accentColor")}
        </span>
        <div className="settings-accent-picker" role="group" aria-labelledby="accent-color-label">
          {ACCENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`settings-accent-swatch${themeAccent === option.value ? " settings-accent-swatch--active" : ""}`}
              style={{ "--swatch-color": option.color } as React.CSSProperties}
              onClick={() => onThemeAccentChange(option.value)}
              aria-pressed={themeAccent === option.value}
              aria-label={option.label}
              title={option.label}
            />
          ))}
        </div>
      </div>

      <div className="settings-field">
        <label className="settings-field__label" htmlFor="layout-order-select">
          <PanelTop className="settings-field__label-icon" aria-hidden="true" focusable="false" />
          {t(language, "layoutOrder")}
        </label>
        <select
          id="layout-order-select"
          className="settings-field__select"
          value={layoutOrder}
          onChange={(event) => onLayoutOrderChange(event.target.value as LayoutOrder)}
        >
          <option value="tabs-top">{t(language, "layoutTabsTop")}</option>
          <option value="speech-top">{t(language, "layoutSpeechTop")}</option>
        </select>
      </div>

      <div className="settings-field">
        <span className="settings-field__label" id="grid-size-label">
          <Grid3X3 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
          {t(language, "gridSize")}
        </span>
        <div className="settings-tile-size-picker" role="group" aria-labelledby="grid-size-label">
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
              <span className="settings-tile-size-btn__hint" aria-hidden="true">
                {TILE_SIZE_COLUMNS[size]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-field">
        <label className="settings-field__label" htmlFor="font-range">
          <Type className="settings-field__label-icon" aria-hidden="true" focusable="false" />
          {t(language, "textSize")}: <strong>{fontSize}px</strong>
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
          onChange={(event) => onFontSizeChange(Number(event.target.value))}
        />
        <div className="settings-field__range-labels" aria-hidden="true">
          <span>{t(language, "smaller")}</span>
          <span>{t(language, "larger")}</span>
        </div>
      </div>
    </div>
  );
}
