export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
  description?: string;
  stockQuantity?: number;
  slug?: string;
  materials?: string;
  dimensions?: string;
  origin?: string;
  careInstructions?: string;
  itemType?: 'Tô' | 'Chén' | 'Dĩa' | string;
  flowerType?: 'Dã quỳ' | 'Cúc trắng' | 'Trinh nữ' | 'Ngũ sắc' | string;
  season?: 'Xuân' | 'Hạ' | 'Thu' | 'Đông' | string;
};

export type Category = {
  id: string;
  season: 'Xuân' | 'Hạ' | 'Thu' | 'Đông' | string;
  flower: string;
  flowerIcon: string;
  name: string;
  meaning: string;
  description: string;
  image: string;
};
