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
  userId: string;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string | null;
    role: string;
  };
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
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

