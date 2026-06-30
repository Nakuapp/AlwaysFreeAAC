import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2, X } from "lucide-react";
import type { Category } from "../data/vocabulary";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { t, type Language } from "../i18n";
import { CUSTOM_TILE_ICON_OPTIONS, toAppIconValue } from "../iconUtils";
import { IconVisual } from "./IconVisual";
import type { UserBoard } from "../App";
import "./ManageBoardsDialog.css";

interface ManageBoardsDialogProps {
  language: Language;
  userBoards: UserBoard[];
  builtInCategories: Category[];
  hiddenBuiltinIds: Set<string>;
  onUpdateUserBoards: (boards: UserBoard[]) => void;
  onToggleBuiltIn: (id: string) => void;
  onClose: () => void;
}

export function ManageBoardsDialog({
  language,
  userBoards,
  builtInCategories,
  hiddenBuiltinIds,
  onUpdateUserBoards,
  onToggleBuiltIn,
  onClose,
}: ManageBoardsDialogProps) {
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardIcon, setNewBoardIcon] = useState("pen-square");
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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

  function moveBoard(index: number, direction: -1 | 1) {
    const newBoards = [...userBoards];
    const target = index + direction;
    if (target < 0 || target >= newBoards.length) return;
    [newBoards[index], newBoards[target]] = [newBoards[target], newBoards[index]];
    onUpdateUserBoards(newBoards);
  }

  return (
    <div
      className="manage-boards-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t(language, "manageBoards")}
    >
      <div className="manage-boards-panel" ref={panelRef}>
        <div className="manage-boards-panel__header">
          <h2 className="manage-boards-panel__title">{t(language, "manageBoards")}</h2>
          <button
            className="manage-boards-panel__close"
            onClick={onClose}
            aria-label={t(language, "close")}
            type="button"
          >
            <X className="manage-boards-panel__close-icon" aria-hidden="true" focusable="false" />
          </button>
        </div>

        <div className="manage-boards-panel__body">
          {/* User boards section */}
          <div className="manage-boards-section">
            <div className="manage-boards-section__header">
              <span className="manage-boards-section__title">{t(language, "userBoards")}</span>
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
                    if (e.key === "Escape") setShowNewBoardForm(false);
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
                  <span className="manage-boards-list__label">{board.label}</span>
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

          {/* Built-in boards section */}
          <div className="manage-boards-section">
            <span className="manage-boards-section__title">{t(language, "builtInBoards")}</span>
            <ul className="manage-boards-list" role="list">
              {builtInCategories.map((cat) => {
                const hidden = hiddenBuiltinIds.has(cat.id);
                return (
                  <li key={cat.id} className={`manage-boards-list__item${hidden ? " manage-boards-list__item--hidden" : ""}`}>
                    <IconVisual value={cat.emoji} className="manage-boards-list__icon" />
                    <span className="manage-boards-list__label">{cat.label}</span>
                    <div className="manage-boards-list__actions">
                      <button
                        type="button"
                        className="manage-boards-list__btn"
                        onClick={() => onToggleBuiltIn(cat.id)}
                        aria-label={hidden ? `${t(language, "showBoard")}: ${cat.label}` : `${t(language, "hideBoard")}: ${cat.label}`}
                        aria-pressed={!hidden}
                      >
                        {hidden ? (
                          <EyeOff className="manage-boards-list__btn-icon" aria-hidden="true" focusable="false" />
                        ) : (
                          <Eye className="manage-boards-list__btn-icon" aria-hidden="true" focusable="false" />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
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
