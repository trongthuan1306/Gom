/**
 * Smooth Fly-to-Cart Animation Utility
 * Clones the product image and flies it into the cart icon in the header.
 */
export function flyToCart(
  imgSrc: string,
  startElemOrRect: HTMLElement | DOMRect | { x: number; y: number; width?: number; height?: number }
) {
  // Find cart icon in the header
  const cartIcon = document.querySelector('[aria-label="Giỏ hàng"]') as HTMLElement | null
  if (!cartIcon) return

  let startX = window.innerWidth / 2
  let startY = window.innerHeight / 2
  let startW = 80
  let startH = 80

  if ('getBoundingClientRect' in startElemOrRect) {
    const rect = startElemOrRect.getBoundingClientRect()
    startX = rect.left
    startY = rect.top
    startW = Math.min(rect.width || 80, 120)
    startH = Math.min(rect.height || 80, 120)
  } else if ('left' in startElemOrRect && 'top' in startElemOrRect) {
    const rect = startElemOrRect as DOMRect
    startX = rect.left
    startY = rect.top
    startW = Math.min(rect.width || 80, 120)
    startH = Math.min(rect.height || 80, 120)
  } else if ('x' in startElemOrRect && 'y' in startElemOrRect) {
    startX = startElemOrRect.x
    startY = startElemOrRect.y
    startW = startElemOrRect.width || 80
    startH = startElemOrRect.height || 80
  }

  const cartRect = cartIcon.getBoundingClientRect()
  const targetX = cartRect.left + cartRect.width / 2 - 16
  const targetY = cartRect.top + cartRect.height / 2 - 16

  // Create flying ghost element
  const ghost = document.createElement('div')
  ghost.className = 'fly-to-cart-ghost'
  ghost.style.position = 'fixed'
  ghost.style.left = `${startX}px`
  ghost.style.top = `${startY}px`
  ghost.style.width = `${startW}px`
  ghost.style.height = `${startH}px`
  ghost.style.borderRadius = '50%'
  ghost.style.overflow = 'hidden'
  ghost.style.boxShadow = '0 16px 36px rgba(115, 18, 20, 0.5), 0 0 0 3px #ffffff'
  ghost.style.zIndex = '999999'
  ghost.style.pointerEvents = 'none'
  ghost.style.transition = 'all 1.15s cubic-bezier(0.22, 0.85, 0.25, 1)'
  ghost.style.transformOrigin = 'center center'

  const img = document.createElement('img')
  img.src = imgSrc || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80'
  img.style.width = '100%'
  img.style.height = '100%'
  img.style.objectFit = 'cover'
  ghost.appendChild(img)

  document.body.appendChild(ghost)

  // Force reflow
  void ghost.offsetWidth

  // Execute animation (slower, clearly visible flight path)
  requestAnimationFrame(() => {
    ghost.style.left = `${targetX}px`
    ghost.style.top = `${targetY}px`
    ghost.style.width = '28px'
    ghost.style.height = '28px'
    ghost.style.opacity = '0.7'
    ghost.style.transform = 'scale(0.35) rotate(720deg)'
  })

  // When animation finishes
  setTimeout(() => {
    if (ghost.parentNode) {
      ghost.parentNode.removeChild(ghost)
    }
    // Bump cart icon
    cartIcon.classList.add('cart-bump-animation')
    setTimeout(() => {
      cartIcon.classList.remove('cart-bump-animation')
    }, 500)
  }, 1150)
}
