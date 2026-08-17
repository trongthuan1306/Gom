import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Truck,
  RotateCcw,
  Loader2,
  Package,
  Sparkles,
  Phone,
  User,
  Home,
  MessageSquare
} from 'lucide-react'
import { locationsApi, ordersApi, authApi, type ProvinceResponse, type WardResponse, type CartItemResponse, session } from '../api/client'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../data/mockData'
import './CheckoutPage.css'

interface CheckoutPageProps {
  onBack: () => void
  onOrderSuccess?: (orderId: number) => void
}

export function CheckoutPage({ onBack, onOrderSuccess }: CheckoutPageProps) {
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
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Pre-fill profile info if logged in
  useEffect(() => {
    if (session.accessToken()) {
      authApi.me().then(profile => {
        if (profile.fullName) setRecipientName(profile.fullName)
        if (profile.phone) setPhone(profile.phone)
        if (profile.address) setDetailAddress(profile.address)
      }).catch(() => {})
    }
  }, [])

  // Load provinces
  useEffect(() => {
    setLoadingLocations(true)
    locationsApi.getProvinces().then(data => {
      setProvinces(data)
    }).catch(err => {
      console.error('Failed to load provinces', err)
    }).finally(() => setLoadingLocations(false))
  }, [])

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

  const filteredProvinces = provinces.filter(p =>
    p.fullName.toLowerCase().includes(provinceSearch.toLowerCase()) ||
    p.name.toLowerCase().includes(provinceSearch.toLowerCase())
  )

  const filteredWards = wards.filter(w =>
    w.fullName.toLowerCase().includes(wardSearch.toLowerCase()) ||
    w.name.toLowerCase().includes(wardSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!recipientName.trim()) {
      setError('Vui lòng nhập tên người nhận')
      return
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại liên hệ')
      return
    }
    if (!selectedProvinceCode) {
      setError('Vui lòng chọn Tỉnh / Thành phố nhận hàng')
      return
    }
    if (!selectedWardCode) {
      setError('Vui lòng chọn Phường / Xã / Quận / Huyện')
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
        await clearCart()
        window.location.href = res.paymentUrl
      } else {
        await clearCart()
        setLoading(false)
        setSuccessOrderId(res.orderId)
        if (onOrderSuccess) onOrderSuccess(res.orderId)
      }
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.')
    }
  }

  // ── Success Confirmation Screen ──
  if (successOrderId) {
    return (
      <div className="checkout-page-root">
        <header className="checkout-page-header">
          <div className="checkout-header-inner">
            <div className="checkout-logo-wrap" onClick={onBack}>
              <img src="/logo.png" alt="Hiên Gốm" className="checkout-logo-img" />
              <div className="checkout-logo-text">
                <strong>HIÊN GỐM</strong>
                <span>Gốm thủ công mộc lành</span>
              </div>
            </div>
          </div>
        </header>

        <main className="checkout-success-container">
          <div className="checkout-success-card">
            <div className="success-icon-wrap">
              <CheckCircle2 size={54} color="#1b7a43" />
            </div>
            <h1>Đặt hàng thành công!</h1>
            <p className="success-subtitle">
              Cảm ơn bạn đã tin chọn các tác phẩm gốm mộc tại <strong>Hiên Gốm</strong>.
            </p>

            <div className="success-order-box">
              <div className="success-order-row">
                <span>Mã đơn hàng:</span>
                <strong className="order-number">#{successOrderId}</strong>
              </div>
              <div className="success-order-row">
                <span>Người nhận:</span>
                <strong>{recipientName} ({phone})</strong>
              </div>
              <div className="success-order-row">
                <span>Hình thức thanh toán:</span>
                <strong>Thanh toán khi nhận hàng (COD)</strong>
              </div>
              <div className="success-order-row">
                <span>Trạng thái:</span>
                <span className="success-badge-pending">Chờ xác nhận & đóng gói</span>
              </div>
            </div>

            <p className="success-note">
              Bộ phận chăm sóc khách hàng của Hiên Gốm sẽ liên hệ sớm nhất để xác nhận thông tin giao hàng và tiến hành đóng gói cẩn trọng nhiều lớp trước khi gửi cho bạn.
            </p>

            <div className="success-actions">
              <button className="btn-continue-shopping" onClick={onBack}>
                Tiếp tục khám phá cửa hàng
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="checkout-page-root">
      {/* Top Checkout Header */}
      <header className="checkout-page-header">
        <div className="checkout-header-inner">
          <div className="checkout-logo-wrap" onClick={onBack} title="Về trang chủ">
            <img src="/logo.png" alt="Hiên Gốm" className="checkout-logo-img" />
            <div className="checkout-logo-text">
              <strong>HIÊN GỐM</strong>
              <span>Gốm thủ công mộc lành</span>
            </div>
          </div>

          <div className="checkout-steps-nav">
            <span className="step-done">1. Giỏ hàng</span>
            <span className="step-arrow">›</span>
            <span className="step-active">2. Thông tin giao hàng & Thanh toán</span>
            <span className="step-arrow">›</span>
            <span className="step-pending">3. Hoàn tất</span>
          </div>

          <button className="checkout-btn-back" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="checkout-page-container">
        <div className="checkout-top-title-bar">
          <div>
            <h1>Xác nhận Đặt hàng & Thanh toán</h1>
            <p>Vui lòng điền địa chỉ giao hàng và chọn phương thức thanh toán an tâm</p>
          </div>
          <button className="back-to-store-link" onClick={onBack}>
            ← Quay lại mua sắm thêm
          </button>
        </div>

        {items.length === 0 ? (
          <div className="checkout-empty-cart-card">
            <Package size={48} color="#8c7d74" />
            <h3>Giỏ hàng của bạn đang trống</h3>
            <p>Hãy chọn những món gốm ưng ý trước khi tiến hành thanh toán nhé!</p>
            <button className="btn-browse-products" onClick={onBack}>
              Khám phá sản phẩm Hiên Gốm
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="checkout-grid-layout">
            {/* Left Column: Delivery Info & Payment */}
            <div className="checkout-left-column">
              {error && (
                <div className="checkout-error-banner">
                  <span>{error}</span>
                </div>
              )}

              {/* Section 1: Customer & Shipping Details */}
              <div className="checkout-card-block">
                <div className="card-block-header">
                  <div className="card-block-icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2>Thông tin Giao nhận hàng</h2>
                    <span>Địa chỉ nhận sản phẩm gốm đóng gói cẩn trọng</span>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <div className="form-field-group">
                    <label>Họ và tên người nhận *</label>
                    <div className="input-with-icon">
                      <User size={17} className="field-icon" />
                      <input
                        type="text"
                        className="checkout-input-field"
                        placeholder="VD: Nguyễn Văn A"
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label>Số điện thoại liên hệ *</label>
                    <div className="input-with-icon">
                      <Phone size={17} className="field-icon" />
                      <input
                        type="tel"
                        className="checkout-input-field"
                        placeholder="VD: 0912345678"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Province & Ward Row */}
                <div className="checkout-form-grid" style={{ marginTop: '16px' }}>
                  <div className="form-field-group">
                    <label>Tỉnh / Thành phố *</label>
                    <div className="searchable-select-wrap">
                      <input
                        type="text"
                        className="checkout-input-field select-search"
                        placeholder="🔍 Tìm nhanh Tỉnh / Thành..."
                        value={provinceSearch}
                        onChange={e => setProvinceSearch(e.target.value)}
                      />
                      <select
                        className="checkout-select-field"
                        value={selectedProvinceCode}
                        onChange={e => {
                          setSelectedProvinceCode(e.target.value)
                          setProvinceSearch('')
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

                  <div className="form-field-group">
                    <label>Phường / Xã / Quận / Huyện *</label>
                    <div className="searchable-select-wrap">
                      <input
                        type="text"
                        className="checkout-input-field select-search"
                        placeholder="🔍 Tìm nhanh Phường / Xã..."
                        value={wardSearch}
                        onChange={e => setWardSearch(e.target.value)}
                        disabled={!selectedProvinceCode}
                      />
                      <select
                        className="checkout-select-field"
                        value={selectedWardCode}
                        onChange={e => {
                          setSelectedWardCode(e.target.value)
                          setWardSearch('')
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
                </div>

                {/* Detail Address */}
                <div className="form-field-group" style={{ marginTop: '16px' }}>
                  <label>Địa chỉ chi tiết (Số nhà, Tên đường, Tòa nhà) *</label>
                  <div className="input-with-icon">
                    <Home size={17} className="field-icon" />
                    <input
                      type="text"
                      className="checkout-input-field"
                      placeholder="VD: Số 15, Ngõ 88, Phố Bát Tràng"
                      value={detailAddress}
                      onChange={e => setDetailAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="form-field-group" style={{ marginTop: '16px' }}>
                  <label>Ghi chú đơn hàng (không bắt buộc)</label>
                  <div className="input-with-icon textarea-wrap">
                    <MessageSquare size={17} className="field-icon textarea-icon" />
                    <textarea
                      className="checkout-textarea-field"
                      rows={3}
                      placeholder="Ghi chú về thời gian nhận hàng thuận tiện hoặc yêu cầu đóng gói làm quà tặng..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div className="checkout-card-block" style={{ marginTop: '24px' }}>
                <div className="card-block-header">
                  <div className="card-block-icon">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2>Phương thức Thanh toán</h2>
                    <span>Chọn cách thức thanh toán tiện lợi & an toàn</span>
                  </div>
                </div>

                <div className="payment-options-grid">
                  <div
                    className={`payment-choice-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <div className="payment-choice-radio">
                      <div className="radio-dot" />
                    </div>
                    <div className="payment-choice-icon cod-icon">
                      <Banknote size={26} />
                    </div>
                    <div className="payment-choice-details">
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <p>Nhận hàng, kiểm tra sản phẩm gốm nguyên vẹn rồi thanh toán tiền mặt cho nhân viên giao hàng.</p>
                      <span className="payment-perk-pill">Phổ biến & An tâm</span>
                    </div>
                  </div>

                  <div
                    className={`payment-choice-card ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('VNPAY')}
                  >
                    <div className="payment-choice-radio">
                      <div className="radio-dot" />
                    </div>
                    <div className="payment-choice-icon vnpay-icon">
                      <span>VNPAY</span>
                    </div>
                    <div className="payment-choice-details">
                      <strong>Thanh toán Trực tuyến VNPAY</strong>
                      <p>Hỗ trợ quét mã QR qua 40+ ngân hàng Việt Nam, thẻ ATM nội địa hoặc thẻ Quốc tế (Visa, Master).</p>
                      <span className="payment-perk-pill vnpay-perk">Thanh toán tức thì 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <div className="checkout-right-column">
              <div className="checkout-summary-card">
                <div className="summary-header">
                  <h3>Đơn hàng của bạn ({items.length} món)</h3>
                  <span className="summary-store-tag">Hiên Gốm Store</span>
                </div>

                <div className="summary-products-list">
                  {items.map((item: CartItemResponse) => (
                    <div key={item.id} className="summary-product-row">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80'}
                        alt={item.productName}
                        className="summary-product-thumb"
                      />
                      <div className="summary-product-info">
                        <strong className="summary-product-name">{item.productName}</strong>
                        <span className="summary-product-qty">Số lượng: <strong>x{item.quantity}</strong></span>
                      </div>
                      <div className="summary-product-subtotal">
                        {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-pricing-breakdown">
                  <div className="pricing-row">
                    <span>Tạm tính tiền hàng</span>
                    <strong>{formatPrice(totalAmount)}</strong>
                  </div>
                  <div className="pricing-row">
                    <span>Phí vận chuyển toàn quốc</span>
                    <span className="free-shipping-tag">Miễn phí giao hàng</span>
                  </div>
                  <div className="pricing-row total-pricing-row">
                    <span>Tổng thanh toán</span>
                    <strong className="total-grand-price">{formatPrice(totalAmount)}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-place-order-large"
                  disabled={loading || items.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="spin-loader" />
                      <span>Đang xử lý đơn hàng...</span>
                    </>
                  ) : paymentMethod === 'VNPAY' ? (
                    <>
                      <CreditCard size={20} />
                      <span>Thanh toán ngay qua VNPAY ({formatPrice(totalAmount)})</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      <span>Xác nhận Đặt hàng COD ({formatPrice(totalAmount)})</span>
                    </>
                  )}
                </button>

                {/* Trust and Security Guarantee Perks */}
                <div className="checkout-trust-perks">
                  <div className="trust-perk-item">
                    <Truck size={18} />
                    <span>Đóng gói chống sốc nhiều lớp an toàn</span>
                  </div>
                  <div className="trust-perk-item">
                    <RotateCcw size={18} />
                    <span>Bảo hành nứt vỡ, đổi trả trong 7 ngày</span>
                  </div>
                  <div className="trust-perk-item">
                    <Sparkles size={18} />
                    <span>Men mộc thủ công tự nhiên 100%</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
