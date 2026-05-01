import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ArrowRight, Zap, Shield, Truck, RefreshCw, ChevronRight, Bot } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';
import { ProductCard, ProductSkeleton } from '../../components/common/LoadingScreen';

const CATEGORIES = [
  { name: 'Electronics', emoji: '📱', color: 'from-blue-500 to-cyan-500' },
  { name: 'Fashion', emoji: '👗', color: 'from-pink-500 to-rose-500' },
  { name: 'Home & Kitchen', emoji: '🏠', color: 'from-amber-500 to-orange-500' },
  { name: 'Books', emoji: '📚', color: 'from-green-500 to-emerald-500' },
  { name: 'Sports', emoji: '⚽', color: 'from-purple-500 to-violet-500' },
  { name: 'Beauty', emoji: '💄', color: 'from-red-500 to-pink-500' },
  { name: 'Toys', emoji: '🧸', color: 'from-yellow-500 to-amber-500' },
  { name: 'Automotive', emoji: '🚗', color: 'from-gray-600 to-gray-800' },
];

export default function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, trendingRes] = await Promise.all([
          api.get('/products?isFeatured=true&limit=8'),
          api.get('/ai/trending'),
        ]);
        setFeatured(featuredRes.data.products);
        setTrending(trendingRes.data.products);

        if (user) {
          const recRes = await api.get('/ai/recommendations?limit=8');
          setRecommendations(recRes.data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/search?q=${encodeURIComponent(searchQ)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-primary-950 to-gray-950 min-h-[580px] flex items-center">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 badge-primary mb-6 py-1.5 px-4">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Shopping Experience</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Shop Smarter with <span className="gradient-text">AI</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              Personalized recommendations, real-time tracking, and an AI assistant — all in one place. Discover products made for you.
            </p>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <input
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search anything..."
                className="input flex-1 h-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/20"
              />
              <button type="submit" className="btn-primary h-12 px-6 flex-shrink-0">
                Search
              </button>
            </form>
            <div className="flex items-center gap-6 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">50K+</p>
                <p className="text-xs text-gray-400">Products</p>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">10K+</p>
                <p className="text-xs text-gray-400">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">4.9★</p>
                <p className="text-xs text-gray-400">Avg Rating</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/30 to-secondary-500/30 border border-white/10 backdrop-blur-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4 shadow-glow-lg animate-float">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-white font-semibold">AI Shopping Assistant</p>
                  <p className="text-gray-400 text-sm mt-1">Powered by Groq AI</p>
                </div>
              </div>
              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 glass rounded-xl px-3 py-2 text-sm shadow-xl animate-float" style={{ animationDelay: '0.5s' }}>
                <span className="text-green-400 font-semibold">✓ AI Recommendations</span>
              </div>
              <div className="absolute -bottom-4 -left-4 glass rounded-xl px-3 py-2 text-sm shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <span className="text-primary-400 font-semibold">📦 Real-time Tracking</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹500', color: 'text-blue-500' },
            { icon: Shield, title: 'Secure Payment', desc: 'Razorpay & Stripe', color: 'text-green-500' },
            { icon: RefreshCw, title: 'Easy Returns', desc: '7-day hassle free', color: 'text-amber-500' },
            { icon: Sparkles, title: 'AI Powered', desc: 'Smart recommendations', color: 'text-primary-500' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Browse Categories</h2>
            <p className="section-sub">Find exactly what you're looking for</p>
          </div>
          <Link to="/products" className="btn-ghost flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {cat.emoji}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Recommendations */}
      {user && recommendations.length > 0 && (
  <section className="section bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-900 rounded-3xl mx-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">AI Picks For You</span>
              </div>
              <h2 className="section-title">Recommended</h2>
              <p className="section-sub">Personalized just for you</p>
            </div>
            <Link to="/products" className="btn-outline text-sm">See All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Trending */}
      <section className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-500">What's Hot</span>
            </div>
            <h2 className="section-title">Trending Now</h2>
            <p className="section-sub">Most loved by shoppers today</p>
          </div>
          <Link to="/products?isTrending=true" className="btn-ghost flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : trending.slice(0, 8).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)
          }
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="section">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-500">Hand-picked</span>
              </div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-sub">Curated selections you'll love</p>
            </div>
            <Link to="/products?isFeatured=true" className="btn-ghost flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      {!user && (
        <section className="section">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 p-12 text-center">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="relative">
              <h2 className="text-4xl font-display font-bold text-white mb-4">Start Shopping Smarter Today</h2>
              <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">Join thousands of happy shoppers and get personalized AI recommendations tailored just for you.</p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link to="/register" className="bg-white text-primary-600 hover:bg-primary-50 font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl">
                  Create Free Account
                </Link>
                <Link to="/products" className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-3 rounded-xl transition-all">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
