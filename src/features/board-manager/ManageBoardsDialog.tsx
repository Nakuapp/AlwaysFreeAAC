import { t, type Language } from "../../i18n";
import { Dialog } from "../../components/dialog";
import type { UserBoard } from "../../domain";
import { ExportBoardsSection } from "./ExportBoardsSection";
import { ImportBoardsSection } from "./ImportBoardsSection";
import { UserBoardsSection } from "./UserBoardsSection";
import { useOBFTransfer } from "./useOBFTransfer";
import "./ManageBoardsDialog.css";

interface ManageBoardsDialogProps {
  language: Language;
  userBoards: UserBoard[];
  onCreateBoard: (label: string, emoji: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onRenameBoard: (boardId: string, label: string) => void;
  onMoveBoard: (boardId: string, direction: -1 | 1) => void;
  onImportBoards: (boards: UserBoard[]) => void;
  onExportError?: (error: Error) => void;
  onClose: () => void;
}

export function ManageBoardsDialog({
  language,
  userBoards,
  onCreateBoard,
  onDeleteBoard,
  onRenameBoard,
  onMoveBoard,
  onImportBoards,
  onExportError,
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
    importError,
    handleImportFile,
    triggerImport,
  } = useOBFTransfer({
    items: userBoards,
    language,
    onImport: onImportBoards,
    onExportError,
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
        onCreateBoard={onCreateBoard}
        onDeleteBoard={onDeleteBoard}
        onRenameBoard={onRenameBoard}
        onMoveBoard={onMoveBoard}
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
        importError={importError}
        onImportFile={handleImportFile}
        onTriggerImport={triggerImport}
      />
    </Dialog>
  );
}
