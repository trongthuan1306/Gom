import { X, ShoppingBag, Truck, ShieldCheck, RefreshCw, Plus, Minus, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Product } from '../types'
import { formatPrice } from '../data/mockData'
import { useCart } from '../hooks/useCart'
import { productsApi } from '../api/client'
import './ProductDetailModal.css'

interface ProductDetailModalProps {
  product: Product
  onClose: () => void
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [detail, setDetail] = useState<Product>(product)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const { addItem, openDrawer } = useCart()

  useEffect(() => {
    let isMounted = true
    async function loadFullDetails() {
      try {
        setLoading(true)
        const full = await productsApi.getById(product.id)
        if (isMounted) {
          setDetail(prev => ({ ...prev, ...full }))
        }
      } catch {
        // If single getById fails (e.g. mock product not in DB), keep initial prop
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    void loadFullDetails()
    return () => {
      isMounted = false
    }
  }, [product.id])

  const stock = detail.stockQuantity ?? 10
  const isOutOfStock = stock <= 0
  const description = detail.description || 'Sản phẩm Hiên Gốm được làm thủ công tỉ mỉ từ đất sét tự nhiên, nung ở nhiệt độ cao mang lại bề mặt men đầm ấm, an toàn cho sức khỏe và độ bền cao theo thời gian.'

  async function handleAddToCart() {
    if (isOutOfStock) return
    setAdded(true)
    try {
      await addItem(detail.id, quantity)
    } catch {
      // silent
    }
    setTimeout(() => setAdded(false), 1500)
  }

  async function handleBuyNow() {
    if (isOutOfStock) return
    try {
      await addItem(detail.id, quantity)
    } catch {
      // silent
    }
    onClose()
    openDrawer()
  }

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng chi tiết sản phẩm">
          <X size={20} />
        </button>

        {/* Image Column */}
        <div className="modal-image-col">
          <img src={detail.image} alt={detail.name} className="modal-main-image" />
          {detail.badge && <span className="modal-badge">{detail.badge}</span>}
        </div>

        {/* Info Column */}
        <div className="modal-info-col">
          <div>
            <div className="product-detail-category">{detail.category}</div>
            <h2 className="product-detail-title">{detail.name}</h2>

            {/* Attribute Tags */}
            {(detail.itemType || detail.flowerType || detail.season) && (
              <div className="product-attr-tags" style={{ marginBottom: 12 }}>
                {detail.itemType && <span className="product-attr-tag">{detail.itemType}</span>}
                {detail.flowerType && <span className="product-attr-tag">🌸 {detail.flowerType}</span>}
                {detail.season && <span className="product-attr-tag">🍃 {detail.season}</span>}
              </div>
            )}

            <div className="product-detail-price-row">
              <span className="product-detail-price">{formatPrice(detail.price)}</span>
              {isOutOfStock ? (
                <span className="stock-status-badge out-of-stock">Hết hàng</span>
              ) : stock <= 5 ? (
                <span className="stock-status-badge low-stock">Chỉ còn {stock} sản phẩm</span>
              ) : (
                <span className="stock-status-badge in-stock">Còn hàng ({stock})</span>
              )}
            </div>

            <div className="product-detail-desc">
              <p>{loading ? 'Đang tải thông tin chi tiết...' : description}</p>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="detail-quantity-wrap">
                <span className="detail-qty-label">Số lượng:</span>
                <div className="detail-qty-controls">
                  <button
                    className="detail-qty-btn"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="detail-qty-val">{quantity}</span>
                  <button
                    className="detail-qty-btn"
                    disabled={quantity >= stock}
                    onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                    aria-label="Tăng số lượng"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div>
            <div className="detail-actions-row">
              <button
                className="btn-add-to-cart-detail"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                <ShoppingBag size={18} />
                <span>{added ? 'Đã thêm vào giỏ ✓' : 'Thêm vào giỏ hàng'}</span>
              </button>
              <button
                className="btn-buy-now-detail"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
              >
                <Zap size={18} />
                <span>Mua ngay</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="detail-trust-badges">
              <div className="trust-badge-item">
                <Truck size={20} />
                <span>Giao toàn quốc</span>
              </div>
              <div className="trust-badge-item">
                <ShieldCheck size={20} />
                <span>Men mộc an toàn</span>
              </div>
              <div className="trust-badge-item">
                <RefreshCw size={20} />
                <span>Đổi trả 7 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
