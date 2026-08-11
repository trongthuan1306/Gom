import type { Category } from '../types'

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="category-card reveal">
      <div className="category-img-wrap">
        <img src={category.image} alt={category.name} loading="lazy" />
        <div className="category-img-overlay" />
      </div>
      <div>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <a href="#products" className="category-link">
          Xem sản phẩm <span className="arrow-anim">→</span>
        </a>
      </div>
    </article>
  )
}
