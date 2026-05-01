import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Heart, Bell, Sun, Moon, Menu, X,
  User, Package, LogOut, ChevronDown, Sparkles, Truck, Home,
  Grid3X3, ShoppingCart
} from 'lucide-react';
import useAuthStore from '../../context/authStore';
import useCartStore from '../../context/cartStore';
import { useThemeStore, useNotifStore, useWishlistStore } from '../../context/stores';
import toast from 'react-hot-toast';

export default function CustomerLayout() {
  const { user, logout } = useAuthStore();
  const { getCount, fetchCart } = useCartStore();
  const { dark, toggle } = useThemeStore();
  const { unread, fetch: fetchNotifs, push: pushNotif } = useNotifStore();
  const { fetch: fetchWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const socketRef = useRef(null);
  const cartCount = getCount();

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchNotifs();
      fetchWishlist();

      // Socket connection
      const socket = io(import.meta.env.VITE_API_URL || '', { path: '/socket.io', transports: ['websocket'] });
      socketRef.current = socket;
      socket.emit('join', user._id);
      socket.on('notification', (notif) => {
        pushNotif(notif);
        toast(notif.title, { icon: '🔔' });
      });
      socket.on('orderUpdate', ({ status }) => toast(`Order ${status}`, { icon: '📦' }));
      return () => socket.disconnect();
    }
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Grid3X3 },
    { to: '/orders', label: 'My Orders', icon: Package, auth: true },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, auth: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text hidden sm:block">AI Shop</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="input pl-10 h-10 text-sm"
              />
            </div>
          </form>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.filter(l => !l.auth || user).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`btn-ghost text-sm ${location.pathname === link.to ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 ml-auto lg:ml-0">
            {/* Dark mode */}
            <button onClick={toggle} className="btn-icon" title="Toggle theme">
              {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>

            {user && (
              <>
                {/* Notifications */}
                <Link to="/notifications" className="btn-icon relative">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {unread > 0 && <span className="notif-dot">{unread > 9 ? '9+' : unread}</span>}
                </Link>

                {/* Wishlist */}
                <Link to="/wishlist" className="btn-icon hidden sm:flex">
                  <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Link>
              </>
            )}

            {/* Cart */}
            <Link to="/cart" className="btn-icon relative">
              <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {cartCount > 0 && <span className="notif-dot">{cartCount > 9 ? '9+' : cartCount}</span>}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.avatar ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /> : user.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block max-w-[80px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 card py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Join Free</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="btn-icon lg:hidden">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navLinks.filter(l => !l.auth || user).map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <link.icon className="w-4 h-4" /> {link.label}
                  </Link>
                ))}
                {!user && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-center text-sm py-2">Sign In</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center text-sm py-2">Join Free</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Page Content */}
      <main className="flex-1 page-enter">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-xl text-white">AI Shop</span>
              </div>
              <p className="text-sm leading-relaxed">Your intelligent shopping companion — powered by AI for the best recommendations.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/products?isFeatured=true" className="hover:text-white transition-colors">Featured</Link></li>
                <li><Link to="/products?isTrending=true" className="hover:text-white transition-colors">Trending</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Account</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
                <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white cursor-pointer transition-colors">Help Center</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Track Order</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Returns</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2025 AI Shop. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-primary-400" />
              <span>Free shipping on orders above ₹500</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
