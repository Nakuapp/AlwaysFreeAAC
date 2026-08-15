import type { TileSize, Symbol } from "../../domain";
import { t, type Language } from "../../i18n";
import { Dialog } from "../../components/dialog";
import { IconTileTab } from "./IconTileTab";
import { MediaTileTab } from "./MediaTileTab";
import { StyleTileTab } from "./StyleTileTab";
import { TileDialogHeader } from "./TileDialogHeader";
import { useAddTileForm } from "./useAddTileForm";
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
  onError?: (error: Error) => void;
}

export function AddTileDialog({
  language,
  onSave,
  onClose,
  initialSymbol,
  initialLabel,
  defaultTileSize,
  onError,
}: AddTileDialogProps) {
  const isEditing = initialSymbol !== undefined;
  const form = useAddTileForm({ initialSymbol, initialLabel, onSave, onError });

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
