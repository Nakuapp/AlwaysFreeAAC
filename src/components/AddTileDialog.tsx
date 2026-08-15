import type { TileSize, Symbol } from "../data/vocabulary";
import { t, type Language } from "../i18n";
import { Dialog } from "./Dialog";
import { IconTileTab } from "./add-tile/IconTileTab";
import { MediaTileTab } from "./add-tile/MediaTileTab";
import { StyleTileTab } from "./add-tile/StyleTileTab";
import { TileDialogHeader } from "./add-tile/TileDialogHeader";
import { useAddTileForm } from "./add-tile/useAddTileForm";
import "./AddTileDialog.css";

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

export function AddTileDialog({
  language,
  onSave,
  onClose,
  initialSymbol,
  initialLabel,
  defaultTileSize,
}: AddTileDialogProps) {
  const isEditing = initialSymbol !== undefined;
  const form = useAddTileForm({ initialSymbol, initialLabel, onSave });

  return (
    <Dialog
      title={t(language, isEditing ? "editTileTitle" : "addTileTitle")}
      titleId="add-tile-title"
      closeLabel={t(language, "close")}
      onClose={onClose}
      maxWidth="420px"
      panelClassName="add-tile-panel dialog-panel--round-close"
      bodyClassName="add-tile-panel__body"
      initialFocusRef={form.labelInputRef}
      headerExtension={<TileDialogHeader language={language} isEditing={isEditing} form={form} />}
      footer={
        <>
          <button type="button" className="add-tile-panel__cancel" onClick={onClose}>
            {t(language, "cancel")}
          </button>
          <button
            type="button"
            className="add-tile-panel__save"
            onClick={form.handleSave}
            disabled={!form.isValid}
          >
            {t(language, "save")}
          </button>
        </>
      }
    >
      {form.activeTab === "icon" && <IconTileTab language={language} form={form} />}

      {form.activeTab === "style" && (
        <StyleTileTab language={language} defaultTileSize={defaultTileSize} form={form} />
      )}

      {form.activeTab === "media" && <MediaTileTab language={language} form={form} />}
    </Dialog>
  );
}
