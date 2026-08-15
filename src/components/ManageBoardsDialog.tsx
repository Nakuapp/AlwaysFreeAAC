import { t, type Language } from "../i18n";
import { Dialog } from "./Dialog";
import { useOBFTransfer } from "../hooks/useOBFTransfer";
import type { UserBoard } from "../domain/models";
import { ExportBoardsSection } from "./manage-boards/ExportBoardsSection";
import { ImportBoardsSection } from "./manage-boards/ImportBoardsSection";
import { UserBoardsSection } from "./manage-boards/UserBoardsSection";
import "./ManageBoardsDialog.css";

interface ManageBoardsDialogProps {
  language: Language;
  userBoards: UserBoard[];
  onUpdateUserBoards: (boards: UserBoard[]) => void;
  onClose: () => void;
}

export function ManageBoardsDialog({
  language,
  userBoards,
  onUpdateUserBoards,
  onClose,
}: ManageBoardsDialogProps) {
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
    items: userBoards,
    language,
    onImport: (importedBoards) => onUpdateUserBoards([...userBoards, ...importedBoards]),
  });

  return (
    <Dialog
      title={t(language, "manageBoards")}
      titleId="manage-boards-title"
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
      <UserBoardsSection
        language={language}
        userBoards={userBoards}
        onUpdateUserBoards={onUpdateUserBoards}
      />

      <ExportBoardsSection
        language={language}
        userBoards={userBoards}
        selectedIds={selectedIds}
        allSelected={allSelected}
        selectedCount={selectedCount}
        exportFormatLabel={exportFormatLabel}
        isExporting={isExporting}
        onToggleSelection={toggleSelection}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onExport={handleExport}
      />
      <ImportBoardsSection
        language={language}
        fileInputRef={fileInputRef}
        importStatus={importStatus}
        importCount={importCount}
        onImportFile={handleImportFile}
        onTriggerImport={triggerImport}
      />
    </Dialog>
  );
}
