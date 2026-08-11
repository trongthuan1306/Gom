import type { Category, Product } from '../types'

const pottery = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=900&q=80`

export const categories: Category[] = [
  {
    name: 'Gốm gia dụng',
    description: 'Bát, đĩa, ly và bộ bàn ăn cho mỗi ngày.',
    image: pottery('photo-1610701596007-11502861dcfa'),
  },
  {
    name: 'Gốm trang trí',
    description: 'Bình hoa và vật phẩm tạo điểm nhấn riêng.',
    image: pottery('photo-1578749556568-bc2c40e68b61'),
  },
  {
    name: 'Gốm quà tặng',
    description: 'Món quà thủ công chỉn chu và giàu ý nghĩa.',
    image: pottery('photo-1616627561950-9f746e330187'),
  },
]

export const products: Product[] = [
  {
    id: 1,
    name: 'Bộ trà men tro An Nhiên',
    category: 'Gốm gia dụng',
    price: 890000,
    image: pottery('photo-1565193566173-7a0ee3dbe261'),
    badge: 'Nổi bật',
  },
  {
    id: 2,
    name: 'Bình hoa men hỏa biến',
    category: 'Gốm trang trí',
    price: 1250000,
    image: pottery('photo-1611486212557-88be5ff6f941'),
    badge: 'Mới',
  },
  {
    id: 3,
    name: 'Bộ bát đĩa Mộc 12 món',
    category: 'Gốm gia dụng',
    price: 1490000,
    image: pottery('photo-1586023492125-27b2c045efd7'),
  },
  {
    id: 4,
    name: 'Tượng gốm Sen Việt',
    category: 'Gốm quà tặng',
    price: 620000,
    image: pottery('photo-1493106641515-6b5631de4bb9'),
  },
  {
    id: 5,
    name: 'Ấm trà Bát Tràng cổ',
    category: 'Gốm gia dụng',
    price: 750000,
    image: pottery('photo-1605000797499-95a51c5269ae'),
    badge: 'Bán chạy',
  },
  {
    id: 6,
    name: 'Chén men ngọc Biên Hòa',
    category: 'Gốm gia dụng',
    price: 320000,
    image: pottery('photo-1615484477778-ca3b77940c25'),
  },
  {
    id: 7,
    name: 'Bình gốm đất nung mộc',
    category: 'Gốm trang trí',
    price: 980000,
    image: pottery('photo-1612198188060-c7c2a3b66eae'),
    badge: 'Mới',
  },
  {
    id: 8,
    name: 'Bộ ly sứ men rạn',
    category: 'Gốm quà tặng',
    price: 450000,
    image: pottery('photo-1610701596061-2ecf227e85b2'),
  },
]

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
