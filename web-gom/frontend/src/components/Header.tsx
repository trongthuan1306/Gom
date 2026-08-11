import { Menu, Search, ShoppingBag, UserRound, LogOut, Settings, PackagePlus, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AuthModal } from './AuthModal'
import { ProfileModal, type ProfileTab } from './ProfileModal'
import { AddProductModal } from './AddProductModal'
import { CartDrawer } from './CartDrawer'
import { CheckoutModal } from './CheckoutModal'
import { useCart } from '../hooks/useCart'
import { authApi, session, type AuthResponse, type UserProfile } from '../api/client'

export function Header({ onProductAdded }: { onProductAdded?: () => void }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileTab, setProfileTab] = useState<ProfileTab>('info')
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)

  const { totalQuantity, openDrawer, mergeOnLogin, refreshCart } = useCart()

  async function loadUser() {
    try {
      setUser(await authApi.me())
    } catch {
      const refresh = session.refreshToken()
      if (!refresh) return session.clear()
      try {
        session.save(await authApi.refresh(refresh))
        setUser(await authApi.me())
      } catch {
        session.clear()
      }
    }
  }

  useEffect(() => {
    if (session.accessToken()) void loadUser()
  }, [])

  function saveAuth(auth: AuthResponse) {
    session.save(auth)
    void loadUser()
    void mergeOnLogin()
  }

  function logout() {
    session.clear()
    setUser(null)
    setUserMenuOpen(false)
    void refreshCart()
  }

  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF'

  return (
    <>
      <div className="announcement">Miễn phí giao hàng cho đơn từ 1.000.000đ</div>
      <header className="header">
        <a className="logo" href="#">
          GỐM<span>VIỆT</span>
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
              className="btn-add-product-header"
              onClick={() => setAddProductOpen(true)}
              title="Thêm sản phẩm mới"
            >
              <PackagePlus size={18} />
              <span>Thêm sản phẩm</span>
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
            <button className="auth-link" onClick={() => setAuthOpen(true)}>
              <UserRound /> Đăng nhập
            </button>
          )}

          <button aria-label="Giỏ hàng" onClick={openDrawer} style={{ position: 'relative' }}>
            <ShoppingBag />
            {totalQuantity > 0 && (
              <span className="cart-badge" style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#c86d3b',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuthenticated={saveAuth} />}

      {profileOpen && user && (
        <ProfileModal
          user={user}
          initialTab={profileTab}
          onClose={() => setProfileOpen(false)}
          onUserUpdated={updated => setUser(updated)}
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
        onOpenCheckout={() => setCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  )
}

