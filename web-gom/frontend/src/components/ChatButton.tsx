import {
  MessageCircle,
  X,
  Sparkles,
  Send,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { chatApi, type ChatMessage, type ChatRecommendation } from '../api/client'
import { formatPrice } from '../data/mockData'
import type { Product } from '../types'
import './ChatButton.css'

const SESSION_KEY = 'webgom_chat_session_token'

// Chén gốm 3D — nhận diện của Trợ lý Hiên Gốm
export function PotteryAiLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="bowlCeramic" x1="10" y1="17" x2="38" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE9D5" />
          <stop offset="0.32" stopColor="#E9A276" />
          <stop offset="0.7" stopColor="#B54935" />
          <stop offset="1" stopColor="#661014" />
        </linearGradient>
        <linearGradient id="bowlGlaze" x1="14" y1="15" x2="34" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF9EF" />
          <stop offset="0.55" stopColor="#FFD59A" />
          <stop offset="1" stopColor="#C96043" />
        </linearGradient>
        <linearGradient id="bowlBand" x1="13" y1="27" x2="35" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8C08E" />
          <stop offset="0.5" stopColor="#F6DEBE" />
          <stop offset="1" stopColor="#9A2D27" />
        </linearGradient>
      </defs>

      {/* Bóng đổ tạo độ nổi 3D */}
      <ellipse cx="24" cy="39" rx="14" ry="3.2" fill="#3D080B" fillOpacity="0.28" />
      {/* Thân chén */}
      <path
        d="M10.5 19.5C11.2 29.7 15.2 37 24 37C32.8 37 36.8 29.7 37.5 19.5H10.5Z"
        fill="url(#bowlCeramic)"
        stroke="#FFF4E9"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* Dải men phản sáng */}
      <path d="M12.5 26.4C16.4 24.9 19.6 28.2 24 27.2C28.3 26.2 31.2 23.8 35.4 25.6C34.5 28.2 33.2 30.6 31 32.5C25.8 35.8 17.2 34.8 14.2 30.9C13.4 29.5 12.9 27.9 12.5 26.4Z" fill="url(#bowlBand)" fillOpacity="0.9" />
      {/* Lòng chén và vành men */}
      <ellipse cx="24" cy="19.4" rx="13.6" ry="5.8" fill="url(#bowlGlaze)" stroke="#FFF8F0" strokeWidth="1.45" />
      <ellipse cx="24" cy="19.5" rx="9.4" ry="3.3" fill="#7A1E1C" fillOpacity="0.9" />
      <ellipse cx="21" cy="18.7" rx="4.8" ry="1.35" fill="#FFF7E8" fillOpacity="0.45" />
      {/* Điểm sáng trên men */}
      <path d="M14.8 22.4C15.8 28.8 18.3 31.9 20.2 32.6" stroke="#FFF5E9" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.62" />
      {/* Tia sáng AI tinh tế */}
      <path d="M38 8L39.1 11L42 12.1L39.1 13.2L38 16.2L36.9 13.2L34 12.1L36.9 11L38 8Z" fill="#FFD166" stroke="#FFF8E9" strokeWidth="0.65" />
      <circle cx="11.3" cy="13.2" r="1.4" fill="#FFD166" />
    </svg>
  )
}

interface ChatButtonProps {
  onSelectProduct?: (product: Product) => void
  products?: Product[]
}

const QUICK_PROMPTS = [
  '💜 Bộ Mùa Xuân · Ngũ sắc',
  '🌸 Bộ Mùa Hạ · Trinh nữ',
  '🥣 Gợi ý Tô, Chén, Dĩa',
  '🛡️ Gốm có dùng được lò vi sóng không?',
  '🚚 Chính sách đổi trả & vận chuyển'
]

export function ChatButton({ onSelectProduct, products = [] }: ChatButtonProps) {
  const [open, setOpen] = useState(false)
  const [sessionToken, setSessionToken] = useState<string>(() => localStorage.getItem(SESSION_KEY) || '')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasUnreadTooltip, setHasUnreadTooltip] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (open) {
      scrollToBottom()
      inputRef.current?.focus()
      setHasUnreadTooltip(false)
    }
  }, [open, messages, loading])

  // Listen for logout or session reset events
  useEffect(() => {
    const handleReset = () => {
      setSessionToken('')
      setMessages([])
    }
    window.addEventListener('webgom_chat_reset', handleReset)
    return () => window.removeEventListener('webgom_chat_reset', handleReset)
  }, [])

  // Load history on initial open if sessionToken exists
  useEffect(() => {
    if (open && sessionToken && messages.length === 0) {
      void loadHistory(sessionToken)
    }
  }, [open, sessionToken])

  async function loadHistory(token: string) {
    try {
      const history = await chatApi.getHistory(token)
      if (history && history.messages && history.messages.length > 0) {
        setMessages(history.messages)
      }
    } catch {
      // If error loading history, keep empty
    }
  }

  async function handleSend(textToSend?: string) {
    const query = (textToSend || inputVal).trim()
    if (!query || loading) return

    setInputVal('')
    const userMsg: ChatMessage = {
      role: 'user',
      content: query,
      createdAt: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      // Chỉ gửi 1 tin mới nhất + sessionToken, lịch sử lấy từ DB
      const res = await chatApi.send([{ role: 'user', content: query }], sessionToken)
      if (res.sessionToken) {
        setSessionToken(res.sessionToken)
        localStorage.setItem(SESSION_KEY, res.sessionToken)
      }

      const botMsg: ChatMessage = {
        role: 'assistant',
        content: res.answer,
        recommendations: res.recommendations || [],
        createdAt: new Date().toISOString()
      }

      setMessages([...updatedMessages, botMsg])
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Dạ, hiện tại kết nối đến trợ lý đang bị gián đoạn đôi chút. Bạn vui lòng thử lại hoặc để lại lời nhắn nhé!',
        createdAt: new Date().toISOString()
      }
      setMessages([...updatedMessages, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  function handleResetChat() {
    if (sessionToken) {
      void chatApi.clearHistory(sessionToken).catch(() => {})
    }
    localStorage.removeItem(SESSION_KEY)
    setSessionToken('')
    setMessages([])
  }

  function handleCardClick(rec: ChatRecommendation) {
    if (onSelectProduct && products.length > 0) {
      const p = products.find(prod => Number(prod.id) === Number(rec.productId))
      if (p) {
        onSelectProduct(p)
        setOpen(false)
        return
      }
    }
    // Fallback: scroll to products section
    const el = document.getElementById('products')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setOpen(false)
    }
  }

  // Simple Markdown Formatter for Assistant Messages
  function renderFormattedText(text: string) {
    const lines = text.split('\n')
    return lines.map((line, idx) => {
      // Bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g)
      return (
        <p key={idx}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx}>{part.slice(2, -2)}</strong>
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={pIdx}>{part.slice(1, -1)}</em>
            }
            return part
          })}
        </p>
      )
    })
  }

  return (
    <div className="chat-system-container">
      {/* Floating Launcher Button */}
      <button
        className={`chat-launcher-btn ${open ? 'is-active' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Trợ lý Hiên Gốm AI"
      >
        <span className="chat-online-badge" />
        {open ? <X size={26} /> : <PotteryAiLogo size={32} />}
      </button>

      {/* Floating Invitation Tooltip (shows when closed) */}
      {!open && hasUnreadTooltip && (
        <div className="chat-launcher-tooltip">
          <span>👋 Cần tư vấn chọn gốm? Chat ngay!</span>
        </div>
      )}

      {/* Chat Window Panel */}
      {open && (
        <div className="chat-window" aria-label="Cửa sổ trò chuyện Trợ lý Hiên Gốm">
          {/* Header */}
          <div className="chat-window-header">
            <div className="chat-header-brand">
              <div className="chat-avatar-container">
                <div className="chat-avatar-glow" />
                <PotteryAiLogo size={28} />
              </div>
              <div className="chat-header-info">
                <h4>
                  Trợ lý Hiên Gốm
                  <span className="chat-ai-pill">
                    <Sparkles size={10} /> AI
                  </span>
                </h4>
                <div className="chat-header-status">
                  <span className="chat-status-dot" />
                  <span>Trực tuyến · Sẵn sàng tư vấn</span>
                </div>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="btn-chat-header-action"
                title="Làm mới cuộc hội thoại"
                onClick={handleResetChat}
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="btn-chat-header-action"
                title="Đóng cửa sổ chat"
                onClick={() => setOpen(false)}
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="chat-messages-thread">
            {/* Welcome banner */}
            <div className="chat-welcome-card">
              <div className="chat-welcome-badge">
                <Sparkles size={12} />
                <span>HIÊN GỐM · BIÊN HÒA</span>
              </div>
              <p>
                Xin chào bạn! Em là <strong>Trợ lý Gốm AI</strong>. Em có thể tư vấn các mẫu tô, chén, dĩa theo <strong>Bộ sưu tập 4 mùa hoa</strong>, độ bền men khoáng và hướng dẫn sử dụng lò vi sóng.
              </p>

              {/* Quick Prompts */}
              <div className="chat-quick-prompts">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    className="chat-quick-prompt-btn"
                    onClick={() => handleSend(prompt)}
                  >
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Messages */}
            {messages.map((msg, index) => (
              <div key={index} className={`chat-msg-row ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="chat-msg-avatar">
                    <PotteryAiLogo size={18} />
                  </div>
                )}
                <div className="chat-msg-bubble">
                  {renderFormattedText(msg.content)}

                  {/* Recommendations Cards in Chat */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="chat-recommendations-box">
                      <span className="chat-rec-label">Sản phẩm gợi ý:</span>
                      {msg.recommendations.map((rec, rIdx) => (
                        <div
                          key={rIdx}
                          className="chat-rec-item"
                          onClick={() => handleCardClick(rec)}
                          style={{ cursor: 'pointer' }}
                        >
                          {rec.image && (
                            <img
                              src={rec.image}
                              alt={rec.name || 'Sản phẩm gốm'}
                              className="chat-rec-img"
                              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none' }}
                            />
                          )}
                          <div className="chat-rec-details">
                            <h5 className="chat-rec-name">{rec.name || `Sản phẩm #${rec.productId}`}</h5>
                            <div>
                              {rec.price ? (
                                <span className="chat-rec-price">{formatPrice(rec.price)}</span>
                              ) : null}
                              {rec.season && <span className="chat-rec-season">· Mùa {rec.season}</span>}
                            </div>
                          </div>
                          <button type="button" className="btn-chat-rec-view" title="Xem chi tiết">
                            <span>Xem</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.createdAt && (
                    <span className="chat-msg-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Animation Indicator */}
            {loading && (
              <div className="chat-msg-row assistant">
                <div className="chat-msg-avatar">
                  <PotteryAiLogo size={18} />
                </div>
                <div className="chat-msg-bubble">
                  <div className="chat-typing-dots">
                    <span className="chat-dot" />
                    <span className="chat-dot" />
                    <span className="chat-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="chat-window-footer">
            <form
              className="chat-input-form"
              onSubmit={(e) => {
                e.preventDefault()
                void handleSend()
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="chat-input-field"
                placeholder="Hỏi về 4 mùa hoa, dáng men, giá..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn-chat-send"
                disabled={!inputVal.trim() || loading}
                title="Gửi câu hỏi"
              >
                <Send size={16} />
              </button>
            </form>
            <p className="chat-footer-note">
              Trợ lý Hiên Gốm AI · Hỗ trợ tư vấn gốm thủ công 24/7
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
