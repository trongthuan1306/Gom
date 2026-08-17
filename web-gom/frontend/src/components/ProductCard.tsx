import { Heart, ShoppingBag, Edit3, Trash2 } from 'lucide-react'
import { useState, useRef } from 'react'
import type { Product } from '../types'
import { formatPrice } from '../data/mockData'
import { useCart } from '../hooks/useCart'
import { flyToCart } from '../utils/flyToCart'

interface ProductCardProps {
  product: Product
  canEdit?: boolean
  onSelect?: (p: Product) => void
  onEdit?: (p: Product) => void
  onDelete?: (p: Product) => void
}

export function ProductCard({
  product,
  canEdit,
  onSelect,
  onEdit,
  onDelete
}: ProductCardProps) {
  const [liked, setLiked] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const { addItem } = useCart()

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation()
    setLiked(!liked)
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    setAddedToCart(true)

    // Trigger shrinking fly-to-cart animation
    if (imgRef.current) {
      flyToCart(product.image, imgRef.current)
    } else {
      flyToCart(product.image, e.currentTarget as HTMLElement)
    }

    try {
      await addItem(product.id, 1)
    } catch {
      // silent fallback
    }
    setTimeout(() => setAddedToCart(false), 1200)
  }

  function handleCardClick() {
    if (onSelect) onSelect(product)
  }

  const tags = [product.itemType, product.flowerType, product.season].filter(Boolean)

  return (
    <article className="product-card" onClick={handleCardClick} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
      <div className="product-image">
        <img ref={imgRef} src={product.image} alt={product.name} loading="lazy" />
        {product.badge && <span className="badge-pulse">{product.badge}</span>}
        
        {/* Admin Direct Actions on Card */}
        {canEdit && (
          <div className="product-admin-actions" onClick={e => e.stopPropagation()}>
            {onEdit && (
              <button
                type="button"
                className="btn-product-card-edit"
                title="Chỉnh sửa sản phẩm này"
                onClick={e => {
                  e.stopPropagation()
                  onEdit(product)
                }}
              >
                <Edit3 size={13} />
                <span>Sửa</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn-product-card-delete"
                title="Xóa sản phẩm này"
                onClick={e => {
                  e.stopPropagation()
                  onDelete(product)
                }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}

        <button
          className={`heart-btn ${liked ? 'liked' : ''}`}
          aria-label={`Yêu thích ${product.name}`}
          onClick={handleLike}
        >
          <Heart fill={liked ? '#e74c3c' : 'none'} color={liked ? '#e74c3c' : '#555'} />
        </button>
      </div>
      <p className="product-category">{product.category}</p>
      {tags.length > 0 && (
        <div className="product-attr-tags">
          {tags.map(tag => (
            <span key={tag} className="product-attr-tag">{tag}</span>
          ))}
        </div>
      )}
      <h3>{product.name}</h3>
      <div className="product-bottom">
        <strong>{formatPrice(product.price)}</strong>
        <button
          className={`cart-btn ${addedToCart ? 'cart-added' : ''}`}
          aria-label={`Thêm ${product.name} vào giỏ`}
          onClick={handleAddToCart}
        >
          <ShoppingBag />
          {addedToCart && <span className="cart-ping" />}
        </button>
      </div>
    </article>
  )
}

