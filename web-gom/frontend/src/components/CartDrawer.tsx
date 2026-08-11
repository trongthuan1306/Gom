import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../data/mockData'
import { session } from '../api/client'
import './CartDrawer.css'

interface CartDrawerProps {
  onRequireAuth?: () => void
  onOpenCheckout?: () => void
}

export function CartDrawer({ onRequireAuth, onOpenCheckout }: CartDrawerProps) {
  const { items, totalAmount, totalQuantity, drawerOpen, closeDrawer, updateItem, removeItem } = useCart()

  if (!drawerOpen) return null

  const isLoggedIn = !!session.accessToken()

  function handleCheckout() {
    if (!isLoggedIn) {
      closeDrawer()
      if (onRequireAuth) onRequireAuth()
      return
    }
    closeDrawer()
    if (onOpenCheckout) onOpenCheckout()
  }

  return (
    <>
      <div className="cart-overlay" onClick={closeDrawer} />
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <h2>
            <ShoppingBag size={22} />
            <span>Giỏ hàng</span>
            {totalQuantity > 0 && <span className="cart-badge-count">{totalQuantity}</span>}
          </h2>
          <button className="cart-close-btn" onClick={closeDrawer} aria-label="Đóng giỏ hàng">
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-content">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={56} className="cart-empty-icon" />
              <p>Giỏ hàng của bạn đang trống</p>
              <button className="btn-continue-shopping" onClick={closeDrawer}>
                Khám phá sản phẩm ngay
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map(item => (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80'}
                    alt={item.productName}
                    className="cart-item-image"
                  />
                  <div className="cart-item-info">
                    <div>
                      <h4 className="cart-item-title">{item.productName}</h4>
                      <div className="cart-item-price">{formatPrice(item.unitPrice)}</div>
                      {!item.available && (
                        <div className="cart-item-warning">
                          {item.stockQuantity <= 0 ? 'Đã hết hàng' : `Chỉ còn ${item.stockQuantity} sản phẩm trong kho`}
                        </div>
                      )}
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button
                          className="qty-btn"
                          disabled={item.quantity <= 1}
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          aria-label="Giảm số lượng"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          disabled={item.quantity >= item.stockQuantity}
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          aria-label="Tăng số lượng"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeItem(item.id)}
                        title="Xóa khỏi giỏ hàng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Tổng số lượng:</span>
              <strong>{totalQuantity} sản phẩm</strong>
            </div>
            <div className="cart-summary-row total">
              <span>Tổng tiền:</span>
              <span className="amount">{formatPrice(totalAmount)}</span>
            </div>
            <button className="btn-checkout" onClick={handleCheckout}>
              <span>{isLoggedIn ? 'Tiến hành Đặt hàng' : 'Đăng nhập để Thanh toán'}</span>
              <ArrowRight size={18} />
            </button>
            {!isLoggedIn && (
              <div className="guest-notice">
                Giỏ hàng của bạn sẽ tự động đồng bộ sau khi đăng nhập.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
