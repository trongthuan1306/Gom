import { useState, useRef } from 'react'
import { X, PackagePlus, ImagePlus, UploadCloud, CheckCircle2, DollarSign, Tag, Layers, FileText, Sparkles, Ruler, MapPin, ShieldAlert } from 'lucide-react'
import { productsApi } from '../api/client'
import './AddProductModal.css'

const ITEM_TYPES = ['Tô', 'Chén', 'Dĩa'] as const
const FLOWER_TYPES = ['Dã quỳ', 'Cúc trắng', 'Trinh nữ', 'Ngũ sắc'] as const
const SEASONS = ['Xuân', 'Hạ', 'Thu', 'Đông'] as const

// Hoa nở theo mùa: Ngũ sắc → Xuân, Trinh nữ → Hạ, Cúc trắng → Thu, Dã quỳ → Đông
const FLOWER_SEASON_MAP: Record<string, string> = {
  'Ngũ sắc': 'Xuân',
  'Trinh nữ': 'Hạ',
  'Cúc trắng': 'Thu',
  'Dã quỳ': 'Đông',
}

export function AddProductModal({
  onClose,
  onProductCreated
}: {
  onClose: () => void
  onProductCreated: () => void
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('10')
  const [description, setDescription] = useState('')
  const [materials, setMaterials] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [origin, setOrigin] = useState('Bát Tràng')
  const [careInstructions, setCareInstructions] = useState('')
  const [itemType, setItemType] = useState('')
  const [flowerType, setFlowerType] = useState('')
  const [season, setSeason] = useState('')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFlowerChange(flower: string) {
    setFlowerType(flower)
    // Tự động chọn mùa tương ứng
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
      await productsApi.create(
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

      setSuccess('Thêm sản phẩm mới thành công!')
      setTimeout(() => {
        onProductCreated()
        onClose()
      }, 1200)
    } catch (err: any) {
      setError(err.message || 'Không thể tạo sản phẩm. Hãy kiểm tra lại thông tin.')
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
          <div className="header-icon-badge">
            <PackagePlus size={24} />
          </div>
          <div>
            <h2>Thêm sản phẩm Gốm mới</h2>
            <p>Nhập thông tin sản phẩm và tải ảnh lên lưu trữ Cloudinary.</p>
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
            {/* Left Column: Form Text Controls */}
            <div className="form-left">
              <div className="input-field">
                <label>Tên sản phẩm <span className="req">*</span></label>
                <div className="input-wrapper">
                  <Tag className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="VD: Bộ Bình Trà Men Tro Hỏa Biến"
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
                      placeholder="850000"
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
                      placeholder="10"
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
                      placeholder="VD: Đất sét trắng, Men tro hỏa biến"
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
                      placeholder="VD: Bát Tràng, Biên Hòa"
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
                    placeholder="VD: Ấm 650ml, 6 chén 90ml, Cao 18cm"
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
                    placeholder="Mô tả đặc điểm nổi bật, thiết kế..."
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
                    placeholder="VD: Dùng mút mềm khi rửa, an toàn lò vi sóng..."
                    value={careInstructions}
                    onChange={e => setCareInstructions(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Image File Upload Area */}
            <div className="form-right">
              <label className="upload-label">Ảnh sản phẩm (Tải file ảnh lên)</label>
              
              <div
                className={`image-upload-box ${imagePreview ? 'has-image' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Xem trước sản phẩm" onError={() => setImagePreview(null)} />
                    <div className="image-change-overlay">
                      <ImagePlus size={24} />
                      <span>Chọn file ảnh khác</span>
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
                  <UploadCloud size={18} className="spin" /> Đang lưu sản phẩm...
                </>
              ) : (
                <>
                  <PackagePlus size={18} /> Lưu sản phẩm mới
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
