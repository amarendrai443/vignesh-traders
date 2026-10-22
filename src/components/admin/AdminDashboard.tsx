import React, { useState, useMemo } from 'react';
import {
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Download,
  Layers,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, Order, OrderStatus, PaymentStatus, BannerOffer, WeightUnit } from '../../types';
import { AdminCategoryManager } from './AdminCategoryManager';
import { AdminBannerManager } from './AdminBannerManager';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onOpenProductModal: (product?: Product | null) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onOpenProductModal,
}) => {
  const {
    products,
    categories,
    orders,
    banners,
    auditLogs,
    updateOrderStatus,
    toggleBannerStatus,
    updateProductStock,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'categories' | 'banners' | 'logs'>('overview');

  // Orders Filter State
  const [orderSearchPhone, setOrderSearchPhone] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | '7days'>('all');

  // Key Metrics Calculations
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + (o.payment_status === 'completed' ? o.total_amount : 0), 0);
    const pendingOrders = orders.filter((o) => o.order_status === 'pending').length;
    const lowStockAlerts = products.filter((p) => p.stock <= 25).length;
    const uniqueCustomers = new Set(orders.map((o) => o.mobile_number)).size;

    return {
      totalRevenue,
      pendingOrders,
      lowStockAlerts,
      totalCustomers: uniqueCustomers,
    };
  }, [orders, products]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchPhone = !orderSearchPhone || ord.mobile_number.includes(orderSearchPhone) || ord.customer_name.toLowerCase().includes(orderSearchPhone.toLowerCase()) || ord.id.toLowerCase().includes(orderSearchPhone.toLowerCase());
      const matchOrderStatus = orderStatusFilter === 'all' || ord.order_status === orderStatusFilter;
      const matchPaymentStatus = paymentStatusFilter === 'all' || ord.payment_status === paymentStatusFilter;

      let matchDate = true;
      if (dateRangeFilter === 'today') {
        const ordDate = new Date(ord.created_at).toDateString();
        const today = new Date().toDateString();
        matchDate = ordDate === today;
      } else if (dateRangeFilter === '7days') {
        const diffDays = (Date.now() - new Date(ord.created_at).getTime()) / (1000 * 3600 * 24);
        matchDate = diffDays <= 7;
      }

      return matchPhone && matchOrderStatus && matchPaymentStatus && matchDate;
    });
  }, [orders, orderSearchPhone, orderStatusFilter, paymentStatusFilter, dateRangeFilter]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-stone-900 border-b border-amber-900/40 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-lg text-amber-300">
                Vignesh Traders Admin
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Supabase Role: Admin
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Wholesale Dry Fruits Inventory, Orders &amp; Real-time Audit Ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-stone-300 font-mono">Live Sync Active</span>
        </div>
      </header>

      {/* Admin Tabs Bar */}
      <div className="bg-stone-900/70 border-b border-amber-900/30 px-4 sm:px-8 flex overflow-x-auto gap-2">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'orders', label: `Orders (${orders.length})`, icon: <Package className="w-4 h-4" /> },
          { id: 'products', label: `Products (${products.length})`, icon: <DollarSign className="w-4 h-4" /> },
          { id: 'categories', label: `Categories (${categories.length})`, icon: <Layers className="w-4 h-4" /> },
          { id: 'banners', label: `Offers & Banners (${banners.length})`, icon: <Tag className="w-4 h-4" /> },
          { id: 'logs', label: `Activity Audit Log (${auditLogs.length})`, icon: <Clock className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="p-4 sm:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="bg-stone-900/90 p-5 rounded-2xl border border-amber-900/40 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 font-medium">Total Realized Revenue</span>
                  <h3 className="text-2xl font-serif font-bold text-amber-300 mt-1">
                    ₹{metrics.totalRevenue.toLocaleString()}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">
                    From authorized payments
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Pending Orders */}
              <div className="bg-stone-900/90 p-5 rounded-2xl border border-amber-900/40 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 font-medium">Pending Processing</span>
                  <h3 className="text-2xl font-serif font-bold text-amber-400 mt-1">
                    {metrics.pendingOrders}
                  </h3>
                  <span className="text-[10px] text-stone-400 font-semibold mt-1 inline-block">
                    Awaiting dispatch
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-stone-900/90 p-5 rounded-2xl border border-amber-900/40 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 font-medium">Low Stock Alerts</span>
                  <h3 className="text-2xl font-serif font-bold text-rose-400 mt-1">
                    {metrics.lowStockAlerts}
                  </h3>
                  <span className="text-[10px] text-rose-300 font-semibold mt-1 inline-block">
                    ≤ 25 units remaining
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              {/* Unique Customers */}
              <div className="bg-stone-900/90 p-5 rounded-2xl border border-amber-900/40 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 font-medium">Unique Buyers</span>
                  <h3 className="text-2xl font-serif font-bold text-stone-100 mt-1">
                    {metrics.totalCustomers}
                  </h3>
                  <span className="text-[10px] text-stone-400 font-semibold mt-1 inline-block">
                    Distinct verified phones
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Low Stock Callout */}
            {metrics.lowStockAlerts > 0 && (
              <div className="p-4 bg-rose-950/40 border border-rose-700/50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-200">
                      Inventory Warning: {metrics.lowStockAlerts} dry fruit products need replenishment
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Items like Chilgoza Pine Nuts or Kashmiri Walnuts are running close to threshold.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  Restock Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT & SMART FILTERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-stone-900 p-4 rounded-2xl border border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                <span className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Smart Order Filtering Engine
                </span>
                <span className="text-stone-400 font-normal">
                  Found {filteredOrders.length} matching records
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* Search input */}
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Search Phone / Order ID</label>
                  <input
                    type="text"
                    value={orderSearchPhone}
                    onChange={(e) => setOrderSearchPhone(e.target.value)}
                    placeholder="e.g. 987654 or ORD-"
                    className="w-full px-3 py-1.5 bg-stone-950 border border-amber-900/50 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Order Status */}
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Fulfillment Status</label>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-950 border border-amber-900/50 rounded-lg text-stone-100 text-xs focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Payment Status</label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-950 border border-amber-900/50 rounded-lg text-stone-100 text-xs focus:outline-none"
                  >
                    <option value="all">All Payments</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Date Window</label>
                  <select
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-stone-950 border border-amber-900/50 rounded-lg text-stone-100 text-xs focus:outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today Only</option>
                    <option value="7days">Last 7 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Interactive Table */}
            <div className="bg-stone-900 rounded-2xl border border-amber-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] border-b border-stone-800">
                    <tr>
                      <th className="p-3.5">Order ID &amp; Date</th>
                      <th className="p-3.5">Customer &amp; Mobile</th>
                      <th className="p-3.5">Items &amp; Weights</th>
                      <th className="p-3.5">Total &amp; Payment</th>
                      <th className="p-3.5">Inline Status Changer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-stone-500 italic">
                          No matching orders found. Adjust your filters above.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-800/40 transition">
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-bold text-amber-300 block">{ord.id}</span>
                            <span className="text-[10px] text-stone-500 font-sans">
                              {new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-sans font-semibold text-stone-100 block">
                              {ord.customer_name}
                            </span>
                            <span className="text-stone-400 text-[11px] block">{ord.mobile_number}</span>
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <div className="space-y-0.5 font-sans text-[11px] text-stone-300">
                              {ord.items.map((i, idx) => (
                                <div key={idx} className="truncate">
                                  • {i.title} ({i.weight}) × {i.quantity}
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-serif font-bold text-amber-300 block text-sm">
                              ₹{ord.total_amount}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded inline-block ${
                                ord.payment_status === 'completed'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : 'bg-amber-950 text-amber-400'
                              }`}
                            >
                              {ord.payment_status}
                            </span>
                          </td>

                          {/* Inline Status Changer (Simulates Supabase Update Trigger) */}
                          <td className="p-3.5 whitespace-nowrap">
                            <select
                              value={ord.order_status}
                              onChange={(e) =>
                                updateOrderStatus(ord.id, e.target.value as OrderStatus)
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                                ord.order_status === 'delivered'
                                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                                  : ord.order_status === 'shipped'
                                  ? 'bg-blue-950 border-blue-700 text-blue-300'
                                  : ord.order_status === 'packed'
                                  ? 'bg-amber-950 border-amber-700 text-amber-300'
                                  : 'bg-stone-950 border-stone-700 text-stone-300'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & WEIGHT TIERS MANAGER */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-amber-200">
                  Product Catalog &amp; Weight Tiers
                </h3>
                <p className="text-xs text-stone-400">
                  Manage inventory stock, multi-pack prices (250g, 500g, 1kg), and image assets.
                </p>
              </div>

              <button
                onClick={() => onOpenProductModal(null)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Dry Fruit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-stone-900 p-4 rounded-2xl border border-amber-900/40 flex flex-col justify-between space-y-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-16 h-16 rounded-xl object-cover bg-stone-950 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-amber-500 font-semibold uppercase">
                          {prod.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            prod.stock <= 25 ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                          }`}
                        >
                          {prod.stock} in stock
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-stone-100 text-sm truncate">
                        {prod.title}
                      </h4>
                      <p className="text-stone-400 text-[11px] line-clamp-1">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  {/* Weight Tiers Table */}
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-800 text-[11px] space-y-1">
                    <span className="text-[10px] text-stone-400 font-semibold block">
                      Configured Weight Tiers:
                    </span>
                    <div className="grid grid-cols-3 gap-1 text-center font-mono">
                      {prod.weight_options.map((w) => (
                        <div key={w.weight} className="bg-stone-900 p-1 rounded">
                          <span className="text-stone-400 text-[10px] block">{w.weight}</span>
                          <span className="text-amber-300 font-bold">₹{w.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-stone-500 font-mono">ID: {prod.id}</span>
                    <button
                      onClick={() => onOpenProductModal(prod)}
                      className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Tiers</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CATEGORY CATALOG MANAGER */}
        {activeTab === 'categories' && <AdminCategoryManager />}

        {/* TAB: BANNER & PROMOTIONAL OFFERS MANAGER */}
        {activeTab === 'banners' && <AdminBannerManager />}

        {/* TAB 5: REAL-TIME ACTIVITY AUDIT LOG */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif font-bold text-base text-amber-200">
                Immutable Real-Time Activity Audit Trail
              </h3>
              <p className="text-xs text-stone-400">
                Every administrative edit, order status transition, and catalog modification is recorded in Supabase <code>public.audit_logs</code>.
              </p>
            </div>

            <div className="bg-stone-900 rounded-2xl border border-amber-900/40 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] border-b border-stone-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Target Table</th>
                    <th className="p-3.5">Entity ID</th>
                    <th className="p-3.5">Summary of Changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-stone-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-800/40">
                      <td className="p-3.5 whitespace-nowrap text-stone-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action === 'CREATE'
                              ? 'bg-emerald-950 text-emerald-400'
                              : log.action === 'STATUS_CHANGE'
                              ? 'bg-amber-950 text-amber-400'
                              : 'bg-blue-950 text-blue-400'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-amber-400">{log.target_table}</td>
                      <td className="p-3.5 text-stone-400">{log.target_id}</td>
                      <td className="p-3.5 text-stone-200 font-sans">{log.changes_summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
