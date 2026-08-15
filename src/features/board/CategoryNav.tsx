import { Check, MessageSquare, Pencil, Settings2, Zap } from "lucide-react";
import type { Category } from "../../domain";
import { t, type Language } from "../../i18n";
import { IconVisual } from "../../components/icon";
import "./CategoryNav.css";

interface CategoryNavProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
  onManageBoards: () => void;
  onOpenSettings: () => void;
  language: Language;
  sentenceBuilderEnabled: boolean;
  onToggleSentenceBuilder: () => void;
  canEditActiveBoard: boolean;
  isEditingActiveBoard: boolean;
  onToggleEditActiveBoard: () => void;
}

export function CategoryNav({
  categories,
  activeId,
  onSelect,
  onManageBoards,
  language,
  sentenceBuilderEnabled,
  onToggleSentenceBuilder,
  canEditActiveBoard,
  isEditingActiveBoard,
  onToggleEditActiveBoard,
}: CategoryNavProps) {
  return (
    <nav className="category-nav" aria-label={t(language, "symbolCategories")}>
      <div className="category-nav__tabs-scroll">
        <ul className="category-nav__list" role="list">
          {categories.map((cat) => (
            <li key={cat.id} role="none">
              <button
                className={`category-nav__btn${activeId === cat.id ? " category-nav__btn--active" : ""}`}
                onClick={() => onSelect(cat.id)}
                aria-pressed={activeId === cat.id}
                aria-label={`${cat.label} ${t(language, "categorySuffix")}`}
                type="button"
              >
                <IconVisual value={cat.emoji} className="category-nav__icon" />
                <span className="category-nav__label">{cat.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="category-nav__actions">
        <button
          type="button"
          className="category-nav__manage-btn"
          onClick={onManageBoards}
          aria-label={t(language, "manageBoards")}
          aria-haspopup="dialog"
          title={t(language, "manageBoards")}
        >
          <Settings2 className="category-nav__manage-icon" aria-hidden="true" focusable="false" />
        </button>

        {canEditActiveBoard && (
          <button
            type="button"
            className={`category-nav__edit-btn${isEditingActiveBoard ? " category-nav__edit-btn--active" : ""}`}
            onClick={onToggleEditActiveBoard}
            aria-pressed={isEditingActiveBoard}
            aria-label={isEditingActiveBoard ? t(language, "doneTiles") : t(language, "editTiles")}
            title={isEditingActiveBoard ? t(language, "doneTiles") : t(language, "editTiles")}
          >
            {isEditingActiveBoard ? (
              <Check className="category-nav__edit-icon" aria-hidden="true" focusable="false" />
            ) : (
              <Pencil className="category-nav__edit-icon" aria-hidden="true" focusable="false" />
            )}
            <span className="category-nav__action-label">
              {isEditingActiveBoard ? t(language, "doneTiles") : t(language, "editTiles")}
            </span>
          </button>
        )}

        <button
          type="button"
          className={`category-nav__mode-btn${sentenceBuilderEnabled ? " category-nav__mode-btn--sentence" : " category-nav__mode-btn--soundboard"}`}
          onClick={onToggleSentenceBuilder}
          aria-label={t(language, "toggleModeLabel")}
          title={
            sentenceBuilderEnabled
              ? t(language, "sentenceBuilderOn")
              : t(language, "sentenceBuilderOff")
          }
        >
          {sentenceBuilderEnabled ? (
            <MessageSquare
              className="category-nav__mode-icon"
              aria-hidden="true"
              focusable="false"
            />
          ) : (
            <Zap className="category-nav__mode-icon" aria-hidden="true" focusable="false" />
          )}
          <span className="category-nav__mode-label">
            {sentenceBuilderEnabled
              ? t(language, "sentenceBuilderOn")
              : t(language, "sentenceBuilderOff")}
          </span>
        </button>
      </div>
    </nav>
  );
}
