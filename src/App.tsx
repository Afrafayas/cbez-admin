import { getAdminToken, clearAdminAuthSession } from './utils/authStorage';
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { UserActivityChart } from './components/UserActivityChart';
import { ShopsTable } from './components/ShopsTable';
import { ProductsTable } from './components/ProductsTable';
import { UsersTable } from './components/UsersTable';
import { ActivityLogsTable } from './components/ActivityLogsTable';
import { SettingsView } from './components/SettingsView';
import { SubscriptionsTable } from './components/SubscriptionsTable';
import { TransactionsTable } from './components/TransactionsTable';
import { CategoriesBrandsView } from './components/CategoriesBrandsView';
import { UserActivityModal } from './components/UserActivityModal';
import { EditShopModal } from './components/EditShopModal';
import { ChangeSubscriptionModal } from './components/ChangeSubscriptionModal';
import { CreateShopModal } from './components/CreateShopModal';
import { EditUserModal } from './components/EditUserModal';
import { ShopDetailDrawer } from './components/ShopDetailDrawer';
import { DeleteShopModal } from './components/DeleteShopModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { DeleteProductModal } from './components/DeleteProductModal';
import { AddEditProductModal } from './components/AddEditProductModal';
import { AdminLogin } from './components/AdminLogin';
import { SingleShopView } from './components/SingleShopView';
import { SingleProductView } from './components/SingleProductView';
import { SingleUserView } from './components/SingleUserView';
import { SingleCategoryView } from './components/SingleCategoryView';
import { SingleBrandView } from './components/SingleBrandView';
import { EditCategoryModal } from './components/EditCategoryModal';
import { EditBrandModal } from './components/EditBrandModal';
import { ApproveAgentSubscriptionModal } from './components/ApproveAgentSubscriptionModal';
import { NearlyExpiringSubscriptions } from './components/NearlyExpiringSubscriptions';
import { BannersView } from './components/BannersView';
import { AddEditBannerModal } from './components/AddEditBannerModal';
import { triggerExpiryAlertsApi } from './services/adminApi';
import { Shop, AdminStats, UserAccount, ActivityLogItem, Product, SubscriptionPlan, Category, Brand, Transaction, TransactionFilter, Banner } from './types';
import {
  fetchStats,
  fetchShops,
  fetchShopById,
  toggleVerifyShop,
  updateShop,
  deleteShop,
  fetchUsers,
  updateUser,
  deleteUser,
  fetchAllActivityLogs,
  fetchProducts,
  deleteProduct,
  fetchSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  toggleSubscriptionPlanStatus,
  deleteSubscriptionPlan,
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchBrands,
  fetchBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  assignSubscriptionToShop,
  createShopByAdmin,
  createProductByAdmin,
  updateProductByAdmin,
  fetchTransactions,
  fetchRevenueStats,
  deleteTransaction,
  fetchBannersAdmin,
  createBannerAdmin,
  updateBannerAdmin,
  toggleBannerStatusAdmin,
  deleteBannerAdmin,
} from './services/adminApi';

import { CheckCircle2, AlertCircle, RefreshCw, AlertTriangle, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';

const VALID_TABS = [
  'dashboard',
  'shops',
  'subscriptions',
  'transactions',
  'categories-brands',
  'banners',
  'products',
  'users',
  'activity',
  'settings',
];

type SingleViewType =
  | { type: 'shop'; shop: Shop }
  | { type: 'product'; product: Product }
  | { type: 'user'; user: UserAccount }
  | { type: 'category'; category: Category }
  | { type: 'brand'; brand: Brand };

const getInitialTab = (): string => {
  try {
    const params = new URLSearchParams(window.location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
      return tabFromUrl;
    }
    const tabFromStorage = localStorage.getItem('cbez_admin_active_tab');
    if (tabFromStorage && VALID_TABS.includes(tabFromStorage)) {
      return tabFromStorage;
    }
  } catch (e) {
    console.error('Failed reading initial tab:', e);
  }
  return 'shops';
};

const getInitialSingleView = (): SingleViewType | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const idParam = params.get('id');

    const cachedRaw = sessionStorage.getItem('cbez_admin_single_view');
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (cached && cached.type && cached.data) {
        if (!viewParam || (viewParam === cached.type && (!idParam || idParam === cached.id))) {
          return {
            type: cached.type,
            [cached.type]: cached.data,
          } as SingleViewType;
        }
      }
    }
  } catch (e) {
    console.error('Failed reading initial single view:', e);
  }
  return null;
};

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(getAdminToken());
  });
  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [stats, setStats] = useState<AdminStats>({
    totalShops: 0,
    verifiedShops: 0,
    pendingShops: 0,
    totalProducts: 0,
    totalLeads: 0,
    totalUsers: 0,
  });
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [transactionPage, setTransactionPage] = useState<number>(1);
  const [transactionTotalPages, setTransactionTotalPages] = useState<number>(1);
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>({
    page: 1,
    limit: 10,
  });
  const [isTransactionsLoading, setIsTransactionsLoading] = useState<boolean>(false);
  const [transactionsRefreshKey, setTransactionsRefreshKey] = useState<number>(0);

  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const f = params.get('filter');
      if (f === 'verified' || f === 'pending' || f === 'all') return f;
    } catch (e) {}
    return 'all';
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Shop Modals state
  const [selectedShopForEdit, setSelectedShopForEdit] = useState<Shop | null>(null);
  const [selectedShopForSubscription, setSelectedShopForSubscription] = useState<Shop | null>(null);
  const [shopToApprove, setShopToApprove] = useState<Shop | null>(null);
  const [isCreateShopOpen, setIsCreateShopOpen] = useState(false);
  const [selectedShopForDrawer, setSelectedShopForDrawer] = useState<Shop | null>(null);
  const [selectedShopForDelete, setSelectedShopForDelete] = useState<Shop | null>(null);

  // Product Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState<Product | null>(null);

  // User Modals state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserAccount | null>(null);

  // Activity Log User Drawer Modal
  const [selectedUserForActivityModal, setSelectedUserForActivityModal] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  // Category Modals state
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | null>(null);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  // Brand Modals state
  const [selectedBrandForEdit, setSelectedBrandForEdit] = useState<Brand | null>(null);
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);

  // Banner Modals state
  const [selectedBannerForEdit, setSelectedBannerForEdit] = useState<Banner | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // Dedicated Single Page Views state
  const [activeSingleView, setActiveSingleView] = useState<SingleViewType | null>(getInitialSingleView);

  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadTransactions = useCallback(async (customFilter?: TransactionFilter) => {
    setIsTransactionsLoading(true);
    try {
      const activeFilter = customFilter || transactionFilter;
      const res = await fetchTransactions(activeFilter);
      setTransactions(res.transactions);
      setTotalTransactions(res.pagination.total);
      setTransactionTotalPages(res.pagination.totalPages);
      setTotalRevenue(res.summary.totalRevenue);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsTransactionsLoading(false);
    }
  }, [transactionFilter]);

  // Load stats, shops, products, users, activity logs, plans, categories, brands, and banners from backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, revenueStatsData, shopsData, usersData, logsData, productsData, plansData, catsData, brandsData, bannersData] = await Promise.all([
        fetchStats(),
        fetchRevenueStats().catch(() => ({ totalRevenue: 0, totalTransactions: 0, completedTransactions: 0 })),
        fetchShops(),
        fetchUsers().catch(() => []),
        fetchAllActivityLogs().catch(() => []),
        fetchProducts().catch(() => []),
        fetchSubscriptionPlans().catch(() => []),
        fetchCategories().catch(() => []),
        fetchBrands().catch(() => []),
        fetchBannersAdmin().catch(() => []),
      ]);
      const currentRevenue = statsData.totalRevenue ?? revenueStatsData?.totalRevenue ?? 0;
      setStats({ ...statsData, totalRevenue: currentRevenue });
      setTotalRevenue(currentRevenue);
      setShops(shopsData);
      setUsers(usersData);
      setActivityLogs(logsData);
      setProducts(productsData);
      if (Array.isArray(plansData)) setSubscriptionPlans(plansData);
      if (Array.isArray(catsData)) setCategories(catsData);
      if (Array.isArray(brandsData)) setBrands(brandsData);
      if (Array.isArray(bannersData)) setBanners(bannersData);

      // Refresh or resolve active single view with fresh data from backend
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlView = urlParams.get('view');
        const urlId = urlParams.get('id');

        setActiveSingleView((prev) => {
          const targetType = prev?.type || urlView;
          const targetId =
            (prev?.type === 'shop'
              ? prev.shop.id
              : prev?.type === 'product'
              ? prev.product.id
              : prev?.type === 'user'
              ? prev.user.id
              : prev?.type === 'category'
              ? prev.category.id
              : prev?.type === 'brand'
              ? prev.brand.id
              : null) || urlId;

          if (!targetType || !targetId) return prev;

          if (targetType === 'shop') {
            const fresh = shopsData.find((s) => s.id === targetId);
            if (fresh) return { type: 'shop', shop: fresh };
            fetchShopById(targetId)
              .then((freshShop) => setActiveSingleView({ type: 'shop', shop: freshShop }))
              .catch(() => {});
            return prev;
          } else if (targetType === 'product') {
            const fresh = productsData.find((p) => p.id === targetId);
            if (fresh) return { type: 'product', product: fresh };
            return prev;
          } else if (targetType === 'user') {
            const fresh = usersData.find((u) => u.id === targetId);
            if (fresh) return { type: 'user', user: fresh };
            return prev;
          } else if (targetType === 'category') {
            const fresh = catsData.find((c) => c.id === targetId);
            if (fresh) return { type: 'category', category: fresh };
            return prev;
          } else if (targetType === 'brand') {
            const fresh = brandsData.find((b) => b.id === targetId);
            if (fresh) return { type: 'brand', brand: fresh };
            return prev;
          }
          return prev;
        });
      } catch (e) {
        console.error('Error refreshing single view:', e);
      }
    } catch (err: any) {
      console.error('Failed to fetch admin data:', err);
      showToast(err.message || 'Failed to connect to backend server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions' && isAuthenticated) {
      loadTransactions();
    }
  }, [activeTab, isAuthenticated, transactionFilter, loadTransactions]);

  // Handlers for Subscription Plans
  const handleCreatePlan = async (dto: any) => {
    try {
      const newPlan = await createSubscriptionPlan(dto);
      showToast(`Subscription Plan "${newPlan.name}" created successfully!`);
      const plans = await fetchSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (err: any) {
      showToast(err.message || 'Failed to create subscription plan', 'error');
      throw err;
    }
  };

  const handleUpdatePlan = async (id: string, dto: any) => {
    try {
      const updatedPlan = await updateSubscriptionPlan(id, dto);
      showToast(`Subscription Plan "${updatedPlan.name}" updated successfully!`);
      const plans = await fetchSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (err: any) {
      showToast(err.message || 'Failed to update subscription plan', 'error');
      throw err;
    }
  };

  const handleTogglePlanStatus = async (id: string) => {
    try {
      const updated = await toggleSubscriptionPlanStatus(id);
      showToast(`Subscription Plan status updated to ${updated.status}!`);
      const plans = await fetchSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle plan status', 'error');
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deleteSubscriptionPlan(id);
      showToast('Subscription Plan deleted successfully!');
      const plans = await fetchSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete subscription plan', 'error');
    }
  };

  // Handlers for Categories
  const handleCreateCategory = async (data: { name: string; slug?: string; image?: string; specConfig?: any[] }) => {
    try {
      const cat = await createCategory(data);
      showToast(`Category "${cat.name}" created successfully!`);
      const cats = await fetchCategories();
      setCategories(cats);
      setIsCreateCategoryOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
      throw err;
    }
  };

  const handleUpdateCategory = async (id: string, data: { name?: string; slug?: string; image?: string; specConfig?: any[] }) => {
    try {
      const cat = await updateCategory(id, data);
      showToast(`Category "${cat.name}" updated successfully!`);
      const cats = await fetchCategories();
      setCategories(cats);
      if (activeSingleView?.type === 'category' && activeSingleView.category.id === id) {
        setActiveSingleView({ type: 'category', category: cat });
      }
      setSelectedCategoryForEdit(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update category', 'error');
      throw err;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      showToast('Category deleted successfully!');
      if (activeSingleView?.type === 'category' && activeSingleView.category.id === id) {
        setActiveSingleView(null);
      }
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
      throw err;
    }
  };

  // Handlers for Brands
  const handleCreateBrand = async (data: { name: string; logo?: string }) => {
    try {
      const b = await createBrand(data);
      showToast(`Brand "${b.name}" created successfully!`);
      const bList = await fetchBrands();
      setBrands(bList);
      setIsCreateBrandOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to create brand', 'error');
      throw err;
    }
  };

  const handleUpdateBrand = async (id: string, data: { name?: string; logo?: string }) => {
    try {
      const b = await updateBrand(id, data);
      showToast(`Brand "${b.name}" updated successfully!`);
      const bList = await fetchBrands();
      setBrands(bList);
      if (activeSingleView?.type === 'brand' && activeSingleView.brand.id === id) {
        setActiveSingleView({ type: 'brand', brand: b });
      }
      setSelectedBrandForEdit(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update brand', 'error');
      throw err;
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await deleteBrand(id);
      showToast('Brand deleted successfully!');
      if (activeSingleView?.type === 'brand' && activeSingleView.brand.id === id) {
        setActiveSingleView(null);
      }
      const bList = await fetchBrands();
      setBrands(bList);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete brand', 'error');
      throw err;
    }
  };

  // Handler: Open Single Category View
  const handleOpenSingleCategory = async (category: Category) => {
    try {
      const fullCat = await fetchCategoryById(category.id);
      setActiveSingleView({ type: 'category', category: fullCat });
    } catch (err) {
      const localCat = categories.find((c) => c.id === category.id) || category;
      setActiveSingleView({ type: 'category', category: localCat });
    }
  };

  // Handler: Open Single Brand View
  const handleOpenSingleBrand = async (brand: Brand) => {
    try {
      const fullBrand = await fetchBrandById(brand.id);
      setActiveSingleView({ type: 'brand', brand: fullBrand });
    } catch (err) {
      const localBrand = brands.find((b) => b.id === brand.id) || brand;
      setActiveSingleView({ type: 'brand', brand: localBrand });
    }
  };


  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Scroll main content container to top on tab navigation
  useEffect(() => {
    const mainEl = document.getElementById('admin-main-container');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Save single view object into sessionStorage for instant restoration on reload
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      if (activeSingleView) {
        const id =
          activeSingleView.type === 'shop'
            ? activeSingleView.shop.id
            : activeSingleView.type === 'product'
            ? activeSingleView.product.id
            : activeSingleView.type === 'user'
            ? activeSingleView.user.id
            : activeSingleView.type === 'category'
            ? activeSingleView.category.id
            : activeSingleView.brand.id;

        const data =
          activeSingleView.type === 'shop'
            ? activeSingleView.shop
            : activeSingleView.type === 'product'
            ? activeSingleView.product
            : activeSingleView.type === 'user'
            ? activeSingleView.user
            : activeSingleView.type === 'category'
            ? activeSingleView.category
            : activeSingleView.brand;

        sessionStorage.setItem(
          'cbez_admin_single_view',
          JSON.stringify({ type: activeSingleView.type, id, data })
        );
      } else {
        sessionStorage.removeItem('cbez_admin_single_view');
      }
    } catch (e) {
      console.error('Failed saving single view cache:', e);
    }
  }, [activeSingleView, isAuthenticated]);

  // Sync activeTab, single view, and filter into URL query params and localStorage
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      localStorage.setItem('cbez_admin_active_tab', activeTab);

      const params = new URLSearchParams(window.location.search);
      params.set('tab', activeTab);

      if (activeSingleView) {
        const id =
          activeSingleView.type === 'shop'
            ? activeSingleView.shop.id
            : activeSingleView.type === 'product'
            ? activeSingleView.product.id
            : activeSingleView.type === 'user'
            ? activeSingleView.user.id
            : activeSingleView.type === 'category'
            ? activeSingleView.category.id
            : activeSingleView.brand.id;

        params.set('view', activeSingleView.type);
        if (id) {
          params.set('id', id);
        }
      } else {
        params.delete('view');
        params.delete('id');
      }

      if (filterStatus && filterStatus !== 'all' && activeTab === 'shops') {
        params.set('filter', filterStatus);
      } else {
        params.delete('filter');
      }

      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}${window.location.hash}`;
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (newUrl !== currentUrl) {
        window.history.replaceState(null, '', newUrl);
      }
    } catch (e) {
      console.error('Failed updating URL state:', e);
    }
  }, [activeTab, activeSingleView, filterStatus, isAuthenticated]);

  // Browser back/forward button navigation listener
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam && VALID_TABS.includes(tabParam)) {
          setActiveTab(tabParam);
        }
        const viewParam = params.get('view');
        const idParam = params.get('id');
        if (!viewParam) {
          setActiveSingleView(null);
          sessionStorage.removeItem('cbez_admin_single_view');
        } else if (idParam) {
          const cachedRaw = sessionStorage.getItem('cbez_admin_single_view');
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached && cached.type === viewParam && cached.id === idParam && cached.data) {
              setActiveSingleView({ type: cached.type, [cached.type]: cached.data } as SingleViewType);
            }
          }
        }
      } catch (e) {
        console.error('Error handling popstate:', e);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


    // Handler: Approve Agent Subscription Modal Submission
  const handleConfirmApproveAgent = async (
    shopId: string,
    planId: string,
    transactionMode: string,
    transactionId: string,
    amount: number,
    notes: string
  ) => {
    setIsActionLoading(true);
    try {
      const updatedShop = await toggleVerifyShop(shopId, true, {
        planId,
        transactionMode,
        transactionId,
        amount,
        notes,
      });

      showToast(`Store "${updatedShop.name}" verified and subscription plan assigned successfully!`);
      setShopToApprove(null);

      // Fetch fresh shop by ID so full populated subscription details are guaranteed
      let freshShop = updatedShop;
      try {
        freshShop = await fetchShopById(shopId);
      } catch (e) {
        // fallback to updatedShop
      }

      // Update shop in state
      setShops((prev) => prev.map((s) => (s.id === shopId ? freshShop : s)));

      // Update single view if active
      if (activeSingleView?.type === 'shop' && activeSingleView.shop.id === shopId) {
        setActiveSingleView({
          type: 'shop',
          shop: freshShop,
        });
      }

      // Update drawer if open
      if (selectedShopForDrawer && selectedShopForDrawer.id === shopId) {
        setSelectedShopForDrawer(freshShop);
      }

      // Trigger instant refresh for SingleShopView transaction logs
      setTransactionsRefreshKey((prev) => prev + 1);

      // Refresh platform statistics, transactions, and plans immediately
      await Promise.all([
        loadTransactions(),
        loadData(),
        fetchSubscriptionPlans().then((plans) => {
          if (Array.isArray(plans)) setSubscriptionPlans(plans);
        }).catch(() => {})
      ]);
    } catch (err: any) {
      showToast(err.message || 'Failed to verify store and save transaction', 'error');
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handler: Toggle Verification Switch
  const handleToggleVerify = async (id: string, currentStatus: boolean, shopObj?: Shop) => {
    if (!currentStatus) {
      // Find shop to approve with subscription and transaction modal
      const targetShop =
        shopObj ||
        (activeSingleView?.type === 'shop' && activeSingleView.shop.id === id ? activeSingleView.shop : null) ||
        shops.find((s) => s.id === id) ||
        null;

      if (targetShop) {
        setShopToApprove(targetShop);
        return;
      }
    }

    // Revoking verification
    try {
      const updatedShop = await toggleVerifyShop(id, false);
      showToast(`Store "${updatedShop.name}" verification revoked.`);
      setShops((prev) => prev.map((s) => (s.id === id ? { ...s, verified: false } : s)));
      if (selectedShopForDrawer && selectedShopForDrawer.id === id) {
        setSelectedShopForDrawer((prev) => (prev ? { ...prev, verified: false } : null));
      }
      if (activeSingleView?.type === 'shop' && activeSingleView.shop.id === id) {
        setActiveSingleView({
          type: 'shop',
          shop: { ...activeSingleView.shop, verified: false },
        });
      }
      const statsData = await fetchStats();
      setStats(statsData);
    } catch (err: any) {
      showToast(err.message || 'Failed to update verification status', 'error');
    }
  };

  // Handler: Open Single Shop View
  const handleOpenSingleShop = async (shop: Shop | { id: string; name: string }) => {
    try {
      const fullShop = await fetchShopById(shop.id);
      setActiveSingleView({ type: 'shop', shop: fullShop });
    } catch (err) {
      const localShop = shops.find((s) => s.id === shop.id) || (shop as Shop);
      setActiveSingleView({ type: 'shop', shop: localShop });
    }
  };

  // Handler: Open Single Product View
  const handleOpenSingleProduct = (product: Product) => {
    let resolvedProduct = product;
    if (!resolvedProduct.shop && resolvedProduct.shopId) {
      const foundShop = shops.find((s) => s.id === resolvedProduct.shopId);
      if (foundShop) {
        resolvedProduct = { ...resolvedProduct, shop: foundShop };
      }
    }
    setActiveSingleView({ type: 'product', product: resolvedProduct });
  };

  // Handler: Open Single User View
  const handleOpenSingleUser = (user: UserAccount) => {
    setActiveSingleView({ type: 'user', user });
  };

  // Handler: Open Single User by ID & Name (from Activity Logs)
  const handleOpenSingleUserById = (userId: string, userName?: string) => {
    const foundUser = users.find((u) => u.id === userId);
    if (foundUser) {
      setActiveSingleView({ type: 'user', user: foundUser });
    } else {
      setActiveSingleView({
        type: 'user',
        user: {
          id: userId,
          name: userName || 'User',
          email: null,
          phone: null,
          role: 'customer',
          createdAt: new Date().toISOString(),
        },
      });
    }
  };

  const handleBackFromSingleView = () => {
    setActiveSingleView(null);
  };

  // Handler: Save Shop Edit
  const handleSaveEdit = async (updatedData: Partial<Shop> & { subscriptionPlanId?: string }) => {
    if (!selectedShopForEdit) return;
    setIsActionLoading(true);
    try {
      const { subscriptionPlanId, ...shopDetails } = updatedData;
      const updated = await updateShop(selectedShopForEdit.id, shopDetails);
      if (subscriptionPlanId) {
        await assignSubscriptionToShop(selectedShopForEdit.id, subscriptionPlanId);
      }
      if (activeSingleView?.type === 'shop' && activeSingleView.shop.id === selectedShopForEdit.id) {
        setActiveSingleView({
          type: 'shop',
          shop: { ...activeSingleView.shop, ...updated },
        });
      }
      showToast(`Store "${updated.name}" updated successfully!`);
      setSelectedShopForEdit(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update store details', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handler: Confirm Delete Shop
  const handleConfirmDeleteShop = async () => {
    if (!selectedShopForDelete) return;
    setIsActionLoading(true);
    try {
      await deleteShop(selectedShopForDelete.id);
      if (activeSingleView?.type === 'shop' && activeSingleView.shop.id === selectedShopForDelete.id) {
        setActiveSingleView(null);
      }
      showToast(`Store "${selectedShopForDelete.name}" deleted successfully!`);
      setSelectedShopForDelete(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete store', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handler: Delete Product Confirm
  const handleConfirmDeleteProduct = async () => {
    if (!selectedProductForDelete) return;
    setIsActionLoading(true);

    const targetShopId =
      selectedProductForDelete.shopId ||
      selectedProductForDelete.shop?.id ||
      (activeSingleView?.type === 'shop' ? activeSingleView.shop.id : null);
    const wasViewingShop = activeSingleView?.type === 'shop';

    try {
      await deleteProduct(selectedProductForDelete.id);
      showToast(`Product "${selectedProductForDelete.name}" deleted successfully!`);
      setSelectedProductForDelete(null);
      await loadData();

      // If user deleted while inside a store view or deleted a product of a store, stay on the store page!
      if (wasViewingShop && targetShopId) {
        try {
          const freshShop = await fetchShopById(targetShopId);
          setActiveSingleView({ type: 'shop', shop: freshShop });
        } catch (e) {
          console.error('Failed to refresh shop view after product delete', e);
        }
      } else if (targetShopId) {
        try {
          const freshShop = await fetchShopById(targetShopId);
          setActiveSingleView({ type: 'shop', shop: freshShop });
        } catch (e) {
          setActiveSingleView(null);
        }
      } else {
        setActiveSingleView(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handler: Save User Edit
  const handleSaveUserEdit = async (updatedData: Partial<UserAccount>) => {
    if (!selectedUserForEdit) return;
    setIsActionLoading(true);
    try {
      const updated = await updateUser(selectedUserForEdit.id, updatedData);
      if (activeSingleView?.type === 'user' && activeSingleView.user.id === selectedUserForEdit.id) {
        setActiveSingleView({
          type: 'user',
          user: { ...activeSingleView.user, ...updated },
        });
      }
      showToast(`User account "${updated.name}" updated successfully!`);
      setSelectedUserForEdit(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user account', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handler: Delete User Confirm
  const handleConfirmDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    setIsActionLoading(true);
    try {
      await deleteUser(selectedUserForDelete.id);
      if (activeSingleView?.type === 'user' && activeSingleView.user.id === selectedUserForDelete.id) {
        setActiveSingleView(null);
      }
      showToast(`User account "${selectedUserForDelete.name}" deleted successfully!`);
      setSelectedUserForDelete(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user account', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminAuthSession();
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (e) {}
    setIsAuthenticated(false);
  };

  const handleNavigateToPendingShops = () => {
    setActiveSingleView(null);
    setActiveTab('shops');
    setFilterStatus('pending');
    setTimeout(() => {
      const section = document.getElementById('shops-table-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Handler: Admin Create / Edit Product
  const handleSaveProduct = async (productData: any) => {
    setIsActionLoading(true);
    try {
      if (selectedProductForEdit) {
        await updateProductByAdmin(selectedProductForEdit.id, productData);
        showToast('Product updated successfully!');
      } else {
        await createProductByAdmin(productData);
        showToast('New product created successfully for dealer!');
      }
      setIsAddProductOpen(false);
      setSelectedProductForEdit(null);
      await loadData();
      if (activeSingleView?.type === 'shop') {
        try {
          const freshShop = await fetchShopById(activeSingleView.shop.id);
          setActiveSingleView({ type: 'shop', shop: freshShop });
        } catch (e) {
          console.error('Failed to refresh shop view after product save', e);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Banner Handlers
  const handleCreateBanner = async (bannerData: any) => {
    setIsActionLoading(true);
    try {
      await createBannerAdmin(bannerData);
      showToast('Promotional banner created successfully!');
      setIsBannerModalOpen(false);
      const updatedBanners = await fetchBannersAdmin().catch(() => []);
      setBanners(updatedBanners);
    } catch (err: any) {
      showToast(err.message || 'Failed to create banner', 'error');
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateBanner = async (id: string, bannerData: any) => {
    setIsActionLoading(true);
    try {
      await updateBannerAdmin(id, bannerData);
      showToast('Banner updated successfully!');
      setIsBannerModalOpen(false);
      setSelectedBannerForEdit(null);
      const updatedBanners = await fetchBannersAdmin().catch(() => []);
      setBanners(updatedBanners);
    } catch (err: any) {
      showToast(err.message || 'Failed to update banner', 'error');
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setBanners((prev) =>
        prev.map((b) => (b.id === bannerId ? { ...b, isActive: !currentStatus } : b))
      );
      await toggleBannerStatusAdmin(bannerId, !currentStatus);
      showToast(`Banner ${!currentStatus ? 'activated and live' : 'paused'} successfully!`);
    } catch (err: any) {
      // Revert optimistic update
      setBanners((prev) =>
        prev.map((b) => (b.id === bannerId ? { ...b, isActive: currentStatus } : b))
      );
      showToast(err.message || 'Failed to toggle banner status', 'error');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    setIsActionLoading(true);
    try {
      await deleteBannerAdmin(bannerId);
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      showToast('Banner deleted successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete banner', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100 flex flex-col md:flex-row font-['Poppins',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeSingleView ? 'single-view' : activeTab}
        setActiveTab={(tab) => {
          setActiveSingleView(null);
          setActiveTab(tab);
        }}
        pendingCount={stats.pendingShops}
        onLogout={handleLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRefresh={loadData}
          isLoading={isLoading}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activeTab={activeSingleView ? 'single-view' : activeTab}
          onBackToShops={() => {
            if (activeSingleView) {
              handleBackFromSingleView();
            } else {
              setActiveTab('shops');
            }
          }}
        />

        {/* Toast Notification Banner */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold glass-panel ${toast.type === 'success'
                  ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/80'
                  : 'border-red-500/40 text-red-300 bg-red-950/80'
                }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Dashboard Main View Container */}
        <main id="admin-main-container" className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Welcome Header (Dashboard only) */}
          {!activeSingleView && activeTab === 'dashboard' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  MLX Admin Control Center
                  {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Monitor platform analytics, manage user accounts, inspect activity logs, and verify store listings.
                </p>
              </div>
            </div>
          )}

          {/* Active Single View or Tab Views */}
          {activeSingleView ? (
            activeSingleView.type === 'shop' ? (
              <SingleShopView
                shop={activeSingleView.shop}
                catalogProducts={products}
                refreshTrigger={transactionsRefreshKey}
                onBack={handleBackFromSingleView}
                onToggleVerify={handleToggleVerify}
                onEdit={(shop) => setSelectedShopForEdit(shop)}
                onChangeSubscription={(shop) => setSelectedShopForSubscription(shop)}
                onDelete={(shop) => setSelectedShopForDelete(shop)}
                onViewProduct={handleOpenSingleProduct}
                onAddProduct={() => setIsAddProductOpen(true)}
                onEditProduct={(product) => setSelectedProductForEdit(product)}
                onDeleteProduct={(product) => setSelectedProductForDelete(product)}
              />
            ) : activeSingleView.type === 'product' ? (
              <SingleProductView
                product={activeSingleView.product}
                onBack={handleBackFromSingleView}
                onEdit={(product) => setSelectedProductForEdit(product)}
                onDelete={(product) => setSelectedProductForDelete(product)}
                onViewShop={handleOpenSingleShop}
              />
            ) : activeSingleView.type === 'user' ? (
              <SingleUserView
                user={activeSingleView.user}
                onBack={handleBackFromSingleView}
                onEdit={(user) => setSelectedUserForEdit(user)}
                onDelete={(user) => setSelectedUserForDelete(user)}
                onViewShop={handleOpenSingleShop}
              />
            ) : activeSingleView.type === 'category' ? (
              <SingleCategoryView
                category={activeSingleView.category}
                products={products}
                onBack={handleBackFromSingleView}
                onEdit={(cat) => setSelectedCategoryForEdit(cat)}
                onDelete={async (cat) => {
                  if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                    await handleDeleteCategory(cat.id);
                  }
                }}
                onViewProduct={handleOpenSingleProduct}
                onAddProduct={() => setIsAddProductOpen(true)}
              />
            ) : (
              <SingleBrandView
                brand={activeSingleView.brand}
                products={products}
                onBack={handleBackFromSingleView}
                onEdit={(brand) => setSelectedBrandForEdit(brand)}
                onDelete={async (brand) => {
                  if (window.confirm(`Are you sure you want to delete brand "${brand.name}"?`)) {
                    await handleDeleteBrand(brand.id);
                  }
                }}
                onViewProduct={handleOpenSingleProduct}
                onAddProduct={() => setIsAddProductOpen(true)}
              />
            )
          ) : (
            <>
              {/* Priority Hero Alert Banner for Pending Shops (only on dashboard and manage shops) */}
              {(activeTab === 'dashboard' || activeTab === 'shops') && stats.pendingShops > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-500/40 shadow-xl shadow-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                      <ShieldAlert className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-amber-300">
                        {stats.pendingShops} {stats.pendingShops === 1 ? 'Shop' : 'Shops'} Pending Verification
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={handleNavigateToPendingShops}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <span>Review Pending Shops ({stats.pendingShops})</span>
                  </button>
                </div>
              )}

              {/* Stats KPI Overview & Activity Analytics Chart (Dashboard only) */}
              {activeTab === 'dashboard' && (
                <>
                  <StatsOverview
                    stats={stats}
                    onFilterStatus={setFilterStatus}
                    selectedStatus={filterStatus}
                    onNavigateToTransactions={() => setActiveTab('transactions')}
                  />
                  <UserActivityChart
                    logs={activityLogs}
                    onNavigateToActivityLogs={() => setActiveTab('activity')}
                  />
                </>
              )}

              {/* Active Tab View Rendering */}
              {activeTab === 'transactions' ? (
                <TransactionsTable
                  transactions={transactions}
                  totalTransactions={totalTransactions}
                  totalRevenue={totalRevenue}
                  currentPage={transactionPage}
                  totalPages={transactionTotalPages}
                  pageSize={10}
                  onPageChange={(page) => {
                    setTransactionPage(page);
                    setTransactionFilter((prev) => ({ ...prev, page }));
                  }}
                  onFilterChange={(filter) => {
                    setTransactionPage(filter.page || 1);
                    setTransactionFilter((prev) => ({ ...prev, ...filter }));
                  }}
                  onDeleteTransaction={async (id) => {
                    await deleteTransaction(id);
                    showToast('Transaction log deleted successfully');
                    loadTransactions();
                    loadData();
                  }}
                  onViewShop={handleOpenSingleShop}
                  isLoading={isTransactionsLoading}
                />
              ) : activeTab === 'subscriptions' ? (
                <SubscriptionsTable
                  plans={subscriptionPlans}
                  shops={shops}
                  products={products}
                  onCreatePlan={handleCreatePlan}
                  onUpdatePlan={handleUpdatePlan}
                  onToggleStatus={handleTogglePlanStatus}
                  onDeletePlan={handleDeletePlan}
                  onAssignPlanToShop={async (shopId, planId) => {
                    await assignSubscriptionToShop(shopId, planId);
                    showToast('Subscription plan assigned to shop successfully');
                    loadData();
                  }}
                  onViewShop={handleOpenSingleShop}
                  isLoading={isLoading}
                />
              ) : activeTab === 'categories-brands' ? (
                <CategoriesBrandsView
                  categories={categories}
                  brands={brands}
                  products={products}
                  onCreateCategory={handleCreateCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onCreateBrand={handleCreateBrand}
                  onUpdateBrand={handleUpdateBrand}
                  onDeleteBrand={handleDeleteBrand}
                  onViewCategory={handleOpenSingleCategory}
                  onViewBrand={handleOpenSingleBrand}
                  isLoading={isLoading}
                  searchTerm={searchTerm}
                />
              ) : activeTab === 'banners' ? (
                <BannersView
                  banners={banners}
                  shops={shops}
                  onOpenCreate={() => {
                    setSelectedBannerForEdit(null);
                    setIsBannerModalOpen(true);
                  }}
                  onEdit={(banner) => {
                    setSelectedBannerForEdit(banner);
                    setIsBannerModalOpen(true);
                  }}
                  onDelete={handleDeleteBanner}
                  onToggleStatus={handleToggleBannerStatus}
                  isLoading={isLoading}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              ) : activeTab === 'products' ? (
                <ProductsTable
                  products={products}
                  onViewDetails={handleOpenSingleProduct}
                  onEditProduct={(product) => setSelectedProductForEdit(product)}
                  onOpenCreateProduct={() => setIsAddProductOpen(true)}
                  onDelete={(product) => setSelectedProductForDelete(product)}
                  onViewShop={handleOpenSingleShop}
                  searchTerm={searchTerm}
                />
              ) : activeTab === 'users' ? (
                <UsersTable
                  users={users}
                  onEdit={(user) => setSelectedUserForEdit(user)}
                  onDelete={(user) => setSelectedUserForDelete(user)}
                  onViewLogs={(userId, userName) => setSelectedUserForActivityModal({ userId, userName })}
                  onViewUser={handleOpenSingleUser}
                  onViewShop={handleOpenSingleShop}
                  searchTerm={searchTerm}
                />
              ) : activeTab === 'activity' ? (
                <div className="space-y-6">
                  <UserActivityChart logs={activityLogs} />
                  <ActivityLogsTable
                    logs={activityLogs}
                    searchTerm={searchTerm}
                    onSelectUserLogs={(userId, userName) =>
                      setSelectedUserForActivityModal({ userId, userName })
                    }
                    onViewUser={handleOpenSingleUserById}
                    onRefresh={loadData}
                  />
                </div>
              ) : activeTab === 'settings' ? (
                <SettingsView onShowToast={showToast} onBackToShops={() => setActiveTab('shops')} />
              ) : (
                <ShopsTable
                  shops={shops}
                  products={products}
                  onToggleVerify={handleToggleVerify}
                  onEdit={(shop) => setSelectedShopForEdit(shop)}
                  onChangeSubscription={(shop) => setSelectedShopForSubscription(shop)}
                  onDelete={(shop) => setSelectedShopForDelete(shop)}
                  onViewDetails={handleOpenSingleShop}
                  onOpenCreateShop={() => setIsCreateShopOpen(true)}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  searchTerm={searchTerm}
                />
              )}
            </>
          )}

        </main>
      </div>

      {/* Shop Modals & Drawers */}
      <EditShopModal
        shop={selectedShopForEdit}
        isOpen={Boolean(selectedShopForEdit)}
        onClose={() => setSelectedShopForEdit(null)}
        onSave={handleSaveEdit}
        categories={categories}
        isLoading={isActionLoading}
      />

      <ApproveAgentSubscriptionModal
        shop={shopToApprove}
        isOpen={Boolean(shopToApprove)}
        onClose={() => setShopToApprove(null)}
        plans={subscriptionPlans}
        onConfirm={handleConfirmApproveAgent}
        isLoading={isActionLoading}
      />

      <ChangeSubscriptionModal
        shop={selectedShopForSubscription}
        isOpen={Boolean(selectedShopForSubscription)}
        onClose={() => setSelectedShopForSubscription(null)}
        plans={subscriptionPlans}
        onAssignPlan={async (shopId, planId, extra) => {
          setIsActionLoading(true);
          try {
            await assignSubscriptionToShop(shopId, planId, extra);
            showToast('Subscription plan updated & transaction recorded successfully!');
            setSelectedShopForSubscription(null);
            setTransactionsRefreshKey((prev) => prev + 1);
            await loadData();
            if (activeSingleView?.type === 'shop' && activeSingleView.shop.id === shopId) {
              try {
                const freshShop = await fetchShopById(shopId);
                setActiveSingleView({ type: 'shop', shop: freshShop });
              } catch (e) {}
            }
            await loadTransactions();
          } catch (err: any) {
            showToast(err.message || 'Failed to update subscription plan', 'error');
            throw err;
          } finally {
            setIsActionLoading(false);
          }
        }}
        isLoading={isActionLoading}
      />

      <CreateShopModal
        isOpen={isCreateShopOpen}
        onClose={() => setIsCreateShopOpen(false)}
        onSave={async (shopData) => {
          setIsActionLoading(true);
          try {
            await createShopByAdmin(shopData);
            showToast('New dealer shop created successfully!');
            setIsCreateShopOpen(false);
            loadData();
          } catch (err: any) {
            showToast(err.message || 'Failed to create dealer shop', 'error');
          } finally {
            setIsActionLoading(false);
          }
        }}
        subscriptionPlans={subscriptionPlans}
        categories={categories}
        isLoading={isActionLoading}
      />

      <ShopDetailDrawer
        shop={selectedShopForDrawer}
        isOpen={Boolean(selectedShopForDrawer)}
        onClose={() => setSelectedShopForDrawer(null)}
        onToggleVerify={handleToggleVerify}
      />

      <DeleteShopModal
        shop={selectedShopForDelete}
        isOpen={Boolean(selectedShopForDelete)}
        onClose={() => setSelectedShopForDelete(null)}
        onConfirm={handleConfirmDeleteShop}
        isLoading={isActionLoading}
      />

      {/* Product Modals */}
      <AddEditProductModal
        isOpen={isAddProductOpen || Boolean(selectedProductForEdit)}
        onClose={() => {
          setIsAddProductOpen(false);
          setSelectedProductForEdit(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={selectedProductForEdit}
        defaultShopId={activeSingleView?.type === 'shop' ? activeSingleView.shop.id : undefined}
        shops={shops}
        subscriptionPlans={subscriptionPlans}
        categories={categories}
        brands={brands}
        isLoading={isActionLoading}
      />

      <ProductDetailModal
        product={selectedProductForDetails}
        isOpen={Boolean(selectedProductForDetails)}
        onClose={() => setSelectedProductForDetails(null)}
      />

      <DeleteProductModal
        product={selectedProductForDelete}
        isOpen={Boolean(selectedProductForDelete)}
        onClose={() => setSelectedProductForDelete(null)}
        onConfirm={handleConfirmDeleteProduct}
        isLoading={isActionLoading}
      />

      {/* User Modals */}
      <EditUserModal
        user={selectedUserForEdit}
        isOpen={Boolean(selectedUserForEdit)}
        onClose={() => setSelectedUserForEdit(null)}
        onSave={handleSaveUserEdit}
        isLoading={isActionLoading}
      />

      {/* User Activity Modal Timeline */}
      <UserActivityModal
        userId={selectedUserForActivityModal?.userId || null}
        userName={selectedUserForActivityModal?.userName || null}
        isOpen={Boolean(selectedUserForActivityModal)}
        onClose={() => setSelectedUserForActivityModal(null)}
      />

      {/* Delete User Modal */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden bg-slate-900/90 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Delete User Account</h3>
                <p className="text-xs text-slate-400">This action is irreversible</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to delete user account{' '}
              <strong className="text-white font-bold">{selectedUserForDelete.name}</strong> (
              <span className="text-xs font-mono">{selectedUserForDelete.email || selectedUserForDelete.phone}</span>)?
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedUserForDelete(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isActionLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modals */}
      <EditCategoryModal
        isOpen={Boolean(selectedCategoryForEdit) || isCreateCategoryOpen}
        onClose={() => {
          setSelectedCategoryForEdit(null);
          setIsCreateCategoryOpen(false);
        }}
        onSave={async (categoryData) => {
          if (selectedCategoryForEdit) {
            await handleUpdateCategory(selectedCategoryForEdit.id, categoryData);
          } else {
            await handleCreateCategory(categoryData);
          }
        }}
        categoryToEdit={selectedCategoryForEdit}
        isLoading={isActionLoading}
      />

      {/* Brand Modals */}
      <EditBrandModal
        isOpen={Boolean(selectedBrandForEdit) || isCreateBrandOpen}
        onClose={() => {
          setSelectedBrandForEdit(null);
          setIsCreateBrandOpen(false);
        }}
        onSave={async (brandData) => {
          if (selectedBrandForEdit) {
            await handleUpdateBrand(selectedBrandForEdit.id, brandData);
          } else {
            await handleCreateBrand(brandData);
          }
        }}
        brandToEdit={selectedBrandForEdit}
        isLoading={isActionLoading}
      />

      {/* Banner Modal */}
      <AddEditBannerModal
        isOpen={isBannerModalOpen}
        onClose={() => {
          setIsBannerModalOpen(false);
          setSelectedBannerForEdit(null);
        }}
        onSave={async (bannerData) => {
          if (selectedBannerForEdit) {
            await handleUpdateBanner(selectedBannerForEdit.id, bannerData);
          } else {
            await handleCreateBanner(bannerData);
          }
        }}
        bannerToEdit={selectedBannerForEdit}
        shops={shops}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default App;

