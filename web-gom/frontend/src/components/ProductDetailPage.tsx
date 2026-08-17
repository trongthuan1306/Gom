import { Heart, Star, CheckCircle2, ShieldCheck, Truck, RotateCcw, ArrowLeft, Info, Sparkles, MapPin, Ruler, Flame, ShoppingBag, Zap, Edit3, Trash2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { ProductCard } from './ProductCard'
import { EditProductModal } from './EditProductModal'
import { productsApi, authApi, session, type UserProfile } from '../api/client'
import { formatPrice } from '../data/mockData'
import { useCart } from '../hooks/useCart'
import { flyToCart } from '../utils/flyToCart'
import type { Product } from '../types'
import './ProductDetailPage.css'

interface ProductDetailPageProps {
  product: Product
  allProducts: Product[]
  onBack: () => void
  onSelectProduct: (p: Product) => void
  onProductAdded?: () => void
  onOpenAdmin?: () => void
  onOpenCheckout?: () => void
}

export function ProductDetailPage({
  product,
  allProducts,
  onBack,
  onSelectProduct,
  onProductAdded,
  onOpenAdmin,
  onOpenCheckout
}: ProductDetailPageProps) {
  const [detail, setDetail] = useState<Product>({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image,
    badge: product.badge,
    description: product.description,
    stockQuantity: product.stockQuantity,
    slug: product.slug,
    materials: product.materials,
    dimensions: product.dimensions,
    origin: product.origin,
    careInstructions: product.careInstructions,
    itemType: product.itemType,
    flowerType: product.flowerType,
    season: product.season
  })

  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [liked, setLiked] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care'>('desc')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const mainImgRef = useRef<HTMLImageElement>(null)

  const { addItem, openDrawer } = useCart()

  async function loadFullDetails() {
    setLoading(true)
    try {
      const data = await productsApi.getById(product.id)
      setDetail(data)
    } catch {
      // Keep existing data if detail endpoint fails
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    void loadFullDetails()
  }, [product.id])

  // Check user role
  useEffect(() => {
    if (!session.accessToken()) return
    void authApi.me().then(u => setUser(u)).catch(() => {})
  }, [])

  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF'
  const stock = detail.stockQuantity ?? 10
  const isOutOfStock = stock <= 0

  async function handleAddToCart(e: React.MouseEvent) {
    if (isOutOfStock) return
    setAdded(true)

    if (mainImgRef.current) {
      flyToCart(detail.image, mainImgRef.current)
    } else {
      flyToCart(detail.image, e.currentTarget as HTMLElement)
    }

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

  async function handleDeleteProduct() {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa/ẩn sản phẩm "${detail.name}" khỏi cửa hàng?`)) {
      return
    }
    try {
      await productsApi.delete(detail.id)
      alert(`Đã xóa sản phẩm "${detail.name}"`)
      if (onProductAdded) onProductAdded()
      onBack()
    } catch (err: any) {
      alert(err.message || 'Xóa sản phẩm thất bại')
    }
  }

  // Filter related products (exclude current product)
  const relatedProducts = allProducts.filter(p => p.id !== detail.id).slice(0, 4)

  return (
    <div className="product-detail-page">
      <Header
        onProductAdded={onProductAdded}
        products={allProducts}
        onOpenAdmin={onOpenAdmin}
        onOpenCheckout={onOpenCheckout}
      />

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
            <img ref={mainImgRef} src={detail.image} alt={detail.name} />
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
              <h4>Hiên Gốm Chọn Lọc</h4>
              <p>Sản phẩm thủ công tự nhiên, an toàn vệ sinh khi sử dụng hàng ngày.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Purchase Box */}
        <div className="detail-info-section">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="detail-category-tag">{detail.category || 'HIÊN GỐM'}</div>

              {/* Staff / Admin Quick Action Controls */}
              {isStaffOrAdmin && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--brand-red)',
                      background: 'var(--brand-red-soft)',
                      color: 'var(--brand-red)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={14} /> Sửa sản phẩm
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #f5c6cb',
                      background: '#fff5f5',
                      color: '#c82333',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title="Xóa/Ẩn sản phẩm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <h1 className="detail-title">{detail.name}</h1>

            {/* Attribute Tags */}
            {(detail.itemType || detail.flowerType || detail.season) && (
              <div className="product-attr-tags" style={{ marginTop: 8, marginBottom: 4 }}>
                {detail.itemType && <span className="product-attr-tag">{detail.itemType}</span>}
                {detail.flowerType && <span className="product-attr-tag">🌸 {detail.flowerType}</span>}
                {detail.season && <span className="product-attr-tag">🍃 {detail.season}</span>}
              </div>
            )}

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
                  <p>Đóng gói nhiều lớp cẩn trọng</p>
                </div>
              </div>

              <div className="perk-card">
                <ShieldCheck size={20} />
                <div>
                  <h5>Men mộc an toàn</h5>
                  <p>Nung ở nhiệt độ cao 1300°C</p>
                </div>
              </div>

              <div className="perk-card">
                <RotateCcw size={20} />
                <div>
                  <h5>Đổi trả 7 ngày</h5>
                  <p>Bảo hành nếu nứt vỡ khi giao</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section for Deep Product Details */}
      <section className="detail-tabs-section">
        <div className="tabs-nav-bar">
          <button
            className={`tab-item-btn ${activeTab === 'desc' ? 'active' : ''}`}
            onClick={() => setActiveTab('desc')}
          >
            <Info size={16} /> Mô tả & Câu chuyện Gốm
          </button>
          <button
            className={`tab-item-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            <Sparkles size={16} /> Thông số & Chất liệu
          </button>
          <button
            className={`tab-item-btn ${activeTab === 'care' ? 'active' : ''}`}
            onClick={() => setActiveTab('care')}
          >
            <ShieldCheck size={16} /> Hướng dẫn bảo quản
          </button>
        </div>

        <div className="tab-pane-content">
          {activeTab === 'desc' && (
            <div className="tab-desc-pane">
              <h3>Vẻ đẹp mộc mạc từ bàn tay nghệ nhân</h3>
              <p>
                {detail.description ||
                  `Mỗi sản phẩm '${detail.name}' tại Hiên Gốm là sự kết tinh giữa chất đất sét dẻo mịn tự nhiên và bàn tay tài hoa của nghệ nhân. Được tạo hình tỉ mỉ trên bàn xoay thủ công và nung trong lò củi truyền thống, từng đường cong và sắc men đều mang tính độc bản không trùng lặp.`}
              </p>
              <div className="desc-highlight-box">
                <p>
                  <strong>Nét riêng của Gốm Thủ Công:</strong> Bề mặt gốm có thể xuất hiện những đốm khoáng nhỏ tự nhiên hoặc độ biến ảo nhẹ của màu men – đó là minh chứng chân thực cho sản phẩm được chế tác hoàn toàn thủ công.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="tab-specs-pane">
              <h3>Thông số sản phẩm chi tiết</h3>
              <table className="specs-detail-table">
                <tbody>
                  <tr>
                    <td>Tên sản phẩm</td>
                    <td><strong>{detail.name}</strong></td>
                  </tr>
                  <tr>
                    <td>Phân loại</td>
                    <td>{detail.itemType || detail.category || 'Gốm gia dụng thủ công'}</td>
                  </tr>
                  {detail.flowerType && (
                    <tr>
                      <td>Họa tiết Hoa</td>
                      <td>🌸 {detail.flowerType}</td>
                    </tr>
                  )}
                  {detail.season && (
                    <tr>
                      <td>Mùa cảm hứng</td>
                      <td>🍃 Mùa {detail.season}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Chất liệu & Men</td>
                    <td>{detail.materials || 'Đất sét tự nhiên, men tro hỏa biến'}</td>
                  </tr>
                  <tr>
                    <td>Kích thước / Dung tích</td>
                    <td>{detail.dimensions || 'Kích thước tiêu chuẩn phù hợp nếp nhà Việt'}</td>
                  </tr>
                  <tr>
                    <td>Xuất xứ</td>
                    <td>{detail.origin || 'Biên Hòa / Bát Tràng, Việt Nam'}</td>
                  </tr>
                  <tr>
                    <td>Tình trạng kho</td>
                    <td>{stock > 0 ? `Còn hàng (${stock} sản phẩm)` : 'Tạm hết hàng'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="tab-care-pane">
              <h3>Hướng dẫn sử dụng & Bảo quản Gốm</h3>
              {detail.careInstructions ? (
                <p>{detail.careInstructions}</p>
              ) : (
                <ul className="care-tips-list">
                  <li>
                    <strong>Vệ sinh lần đầu:</strong> Rửa sạch gốm với nước ấm và để khô tự nhiên trước lần sử dụng đầu tiên.
                  </li>
                  <li>
                    <strong>An toàn thiết bị:</strong> Men nung ở nhiệt độ 1300°C, an toàn khi sử dụng với lò vi sóng, máy rửa bát và tủ lạnh.
                  </li>
                  <li>
                    <strong>Tránh sốc nhiệt:</strong> Không chuyển gốm đột ngột từ ngăn đông tủ lạnh sang lò nướng nhiệt độ cao.
                  </li>
                  <li>
                    <strong>Mẹo giữ men sáng bóng:</strong> Dùng miếng bọt biển mềm khi rửa, tránh chà xát bằng miếng cọ sắt.
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="related-section-header">
            <div>
              <h2>Có thể bạn cũng thích</h2>
              <p>Những món gốm thủ công ấm áp cùng phong cách dành cho bạn</p>
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

      {/* Edit Product Modal */}
      {editModalOpen && (
        <EditProductModal
          product={detail}
          onClose={() => setEditModalOpen(false)}
          onProductUpdated={() => {
            void loadFullDetails()
            if (onProductAdded) onProductAdded()
          }}
        />
      )}

      <Footer />
    </div>
  )
}
