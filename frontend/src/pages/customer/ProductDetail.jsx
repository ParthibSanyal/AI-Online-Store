import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Heart, Share2, Star, ChevronLeft, Truck,
  Shield, RefreshCw, Package, Plus, Minus, Check, Store
} from 'lucide-react';
import api from '../../utils/api';
import useCartStore from '../../context/cartStore';
import { useWishlistStore } from '../../context/stores';
import useAuthStore from '../../context/authStore';
import { StarRating, ProductCard } from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  console.log('Product ID from URL:', id);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const inWishlist = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        console.log('Fetching product:', id);
        setProduct(data.product);
        setReviews(data.reviews);
        setActiveImg(0);
        const simRes = await api.get(`/ai/similar/${data.product._id}`);
        setSimilar(simRes.data.products);
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return navigate('/login'); }
    setAddingToCart(true);
    await addToCart(product._id, qty);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!user) return navigate('/login');
    await addToCart(product._id, qty);
    navigate('/cart');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/reviews', { ...reviewForm, productId: product._id });
      setReviews(prev => [data.review, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="skeleton h-10 w-1/3 rounded" />
          <div className="skeleton h-24 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const price = product.discountPrice || product.price;
  const images = product.images?.length ? product.images : [{ url: `https://picsum.photos/seed/${product._id}/600/600` }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.category}`} className="hover:text-primary-600">{product.category}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 dark:text-white truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square mb-4">
            <img
              src={images[activeImg]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercent > 0 && (
              <div className="absolute top-4 left-4 badge-danger px-3 py-1 text-sm font-bold rounded-xl">
                -{product.discountPercent}% OFF
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary-500' : 'border-transparent'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-2">{product.brand}</p>}
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-3">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <StarRating rating={product.ratings?.average} count={product.ratings?.count} size="md" />
            <span className="text-sm text-gray-500">{product.soldCount || 0} sold</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{price?.toLocaleString()}</span>
            {product.discountPrice && <span className="text-xl text-gray-400 line-through">₹{product.price?.toLocaleString()}</span>}
            {product.discountPercent > 0 && <span className="text-green-500 font-semibold">{product.discountPercent}% off</span>}
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-600 font-medium">In Stock ({product.stock} available)</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="btn-icon w-8 h-8">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="btn-icon w-8 h-8">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="btn-outline flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn-primary flex-1"
            >
              Buy Now
            </button>
            <button
              onClick={() => toggle(product._id)}
              className={`btn-icon w-12 h-12 border-2 ${inWishlist ? 'border-red-400 text-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            {[
              { icon: Truck, label: 'Fast Delivery', sub: '2-5 days' },
              { icon: Shield, label: 'Secure Pay', sub: 'Encrypted' },
              { icon: RefreshCw, label: 'Easy Return', sub: '7 days' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon className="w-5 h-5 text-primary-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                <span className="text-xs text-gray-500">{sub}</span>
              </div>
            ))}
          </div>

          {/* Seller */}
          {product.seller && (
            <div className="flex items-center gap-3 mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {product.seller.name?.[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.seller.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Store className="w-3 h-3" /> Verified Seller</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-8">Customer Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Summary */}
          <div className="card p-6">
            <div className="text-center mb-6">
              <p className="text-6xl font-bold gradient-text">{product.ratings?.average || 0}</p>
              <StarRating rating={product.ratings?.average} size="md" />
              <p className="text-sm text-gray-500 mt-1">{product.ratings?.count} reviews</p>
            </div>
            {[5, 4, 3, 2, 1].map(n => {
              const count = reviews.filter(r => r.rating === n).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-2 mb-2">
                  <span className="text-sm w-4">{n}</span>
                  <Star className="w-3.5 h-3.5 star-filled" />
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-6">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Review Form + List */}
          <div className="lg:col-span-2 space-y-6">
            {user && (
              <form onSubmit={handleReview} className="card p-6">
                <h3 className="font-semibold mb-4">Write a Review</h3>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                      <Star className={`w-6 h-6 cursor-pointer hover:scale-125 transition-transform ${n <= reviewForm.rating ? 'star-filled' : 'star-empty'}`} />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Review title (optional)"
                  value={reviewForm.title}
                  onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                  className="input mb-3"
                />
                <textarea
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  rows={3}
                  className="input mb-3 resize-none"
                  required
                />
                <button type="submit" disabled={submittingReview} className="btn-primary">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first!</p>
            ) : (
              reviews.map(review => (
                <div key={review._id} className="card-flat p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                        {review.user?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{review.user?.name}</p>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                    {review.isVerifiedPurchase && (
                      <span className="badge-success text-xs"><Check className="w-3 h-3" /> Verified</span>
                    )}
                  </div>
                  {review.title && <p className="font-semibold text-gray-900 dark:text-white mb-1">{review.title}</p>}
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similar.length > 0 && (
        <section>
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {similar.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
