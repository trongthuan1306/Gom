import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, CheckCircle2, Save, KeyRound, Package, Truck, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { authApi, ordersApi, type UserProfile, type OrderResponse } from '../api/client'
import { formatPrice } from '../data/mockData'
import './ProfileModal.css'

export type ProfileTab = 'info' | 'password' | 'orders'

export function ProfileModal({
  user,
  initialTab = 'info',
  onClose,
  onUserUpdated
}: {
  user: UserProfile
  initialTab?: ProfileTab
  onClose: () => void
  onUserUpdated: (updatedUser: UserProfile) => void
}) {
  const [tab, setTab] = useState<ProfileTab>(initialTab)

  // Profile Info state
  const [fullName, setFullName] = useState(user.fullName || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [address, setAddress] = useState(user.address || '')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  // Orders state
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)

  // Status state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load orders when switching to orders tab
  useEffect(() => {
    if (tab === 'orders') {
      loadMyOrders()
    }
  }, [tab])

  async function loadMyOrders() {
    setLoadingOrders(true)
    setError('')
    try {
      const data = await ordersApi.getMyOrders()
      setOrders(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch sử đơn hàng.')
    } finally {
      setLoadingOrders(false)
    }
  }

  async function handleCancelOrder(orderId: number) {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId}?`)) {
      return
    }
    setCancellingOrderId(orderId)
    setError('')
    setSuccess('')
    try {
      await ordersApi.cancelOrder(orderId)
      setSuccess(`Đã hủy đơn hàng #${orderId} thành công.`)
      await loadMyOrders()
    } catch (err: any) {
      setError(err.message || 'Không thể hủy đơn hàng.')
    } finally {
      setCancellingOrderId(null)
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const updated = await authApi.updateProfile({ fullName, phone, address })
      onUserUpdated(updated)
      setSuccess('Cập nhật thông tin cá nhân thành công!')
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật thông tin.')
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp!')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword })
      setSuccess(res.message || 'Đổi mật khẩu thành công!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Đổi mật khẩu thất bại.')
    } finally {
      setLoading(false)
    }
  }

  function renderStatusBadge(status: string) {
    switch (status) {
      case 'PENDING':
        return <span className="order-badge pending"><Clock size={13} /> Chờ xác nhận</span>
      case 'CONFIRMED':
        return <span className="order-badge confirmed"><CheckCircle2 size={13} /> Đã xác nhận</span>
      case 'SHIPPING':
        return <span className="order-badge shipping"><Truck size={13} /> Đang giao hàng</span>
      case 'COMPLETED':
        return <span className="order-badge completed"><CheckCircle2 size={13} /> Hoàn thành</span>
      case 'CANCELLED':
        return <span className="order-badge cancelled"><XCircle size={13} /> Đã hủy</span>
      default:
        return <span className="order-badge">{status}</span>
    }
  }

  return (
    <div className="profile-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="profile-container" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}>
        <button className="profile-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        {/* Sidebar Header */}
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <User size={36} />
          </div>
          <h3>{user.fullName}</h3>
          <p className="profile-email-badge">{user.email}</p>
          <span className="profile-role-tag">{user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}</span>

          <div className="profile-tabs">
            <button
              className={`profile-tab-btn ${tab === 'info' ? 'active' : ''}`}
              onClick={() => { setTab('info'); setError(''); setSuccess(''); }}
            >
              <User size={18} /> Thông tin cá nhân
            </button>
            <button
              className={`profile-tab-btn ${tab === 'orders' ? 'active' : ''}`}
              onClick={() => { setTab('orders'); setError(''); setSuccess(''); }}
            >
              <Package size={18} /> Lịch sử đơn hàng
            </button>
            <button
              className={`profile-tab-btn ${tab === 'password' ? 'active' : ''}`}
              onClick={() => { setTab('password'); setError(''); setSuccess(''); }}
            >
              <KeyRound size={18} /> Đổi mật khẩu
            </button>
          </div>
        </div>

        {/* Form Body Area */}
        <div className="profile-main">
          {success && (
            <div className="profile-alert success">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="profile-alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Profile Info */}
          {tab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="profile-header">
                <h2>Thông tin cá nhân</h2>
                <p>Cập nhật chi tiết cá nhân và địa chỉ giao hàng mặc định.</p>
              </div>

              <div className="input-field">
                <label>Họ và tên</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <label>Email (Không thể thay đổi)</label>
                <div className="input-wrapper disabled">
                  <Mail className="input-icon" size={18} />
                  <input type="email" value={user.email} disabled />
                </div>
              </div>

              <div className="input-field">
                <label>Số điện thoại</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-field">
                <label>Địa chỉ giao hàng mặc định</label>
                <div className="input-wrapper textarea-wrapper">
                  <MapPin className="input-icon textarea-icon" size={18} />
                  <textarea
                    rows={3}
                    placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="profile-submit-btn" disabled={loading}>
                <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          )}

          {/* TAB 2: Order History */}
          {tab === 'orders' && (
            <div className="profile-orders-section">
              <div className="profile-header">
                <h2>Lịch sử đơn hàng</h2>
                <p>Theo dõi tiến độ giao hàng và danh sách các đơn bạn đã đặt.</p>
              </div>

              {loadingOrders ? (
                <div className="orders-loading">
                  <Loader2 size={32} className="animate-spin" />
                  <p>Đang tải danh sách đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="orders-empty">
                  <Package size={48} className="empty-icon" />
                  <h3>Chưa có đơn hàng nào</h3>
                  <p>Bạn chưa đặt mua sản phẩm nào tại Gốm Việt.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => {
                    const isPendingOrConfirmed = order.status === 'PENDING' || order.status === 'CONFIRMED'
                    const isShipping = order.status === 'SHIPPING'

                    return (
                      <article key={order.id} className="order-card">
                        <div className="order-card-header">
                          <div className="order-title-wrap">
                            <span className="order-id">Mã đơn #{order.id}</span>
                            <span className="order-date">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {renderStatusBadge(order.status)}
                        </div>

                        {/* Items list */}
                        <div className="order-items-list">
                          {order.items.map(item => (
                            <div key={item.id} className="order-item-row">
                              <img
                                src={item.productImageUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=300&q=80'}
                                alt={item.productName}
                                className="order-item-img"
                              />
                              <div className="order-item-info">
                                <h4>{item.productName}</h4>
                                <p>Số lượng: x{item.quantity}</p>
                              </div>
                              <div className="order-item-price">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Shipping & Payment Meta */}
                        <div className="order-meta-grid">
                          <div>
                            <span className="meta-label">Người nhận:</span>
                            <span className="meta-value">{order.recipientName} - {order.phone}</span>
                          </div>
                          <div>
                            <span className="meta-label">Địa chỉ:</span>
                            <span className="meta-value">{order.shippingAddress}</span>
                          </div>
                          <div>
                            <span className="meta-label">Thanh toán:</span>
                            <span className="meta-value">
                              {order.paymentProvider === 'VNPAY' ? 'VNPAY Online' : 'Thanh toán khi nhận hàng (COD)'}
                              {' '}
                              ({order.paymentStatus === 'PAID' ? 'Đã thanh toán' : order.paymentStatus === 'FAILED' ? 'Thất bại/Hủy' : 'Chưa thanh toán'})
                            </span>
                          </div>
                        </div>

                        {/* Footer & Action */}
                        <div className="order-card-footer">
                          <div className="order-total">
                            <span>Tổng thanh toán:</span>
                            <strong className="total-amount">{formatPrice(order.totalAmount)}</strong>
                          </div>

                          <div className="order-action-wrap">
                            {isPendingOrConfirmed && (
                              <button
                                className="btn-cancel-order"
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancellingOrderId === order.id}
                              >
                                {cancellingOrderId === order.id ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Đang hủy...</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={14} />
                                    <span>Hủy đơn hàng</span>
                                  </>
                                )}
                              </button>
                            )}

                            {isShipping && (
                              <span className="order-notice shipping-notice">
                                <Truck size={14} /> Shipper đã lấy hàng - Không thể hủy
                              </span>
                            )}

                            {order.status === 'COMPLETED' && (
                              <span className="order-notice completed-notice">
                                <CheckCircle2 size={14} /> Đã hoàn thành
                              </span>
                            )}

                            {order.status === 'CANCELLED' && (
                              <span className="order-notice cancelled-notice">
                                <XCircle size={14} /> Đã hủy đơn
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Change Password */}
          {tab === 'password' && (
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="profile-header">
                <h2>Đổi mật khẩu</h2>
                <p>Đảm bảo tài khoản của bạn luôn được bảo mật với mật khẩu mạnh.</p>
              </div>

              <div className="input-field">
                <label>Mật khẩu hiện tại</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pw-btn"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    aria-label="Hiện/Ẩn"
                  >
                    {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-field">
                <label>Mật khẩu mới</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pw-btn"
                    onClick={() => setShowNewPw(!showNewPw)}
                    aria-label="Hiện/Ẩn"
                  >
                    {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-field">
                <label>Xác nhận mật khẩu mới</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="profile-submit-btn" disabled={loading}>
                <KeyRound size={18} /> {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
