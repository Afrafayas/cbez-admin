import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { ShopsTable } from './components/ShopsTable';
import { ProductsTable } from './components/ProductsTable';
import { UsersTable } from './components/UsersTable';
import { ActivityLogsTable } from './components/ActivityLogsTable';
import { SettingsView } from './components/SettingsView';
import { SubscriptionsTable } from './components/SubscriptionsTable';
import { CategoriesBrandsView } from './components/CategoriesBrandsView';
import { UserActivityModal } from './components/UserActivityModal';
import { EditShopModal } from './components/EditShopModal';
import { CreateShopModal } from './components/CreateShopModal';
import { EditUserModal } from './components/EditUserModal';
import { ShopDetailDrawer } from './components/ShopDetailDrawer';
import { DeleteShopModal } from './components/DeleteShopModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { DeleteProductModal } from './components/DeleteProductModal';
import { AddEditProductModal } from './components/AddEditProductModal';
import { AdminLogin } from './components/AdminLogin';
import { Shop, AdminStats, UserAccount, ActivityLogItem, Product, SubscriptionPlan, Category, Brand } from './types';
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
  createCategory,
  updateCategory,
  deleteCategory,
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  assignSubscriptionToShop,
  createShopByAdmin,
  createProductByAdmin,
  updateProductByAdmin,
} from './services/adminApi';

import { CheckCircle2, AlertCircle, RefreshCw, AlertTriangle, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('cbez_admin_token'));
  });
  const [activeTab, setActiveTab] = useState<string>('shops');
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

  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Shop Modals state
  const [selectedShopForEdit, setSelectedShopForEdit] = useState<Shop | null>(null);
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

  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load stats, shops, products, users, activity logs, plans, categories, and brands from backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, shopsData, usersData, logsData, productsData, plansData, catsData, brandsData] = await Promise.all([
        fetchStats(),
        fetchShops(),
        fetchUsers().catch(() => []),
        fetchAllActivityLogs().catch(() => []),
        fetchProducts().catch(() => []),
        fetchSubscriptionPlans().catch(() => []),
        fetchCategories().catch(() => []),
        fetchBrands().catch(() => []),
      ]);
      setStats(statsData);
      setShops(shopsData);
      setUsers(usersData);
      setActivityLogs(logsData);
      setProducts(productsData);
      if (Array.isArray(plansData)) setSubscriptionPlans(plansData);
      if (Array.isArray(catsData)) setCategories(catsData);
      if (Array.isArray(brandsData)) setBrands(brandsData);

      // Priority Emphasis: If pending shops exist on load, set default filter to 'pending'
      if (statsData.pendingShops > 0) {
        setFilterStatus('pending');
      }
    } catch (err: any) {
      console.error('Failed to fetch admin data:', err);
      showToast(err.message || 'Failed to connect to backend server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
  const handleCreateCategory = async (data: { name: string; slug?: string; image?: string }) => {
    try {
      const cat = await createCategory(data);
      showToast(`Category "${cat.name}" created successfully!`);
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
      throw err;
    }
  };

  const handleUpdateCategory = async (id: string, data: { name?: string; slug?: string; image?: string }) => {
    try {
      const cat = await updateCategory(id, data);
      showToast(`Category "${cat.name}" updated successfully!`);
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err: any) {
      showToast(err.message || 'Failed to update category', 'error');
      throw err;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      showToast('Category deleted successfully!');
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
    } catch (err: any) {
      showToast(err.message || 'Failed to update brand', 'error');
      throw err;
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await deleteBrand(id);
      showToast('Brand deleted successfully!');
      const bList = await fetchBrands();
      setBrands(bList);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete brand', 'error');
      throw err;
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


  // Handler: Toggle Verification Switch
  const handleToggleVerify = async (id: string, currentStatus: boolean) => {
    try {
      const updatedShop = await toggleVerifyShop(id, !currentStatus);
      showToast(`Store "${updatedShop.name}" ${!currentStatus ? 'Verified' : 'Unverified'} successfully!`);
      setShops((prev) => prev.map((s) => (s.id === id ? { ...s, verified: !currentStatus } : s)));
      if (selectedShopForDrawer && selectedShopForDrawer.id === id) {
        setSelectedShopForDrawer((prev) => (prev ? { ...prev, verified: !currentStatus } : null));
      }
      const statsData = await fetchStats();
      setStats(statsData);
    } catch (err: any) {
      showToast(err.message || 'Failed to update verification status', 'error');
    }
  };

  // Handler: Open View Details Drawer
  const handleOpenDetails = async (shop: Shop) => {
    try {
      const fullShop = await fetchShopById(shop.id);
      setSelectedShopForDrawer(fullShop);
    } catch (err) {
      setSelectedShopForDrawer(shop);
    }
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
    try {
      await deleteProduct(selectedProductForDelete.id);
      showToast(`Product "${selectedProductForDelete.name}" deleted successfully!`);
      setSelectedProductForDelete(null);
      loadData();
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
    localStorage.removeItem('cbez_admin_token');
    localStorage.removeItem('cbez_admin_user');
    setIsAuthenticated(false);
  };

  const handleNavigateToPendingShops = () => {
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
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100 flex flex-col md:flex-row font-['Poppins',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
          activeTab={activeTab}
          onBackToShops={() => setActiveTab('shops')}
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
          {/* Welcome Header */}
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

          {/* Priority Hero Alert Banner for Pending Shops */}
          {stats.pendingShops > 0 && (
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

          {/* Stats KPI Overview (Dashboard / Shops) */}
          {(activeTab === 'dashboard' || activeTab === 'shops') && (
            <StatsOverview
              stats={stats}
              onFilterStatus={setFilterStatus}
              selectedStatus={filterStatus}
            />
          )}


          {/* Active Tab View Rendering */}
          {activeTab === 'subscriptions' ? (
            <SubscriptionsTable
              plans={subscriptionPlans}
              onCreatePlan={handleCreatePlan}
              onUpdatePlan={handleUpdatePlan}
              onToggleStatus={handleTogglePlanStatus}
              onDeletePlan={handleDeletePlan}
              isLoading={isLoading}
            />
          ) : activeTab === 'categories-brands' ? (
            <CategoriesBrandsView
              categories={categories}
              brands={brands}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onCreateBrand={handleCreateBrand}
              onUpdateBrand={handleUpdateBrand}
              onDeleteBrand={handleDeleteBrand}
              isLoading={isLoading}
              searchTerm={searchTerm}
            />
          ) : activeTab === 'products' ? (
            <ProductsTable
              products={products}
              onViewDetails={(product) => setSelectedProductForDetails(product)}
              onEditProduct={(product) => setSelectedProductForEdit(product)}
              onOpenCreateProduct={() => setIsAddProductOpen(true)}
              onDelete={(product) => setSelectedProductForDelete(product)}
              searchTerm={searchTerm}
            />
          ) : activeTab === 'users' ? (
            <UsersTable
              users={users}
              onEdit={(user) => setSelectedUserForEdit(user)}
              onDelete={(user) => setSelectedUserForDelete(user)}
              onViewLogs={(userId, userName) => setSelectedUserForActivityModal({ userId, userName })}
              searchTerm={searchTerm}
            />
          ) : activeTab === 'activity' ? (
            <ActivityLogsTable
              logs={activityLogs}
              searchTerm={searchTerm}
              onSelectUserLogs={(userId, userName) =>
                setSelectedUserForActivityModal({ userId, userName })
              }
            />
          ) : activeTab === 'subscriptions' ? (
            <SubscriptionsTable
              plans={subscriptionPlans}
              shops={shops}
              onCreatePlan={async (dto) => {
                await createSubscriptionPlan(dto);
                showToast('Subscription plan created successfully');
                loadData();
              }}
              onUpdatePlan={async (id, dto) => {
                await updateSubscriptionPlan(id, dto);
                showToast('Subscription plan updated successfully');
                loadData();
              }}
              onToggleStatus={async (id) => {
                await toggleSubscriptionPlanStatus(id);
                showToast('Subscription plan status updated');
                loadData();
              }}
              onDeletePlan={async (id) => {
                await deleteSubscriptionPlan(id);
                showToast('Subscription plan deleted successfully');
                loadData();
              }}
              onAssignPlanToShop={async (shopId, planId) => {
                await assignSubscriptionToShop(shopId, planId);
                showToast('Subscription plan assigned to shop successfully');
                loadData();
              }}
            />
          ) : activeTab === 'settings' ? (
            <SettingsView onShowToast={showToast} onBackToShops={() => setActiveTab('shops')} />
          ) : (
            <ShopsTable
              shops={shops}
              onToggleVerify={handleToggleVerify}
              onEdit={(shop) => setSelectedShopForEdit(shop)}
              onDelete={(shop) => setSelectedShopForDelete(shop)}
              onViewDetails={handleOpenDetails}
              onOpenCreateShop={() => setIsCreateShopOpen(true)}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchTerm={searchTerm}
            />
          )}

        </main>
      </div>

      {/* Shop Modals & Drawers */}
      <EditShopModal
        shop={selectedShopForEdit}
        isOpen={Boolean(selectedShopForEdit)}
        onClose={() => setSelectedShopForEdit(null)}
        onSave={handleSaveEdit}
        subscriptionPlans={subscriptionPlans}
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
        shops={shops}
        subscriptionPlans={subscriptionPlans}
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
    </div>
  );
};

export default App;
