import { useState, useEffect } from 'react'
import {
  X,
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Search,
  Edit3,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  FileText,
  DollarSign,
  ArrowUpRight,
  BarChart3,
  Flame,
  CreditCard,
  Calendar,
  ShieldAlert,
  PieChart,
  Layers,
  Sparkles
} from 'lucide-react'
import type { Product } from '../types'
import { formatPrice } from '../data/mockData'
import { staffApi, productsApi, type DashboardStats, type OrderResponse, type LowStockProduct } from '../api/client'
import { EditProductModal } from './EditProductModal'
import { AddProductModal } from './AddProductModal'
import './AdminDashboardModal.css'

interface AdminDashboardModalProps {
  onClose: () => void
  onProductsChanged: () => void
  products: Product[]
}

type TabType = 'stats' | 'orders' | 'products'

export function AdminDashboardModal({
  onClose,
  onProductsChanged,
  products
}: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('stats')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL')
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [productSearchQuery, setProductSearchQuery] = useState('')

  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Modals inside admin
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderResponse | null>(null)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [statsData, ordersData] = await Promise.all([
        staffApi.getDashboardStats().catch(() => null),
        staffApi.getOrders(selectedStatusFilter).catch(() => [])
      ])
      if (statsData) setStats(statsData)
      setOrders(ordersData || [])
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu quản trị.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [selectedStatusFilter])

  async function handleStatusChange(orderId: number, newStatus: string) {
    setActionLoading(orderId)
    setError('')
    try {
      const updated = await staffApi.updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
      setSuccessMsg(`Đã cập nhật trạng thái đơn hàng #${orderId} thành "${getStatusLabel(newStatus)}"`)
      setTimeout(() => setSuccessMsg(''), 3000)
      void staffApi.getDashboardStats().then(s => setStats(s)).catch(() => {})
    } catch (err: any) {
      setError(err.message || 'Cập nhật trạng thái thất bại')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa/ẩn sản phẩm "${product.name}" khỏi cửa hàng?`)) {
      return
    }
    setError('')
    try {
      await productsApi.delete(product.id)
      setSuccessMsg(`Đã xóa sản phẩm "${product.name}"`)
      setTimeout(() => setSuccessMsg(''), 3000)
      onProductsChanged()
    } catch (err: any) {
      setError(err.message || 'Xóa sản phẩm thất bại')
    }
  }

  function handleEditLowStockProduct(lsp: LowStockProduct) {
    const fullProd = products.find(p => p.id === lsp.id)
    if (fullProd) {
      setEditingProduct(fullProd)
    } else {
      setEditingProduct({
        id: lsp.id,
        name: lsp.name,
        category: 'Hiên Gốm',
        price: lsp.price,
        image: lsp.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
        stockQuantity: lsp.stockQuantity
      })
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý'
      case 'CONFIRMED': return 'Đã xác nhận'
      case 'SHIPPING': return 'Đang giao'
      case 'COMPLETED': return 'Hoàn thành'
      case 'CANCELLED': return 'Đã hủy'
      default: return status
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'PENDING': return 'badge-pending'
      case 'CONFIRMED': return 'badge-confirmed'
      case 'SHIPPING': return 'badge-shipping'
      case 'COMPLETED': return 'badge-completed'
      case 'CANCELLED': return 'badge-cancelled'
      default: return ''
    }
  }

  // Filter orders by search query
  const filteredOrders = orders.filter(o => {
    const q = orderSearchQuery.toLowerCase()
    return (
      o.id.toString().includes(q) ||
      o.recipientName?.toLowerCase().includes(q) ||
      o.phone?.includes(q) ||
      o.shippingAddress?.toLowerCase().includes(q)
    )
  })

  // Filter products by search query
  const filteredProducts = products.filter(p => {
    const q = productSearchQuery.toLowerCase()
    return (
      p.id.toString().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.itemType?.toLowerCase().includes(q) ||
      p.flowerType?.toLowerCase().includes(q) ||
      p.season?.toLowerCase().includes(q)
    )
  })

  // Calculate daily chart heights
  const dailyRevenues = stats?.dailyRevenues || []
  const maxDailyRevenue = Math.max(...dailyRevenues.map(d => d.revenue), 1)

  // Payment totals
  const vnpayRev = stats?.vnpayRevenue || 0
  const codRev = stats?.codRevenue || 0
  const totalPayRev = vnpayRev + codRev || 1
  const vnpayPercent = Math.round((vnpayRev / totalPayRev) * 100)
  const codPercent = 100 - vnpayPercent

  // Status totals
  const totalStatusOrders = (stats?.totalOrders && stats.totalOrders > 0) ? stats.totalOrders : 1

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="admin-modal-container" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-header-title-group">
            <div className="admin-icon-box">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h2>Hệ Thống Quản Trị Hiên Gốm</h2>
              <span className="admin-role-badge">Dành cho Admin & Staff</span>
            </div>
          </div>

          <div className="admin-header-actions">
            <button className="admin-btn-refresh" onClick={loadData} disabled={loading} title="Tải lại dữ liệu">
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
              <span>Tải lại</span>
            </button>
            <button className="admin-close-btn" onClick={onClose} aria-label="Đóng">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Global Alerts */}
        {successMsg && (
          <div className="admin-alert success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="admin-alert error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Main Tab Navigation */}
        <div className="admin-tab-nav">
          <button
            className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <TrendingUp size={18} />
            <span>Thống kê & Báo cáo</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} />
            <span>Quản lý Đơn hàng ({stats?.totalOrders ?? orders.length})</span>
            {stats && stats.pendingOrders > 0 && (
              <span className="tab-counter-badge">{stats.pendingOrders}</span>
            )}
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} />
            <span>Quản lý Sản phẩm ({products.length})</span>
          </button>
        </div>

        {/* Tab 1: Stats & Overview */}
        {activeTab === 'stats' && (
          <div className="admin-tab-content stats-view">
            {/* 4 Metric Cards */}
            <div className="admin-metrics-grid">
              <div className="metric-card card-revenue">
                <div className="metric-icon-wrap">
                  <DollarSign size={24} />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Tổng doanh thu hiệu lực</span>
                  <strong className="metric-value">
                    {formatPrice(stats?.totalRevenue ?? 0)}
                  </strong>
                  <div className="metric-sub-pills">
                    <span className="metric-sub-tag">Tháng này: <strong>{formatPrice(stats?.thisMonthRevenue ?? 0)}</strong></span>
                    <span className="metric-sub-tag">Hôm nay: <strong>{formatPrice(stats?.todayRevenue ?? 0)}</strong></span>
                  </div>
                </div>
              </div>

              <div className="metric-card card-orders">
                <div className="metric-icon-wrap">
                  <ShoppingBag size={24} />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Tổng số đơn hàng</span>
                  <strong className="metric-value">{stats?.totalOrders ?? 0}</strong>
                  <div className="metric-sub-pills">
                    <span className="metric-sub-tag pending">{stats?.pendingOrders ?? 0} chờ duyệt</span>
                    <span className="metric-sub-tag completed">{stats?.completedOrders ?? 0} hoàn thành</span>
                  </div>
                </div>
              </div>

              <div className="metric-card card-customers">
                <div className="metric-icon-wrap">
                  <Users size={24} />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Khách hàng thành viên</span>
                  <strong className="metric-value">{stats?.totalCustomers ?? 0}</strong>
                  <span className="metric-sub">Tài khoản đã đăng ký</span>
                </div>
              </div>

              <div className="metric-card card-products">
                <div className="metric-icon-wrap">
                  <Package size={24} />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Sản phẩm đang bán</span>
                  <strong className="metric-value">{stats?.totalProducts ?? products.length}</strong>
                  <span className="metric-sub alert-sub">
                    {stats?.lowStockProducts ?? 0} sản phẩm sắp hết kho (≤ 5)
                  </span>
                </div>
              </div>
            </div>

            {/* 7-Day Revenue Trend Chart */}
            <div className="admin-panel revenue-chart-panel">
              <div className="panel-header">
                <div className="panel-title-with-icon">
                  <BarChart3 size={20} className="panel-header-icon" />
                  <div>
                    <h3>Biểu đồ Doanh thu 7 ngày gần nhất</h3>
                    <span className="panel-subtitle">Dữ liệu doanh thu từ đơn hàng xác nhận & hoàn tất</span>
                  </div>
                </div>
                <div className="chart-legend">
                  <span className="legend-dot revenue" /> <span>Doanh thu (VNĐ)</span>
                </div>
              </div>

              <div className="revenue-chart-container">
                {dailyRevenues.length === 0 ? (
                  <p className="empty-text">Chưa có dữ liệu giao dịch trong 7 ngày qua.</p>
                ) : (
                  <div className="chart-bars-wrapper">
                    {dailyRevenues.map((day, idx) => {
                      const heightPercent = maxDailyRevenue > 0
                        ? Math.max(Math.round((day.revenue / maxDailyRevenue) * 100), 8)
                        : 8
                      return (
                        <div key={idx} className="chart-bar-column">
                          <div className="chart-bar-tooltip">
                            <span className="tooltip-date">{day.date}</span>
                            <strong className="tooltip-rev">{formatPrice(day.revenue)}</strong>
                            <span className="tooltip-orders">{day.orderCount} đơn hàng</span>
                          </div>
                          <div className="chart-bar-track">
                            <div
                              className="chart-bar-fill"
                              style={{ height: `${heightPercent}%` }}
                            >
                              <span className="chart-bar-val">
                                {day.revenue > 0 ? (day.revenue >= 1000000 ? `${(day.revenue / 1000000).toFixed(1)}Tr` : `${(day.revenue / 1000).toFixed(0)}k`) : ''}
                              </span>
                            </div>
                          </div>
                          <span className="chart-bar-label">{day.date}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Grid 2 Columns: Payment Breakdown & Order Status Pipeline */}
            <div className="admin-overview-columns">
              {/* Payment Method Analytics */}
              <div className="admin-panel">
                <div className="panel-header">
                  <div className="panel-title-with-icon">
                    <CreditCard size={19} className="panel-header-icon" />
                    <h3>Phương thức thanh toán</h3>
                  </div>
                </div>

                <div className="payment-analytics-box">
                  <div className="payment-ratio-bar">
                    <div className="ratio-segment vnpay" style={{ width: `${vnpayPercent}%` }} title={`VNPAY: ${vnpayPercent}%`} />
                    <div className="ratio-segment cod" style={{ width: `${codPercent}%` }} title={`COD: ${codPercent}%`} />
                  </div>

                  <div className="payment-cards-row">
                    <div className="payment-method-card vnpay">
                      <div className="pm-header">
                        <span className="pm-badge vnpay">VNPAY Online</span>
                        <strong>{vnpayPercent}%</strong>
                      </div>
                      <div className="pm-body">
                        <span className="pm-rev">{formatPrice(vnpayRev)}</span>
                        <span className="pm-count">{stats?.vnpayOrdersCount ?? 0} đơn hàng qua VNPAY</span>
                      </div>
                    </div>

                    <div className="payment-method-card cod">
                      <div className="pm-header">
                        <span className="pm-badge cod">COD Tiền mặt</span>
                        <strong>{codPercent}%</strong>
                      </div>
                      <div className="pm-body">
                        <span className="pm-rev">{formatPrice(codRev)}</span>
                        <span className="pm-count">{stats?.codOrdersCount ?? 0} đơn hàng nhận tiền mặt</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Pipeline */}
              <div className="admin-panel">
                <div className="panel-header">
                  <div className="panel-title-with-icon">
                    <Layers size={19} className="panel-header-icon" />
                    <h3>Tiến độ & Phân bổ đơn hàng</h3>
                  </div>
                </div>

                <div className="status-progress-list">
                  <div className="status-progress-item">
                    <span className="status-dot pending" />
                    <span className="status-name">Chờ xử lý (PENDING)</span>
                    <span className="status-percent">
                      {Math.round(((stats?.pendingOrders ?? 0) / totalStatusOrders) * 100)}%
                    </span>
                    <strong>{stats?.pendingOrders ?? 0} đơn</strong>
                  </div>
                  <div className="status-progress-item">
                    <span className="status-dot confirmed" />
                    <span className="status-name">Đã xác nhận (CONFIRMED)</span>
                    <span className="status-percent">
                      {Math.round(((stats?.confirmedOrders ?? 0) / totalStatusOrders) * 100)}%
                    </span>
                    <strong>{stats?.confirmedOrders ?? 0} đơn</strong>
                  </div>
                  <div className="status-progress-item">
                    <span className="status-dot shipping" />
                    <span className="status-name">Đang giao hàng (SHIPPING)</span>
                    <span className="status-percent">
                      {Math.round(((stats?.shippingOrders ?? 0) / totalStatusOrders) * 100)}%
                    </span>
                    <strong>{stats?.shippingOrders ?? 0} đơn</strong>
                  </div>
                  <div className="status-progress-item">
                    <span className="status-dot completed" />
                    <span className="status-name">Giao thành công (COMPLETED)</span>
                    <span className="status-percent">
                      {Math.round(((stats?.completedOrders ?? 0) / totalStatusOrders) * 100)}%
                    </span>
                    <strong>{stats?.completedOrders ?? 0} đơn</strong>
                  </div>
                  <div className="status-progress-item">
                    <span className="status-dot cancelled" />
                    <span className="status-name">Đã hủy (CANCELLED)</span>
                    <span className="status-percent">
                      {Math.round(((stats?.cancelledOrders ?? 0) / totalStatusOrders) * 100)}%
                    </span>
                    <strong>{stats?.cancelledOrders ?? 0} đơn</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2 Columns: Top Selling Products & Low Stock Inventory */}
            <div className="admin-overview-columns">
              {/* Top Selling Products */}
              <div className="admin-panel">
                <div className="panel-header">
                  <div className="panel-title-with-icon">
                    <Flame size={19} className="panel-header-icon hot" />
                    <h3>Top Sản Phẩm Bán Chạy</h3>
                  </div>
                </div>

                <div className="top-selling-list">
                  {!stats?.topSellingProducts || stats.topSellingProducts.length === 0 ? (
                    <p className="empty-text">Chưa có dữ liệu bán hàng.</p>
                  ) : (
                    stats.topSellingProducts.map((p, idx) => (
                      <div key={p.productId} className="top-product-item">
                        <div className={`rank-badge rank-${idx + 1}`}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </div>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.productName} className="top-product-img" />
                        ) : (
                          <div className="top-product-img-fallback"><Package size={20} /></div>
                        )}
                        <div className="top-product-info">
                          <strong className="top-product-name">{p.productName}</strong>
                          <span className="top-product-meta">Đã bán: <strong>{p.totalQuantitySold}</strong> sản phẩm</span>
                        </div>
                        <div className="top-product-rev">
                          {formatPrice(p.totalRevenue)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Low Stock Warning */}
              <div className="admin-panel">
                <div className="panel-header">
                  <div className="panel-title-with-icon">
                    <ShieldAlert size={19} className="panel-header-icon warn" />
                    <h3>Cảnh Báo Tồn Kho Thấp (≤ 5)</h3>
                  </div>
                  <button className="panel-link-btn" onClick={() => setActiveTab('products')}>
                    Quản lý kho →
                  </button>
                </div>

                <div className="low-stock-list">
                  {!stats?.lowStockProductList || stats.lowStockProductList.length === 0 ? (
                    <div className="good-stock-notice">
                      <CheckCircle2 size={24} className="good-icon" />
                      <div>
                        <strong>Kho hàng đang ở trạng thái tốt!</strong>
                        <span>Không có sản phẩm nào có số lượng dưới mức an toàn (5).</span>
                      </div>
                    </div>
                  ) : (
                    stats.lowStockProductList.map(lsp => (
                      <div key={lsp.id} className="low-stock-item">
                        {lsp.imageUrl ? (
                          <img src={lsp.imageUrl} alt={lsp.name} className="low-stock-img" />
                        ) : (
                          <div className="low-stock-img-fallback"><Package size={20} /></div>
                        )}
                        <div className="low-stock-info">
                          <strong className="low-stock-name">{lsp.name}</strong>
                          <span className="low-stock-price">{formatPrice(lsp.price)}</span>
                        </div>
                        <div className="low-stock-action-wrap">
                          <span className={`stock-badge ${lsp.stockQuantity <= 0 ? 'out' : 'low'}`}>
                            {lsp.stockQuantity <= 0 ? 'Hết hàng' : `Còn ${lsp.stockQuantity} cái`}
                          </span>
                          <button
                            className="btn-quick-restock"
                            onClick={() => handleEditLowStockProduct(lsp)}
                            title="Chỉnh sửa tồn kho"
                          >
                            <Edit3 size={13} />
                            <span>Cập nhật</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders Mini List */}
            <div className="admin-panel full-width-panel">
              <div className="panel-header">
                <div className="panel-title-with-icon">
                  <Clock size={19} className="panel-header-icon" />
                  <h3>Đơn hàng mới nhận gần đây</h3>
                </div>
                <button className="panel-link-btn" onClick={() => setActiveTab('orders')}>
                  Xem tất cả đơn hàng →
                </button>
              </div>
              <div className="recent-orders-mini-list">
                {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                  <p className="empty-text">Chưa có đơn hàng nào.</p>
                ) : (
                  stats.recentOrders.slice(0, 6).map(o => (
                    <div key={o.id} className="mini-order-row">
                      <div className="mini-order-left">
                        <strong className="mini-order-id">#{o.id}</strong>
                        <span className="mini-order-customer">{o.recipientName} ({o.phone})</span>
                        <span className="mini-order-time">
                          ({new Date(o.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })})
                        </span>
                      </div>
                      <div className="mini-order-right">
                        <span className={`payment-pill ${o.paymentStatus === 'PAID' ? 'paid' : 'unpaid'}`}>
                          {o.paymentProvider === 'VNPAY' ? 'VNPAY' : 'COD'}
                        </span>
                        <span className={`status-pill-badge ${getStatusBadgeClass(o.status)}`}>
                          {getStatusLabel(o.status)}
                        </span>
                        <strong className="mini-order-price">{formatPrice(o.totalAmount)}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Management */}
        {activeTab === 'orders' && (
          <div className="admin-tab-content orders-view">
            {/* Status Filter Bar & Search */}
            <div className="admin-toolbar">
              <div className="status-filter-pills">
                {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map(s => (
                  <button
                    key={s}
                    className={`status-filter-pill ${selectedStatusFilter === s ? 'active' : ''}`}
                    onClick={() => setSelectedStatusFilter(s)}
                  >
                    {s === 'ALL' ? 'Tất cả đơn' : getStatusLabel(s)}
                  </button>
                ))}
              </div>

              <div className="admin-search-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên khách, SĐT..."
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Ngày đặt</th>
                    <th>Khách hàng & SĐT</th>
                    <th>Địa chỉ nhận</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật tiến độ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="table-empty-td">
                        Không tìm thấy đơn hàng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <strong>#{order.id}</strong>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </td>
                        <td>
                          <div className="table-customer-cell">
                            <strong>{order.recipientName}</strong>
                            <span>{order.phone}</span>
                          </div>
                        </td>
                        <td className="table-address-cell">
                          <span>{order.shippingAddress}</span>
                        </td>
                        <td>
                          <button
                            className="btn-view-items"
                            onClick={() => setSelectedOrderDetail(order)}
                          >
                            <Eye size={14} />
                            <span>{order.items?.length || 0} món</span>
                          </button>
                        </td>
                        <td>
                          <strong className="table-price">{formatPrice(order.totalAmount)}</strong>
                        </td>
                        <td>
                          <span className={`payment-pill ${order.paymentStatus === 'PAID' ? 'paid' : 'unpaid'}`}>
                            {order.paymentProvider === 'VNPAY' ? 'VNPAY' : 'COD'} · {order.paymentStatus === 'PAID' ? 'Đã TT' : 'Chưa TT'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill-badge ${getStatusBadgeClass(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td>
                          <select
                            className="status-select-action"
                            value={order.status}
                            disabled={actionLoading === order.id}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="CONFIRMED">Xác nhận đơn</option>
                            <option value="SHIPPING">Đang giao hàng</option>
                            <option value="COMPLETED">Hoàn tất</option>
                            <option value="CANCELLED">Hủy đơn</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Products Management */}
        {activeTab === 'products' && (
          <div className="admin-tab-content products-view">
            {/* Products Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-search-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Tìm theo tên sản phẩm, hoa, mùa, thể loại..."
                  value={productSearchQuery}
                  onChange={e => setProductSearchQuery(e.target.value)}
                />
              </div>

              <button
                className="btn-admin-add-product"
                onClick={() => setAddProductOpen(true)}
              >
                <Plus size={18} />
                <span>+ Thêm sản phẩm mới</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Thể loại</th>
                    <th>Họa tiết Hoa</th>
                    <th>Mùa</th>
                    <th>Giá bán</th>
                    <th>Kho hàng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-empty-td">
                        Không tìm thấy sản phẩm nào.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.image} alt={p.name} className="table-product-thumb" />
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          <span className="table-product-id">#{p.id}</span>
                        </td>
                        <td>{p.itemType || '—'}</td>
                        <td>{p.flowerType ? `🌸 ${p.flowerType}` : '—'}</td>
                        <td>{p.season ? `🍃 Mùa ${p.season}` : '—'}</td>
                        <td>
                          <strong className="table-price">{formatPrice(p.price)}</strong>
                        </td>
                        <td>
                          <span className={`stock-badge ${((p.stockQuantity ?? 10) <= 0) ? 'out' : ((p.stockQuantity ?? 10) <= 5) ? 'low' : 'good'}`}>
                            {p.stockQuantity ?? 10} cái
                          </span>
                        </td>
                        <td>
                          <div className="table-actions-row">
                            <button
                              className="btn-action-edit"
                              onClick={() => setEditingProduct(p)}
                              title="Sửa sản phẩm"
                            >
                              <Edit3 size={15} />
                              <span>Sửa</span>
                            </button>
                            <button
                              className="btn-action-delete"
                              onClick={() => handleDeleteProduct(p)}
                              title="Xóa/Ẩn sản phẩm"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: View Order Items Detail */}
        {selectedOrderDetail && (
          <div className="order-detail-popup-backdrop" onClick={() => setSelectedOrderDetail(null)}>
            <div className="order-detail-popup" onClick={e => e.stopPropagation()}>
              <div className="order-detail-popup-header">
                <h3>Chi tiết đơn hàng #{selectedOrderDetail.id}</h3>
                <button onClick={() => setSelectedOrderDetail(null)} aria-label="Đóng">
                  <X size={18} />
                </button>
              </div>

              <div className="order-detail-popup-body">
                <div className="popup-info-summary">
                  <p><strong>Người nhận:</strong> {selectedOrderDetail.recipientName} ({selectedOrderDetail.phone})</p>
                  <p><strong>Địa chỉ:</strong> {selectedOrderDetail.shippingAddress}</p>
                  <p>
                    <strong>Trạng thái:</strong>{' '}
                    <span className={`status-pill-badge ${getStatusBadgeClass(selectedOrderDetail.status)}`}>
                      {getStatusLabel(selectedOrderDetail.status)}
                    </span>
                  </p>
                </div>

                <div className="popup-items-list">
                  <h4>Danh sách sản phẩm ({selectedOrderDetail.items?.length || 0}):</h4>
                  {selectedOrderDetail.items?.map(item => (
                    <div key={item.id} className="popup-item-row">
                      {item.productImageUrl && (
                        <img src={item.productImageUrl} alt={item.productName} className="popup-item-img" />
                      )}
                      <div className="popup-item-info">
                        <strong>{item.productName}</strong>
                        <span>Số lượng: {item.quantity} × {formatPrice(item.unitPrice)}</span>
                      </div>
                      <strong className="popup-item-total">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="popup-total-row">
                  <span>Tổng tiền thanh toán:</span>
                  <strong>{formatPrice(selectedOrderDetail.totalAmount)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Modal: Add Product */}
        {addProductOpen && (
          <AddProductModal
            onClose={() => setAddProductOpen(false)}
            onProductCreated={() => {
              onProductsChanged()
              void loadData()
            }}
          />
        )}

        {/* Sub-Modal: Edit Product */}
        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onProductUpdated={() => {
              onProductsChanged()
              void loadData()
            }}
          />
        )}
      </section>
    </div>
  )
}
