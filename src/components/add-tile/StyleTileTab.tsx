import type { TileHeight, TileSize } from "../../data/vocabulary";
import { t, type Language } from "../../i18n";
import { TILE_HEIGHTS, TILE_SIZES } from "../../tileSize";
import { COLOR_OPTIONS, ICON_COLOR_OPTIONS } from "./tileOptions";
import type { AddTileForm } from "./useAddTileForm";

interface StyleTileTabProps {
  language: Language;
  defaultTileSize?: TileSize;
  form: AddTileForm;
}

export function StyleTileTab({ language, defaultTileSize, form }: StyleTileTabProps) {
  return (
    <>
      <div className="add-tile-field">
        <span className="add-tile-field__label">{t(language, "tileColor")}</span>
        <div className="add-tile-colors">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`add-tile-colors__swatch${form.color === option.value ? " add-tile-colors__swatch--selected" : ""}`}
              style={{ background: option.bg }}
              onClick={() => form.setColor(option.value)}
              aria-label={t(language, option.labelKey)}
              aria-pressed={form.color === option.value}
            />
          ))}
        </div>
      </div>

      {form.iconMode === "icon" && (
        <div className="add-tile-field">
          <span className="add-tile-field__label">{t(language, "tileIconColor")}</span>
          <div className="add-tile-colors">
            {ICON_COLOR_OPTIONS.map((option) => (
              <button
                key={option.value === "" ? "__default__" : option.value}
                type="button"
                className={`add-tile-colors__swatch add-tile-colors__swatch--icon-color${form.iconColor === option.value ? " add-tile-colors__swatch--selected" : ""}`}
                style={option.color ? { background: option.color } : undefined}
                onClick={() => form.setIconColor(option.value)}
                aria-label={t(language, option.labelKey)}
                aria-pressed={form.iconColor === option.value}
              />
            ))}
          </div>
        </div>
      )}

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
