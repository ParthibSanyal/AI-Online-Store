// ResetPassword.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">AI Shop</span>
        </div>
        <div className="card p-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-4">
            <KeyRound className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">Reset Password</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your new password below.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input pr-10" placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <input type="password" required value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} className="input" placeholder="Repeat password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full h-11">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <Link to="/login" className="flex items-center justify-center text-sm text-gray-500 hover:text-primary-600 mt-6">← Back to Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
export default ResetPassword;
