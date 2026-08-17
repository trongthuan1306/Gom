import type {Product} from '../types'
const API_BASE_URL=import.meta.env.VITE_API_BASE_URL??'http://localhost:8080/api'; const ACCESS='accessToken',REFRESH='refreshToken',EXPIRES='accessTokenExpiresAt'
export class ApiError extends Error{constructor(public readonly status:number,message:string){super(message)}}

export type AuthResponse={accessToken:string;refreshToken:string;expiresIn:number;tokenType:string};
export type UserProfile={id:number;fullName:string;email:string;phone?:string;address?:string;role:'CUSTOMER'|'STAFF'|'ADMIN'};
export type RegisterRequest={fullName:string;email:string;password:string};
export type LoginRequest={email:string;password:string};
export type UpdateProfileRequest={fullName:string;phone?:string;address?:string};
export type ChangePasswordRequest={currentPassword:string;newPassword:string};
export type MessageResponse={message:string};
export type ChatRecommendation = {
  productId: number;
  reason: string;
  name?: string;
  price?: number;
  image?: string;
  season?: string;
  itemType?: string;
};
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  recommendations?: ChatRecommendation[];
  createdAt?: string;
};
export type ChatResponse = {
  sessionToken: string;
  answer: string;
  recommendations: ChatRecommendation[];
};
export type ChatHistoryResponse = {
  sessionToken: string;
  title: string;
  messages: ChatMessage[];
};

// ── Cart Types ──────────────────────────────────────────────────────
export type CartItemResponse = {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  stockQuantity: number;
  available: boolean;
};
export type CartResponse = {
  items: CartItemResponse[];
  totalQuantity: number;
  totalAmount: number;
};

// ── Location & Order & Payment Types ─────────────────────────────────
export type ProvinceResponse = { code: string; name: string; fullName: string };
export type WardResponse = { code: string; name: string; fullName: string; provinceCode: string };

export type CheckoutRequest = {
  recipientName: string;
  phone: string;
  provinceCode: string;
  wardCode: string;
  detailAddress: string;
  paymentMethod: 'COD' | 'VNPAY';
  notes?: string;
};

export type CheckoutResponse = {
  orderId: number;
  status: string;
  paymentMethod: string;
  paymentUrl?: string | null;
  totalAmount: number;
  message: string;
};

export type OrderItemResponse = {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
};

export type OrderResponse = {
  id: number;
  status: string;
  recipientName: string;
  phone: string;
  shippingAddress: string;
  totalAmount: number;
  createdAt: string;
  paymentProvider?: string;
  paymentStatus?: string;
  items: OrderItemResponse[];
};

export type VnPayReturnResult = {
  orderId: number;
  totalAmount: number;
  responseCode: string;
  success: boolean;
  message: string;
};

export const session={
  accessToken:()=>localStorage.getItem(ACCESS),
  refreshToken:()=>localStorage.getItem(REFRESH),
  save:(auth:AuthResponse)=>{
    localStorage.setItem(ACCESS,auth.accessToken);
    localStorage.setItem(REFRESH,auth.refreshToken);
    localStorage.setItem(EXPIRES,String(Date.now()+auth.expiresIn*1000))
  },
  clear:()=>{
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(EXPIRES);
    localStorage.removeItem('webgom_chat_session_token');
    window.dispatchEvent(new CustomEvent('webgom_chat_reset'));
  }
}

async function request<T>(path:string,options:RequestInit={},token=session.accessToken()):Promise<T>{
  const response=await fetch(`${API_BASE_URL}${path}`,{
    ...options,
    headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}),...options.headers}
  });
  if(!response.ok){
    let errorText = response.statusText;
    try {
      const rawText = await response.text();
      try {
        const errJson = JSON.parse(rawText);
        errorText = errJson.message || errorText;
      } catch {
        if (rawText) errorText = rawText;
      }
    } catch {
      // ignore
    }
    throw new ApiError(response.status, errorText);
  }
  return response.json() as Promise<T>
}

export const authApi={
  register:(body:RegisterRequest)=>request<MessageResponse>('/auth/register',{method:'POST',body:JSON.stringify(body)},undefined),
  verifyEmail:(email:string,otp:string)=>request<AuthResponse>('/auth/verify-email',{method:'POST',body:JSON.stringify({email,otp})},undefined),
  resendVerification:(email:string)=>request<MessageResponse>('/auth/resend-verification',{method:'POST',body:JSON.stringify({email})},undefined),
  login:(body:{email:string;password:string})=>request<AuthResponse>('/auth/login',{method:'POST',body:JSON.stringify(body)},undefined),
  forgotPassword:(email:string)=>request<MessageResponse>('/auth/forgot-password',{method:'POST',body:JSON.stringify({email})},undefined),
  resetPassword:(email:string,otp:string,newPassword:string)=>request<MessageResponse>('/auth/reset-password',{method:'POST',body:JSON.stringify({email,otp,newPassword})},undefined),
  refresh:(refreshToken:string)=>request<AuthResponse>('/auth/refresh',{method:'POST',body:JSON.stringify({refreshToken})},undefined),
  me:()=>request<UserProfile>('/auth/me'),
  updateProfile:(body:UpdateProfileRequest)=>request<UserProfile>('/auth/profile',{method:'PUT',body:JSON.stringify(body)}),
  changePassword:(body:ChangePasswordRequest)=>request<MessageResponse>('/auth/change-password',{method:'PUT',body:JSON.stringify(body)})
}

type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  materials: string | null;
  dimensions: string | null;
  origin: string | null;
  careInstructions: string | null;
  itemType: string | null;
  flowerType: string | null;
  season: string | null;
};
const fallbackImage='https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80';

export const productsApi={
  list:async()=>{
    const products=await request<ApiProduct[]>('/products');
    return products.map(product=>({
      id:product.id,
      name:product.name,
      category:'Hiên Gốm',
      price:product.price,
      image:product.imageUrl||fallbackImage,
      description:product.description||undefined,
      stockQuantity:product.stockQuantity,
      slug:product.slug,
      materials:product.materials||undefined,
      dimensions:product.dimensions||undefined,
      origin:product.origin||undefined,
      careInstructions:product.careInstructions||undefined,
      itemType:product.itemType||undefined,
      flowerType:product.flowerType||undefined,
      season:product.season||undefined
    } as Product))
  },

  batchDetails: async (ids: number[]): Promise<ApiProduct[]> => {
    return request<ApiProduct[]>('/products/batch-details', {
      method: 'POST',
      body: JSON.stringify({ ids })
    }, undefined);
  },

  getById: async (id: number): Promise<Product> => {
    const product = await request<ApiProduct>(`/products/${id}`, {}, undefined);
    return {
      id: product.id,
      name: product.name,
      category: 'Hiên Gốm',
      price: product.price,
      image: product.imageUrl || fallbackImage,
      description: product.description || undefined,
      stockQuantity: product.stockQuantity,
      slug: product.slug,
      materials: product.materials || undefined,
      dimensions: product.dimensions || undefined,
      origin: product.origin || undefined,
      careInstructions: product.careInstructions || undefined,
      itemType: product.itemType || undefined,
      flowerType: product.flowerType || undefined,
      season: product.season || undefined
    };
  },

  create:async(productData:{name:string;price:number;stockQuantity:number;description?:string;materials?:string;dimensions?:string;origin?:string;careInstructions?:string;itemType?:string;flowerType?:string;season?:string}, imageFile?:File):Promise<Product>=>{
    const formData = new FormData();
    const productBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
    formData.append('product', productBlob);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const token = session.accessToken();
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      let errorText = response.statusText;
      try {
        const rawText = await response.text();
        if (rawText) {
          try {
            const errJson = JSON.parse(rawText);
            errorText = errJson.message || errJson.error || rawText;
          } catch {
            errorText = rawText;
          }
        }
      } catch {
        // fallback to statusText
      }

      if (response.status === 401 || response.status === 403) {
        errorText = 'Bạn cần đăng nhập tài khoản Quản trị (Admin) hoặc Nhân viên (Staff) để thêm sản phẩm.';
      }
      throw new ApiError(response.status, errorText);
    }

    const created = (await response.json()) as ApiProduct;
    return {
      id: created.id,
      name: created.name,
      category: 'Hiên Gốm',
      price: created.price,
      image: created.imageUrl || fallbackImage,
      description: created.description || undefined,
      stockQuantity: created.stockQuantity,
      slug: created.slug,
      materials: created.materials || undefined,
      dimensions: created.dimensions || undefined,
      origin: created.origin || undefined,
      careInstructions: created.careInstructions || undefined,
      itemType: created.itemType || undefined,
      flowerType: created.flowerType || undefined,
      season: created.season || undefined
    };
  },

  update: async (
    id: number,
    productData: {
      name: string;
      price: number;
      stockQuantity: number;
      description?: string;
      materials?: string;
      dimensions?: string;
      origin?: string;
      careInstructions?: string;
      itemType?: string;
      flowerType?: string;
      season?: string;
    },
    imageFile?: File
  ): Promise<Product> => {
    const formData = new FormData();
    const productBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
    formData.append('product', productBlob);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const token = session.accessToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      let errorText = response.statusText;
      try {
        const rawText = await response.text();
        if (rawText) {
          try {
            const errJson = JSON.parse(rawText);
            errorText = errJson.message || errJson.error || rawText;
          } catch {
            errorText = rawText;
          }
        }
      } catch {
        // fallback
      }

      if (response.status === 401 || response.status === 403) {
        errorText = 'Bạn không có quyền chỉnh sửa sản phẩm này.';
      }
      throw new ApiError(response.status, errorText);
    }

    const updated = (await response.json()) as ApiProduct;
    return {
      id: updated.id,
      name: updated.name,
      category: 'Hiên Gốm',
      price: updated.price,
      image: updated.imageUrl || fallbackImage,
      description: updated.description || undefined,
      stockQuantity: updated.stockQuantity,
      slug: updated.slug,
      materials: updated.materials || undefined,
      dimensions: updated.dimensions || undefined,
      origin: updated.origin || undefined,
      careInstructions: updated.careInstructions || undefined,
      itemType: updated.itemType || undefined,
      flowerType: updated.flowerType || undefined,
      season: updated.season || undefined
    };
  },

  delete: async (id: number): Promise<void> => {
    const token = session.accessToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      let errorText = response.statusText;
      try {
        const rawText = await response.text();
        if (rawText) {
          try {
            const errJson = JSON.parse(rawText);
            errorText = errJson.message || errJson.error || rawText;
          } catch {
            errorText = rawText;
          }
        }
      } catch {
        // fallback
      }
      throw new ApiError(response.status, errorText);
    }
  }
}

// ── Cart API ────────────────────────────────────────────────────────
export const cartApi = {
  get: () => request<CartResponse>('/cart'),
  addItem: (productId: number, quantity: number) =>
    request<CartResponse>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateItem: (itemId: number, quantity: number) =>
    request<CartResponse>(`/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeItem: (itemId: number) =>
    request<CartResponse>(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clear: () =>
    request<CartResponse>('/cart', { method: 'DELETE' }),
  merge: (items: { productId: number; quantity: number }[]) =>
    request<CartResponse>('/cart/merge', { method: 'POST', body: JSON.stringify({ items }) }),
};

// ── Location & Order & Payment API ──────────────────────────────────
export const categoriesApi = {
  list: () => request<Category[] | any[]>('/categories', {}, undefined),
  create: (body: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number | string, body: any) => request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number | string) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

export const locationsApi = {
  getProvinces: (q?: string) => request<ProvinceResponse[]>(`/locations/provinces${q ? `?q=${encodeURIComponent(q)}` : ''}`, {}, undefined),
  getWards: (provinceCode: string, q?: string) => request<WardResponse[]>(`/locations/provinces/${provinceCode}/wards${q ? `?q=${encodeURIComponent(q)}` : ''}`, {}, undefined),
};

export const ordersApi = {
  checkout: (body: CheckoutRequest) => request<CheckoutResponse>('/orders/checkout', { method: 'POST', body: JSON.stringify(body) }),
  getMyOrders: () => request<OrderResponse[]>('/orders'),
  getOrderById: (id: number) => request<OrderResponse>(`/orders/${id}`),
  cancelOrder: (id: number) => request<OrderResponse>(`/orders/${id}/cancel`, { method: 'PUT' }),
};

export const paymentsApi = {
  verifyVnPayReturn: (queryString: string) => request<VnPayReturnResult>(`/payments/vnpay-return${queryString}`, {}, undefined),
};

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopSellingProduct {
  productId: number;
  productName: string;
  imageUrl?: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  imageUrl?: string;
  price: number;
  stockQuantity: number;
}

export interface DashboardStats {
  totalRevenue: number;
  todayRevenue?: number;
  thisMonthRevenue?: number;
  totalOrders: number;
  todayOrders?: number;
  thisMonthOrders?: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  codOrdersCount?: number;
  vnpayOrdersCount?: number;
  codRevenue?: number;
  vnpayRevenue?: number;
  dailyRevenues?: DailyRevenue[];
  topSellingProducts?: TopSellingProduct[];
  lowStockProductList?: LowStockProduct[];
  recentOrders: OrderResponse[];
}

export const chatApi = {
  send: (messages: ChatMessage[], sessionToken?: string) =>
    request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, sessionToken: sessionToken || undefined }),
    }),
  getHistory: (sessionToken: string) =>
    request<ChatHistoryResponse>(`/chat/history/${encodeURIComponent(sessionToken)}`),
  clearHistory: (sessionToken: string) =>
    request<void>(`/chat/history/${encodeURIComponent(sessionToken)}`, {
      method: 'DELETE',
    }),
};

export const staffApi = {
  status: () => request<{ scope: string; status: string }>('/staff/status'),
  getOrders: (status?: string) => request<OrderResponse[]>(`/staff/orders${status && status !== 'ALL' ? `?status=${status}` : ''}`),
  getOrderById: (id: number) => request<OrderResponse>(`/staff/orders/${id}`),
  updateOrderStatus: (id: number, status: string) => request<OrderResponse>(`/staff/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getDashboardStats: () => request<DashboardStats>('/staff/dashboard/stats'),
};

export const adminApi = { status: () => request<{ scope: string; status: string }>('/admin/status') }

// ── Categories API (DB-backed) ──────────────────────────────────────
type CategoryResponse = {
  id: number;
  name: string;
  slug: string;
  description: string;
  season: string;
  flower: string;
  flowerIcon: string;
  meaning: string;
  imageUrl: string;
};

type CategoryRequest = {
  name: string;
  slug?: string;
  description?: string;
  season?: string;
  flower?: string;
  flowerIcon?: string;
  meaning?: string;
  imageUrl?: string;
};

function mapCategoryResponse(c: CategoryResponse) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    season: c.season || '',
    flower: c.flower || '',
    flowerIcon: c.flowerIcon || '',
    meaning: c.meaning || '',
    image: c.imageUrl || '',
    imageUrl: c.imageUrl || '',
  };
}

export const categoriesApi = {
  list: async () => {
    const data = await request<CategoryResponse[]>('/categories');
    return (data || []).map(mapCategoryResponse);
  },
  create: async (payload: CategoryRequest) => {
    const data = await request<CategoryResponse>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapCategoryResponse(data);
  },
  update: async (id: string | number, payload: CategoryRequest) => {
    const data = await request<CategoryResponse>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapCategoryResponse(data);
  },
  delete: (id: string | number) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
};
