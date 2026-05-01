import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import { ProductCard, ProductSkeleton, Pagination, EmptyState } from '../../components/common/LoadingScreen';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratings.average', label: 'Top Rated' },
  { value: '-soldCount', label: 'Best Selling' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const isFeatured = searchParams.get('isFeatured') || '';
  const isTrending = searchParams.get('isTrending') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sort });
      if (category) params.set('category', category);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (isFeatured) params.set('isFeatured', isFeatured);
      if (isTrending) params.set('isTrending', isTrending);

      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, category, sort, minPrice, maxPrice, isFeatured, isTrending]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFilters = [category, minPrice, maxPrice, isFeatured, isTrending].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-start gap-8">
        {/* Sidebar Filters */}
        <aside className={`
          ${filtersOpen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto p-6' : 'hidden'}
          lg:block lg:static lg:bg-transparent lg:p-0 lg:z-auto
          w-64 flex-shrink-0
        `}>
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="font-bold text-lg">Filters</h2>
            <button onClick={() => setFiltersOpen(false)} className="btn-icon"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setParam('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!category ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => setParam('category', cat._id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between ${category === cat._id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <span>{cat._id}</span>
                    <span className="text-xs text-gray-400">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={e => setParam('minPrice', e.target.value)}
                  className="input text-sm py-2"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={e => setParam('maxPrice', e.target.value)}
                  className="input text-sm py-2"
                />
              </div>
            </div>
            {/* Type */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Product Type</h3>
              <div className="space-y-2">
                {[
                  { key: 'isFeatured', label: '⭐ Featured' },
                  { key: 'isTrending', label: '🔥 Trending' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={searchParams.get(key) === 'true'}
                      onChange={e => setParam(key, e.target.checked ? 'true' : '')}
                      className="w-4 h-4 rounded accent-primary-500"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="btn-outline w-full text-sm">
                Clear All Filters ({activeFilters})
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                {category || (isFeatured ? 'Featured' : isTrending ? 'Trending' : 'All Products')}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{total} products found</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="btn-secondary text-sm lg:hidden flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {activeFilters > 0 && `(${activeFilters})`}
              </button>
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setParam('sort', e.target.value)}
                  className="input text-sm py-2 pr-8 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try adjusting your filters or search for something else."
              action={<button onClick={clearFilters} className="btn-primary">Clear Filters</button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
              <Pagination
                page={page}
                pages={pages}
                onPage={(p) => setParam('page', p)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
