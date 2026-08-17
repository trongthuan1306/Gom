import { useState, useRef, useEffect } from 'react'
import { X, Edit3, ImagePlus, UploadCloud, CheckCircle2, DollarSign, Tag, Layers, FileText, Sparkles, Ruler, MapPin, ShieldAlert } from 'lucide-react'
import type { Product } from '../types'
import { productsApi } from '../api/client'
import './AddProductModal.css'

const ITEM_TYPES = ['Tô', 'Chén', 'Dĩa'] as const
const FLOWER_TYPES = ['Ngũ sắc', 'Trinh nữ', 'Cúc trắng', 'Dã quỳ'] as const
const SEASONS = ['Xuân', 'Hạ', 'Thu', 'Đông'] as const

// Hoa nở theo mùa: Ngũ sắc → Xuân, Trinh nữ → Hạ, Cúc trắng → Thu, Dã quỳ → Đông
const FLOWER_SEASON_MAP: Record<string, string> = {
  'Ngũ sắc': 'Xuân',
  'Trinh nữ': 'Hạ',
  'Cúc trắng': 'Thu',
  'Dã quỳ': 'Đông',
}

export function EditProductModal({
  product,
  onClose,
  onProductUpdated
}: {
  product: Product
  onClose: () => void
  onProductUpdated: () => void
}) {
  const [name, setName] = useState(product.name || '')
  const [price, setPrice] = useState(product.price ? product.price.toString() : '')
  const [stockQuantity, setStockQuantity] = useState(product.stockQuantity !== undefined ? product.stockQuantity.toString() : '10')
  const [description, setDescription] = useState(product.description || '')
  const [materials, setMaterials] = useState(product.materials || '')
  const [dimensions, setDimensions] = useState(product.dimensions || '')
  const [origin, setOrigin] = useState(product.origin || 'Biên Hòa')
  const [careInstructions, setCareInstructions] = useState(product.careInstructions || '')
  const [itemType, setItemType] = useState(product.itemType || '')
  const [flowerType, setFlowerType] = useState(product.flowerType || '')
  const [season, setSeason] = useState(product.season || '')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product.image || null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFlowerChange(flower: string) {
    setFlowerType(flower)
    if (flower && FLOWER_SEASON_MAP[flower]) {
      setSeason(FLOWER_SEASON_MAP[flower])
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        setError('Dung lượng ảnh tối đa là 10MB')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setError('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const priceNum = parseFloat(price)
    const stockNum = parseInt(stockQuantity, 10)

    if (!name.trim()) {
      setError('Tên sản phẩm không được để trống')
      return
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Giá sản phẩm phải là số >= 0')
      return
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Số lượng kho phải là số nguyên >= 0')
      return
    }

    setLoading(true)
    try {
      await productsApi.update(
        product.id,
        {
          name: name.trim(),
          price: priceNum,
          stockQuantity: stockNum,
          description: description.trim() || undefined,
          materials: materials.trim() || undefined,
          dimensions: dimensions.trim() || undefined,
          origin: origin.trim() || undefined,
          careInstructions: careInstructions.trim() || undefined,
          itemType: itemType || undefined,
          flowerType: flowerType || undefined,
          season: season || undefined,
        },
        imageFile || undefined
      )

      setSuccess('Cập nhật thông tin sản phẩm thành công!')
      setTimeout(() => {
        onProductUpdated()
        onClose()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật sản phẩm. Hãy kiểm tra lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-product-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="add-product-container" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}>
        <button className="add-product-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        <div className="add-product-header">
          <div className="header-icon-badge" style={{ background: 'rgba(115, 18, 20, 0.12)', color: 'var(--brand-red)' }}>
            <Edit3 size={24} />
          </div>
          <div>
            <h2>Chỉnh sửa sản phẩm #{product.id}</h2>
            <p>Cập nhật giá, kho, mô tả, thuộc tính mùa & ảnh sản phẩm.</p>
          </div>
        </div>

        {success && (
          <div className="add-product-alert success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="add-product-alert error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-grid">
            {/* Left Column: Form Controls */}
            <div className="form-left">
              <div className="input-field">
                <label>Tên sản phẩm <span className="req">*</span></label>
                <div className="input-wrapper">
                  <Tag className="input-icon" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="input-field">
                  <label>Giá bán (VND) <span className="req">*</span></label>
                  <div className="input-wrapper">
                    <DollarSign className="input-icon" size={18} />
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label>Số lượng kho <span className="req">*</span></label>
                  <div className="input-wrapper">
                    <Layers className="input-icon" size={18} />
                    <input
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={e => setStockQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Extra Spec Fields */}
              <div className="form-row-2">
                <div className="input-field">
                  <label>Loại Đất / Loại Men</label>
                  <div className="input-wrapper">
                    <Sparkles className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="VD: Đất sét Biên Hòa, Men tro"
                      value={materials}
                      onChange={e => setMaterials(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label>Xuất xứ làng nghề</label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="VD: Biên Hòa, Bát Tràng"
                      value={origin}
                      onChange={e => setOrigin(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="input-field">
                <label>Kích thước / Dung tích</label>
                <div className="input-wrapper">
                  <Ruler className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="VD: Đường kính 18cm, Cao 6.5cm"
                    value={dimensions}
                    onChange={e => setDimensions(e.target.value)}
                  />
                </div>
              </div>

              {/* Thuộc tính phân loại Hiên Gốm */}
              <div className="form-row-3">
                <div className="input-field">
                  <label>Thể loại</label>
                  <div className="input-wrapper">
                    <select value={itemType} onChange={e => setItemType(e.target.value)}>
                      <option value="">— Chọn —</option>
                      {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-field">
                  <label>Họa tiết Hoa</label>
                  <div className="input-wrapper">
                    <select value={flowerType} onChange={e => handleFlowerChange(e.target.value)}>
                      <option value="">— Chọn —</option>
                      {FLOWER_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-field">
                  <label>Mùa</label>
                  <div className="input-wrapper">
                    <select value={season} onChange={e => setSeason(e.target.value)}>
                      <option value="">— Chọn —</option>
                      {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="input-field">
                <label>Mô tả sản phẩm</label>
                <div className="input-wrapper textarea-wrapper">
                  <FileText className="input-icon textarea-icon" size={18} />
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-field">
                <label>Hướng dẫn bảo quản & Sử dụng</label>
                <div className="input-wrapper textarea-wrapper">
                  <ShieldAlert className="input-icon textarea-icon" size={18} />
                  <textarea
                    rows={2}
                    value={careInstructions}
                    onChange={e => setCareInstructions(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Image Preview / Change */}
            <div className="form-right">
              <label className="upload-label">Ảnh sản phẩm (Nhấp để đổi ảnh)</label>
              
              <div
                className={`image-upload-box ${imagePreview ? 'has-image' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Xem trước sản phẩm" onError={() => setImagePreview(null)} />
                    <div className="image-change-overlay">
                      <ImagePlus size={24} />
                      <span>Chọn ảnh mới tải lên</span>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <UploadCloud size={36} className="upload-icon" />
                    <p className="upload-title">Nhấp để chọn file ảnh</p>
                    <span className="upload-sub">Chấp nhận JPG, PNG, WEBP (Tối đa 10MB)</span>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          <div className="add-product-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <UploadCloud size={18} className="spin" /> Đang cập nhật...
                </>
              ) : (
                <>
                  <Edit3 size={18} /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
