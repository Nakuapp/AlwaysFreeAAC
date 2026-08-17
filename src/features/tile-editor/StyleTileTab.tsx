import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { TwitterPicker, AlphaPicker, type RGBColor } from "react-color";
import type { TileHeight, TileSize } from "../../domain";
import { t, type Language } from "../../i18n";
import { TILE_HEIGHTS, TILE_SIZES } from "../../ui";
import type { AddTileForm } from "./useAddTileForm";

const TEXT_COLOR_SWATCHES = [
  "#000000",
  "#333333",
  "#666666",
  "#FFFFFF",
  "#B80000",
  "#DB3E00",
  "#FCCB00",
  "#008B02",
  "#006B76",
  "#1273DE",
  "#004DCF",
  "#5300EB",
];

interface StyleTileTabProps {
  language: Language;
  defaultTileSize?: TileSize;
  form: AddTileForm;
}

export function StyleTileTab({ language, defaultTileSize, form }: StyleTileTabProps) {
  const [activeTileBgColor, setActiveTileBgColor] = useState<RGBColor>({
    r: 85,
    g: 172,
    b: 238,
    a: 1,
  });

  const handleChange = (color: RGBColor) => {
    setActiveTileBgColor(color);
    form.setColor(`rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`);
  };

  return (
    <>
      <div className="add-tile-field">
        <span className="add-tile-field__label">{t(language, "tileColor")}</span>
        <div className="add-tile-colors">
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <TwitterPicker
              color={form.color || activeTileBgColor}
              onChangeComplete={(color) => {
                const newActiveTileBgColor: RGBColor = {
                  ...color.rgb,
                  a: activeTileBgColor.a,
                };
                handleChange(newActiveTileBgColor);
              }}
              width="100%"
              triangle="hide"
              styles={{
                default: {
                  card: { background: "transparent" },
                  input: { paddingBottom: "2px" },
                },
              }}
            />

            <div style={{ width: "100%", position: "relative" }}>
              <AlphaPicker
                color={form.color || activeTileBgColor}
                onChangeComplete={(color) => handleChange(color.rgb)}
                width="100%"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="add-tile-field">
        <span className="add-tile-field__label">{t(language, "tileTextColor")}</span>
        <div className="add-tile-text-color">
          <TwitterPicker
            color={form.textColor || "#000000"}
            colors={TEXT_COLOR_SWATCHES}
            onChangeComplete={(color) => form.setTextColor(color.hex)}
            width="100%"
            triangle="hide"
            styles={{
              default: {
                card: { background: "transparent" },
                input: { paddingBottom: "2px" },
              },
            }}
          />
        </div>
        <button
          type="button"
          className="add-tile-toggle"
          onClick={() => form.setTextColor("")}
          disabled={!form.textColor}
        >
          {t(language, "tileTextColorDefault")}
        </button>
      </div>

      <div className="add-tile-field">
        <span className="add-tile-field__label">{t(language, "tileVisibility")}</span>
        <div className="add-tile-tabs" role="group" aria-label={t(language, "tileVisibility")}>
          <button
            type="button"
            className={`add-tile-tabs__btn${form.hideLabel ? " add-tile-tabs__btn--active" : ""}`}
            onClick={() => form.setHideLabel(!form.hideLabel)}
            aria-pressed={form.hideLabel}
          >
            {form.hideLabel ? (
              <EyeOff className="add-tile-tabs__icon" aria-hidden="true" focusable="false" />
            ) : (
              <Eye className="add-tile-tabs__icon" aria-hidden="true" focusable="false" />
            )}
            {t(language, "tileHideLabel")}
          </button>
          <button
            type="button"
            className={`add-tile-tabs__btn${form.hideIcon ? " add-tile-tabs__btn--active" : ""}`}
            onClick={() => form.setHideIcon(!form.hideIcon)}
            aria-pressed={form.hideIcon}
          >
            {form.hideIcon ? (
              <EyeOff className="add-tile-tabs__icon" aria-hidden="true" focusable="false" />
            ) : (
              <Eye className="add-tile-tabs__icon" aria-hidden="true" focusable="false" />
            )}
            {t(language, "tileHideIcon")}
          </button>
        </div>
        <p className="add-tile-field__hint">{t(language, "tileVisibilityHint")}</p>
      </div>

      <div className="add-tile-field">
        <label className="add-tile-field__label" htmlFor="tile-size-select">
          {t(language, "tileSizeLabel")}
        </label>
        <select
          id="tile-size-select"
          className="add-tile-field__input"
          value={form.tileSize}
          onChange={(event) => form.setTileSize(event.target.value as TileSize | "")}
        >
          <option value="">
            {t(language, "tileSizeDefault")}
            {defaultTileSize ? ` (${defaultTileSize.toUpperCase()})` : ""}
          </option>
          {TILE_SIZES.map((size) => (
            <option key={size} value={size}>
              {t(
                language,
                `tileSize${size.charAt(0).toUpperCase() + size.slice(1)}` as Parameters<
                  typeof t
                >[1],
              )}
            </option>
          ))}
        </select>
      </div>

      <div className="add-tile-field">
        <label className="add-tile-field__label" htmlFor="tile-height-select">
          {t(language, "tileHeightLabel")}
        </label>
        <select
          id="tile-height-select"
          className="add-tile-field__input"
          value={form.tileHeight}
          onChange={(event) => form.setTileHeight(event.target.value as TileHeight | "")}
        >
          <option value="">{t(language, "tileHeightNormal")}</option>
          {TILE_HEIGHTS.map((height) => (
            <option key={height} value={height}>
              {t(language, height === "tall" ? "tileHeightTall" : "tileHeightTaller")}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
