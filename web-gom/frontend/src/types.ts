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
};

export type Category = {
  name: string;
  description: string;
  image: string;
};
