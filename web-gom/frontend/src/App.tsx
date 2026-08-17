import { Award, Leaf, PackageCheck, Truck, Plus, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { SectionTitle } from './components/SectionTitle'
import { CategoryCard } from './components/CategoryCard'
import { ProductCard } from './components/ProductCard'
import { ChatButton } from './components/ChatButton'
import { Footer } from './components/Footer'
import { AddProductModal } from './components/AddProductModal'
import { EditProductModal } from './components/EditProductModal'
import { CategoryModal } from './components/CategoryModal'
import { ProductDetailPage } from './components/ProductDetailPage'
import { CollectionPage } from './components/CollectionPage'
import { VnPayReturnPage } from './components/VnPayReturnPage'
import { CheckoutPage } from './components/CheckoutPage'
import { AdminDashboardPage } from './components/AdminDashboardPage'
import { products as mockProducts } from './data/mockData'
import { productsApi, categoriesApi, authApi, session, type UserProfile } from './api/client'
import { CartProvider } from './hooks/useCart'
import {
  FlowerNguSacMotif,
  FlowerTrinhNuMotif,
  FlowerCucTrangMotif,
  FlowerDaQuyMotif,
  KilnSmokeRibbonMotif
} from './components/BotanicalFlowerMotifs'
import type { Product, Category } from './types'

const policies = [
  { icon: Truck, title: 'Giao hàng an toàn', copy: 'Đóng gói nhiều lớp, giao toàn quốc.' },
  { icon: PackageCheck, title: 'Đổi trả 7 ngày', copy: 'Hỗ trợ nhanh với sản phẩm lỗi.' },
  { icon: Award, title: 'Tuyển chọn thủ công', copy: 'Kiểm định từng sản phẩm tại xưởng.' },
  { icon: Leaf, title: 'Vật liệu lành', copy: 'Men an toàn, thân thiện khi sử dụng.' }
]

/* Directions to cycle through for grid items */
const directions = ['reveal-left', 'reveal-top', 'reveal-right', 'reveal-bottom']
const policyDirections = ['reveal-left', 'reveal-bottom', 'reveal-top', 'reveal-right']

export default function App() {
  const [productList, setProductList] = useState<Product[]>([])
  const [categoriesList, setCategoriesList] = useState<Category[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<Category | null>(null)
  const [isCheckoutPage, setIsCheckoutPage] = useState(false)
  const [isAdminPage, setIsAdminPage] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<string>('all')
  const [selectedItemType, setSelectedItemType] = useState<string>('all')
  const mainRef = useRef<HTMLElement>(null)

  const isVnPayReturn = window.location.pathname.includes('/payment/vnpay-return') || window.location.search.includes('vnp_ResponseCode')

  async function loadProducts() {
    try {
      const realProducts = await productsApi.list()
      setProductList(realProducts || [])
    } catch {
      setProductList([])
    }
  }

  async function loadCategories() {
    try {
      const realCategories = await categoriesApi.list()
      setCategoriesList(realCategories || [])
    } catch {
      setCategoriesList([])
    }
  }

  async function checkUserRole() {
    if (!session.accessToken()) {
      setUser(null)
      return
    }
    try {
      const me = await authApi.me()
      setUser(me)
    } catch {
      const refresh = session.refreshToken()
      if (!refresh) {
        session.clear()
        setUser(null)
        return
      }
      try {
        session.save(await authApi.refresh(refresh))
        const me = await authApi.me()
        setUser(me)
      } catch {
        session.clear()
        setUser(null)
      }
    }
  }

  async function handleSaveCategory(savedCat: Category) {
    try {
      const payload = {
        name: savedCat.name,
        season: savedCat.season,
        flower: savedCat.flower,
        flowerIcon: savedCat.flowerIcon,
        meaning: savedCat.meaning,
        description: savedCat.description,
        imageUrl: savedCat.imageUrl || savedCat.image,
      }
      if (savedCat.id && !isNaN(Number(savedCat.id)) && Number(savedCat.id) > 0) {
        await categoriesApi.update(savedCat.id, payload)
      } else {
        await categoriesApi.create(payload)
      }
      await loadCategories()
    } catch (err: any) {
      alert(err.message || 'Lưu bộ sưu tập vào cơ sở dữ liệu thất bại')
    }
  }

  async function handleDeleteCategory(cat: Category) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ sưu tập "${cat.name}" khỏi cơ sở dữ liệu?`)) {
      return
    }
    try {
      if (cat.id) {
        await categoriesApi.delete(cat.id)
        await loadCategories()
      }
    } catch (err: any) {
      alert(err.message || 'Xóa bộ sưu tập thất bại')
    }
  }

  function handleEditCategory(cat: Category) {
    setEditingCategory(cat)
    setCategoryModalOpen(true)
  }

  function handleAddCategory() {
    setEditingCategory(null)
    setCategoryModalOpen(true)
  }

  function handleEditProduct(p: Product) {
    setEditingProduct(p)
  }

  async function handleDeleteProduct(p: Product) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${p.name}"?`)) {
      return
    }
    try {
      await productsApi.delete(p.id)
      await loadProducts()
    } catch (err: any) {
      alert(err.message || 'Xóa sản phẩm thất bại')
    }
  }

  useEffect(() => {
    void loadProducts()
    void loadCategories()
    void checkUserRole()
  }, [])

  // Filter products by Season and Item Type
  const filteredProducts = productList.filter((p) => {
    const matchSeason = selectedSeason === 'all' || p.season === selectedSeason
    const matchItemType = selectedItemType === 'all' || p.itemType === selectedItemType
    return matchSeason && matchItemType
  })

  // Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
    )

    const els = document.querySelectorAll('.reveal')
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [productList, selectedProduct, selectedCollection, selectedSeason, selectedItemType])

  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN'

  // VnPay Return Page view
  if (isVnPayReturn) {
    return (
      <CartProvider>
        <Header onProductAdded={loadProducts} />
        <VnPayReturnPage onBackToHome={() => window.location.href = '/'} />
        <Footer />
      </CartProvider>
    )
  }

  // Admin Dashboard Full Page view
  if (isAdminPage) {
    return (
      <CartProvider>
        <AdminDashboardPage
          onBack={() => setIsAdminPage(false)}
          products={productList}
          onProductsChanged={loadProducts}
          onCategoriesChanged={(cats) => setCategoriesList(cats)}
        />
      </CartProvider>
    )
  }

  // Checkout Full Page view
  if (isCheckoutPage) {
    return (
      <CartProvider>
        <CheckoutPage
          onBack={() => setIsCheckoutPage(false)}
        />
      </CartProvider>
    )
  }

  // Product Detail Page view (Full Page View)
  if (selectedProduct) {
    return (
      <CartProvider>
        <ProductDetailPage
          product={selectedProduct}
          allProducts={productList}
          onBack={() => setSelectedProduct(null)}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onProductAdded={loadProducts}
          onOpenAdmin={() => setIsAdminPage(true)}
          onOpenCheckout={() => setIsCheckoutPage(true)}
        />
        <ChatButton
          products={productList}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      </CartProvider>
    )
  }

  // Dedicated Collection Page view (Trang riêng cho từng Bộ sưu tập mùa)
  if (selectedCollection) {
    return (
      <CartProvider>
        <CollectionPage
          category={selectedCollection}
          allProducts={productList}
          canEdit={isStaffOrAdmin}
          onBack={() => setSelectedCollection(null)}
          onSelectCategory={(cat) => setSelectedCollection(cat)}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onProductAdded={loadProducts}
          onOpenAdmin={() => setIsAdminPage(true)}
          onOpenCheckout={() => setIsCheckoutPage(true)}
        />
        <ChatButton
          products={productList}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      </CartProvider>
    )
  }

  // Home Page view
  return (
    <CartProvider>
      <Header
        user={user}
        onUserChange={setUser}
        onProductAdded={loadProducts}
        products={productList}
        onOpenAdmin={() => setIsAdminPage(true)}
        onOpenCheckout={() => setIsCheckoutPage(true)}
      />
      <main ref={mainRef}>
        <Hero />

        {/* Giới thiệu Hiên Gốm — Thoáng đãng, không đóng khung, không chèn ảnh */}
        <section className="intro-section" id="about">
          <div className="intro-content-grid">
            <div className="intro-left">
              <p className="eyebrow">Cảm hứng từ Gốm Biên Hòa</p>
              <h2>
                Nét mộc mái hiên,
                <br />
                ấm lành nếp nhà Việt
              </h2>
            </div>
            <div className="intro-right">
              <p>
                <strong>HIÊN GỐM</strong> – Gốm gia dụng được lấy cảm hứng từ gốm Biên Hòa, nơi lưu giữ những giá trị thủ công và nét đẹp mộc mạc của đời sống Việt. Hiên Gốm khai thác hình ảnh mái hiên, chén gốm và những loài hoa dại quen thuộc để tạo nên sản phẩm gần gũi, ấm áp nhưng vẫn mang hơi thở hiện đại.
              </p>
              <p>
                Hiên Gốm được phát triển với mong muốn đưa những câu chuyện bình dị của quê nhà vào từng sản phẩm, gợi nhắc về bữa cơm gia đình, ký ức tuổi thơ và sự sum vầy. Mỗi món gốm không chỉ là vật dụng hằng ngày mà còn là một phần của ký ức và tình cảm Việt.
              </p>
              <a href="#categories" className="intro-link">
                Khám phá bộ sưu tập →
              </a>
            </div>
          </div>
        </section>

        {/* Wavy divider + 4 Seasons & Flowers Categories */}
        <div className="wavy-section-bg">
          <section className="section section-with-decor category-section-with-decor" id="categories">

            {/* Hoa trang trí đặt ngoài mép phải của khu vực danh mục */}
            <div className="section-floral-decor right" aria-hidden="true">
              <div className="floating-flower-item item-1">
                <FlowerNguSacMotif size={88} className="flower-svg" />
              </div>
              <div className="floating-flower-item item-3">
                <FlowerTrinhNuMotif size={76} className="flower-svg" />
              </div>
            </div>

            <div className="reveal reveal-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
              <SectionTitle
                eyebrow="Bộ sưu tập 4 mùa hoa"
                title="Sắc gốm qua 4 mùa an yên"
                copy="Từ hoa ngũ sắc mùa xuân, trinh nữ mùa hạ đến cúc trắng mùa thu và dã quỳ mùa đông."
              />
              {isStaffOrAdmin && (
                <button
                  className="btn-admin-add-product"
                  style={{ marginBottom: '16px' }}
                  onClick={handleAddCategory}
                  title="Thêm một bộ sưu tập mùa hoặc chủ đề mới"
                >
                  <Plus size={18} />
                  <span>+ Thêm Bộ sưu tập mới</span>
                </button>
              )}
            </div>
            <div className="category-grid">
              {categoriesList.map((c, i) => (
                <div key={c.id || c.name} className={`reveal ${directions[i % directions.length]}`} style={{ transitionDelay: `${0.12 * i}s` }}>
                  <CategoryCard
                    category={c}
                    canEdit={isStaffOrAdmin}
                    onSelect={() => setSelectedCollection(c)}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Products section with Add Product button & Multi-Attribute Filters */}
        <section className="section products section-with-decor products-section-with-decor" id="products">
          {/* Hoa trang trí đặt ngoài mép trái của khu vực sản phẩm */}
          <div className="section-floral-decor left" aria-hidden="true">
            <div className="floating-flower-item item-4">
              <FlowerCucTrangMotif size={82} className="flower-svg" />
            </div>
            <div className="floating-flower-item item-5">
              <FlowerDaQuyMotif size={92} className="flower-svg" />
            </div>
          </div>
          <div className="reveal reveal-scale products-header-wrap">
            <SectionTitle
              eyebrow="Tuyển chọn theo mùa"
              title="Sản phẩm Hiên Gốm"
              copy="Gốm gia dụng thủ công theo 4 mùa hoa và thể loại tô, chén, dĩa."
            />
          </div>

          {/* Interactive Multi-Attribute Filters */}
          <div className="products-filter-container">
            {/* Season Tabs */}
            <div className="season-filter-tabs">
              <button
                className={`season-filter-btn ${selectedSeason === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedSeason('all')}
              >
                <span>Tất cả 4 mùa</span>
              </button>
              <button
                className={`season-filter-btn ${selectedSeason === 'Xuân' ? 'active' : ''}`}
                onClick={() => setSelectedSeason('Xuân')}
              >
                <span className="filter-flower-icon">💜</span>
                <span>Xuân · Ngũ sắc</span>
              </button>
              <button
                className={`season-filter-btn ${selectedSeason === 'Hạ' ? 'active' : ''}`}
                onClick={() => setSelectedSeason('Hạ')}
              >
                <span className="filter-flower-icon">🌸</span>
                <span>Hạ · Trinh nữ</span>
              </button>
              <button
                className={`season-filter-btn ${selectedSeason === 'Thu' ? 'active' : ''}`}
                onClick={() => setSelectedSeason('Thu')}
              >
                <span className="filter-flower-icon">🤍</span>
                <span>Thu · Cúc trắng</span>
              </button>
              <button
                className={`season-filter-btn ${selectedSeason === 'Đông' ? 'active' : ''}`}
                onClick={() => setSelectedSeason('Đông')}
              >
                <span className="filter-flower-icon">🌼</span>
                <span>Đông · Dã quỳ</span>
              </button>
            </div>

            {/* Item Type Filter Pills */}
            <div className="item-type-filter-pills">
              <span className="filter-label">Thể loại:</span>
              <button
                className={`item-type-pill ${selectedItemType === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedItemType('all')}
              >
                Tất cả
              </button>
              <button
                className={`item-type-pill ${selectedItemType === 'Tô' ? 'active' : ''}`}
                onClick={() => setSelectedItemType('Tô')}
              >
                🥣 Tô
              </button>
              <button
                className={`item-type-pill ${selectedItemType === 'Chén' ? 'active' : ''}`}
                onClick={() => setSelectedItemType('Chén')}
              >
                🍵 Chén
              </button>
              <button
                className={`item-type-pill ${selectedItemType === 'Dĩa' ? 'active' : ''}`}
                onClick={() => setSelectedItemType('Dĩa')}
              >
                🍽️ Dĩa
              </button>
            </div>
          </div>

          {/* Active Filter Banner */}
          {(selectedSeason !== 'all' || selectedItemType !== 'all') && (
            <div className="active-filter-banner">
              <span>
                Đang hiển thị: {selectedSeason !== 'all' ? `Bộ sưu tập Mùa ${selectedSeason}` : 'Tất cả 4 mùa'}
                {selectedItemType !== 'all' ? ` · Thể loại ${selectedItemType}` : ''}
                {` (${filteredProducts.length} sản phẩm)`}
              </span>
              <button
                className="btn-clear-filters"
                onClick={() => {
                  setSelectedSeason('all')
                  setSelectedItemType('all')
                }}
              >
                Đặt lại bộ lọc ✕
              </button>
            </div>
          )}

          <div className="product-grid">
            {/* If Staff/Admin, show an interactive Add Product Card in grid */}
            {isStaffOrAdmin && (
              <article
                className="product-card add-product-card-item reveal reveal-scale"
                onClick={() => setAddProductOpen(true)}
              >
                <div className="add-product-card-inner">
                  <div className="add-product-icon-circle">
                    <Plus size={32} />
                  </div>
                  <h3>Thêm sản phẩm mới</h3>
                  <p>Tải ảnh lên Cloudinary & đăng bán ngay</p>
                </div>
              </article>
            )}

            {filteredProducts.length === 0 ? (
              <div className="no-products-found">
                <p>Không tìm thấy sản phẩm nào trong phân loại này.</p>
                <button
                  className="button dark"
                  onClick={() => {
                    setSelectedSeason('all')
                    setSelectedItemType('all')
                  }}
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              filteredProducts.map((p, i) => {
                const dir = directions[i % directions.length]
                return (
                  <div key={p.id} className={`reveal ${dir}`} style={{ transitionDelay: `${0.06 * i}s` }}>
                    <ProductCard
                      product={p}
                      canEdit={isStaffOrAdmin}
                      onSelect={setSelectedProduct}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* New arrival banner — with organic wavy background & side decorations */}
        <section className="new-arrival-section-wrapper" aria-label="Bộ sưu tập mới Mùa men nắng">
          {/* Top Wave Divider */}
          <div className="new-arrival-wave-top" aria-hidden="true">
            <svg viewBox="0 0 1440 64" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,24 C320,60 560,4 840,36 C1120,64 1300,16 1440,32 L1440,0 L0,0 Z" fill="#ffffff"/>
            </svg>
          </div>

          <div className="new-arrival-inner-container">
            {/* Center Banner Card */}
            <div className="new-arrival reveal reveal-scale">
              <div>
                <p className="eyebrow">Bộ sưu tập mới</p>
                <h2>Mùa men nắng</h2>
                <p>Sắc men ấm, bề mặt tự nhiên và những đường nét tối giản dành cho căn nhà hiện đại.</p>
                <a className="button light btn-shine" href="#products">
                  Khám phá ngay
                </a>
              </div>
            </div>

            {/* Right Side: 2 Floating Flowers near edge */}
            <div className="floating-floral-decor right" aria-hidden="true">
              <div className="floating-flower-item item-1">
                <FlowerDaQuyMotif size={78} className="flower-svg" />
              </div>
              <div className="floating-flower-item item-3">
                <FlowerCucTrangMotif size={64} className="flower-svg" />
              </div>
            </div>
          </div>

          {/* Bottom Wave Divider */}
          <div className="new-arrival-wave-bottom" aria-hidden="true">
            <svg viewBox="0 0 1440 64" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,40 C320,12 560,56 840,28 C1120,4 1300,48 1440,32 L1440,64 L0,64 Z" fill="#ffffff"/>
            </svg>
          </div>
        </section>

        {/* Policies — each from a different direction */}
        <section className="section section-with-decor" id="policies">
          {/* Floating flowers LEFT side for policies */}
          <div className="section-floral-decor left" aria-hidden="true">
            <div className="floating-flower-item item-2">
              <FlowerTrinhNuMotif size={60} className="flower-svg" />
            </div>
            <div className="floating-flower-item item-5">
              <FlowerNguSacMotif size={52} className="flower-svg" />
            </div>
          </div>

          <div className="reveal reveal-bottom">
            <SectionTitle title="An tâm chọn gốm" />
          </div>
          <div className="policy-grid">
            {policies.map(({ icon: Icon, title, copy }, i) => (
              <article key={title} className={`reveal ${policyDirections[i]}`} style={{ transitionDelay: `${0.15 * i}s` }}>
                <Icon />
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <ChatButton
        products={productList}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {addProductOpen && (
        <AddProductModal
          onClose={() => setAddProductOpen(false)}
          onProductCreated={loadProducts}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={() => {
            void loadProducts()
            setEditingProduct(null)
          }}
        />
      )}

      {categoryModalOpen && (
        <CategoryModal
          isOpen={categoryModalOpen}
          category={editingCategory}
          onClose={() => {
            setCategoryModalOpen(false)
            setEditingCategory(null)
          }}
          onSave={handleSaveCategory}
        />
      )}
    </CartProvider>
  )
}
