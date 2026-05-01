import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: 100, validUntil: '', applicableCategories: '' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get('/coupons').then(({ data }) => setCoupons(data.coupons)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount) || 0, maxDiscountAmount: Number(form.maxDiscountAmount) || undefined, usageLimit: Number(form.usageLimit) };
      const { data } = await api.post('/coupons', payload);
      setCoupons(c => [data.coupon, ...c]);
      setForm(EMPTY);
      setShowForm(false);
      toast.success('Coupon created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create coupon'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(c => c.filter(cp => cp._id !== id));
      toast.success('Coupon deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">{coupons.length} active coupons</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Create Coupon</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'code', label: 'Coupon Code', placeholder: 'SAVE20', required: true },
              { key: 'description', label: 'Description', placeholder: 'Get 20% off' },
            ].map(({ key, label, placeholder, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input type="text" placeholder={placeholder} required={required} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value.toUpperCase() }))} className="input uppercase" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="input">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            {[
              { key: 'discountValue', label: form.discountType === 'percentage' ? 'Discount %' : 'Discount ₹', placeholder: '20', required: true },
              { key: 'minOrderAmount', label: 'Min Order ₹', placeholder: '500' },
              { key: 'maxDiscountAmount', label: 'Max Discount ₹', placeholder: '200' },
              { key: 'usageLimit', label: 'Usage Limit', placeholder: '100' },
            ].map(({ key, label, placeholder, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input type="number" placeholder={placeholder} required={required} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Valid Until *</label>
              <input type="datetime-local" required value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="input" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
              <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create Coupon'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-6">
        {loading ? (
          <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No coupons yet. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 font-medium">Discount</th>
                  <th className="pb-3 font-medium">Min Order</th>
                  <th className="pb-3 font-medium">Usage</th>
                  <th className="pb-3 font-medium">Valid Until</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {coupons.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3">
                      <p className="font-mono font-bold text-primary-600 dark:text-primary-400">{c.code}</p>
                      <p className="text-xs text-gray-500">{c.description}</p>
                    </td>
                    <td className="py-3 font-semibold">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                      {c.maxDiscountAmount && <span className="text-xs text-gray-500 block">Max ₹{c.maxDiscountAmount}</span>}
                    </td>
                    <td className="py-3 text-gray-500">₹{c.minOrderAmount || 0}</td>
                    <td className="py-3">{c.usedCount}/{c.usageLimit}</td>
                    <td className="py-3 text-gray-500">{new Date(c.validUntil).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`badge ${new Date(c.validUntil) > new Date() && c.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {new Date(c.validUntil) > new Date() && c.isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => handleDelete(c._id)} className="btn-icon text-red-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
