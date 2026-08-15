import type { Language } from "../../i18n";
import type { UserBoard } from "../../domain";
import { ExportBoardsSection } from "./ExportBoardsSection";
import { ImportBoardsSection } from "./ImportBoardsSection";
import { UserBoardsSection } from "./UserBoardsSection";
import { useOBFTransfer } from "./useOBFTransfer";
import "./BoardsSettingsTab.css";

interface BoardsSettingsTabProps {
  id: string;
  hidden: boolean;
  language: Language;
  userBoards: UserBoard[];
  onCreateBoard: (label: string, emoji: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onRenameBoard: (boardId: string, label: string) => void;
  onMoveBoard: (boardId: string, direction: -1 | 1) => void;
  onImportBoards: (boards: UserBoard[]) => void;
  onExportError?: (error: Error) => void;
}

export function BoardsSettingsTab({
  id,
  hidden,
  language,
  userBoards,
  onCreateBoard,
  onDeleteBoard,
  onRenameBoard,
  onMoveBoard,
  onImportBoards,
  onExportError,
}: BoardsSettingsTabProps) {
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
    <div
      id={id}
      role="tabpanel"
      aria-labelledby="settings-tab-boards"
      hidden={hidden}
      className="settings-tabpanel"
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
    </div>
  );
}
