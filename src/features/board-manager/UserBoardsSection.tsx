import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import type { UserBoard } from "../../domain/models";
import { t, type Language } from "../../i18n";
import { SymbolVisual } from "../../components/symbol";

const BOARD_EMOJI_OPTIONS = [
  "✏️",
  "⭐",
  "❤️",
  "🏠",
  "🏫",
  "🍎",
  "🎮",
  "🎵",
  "📚",
  "👨‍👩‍👧",
  "💬",
  "🐶",
  "🚗",
  "🛏️",
  "🛁",
  "🏥",
  "🌳",
  "☀️",
  "🎨",
  "⚽",
];

const DEFAULT_BOARD_EMOJI = BOARD_EMOJI_OPTIONS[0];

interface UserBoardsSectionProps {
  language: Language;
  userBoards: UserBoard[];
  onCreateBoard: (label: string, emoji: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onRenameBoard: (boardId: string, label: string) => void;
  onMoveBoard: (boardId: string, direction: -1 | 1) => void;
}

export function UserBoardsSection({
  language,
  userBoards,
  onCreateBoard,
  onDeleteBoard,
  onRenameBoard,
  onMoveBoard,
}: UserBoardsSectionProps) {
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardIcon, setNewBoardIcon] = useState(DEFAULT_BOARD_EMOJI);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const skipRenameBlurRef = useRef(false);

  function handleCreateBoard() {
    const name = newBoardName.trim();
    if (!name) return;
    onCreateBoard(name, newBoardIcon);
    setNewBoardName("");
    setNewBoardIcon(DEFAULT_BOARD_EMOJI);
    setShowNewBoardForm(false);
  }

  function handleDeleteBoard(id: string) {
    onDeleteBoard(id);
    setPendingDeleteId(null);
  }

  function handleStartRename(board: UserBoard) {
    skipRenameBlurRef.current = false;
    setRenamingId(board.id);
    setRenamingValue(board.label);
  }

  function handleSaveRename(id: string) {
    const name = renamingValue.trim();
    if (name) {
      onRenameBoard(id, name);
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

  return (
    <div className="manage-boards-section">
      <div className="manage-boards-section__header">
        <h3 className="manage-boards-section__title">{t(language, "userBoards")}</h3>
        <button
          type="button"
          className="manage-boards-section__add-btn"
          onClick={() => setShowNewBoardForm((visible) => !visible)}
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
            onChange={(event) => setNewBoardName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleCreateBoard();
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                setShowNewBoardForm(false);
              }
            }}
            autoFocus
            maxLength={40}
            aria-label={t(language, "boardName")}
          />
          <div className="manage-boards-new-form__icon-row">
            {BOARD_EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`manage-boards-new-form__icon-btn${newBoardIcon === emoji ? " manage-boards-new-form__icon-btn--selected" : ""}`}
                onClick={() => setNewBoardIcon(emoji)}
                aria-label={emoji}
                aria-pressed={newBoardIcon === emoji}
              >
                <SymbolVisual value={emoji} className="manage-boards-new-form__icon-value" />
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
            <SymbolVisual value={board.emoji} className="manage-boards-list__icon" />
            {renamingId === board.id ? (
              <input
                type="text"
                className="manage-boards-list__rename-input"
                value={renamingValue}
                onChange={(event) => setRenamingValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
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
            {pendingDeleteId === board.id ? (
              <div
                className="manage-boards-list__confirm"
                role="group"
                aria-label={t(language, "confirmDeleteBoard")}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    setPendingDeleteId(null);
                  }
                }}
              >
                <span className="manage-boards-list__confirm-text">
                  {t(language, "confirmDeleteBoard")}
                </span>
                <button
                  type="button"
                  className="manage-boards-list__confirm-cancel"
                  onClick={() => setPendingDeleteId(null)}
                >
                  {t(language, "cancel")}
                </button>
                <button
                  type="button"
                  className="manage-boards-list__confirm-delete"
                  onClick={() => handleDeleteBoard(board.id)}
                  autoFocus
                >
                  {t(language, "deleteBoard")}
                </button>
              </div>
            ) : (
              <div className="manage-boards-list__actions">
                <button
                  type="button"
                  className="manage-boards-list__btn"
                  onClick={() => onMoveBoard(board.id, -1)}
                  disabled={index === 0}
                  aria-label={`${t(language, "moveUp")}: ${board.label}`}
                >
                  <ArrowUp
                    className="manage-boards-list__btn-icon"
                    aria-hidden="true"
                    focusable="false"
                  />
                </button>
                <button
                  type="button"
                  className="manage-boards-list__btn"
                  onClick={() => onMoveBoard(board.id, 1)}
                  disabled={index === userBoards.length - 1}
                  aria-label={`${t(language, "moveDown")}: ${board.label}`}
                >
                  <ArrowDown
                    className="manage-boards-list__btn-icon"
                    aria-hidden="true"
                    focusable="false"
                  />
                </button>
                <button
                  type="button"
                  className="manage-boards-list__btn"
                  onClick={() => handleStartRename(board)}
                  aria-label={`${t(language, "renameBoard")}: ${board.label}`}
                >
                  <Pencil
                    className="manage-boards-list__btn-icon"
                    aria-hidden="true"
                    focusable="false"
                  />
                </button>
                <button
                  type="button"
                  className="manage-boards-list__btn manage-boards-list__btn--danger"
                  onClick={() => setPendingDeleteId(board.id)}
                  aria-label={`${t(language, "deleteBoard")}: ${board.label}`}
                >
                  <Trash2
                    className="manage-boards-list__btn-icon"
                    aria-hidden="true"
                    focusable="false"
                  />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
