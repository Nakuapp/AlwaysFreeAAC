import { ImageIcon, Music, Palette } from "lucide-react";
import { t, type Language } from "../../i18n";
import { IconVisual } from "../IconVisual";
import type { AddTileForm } from "./useAddTileForm";

interface TileDialogHeaderProps {
  language: Language;
  isEditing: boolean;
  form: AddTileForm;
}

export function TileDialogHeader({ language, isEditing, form }: TileDialogHeaderProps) {
  return (
    <>
      <div className="add-tile-preview-row">
        <div
          className="add-tile-preview"
          style={{ background: `var(--color-${form.color}, var(--color-default))` }}
        >
          <span className="add-tile-preview__icon" aria-hidden="true">
            <IconVisual
              value={form.previewIcon}
              className="add-tile-preview__icon-value"
              iconColor={form.previewIconColor}
            />
          </span>
          <span className="add-tile-preview__label">{form.label || "…"}</span>
        </div>
      </div>

      <div
        className="dialog-tabs"
        role="tablist"
        aria-label={t(language, isEditing ? "editTileTitle" : "addTileTitle")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={form.activeTab === "icon"}
          className={`dialog-tab${form.activeTab === "icon" ? " dialog-tab--active" : ""}`}
          onClick={() => form.setActiveTab("icon")}
          tabIndex={form.activeTab === "icon" ? 0 : -1}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") form.setActiveTab("style");
            else if (event.key === "ArrowLeft") form.setActiveTab("media");
          }}
        >
          <ImageIcon className="dialog-tab__icon" aria-hidden="true" focusable="false" />
          {t(language, "tileDlgTabIcon")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={form.activeTab === "style"}
          className={`dialog-tab${form.activeTab === "style" ? " dialog-tab--active" : ""}`}
          onClick={() => form.setActiveTab("style")}
          tabIndex={form.activeTab === "style" ? 0 : -1}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") form.setActiveTab("media");
            else if (event.key === "ArrowLeft") form.setActiveTab("icon");
          }}
        >
          <Palette className="dialog-tab__icon" aria-hidden="true" focusable="false" />
          {t(language, "tileDlgTabStyle")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={form.activeTab === "media"}
          className={`dialog-tab${form.activeTab === "media" ? " dialog-tab--active" : ""}${form.backgroundImage || form.soundFile ? " dialog-tab--has-content" : ""}`}
          onClick={() => form.setActiveTab("media")}
          tabIndex={form.activeTab === "media" ? 0 : -1}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") form.setActiveTab("icon");
            else if (event.key === "ArrowLeft") form.setActiveTab("style");
          }}
        >
          <Music className="dialog-tab__icon" aria-hidden="true" focusable="false" />
          {t(language, "tileDlgTabMedia")}
        </button>
      </div>
    </>
  );
}
