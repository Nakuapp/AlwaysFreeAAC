import { Download } from "lucide-react";
import type { UserBoard } from "../../domain/models";
import { t, type Language } from "../../i18n";
import { IconVisual } from "../../components/icon";

interface ExportBoardsSectionProps {
  language: Language;
  userBoards: UserBoard[];
  selectedIds: Set<string>;
  allSelected: boolean;
  selectedCount: number;
  exportFormatLabel: string;
  isExporting: boolean;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onExport: () => void;
}

export function ExportBoardsSection({
  language,
  userBoards,
  selectedIds,
  allSelected,
  selectedCount,
  exportFormatLabel,
  isExporting,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onExport,
}: ExportBoardsSectionProps) {
  return (
    <div className="manage-boards-section">
      <h3 className="manage-boards-section__title">{t(language, "exportSection")}</h3>
      <div
        className="manage-boards-export-list"
        role="group"
        aria-label={t(language, "exportBoardsLabel")}
      >
        {userBoards.map((board) => (
          <label key={board.id} className="manage-boards-export-row">
            <input
              type="checkbox"
              className="manage-boards-export-row__checkbox"
              checked={selectedIds.has(board.id)}
              onChange={() => onToggleSelection(board.id)}
            />
            <IconVisual value={board.emoji} className="manage-boards-export-row__icon" />
            <span className="manage-boards-export-row__label">{board.label}</span>
          </label>
        ))}
      </div>
      <div className="manage-boards-export-shortcuts">
        <button
          type="button"
          className="manage-boards-link-btn"
          onClick={allSelected ? onDeselectAll : onSelectAll}
        >
          {allSelected ? t(language, "deselectAll") : t(language, "selectAll")}
        </button>
      </div>
      <p className="manage-boards-hint">{exportFormatLabel}</p>
      <button
        type="button"
        className="manage-boards-action-btn"
        onClick={onExport}
        disabled={selectedCount === 0 || isExporting}
      >
        <Download className="manage-boards-action-btn__icon" aria-hidden="true" focusable="false" />
        {t(language, "exportSelected")}
      </button>
    </div>
  );
}
