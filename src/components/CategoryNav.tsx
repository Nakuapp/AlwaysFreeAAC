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
  onOpenSettings: () => void;
  language: Language;
}

export function CategoryNav({
  categories,
  activeId,
  onSelect,
  onManageBoards,
  onOpenSettings,
  language,
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
