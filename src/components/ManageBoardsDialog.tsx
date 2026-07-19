import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ArrowDown, ArrowUp, Download, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { t, type Language } from "../i18n";
import { CUSTOM_TILE_ICON_OPTIONS, toAppIconValue } from "../iconUtils";
import { IconVisual } from "./IconVisual";
import type { UserBoard } from "../App";
import {
  exportCategoryToOBF,
  exportCategoriesToOBZ,
  downloadOBF,
  downloadOBZ,
  readOBFFile,
  readOBZFile,
  importOBFToSymbols,
  type OBFBoard,
} from "../utils/openboard";
import "./ManageBoardsDialog.css";

type ImportStatus = "idle" | "success" | "error";

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
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardIcon, setNewBoardIcon] = useState("pen-square");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");
  const skipRenameBlurRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedBoardIds, setSelectedBoardIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importCount, setImportCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useFocusTrap(panelRef);

  // Move focus into the dialog on open (WCAG 2.4.3)
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setSelectedBoardIds((prev) => {
      if (prev.size === 0) return prev;
      const validIds = new Set(userBoards.map((board) => board.id));
      const next = new Set(Array.from(prev).filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [userBoards]);

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

  function toggleBoardSelection(id: string) {
    setSelectedBoardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllBoards() {
    setSelectedBoardIds(new Set(userBoards.map((board) => board.id)));
  }

  function deselectAllBoards() {
    setSelectedBoardIds(new Set());
  }

  async function handleExportBoards() {
    const selectedBoards = userBoards.filter((board) => selectedBoardIds.has(board.id));
    if (selectedBoards.length === 0) return;
    setIsExporting(true);
    try {
      if (selectedBoards.length === 1) {
        downloadOBF(exportCategoryToOBF(selectedBoards[0], language));
      } else {
        const { blob, filename } = await exportCategoriesToOBZ(selectedBoards, language);
        downloadOBZ(blob, filename);
      }
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImportBoards(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportStatus("idle");
    try {
      const isOBZ = file.name.toLowerCase().endsWith(".obz") || file.type === "application/zip";
      const imported = isOBZ ? await readOBZFile(file) : [await readOBFFile(file)];
      const importedBoards = imported
        .map((board) => obfBoardToUserBoard(board, language))
        .filter((board) => board.symbols.length > 0);
      if (importedBoards.length === 0) {
        setImportStatus("error");
        return;
      }
      onUpdateUserBoards([...userBoards, ...importedBoards]);
      setImportCount(importedBoards.length);
      setImportStatus("success");
    } catch {
      setImportStatus("error");
    }
  }

  const selectedBoardCount = selectedBoardIds.size;
  const allBoardsSelected = userBoards.length > 0 && selectedBoardCount === userBoards.length;
  const exportFormatLabel =
    selectedBoardCount === 0
      ? t(language, "exportFormatNone")
      : selectedBoardCount === 1
        ? t(language, "exportFormatOBF")
        : t(language, "exportFormatOBZ");

  return (
    <div
      className="manage-boards-overlay"
    >
      <div className="manage-boards-panel" role="dialog" aria-modal="true" aria-labelledby="manage-boards-title" ref={panelRef}>
        <div className="manage-boards-panel__header">
          <h2 className="manage-boards-panel__title" id="manage-boards-title">{t(language, "manageBoards")}</h2>
          <button
            className="manage-boards-panel__close"
            onClick={onClose}
            aria-label={t(language, "close")}
            type="button"
            ref={closeButtonRef}
          >
            <X className="manage-boards-panel__close-icon" aria-hidden="true" focusable="false" />
          </button>
        </div>

        <div className="manage-boards-panel__body">
          {/* User boards section */}
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

                <div className="manage-boards-section">
                  <h3 className="manage-boards-section__title">{t(language, "exportSection")}</h3>
                  <div className="manage-boards-export-list" role="group" aria-label={t(language, "exportBoardsLabel")}>
                    {userBoards.map((board) => {
                      const checked = selectedBoardIds.has(board.id);
                      return (
                        <label key={board.id} className="manage-boards-export-row">
                          <input
                            type="checkbox"
                            className="manage-boards-export-row__checkbox"
                            checked={checked}
                            onChange={() => toggleBoardSelection(board.id)}
                          />
                          <IconVisual value={board.emoji} className="manage-boards-export-row__icon" />
                          <span className="manage-boards-export-row__label">{board.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="manage-boards-export-shortcuts">
                    <button
                      type="button"
                      className="manage-boards-link-btn"
                      onClick={allBoardsSelected ? deselectAllBoards : selectAllBoards}
                    >
                      {allBoardsSelected ? t(language, "deselectAll") : t(language, "selectAll")}
                    </button>
                  </div>
                  <p className="manage-boards-hint">{exportFormatLabel}</p>
                  <button
                    type="button"
                    className="manage-boards-action-btn"
                    onClick={handleExportBoards}
                    disabled={selectedBoardCount === 0 || isExporting}
                  >
                    <Download className="manage-boards-action-btn__icon" aria-hidden="true" focusable="false" />
                    {t(language, "exportSelected")}
                  </button>
                </div>

                <div className="manage-boards-section">
                  <h3 className="manage-boards-section__title">{t(language, "importSection")}</h3>
                  <p className="manage-boards-hint">{t(language, "importBoardHint")}</p>
                  <button
                    type="button"
                    className="manage-boards-action-btn"
                    onClick={() => {
                      setImportStatus("idle");
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="manage-boards-action-btn__icon" aria-hidden="true" focusable="false" />
                    {t(language, "importBoard")}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".obf,.obz,application/json,application/zip"
                    className="manage-boards-file-input"
                    onChange={handleImportBoards}
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

            <ul className="manage-boards-list" role="list">
              {userBoards.length === 0 && !showNewBoardForm && (
                <li className="manage-boards-list__empty">{t(language, "noCustomTiles")}</li>
              )}
              {userBoards.map((board, index) => (                <li key={board.id} className="manage-boards-list__item">
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

        <div className="manage-boards-panel__footer">
          <button type="button" className="manage-boards-panel__done" onClick={onClose}>
            {t(language, "done")}
          </button>
        </div>
      </div>
    </div>
  );
}

function obfBoardToUserBoard(board: OBFBoard, language: Language): UserBoard {
  const symbols = importOBFToSymbols(board);
  const boardName = typeof board.name === "string" ? board.name.trim() : "";
  return {
    id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: boardName || t(language, "importedBoard"),
    emoji: "pen-square",
    symbols,
  };
}
