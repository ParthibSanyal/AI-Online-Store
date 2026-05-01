import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Sparkles } from 'lucide-react';
import api from '../../utils/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-12 max-w-md w-full text-center">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">AI Shop</span>
        </div>
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
            <p className="text-gray-500 mb-6">Your email has been verified. You can now sign in.</p>
            <Link to="/login" className="btn-primary">Sign In Now</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-6">This link is invalid or has expired.</p>
            <Link to="/login" className="btn-primary">Back to Login</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
