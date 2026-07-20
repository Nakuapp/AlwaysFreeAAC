import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { t, type Language } from "../i18n";
import { CUSTOM_TILE_ICON_OPTIONS, toAppIconValue } from "../iconUtils";
import { IconVisual } from "./IconVisual";
import { Dialog } from "./Dialog";
import { useOBFTransfer } from "../hooks/useOBFTransfer";
import type { UserBoard } from "../types/userBoard";
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
  const [activeTab, setActiveTab] = useState<"boards" | "transfer">("boards");
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardIcon, setNewBoardIcon] = useState("pen-square");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");
  const skipRenameBlurRef = useRef(false);

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
    onImport: (importedBoards) =>
      onUpdateUserBoards([...userBoards, ...importedBoards]),
  });

  function handleCreateBoard() {
    const name = newBoardName.trim();
    if (!name) return;
    const newBoard: UserBoard = {
      id: `board-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: name,
      emoji: toAppIconValue(newBoardIcon as Parameters<typeof toAppIconValue>[0], "outline"),
      symbols: [],
    };
    onUpdateUserBoards([...userBoards, newBoard]);
    setNewBoardName("");
    setNewBoardIcon("pen-square");
    setShowNewBoardForm(false);
  }

  function handleDeleteBoard(id: string) {
    if (!window.confirm(t(language, "confirmDeleteBoard"))) return;
    onUpdateUserBoards(userBoards.filter((b) => b.id !== id));
  }

  function handleStartRename(board: UserBoard) {
    skipRenameBlurRef.current = false;
    setRenamingId(board.id);
    setRenamingValue(board.label);
  }

  function handleSaveRename(id: string) {
    const name = renamingValue.trim();
    if (name) {
      onUpdateUserBoards(userBoards.map((b) => (b.id === id ? { ...b, label: name } : b)));
    }
    setRenamingId(null);
    setRenamingValue("");
  }

  function handleCancelRename() {
    setRenamingId(null);
    setRenamingValue("");
  }

  function handleRenameBlur(id: string) {
    if (skipRenameBlurRef.current) {
      skipRenameBlurRef.current = false;
      return;
    }
    handleSaveRename(id);
  }

  function moveBoard(index: number, direction: -1 | 1) {
    const newBoards = [...userBoards];
    const target = index + direction;
    if (target < 0 || target >= newBoards.length) return;
    [newBoards[index], newBoards[target]] = [newBoards[target], newBoards[index]];
    onUpdateUserBoards(newBoards);
  }

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
          <div className="manage-boards-section">
            <div className="manage-boards-section__header">
              <h3 className="manage-boards-section__title">{t(language, "userBoards")}</h3>
              <button
                type="button"
                className="manage-boards-section__add-btn"
                onClick={() => setShowNewBoardForm((v) => !v)}
                aria-expanded={showNewBoardForm}
              >
                <Plus className="manage-boards-section__add-icon" aria-hidden="true" focusable="false" />
                {t(language, "newBoard")}
              </button>
            </div>

            {showNewBoardForm && (
              <div className="manage-boards-new-form">
                <input
                  type="text"
                  className="manage-boards-new-form__input"
                  placeholder={t(language, "boardNamePlaceholder")}
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateBoard();
                    if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowNewBoardForm(false);
                    }
                  }}
                  autoFocus
                  maxLength={40}
                  aria-label={t(language, "boardName")}
                />
                <div className="manage-boards-new-form__icon-row">
                  {CUSTOM_TILE_ICON_OPTIONS.slice(0, 20).map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      className={`manage-boards-new-form__icon-btn${newBoardIcon === icon.value ? " manage-boards-new-form__icon-btn--selected" : ""}`}
                      onClick={() => setNewBoardIcon(icon.value)}
                      aria-label={icon.label}
                      aria-pressed={newBoardIcon === icon.value}
                    >
                      <IconVisual
                        value={toAppIconValue(icon.value as Parameters<typeof toAppIconValue>[0], "outline")}
                        className="manage-boards-new-form__icon-value"
                      />
                    </button>
                  ))}
                </div>
                <div className="manage-boards-new-form__actions">
                  <button
                    type="button"
                    className="manage-boards-new-form__cancel"
                    onClick={() => setShowNewBoardForm(false)}
                  >
                    {t(language, "cancel")}
                  </button>
                  <button
                    type="button"
                    className="manage-boards-new-form__create"
                    onClick={handleCreateBoard}
                    disabled={!newBoardName.trim()}
                  >
                    {t(language, "createBoard")}
                  </button>
                </div>
              </div>
            )}

            <ul className="manage-boards-list" role="list">
              {userBoards.length === 0 && !showNewBoardForm && (
                <li className="manage-boards-list__empty">{t(language, "noCustomTiles")}</li>
              )}
              {userBoards.map((board, index) => (
                <li key={board.id} className="manage-boards-list__item">
                  <IconVisual value={board.emoji} className="manage-boards-list__icon" />
                  {renamingId === board.id ? (
                    <input
                      type="text"
                      className="manage-boards-list__rename-input"
                      value={renamingValue}
                      onChange={(e) => setRenamingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          e.stopPropagation();
                          skipRenameBlurRef.current = true;
                          handleCancelRename();
                        }
                      }}
                      onBlur={() => handleRenameBlur(board.id)}
                      autoFocus
                      maxLength={40}
                      aria-label={t(language, "boardName")}
                    />
                  ) : (
                    <span className="manage-boards-list__label">{board.label}</span>
                  )}
                  <div className="manage-boards-list__actions">
                    <button
                      type="button"
                      className="manage-boards-list__btn"
                      onClick={() => moveBoard(index, -1)}
                      disabled={index === 0}
                      aria-label={`${t(language, "moveUp")}: ${board.label}`}
                    >
                      <ArrowUp className="manage-boards-list__btn-icon" aria-hidden="true" focusable="false" />
                    </button>
                    <button
                      type="button"
                      className="manage-boards-list__btn"
                      onClick={() => moveBoard(index, 1)}
                      disabled={index === userBoards.length - 1}
                      aria-label={`${t(language, "moveDown")}: ${board.label}`}
                    >
                      <ArrowDown className="manage-boards-list__btn-icon" aria-hidden="true" focusable="false" />
                    </button>
                    <button
                      type="button"
                      className="manage-boards-list__btn"
                      onClick={() => handleStartRename(board)}
                      aria-label={`${t(language, "renameBoard")}: ${board.label}`}
                    >
                      <Pencil className="manage-boards-list__btn-icon" aria-hidden="true" focusable="false" />
                    </button>
                    <button
                      type="button"
                      className="manage-boards-list__btn manage-boards-list__btn--danger"
                      onClick={() => handleDeleteBoard(board.id)}
                      aria-label={`${t(language, "deleteBoard")}: ${board.label}`}
                    >
                      <Trash2 className="manage-boards-list__btn-icon" aria-hidden="true" focusable="false" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "transfer" && (
        <div
          id="manage-boards-panel-transfer"
          role="tabpanel"
          aria-labelledby="manage-boards-tab-transfer"
          className="manage-boards-tabpanel"
        >
          <div className="manage-boards-section">
            <h3 className="manage-boards-section__title">{t(language, "exportSection")}</h3>
            <div className="manage-boards-export-list" role="group" aria-label={t(language, "exportBoardsLabel")}>
              {userBoards.map((board) => (
                <label key={board.id} className="manage-boards-export-row">
                  <input
                    type="checkbox"
                    className="manage-boards-export-row__checkbox"
                    checked={selectedIds.has(board.id)}
                    onChange={() => toggleSelection(board.id)}
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
                onClick={allSelected ? deselectAll : selectAll}
              >
                {allSelected ? t(language, "deselectAll") : t(language, "selectAll")}
              </button>
            </div>
            <p className="manage-boards-hint">{exportFormatLabel}</p>
            <button
              type="button"
              className="manage-boards-action-btn"
              onClick={handleExport}
              disabled={selectedCount === 0 || isExporting}
            >
              <Download className="manage-boards-action-btn__icon" aria-hidden="true" focusable="false" />
              {t(language, "exportSelected")}
            </button>
          </div>

          <div className="manage-boards-section">
            <h3 className="manage-boards-section__title">{t(language, "importSection")}</h3>
            <p className="manage-boards-hint">{t(language, "importBoardHint")}</p>
            <button type="button" className="manage-boards-action-btn" onClick={triggerImport}>
              <Upload className="manage-boards-action-btn__icon" aria-hidden="true" focusable="false" />
              {t(language, "importBoard")}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".obf,.obz,application/json,application/zip"
              className="manage-boards-file-input"
              onChange={handleImportFile}
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
        </div>
      )}
    </Dialog>
  );
}
