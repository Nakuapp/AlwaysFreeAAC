import EmojiPicker, { Theme } from "emoji-picker-react";
import { ImageIcon, Upload } from "lucide-react";
import { t, type Language } from "../../i18n";
import { IMAGE_PATTERN } from "./tileOptions";
import type { AddTileForm } from "./useAddTileForm";

interface IconTileTabProps {
  language: Language;
  form: AddTileForm;
}

function EmojiPickerForm({ form }: { form: AddTileForm }) {
  return (
    <div className="add-tile-emoji-picker">
      <EmojiPicker
        onEmojiClick={(emojiData) => form.setEmojiValue(emojiData.emoji)}
        lazyLoadEmojis={true}
        previewConfig={{ showPreview: false }}
        reactionsDefaultOpen={true}
        width="100%"
        theme={Theme.AUTO}
      />
    </div>
  );
}

function ImagePickerForm({ language, form }: IconTileTabProps) {
  return (
    <div className="add-tile-image-upload">
      {form.imageDataUrl && (
        <img src={form.imageDataUrl} alt="" className="add-tile-image-upload__preview" />
      )}
      <button
        type="button"
        className="add-tile-image-upload__btn"
        onClick={() => {
          form.setMediaError(null);
          form.fileInputRef.current?.click();
        }}
      >
        <Upload className="add-tile-image-upload__btn-icon" aria-hidden="true" focusable="false" />
        {form.imageDataUrl ? t(language, "changeImage") : t(language, "uploadImage")}
      </button>
      <input
        ref={form.fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp,image/bmp,image/avif"
        className="add-tile-image-upload__input"
        onChange={(event) => form.readUploadedFile(event, IMAGE_PATTERN, form.setImageDataUrl)}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
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

      <div className="add-tile-field">
        <span className="add-tile-field__label">{t(language, "tileIcon")}</span>
        <div className="add-tile-tabs" role="group" aria-label={t(language, "tileIcon")}>
          <button
            type="button"
            className={`add-tile-tabs__btn${form.iconMode === "emoji" ? " add-tile-tabs__btn--active" : ""}`}
            onClick={() => form.setIconMode("emoji")}
            aria-pressed={form.iconMode === "emoji"}
          >
            {t(language, "tileIconEmoji")}
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
        {form.iconMode === "emoji" ? (
          <EmojiPickerForm form={form} />
        ) : (
          <ImagePickerForm language={language} form={form} />
        )}
      </div>
    </>
  );
}
