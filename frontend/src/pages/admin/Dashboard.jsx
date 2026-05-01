import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users, ShoppingBag, Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { StatCard, OrderStatusBadge } from '../../components/common/LoadingScreen';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#6366f1','#d946ef','#f97316','#22c55e','#0ea5e9','#eab308'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    </div>
  );

  if (!data) return null;

  const monthlyData = data.monthlyRevenue?.map(d => ({
    month: MONTHS[d._id - 1],
    revenue: d.revenue,
    orders: d.orders,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={data.stats?.totalUsers?.toLocaleString()} icon={Users} color="primary" />
        <StatCard title="Total Products" value={data.stats?.totalProducts?.toLocaleString()} icon={ShoppingBag} color="secondary" />
        <StatCard title="Total Orders" value={data.stats?.totalOrders?.toLocaleString()} icon={Package} color="info" />
        <StatCard title="Total Revenue" value={`₹${(data.stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="success" />
      </div>

      {/* Alerts */}
      {data.stats?.pendingOrders > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
            {data.stats.pendingOrders} orders awaiting confirmation —{' '}
            <Link to="/admin/orders" className="underline">Review now</Link>
          </p>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Category Revenue Pie */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue by Category</h2>
          {data.categoryRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.categoryRevenue} dataKey="revenue" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                  {data.categoryRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No category data yet</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Orders</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#d946ef" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No order data yet</div>
          )}
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" /> Top Products
          </h2>
          <div className="space-y-3">
            {data.topProducts?.length > 0 ? data.topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-4">{i + 1}</span>
                <img src={p.images?.[0]?.url || `https://picsum.photos/seed/${p._id}/40/40`} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.soldCount} sold · ₹{p.price?.toLocaleString()}</p>
                </div>
              </div>
            )) : <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 font-medium">Order #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.recentOrders?.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3">
                    <Link to={`/admin/orders`} className="font-mono text-xs text-primary-600 dark:text-primary-400 hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3">{order.user?.name || '-'}</td>
                  <td className="py-3 font-semibold">₹{order.total?.toLocaleString()}</td>
                  <td className="py-3"><OrderStatusBadge status={order.orderStatus} /></td>
                  <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!data.recentOrders?.length && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
