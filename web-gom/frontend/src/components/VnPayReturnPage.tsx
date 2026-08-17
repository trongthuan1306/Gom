import React, { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2, ArrowLeft, ShoppingBag } from 'lucide-react'
import { paymentsApi, type VnPayReturnResult } from '../api/client'
import { formatPrice } from '../data/mockData'
import './VnPayReturnPage.css'

interface VnPayReturnPageProps {
  onBackToHome: () => void;
}

export function VnPayReturnPage({ onBackToHome }: VnPayReturnPageProps) {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<VnPayReturnResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const search = window.location.search;
    if (!search) {
      setError('Không tìm thấy thông tin phản hồi từ VNPAY.')
      setLoading(false)
      return
    }

    paymentsApi.verifyVnPayReturn(search)
      .then(res => {
        setResult(res)
      })
      .catch(err => {
        setError(err.message || 'Xác minh giao dịch VNPAY thất bại')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="vnpay-return-container">
        <div className="vnpay-return-card">
          <div className="vnpay-icon-badge loading">
            <Loader2 size={40} className="animate-spin" />
          </div>
          <h1 className="vnpay-return-title">Đang xác minh giao dịch...</h1>
          <p className="vnpay-return-desc">Vui lòng chờ trong giây lát để hệ thống kiểm tra chữ ký VNPAY.</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="vnpay-return-container">
        <div className="vnpay-return-card">
          <div className="vnpay-icon-badge failed">
            <XCircle size={40} />
          </div>
          <h1 className="vnpay-return-title">Xác minh thất bại</h1>
          <p className="vnpay-return-desc">{error || 'Có lỗi xảy ra trong quá trình xác minh VNPAY.'}</p>

          <div className="vnpay-btn-group">
            <button className="vnpay-btn-primary" onClick={onBackToHome}>
              <ArrowLeft size={18} />
              <span>Quay về Trang chủ</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="vnpay-return-container">
      <div className="vnpay-return-card">
        {result.success ? (
          <>
            <div className="vnpay-icon-badge success">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="vnpay-return-title">Thanh toán Thành công! 🎉</h1>
            <p className="vnpay-return-desc">Cảm ơn bạn đã tin tưởng lựa chọn Hiên Gốm. Đơn hàng của bạn đang được xử lý.</p>

            <div className="vnpay-details-table">
              <div className="vnpay-detail-row">
                <span>Mã đơn hàng</span>
                <span>#{result.orderId}</span>
              </div>
              <div className="vnpay-detail-row">
                <span>Tổng tiền đã thanh toán</span>
                <span style={{ color: 'var(--brand-red, #731214)', fontWeight: 700 }}>{formatPrice(result.totalAmount)}</span>
              </div>
              <div className="vnpay-detail-row">
                <span>Cổng thanh toán</span>
                <span>VNPAY Online</span>
              </div>
              <div className="vnpay-detail-row">
                <span>Trạng thái</span>
                <span style={{ color: '#16A34A' }}>Đã xác nhận thanh toán</span>
              </div>
            </div>

            <div className="vnpay-btn-group">
              <button className="vnpay-btn-primary" onClick={onBackToHome}>
                <ShoppingBag size={18} />
                <span>Tiếp tục mua sắm</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="vnpay-icon-badge failed">
              <XCircle size={40} />
            </div>
            <h1 className="vnpay-return-title">Thanh toán không thành công</h1>
            <p className="vnpay-return-desc">{result.message}</p>

            <div className="vnpay-details-table">
              <div className="vnpay-detail-row">
                <span>Mã đơn hàng</span>
                <span>#{result.orderId}</span>
              </div>
              <div className="vnpay-detail-row">
                <span>Mã lỗi VNPAY</span>
                <span>{result.responseCode}</span>
              </div>
            </div>

            <div className="vnpay-btn-group">
              <button className="vnpay-btn-primary" onClick={onBackToHome}>
                <ArrowLeft size={18} />
                <span>Quay về Trang chủ</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
