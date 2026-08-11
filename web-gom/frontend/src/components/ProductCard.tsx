import { Heart, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../types'
import { formatPrice } from '../data/mockData'
import { useCart } from '../hooks/useCart'

export function ProductCard({ product, onSelect }: { product: Product; onSelect?: (p: Product) => void }) {
  const [liked, setLiked] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCart()

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation()
    setLiked(!liked)
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    setAddedToCart(true)
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

  return (
    <article className="product-card reveal" onClick={handleCardClick} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && <span className="badge-pulse">{product.badge}</span>}
        <button
          className={`heart-btn ${liked ? 'liked' : ''}`}
          aria-label={`Yêu thích ${product.name}`}
          onClick={handleLike}
        >
          <Heart fill={liked ? '#e74c3c' : 'none'} color={liked ? '#e74c3c' : '#555'} />
        </button>
      </div>
      <p className="product-category">{product.category}</p>
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

