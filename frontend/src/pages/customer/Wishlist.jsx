// Wishlist.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../../context/stores';
import useCartStore from '../../context/cartStore';
import { EmptyState, StarRating } from '../../components/common/LoadingScreen';

export function Wishlist() {
  const { wishlist, fetch, toggle } = useWishlistStore();
  const { addToCart } = useCartStore();
  useEffect(() => { fetch(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-6">My Wishlist ({wishlist?.products?.length || 0})</h1>
      {!wishlist?.products?.length ? (
        <EmptyState icon={Heart} title="Wishlist is empty" message="Save products you love." action={<Link to="/products" className="btn-primary">Browse Products</Link>} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.products.map(p => {
            if (!p._id) return null;
            const price = p.discountPrice || p.price;
            return (
              <div key={p._id} className="card overflow-hidden group">
                <Link to={`/products/${p._id}`} className="block relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img src={p.images?.[0]?.url || `https://picsum.photos/seed/${p._id}/300/300`} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </Link>
                <div className="p-4">
                  <Link to={`/products/${p._id}`} className="font-semibold text-sm line-clamp-2 hover:text-primary-600">{p.name}</Link>
                  <StarRating rating={p.ratings?.average} count={p.ratings?.count} />
                  <p className="font-bold text-gray-900 dark:text-white mt-1">₹{price?.toLocaleString()}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => addToCart(p._id)} className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5" /> Cart
                    </button>
                    <button onClick={() => toggle(p._id)} className="btn-icon border border-red-200 text-red-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default Wishlist;
