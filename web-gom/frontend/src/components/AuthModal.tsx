import { useState } from 'react'
import { X, Eye, EyeOff, Mail, Lock, User, ArrowLeft, KeyRound, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react'
import { authApi, type AuthResponse } from '../api/client'
import './AuthModal.css'

type Mode = 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password'

export function AuthModal({ onClose, onAuthenticated }: { onClose: () => void; onAuthenticated: (auth: AuthResponse) => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [otp, setOtp] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  function resetFormState() {
    setError('')
    setSuccessMsg('')
    setOtp('')
    setPassword('')
    setNewPassword('')
  }

  function switchMode(newMode: Mode) {
    resetFormState()
    setMode(newMode)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const auth = await authApi.login({ email, password })
      onAuthenticated(auth)
      onClose()
    } catch (err: any) {
      if (err.message?.includes('xác thực email')) {
        setError(err.message || 'Tài khoản chưa xác thực email. Mã OTP đã được gửi đến email của bạn.')
        switchMode('verify-email')
      } else {
        setError(err.message || 'Email hoặc mật khẩu không chính xác.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.register({ fullName, email, password })
      setSuccessMsg(res.message)
      switchMode('verify-email')
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const auth = await authApi.verifyEmail(email, otp)
      onAuthenticated(auth)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendOtp() {
    if (!email) return
    setError('')
    setResending(true)
    try {
      const res = await authApi.resendVerification(email)
      setSuccessMsg(res.message || 'Mã OTP mới đã được gửi tới email của bạn.')
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại mã OTP.')
    } finally {
      setResending(false)
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(email)
      setSuccessMsg(res.message)
      switchMode('reset-password')
    } catch (err: any) {
      setError(err.message || 'Gửi yêu cầu thất bại.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.resetPassword(email, otp, newPassword)
      setSuccessMsg(res.message + ' Bạn có thể đăng nhập ngay bây giờ.')
      switchMode('login')
    } catch (err: any) {
      setError(err.message || 'Đặt lại mật khẩu thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="auth-container" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        {/* Side Banner with Artistic Pottery Imagery */}
        <div className="auth-banner">
          <div className="auth-banner-overlay" />
          <div className="auth-banner-content">
            <span className="auth-badge"><Sparkles size={14} /> Gốm Thủ Công Việt</span>
            <h3>Nét Đẹp Mộc Mạc,<br />Giữ Trọn An Yên</h3>
            <p>Khám phá bộ sưu tập gốm tuyển chọn từ những nghệ nhân tâm huyết khắp Việt Nam.</p>
          </div>
        </div>

        {/* Auth Form Area */}
        <div className="auth-content">
          {(mode === 'forgot-password' || mode === 'reset-password' || mode === 'verify-email') && (
            <button className="auth-back-btn" onClick={() => switchMode('login')}>
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </button>
          )}

          <div className="auth-header">
            <p className="eyebrow">Tài khoản Gốm Việt</p>
            <h2>
              {mode === 'login' && 'Đăng nhập'}
              {mode === 'register' && 'Đăng ký tài khoản'}
              {mode === 'verify-email' && 'Xác thực Email'}
              {mode === 'forgot-password' && 'Quên mật khẩu'}
              {mode === 'reset-password' && 'Đặt lại mật khẩu'}
            </h2>
            <p className="auth-subtitle">
              {mode === 'login' && 'Chào mừng bạn quay trở lại với không gian Gốm Việt.'}
              {mode === 'register' && 'Tạo tài khoản để trải nghiệm dịch vụ mua sắm độc bản.'}
              {mode === 'verify-email' && `Vui lòng nhập mã OTP 6 chữ số vừa được gửi đến ${email}`}
              {mode === 'forgot-password' && 'Nhập email đăng ký của bạn để nhận mã OTP khôi phục.'}
              {mode === 'reset-password' && 'Nhập mã OTP và mật khẩu mới cho tài khoản của bạn.'}
            </p>
          </div>

          {successMsg && (
            <div className="auth-alert success">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="auth-alert error">
              <span>{error}</span>
            </div>
          )}

          {/* Mode 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="input-field">
                <label>Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="vidu@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <div className="label-row">
                  <label>Mật khẩu</label>
                  <button type="button" className="forgot-link" onClick={() => switchMode('forgot-password')}>
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Hiện/ẩn mật khẩu"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
          )}

          {/* Mode 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="input-field">
                <label>Họ và tên</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <label>Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="vidu@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 8 ký tự"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Hiện/ẩn mật khẩu"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
              </button>
            </form>
          )}

          {/* Mode 3: VERIFY EMAIL */}
          {mode === 'verify-email' && (
            <form onSubmit={handleVerifyEmail} className="auth-form">
              <div className="input-field">
                <label>Mã xác thực OTP (6 chữ số)</label>
                <div className="input-wrapper">
                  <KeyRound className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className="otp-input"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={loading || otp.length < 6}>
                {loading ? 'Đang xác thực...' : 'Xác thực & Đăng nhập'}
              </button>

              <div className="resend-row">
                <span>Chưa nhận được mã?</span>
                <button type="button" className="resend-btn" onClick={handleResendOtp} disabled={resending}>
                  <RefreshCw size={14} className={resending ? 'spin' : ''} /> {resending ? 'Đang gửi...' : 'Gửi lại mã'}
                </button>
              </div>
            </form>
          )}

          {/* Mode 4: FORGOT PASSWORD */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="auth-form">
              <div className="input-field">
                <label>Email tài khoản</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="vidu@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? 'Đang gửi mã...' : 'Nhận mã OTP khôi phục'}
              </button>
            </form>
          )}

          {/* Mode 5: RESET PASSWORD */}
          {mode === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="input-field">
                <label>Mã OTP khôi phục (6 chữ số)</label>
                <div className="input-wrapper">
                  <KeyRound className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className="otp-input"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <label>Mật khẩu mới</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Hiện/ẩn mật khẩu"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={loading || otp.length < 6}>
                {loading ? 'Đang đổi mật khẩu...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}

          {/* Footer Switcher */}
          {(mode === 'login' || mode === 'register') && (
            <p className="auth-switch">
              {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
