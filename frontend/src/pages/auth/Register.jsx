import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, UserPlus, Shield, Phone } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'customer', phone: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
      });
      setUserId(data.userId);
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Please enter complete OTP'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-registration-otp', { userId, otp: otpString });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      toast.success('Account created successfully!');
      if (data.user.role === 'seller') navigate('/seller');
      else navigate('/');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`rotp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`rotp-${index - 1}`)?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { userId, purpose: 'register' });
      setOtp(['', '', '', '', '', '']);
      toast.success('OTP resent!');
    } catch { toast.error('Failed to resend'); }
    finally { setResending(false); }
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
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="reg-step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">Create an account</h2>
                <p className="text-gray-500 text-sm mb-6">Join thousands of smart shoppers</p>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email Address *</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Phone Number <span className="text-gray-400 text-xs">(optional — for SMS OTP)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="input pl-10"
                        placeholder="9876543210"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">If provided, future OTPs will be sent via SMS</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Account Type *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'customer', label: '🛍️ Customer', desc: 'Shop & discover' },
                        { value: 'seller', label: '🏪 Seller', desc: 'Sell products' },
                      ].map(opt => (
                        <label key={opt.value} className={`flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-all ${form.role === opt.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                          <input type="radio" name="role" value={opt.value} checked={form.role === opt.value} onChange={() => setForm(f => ({ ...f, role: opt.value }))} className="sr-only" />
                          <span className="font-semibold text-sm">{opt.label}</span>
                          <span className="text-xs text-gray-500">{opt.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password *</label>
                    <div className="relative">
                      <input type={show ? 'text' : 'password'} required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input pr-10" placeholder="Min. 6 characters" />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm Password *</label>
                    <input type="password" required value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} className="input" placeholder="Repeat password" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 h-12 mt-2">
                    <UserPlus className="w-4 h-4" />
                    {loading ? 'Sending OTP...' : 'Create Account'}
                  </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="reg-step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-6 shadow-glow">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Verify your email</h2>
                <p className="text-gray-500 text-sm mb-2">We sent a 6-digit OTP to</p>
                <p className="font-semibold text-primary-600 dark:text-primary-400 mb-8">{form.email}</p>
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`rotp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-bold input"
                      />
                    ))}
                  </div>
                  <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary w-full h-12">
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </button>
                </form>
                <div className="flex items-center justify-between mt-6">
                  <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">← Go back</button>
                  <button onClick={handleResend} disabled={resending} className="text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50">
                    {resending ? 'Resending...' : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
