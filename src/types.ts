export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  category: string;
  verified: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  products?: Product[];
  productsCount?: number;
  subscription?: {
    id: string;
    planId: string;
    plan?: SubscriptionPlan;
  };
  subscriptionUsage?: {
    planName: string;
    productLimit: number;
    currentProducts: number;
    remaining: number;
    isLimitReached: boolean;
  };
  _count?: {
    products: number;
  };
}

export function getShopProductCount(shop?: Shop | null, catalogProducts?: Product[]): number {
  if (!shop) return 0;
  if (typeof shop.productsCount === 'number' && shop.productsCount > 0) return shop.productsCount;
  if (typeof shop.subscriptionUsage?.currentProducts === 'number' && shop.subscriptionUsage.currentProducts > 0) return shop.subscriptionUsage.currentProducts;
  if (Array.isArray(shop.products) && shop.products.length > 0) return shop.products.length;
  if (typeof shop._count?.products === 'number' && shop._count.products > 0) return shop._count.products;
  if (catalogProducts && Array.isArray(catalogProducts)) {
    const matchCount = catalogProducts.filter((p) => {
      if (p.shopId === shop.id || p.shop?.id === shop.id) return true;
      if (p.shop?.name && shop.name && p.shop.name.trim().toLowerCase() === shop.name.trim().toLowerCase()) return true;
      return false;
    }).length;
    if (matchCount > 0) return matchCount;
  }
  if (typeof shop.productsCount === 'number') return shop.productsCount;
  if (typeof shop.subscriptionUsage?.currentProducts === 'number') return shop.subscriptionUsage.currentProducts;
  if (typeof shop._count?.products === 'number') return shop._count.products;
  if (Array.isArray(shop.products)) return shop.products.length;
  return 0;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  shopId: string;
  shop?: {
    id: string;
    name: string;
    ownerName?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    city?: string;
    category?: string;
    verified?: boolean;
    rating?: number;
  };
  specs?: Record<string, string>;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalShops: number;
  verifiedShops: number;
  pendingShops: number;
  totalProducts: number;
  totalLeads: number;
  totalUsers: number;
}

export interface UserAccount {
  id: string;
  email: string | null;
  name: string;
  phone: string | null;
  role: 'customer' | 'seller' | 'admin' | string;
  createdAt: string;
  updatedAt?: string;
  shop?: {
    id: string;
    name: string;
    city: string;
    category: string;
    verified: boolean;
  } | null;
}

export interface ActivityLogItem {
  id: string;
  userId?: string | null;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string | null;
    phone?: string | null;
    role: string;
  } | null;
}



export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  productLimit: number;
  status: 'ACTIVE' | 'INACTIVE' | string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    subscriptions: number;
  };
}

export interface SpecificationRule {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | string;
  required?: boolean;
  options?: string;
  placeholder?: string;
  filterable?: boolean;
  unit?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  image?: string | null;
  specConfig?: SpecificationRule[];
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: string;
  name: string;
  logo?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products: number;
  };
}

