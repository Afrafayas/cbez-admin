export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  category: string;
  profileImage?: string;
  verified: boolean;
  verificationStatus?: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  products?: Product[];
  productsCount?: number;
  subscription?: {
    id: string;
    planId: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    plan?: SubscriptionPlan;
    createdAt?: string;
  };
  queuedSubscriptions?: any[];
  isSubscriptionExpired?: boolean;
  subscriptionUsage?: {
    planName: string;
    productLimit: number;
    currentProducts: number;
    remaining: number;
    isLimitReached: boolean;
    durationDays?: number;
    startDate?: string;
    endDate?: string;
    isExpired?: boolean;
    daysRemaining?: number;
    isExpiringSoon?: boolean;
    queuedPlan?: any;
    canAddProduct?: boolean;
    expirationMessage?: string | null;
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

export function getProductImages(product?: Product | null): string[] {
  if (!product) return [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }
  if (typeof (product as any).images === 'string') {
    try {
      const parsed = JSON.parse((product as any).images);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  if ((product as any).imagesJson) {
    try {
      const parsed = JSON.parse((product as any).imagesJson);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return [];
}

export function normalizeProduct(product: any): Product {
  if (!product) return product;

  // 1. Resolve specs from specs, specsJson, or string
  let specs: Record<string, any> = {};
  if (product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)) {
    specs = { ...product.specs };
  } else if (typeof product.specs === 'string') {
    try {
      const parsed = JSON.parse(product.specs);
      if (parsed && typeof parsed === 'object') specs = parsed;
    } catch (e) {}
  }

  if (Object.keys(specs).length === 0 && (product.specsJson || (product as any).specs_json)) {
    const rawSpecsJson = product.specsJson || (product as any).specs_json;
    try {
      const parsed = typeof rawSpecsJson === 'string' ? JSON.parse(rawSpecsJson) : rawSpecsJson;
      if (parsed && typeof parsed === 'object') specs = parsed;
    } catch (e) {}
  }

  // 2. Resolve conditionInfo from conditionInfo, conditionJson, or string
  let conditionInfo: Record<string, any> = {};
  if (product.conditionInfo && typeof product.conditionInfo === 'object' && !Array.isArray(product.conditionInfo)) {
    conditionInfo = { ...product.conditionInfo };
  } else if (typeof product.conditionInfo === 'string') {
    try {
      const parsed = JSON.parse(product.conditionInfo);
      if (parsed && typeof parsed === 'object') conditionInfo = parsed;
    } catch (e) {}
  }

  if (Object.keys(conditionInfo).length === 0 && (product.conditionJson || (product as any).condition_json)) {
    const rawCondJson = product.conditionJson || (product as any).condition_json;
    try {
      const parsed = typeof rawCondJson === 'string' ? JSON.parse(rawCondJson) : rawCondJson;
      if (parsed && typeof parsed === 'object') conditionInfo = parsed;
    } catch (e) {}
  }

  // 3. Resolve images
  const images = getProductImages(product);

  // Helper to extract values from specs case-insensitively
  const findSpec = (keys: string[]): string | undefined => {
    for (const key of keys) {
      if (specs[key] !== undefined && specs[key] !== null && String(specs[key]).trim() !== '') {
        return String(specs[key]).trim();
      }
      const norm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [sk, sv] of Object.entries(specs)) {
        if (sk.toLowerCase().replace(/[^a-z0-9]/g, '') === norm && sv !== undefined && sv !== null && String(sv).trim() !== '') {
          return String(sv).trim();
        }
      }
    }
    return undefined;
  };

  // Resolve top-level device attributes from specs or conditionInfo
  const condition =
    product.condition ||
    conditionInfo.condition ||
    findSpec(['Condition', 'condition', 'Device Condition']);

  const batteryHealth =
    product.batteryHealth ||
    conditionInfo.batteryHealth ||
    findSpec(['Battery Health', 'batteryHealth', 'Battery Percentage', 'Battery', 'battery']);

  const warranty =
    product.warranty ||
    conditionInfo.warrantyStatus ||
    findSpec(['Warranty', 'warranty', 'Warranty Status', 'Store Warranty']);

  const deviceAge =
    product.deviceAge ||
    conditionInfo.usageDuration ||
    (conditionInfo.purchaseYear ? `Purchased in ${conditionInfo.purchaseYear}` : undefined) ||
    findSpec(['Device Age', 'deviceAge', 'Age', 'Usage Duration']);

  const storage = product.storage || findSpec(['Storage', 'storage', 'ROM', 'Internal Storage', 'Storage Capacity']);
  const ram = product.ram || findSpec(['RAM', 'ram', 'Ram', 'Memory']);
  const color = product.color || findSpec(['Color', 'color', 'Colour']);
  const network = product.network || findSpec(['Network (5G/4G)', 'Network', 'network']);
  const simType = product.simType || findSpec(['SIM Type', 'simType', 'SIM']);
  const includedItems = product.includedItems || findSpec(['Included Items', 'includedItems', 'Accessories']);

  // Resolve offerPrice
  let offerPrice = product.offerPrice;
  if (offerPrice === undefined || offerPrice === null || isNaN(Number(offerPrice))) {
    const rawOffer = findSpec(['offerPrice', 'Offer Price', 'offer_price']);
    if (rawOffer && !isNaN(Number(rawOffer))) {
      offerPrice = Number(rawOffer);
    }
  }

  // Backfill specs map so any renderer reading specs receives these values
  if (storage && !specs['Storage'] && !specs['storage']) specs['Storage'] = storage;
  if (ram && !specs['RAM'] && !specs['ram']) specs['RAM'] = ram;
  if (batteryHealth && !specs['Battery Health'] && !specs['batteryHealth']) specs['Battery Health'] = batteryHealth;
  if (warranty && !specs['Warranty'] && !specs['warranty']) specs['Warranty'] = warranty;
  if (condition && !specs['Condition'] && !specs['condition']) specs['Condition'] = condition;
  if (color && !specs['Color'] && !specs['color']) specs['Color'] = color;
  if (network && !specs['Network (5G/4G)'] && !specs['network']) specs['Network (5G/4G)'] = network;
  if (simType && !specs['SIM Type'] && !specs['simType']) specs['SIM Type'] = simType;

  return {
    ...product,
    id: product.id || product._id || '',
    name: product.name || '',
    brand: product.brand || '',
    category: product.category || '',
    description: product.description || '',
    price: Number(product.price) || 0,
    offerPrice: offerPrice !== undefined ? Number(offerPrice) : undefined,
    stock: typeof product.stock === 'number' ? product.stock : Number(product.stock) || 0,
    isSoldOut: Boolean(product.isSoldOut || (typeof product.stock === 'number' && product.stock <= 0)),
    storage,
    ram,
    color,
    batteryHealth,
    warranty,
    condition,
    deviceAge,
    network,
    simType,
    includedItems,
    specs,
    conditionInfo,
    images: images.length > 0 ? images : (product.images || []),
    shopId: product.shopId || product.shop?.id || '',
    shop: product.shop,
    createdAt: product.createdAt || '',
    updatedAt: product.updatedAt || '',
  };
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  offerPrice?: number;
  stock: number;
  isSoldOut?: boolean;
  deviceAge?: string;
  includedItems?: string;
  condition?: string;
  warranty?: string;
  batteryHealth?: string;
  storage?: string;
  ram?: string;
  color?: string;
  network?: string;
  simType?: string;
  conditionInfo?: {
    condition?: string;
    batteryHealth?: string;
    warrantyStatus?: string;
    purchaseYear?: number;
    usageDuration?: string;
    repairHistory?: string;
    replacedParts?: string;
    originalBox?: boolean;
    originalInvoice?: boolean;
    includedAccessories?: string[];
    defects?: string;
    sellerNotes?: string;
    [key: string]: any;
  };
  shopId: string;
  shop?: {
    id: string;
    name: string;
    ownerName?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    city?: string;
    district?: string;
    category?: string;
    verified?: boolean;
    rating?: number;
  };
  specs?: Record<string, any>;
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
  totalRevenue?: number;
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
  durationDays?: number;
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

export interface Transaction {
  id: string;
  shopId: string;
  shop?: {
    id: string;
    name: string;
    ownerName?: string;
    phone?: string;
    category?: string;
    profileImage?: string | null;
    city?: string;
  } | null;
  planId?: string | null;
  plan?: SubscriptionPlan | null;
  planName?: string | null;
  amount: number;
  paymentStatus: 'COMPLETED' | 'PENDING' | 'FAILED' | string;
  type: 'INITIAL_VERIFICATION' | 'PLAN_CHANGE' | 'RENEWAL' | 'MANUAL' | string;
  transactionMode?: string | null;
  transactionId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionFilter {
  shopId?: string;
  type?: string;
  paymentStatus?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface RevenueStats {
  totalRevenue: number;
  totalTransactions: number;
  completedTransactions: number;
  statusBreakdown?: { paymentStatus: string; _count: { id: number }; _sum: { amount: number } }[];
  typeBreakdown?: { type: string; _count: { id: number }; _sum: { amount: number } }[];
}



export interface MlxDetails {
  id?: string;
  platformName: string;
  website: string;
  websiteLink?: string;
  supportPhone: string;
  phone?: string;
  supportEmail: string;
  email?: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  details?: string | null;
  image: string;
  type: 'banner' | 'ads';
  shopId?: string | null;
  shop?: {
    id: string;
    name: string;
    phone?: string;
    whatsapp?: string;
    city?: string;
    district?: string;
    profileImage?: string | null;
  } | null;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}
