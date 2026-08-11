import { ArrowLeft, Star, ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw, CheckCircle2, Flame, Heart, Info, Sparkles, MapPin, Ruler } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Product } from '../types'
import { formatPrice } from '../data/mockData'
import { useCart } from '../hooks/useCart'
import { productsApi } from '../api/client'
import { ProductCard } from './ProductCard'
import { Header } from './Header'
import { Footer } from './Footer'
import './ProductDetailPage.css'

interface ProductDetailPageProps {
  product: Product
  allProducts: Product[]
  onBack: () => void
  onSelectProduct: (product: Product) => void
  onProductAdded?: () => void
}

export function ProductDetailPage({
  product,
  allProducts,
  onBack,
  onSelectProduct,
  onProductAdded
}: ProductDetailPageProps) {
  const [detail, setDetail] = useState<Product>(product)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care'>('desc')
  const [liked, setLiked] = useState(false)

  const { addItem, openDrawer } = useCart()

  // Scroll to top whenever selected product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setDetail(product)
    setQuantity(1)
  }, [product])

  // Fetch complete product details from API if available
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
        // Fallback to initial product prop
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
    openDrawer()
  }

  // Filter related products (exclude current product)
  const relatedProducts = allProducts.filter(p => p.id !== detail.id).slice(0, 4)

  return (
    <div className="product-detail-page">
      <Header onProductAdded={onProductAdded} />

      {/* Top Breadcrumbs & Back Navigation */}
      <div className="detail-page-bar">
        <button className="back-link-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại danh sách sản phẩm</span>
        </button>

        <nav className="breadcrumbs">
          <span className="crumb-btn" onClick={onBack}>Trang chủ</span>
          <span>/</span>
          <span className="crumb-btn" onClick={onBack}>Sản phẩm</span>
          <span>/</span>
          <span className="current">{detail.name}</span>
        </nav>
      </div>

      {/* Main Product Showcase Grid */}
      <section className="detail-main-container">
        {/* Left Column: Image & Quality Guarantee */}
        <div className="detail-gallery-section">
          <div className="detail-main-image-wrap">
            <img src={detail.image} alt={detail.name} />
            {detail.badge && <span className="detail-badge-pulse">{detail.badge}</span>}
            <button
              className="detail-heart-btn"
              onClick={() => setLiked(!liked)}
              aria-label="Thêm vào danh sách yêu thích"
            >
              <Heart fill={liked ? '#e74c3c' : 'none'} color={liked ? '#e74c3c' : '#554433'} size={20} />
            </button>
          </div>

          {/* Real Data Highlights */}
          <div className="craft-guarantee-box">
            <div className="craft-guarantee-icon">
              <Flame size={22} />
            </div>
            <div className="craft-guarantee-text">
              <h4>Gốm Việt Chọn Lọc</h4>
              <p>Sản phẩm thủ công tự nhiên, an toàn vệ sinh khi sử dụng hàng ngày.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Purchase Box */}
        <div className="detail-info-section">
          <div>
            <div className="detail-category-tag">{detail.category || 'GỐM VIỆT'}</div>
            <h1 className="detail-title">{detail.name}</h1>

            {/* Rating Bar */}
            <div className="detail-rating-bar">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f1c40f" color="#f1c40f" />
                ))}
              </div>
              <span className="rating-count">5.0 (Đánh giá chất lượng)</span>
            </div>
          </div>

          {/* Price & Stock Card */}
          <div className="detail-price-card">
            <div className="detail-price-val">{formatPrice(detail.price)}</div>
            {isOutOfStock ? (
              <span className="detail-stock-pill out-stock">Hết hàng</span>
            ) : stock <= 5 ? (
              <span className="detail-stock-pill low-stock">Chỉ còn {stock} sản phẩm trong kho</span>
            ) : (
              <span className="detail-stock-pill in-stock">
                <CheckCircle2 size={14} /> Còn hàng ({stock})
              </span>
            )}
          </div>

          {/* Short Description directly from DB */}
          <p className="detail-short-desc">
            {loading
              ? 'Đang tải thông tin từ máy chủ...'
              : detail.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
          </p>

          {/* Spec Badges if present in DB */}
          {(detail.materials || detail.origin || detail.dimensions) && (
            <div className="detail-quick-specs" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {detail.materials && (
                <span style={{ background: '#f8f2ea', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.825rem', fontWeight: 600, color: '#3d2c1d', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={14} color="#c86d3b" /> {detail.materials}
                </span>
              )}
              {detail.origin && (
                <span style={{ background: '#f8f2ea', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.825rem', fontWeight: 600, color: '#3d2c1d', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="#c86d3b" /> {detail.origin}
                </span>
              )}
              {detail.dimensions && (
                <span style={{ background: '#f8f2ea', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.825rem', fontWeight: 600, color: '#3d2c1d', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Ruler size={14} color="#c86d3b" /> {detail.dimensions}
                </span>
              )}
            </div>
          )}

          {/* Purchase Actions Box */}
          <div className="purchase-box">
            {!isOutOfStock && (
              <div className="quantity-picker-row">
                <span>Số lượng:</span>
                <div className="page-qty-controls">
                  <button
                    className="page-qty-btn"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                  >
                    -
                  </button>
                  <span className="page-qty-val">{quantity}</span>
                  <button
                    className="page-qty-btn"
                    disabled={quantity >= stock}
                    onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="action-buttons-group">
              <button
                className="btn-add-cart-page"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                <ShoppingBag size={20} />
                <span>{added ? 'Đã thêm vào giỏ ✓' : 'Thêm vào giỏ hàng'}</span>
              </button>

              <button
                className="btn-buy-now-page"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
              >
                <Zap size={20} />
                <span>Mua ngay</span>
              </button>
            </div>

            {/* Shipping & Security Perks */}
            <div className="shipping-perks-grid">
              <div className="perk-card">
                <Truck size={20} />
                <div>
                  <h5>Giao toàn quốc</h5>
                  <p>Bọc chống sốc cẩn thận</p>
                </div>
              </div>
              <div className="perk-card">
                <ShieldCheck size={20} />
                <h5>Bảo hiểm vỡ</h5>
                <p>Hỗ trợ đổi trả 1:1</p>
              </div>
              <div className="perk-card">
                <RotateCcw size={20} />
                <h5>Đổi trả 7 ngày</h5>
                <p>Nếu sản phẩm bị lỗi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Data Tabs Section */}
      <section className="detail-tabs-section">
        <div className="tabs-nav-bar">
          <button
            className={`tab-nav-btn ${activeTab === 'desc' ? 'active' : ''}`}
            onClick={() => setActiveTab('desc')}
          >
            Mô tả sản phẩm
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Thông số kỹ thuật
          </button>
          {detail.careInstructions && (
            <button
              className={`tab-nav-btn ${activeTab === 'care' ? 'active' : ''}`}
              onClick={() => setActiveTab('care')}
            >
              Hướng dẫn bảo quản
            </button>
          )}
        </div>

        <div className="tab-content-panel">
          {activeTab === 'desc' && (
            <div style={{ fontSize: '1rem', lineHeight: '1.8', color: '#554433' }}>
              {detail.description ? (
                <p style={{ margin: 0 }}>{detail.description}</p>
              ) : (
                <p style={{ margin: 0, fontStyle: 'italic', color: '#8c7867' }}>
                  Chưa có thông tin mô tả chi tiết cho sản phẩm này.
                </p>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <table className="specs-table">
              <tbody>
                <tr>
                  <td className="spec-label">Tên sản phẩm</td>
                  <td className="spec-val">{detail.name}</td>
                </tr>
                <tr>
                  <td className="spec-label">Mã sản phẩm / Slug</td>
                  <td className="spec-val">{detail.slug || detail.id}</td>
                </tr>
                <tr>
                  <td className="spec-label">Giá bán</td>
                  <td className="spec-val">{formatPrice(detail.price)}</td>
                </tr>
                <tr>
                  <td className="spec-label">Số lượng tồn kho</td>
                  <td className="spec-val">{stock} sản phẩm</td>
                </tr>
                {detail.materials && (
                  <tr>
                    <td className="spec-label">Loại Đất / Men</td>
                    <td className="spec-val">{detail.materials}</td>
                  </tr>
                )}
                {detail.dimensions && (
                  <tr>
                    <td className="spec-label">Kích thước / Dung tích</td>
                    <td className="spec-val">{detail.dimensions}</td>
                  </tr>
                )}
                {detail.origin && (
                  <tr>
                    <td className="spec-label">Xuất xứ làng nghề</td>
                    <td className="spec-val">{detail.origin}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'care' && detail.careInstructions && (
            <div style={{ fontSize: '0.975rem', lineHeight: '1.8', color: '#554433' }}>
              <p style={{ margin: 0 }}>{detail.careInstructions}</p>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Grid Section */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="related-section-header">
            <div>
              <h2>Sản phẩm cùng bộ sưu tập</h2>
              <p>Những món gốm khác được chế tác chỉn chu dành riêng cho bạn</p>
            </div>
          </div>

          <div className="related-grid">
            {relatedProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
