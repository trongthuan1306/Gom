import type { Category, Product } from '../types'

export const categories: Category[] = []

export const products: Product[] = []

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
