import type { Category } from "../data/vocabulary";
import "./CategoryNav.css";

interface CategoryNavProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  return (
    <nav className="category-nav" aria-label="Symbol categories">
      <ul className="category-nav__list" role="list">
        {categories.map((cat) => (
          <li key={cat.id} role="none">
            <button
              className={`category-nav__btn${activeId === cat.id ? " category-nav__btn--active" : ""}`}
              onClick={() => onSelect(cat.id)}
              aria-pressed={activeId === cat.id}
              aria-label={`${cat.label} category`}
              type="button"
            >
              <span className="category-nav__emoji" aria-hidden="true">
                {cat.emoji}
              </span>
              <span className="category-nav__label">{cat.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
