import { ImageIcon, Search, Upload } from "lucide-react";
import { t, type Language } from "../../i18n";
import { toAppIconValue } from "../../ui";
import { IconVisual } from "../../components/icon";
import { IMAGE_PATTERN } from "./tileOptions";
import type { AddTileForm } from "./useAddTileForm";

interface IconTileTabProps {
  language: Language;
  form: AddTileForm;
}

export function IconTileTab({ language, form }: IconTileTabProps) {
  return (
    <>
      <div className="add-tile-field">
        <label className="add-tile-field__label" htmlFor="tile-label">
          {t(language, "tileLabel")}
        </label>
        <input
          id="tile-label"
          ref={form.labelInputRef}
          type="text"
          className="add-tile-field__input"
          value={form.label}
          onChange={(event) => form.setLabel(event.target.value)}
          placeholder={t(language, "tileLabelPlaceholder")}
          maxLength={40}
        />
      </div>

      <div className="add-tile-field">
        <span className="add-tile-field__label">{t(language, "tileIcon")}</span>
        <div className="add-tile-tabs" role="group" aria-label={t(language, "tileIcon")}>
          <button
            type="button"
            className={`add-tile-tabs__btn${form.iconMode === "icon" ? " add-tile-tabs__btn--active" : ""}`}
            onClick={() => form.setIconMode("icon")}
            aria-pressed={form.iconMode === "icon"}
          >
            {t(language, "tileIcon")}
          </button>
          <button
            type="button"
            className={`add-tile-tabs__btn${form.iconMode === "image" ? " add-tile-tabs__btn--active" : ""}`}
            onClick={() => form.setIconMode("image")}
            aria-pressed={form.iconMode === "image"}
          >
            <ImageIcon className="add-tile-tabs__icon" aria-hidden="true" focusable="false" />
            {t(language, "tileIconImage")}
          </button>
        </div>
        {form.iconMode === "icon" ? (
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
                value={form.iconFilter}
                onChange={(event) => form.setIconFilter(event.target.value)}
                placeholder={t(language, "tileIconFilterPlaceholder")}
              />
            </div>
            <div className="add-tile-tabs" role="group" aria-label={t(language, "tileIconStyle")}>
              <button
                type="button"
                className={`add-tile-tabs__btn${form.selectedIconStyle === "outline" ? " add-tile-tabs__btn--active" : ""}`}
                onClick={() => form.setSelectedIconStyle("outline")}
                aria-pressed={form.selectedIconStyle === "outline"}
              >
                {t(language, "tileIconStyleOutline")}
              </button>
              <button
                type="button"
                className={`add-tile-tabs__btn${form.selectedIconStyle === "filled" ? " add-tile-tabs__btn--active" : ""}`}
                onClick={() => form.setSelectedIconStyle("filled")}
                aria-pressed={form.selectedIconStyle === "filled"}
              >
                {t(language, "tileIconStyleFilled")}
              </button>
            </div>
            <div className="add-tile-icon-grid" role="group" aria-label={t(language, "tileIcon")}>
              {form.filteredIcons.map((icon) => (
                <button
                  key={icon.value}
                  type="button"
                  className={`add-tile-icon-grid__btn${form.selectedIconName === icon.value ? " add-tile-icon-grid__btn--selected" : ""}`}
                  onClick={() => form.setSelectedIconName(icon.value)}
                  aria-label={icon.label}
                  aria-pressed={form.selectedIconName === icon.value}
                >
                  <IconVisual
                    value={toAppIconValue(icon.value, form.selectedIconStyle)}
                    className="add-tile-icon-grid__icon"
                  />
                </button>
              ))}
            </div>
            {form.filteredIcons.length === 0 && (
              <p className="add-tile-field__hint">{t(language, "tileIconFilterNoMatch")}</p>
            )}
          </>
        ) : (
          <div className="add-tile-image-upload">
            {form.imageDataUrl && (
              <img src={form.imageDataUrl} alt="" className="add-tile-image-upload__preview" />
            )}
            <button
              type="button"
              className="add-tile-image-upload__btn"
              onClick={() => form.fileInputRef.current?.click()}
            >
              <Upload
                className="add-tile-image-upload__btn-icon"
                aria-hidden="true"
                focusable="false"
              />
              {form.imageDataUrl ? t(language, "changeImage") : t(language, "uploadImage")}
            </button>
            <input
              ref={form.fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/bmp,image/avif"
              className="add-tile-image-upload__input"
              onChange={(event) =>
                form.readUploadedFile(event, IMAGE_PATTERN, form.setImageDataUrl)
              }
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        )}
      </div>

      {form.label.trim().length > 0 && (
        <div className="add-tile-field">
          <label className="add-tile-field__label" htmlFor="tile-speak-override">
            {t(language, "tileSpeak")}
          </label>
          <input
            id="tile-speak-override"
            type="text"
            className="add-tile-field__input"
            value={form.speakOverride}
            onChange={(event) => form.setSpeakOverride(event.target.value)}
            placeholder={t(language, "tileSpeakPlaceholder")}
            maxLength={120}
          />
        </div>
      )}
    </>
  );
}
