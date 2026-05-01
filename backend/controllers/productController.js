const mongoose = require('mongoose');
const Product = require('../models/Product');
const { Review } = require('../models/index');
const User = require('../models/User');

exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, search, category, subcategory, brand,
      minPrice, maxPrice, sort = '-createdAt', seller, isFeatured, isTrending,
    } = req.query;

    const query = { isActive: true };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = brand;
    if (seller) query.seller = seller;
    if (isFeatured === 'true') query.isFeatured = true;
    if (isTrending === 'true') query.isTrending = true;
    if (minPrice || maxPrice) {
      query.$or = [
        { discountPrice: { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) } },
        { price: { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('seller', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getProducts ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    console.log('getProduct called with id:', req.params.id);
    const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
    console.log('isValidId:', isValidId);

    const product = await Product.findOne({
      ...(isValidId ? { _id: req.params.id } : { slug: req.params.id }),
      isActive: true,
    }).populate('seller', 'name avatar email');

    console.log('product found:', product ? product.name : 'NULL');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
       $push: { viewedProducts: { $each: [product._id], $slice: -50 } },
      });
    }

    const reviews = await Review.find({ product: product._id })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .limit(20);

    console.log('reviews found:', reviews.length);
    res.json({ success: true, product, reviews });
  } catch (err) {
    console.error('getProduct ERROR FULL:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, seller: req.user._id });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin ? { _id: req.params.id } : { _id: req.params.id, seller: req.user._id };
    const product = await Product.findOne(filter);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, seller: req.user._id };
    const product = await Product.findOneAndUpdate(filter, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, subcategories: { $addToSet: '$subcategory' } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No images uploaded' });
    const images = req.files.map(f => ({ url: f.path, publicId: f.filename }));
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};