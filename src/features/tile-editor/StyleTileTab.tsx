import React, { useState } from "react";
import { TwitterPicker, SliderPicker, AlphaPicker, type RGBColor } from "react-color";
import type { TileHeight, TileSize } from "../../domain";
import { t, type Language } from "../../i18n";
import { TILE_HEIGHTS, TILE_SIZES } from "../../ui";
import { COLOR_OPTIONS, ICON_COLOR_OPTIONS } from "./tileOptions";
import type { AddTileForm } from "./useAddTileForm";
import { ICON_COLOR_HEX } from "../../ui/colors";

interface StyleTileTabProps {
  language: Language;
  defaultTileSize?: TileSize;
  form: AddTileForm;
}

export function StyleTileTab({ language, defaultTileSize, form }: StyleTileTabProps) {
  const colorMap: string[] = Object.values(ICON_COLOR_HEX);
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

  // const handleChange = (newColor: { rgb: { r: number; g: number; b: number; a: number; }; }) => {
  //   // newColor.rgb gives { r, g, b, a, source }
  //   setColor(newColor.rgb);
  //   form.setColor(`rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
  // };

  return (
    <>
      <div className="add-tile-field">
        <span className="add-tile-field__label">{t(language, "tileColor")}</span>
        <div className="add-tile-colors">
          {/* {COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`add-tile-colors__swatch${form.color === option.value ? " add-tile-colors__swatch--selected" : ""}`}
              style={{ background: option.bg }}
              onClick={() => form.setColor(option.value)}
              aria-label={t(language, option.labelKey)}
              aria-pressed={form.color === option.value}
            />
          ))} */}
          {/* <CirclePicker
            color={form.color || "#ffffff"}
            onChangeComplete={(color) => form.setColor(color.hex)}
            colors={COLOR_OPTIONS.map((option) => option.bg)}
            circleSize={24}
            circleSpacing={8}
          /> */}
          {/* <TwitterPicker
            color={form.color || "#9900EF"}
            colors={colorMap}
            onChangeComplete={(color) => form.setColor(color.hex)}
            width="100%"
            triangle="hide"
            styles={{
              default: {
                card: { background: 'transparent' },
                input: { paddingBottom: '2px' }
              }
            }}            
          />
          <AlphaPicker
            color={form.color}
            onChangeComplete={(color) => form.setColor(color.hex)}
            width="100%"
          /> */}
          {/* <BlockPicker
            color={form.color || "#ffffff"}
            colors={colorMap}
            onChangeComplete={(color) => form.setColor(color.hex)}
            width="100%"
            triangle="hide"
            styles={{
              default: {
                card: { background: 'transparent' },
                input: {}
              }
            }}            
          /> */}

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <TwitterPicker
              color={form.color || activeTileBgColor}
              onChangeComplete={(color) => {
                console.log("TwitterPicker onChangeComplete color:", color);
                console.log("activeTileBgColor before change:", activeTileBgColor);
                const newActiveTileBgColor: RGBColor = { ...color.rgb, a: activeTileBgColor.a }; // Preserve the alpha value};
                console.log("newActiveTileBgColor:", newActiveTileBgColor);
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
