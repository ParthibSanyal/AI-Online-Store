import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ICONS = { basic: Zap, premium: Star, enterprise: Crown };
const COLORS = { basic: 'from-blue-500 to-cyan-500', premium: 'from-primary-500 to-secondary-500', enterprise: 'from-amber-500 to-orange-500' };

export default function Subscription() {
  const [plans, setPlans] = useState({});
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState('');

  useEffect(() => {
    api.get('/subscription/plans').then(({ data }) => setPlans(data.plans));
    api.get('/subscription/my').then(({ data }) => setCurrent(data.subscription)).catch(() => {});
  }, []);

  const handleSubscribe = async (plan) => {
    setLoading(plan);
    try {
      const { data: orderData } = await api.post('/subscription/create-payment', { plan });

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'AI Shop Premium',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - Monthly`,
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          try {
            const { data } = await api.post('/subscription/verify-payment', {
              plan,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success(`🎉 Subscribed to ${plan} plan successfully!`);
            setCurrent(data.subscription);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'AI Shop User',
          email: '',
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setLoading('');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading('');
    }
  };

  const handleCancel = async () => {
    try {
      await api.put('/subscription/cancel');
      setCurrent(null);
      toast.success('Subscription cancelled');
    } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold gradient-text mb-3">Choose Your Plan</h1>
        <p className="text-gray-500">Unlock premium features and save more</p>
        {current && (
          <div className="mt-4 inline-flex items-center gap-2 badge-success px-4 py-2 rounded-xl">
            <Crown className="w-4 h-4" />
            Active: {current.plan} plan — expires {new Date(current.endDate).toLocaleDateString()}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([key, plan], i) => {
          const Icon = ICONS[key];
          const isActive = current?.plan === key;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card p-6 relative ${key === 'premium' ? 'ring-2 ring-primary-500 scale-105' : ''}`}
            >
              {key === 'premium' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-primary px-4 py-1 rounded-full text-xs font-bold">
                  Most Popular
                </div>
              )}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${COLORS[key]} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold capitalize mb-1">{key}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isActive ? (
                <button onClick={handleCancel} className="btn-danger w-full text-sm">Cancel Plan</button>
              ) : (
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={loading === key}
                  className={`w-full font-semibold py-2.5 rounded-xl transition-all ${key === 'premium' ? 'btn-primary' : 'btn-outline'}`}
                >
                  {loading === key ? 'Processing...' : `Get ${key}`}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}