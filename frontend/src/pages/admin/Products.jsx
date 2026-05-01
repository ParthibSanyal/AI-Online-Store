import { useEffect, useState } from 'react';
import { Search, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';
import { StarRating } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 30 });
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchProducts, 400);
    return () => clearTimeout(t);
  }, [search]);

  const deleteProduct = async (id) => {
    if (!confirm('Remove this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(p => p.filter(pr => pr._id !== id));
      toast.success('Product removed');
    } catch { toast.error('Failed to remove'); }
  };

  const toggleFeatured = async (id, current) => {
    try {
      await api.put(`/products/${id}`, { isFeatured: !current });
      setProducts(p => p.map(pr => pr._id === id ? { ...pr, isFeatured: !current } : pr));
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Product Management</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total products</p>
      </div>
      <div className="card p-6">
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium">Seller</th>
                <th className="pb-3 font-medium">Featured</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                Array(8).fill(0).map((_, i) => <tr key={i}><td colSpan={8} className="py-3"><div className="skeleton h-8 rounded" /></td></tr>)
              ) : products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.url || `https://picsum.photos/seed/${p._id}/40/40`} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                      <p className="font-medium line-clamp-1 max-w-[150px]">{p.name}</p>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500">{p.category}</td>
                  <td className="py-3 font-semibold">₹{(p.discountPrice || p.price)?.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock < 10 ? 'badge-warning' : 'badge-success'}`}>{p.stock}</span>
                  </td>
                  <td className="py-3"><StarRating rating={p.ratings?.average} count={p.ratings?.count} /></td>
                  <td className="py-3 text-gray-500">{p.seller?.name}</td>
                  <td className="py-3">
                    <button onClick={() => toggleFeatured(p._id, p.isFeatured)} className={`btn-icon ${p.isFeatured ? 'text-amber-500' : 'text-gray-400'}`}>
                      {p.isFeatured ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="py-3">
                    <button onClick={() => deleteProduct(p._id)} className="btn-icon text-red-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">No products found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default AdminProducts;
