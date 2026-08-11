import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { cartApi, productsApi, session, type CartItemResponse, type CartResponse } from '../api/client'

// ── Guest Cart (localStorage) ────────────────────────────────────────
const GUEST_KEY = 'webgom_guest_cart'
type GuestItem = { productId: number; quantity: number }
const fallbackImage = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80'

function readGuestItems(): GuestItem[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]')
  } catch {
    return []
  }
}
function writeGuestItems(items: GuestItem[]) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items))
}
function clearGuestItems() {
  localStorage.removeItem(GUEST_KEY)
}

// ── Context Shape ────────────────────────────────────────────────────
interface CartContextValue {
  items: CartItemResponse[]
  totalQuantity: number
  totalAmount: number
  loading: boolean
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  mergeOnLogin: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within <CartProvider>')
  return ctx
}

// ── Provider ─────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemResponse[]>([])
  const [totalQuantity, setTotalQuantity] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isLoggedIn = () => !!session.accessToken()

  // ── Apply server response ──
  const applyCart = useCallback((cart: CartResponse) => {
    setItems(cart.items)
    setTotalQuantity(cart.totalQuantity)
    setTotalAmount(cart.totalAmount)
  }, [])

  // ── Build CartItemResponse from guest data + product details ──
  const buildGuestCart = useCallback(async () => {
    const guestItems = readGuestItems()
    if (guestItems.length === 0) {
      setItems([])
      setTotalQuantity(0)
      setTotalAmount(0)
      return
    }

    try {
      const ids = guestItems.map(g => g.productId)
      const products = await productsApi.batchDetails(ids)
      const mapped: CartItemResponse[] = []
      let tQty = 0
      let tAmt = 0

      for (const g of guestItems) {
        const p = products.find(pr => pr.id === g.productId)
        if (!p) continue
        const qty = Math.min(g.quantity, p.stockQuantity)
        if (qty < 1) continue
        const sub = p.price * qty
        mapped.push({
          id: -g.productId, // negative ID signals guest item
          productId: p.id,
          productName: p.name,
          productSlug: p.slug,
          productImage: p.imageUrl || fallbackImage,
          unitPrice: p.price,
          quantity: qty,
          subtotal: sub,
          stockQuantity: p.stockQuantity,
          available: p.stockQuantity >= qty,
        })
        tQty += qty
        tAmt += sub
      }

      // Sync back corrected quantities
      writeGuestItems(mapped.map(m => ({ productId: m.productId, quantity: m.quantity })))
      setItems(mapped)
      setTotalQuantity(tQty)
      setTotalAmount(tAmt)
    } catch {
      // If batch-details fails, just show what we have
    }
  }, [])

  // ── Refresh (load) cart ──
  const refreshCart = useCallback(async () => {
    setLoading(true)
    try {
      if (isLoggedIn()) {
        applyCart(await cartApi.get())
      } else {
        await buildGuestCart()
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [applyCart, buildGuestCart])

  // ── Add item ──
  const addItem = useCallback(async (productId: number, quantity = 1) => {
    if (isLoggedIn()) {
      applyCart(await cartApi.addItem(productId, quantity))
    } else {
      const guestItems = readGuestItems()
      const existing = guestItems.find(g => g.productId === productId)
      if (existing) {
        existing.quantity += quantity
      } else {
        guestItems.push({ productId, quantity })
      }
      writeGuestItems(guestItems)
      await buildGuestCart()
    }
  }, [applyCart, buildGuestCart])

  // ── Update item quantity ──
  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    if (isLoggedIn()) {
      applyCart(await cartApi.updateItem(itemId, quantity))
    } else {
      // itemId is -productId for guest items
      const productId = -itemId
      const guestItems = readGuestItems()
      const item = guestItems.find(g => g.productId === productId)
      if (item) {
        item.quantity = quantity
        writeGuestItems(guestItems)
        await buildGuestCart()
      }
    }
  }, [applyCart, buildGuestCart])

  // ── Remove item ──
  const removeItem = useCallback(async (itemId: number) => {
    if (isLoggedIn()) {
      applyCart(await cartApi.removeItem(itemId))
    } else {
      const productId = -itemId
      const guestItems = readGuestItems().filter(g => g.productId !== productId)
      writeGuestItems(guestItems)
      await buildGuestCart()
    }
  }, [applyCart, buildGuestCart])

  // ── Clear cart ──
  const clearCartFn = useCallback(async () => {
    if (isLoggedIn()) {
      applyCart(await cartApi.clear())
    } else {
      clearGuestItems()
      setItems([])
      setTotalQuantity(0)
      setTotalAmount(0)
    }
  }, [applyCart])

  // ── Merge guest cart → server after login ──
  const mergeOnLogin = useCallback(async () => {
    const guestItems = readGuestItems()
    if (guestItems.length > 0) {
      try {
        applyCart(await cartApi.merge(guestItems))
      } catch {
        // If merge fails, just load server cart
        applyCart(await cartApi.get())
      }
      clearGuestItems()
    } else {
      try {
        applyCart(await cartApi.get())
      } catch {
        // silent
      }
    }
  }, [applyCart])

  // ── Initial load ──
  useEffect(() => {
    void refreshCart()
  }, [refreshCart])

  return (
    <CartContext.Provider value={{
      items, totalQuantity, totalAmount, loading,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem, updateItem, removeItem,
      clearCart: clearCartFn,
      mergeOnLogin, refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}
