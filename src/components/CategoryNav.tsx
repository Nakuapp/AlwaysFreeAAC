import { Settings2 } from "lucide-react";
import type { Category } from "../data/vocabulary";
import { t, type Language } from "../i18n";
import { IconVisual } from "./IconVisual";
import "./CategoryNav.css";

interface CategoryNavProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
  onManageBoards: () => void;
  language: Language;
}

export function CategoryNav({
  categories,
  activeId,
  onSelect,
  onManageBoards,
  language,
}: CategoryNavProps) {
  return (
    <nav className="category-nav" aria-label={t(language, "symbolCategories")}>
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
        <li role="none" className="category-nav__manage-item">
          <button
            type="button"
            className="category-nav__btn category-nav__btn--manage"
            onClick={onManageBoards}
            aria-label={t(language, "manageBoards")}
          >
            <Settings2 className="category-nav__icon" aria-hidden="true" focusable="false" />
            <span className="category-nav__label">{t(language, "manageBoards")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
