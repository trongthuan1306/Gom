import React, { useState, useEffect } from 'react'
import { X, Upload, Sparkles, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Category } from '../types'
import './CategoryModal.css'

interface CategoryModalProps {
  category?: Category | null
  isOpen: boolean
  onClose: () => void
  onSave: (category: Category) => void
}

export function CategoryModal({ category, isOpen, onClose, onSave }: CategoryModalProps) {
  const isEdit = !!category

  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [season, setSeason] = useState('Xuân')
  const [flower, setFlower] = useState('')
  const [flowerIcon, setFlowerIcon] = useState('🌸')
  const [meaning, setMeaning] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (category) {
      setId(String(category.id))
      setName(category.name)
      setSeason(category.season)
      setFlower(category.flower)
      setFlowerIcon(category.flowerIcon || '🌸')
      setMeaning(category.meaning)
      setDescription(category.description)
      setImage(category.imageUrl || category.image || '')
    } else {
      setId('')
      setName('')
      setSeason('Xuân')
      setFlower('')
      setFlowerIcon('🌸')
      setMeaning('')
      setDescription('')
      setImage('https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80')
    }
    setError(null)
  }, [category, isOpen])

  if (!isOpen) return null

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Vui lòng nhập tên bộ sưu tập')
      return
    }
    if (!flower.trim()) {
      setError('Vui lòng nhập tên loài hoa đại diện')
      return
    }
    if (!meaning.trim()) {
      setError('Vui lòng nhập ý nghĩa / thông điệp bộ sưu tập')
      return
    }
    if (!description.trim()) {
      setError('Vui lòng nhập mô tả câu chuyện')
      return
    }
    if (!image.trim()) {
      setError('Vui lòng cung cấp hình ảnh cho bộ sưu tập')
      return
    }

    const savedCat: Category = {
      id: id || '',
      name: name.trim(),
      season: season.trim(),
      flower: flower.trim(),
      flowerIcon: flowerIcon.trim() || '🌸',
      meaning: meaning.trim(),
      description: description.trim(),
      image: image.trim(),
      imageUrl: image.trim()
    }

    onSave(savedCat)
    onClose()
  }

  const commonIcons = ['💜', '🌸', '🤍', '🌼', '🪷', '🌺', '🍃', '🌾', '🍁', '🌻']

  return (
    <div className="cat-modal-overlay" onClick={onClose}>
      <div className="cat-modal-content" onClick={e => e.stopPropagation()}>
        <div className="cat-modal-header">
          <div className="cat-modal-title">
            <Sparkles size={20} color="var(--brand-red, #731214)" />
            <h2>{isEdit ? 'Chỉnh sửa Bộ Sưu Tập Mùa' : 'Thêm Bộ Sưu Tập Mới'}</h2>
          </div>
          <button className="cat-modal-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="cat-modal-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="cat-modal-body">
          <div className="cat-modal-grid">
            {/* Left: Input Form */}
            <div className="cat-modal-form-col">
              <div className="cat-form-group">
                <label>Tên Bộ sưu tập *</label>
                <input
                  type="text"
                  className="cat-input"
                  placeholder="VD: Mùa Xuân · Ngũ Sắc"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="cat-form-row">
                <div className="cat-form-group">
                  <label>Mùa cảm hứng *</label>
                  <select
                    className="cat-select"
                    value={season}
                    onChange={e => setSeason(e.target.value)}
                  >
                    <option value="Xuân">Mùa Xuân</option>
                    <option value="Hạ">Mùa Hạ</option>
                    <option value="Thu">Mùa Thu</option>
                    <option value="Đông">Mùa Đông</option>
                    <option value="Bốn Mùa">Bốn Mùa</option>
                  </select>
                </div>

                <div className="cat-form-group">
                  <label>Loài hoa đại diện *</label>
                  <input
                    type="text"
                    className="cat-input"
                    placeholder="VD: Ngũ sắc, Trinh nữ..."
                    value={flower}
                    onChange={e => setFlower(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Emoji Icon Picker */}
              <div className="cat-form-group">
                <label>Biểu tượng Hoa (Icon)</label>
                <div className="cat-emoji-picker-row">
                  <input
                    type="text"
                    className="cat-input cat-emoji-input"
                    value={flowerIcon}
                    onChange={e => setFlowerIcon(e.target.value)}
                    maxLength={4}
                  />
                  <div className="cat-quick-emojis">
                    {commonIcons.map(icon => (
                      <button
                        type="button"
                        key={icon}
                        className={`btn-emoji ${flowerIcon === icon ? 'active' : ''}`}
                        onClick={() => setFlowerIcon(icon)}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="cat-form-group">
                <label>Ý nghĩa thông điệp *</label>
                <input
                  type="text"
                  className="cat-input"
                  placeholder="VD: Đa dạng · Hài hòa · Tươi vui"
                  value={meaning}
                  onChange={e => setMeaning(e.target.value)}
                  required
                />
              </div>

              <div className="cat-form-group">
                <label>Mô tả câu chuyện Bộ sưu tập *</label>
                <textarea
                  className="cat-textarea"
                  rows={3}
                  placeholder="Mô tả cảm hứng và vẻ đẹp của bộ sưu tập gốm..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="cat-form-group">
                <label>Hình ảnh bìa Bộ sưu tập *</label>
                <div className="cat-image-input-wrap">
                  <input
                    type="text"
                    className="cat-input"
                    placeholder="Dán link ảnh URL hoặc tải file bên dưới..."
                    value={image}
                    onChange={e => setImage(e.target.value)}
                  />
                  <label className="cat-upload-btn">
                    <Upload size={16} />
                    <span>Tải ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Live Preview Card */}
            <div className="cat-modal-preview-col">
              <div className="preview-heading">
                <ImageIcon size={16} />
                <span>Xem trước Thẻ Bộ Sưu Tập</span>
              </div>

              <div className="category-card preview-card">
                <div className="category-img-wrap">
                  <img
                    src={image || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80'}
                    alt={name || 'Bộ sưu tập'}
                  />
                  <div className="category-img-overlay" />
                  <div className="category-flower-badge">
                    <span>{flowerIcon || '🌸'}</span>
                    <span>{flower || 'Hoa'} · {season || 'Mùa'}</span>
                  </div>
                </div>
                <div className="category-card-body">
                  <h3 className="category-card-title">{name || 'Tên Bộ Sưu Tập'}</h3>
                  <p className="category-meaning">{meaning || 'Ý nghĩa thông điệp'}</p>
                  <p className="category-desc">{description || 'Mô tả câu chuyện gốm thủ công ấm lành...'}</p>
                  <div className="category-action-link">
                    <span>Xem sản phẩm mùa {season || 'này'}</span>
                    <span className="arrow-anim">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cat-modal-footer">
            <button type="button" className="btn-cat-cancel" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-cat-save">
              <CheckCircle2 size={16} />
              <span>{isEdit ? 'Lưu thay đổi' : 'Tạo bộ sưu tập'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
