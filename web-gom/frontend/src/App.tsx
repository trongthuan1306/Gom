import { Award, Leaf, PackageCheck, Truck, PackagePlus, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { SectionTitle } from './components/SectionTitle'
import { CategoryCard } from './components/CategoryCard'
import { ProductCard } from './components/ProductCard'
import { ChatButton } from './components/ChatButton'
import { Footer } from './components/Footer'
import { AddProductModal } from './components/AddProductModal'
import { ProductDetailPage } from './components/ProductDetailPage'
import { VnPayReturnPage } from './components/VnPayReturnPage'
import { categories, products as mockProducts } from './data/mockData'
import { productsApi, authApi, session, type UserProfile } from './api/client'
import { CartProvider } from './hooks/useCart'
import type { Product } from './types'

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
  const [productList, setProductList] = useState<Product[]>(mockProducts)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const mainRef = useRef<HTMLElement>(null)

  const isVnPayReturn = window.location.pathname.includes('/payment/vnpay-return') || window.location.search.includes('vnp_ResponseCode');

  async function loadProducts() {
    try {
      const realProducts = await productsApi.list()
      if (realProducts && realProducts.length > 0) {
        // Gộp sản phẩm thật (từ DB) lên đầu + sản phẩm mẫu phía sau
        const realIds = new Set(realProducts.map(p => p.id))
        const fillers = mockProducts.filter(m => !realIds.has(m.id))
        setProductList([...realProducts, ...fillers])
      }
    } catch {
      // Fallback to mock data if backend not reachable
    }
  }

  async function checkUserRole() {
    if (!session.accessToken()) return
    try {
      setUser(await authApi.me())
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    void loadProducts()
    void checkUserRole()
  }, [])

  // Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    )

    const revealElements = document.querySelectorAll('.reveal')
    revealElements.forEach((el) => observer.observe(el))

    return () => {
      revealElements.forEach((el) => observer.unobserve(el))
    }
  }, [productList, selectedProduct])

  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF'

  // Dedicated Full Product Detail Page view
  if (isVnPayReturn) {
    return (
      <CartProvider>
        <Header onProductAdded={loadProducts} />
        <VnPayReturnPage onBackToHome={() => { window.location.href = '/'; }} />
        <Footer />
      </CartProvider>
    )
  }

  if (selectedProduct) {
    return (
      <CartProvider>
        <ProductDetailPage
          product={selectedProduct}
          allProducts={productList}
          onBack={() => setSelectedProduct(null)}
          onSelectProduct={setSelectedProduct}
          onProductAdded={loadProducts}
        />
        {addProductOpen && (
          <AddProductModal
            onClose={() => setAddProductOpen(false)}
            onProductCreated={loadProducts}
          />
        )}
      </CartProvider>
    )
  }

  // Home Page view
  return (
    <CartProvider>
      <Header onProductAdded={loadProducts} />
      <main ref={mainRef}>
        <Hero />

        {/* Intro — left & right */}
        <section className="intro" id="about">
          <div className="reveal reveal-left">
            <p className="eyebrow">Câu chuyện Gốm Việt</p>
            <h2>
              Chạm vào nét mộc,
              <br />
              giữ lại bình yên
            </h2>
          </div>
          <div className="reveal reveal-right" style={{ transitionDelay: '0.2s' }}>
            <p>
              Chúng tôi kết nối những xưởng gốm Việt với người yêu vẻ đẹp thủ công. Từng dáng gốm là sự gặp gỡ của đất, nước, lửa và kinh nghiệm truyền đời.
            </p>
            <a href="#categories">Khám phá hành trình →</a>
          </div>
        </section>

        {/* Wavy divider + Categories */}
        <div className="wavy-section-bg">
          <section className="section" id="categories">
            <div className="reveal reveal-top">
              <SectionTitle
                eyebrow="Bộ sưu tập"
                title="Gốm cho mọi khoảnh khắc"
                copy="Từ bàn ăn ấm cúng đến góc nhà an yên, chọn món gốm kể câu chuyện của riêng bạn."
              />
            </div>
            <div className="category-grid">
              {categories.map((c, i) => (
                <div key={c.name} className={`reveal ${directions[i % directions.length]}`} style={{ transitionDelay: `${0.15 * i}s` }}>
                  <CategoryCard category={c} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Products section with Add Product button */}
        <section className="section products" id="products">
          <div className="reveal reveal-scale products-header-wrap">
            <SectionTitle eyebrow="Tuyển chọn tuần này" title="Sản phẩm nổi bật" />

            {/* Prominent Add Product Button right at the section */}
            <div className="add-product-section-action">
              <button
                className="btn-add-product-section"
                onClick={() => setAddProductOpen(true)}
              >
                <PackagePlus size={20} />
                <span>+ Thêm sản phẩm mới</span>
              </button>
            </div>
          </div>

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

            {productList.map((p, i) => {
              const dir = directions[i % directions.length]
              return (
                <div key={p.id} className={`reveal ${dir}`} style={{ transitionDelay: `${0.1 * i}s` }}>
                  <ProductCard product={p} onSelect={setSelectedProduct} />
                </div>
              )
            })}
          </div>
        </section>

        {/* New arrival banner — scale in */}
        <section className="new-arrival reveal reveal-scale">
          <div>
            <p className="eyebrow">Bộ sưu tập mới</p>
            <h2>Mùa men nắng</h2>
            <p>Sắc men ấm, bề mặt tự nhiên và những đường nét tối giản dành cho căn nhà hiện đại.</p>
            <a className="button light btn-shine" href="#products">
              Khám phá ngay
            </a>
          </div>
        </section>

        {/* Policies — each from a different direction */}
        <section className="section" id="policies">
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
      <ChatButton />

      {addProductOpen && (
        <AddProductModal
          onClose={() => setAddProductOpen(false)}
          onProductCreated={loadProducts}
        />
      )}
    </CartProvider>
  )
}

