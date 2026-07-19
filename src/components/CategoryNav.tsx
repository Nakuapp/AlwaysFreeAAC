import { MessageSquare, Settings2, Zap } from "lucide-react";
import type { Category } from "../data/vocabulary";
import { t, type Language } from "../i18n";
import { IconVisual } from "./IconVisual";
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
}

export function CategoryNav({
  categories,
  activeId,
  onSelect,
  onManageBoards,
  onOpenSettings,
  language,
  sentenceBuilderEnabled,
  onToggleSentenceBuilder,
}: CategoryNavProps) {
  return (
    <nav className="category-nav" aria-label={t(language, "symbolCategories")}>
      <button
        type="button"
        className="category-nav__logo-btn"
        onClick={onOpenSettings}
        aria-label={t(language, "openSettings")}
        aria-haspopup="dialog"
      >
        <img
          src={import.meta.env.BASE_URL + "app-logo.png"}
          className="category-nav__logo"
          alt=""
          aria-hidden="true"
        />
      </button>

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

      <button
        type="button"
        className={`category-nav__mode-btn${sentenceBuilderEnabled ? " category-nav__mode-btn--sentence" : " category-nav__mode-btn--soundboard"}`}
        onClick={onToggleSentenceBuilder}
        aria-label={t(language, "toggleModeLabel")}
        title={sentenceBuilderEnabled ? t(language, "sentenceBuilderOn") : t(language, "sentenceBuilderOff")}
      >
        {sentenceBuilderEnabled ? (
          <MessageSquare className="category-nav__mode-icon" aria-hidden="true" focusable="false" />
        ) : (
          <Zap className="category-nav__mode-icon" aria-hidden="true" focusable="false" />
        )}
        <span className="category-nav__mode-label">
          {sentenceBuilderEnabled ? t(language, "sentenceBuilderOn") : t(language, "sentenceBuilderOff")}
        </span>
      </button>

      <button
        type="button"
        className="category-nav__manage-btn"
        onClick={onManageBoards}
        aria-label={t(language, "manageBoards")}
        aria-haspopup="dialog"
      >
        <Settings2 className="category-nav__manage-icon" aria-hidden="true" focusable="false" />
      </button>
    </nav>
  );
}
