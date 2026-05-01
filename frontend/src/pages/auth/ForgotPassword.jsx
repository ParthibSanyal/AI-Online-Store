import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Sparkles, Shield, Phone, KeyRound, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=enter contact, 2=enter OTP, 3=new password
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [resetToken, setResetToken] = useState('');
  const [userId, setUserId] = useState('');
  const [sentVia, setSentVia] = useState('');
  const [maskedContact, setMaskedContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  // Step 1 - Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { emailOrPhone });
      setUserId(data.userId);
      setSentVia(data.sentVia);
      setMaskedContact(data.maskedContact);
      setStep(2);
      toast.success(`OTP sent via ${data.sentVia === 'sms' ? 'SMS' : 'email'}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'User not found');
    } finally { setLoading(false); }
  };

  // Step 2 - Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Enter complete OTP'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-reset-otp', { userId, otp: otpString });
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  // Step 3 - Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${resetToken}`, { password: passwords.password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`fotp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`fotp-${index - 1}`)?.focus();
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { userId, purpose: 'reset' });
      setOtp(['', '', '', '', '', '']);
      toast.success('OTP resent!');
    } catch { toast.error('Failed to resend'); }
    finally { setResending(false); }
  };

  const STEPS = ['Request OTP', 'Verify OTP', 'New Password'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">AI Shop</span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i + 1 <= step ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium ${i + 1 === step ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${i + 1 < step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-8">
          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 1 && (
              <motion.div key="fp1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Forgot Password</h2>
                <p className="text-gray-500 text-sm mb-6">Enter your email or phone to receive an OTP</p>
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email or Phone Number</label>
                    <div className="relative">
                      {emailOrPhone.includes('@')
                        ? <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        : <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      }
                      <input
                        type="text"
                        required
                        value={emailOrPhone}
                        onChange={e => setEmailOrPhone(e.target.value)}
                        className="input pl-10"
                        placeholder="email@example.com or 9876543210"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full h-11">
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
                <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-primary-600 mt-6">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div key="fp2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Enter OTP</h2>
                <p className="text-gray-500 text-sm mb-1">OTP sent to</p>
                <p className="font-semibold text-primary-600 dark:text-primary-400 mb-8">
                  {maskedContact}
                  <span className="ml-2 text-xs text-gray-400">via {sentVia === 'sms' ? '📱 SMS' : '📧 Email'}</span>
                </p>
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`fotp-${i}`}
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
                  <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary w-full h-11">
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
                <div className="flex items-center justify-between mt-4">
                  <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">← Go back</button>
                  <button onClick={handleResend} disabled={resending} className="text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50">
                    {resending ? 'Resending...' : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div key="fp3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-1">New Password</h2>
                <p className="text-gray-500 text-sm mb-6">OTP verified! Set your new password.</p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={passwords.password}
                        onChange={e => setPasswords(p => ({ ...p, password: e.target.value }))}
                        className="input pr-10"
                        placeholder="Min. 6 characters"
                      />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={passwords.confirm}
                      onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                      className="input"
                      placeholder="Repeat password"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full h-11">
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
