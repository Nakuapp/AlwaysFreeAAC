import { ImageIcon, Music, Palette } from "lucide-react";
import { t, type Language } from "../../i18n";
import { handleTabKeyDown } from "../../utils/tabNavigation";
import { SymbolVisual } from "../../components/symbol";
import type { AddTileForm } from "./useAddTileForm";

interface TileDialogHeaderProps {
  language: Language;
  isEditing: boolean;
  form: AddTileForm;
}

export function TileDialogHeader({ language, isEditing, form }: TileDialogHeaderProps) {
  const tabIds = ["icon", "style", "media"] as const;

  return (
    <>
      <div className="add-tile-preview-row">
        <div
          className="add-tile-preview"
          style={{ background: form.color || "var(--color-default)" }}
        >
          <span className="add-tile-preview__icon" aria-hidden="true">
            <SymbolVisual value={form.previewIcon} className="add-tile-preview__icon-value" />
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
          onKeyDown={(event) => handleTabKeyDown(event, tabIds, "icon", form.setActiveTab)}
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
          onKeyDown={(event) => handleTabKeyDown(event, tabIds, "style", form.setActiveTab)}
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
          onKeyDown={(event) => handleTabKeyDown(event, tabIds, "media", form.setActiveTab)}
        >
          <Music className="dialog-tab__icon" aria-hidden="true" focusable="false" />
          {t(language, "tileDlgTabMedia")}
        </button>
      </div>
    </>
  );
}
