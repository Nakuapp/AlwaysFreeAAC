import type { ChangeEvent, RefObject } from "react";
import { Upload } from "lucide-react";
import { t, type Language } from "../../i18n";

interface ImportBoardsSectionProps {
  language: Language;
  fileInputRef: RefObject<HTMLInputElement | null>;
  importStatus: "idle" | "success" | "error";
  importCount: number;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onTriggerImport: () => void;
}

export function ImportBoardsSection({
  language,
  fileInputRef,
  importStatus,
  importCount,
  onImportFile,
  onTriggerImport,
}: ImportBoardsSectionProps) {
  return (
    <div className="manage-boards-section">
      <h3 className="manage-boards-section__title">{t(language, "importSection")}</h3>
      <p className="manage-boards-hint">{t(language, "importBoardHint")}</p>
      <button type="button" className="manage-boards-action-btn" onClick={onTriggerImport}>
        <Upload className="manage-boards-action-btn__icon" aria-hidden="true" focusable="false" />
        {t(language, "importBoard")}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".obf,.obz,application/json,application/zip"
        className="manage-boards-file-input"
        onChange={onImportFile}
        aria-hidden="true"
        tabIndex={-1}
      />
      {importStatus === "success" && (
        <p className="manage-boards-status manage-boards-status--success" role="status">
          {t(language, "importSuccess", { count: importCount })}
        </p>
      )}
      {importStatus === "error" && (
        <p className="manage-boards-status manage-boards-status--error" role="alert">
          {t(language, "importBoardError")}
        </p>
      )}
    </div>
  );
}
