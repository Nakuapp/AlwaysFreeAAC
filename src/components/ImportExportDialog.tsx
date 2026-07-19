import { Download, Upload } from "lucide-react";
import type { Category } from "../data/vocabulary";
import { t, type Language } from "../i18n";
import { useOBFTransfer } from "../hooks/useOBFTransfer";
import { IconVisual } from "./IconVisual";
import { Dialog } from "./Dialog";
import type { UserBoard } from "../App";
import "./ImportExportDialog.css";

interface ImportExportDialogProps {
  language: Language;
  /** All categories available for export (user boards + visible built-ins) */
  allCategories: Category[];
  onImportBoards: (boards: UserBoard[]) => void;
  onClose: () => void;
}

export function ImportExportDialog({
  language,
  allCategories,
  onImportBoards,
  onClose,
}: ImportExportDialogProps) {
  const {
    selectedIds,
    toggleSelection,
    selectAll,
    deselectAll,
    allSelected,
    selectedCount,
    exportFormatLabel,
    isExporting,
    handleExport,
    fileInputRef,
    importStatus,
    importCount,
    handleImportFile,
    triggerImport,
  } = useOBFTransfer({
    items: allCategories,
    language,
    onImport: onImportBoards,
  });

  return (
    <Dialog
      title={t(language, "importExport")}
      titleId="import-export-title"
      closeLabel={t(language, "close")}
      onClose={onClose}
      maxWidth="460px"
      bodyClassName="dialog-panel__body--padded"
      footer={
        <button type="button" className="dialog-done-btn" onClick={onClose}>
          {t(language, "done")}
        </button>
      }
    >
      {/* ── Export section ───────────────────────────── */}
      <section className="ie-section">
        <h3 className="ie-section__title">{t(language, "exportSection")}</h3>

        <div className="ie-board-list" role="group" aria-label={t(language, "exportBoardsLabel")}>
          {allCategories.map((cat) => (
            <label key={cat.id} className="ie-board-row">
              <input
                type="checkbox"
                className="ie-board-row__checkbox"
                checked={selectedIds.has(cat.id)}
                onChange={() => toggleSelection(cat.id)}
              />
              <IconVisual value={cat.emoji} className="ie-board-row__icon" />
              <span className="ie-board-row__label">{cat.label}</span>
            </label>
          ))}
        </div>

        <div className="ie-select-shortcuts">
          <button
            type="button"
            className="ie-link-btn"
            onClick={allSelected ? deselectAll : selectAll}
          >
            {allSelected ? t(language, "deselectAll") : t(language, "selectAll")}
          </button>
        </div>

        <p className="ie-format-hint">{exportFormatLabel}</p>

        <button
          type="button"
          className="ie-export-btn"
          onClick={handleExport}
          disabled={selectedCount === 0 || isExporting}
        >
          <Download className="ie-export-btn__icon" aria-hidden="true" focusable="false" />
          {t(language, "exportSelected")}
        </button>
      </section>

      {/* ── Import section ───────────────────────────── */}
      <section className="ie-section">
        <h3 className="ie-section__title">{t(language, "importSection")}</h3>
        <p className="ie-format-hint">{t(language, "importBoardHint")}</p>

        <button type="button" className="ie-import-btn" onClick={triggerImport}>
          <Upload className="ie-import-btn__icon" aria-hidden="true" focusable="false" />
          {t(language, "importBoard")}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".obf,.obz,application/json,application/zip"
          className="ie-file-input"
          onChange={handleImportFile}
          aria-hidden="true"
          tabIndex={-1}
        />

        {importStatus === "success" && (
          <p className="ie-status ie-status--success" role="status">
            {t(language, "importSuccess", { count: importCount })}
          </p>
        )}
        {importStatus === "error" && (
          <p className="ie-status ie-status--error" role="alert">
            {t(language, "importBoardError")}
          </p>
        )}
      </section>
    </Dialog>
  );
}
