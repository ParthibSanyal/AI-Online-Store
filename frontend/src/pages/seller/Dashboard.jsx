import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, DollarSign, AlertTriangle, Plus } from 'lucide-react';
import api from '../../utils/api';
import { StatCard, OrderStatusBadge } from '../../components/common/LoadingScreen';

export default function SellerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/dashboard').then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Seller Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your products and orders</p>
        </div>
        <Link to="/seller/products/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Products" value={data?.stats?.totalProducts || 0} icon={ShoppingBag} color="primary" />
        <StatCard title="Total Orders" value={data?.stats?.totalOrders || 0} icon={Package} color="secondary" />
        <StatCard title="Revenue" value={`₹${(data?.stats?.revenue || 0).toLocaleString()}`} icon={DollarSign} color="success" />
        <StatCard title="Pending Orders" value={data?.stats?.pendingOrders || 0} icon={AlertTriangle} color="warning" />
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Products</h2>
          <Link to="/seller/products" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {data?.recentProducts?.length > 0 ? data.recentProducts.map(p => (
            <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
              <img src={p.images?.[0]?.url || `https://picsum.photos/seed/${p._id}/50/50`} className="w-12 h-12 rounded-lg object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-sm text-gray-500">₹{(p.discountPrice || p.price)?.toLocaleString()} · Stock: {p.stock}</p>
              </div>
              <Link to={`/seller/products/edit/${p._id}`} className="btn-ghost text-sm">Edit</Link>
            </div>
          )) : <p className="text-gray-400 text-sm text-center py-8">No products yet. <Link to="/seller/products/add" className="text-primary-600 hover:underline">Add your first product!</Link></p>}
        </div>
      </div>
    </div>
  );
}
