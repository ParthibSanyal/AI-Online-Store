import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, Image } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', shortDescription: '', price: '', discountPrice: '', category: '', subcategory: '', brand: '', stock: '', unit: 'piece', tags: '', images: [], isFeatured: false };
const CATEGORIES = ['Electronics','Fashion','Home & Kitchen','Books','Sports','Beauty','Toys','Automotive','Food','Health','Stationery','Furniture'];

function ProductForm({ initialData = EMPTY, onSubmit, loading, title }) {
  const [form, setForm] = useState(initialData);
  const [imageUrl, setImageUrl] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setForm(f => ({ ...f, images: [...f.images, { url: imageUrl.trim() }] }));
    setImageUrl('');
  };

  const removeImage = (i) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
      stock: Number(form.stock),
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="e.g. Wireless Bluetooth Headphones" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <input type="text" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className="input" placeholder="One-line summary" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Full Description *</label>
            <textarea required value={form.description} onChange={e => set('description', e.target.value)} rows={4} className="input resize-none" placeholder="Detailed product description..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select required value={form.category} onChange={e => set('category', e.target.value)} className="input">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subcategory</label>
            <input type="text" value={form.subcategory} onChange={e => set('subcategory', e.target.value)} className="input" placeholder="e.g. Headphones" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} className="input" placeholder="e.g. Sony" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input type="text" value={typeof form.tags === 'string' ? form.tags : form.tags?.join(', ')} onChange={e => set('tags', e.target.value)} className="input" placeholder="wireless, audio, music" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Pricing & Stock</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">MRP (₹) *</label>
            <input type="number" required min="0" value={form.price} onChange={e => set('price', e.target.value)} className="input" placeholder="1999" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selling Price (₹)</label>
            <input type="number" min="0" value={form.discountPrice} onChange={e => set('discountPrice', e.target.value)} className="input" placeholder="1499" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock *</label>
            <input type="number" required min="0" value={form.stock} onChange={e => set('stock', e.target.value)} className="input" placeholder="100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select value={form.unit} onChange={e => set('unit', e.target.value)} className="input">
              {['piece','kg','gram','litre','ml','meter','pack','set'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Product Images</h2>
        <div className="flex gap-2 mb-4">
          <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())} className="input flex-1" placeholder="Paste image URL..." />
          <button type="button" onClick={addImage} className="btn-outline flex-shrink-0 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {form.images?.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.url} alt="" className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <Image className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Add image URLs above</p>
          </div>
        )}
      </div>

      <div className="card p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-5 h-5 rounded accent-primary-600" />
          <div>
            <p className="font-medium">Mark as Featured</p>
            <p className="text-xs text-gray-500">Featured products appear on the homepage</p>
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex-1 sm:flex-none">
          {loading ? 'Saving...' : title}
        </button>
        <Link to="/seller/products" className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}

export function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/products', data);
      toast.success('Product created!');
      navigate('/seller/products');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/seller/products" className="btn-icon"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-display font-bold">Add New Product</h1>
      </div>
      <ProductForm onSubmit={handleSubmit} loading={loading} title="Create Product" />
    </div>
  );
}
export default AddProduct;

export function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => {
      const p = data.product;
      setProduct({ ...p, tags: p.tags?.join(', ') || '' });
    });
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/products/${id}`, data);
      toast.success('Product updated!');
      navigate('/seller/products');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  if (!product) return <div className="skeleton h-64 rounded-2xl" />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/seller/products" className="btn-icon"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-display font-bold">Edit Product</h1>
      </div>
      <ProductForm initialData={product} onSubmit={handleSubmit} loading={loading} title="Save Changes" />
    </div>
  );
}
