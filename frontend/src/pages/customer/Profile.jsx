import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Lock, Bell, Shield, Plus, Trash2, Edit2, Save } from 'lucide-react';
import useAuthStore from '../../context/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security', label: 'Security', icon: Lock },
];

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [newAddr, setNewAddr] = useState(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const handleAddAddress = async () => {
    if (!newAddr?.street || !newAddr?.city || !newAddr?.pincode) { toast.error('Please fill all address fields'); return; }
    try {
      const { data } = await api.post('/users/address', newAddr);
      updateUser({ addresses: data.addresses });
      setNewAddr(null);
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (idx) => {
    try {
      const { data } = await api.delete(`/users/address/${idx}`);
      updateUser({ addresses: data.addresses });
      toast.success('Address removed');
    } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold shadow-glow">
          {user?.avatar ? <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" /> : user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{user?.name}</h1>
          <p className="text-gray-500">{user?.email}</p>
          <span className={`badge mt-1 ${user?.role === 'admin' ? 'badge-danger' : user?.role === 'seller' ? 'badge-warning' : 'badge-primary'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="font-bold text-lg mb-6">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input type="email" value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
              <input type="text" value={form.avatar || ''} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} placeholder="https://..." className="input" />
            </div>
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary mt-6 flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>
      )}

      {/* Addresses Tab */}
      {tab === 'addresses' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {user?.addresses?.map((addr, i) => (
            <div key={i} className="card p-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{addr.label || `Address ${i + 1}`}</p>
                  {addr.isDefault && <span className="badge-success text-xs">Default</span>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{addr.street}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-sm text-gray-500">{addr.country}</p>
              </div>
              <button onClick={() => handleDeleteAddress(i)} className="btn-icon text-red-400 hover:text-red-500 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {newAddr !== null ? (
            <div className="card p-6">
              <h3 className="font-semibold mb-4">New Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'label', label: 'Label', placeholder: 'Home / Office' },
                  { key: 'street', label: 'Street', placeholder: '123 Main Street' },
                  { key: 'city', label: 'City', placeholder: 'Mumbai' },
                  { key: 'state', label: 'State', placeholder: 'Maharashtra' },
                  { key: 'pincode', label: 'Pincode', placeholder: '400001' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={newAddr[key] || ''}
                      onChange={e => setNewAddr(a => ({ ...a, [key]: e.target.value }))}
                      className="input"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isDefault" checked={!!newAddr.isDefault} onChange={e => setNewAddr(a => ({ ...a, isDefault: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
                  <label htmlFor="isDefault" className="text-sm">Set as default</label>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleAddAddress} className="btn-primary">Save Address</button>
                <button onClick={() => setNewAddr(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setNewAddr({ label: '', street: '', city: '', state: '', pincode: '', country: 'India' })} className="btn-outline w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          )}
        </motion.div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-primary-500" /> Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password' },
                { key: 'newPassword', label: 'New Password' },
                { key: 'confirmPassword', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} className="input" required />
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-green-500" /> Two-Factor Authentication</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {user?.isTwoFactorEnabled
                ? '✅ 2FA is enabled. Your account is protected.'
                : '⚠️ Add an extra layer of security to your account.'}
            </p>
            {!user?.isTwoFactorEnabled && (
              <button className="btn-outline text-sm" onClick={() => toast('2FA setup coming soon!')}>
                Enable 2FA
              </button>
            )}
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-2">Email Verification</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {user?.isEmailVerified
                ? '✅ Your email is verified.'
                : '⚠️ Please verify your email address.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
