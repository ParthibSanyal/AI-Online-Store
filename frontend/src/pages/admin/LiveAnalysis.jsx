import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Users, ShoppingBag, DollarSign, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

export default function LiveAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data: res } = await api.get('/ai/live-analysis');
      setData(res);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const refresh = () => { setRefreshing(true); load(); };

  if (loading) return <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Live Analysis</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered real-time business insights</p>
        </div>
        <button onClick={refresh} disabled={refreshing} className="btn-outline flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: data?.stats?.totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Total Orders', value: data?.stats?.totalOrders, icon: ShoppingBag, color: 'from-primary-500 to-secondary-500' },
          { label: 'Products', value: data?.stats?.totalProducts, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
          { label: 'Revenue', value: `₹${data?.stats?.revenue?.toLocaleString()}`, icon: DollarSign, color: 'from-amber-500 to-orange-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary-500" /> AI Business Insights
        </h2>
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-5">
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
            {data?.aiInsights}
          </pre>
        </div>
      </div>

      {/* Top Products */}
      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" /> Most Viewed Products
        </h2>
        <div className="space-y-3">
          {data?.topProducts?.map((p, i) => (
            <div key={p._id} className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-400 w-4">{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{p.name}</p>
                <div className="flex gap-4 mt-1">
                  <span className="text-xs text-gray-500">{p.viewCount} views</span>
                  <span className="text-xs text-green-500">{p.soldCount} sold</span>
                </div>
              </div>
              <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                  style={{ width: `${Math.min((p.viewCount / (data?.topProducts[0]?.viewCount || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}