import { ArrowLeft, Sparkles, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Category, Product } from '../types'
import { Header } from './Header'
import { Footer } from './Footer'
import { ProductCard } from './ProductCard'
import { categories } from '../data/mockData'
import './CollectionPage.css'

interface CollectionPageProps {
  category: Category
  allProducts: Product[]
  canEdit?: boolean
  onBack: () => void
  onSelectCategory: (cat: Category) => void
  onSelectProduct: (product: Product) => void
  onEditProduct?: (product: Product) => void
  onDeleteProduct?: (product: Product) => void
  onProductAdded?: () => void
  onOpenAdmin?: () => void
  onOpenCheckout?: () => void
}

export function CollectionPage({
  category,
  allProducts,
  canEdit,
  onBack,
  onSelectCategory,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onProductAdded,
  onOpenAdmin,
  onOpenCheckout
}: CollectionPageProps) {
  const [selectedItemType, setSelectedItemType] = useState<string>('all')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setSelectedItemType('all')
  }, [category])

  // A collection represents one season.  Do not include a product just because
  // its flower name happens to match: its stored season is the source of truth.
  const normalizedSeason = category.season.trim().toLocaleLowerCase('vi-VN')
  const seasonProducts = allProducts.filter(
    p => p.season?.trim().toLocaleLowerCase('vi-VN') === normalizedSeason
  )
  const collectionProducts = seasonProducts.filter(
    p => selectedItemType === 'all' || p.itemType === selectedItemType
  )

  // Get other 3 seasons for quick switching
  const otherSeasons = categories.filter(c => c.id !== category.id)

  return (
    <div className="collection-page">
      <Header
        onProductAdded={onProductAdded}
        products={allProducts}
        onOpenAdmin={onOpenAdmin}
        onOpenCheckout={onOpenCheckout}
      />

      {/* Top Bar: Back Link & Breadcrumbs */}
      <div className="collection-top-bar">
        <button className="collection-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại trang chủ</span>
        </button>

        <nav className="collection-breadcrumbs">
          <span className="crumb-link" onClick={onBack}>Trang chủ</span>
          <span>/</span>
          <span className="crumb-link" onClick={onBack}>Bộ sưu tập 4 mùa</span>
          <span>/</span>
          <span className="crumb-current">{category.name}</span>
        </nav>
      </div>

      {/* Collection Hero Showcase */}
      <section className="collection-hero-banner">
        <div className="collection-hero-overlay" />
        <img src={category.image} alt={category.name} className="collection-hero-bg-img" />

        <div className="collection-hero-content">
          <div className="collection-hero-badge">
            <span className="flower-icon-large">{category.flowerIcon}</span>
            <span>BỘ SƯU TẬP MÙA {category.season.toUpperCase()}</span>
          </div>

          <h1 className="collection-hero-title">
            Hoa {category.flower}
            <span className="collection-title-sub"> · {category.season}</span>
          </h1>

          <p className="collection-hero-meaning">
            <Sparkles size={16} />
            <span>Ý nghĩa: <strong>{category.meaning}</strong></span>
          </p>

          <p className="collection-hero-desc">
            “{category.description}”
          </p>

          {/* Quick Season Switcher Pills */}
          <div className="collection-season-switcher">
            <span className="switcher-label">Xem mùa khác:</span>
            <div className="switcher-buttons">
              {otherSeasons.map(other => (
                <button
                  key={other.id}
                  className="switcher-btn"
                  onClick={() => onSelectCategory(other)}
                >
                  <span>{other.flowerIcon}</span>
                  <span>Mùa {other.season} ({other.flower})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Products of this Collection */}
      <main className="collection-main-container">
        <div className="collection-filter-header">
          <div className="collection-header-text">
            <h2>Tác phẩm Gốm Mùa {category.season}</h2>
            <p>Tuyển chọn các mẫu tô, chén, dĩa mang nét đẹp mộc mạc của hoa {category.flower}.</p>
          </div>

          {/* Filter by Item Type: Tô / Chén / Dĩa */}
          <div className="collection-type-filters">
            <span className="type-filter-label">
              <Filter size={14} /> Thể loại:
            </span>
            <button
              className={`type-pill-btn ${selectedItemType === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedItemType('all')}
            >
              Tất cả ({seasonProducts.length})
            </button>
            <button
              className={`type-pill-btn ${selectedItemType === 'Tô' ? 'active' : ''}`}
              onClick={() => setSelectedItemType('Tô')}
            >
              🥣 Tô
            </button>
            <button
              className={`type-pill-btn ${selectedItemType === 'Chén' ? 'active' : ''}`}
              onClick={() => setSelectedItemType('Chén')}
            >
              🍵 Chén
            </button>
            <button
              className={`type-pill-btn ${selectedItemType === 'Dĩa' ? 'active' : ''}`}
              onClick={() => setSelectedItemType('Dĩa')}
            >
              🍽️ Dĩa
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="collection-product-grid">
          {collectionProducts.length === 0 ? (
            <div className="collection-empty-state">
              <span className="empty-icon">{category.flowerIcon}</span>
              <h3>Chưa có sản phẩm cho thể loại này</h3>
              <p>Hãy chọn thể loại khác hoặc quay lại xem toàn bộ bộ sưu tập mùa {category.season}.</p>
              <button
                className="button dark"
                onClick={() => setSelectedItemType('all')}
              >
                Xem tất cả sản phẩm mùa {category.season}
              </button>
            </div>
          ) : (
            collectionProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                canEdit={canEdit}
                onSelect={onSelectProduct}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
              />
            ))
          )}
        </div>

        {/* Brand Philosophy Box at Bottom */}
        <section className="collection-story-footer-box">
          <div className="story-footer-left">
            <span className="story-stamp">HIÊN GỐM · BIÊN HÒA</span>
            <h3>Hồn gốm thủ công & Triết lý 4 Mùa Hoa</h3>
            <p>
              Mỗi sản phẩm trong bộ sưu tập <strong>Mùa {category.season}</strong> được người thợ vuốt gốm tại xưởng Hiên Gốm tạo hình bằng tay, vẽ họa tiết hoa <strong>{category.flower}</strong> thủ công và nung trong lò củi nhiệt cao. Vẻ đẹp không hoàn hảo tuyệt đối của gốm chính là dấu ấn độc bản trong nếp nhà bạn.
            </p>
          </div>
          <div className="story-footer-right">
            <button className="button light" onClick={onBack}>
              ← Quay lại Trang chủ
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
