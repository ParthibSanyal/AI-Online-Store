import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import { OrderStatusBadge } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

export function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/products').then(({ data }) => setProducts(data.products)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(p => p.filter(pr => pr._id !== id));
      toast.success('Product removed');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Products ({products.length})</h1>
        <Link to="/seller/products/add" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Product</Link>
      </div>
      <div className="card p-6">
        {loading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No products yet.</p>
            <Link to="/seller/products/add" className="btn-primary">Add Your First Product</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Sold</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]?.url || `https://picsum.photos/seed/${p._id}/40/40`} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                        <div>
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-semibold">₹{(p.discountPrice || p.price)?.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock < 10 ? 'badge-warning' : 'badge-success'}`}>{p.stock}</span>
                    </td>
                    <td className="py-3 text-gray-500">{p.soldCount || 0}</td>
                    <td className="py-3"><span className={`badge ${p.isActive ? 'badge-success' : 'badge-gray'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Link to={`/seller/products/edit/${p._id}`} className="btn-icon text-primary-500"><Edit2 className="w-4 h-4" /></Link>
                        <button onClick={() => handleDelete(p._id)} className="btn-icon text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default SellerProducts;
