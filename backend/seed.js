require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');
};

const User = require('./models/User');
const Product = require('./models/Product');
const { Coupon } = require('./models/index');

const SAMPLE_PRODUCTS = [
  { name: 'Wireless Bluetooth Headphones Pro', description: 'Premium wireless headphones with 40hr battery life, active noise cancellation, and crystal clear audio. Perfect for music lovers and remote workers.', price: 4999, discountPrice: 2999, category: 'Electronics', subcategory: 'Audio', brand: 'SoundMaster', stock: 150, isFeatured: true, isTrending: true, tags: ['wireless', 'bluetooth', 'audio', 'headphones'], images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' }] },
  { name: 'Smart Fitness Watch Series 5', description: 'Track your health 24/7 with heart rate monitoring, GPS, sleep tracking, and 50+ workout modes. Water resistant up to 50m.', price: 8999, discountPrice: 5999, category: 'Electronics', subcategory: 'Wearables', brand: 'FitTech', stock: 80, isFeatured: true, isTrending: true, tags: ['smartwatch', 'fitness', 'health', 'gps'], images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' }] },
  { name: 'Premium Leather Wallet', description: 'Handcrafted genuine leather wallet with RFID blocking technology. Slim profile holds 12 cards and cash. Available in multiple colors.', price: 1499, discountPrice: 999, category: 'Fashion', subcategory: 'Accessories', brand: 'LeatherCraft', stock: 200, isFeatured: false, isTrending: true, tags: ['wallet', 'leather', 'rfid', 'slim'], images: [{ url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop' }] },
  { name: 'Mechanical Gaming Keyboard RGB', description: 'Full mechanical keyboard with Cherry MX switches, per-key RGB lighting, N-key rollover, and programmable macros. Built for serious gamers.', price: 6999, discountPrice: 4499, category: 'Electronics', subcategory: 'Gaming', brand: 'GamePro', stock: 60, isFeatured: true, isTrending: false, tags: ['keyboard', 'gaming', 'mechanical', 'rgb'], images: [{ url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop' }] },
  { name: 'Yoga Mat Premium Non-Slip', description: 'Extra thick 6mm yoga mat with non-slip texture, alignment lines, and carrying strap. Eco-friendly TPE material. Perfect for yoga, pilates, and home workouts.', price: 1999, discountPrice: 1299, category: 'Sports', subcategory: 'Yoga', brand: 'ZenFit', stock: 300, isFeatured: false, isTrending: true, tags: ['yoga', 'fitness', 'exercise', 'mat'], images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop' }] },
  { name: 'Stainless Steel Water Bottle 1L', description: 'Double-wall vacuum insulated water bottle keeps drinks cold 24hrs or hot 12hrs. BPA-free, leak-proof lid, and dishwasher safe.', price: 899, discountPrice: 599, category: 'Sports', subcategory: 'Hydration', brand: 'HydroFlow', stock: 500, isFeatured: false, isTrending: false, tags: ['bottle', 'hydration', 'insulated', 'stainless'], images: [{ url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop' }] },
  { name: 'Wireless Charging Pad 15W', description: 'Fast wireless charger compatible with all Qi-enabled devices. 15W max output, LED indicator, anti-slip base, and overcharge protection built-in.', price: 1299, discountPrice: 799, category: 'Electronics', subcategory: 'Chargers', brand: 'PowerUp', stock: 120, isFeatured: false, isTrending: true, tags: ['wireless', 'charging', 'qi', 'fast'], images: [{ url: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=400&fit=crop' }] },
  { name: 'Running Shoes Ultra Boost', description: 'Lightweight responsive running shoes with energy-return foam, breathable mesh upper, and durable rubber outsole. Ideal for long-distance running.', price: 5999, discountPrice: 3999, category: 'Sports', subcategory: 'Footwear', brand: 'SpeedRun', stock: 75, isFeatured: true, isTrending: true, tags: ['running', 'shoes', 'sports', 'lightweight'], images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' }] },
  { name: 'Aromatherapy Essential Oil Diffuser', description: 'Ultrasonic aromatherapy diffuser with 7-color LED lights, auto shut-off, and whisper-quiet operation. Creates a relaxing atmosphere in any room.', price: 1599, discountPrice: 999, category: 'Home & Kitchen', subcategory: 'Wellness', brand: 'AromaHome', stock: 90, isFeatured: false, isTrending: false, tags: ['aromatherapy', 'diffuser', 'wellness', 'home'], images: [{ url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop' }] },
  { name: 'Portable Bluetooth Speaker IPX7', description: '360-degree surround sound speaker with 20hr battery, IPX7 waterproof rating, and built-in microphone. Perfect for outdoor adventures.', price: 3499, discountPrice: 2299, category: 'Electronics', subcategory: 'Audio', brand: 'SoundMaster', stock: 110, isFeatured: true, isTrending: true, tags: ['bluetooth', 'speaker', 'waterproof', 'portable'], images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop' }] },
  { name: 'Silk Hair Care Set', description: 'Complete hair care routine with silk protein shampoo, deep conditioning mask, and leave-in serum. Sulfate-free formula for all hair types.', price: 2199, discountPrice: 1599, category: 'Beauty', subcategory: 'Hair Care', brand: 'SilkGlow', stock: 160, isFeatured: false, isTrending: false, tags: ['hair', 'silk', 'shampoo', 'conditioner'], images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop' }] },
  { name: 'JavaScript: The Good Parts', description: 'Essential reading for JavaScript developers. Learn the best practices, patterns, and features that make JavaScript a powerful programming language.', price: 599, discountPrice: 399, category: 'Books', subcategory: 'Programming', brand: "O'Reilly", stock: 250, isFeatured: false, isTrending: false, tags: ['javascript', 'programming', 'book', 'development'], images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop' }] },
  { name: 'Coffee Maker with Grinder 12-Cup', description: 'Built-in burr grinder with 12-cup capacity, programmable timer, and thermal carafe. Brew the perfect cup every morning from whole beans.', price: 8499, discountPrice: 5999, category: 'Home & Kitchen', subcategory: 'Coffee', brand: 'BrewMaster', stock: 40, isFeatured: true, isTrending: false, tags: ['coffee', 'kitchen', 'grinder', 'appliance'], images: [{ url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop' }] },
  { name: 'Laptop Stand Adjustable Aluminium', description: 'Premium aluminium laptop stand with 6 height levels, compatible with all laptops 10-17 inches. Improves posture and ventilation for better performance.', price: 1899, discountPrice: 1299, category: 'Electronics', subcategory: 'Accessories', brand: 'DeskPro', stock: 180, isFeatured: false, isTrending: true, tags: ['laptop', 'stand', 'ergonomic', 'aluminium'], images: [{ url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop' }] },
  { name: 'Organic Green Tea 100 Bags', description: 'Premium organic green tea sourced from the Darjeeling hills. Rich in antioxidants, each bag delivers a smooth, refreshing cup with health benefits.', price: 499, discountPrice: 349, category: 'Food', subcategory: 'Tea', brand: 'TeaGarden', stock: 400, isFeatured: false, isTrending: false, tags: ['tea', 'organic', 'green tea', 'health'], images: [{ url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop' }] },
  { name: 'Resistance Bands Set (5 levels)', description: 'Complete set of 5 resistance bands in varying difficulty levels. Made from natural latex, suitable for strength training, rehab, and flexibility exercises.', price: 799, discountPrice: 499, category: 'Sports', subcategory: 'Fitness', brand: 'FitZone', stock: 350, isFeatured: false, isTrending: true, tags: ['resistance', 'bands', 'fitness', 'training'], images: [{ url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop' }] },
];

const SAMPLE_COUPONS = [
  { code: 'WELCOME20', description: 'Welcome discount for new users', discountType: 'percentage', discountValue: 20, minOrderAmount: 500, maxDiscountAmount: 300, usageLimit: 1000, validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
  { code: 'FLAT100', description: '₹100 off on orders above ₹999', discountType: 'fixed', discountValue: 100, minOrderAmount: 999, usageLimit: 500, validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  { code: 'SALE50', description: '50% off on Electronics (max ₹500)', discountType: 'percentage', discountValue: 50, minOrderAmount: 1000, maxDiscountAmount: 500, usageLimit: 200, applicableCategories: ['Electronics'], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
];

async function seed() {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
    ]);

    // Create users
    console.log('👤 Creating users...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@aishop.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });

    const sellerUser = await User.create({
      name: 'Demo Seller',
      email: 'seller@aishop.com',
      password: 'seller123',
      role: 'seller',
      isEmailVerified: true,
      isActive: true,
    });

    await User.create({
      name: 'Demo Customer',
      email: 'user@aishop.com',
      password: 'user123',
      role: 'customer',
      isEmailVerified: true,
      isActive: true,
    });

    console.log('✅ Users created');

    // Create products
    console.log('📦 Creating products...');
    const productPromises = SAMPLE_PRODUCTS.map((p, i) =>
      Product.create({
        ...p,
        seller: i % 3 === 0 ? adminUser._id : sellerUser._id,
        ratings: { average: (3.5 + Math.random() * 1.5).toFixed(1), count: Math.floor(Math.random() * 200) + 5 },
        viewCount: Math.floor(Math.random() * 1000),
        soldCount: Math.floor(Math.random() * 500),
      })
    );
    await Promise.all(productPromises);
    console.log(`✅ ${SAMPLE_PRODUCTS.length} products created`);

    // Create coupons
    console.log('🎟️  Creating coupons...');
    await Coupon.insertMany(SAMPLE_COUPONS.map(c => ({ ...c, createdBy: adminUser._id })));
    console.log('✅ Coupons created');

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Demo Credentials:');
    console.log('   Admin   : admin@aishop.com  / admin123');
    console.log('   Seller  : seller@aishop.com / seller123');
    console.log('   Customer: user@aishop.com   / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
