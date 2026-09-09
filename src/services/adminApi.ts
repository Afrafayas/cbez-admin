import { Shop, AdminStats, UserAccount } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('cbez_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
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

export async function toggleVerifyShop(id: string, verified?: boolean): Promise<Shop> {
  const res = await fetch(`${API_BASE_URL}/shops/${id}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ verified }),
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
  return result.data?.user ?? result;
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
  const res = await fetch(`${API_BASE_URL}/activity-logs`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch platform activity logs');
  const result = await res.json();
  return result.data?.logs ?? [];
}


