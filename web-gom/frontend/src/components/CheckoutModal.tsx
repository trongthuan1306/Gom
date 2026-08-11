import React, { useState, useEffect } from 'react'
import { X, MapPin, CreditCard, Banknote, ShieldCheck, Search, Loader2 } from 'lucide-react'
import { locationsApi, ordersApi, authApi, type ProvinceResponse, type WardResponse, type CartItemResponse, session } from '../api/client'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../data/mockData'
import './CheckoutModal.css'

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCOD?: (orderId: number) => void;
}

export function CheckoutModal({ isOpen, onClose, onSuccessCOD }: CheckoutModalProps) {
  const { items, totalAmount, clearCart } = useCart()
  
  const [recipientName, setRecipientName] = useState('')
  const [phone, setPhone] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [notes, setNotes] = useState('')
  
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([])
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [provinceSearch, setProvinceSearch] = useState('')
  
  const [wards, setWards] = useState<WardResponse[]>([])
  const [selectedWardCode, setSelectedWardCode] = useState('')
  const [wardSearch, setWardSearch] = useState('')
  
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD')
  const [loading, setLoading] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill profile info if logged in
  useEffect(() => {
    if (isOpen && session.accessToken()) {
      authApi.me().then(profile => {
        if (profile.fullName) setRecipientName(profile.fullName)
        if (profile.phone) setPhone(profile.phone)
        if (profile.address) setDetailAddress(profile.address)
      }).catch(() => {})
    }
  }, [isOpen])

  // Load provinces
  useEffect(() => {
    if (isOpen) {
      setLoadingLocations(true)
      locationsApi.getProvinces().then(data => {
        setProvinces(data)
      }).catch(err => {
        console.error('Failed to load provinces', err)
      }).finally(() => setLoadingLocations(false))
    }
  }, [isOpen])

  // Load wards when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      setLoadingLocations(true)
      setSelectedWardCode('')
      locationsApi.getWards(selectedProvinceCode).then(data => {
        setWards(data)
      }).catch(err => {
        console.error('Failed to load wards', err)
      }).finally(() => setLoadingLocations(false))
    } else {
      setWards([])
      setSelectedWardCode('')
    }
  }, [selectedProvinceCode])

  if (!isOpen) return null;

  const filteredProvinces = provinces.filter(p =>
    p.fullName.toLowerCase().includes(provinceSearch.toLowerCase()) ||
    p.name.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  const filteredWards = wards.filter(w =>
    w.fullName.toLowerCase().includes(wardSearch.toLowerCase()) ||
    w.name.toLowerCase().includes(wardSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!recipientName.trim()) {
      setError('Vui lòng nhập tên người nhận')
      return
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return
    }
    if (!selectedProvinceCode) {
      setError('Vui lòng chọn Tỉnh / Thành phố')
      return
    }
    if (!selectedWardCode) {
      setError('Vui lòng chọn Phường / Xã')
      return
    }
    if (!detailAddress.trim()) {
      setError('Vui lòng nhập số nhà, tên đường chi tiết')
      return
    }

    try {
      setLoading(true)
      const res = await ordersApi.checkout({
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        provinceCode: selectedProvinceCode,
        wardCode: selectedWardCode,
        detailAddress: detailAddress.trim(),
        paymentMethod,
        notes: notes.trim() || undefined
      })

      if (paymentMethod === 'VNPAY' && res.paymentUrl) {
        // Clear local storage cart state if guest
        await clearCart()
        window.location.href = res.paymentUrl;
      } else {
        await clearCart()
        setLoading(false)
        if (onSuccessCOD) {
          onSuccessCOD(res.orderId)
        } else {
          alert(`Đặt hàng thành công! Mã đơn hàng của bạn là #${res.orderId}`)
          onClose()
        }
      }
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.')
    }
  }

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>
        <div className="checkout-header">
          <h2>Xác nhận Đặt hàng & Thanh toán</h2>
          <button className="checkout-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="checkout-body">
          {/* Left Column: Form info */}
          <div className="checkout-form-col">
            <div className="checkout-section-title">
              <MapPin size={18} color="#8B5E34" />
              <span>Thông tin Giao hàng</span>
            </div>

            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-form-group">
              <label>Họ và tên người nhận *</label>
              <input
                type="text"
                className="checkout-input"
                placeholder="Nguyễn Văn A"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                required
              />
            </div>

            <div className="checkout-form-group">
              <label>Số điện thoại liên hệ *</label>
              <input
                type="tel"
                className="checkout-input"
                placeholder="0912345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>

            {/* Province Selection */}
            <div className="checkout-form-group">
              <label>Tỉnh / Thành phố *</label>
              <div className="checkout-select-searchable">
                <input
                  type="text"
                  className="checkout-input checkout-search-input"
                  placeholder="🔍 Tìm nhanh Tỉnh / Thành phố..."
                  value={provinceSearch}
                  onChange={e => setProvinceSearch(e.target.value)}
                />
                <select
                  className="checkout-select"
                  value={selectedProvinceCode}
                  onChange={e => {
                    setSelectedProvinceCode(e.target.value);
                    setProvinceSearch('');
                  }}
                  required
                >
                  <option value="">-- Chọn Tỉnh / Thành phố ({filteredProvinces.length}) --</option>
                  {filteredProvinces.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ward Selection */}
            <div className="checkout-form-group">
              <label>Phường / Xã / Quận / Huyện *</label>
              <div className="checkout-select-searchable">
                <input
                  type="text"
                  className="checkout-input checkout-search-input"
                  placeholder="🔍 Tìm nhanh Phường / Xã..."
                  value={wardSearch}
                  onChange={e => setWardSearch(e.target.value)}
                  disabled={!selectedProvinceCode}
                />
                <select
                  className="checkout-select"
                  value={selectedWardCode}
                  onChange={e => {
                    setSelectedWardCode(e.target.value);
                    setWardSearch('');
                  }}
                  disabled={!selectedProvinceCode}
                  required
                >
                  <option value="">
                    {!selectedProvinceCode
                      ? '-- Vui lòng chọn Tỉnh/Thành phố trước --'
                      : `-- Chọn Phường / Xã (${filteredWards.length}) --`}
                  </option>
                  {filteredWards.map(w => (
                    <option key={w.code} value={w.code}>
                      {w.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detail Address */}
            <div className="checkout-form-group">
              <label>Địa chỉ chi tiết (Số nhà, Tên đường) *</label>
              <input
                type="text"
                className="checkout-input"
                placeholder="VD: Số 15, Ngõ 88, Đường Bát Tràng"
                value={detailAddress}
                onChange={e => setDetailAddress(e.target.value)}
                required
              />
            </div>

            <div className="checkout-form-group">
              <label>Ghi chú cho đơn hàng (không bắt buộc)</label>
              <textarea
                className="checkout-textarea"
                rows={2}
                placeholder="Ghi chú về thời gian giao hàng hoặc đóng gói đặc biệt..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className="checkout-section-title" style={{ marginTop: '1.5rem' }}>
              <CreditCard size={18} color="#8B5E34" />
              <span>Phương thức Thanh toán</span>
            </div>

            <div className="payment-options">
              <div
                className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <div className="payment-icon">
                  <Banknote size={22} />
                </div>
                <div className="payment-details">
                  <span className="payment-title">Thanh toán khi nhận hàng (COD)</span>
                  <span className="payment-sub">Trả tiền mặt trực tiếp cho shipper khi nhận hàng</span>
                </div>
              </div>

              <div
                className={`payment-option ${paymentMethod === 'VNPAY' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('VNPAY')}
              >
                <div className="payment-icon" style={{ backgroundColor: '#005BAA', color: 'white' }}>
                  VNP
                </div>
                <div className="payment-details">
                  <span className="payment-title">Thanh toán Online VNPAY</span>
                  <span className="payment-sub">Thẻ ATM nội địa, Thẻ quốc tế, QR Code ngân hàng</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-summary-col">
            <div className="order-summary-box">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2C2420', marginTop: 0, marginBottom: '1rem' }}>
                Đơn hàng của bạn ({items.length} sản phẩm)
              </h3>

              <div className="summary-items">
                {items.map((item: CartItemResponse) => (
                  <div key={item.id} className="summary-item">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80'}
                      alt={item.productName}
                      className="summary-item-img"
                    />
                    <div className="summary-item-info">
                      <div className="summary-item-name">{item.productName}</div>
                      <div className="summary-item-qty">Số lượng: x{item.quantity}</div>
                    </div>
                    <div className="summary-item-price">
                      {formatPrice(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span style={{ color: '#16A34A', fontWeight: 500 }}>Miễn phí</span>
              </div>

              <div className="summary-row total">
                <span>Tổng cộng</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>

              <button
                type="submit"
                className="btn-submit-order"
                disabled={loading || items.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Đang xử lý đơn hàng...</span>
                  </>
                ) : paymentMethod === 'VNPAY' ? (
                  <>
                    <CreditCard size={18} />
                    <span>Thanh toán ngay qua VNPAY</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Xác nhận Đặt hàng (COD)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
