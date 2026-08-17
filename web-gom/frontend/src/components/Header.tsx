import { Menu, Search, ShoppingBag, UserRound, LogOut, Settings, PackagePlus, Package, LayoutDashboard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AuthModal } from './AuthModal'
import { ProfileModal, type ProfileTab } from './ProfileModal'
import { AddProductModal } from './AddProductModal'
import { CartDrawer } from './CartDrawer'
import { useCart } from '../hooks/useCart'
import { authApi, session, type AuthResponse, type UserProfile } from '../api/client'
import type { Product } from '../types'

interface HeaderProps {
  onProductAdded?: () => void
  products?: Product[]
  user?: UserProfile | null
  onUserChange?: (user: UserProfile | null) => void
  onOpenAdmin?: () => void
  onOpenCheckout?: () => void
}

export function Header({
  onProductAdded,
  products = [],
  user: externalUser,
  onUserChange,
  onOpenAdmin,
  onOpenCheckout
}: HeaderProps) {
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileTab, setProfileTab] = useState<ProfileTab>('info')
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [localUser, setLocalUser] = useState<UserProfile | null>(externalUser ?? null)

  const user = externalUser !== undefined ? externalUser : localUser

  function updateUser(u: UserProfile | null) {
    setLocalUser(u)
    if (onUserChange) onUserChange(u)
  }

  const { totalQuantity, openDrawer, mergeOnLogin, refreshCart } = useCart()

  async function loadUser() {
    try {
      const me = await authApi.me()
      updateUser(me)
    } catch {
      const refresh = session.refreshToken()
      if (!refresh) {
        session.clear()
        updateUser(null)
        return
      }
      try {
        session.save(await authApi.refresh(refresh))
        const me = await authApi.me()
        updateUser(me)
      } catch {
        session.clear()
        updateUser(null)
      }
    }
  }

  useEffect(() => {
    if (session.accessToken()) {
      void loadUser()
    } else {
      updateUser(null)
    }
  }, [])

  function saveAuth(auth: AuthResponse) {
    session.save(auth)
    void loadUser()
    void mergeOnLogin()
  }

  function logout() {
    session.clear()
    updateUser(null)
    setUserMenuOpen(false)
    void refreshCart()
  }

  const isStaffOrAdmin = Boolean(user && (user.role === 'ADMIN' || user.role === 'STAFF'))

  return (
    <>
      <div className="announcement">Miễn phí giao hàng cho đơn từ 1.000.000đ</div>
      <div className="header-sticky-wrapper">
        <header className="header">
          <a className="brand-logo-link" href="#" aria-label="Hiên Gốm">
            <img src="/logo.png" alt="Hiên Gốm" className="header-logo-img" />
          </a>
          <nav>
            <a href="#about">Câu chuyện</a>
            <a href="#categories">Danh mục</a>
            <a href="#products">Sản phẩm</a>
            <a href="#policies">Chính sách</a>
          </nav>
          <div className="header-actions">
            <button aria-label="Tìm kiếm">
              <Search />
            </button>

            {isStaffOrAdmin && (
              <button
                className="btn-admin-dashboard-header"
                onClick={() => {
                  if (onOpenAdmin) onOpenAdmin()
                }}
                title="Mở Bảng điều khiển Quản trị"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  background: 'var(--brand-red, #731214)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(115, 18, 20, 0.25)'
                }}
              >
                <LayoutDashboard size={16} />
                <span>Quản trị Shop</span>
              </button>
            )}

            {user ? (
              <div className="user-menu-container" style={{ position: 'relative' }}>
                <button
                  className="auth-link user-profile-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <UserRound />
                  <span>{user.fullName}</span>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu">
                    {isStaffOrAdmin && (
                      <button
                        onClick={() => {
                          if (onOpenAdmin) onOpenAdmin()
                          setUserMenuOpen(false)
                        }}
                        style={{ color: 'var(--brand-red)', fontWeight: 700 }}
                      >
                        <LayoutDashboard size={16} /> Bảng Quản trị (Admin)
                      </button>
                    )}
                    {isStaffOrAdmin && (
                      <button
                        onClick={() => {
                          setAddProductOpen(true)
                          setUserMenuOpen(false)
                        }}
                      >
                        <PackagePlus size={16} /> Thêm sản phẩm mới
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setProfileTab('orders')
                        setProfileOpen(true)
                        setUserMenuOpen(false)
                      }}
                    >
                      <Package size={16} /> Lịch sử đơn hàng
                    </button>
                    <button
                      onClick={() => {
                        setProfileTab('info')
                        setProfileOpen(true)
                        setUserMenuOpen(false)
                      }}
                    >
                      <Settings size={16} /> Thông tin cá nhân
                    </button>
                    <button onClick={logout} className="logout-btn">
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="auth-link auth-login-btn" onClick={() => setAuthOpen(true)}>
                <span className="auth-login-icon" aria-hidden="true">
                  <UserRound size={18} />
                </span>
                <span>Đăng nhập</span>
              </button>
            )}

            <button aria-label="Giỏ hàng" onClick={openDrawer} style={{ position: 'relative' }}>
              <ShoppingBag />
              {totalQuantity > 0 && (
                <span className="cart-badge" style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--brand-red, #731214)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(115, 18, 20, 0.4)'
                }}>
                  {totalQuantity}
                </span>
              )}
            </button>
            <button className="mobile-menu" aria-label="Menu">
              <Menu />
            </button>
          </div>
        </header>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuthenticated={saveAuth} />}

      {profileOpen && user && (
        <ProfileModal
          user={user}
          initialTab={profileTab}
          onClose={() => setProfileOpen(false)}
          onUserUpdated={updated => updateUser(updated)}
        />
      )}

      {addProductOpen && (
        <AddProductModal
          onClose={() => setAddProductOpen(false)}
          onProductCreated={() => {
            if (onProductAdded) onProductAdded()
          }}
        />
      )}

      <CartDrawer
        onRequireAuth={() => setAuthOpen(true)}
        onOpenCheckout={() => {
          if (onOpenCheckout) onOpenCheckout()
        }}
      />
    </>
  )
}
