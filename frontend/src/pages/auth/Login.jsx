import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, LogIn, Shield, Phone, Mail } from 'lucide-react';
import useAuthStore from '../../context/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [step, setStep] = useState(1); // 1=credentials, 2=otp
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState(null); // { userId, sentVia, maskedContact }
  const [resending, setResending] = useState(false);
  const { init } = useAuthStore();
  const navigate = useNavigate();

  const isPhone = form.emailOrPhone && !form.emailOrPhone.includes('@') && form.emailOrPhone.length > 0;

  // Step 1 - Submit credentials
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.requireOTP) {
        setLoginData(data);
        setStep(2);
        toast.success(`OTP sent via ${data.sentVia === 'sms' ? 'SMS' : 'email'} to ${data.maskedContact}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  // Step 2 - Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Please enter complete OTP'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-login-otp', {
        userId: loginData.userId,
        otp: otpString,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      await init();
      toast.success('Login successful!');
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'seller') navigate('/seller');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  // Handle OTP input boxes
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { userId: loginData.userId, purpose: 'login' });
      setOtp(['', '', '', '', '', '']);
      toast.success('OTP resent!');
    } catch { toast.error('Failed to resend OTP'); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-950 via-primary-950 to-gray-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-secondary-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-6 shadow-glow-lg animate-float">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">AI Shop</h1>
          <p className="text-primary-300 text-lg max-w-sm">The intelligent e-commerce platform powered by AI</p>
          <div className="mt-10 space-y-4 text-left">
            {['🔐 OTP-secured login via Email or SMS', '🤖 AI-powered recommendations', '📦 Real-time order tracking', '💳 Razorpay & UPI payments'].map(f => (
              <p key={f} className="text-gray-400 text-sm">{f}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">AI Shop</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
                <p className="text-gray-500 mb-8">Sign in with your email or phone number</p>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      {isPhone
                        ? <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        : <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      }
                      <input
                        type="text"
                        required
                        value={form.emailOrPhone}
                        onChange={e => setForm(f => ({ ...f, emailOrPhone: e.target.value }))}
                        className="input pl-10"
                        placeholder="email@example.com or 9876543210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        className="input pr-10"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end mt-1.5">
                      <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</Link>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 h-12">
                    <LogIn className="w-4 h-4" />
                    {loading ? 'Sending OTP...' : 'Continue'}
                  </button>
                </form>
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs text-gray-500 space-y-1">
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Demo Credentials:</p>
                  <p>Admin: admin@aishop.com / admin123</p>
                  <p>Seller: seller@aishop.com / seller123</p>
                  <p>Customer: user@aishop.com / user123</p>
                </div>
                <p className="text-center text-sm text-gray-500 mt-6">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Create one free</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-6 shadow-glow">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Verify OTP</h2>
                <p className="text-gray-500 mb-2">
                  We sent a 6-digit OTP to
                </p>
                <p className="font-semibold text-primary-600 dark:text-primary-400 mb-8">
                  {loginData?.maskedContact}
                  <span className="ml-2 text-xs text-gray-400">via {loginData?.sentVia === 'sms' ? '📱 SMS' : '📧 Email'}</span>
                </p>
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-bold input focus:ring-2 focus:ring-primary-500"
                      />
                    ))}
                  </div>
                  <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary w-full h-12 flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </form>
                <div className="flex items-center justify-between mt-6">
                  <button onClick={() => { setStep(1); setOtp(['','','','','','']); }} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    ← Change credentials
                  </button>
                  <button onClick={handleResend} disabled={resending} className="text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50">
                    {resending ? 'Resending...' : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
