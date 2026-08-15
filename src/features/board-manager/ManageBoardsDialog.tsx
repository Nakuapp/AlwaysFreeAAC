import { useState } from "react";
import { t, type Language } from "../../i18n";
import { Dialog } from "../../components/dialog";
import type { UserBoard } from "../../domain";
import { handleTabKeyDown } from "../../utils/tabNavigation";
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
  const [activeTab, setActiveTab] = useState<"boards" | "transfer">("boards");
  const tabIds = ["boards", "transfer"] as const;
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
      <div className="manage-boards-tabs" role="tablist" aria-label={t(language, "manageBoards")}>
        <button
          type="button"
          role="tab"
          id="manage-boards-tab-boards"
          aria-controls="manage-boards-panel-boards"
          aria-selected={activeTab === "boards"}
          className={`manage-boards-tabs__tab${activeTab === "boards" ? " manage-boards-tabs__tab--active" : ""}`}
          onClick={() => setActiveTab("boards")}
          onKeyDown={(event) => handleTabKeyDown(event, tabIds, "boards", setActiveTab)}
          tabIndex={activeTab === "boards" ? 0 : -1}
        >
          {t(language, "boardSettingsTab")}
        </button>
        <button
          type="button"
          role="tab"
          id="manage-boards-tab-transfer"
          aria-controls="manage-boards-panel-transfer"
          aria-selected={activeTab === "transfer"}
          className={`manage-boards-tabs__tab${activeTab === "transfer" ? " manage-boards-tabs__tab--active" : ""}`}
          onClick={() => setActiveTab("transfer")}
          onKeyDown={(event) => handleTabKeyDown(event, tabIds, "transfer", setActiveTab)}
          tabIndex={activeTab === "transfer" ? 0 : -1}
        >
          {t(language, "importExportTab")}
        </button>
      </div>

      {activeTab === "boards" && (
        <div
          id="manage-boards-panel-boards"
          role="tabpanel"
          aria-labelledby="manage-boards-tab-boards"
          className="manage-boards-tabpanel"
        >
          <UserBoardsSection
            language={language}
            userBoards={userBoards}
            onCreateBoard={onCreateBoard}
            onDeleteBoard={onDeleteBoard}
            onRenameBoard={onRenameBoard}
            onMoveBoard={onMoveBoard}
          />
        </div>
      )}

      {activeTab === "transfer" && (
        <div
          id="manage-boards-panel-transfer"
          role="tabpanel"
          aria-labelledby="manage-boards-tab-transfer"
          className="manage-boards-tabpanel"
        >
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
        </div>
      )}
    </Dialog>
  );
}
