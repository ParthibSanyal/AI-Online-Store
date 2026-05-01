import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import { ProductCard, ProductSkeleton, EmptyState } from '../../components/common/LoadingScreen';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiIntent, setAiIntent] = useState(null);
  const [useAI, setUseAI] = useState(true);

  useEffect(() => {
    if (!q) return;
    const search = async () => {
      setLoading(true);
      try {
        if (useAI) {
          const { data } = await api.post('/ai/smart-search', { query: q });
          setProducts(data.products);
          setAiIntent(data.intent);
        } else {
          const { data } = await api.get(`/products?search=${encodeURIComponent(q)}`);
          setProducts(data.products);
          setAiIntent(null);
        }
      } catch {
        const { data } = await api.get(`/products?search=${encodeURIComponent(q)}`);
        setProducts(data.products);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [q, useAI]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-6 h-6 text-gray-400" />
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Results for "<span className="gradient-text">{q}</span>"
          </h1>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-gray-500 text-sm">{products.length} products found</p>
          <button
            onClick={() => setUseAI(!useAI)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${useAI ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {useAI ? 'AI Search ON' : 'AI Search OFF'}
          </button>
        </div>
        {aiIntent && useAI && (
          <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-sm">
            <span className="font-semibold text-primary-700 dark:text-primary-300">AI understood: </span>
            <span className="text-gray-600 dark:text-gray-400">
              {aiIntent.keywords && `Keywords: "${aiIntent.keywords}"`}
              {aiIntent.category && ` · Category: ${aiIntent.category}`}
              {aiIntent.maxPrice && ` · Budget: ₹${aiIntent.maxPrice}`}
              {aiIntent.minRating && ` · Min Rating: ${aiIntent.minRating}★`}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results found"
          message={`We couldn't find any products matching "${q}". Try a different search term.`}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
