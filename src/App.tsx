import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { ShopsTable } from './components/ShopsTable';
import { UsersTable } from './components/UsersTable';
import { ActivityLogsTable } from './components/ActivityLogsTable';
import { UserActivityModal } from './components/UserActivityModal';
import { EditShopModal } from './components/EditShopModal';
import { EditUserModal } from './components/EditUserModal';
import { ShopDetailDrawer } from './components/ShopDetailDrawer';
import { DeleteShopModal } from './components/DeleteShopModal';
import { AdminLogin } from './components/AdminLogin';
import { Shop, AdminStats, UserAccount, ActivityLogItem } from './types';
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
} from './services/adminApi';
import { CheckCircle2, AlertCircle, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

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
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Shop Modals state
  const [selectedShopForEdit, setSelectedShopForEdit] = useState<Shop | null>(null);
  const [selectedShopForDrawer, setSelectedShopForDrawer] = useState<Shop | null>(null);
  const [selectedShopForDelete, setSelectedShopForDelete] = useState<Shop | null>(null);

  // User Modals state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserAccount | null>(null);

  // Activity Log User Drawer Modal
  const [selectedUserForActivityModal, setSelectedUserForActivityModal] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load stats, shops, users, and activity logs from backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, shopsData, usersData, logsData] = await Promise.all([
        fetchStats(),
        fetchShops(),
        fetchUsers().catch(() => []),
        fetchAllActivityLogs().catch(() => []),
      ]);
      setStats(statsData);
      setShops(shopsData);
      setUsers(usersData);
      setActivityLogs(logsData);
    } catch (err: any) {
      console.error('Failed to fetch admin data:', err);
      showToast(err.message || 'Failed to connect to backend server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Handler: Toggle Verification Switch
  const handleToggleVerify = async (id: string, currentStatus: boolean) => {
    try {
      const updatedShop = await toggleVerifyShop(id, !currentStatus);
      showToast(`Store "${updatedShop.name}" ${!currentStatus ? 'Verified' : 'Unverified'} successfully!`);
      setShops((prev) => prev.map((s) => (s.id === id ? { ...s, verified: !currentStatus } : s)));
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
  const handleSaveEdit = async (updatedData: Partial<Shop>) => {
    if (!selectedShopForEdit) return;
    setIsActionLoading(true);
    try {
      const updated = await updateShop(selectedShopForEdit.id, updatedData);
      showToast(`Store "${updated.name}" details updated successfully!`);
      setSelectedShopForEdit(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update shop details', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handler: Delete Shop Confirm
  const handleConfirmDeleteShop = async () => {
    if (!selectedShopForDelete) return;
    setIsActionLoading(true);
    try {
      await deleteShop(selectedShopForDelete.id);
      showToast(`Store "${selectedShopForDelete.name}" deleted successfully!`);
      setSelectedShopForDelete(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete shop', 'error');
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

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100 flex flex-col md:flex-row font-['Poppins',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={stats.pendingShops}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRefresh={loadData}
          isLoading={isLoading}
        />

        {/* Toast Notification Banner */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold glass-panel ${
                toast.type === 'success'
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
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

          {/* Stats KPI Overview */}
          <StatsOverview
            stats={stats}
            onFilterStatus={setFilterStatus}
            selectedStatus={filterStatus}
          />

          {/* Active Tab View Rendering */}
          {activeTab === 'users' ? (
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
          ) : (
            <ShopsTable
              shops={shops}
              onToggleVerify={handleToggleVerify}
              onEdit={(shop) => setSelectedShopForEdit(shop)}
              onDelete={(shop) => setSelectedShopForDelete(shop)}
              onViewDetails={handleOpenDetails}
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
        isLoading={isActionLoading}
      />

      <ShopDetailDrawer
        shop={selectedShopForDrawer}
        isOpen={Boolean(selectedShopForDrawer)}
        onClose={() => setSelectedShopForDrawer(null)}
      />

      <DeleteShopModal
        shop={selectedShopForDelete}
        isOpen={Boolean(selectedShopForDelete)}
        onClose={() => setSelectedShopForDelete(null)}
        onConfirm={handleConfirmDeleteShop}
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
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
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
