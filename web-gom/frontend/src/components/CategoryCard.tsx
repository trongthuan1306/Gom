import { Edit3, Trash2 } from 'lucide-react'
import type { Category } from '../types'

interface CategoryCardProps {
  category: Category
  isSelected?: boolean
  canEdit?: boolean
  onSelect?: (season: string) => void
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
}

export function CategoryCard({ category, isSelected, canEdit, onSelect, onEdit, onDelete }: CategoryCardProps) {
  function handleClick() {
    if (onSelect) {
      onSelect(category.season)
    }
  }

  return (
    <article
      className={`category-card reveal ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className="category-img-wrap">
        <img src={category.image} alt={category.name} loading="lazy" />
        <div className="category-img-overlay" />
        <div className="category-flower-badge">
          <span>{category.flowerIcon}</span>
          <span>{category.flower} · {category.season}</span>
        </div>

        {canEdit && (
          <div className="category-admin-actions" onClick={e => e.stopPropagation()}>
            {onEdit && (
              <button
                type="button"
                className="btn-cat-card-edit"
                title="Chỉnh sửa bộ sưu tập này"
                onClick={e => {
                  e.stopPropagation()
                  onEdit(category)
                }}
              >
                <Edit3 size={14} />
                <span>Sửa</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn-cat-card-delete"
                title="Xóa bộ sưu tập này"
                onClick={e => {
                  e.stopPropagation()
                  onDelete(category)
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="category-card-body">
        <h3 className="category-card-title">{category.name}</h3>
        <p className="category-meaning">{category.meaning}</p>
        <p className="category-desc">{category.description}</p>
        <div className="category-action-link">
          <span>Xem sản phẩm mùa {category.season}</span>
          <span className="arrow-anim">→</span>
        </div>
      </div>
    </article>
  )
}
