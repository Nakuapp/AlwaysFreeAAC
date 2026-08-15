import { ImageIcon, Music, X } from "lucide-react";
import { t, type Language } from "../../i18n";
import { AUDIO_PATTERN, IMAGE_PATTERN } from "./tileOptions";
import type { AddTileForm } from "./useAddTileForm";

interface MediaTileTabProps {
  language: Language;
  form: AddTileForm;
}

export function MediaTileTab({ language, form }: MediaTileTabProps) {
  return (
    <>
      <div className="add-tile-field">
        <span className="add-tile-field__label">{t(language, "tileBackgroundImage")}</span>
        <div className="add-tile-image-upload">
          {form.backgroundImage && (
            <img src={form.backgroundImage} alt="" className="add-tile-image-upload__preview" />
          )}
          <button
            type="button"
            className="add-tile-image-upload__btn"
            onClick={() => form.bgImageInputRef.current?.click()}
          >
            <ImageIcon
              className="add-tile-image-upload__btn-icon"
              aria-hidden="true"
              focusable="false"
            />
            {form.backgroundImage ? t(language, "changeImage") : t(language, "uploadImage")}
          </button>
          {form.backgroundImage && (
            <button
              type="button"
              className="add-tile-image-upload__remove"
              onClick={() => form.setBackgroundImage(null)}
              aria-label={t(language, "removeBackgroundImage")}
            >
              <X className="add-tile-image-upload__btn-icon" aria-hidden="true" focusable="false" />
            </button>
          )}
          <input
            ref={form.bgImageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/bmp,image/avif"
            className="add-tile-image-upload__input"
            onChange={(event) =>
              form.readUploadedFile(event, IMAGE_PATTERN, form.setBackgroundImage)
            }
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      </div>

      <div className="add-tile-field">
        <span className="add-tile-field__label">{t(language, "tileSoundFile")}</span>
        <div className="add-tile-sound-upload">
          <button
            type="button"
            className="add-tile-image-upload__btn"
            onClick={() => form.soundInputRef.current?.click()}
          >
            <Music
              className="add-tile-image-upload__btn-icon"
              aria-hidden="true"
              focusable="false"
            />
            {form.soundFile ? t(language, "changeSoundFile") : t(language, "uploadSoundFile")}
          </button>
          {form.soundFile && (
            <>
              <button
                type="button"
                className="add-tile-sound-upload__preview-btn"
                onClick={form.handlePreviewSound}
                aria-label={t(language, "previewSound")}
              >
                <Music
                  className="add-tile-image-upload__btn-icon"
                  aria-hidden="true"
                  focusable="false"
                />
                {t(language, "previewSound")}
              </button>
              <button
                type="button"
                className="add-tile-image-upload__remove"
                onClick={() => form.setSoundFile(null)}
                aria-label={t(language, "removeSoundFile")}
              >
                <X
                  className="add-tile-image-upload__btn-icon"
                  aria-hidden="true"
                  focusable="false"
                />
              </button>
            </>
          )}
          <input
            ref={form.soundInputRef}
            type="file"
            accept="audio/mpeg,audio/ogg,audio/wav,audio/mp4,audio/webm,audio/aac,audio/flac"
            className="add-tile-image-upload__input"
            onChange={(event) => form.readUploadedFile(event, AUDIO_PATTERN, form.setSoundFile)}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
        {form.soundFile && <p className="add-tile-field__hint">{t(language, "soundFileHint")}</p>}
      </div>
    </>
  );
}
