import { Search } from "lucide-react";
import "./AdminPageHeader.css";

/**
 * Cabeçalho padrão das telas do painel: título à esquerda e, à direita,
 * uma busca opcional e ações extras (botões, indicador de atualização...).
 */
export default function AdminPageHeader({ title, searchPlaceholder, searchValue, onSearchChange, actions }) {
  return (
    <div className="admin-page-header">
      <h1 className="admin-page-header__title">{title}</h1>
      <div className="admin-page-header__actions">
        {actions}
        {searchPlaceholder && (
          <label className="admin-page-header__search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              aria-label={searchPlaceholder}
            />
          </label>
        )}
      </div>
    </div>
  );
}
