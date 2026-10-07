import { Shop, AdminStats, UserAccount, Product, SubscriptionPlan, Category, Brand, Transaction, TransactionFilter, RevenueStats, MlxDetails } from '../types';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cbez-web-backend.onrender.com/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('cbez_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function checkAuthResponse(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem('cbez_admin_token');
    localStorage.removeItem('cbez_admin_user');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    throw new Error('Your admin session has expired or is invalid. Please log in again.');
  }
}

export async function uploadImageToS3(fileOrBase64: File | Blob | string, folder: string = 'general'): Promise<string> {
  if (!fileOrBase64) return '';

  if (typeof fileOrBase64 === 'string') {
    if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://')) {
      return fileOrBase64;
    }
    if (fileOrBase64.startsWith('data:')) {
      const res = await fetch(`${API_BASE_URL}/upload/base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ image: fileOrBase64, folder }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to upload base64 image to S3');
      return result.data?.url || result.url || fileOrBase64;
    }
    return fileOrBase64;
  }

  const formData = new FormData();
  formData.append('file', fileOrBase64);
  const res = await fetch(`${API_BASE_URL}/upload/single?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to upload file to S3');
  return result.data?.url || result.url || '';
}

export async function uploadMultipleImagesToS3(filesOrBase64: (File | Blob | string)[], folder: string = 'products'): Promise<string[]> {
  if (!filesOrBase64 || filesOrBase64.length === 0) return [];
  const urls = await Promise.all(filesOrBase64.map((item) => uploadImageToS3(item, folder)));
  return urls.filter(Boolean);
}


export async function fetchStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE_URL}/shops/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch admin statistics');
  const result = await res.json();
  return result.data?.stats ?? {
    totalShops: 0,
    verifiedShops: 0,
    pendingShops: 0,
    totalProducts: 0,
    totalLeads: 0,
    totalUsers: 0,
  };
}

export async function fetchShops(params?: {
  city?: string;
  category?: string;
  search?: string;
}): Promise<Shop[]> {
  const query = new URLSearchParams();
  if (params?.city) query.append('city', params.city);
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE_URL}/shops?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch shops');
  const result = await res.json();
  return result.data?.shops ?? [];
}

export async function fetchShopById(id: string): Promise<Shop> {
  const res = await fetch(`${API_BASE_URL}/shops/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch shop details');
  const result = await res.json();
  return result.data?.shop ?? result;
}

export async function toggleVerifyShop(
  id: string,
  verified?: boolean,
  approvalDetails?: {
    planId?: string;
    amount?: number;
    transactionMode?: string;
    transactionId?: string;
    notes?: string;
  }
): Promise<Shop> {
  const res = await fetch(`${API_BASE_URL}/shops/${id}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      verified,
      ...(approvalDetails || {}),
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to toggle shop verification');
  return result.data?.shop ?? result;
}

export async function updateShop(id: string, shopData: Partial<Shop>): Promise<Shop> {
  const res = await fetch(`${API_BASE_URL}/shops/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(shopData),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to update shop details');
  return result.data?.shop ?? result;
}

export async function deleteShop(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/shops/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to delete shop');
  return result;
}

// User Management API Services
export async function fetchUsers(params?: { role?: string; search?: string }): Promise<UserAccount[]> {
  const query = new URLSearchParams();
  if (params?.role && params.role !== 'all') query.append('role', params.role);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE_URL}/users?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch user accounts');
  const result = await res.json();
  return result.data?.users ?? [];
}

export async function updateUser(id: string, userData: Partial<UserAccount>): Promise<UserAccount> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(userData),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to update user account');
  return result.data?.user ?? result.user ?? result;
}

export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to delete user account');
  return result;
}

// Activity Logs API Services
export async function fetchMyActivityLogs(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/activity-logs/mine`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch activity logs');
  const result = await res.json();
  return result.data?.logs ?? [];
}

export async function fetchUserActivityLogs(userId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/activity-logs/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch user activity logs');
  const result = await res.json();
  return result.data?.logs ?? [];
}

export async function fetchAllActivityLogs(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/activity-logs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      console.warn(`Activity logs endpoint returned HTTP ${res.status}`);
      return [];
    }
    const result = await res.json();
    return result.data?.logs ?? result.logs ?? (Array.isArray(result) ? result : []);
  } catch (err) {
    console.error('Failed to fetch platform activity logs:', err);
    return [];
  }
}

// Product Management API Services
export async function fetchProducts(params?: {
  category?: string;
  brand?: string;
  search?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.append('category', params.category);
  if (params?.brand && params.brand !== 'all') query.append('brand', params.brand);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch products catalog');
  const result = await res.json();
  return result.data?.products ?? [];
}

export async function deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to delete product');
  return result;
}




// Subscription Plan API Services
export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await fetch(`${API_BASE_URL}/subscriptions/plans`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch subscription plans');
  const result = await res.json();
  return result.data?.plans ?? [];
}

export async function createSubscriptionPlan(planData: {
  name: string;
  description?: string;
  productLimit: number;
  durationDays?: number;
  price: number;
  status?: string;
}): Promise<SubscriptionPlan> {
  const res = await fetch(`${API_BASE_URL}/subscriptions/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(planData),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to create subscription plan');
  return result.data?.plan ?? result;
}

export async function updateSubscriptionPlan(
  id: string,
  planData: Partial<SubscriptionPlan>
): Promise<SubscriptionPlan> {
  const res = await fetch(`${API_BASE_URL}/subscriptions/plans/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(planData),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to update subscription plan');
  return result.data?.plan ?? result;
}

export async function toggleSubscriptionPlanStatus(
  id: string,
  status?: string
): Promise<SubscriptionPlan> {
  const res = await fetch(`${API_BASE_URL}/subscriptions/plans/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to toggle plan status');
  return result.data?.plan ?? result;
}

export async function deleteSubscriptionPlan(
  id: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/subscriptions/plans/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to delete subscription plan');
  return result;
}

export async function assignSubscriptionToShop(
  shopId: string,
  planId: string,
  extra?: {
    transactionMode?: string;
    transactionId?: string;
    amount?: number;
    notes?: string;
    forceImmediate?: boolean;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/subscriptions/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      shopId,
      planId,
      ...(extra || {}),
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to assign subscription plan');
  return result.data?.subscription ?? result;
}

export async function createShopByAdmin(shopData: any): Promise<Shop> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      ...shopData,
      role: 'seller',
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to create dealer shop');
  return result.data?.user?.shop ?? result.data?.user ?? result.user?.shop ?? result;
}


export async function createProductByAdmin(productData: any): Promise<Product> {
  if (productData?.images && Array.isArray(productData.images) && productData.images.length > 0) {
    productData.images = await uploadMultipleImagesToS3(productData.images, 'products');
  }
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(productData),
  });
  checkAuthResponse(res);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to create product for shop');
  return result.data?.product ?? result;
}

export async function updateProductByAdmin(id: string, productData: any): Promise<Product> {
  if (productData?.images && Array.isArray(productData.images) && productData.images.length > 0) {
    productData.images = await uploadMultipleImagesToS3(productData.images, 'products');
  }
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(productData),
  });
  checkAuthResponse(res);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to update product');
  return result.data?.product ?? result;
}

// ==========================================
// Category Management API Services
// ==========================================

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const result = await res.json();
  return result.data?.categories ?? [];
}

export async function fetchCategoryById(id: string): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch category details');
  const result = await res.json();
  return result.data?.category ?? result;
}

export async function createCategory(categoryData: {
  name: string;
  slug?: string;
  image?: string;
  specConfig?: any[];
}): Promise<Category> {
  if (categoryData.image) {
    categoryData.image = await uploadImageToS3(categoryData.image, 'categories');
  }
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(categoryData),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to create category');
  return result.data?.category ?? result;
}

export async function updateCategory(
  id: string,
  categoryData: Partial<Category>
): Promise<Category> {
  if (categoryData.image) {
    categoryData.image = await uploadImageToS3(categoryData.image, 'categories');
  }
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(categoryData),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to update category');
  return result.data?.category ?? result;
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; message: string; data?: { id: string } }> {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to delete category');
  return result;
}

// ==========================================
// Brand Management API Services
// ==========================================

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_BASE_URL}/brands`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch brands');
  const result = await res.json();
  return result.data?.brands ?? [];
}

export async function fetchBrandById(id: string): Promise<Brand> {
  const res = await fetch(`${API_BASE_URL}/brands/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch brand details');
  const result = await res.json();
  return result.data?.brand ?? result;
}

export async function createBrand(brandData: {
  name: string;
  logo?: string;
}): Promise<Brand> {
  if (brandData.logo) {
    brandData.logo = await uploadImageToS3(brandData.logo, 'brands');
  }
  const res = await fetch(`${API_BASE_URL}/brands`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(brandData),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to create brand');
  return result.data?.brand ?? result;
}

export async function updateBrand(
  id: string,
  brandData: Partial<Brand>
): Promise<Brand> {
  if (brandData.logo) {
    brandData.logo = await uploadImageToS3(brandData.logo, 'brands');
  }
  const res = await fetch(`${API_BASE_URL}/brands/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(brandData),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to update brand');
  return result.data?.brand ?? result;
}

export async function deleteBrand(
  id: string
): Promise<{ success: boolean; message: string; data?: { id: string } }> {
  const res = await fetch(`${API_BASE_URL}/brands/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to delete brand');
  return result;
}

// ==========================================
// Transaction & Revenue API Services
// ==========================================

export async function fetchTransactions(filter?: TransactionFilter): Promise<{
  transactions: Transaction[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  summary: { totalRevenue: number; totalCount: number };
}> {
  const query = new URLSearchParams();
  if (filter?.shopId) query.append('shopId', filter.shopId);
  if (filter?.type && filter.type !== 'all') query.append('type', filter.type);
  if (filter?.paymentStatus && filter.paymentStatus !== 'all') query.append('paymentStatus', filter.paymentStatus);
  if (filter?.search) query.append('search', filter.search);
  if (filter?.startDate) query.append('startDate', filter.startDate);
  if (filter?.endDate) query.append('endDate', filter.endDate);
  if (filter?.page) query.append('page', String(filter.page));
  if (filter?.limit) query.append('limit', String(filter.limit));

  const res = await fetch(`${API_BASE_URL}/transactions?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  checkAuthResponse(res);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to fetch transactions');
  return {
    transactions: result.data?.transactions ?? [],
    pagination: result.data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 0 },
    summary: result.data?.summary ?? { totalRevenue: 0, totalCount: 0 },
  };
}

export async function fetchRevenueStats(): Promise<RevenueStats> {
  const res = await fetch(`${API_BASE_URL}/transactions/revenue/stats`, {
    headers: getAuthHeaders(),
  });
  checkAuthResponse(res);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to fetch revenue statistics');
  return result.data ?? {
    totalRevenue: 0,
    totalTransactions: 0,
    completedTransactions: 0,
  };
}

export async function createTransaction(data: {
  shopId: string;
  planId?: string;
  planName?: string;
  amount: number;
  paymentStatus?: string;
  type?: string;
  notes?: string;
}): Promise<Transaction> {
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  checkAuthResponse(res);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to create transaction');
  return result.data?.transaction ?? result;
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  checkAuthResponse(res);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to delete transaction');
  return result;
}



export async function fetchPlatformSettings(): Promise<MlxDetails> {
  const res = await fetch(`${API_BASE_URL}/platform-settings`, {
    headers: getAuthHeaders(),
  });
  checkAuthResponse(res);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to fetch platform settings');
  return result.data ?? result;
}

export async function updatePlatformSettings(data: {
  platformName?: string;
  website?: string;
  supportPhone?: string;
  supportEmail?: string;
  address?: string;
}): Promise<MlxDetails> {
  const res = await fetch(`${API_BASE_URL}/platform-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  checkAuthResponse(res);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to update platform settings');
  return result.data ?? result;
}

export async function triggerExpiryAlertsApi(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/subscriptions/trigger-expiry-alerts`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  checkAuthResponse(res);
  const result = await res.json();
  return result;
}