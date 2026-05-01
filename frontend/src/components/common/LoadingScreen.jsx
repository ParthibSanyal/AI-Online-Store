import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Package, ChevronLeft, ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { useWishlistStore } from '../../context/stores';
import useCartStore from '../../context/cartStore';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

// Loading Screen
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4 animate-pulse-slow shadow-glow-lg">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
export default LoadingScreen;

// Star Rating
export function StarRating({ rating = 0, count, size = 'sm', interactive = false, onRate }) {
  const s = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`${s} ${n <= Math.round(rating) ? 'star-filled' : 'star-empty'} ${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : ''}`}
          onClick={interactive ? () => onRate?.(n) : undefined}
        />
      ))}
      {count !== undefined && <span className="text-xs text-gray-500 ml-1">({count})</span>}
    </div>
  );
}

// Product Card
export function ProductCard({ product, index = 0 }) {
  const { toggle, isInWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const inWishlist = isInWishlist(product._id);
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to save items'); return; }
    await toggle(product._id);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add to cart'); return; }
    await addToCart(product._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/products/${product._id}`} onClick={(e) => e.stopPropagation()} className="product-card block h-full">
        <div className="relative overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800">
          <img
            src={product.images?.[0]?.url || `https://picsum.photos/seed/${product._id}/400/400`}
            alt={product.name}
            className="product-img w-full h-full"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <span className="badge-danger text-xs px-2 py-0.5 rounded-lg font-bold">
                -{product.discountPercent}%
              </span>
            )}
            {product.isTrending && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Hot
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-lg font-bold">
                Out of Stock
              </span>
            )}
          </div>
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${inWishlist ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500'}`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
          {/* Add to Cart Overlay */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
        <div className="p-4">
          {product.brand && <p className="text-xs text-primary-500 font-semibold uppercase tracking-wide mb-1">{product.brand}</p>}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>
          <StarRating rating={product.ratings?.average} count={product.ratings?.count} />
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">₹{price?.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">₹{product.price?.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Pagination
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="btn-icon disabled:opacity-40">
        <ChevronLeft className="w-5 h-5" />
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = pages <= 7 ? i + 1 : i === 0 ? 1 : i === 6 ? pages : page - 2 + i;
        return (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${p === page ? 'btn-primary py-0' : 'btn-ghost'}`}
          >
            {p}
          </button>
        );
      })}
      <button onClick={() => onPage(page + 1)} disabled={page >= pages} className="btn-icon disabled:opacity-40">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Empty State
export function EmptyState({ icon: Icon = Package, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{message}</p>
      {action}
    </div>
  );
}

// Skeleton
export function ProductSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-6 w-1/3 rounded mt-2" />
      </div>
    </div>
  );
}

// Stats Card
export function StatCard({ title, value, icon: Icon, color = 'primary', change }) {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-red-500 to-red-600',
    info: 'from-sky-500 to-sky-600',
  };
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Order Status Badge
export function OrderStatusBadge({ status }) {
  return <span className={`status-${status} capitalize`}>{status?.replace(/_/g, ' ')}</span>;
}
