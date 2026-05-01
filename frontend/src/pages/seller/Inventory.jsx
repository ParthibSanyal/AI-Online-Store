import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Warehouse, AlertTriangle, ArrowLeft, Upload } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function SellerInventory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/inventory').then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Inventory Management</h1>
      {loading ? <div className="skeleton h-64 rounded-2xl" /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-semibold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Low Stock ({data?.lowStock?.length || 0})
            </h2>
            <div className="space-y-3">
              {data?.lowStock?.length > 0 ? data.lowStock.map(p => (
                <div key={p._id} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <img src={p.images?.[0]?.url || `https://picsum.photos/seed/${p._id}/40`} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">Stock: {p.stock}</p>
                  </div>
                  <Link to={`/seller/products/edit/${p._id}`} className="btn-secondary text-xs py-1 px-2">Update</Link>
                </div>
              )) : <p className="text-gray-400 text-sm text-center py-4">✅ All products well-stocked!</p>}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <Warehouse className="w-5 h-5" /> Out of Stock ({data?.outOfStock?.length || 0})
            </h2>
            <div className="space-y-3">
              {data?.outOfStock?.length > 0 ? data.outOfStock.map(p => (
                <div key={p._id} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <img src={p.images?.[0]?.url || `https://picsum.photos/seed/${p._id}/40`} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-red-600 dark:text-red-400">Out of stock</p>
                  </div>
                  <Link to={`/seller/products/edit/${p._id}`} className="btn-danger text-xs py-1 px-2">Restock</Link>
                </div>
              )) : <p className="text-gray-400 text-sm text-center py-4">✅ No out-of-stock products!</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SellerInventory;
