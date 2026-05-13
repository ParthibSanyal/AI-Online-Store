const Groq = require('groq-sdk');
const Product = require('../models/Product');
const { AILog } = require('../models/index');
const User = require('../models/User');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('viewedProducts', 'name category brand tags price');
    const { limit = 8 } = req.query;

    const categories = user.preferences?.categories?.length
      ? user.preferences.categories
      : [...new Set(user.viewedProducts.map(p => p.category))].slice(0, 3);

    let products = [];
    if (categories.length > 0) {
      products = await Product.find({ category: { $in: categories }, isActive: true, _id: { $nin: user.viewedProducts.map(p => p._id) } })
        .sort('-ratings.average -soldCount')
        .limit(Number(limit));
    }

    if (products.length < limit) {
      const trending = await Product.find({ isActive: true, isTrending: true, _id: { $nin: products.map(p => p._id) } })
        .limit(Number(limit) - products.length);
      products = [...products, ...trending];
    }

    await AILog.create({ user: req.user._id, type: 'recommendation', input: { categories }, output: { count: products.length }, model: 'rule-based' });

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const similar = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { category: product.category },
        { brand: product.brand },
        { tags: { $in: product.tags } },
      ],
    }).sort('-ratings.average').limit(8);

    res.json({ success: true, products: similar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort('-viewCount -soldCount')
      .limit(12);

    // Auto-mark top products as trending
    const ids = products.slice(0, 6).map(p => p._id);
    await Product.updateMany({ _id: { $nin: ids } }, { isTrending: false });
    await Product.updateMany({ _id: { $in: ids } }, { isTrending: true });

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.chatbot = async (req, res) => {
  try {
    const { messages, sessionProducts } = req.body;

    // Fetch some product context
    const products = await Product.find({ isActive: true }).sort('-ratings.average').limit(20).select('name category price discountPrice brand ratings');
    const productContext = products.map(p => `${p.name} (${p.category}) - ₹${p.discountPrice || p.price}, Rating: ${p.ratings.average}/5`).join('\n');

    const systemPrompt = `You are ShopBot, an AI shopping assistant for AI Shop — an intelligent e-commerce platform. 
Be helpful, friendly, and concise. Help users find products, compare options, suggest gifts, and answer shopping questions.
Current available products sample:
${productContext}
Keep responses under 150 words. If asked about a specific product, suggest relevant ones from the catalog.`;

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10),
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';

    await AILog.create({
      user: req.user?._id,
      type: 'chatbot',
      input: { messageCount: messages.length },
      output: { reply: reply.substring(0, 100) },
      model: 'llama-3.3-70b-versatile',
      tokensUsed: completion.usage?.total_tokens,
    });

    res.json({ success: true, reply });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ success: false, message: 'AI service temporarily unavailable', reply: 'I\'m having trouble connecting. Please try again shortly.' });
  }
};

exports.smartSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Query required' });

    // Use Groq to extract intent
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Extract search intent from: "${query}". Return JSON only: {"keywords": string, "category": string|null, "maxPrice": number|null, "minRating": number|null}`,
      }],
      max_tokens: 100,
      response_format: { type: 'json_object' },
    });

    let intent = {};
    try {
      intent = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch {}

    const searchQuery = { isActive: true };
    if (intent.keywords) searchQuery.$text = { $search: intent.keywords };
    if (intent.category) searchQuery.category = new RegExp(intent.category, 'i');
    if (intent.maxPrice) searchQuery.price = { $lte: intent.maxPrice };
    if (intent.minRating) searchQuery['ratings.average'] = { $gte: intent.minRating };

    const products = await Product.find(searchQuery).sort('-ratings.average').limit(20);

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $push: { searchHistory: { query, at: new Date() } } });
    }

    res.json({ success: true, products, intent });
  } catch (err) {
    // Fallback to text search
    const products = await Product.find({ isActive: true, $text: { $search: req.body.query } }).limit(20);
    res.json({ success: true, products });
  }
};



exports.getLiveAnalysis = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    const User = require('../models/User');

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      recentOrders,
      topProducts,
      revenue,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.find().sort('-createdAt').limit(5).populate('user', 'name'),
      Product.find().sort('-viewCount').limit(5).select('name viewCount soldCount'),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    // Use Groq to generate analysis
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `Analyze this e-commerce data and give 3 short business insights:
    - Total Users: ${totalUsers}
    - Total Orders: ${totalOrders}
    - Total Products: ${totalProducts}
    - Total Revenue: ₹${revenue[0]?.total || 0}
    - Top Product: ${topProducts[0]?.name} (${topProducts[0]?.viewCount} views)
    Keep each insight under 20 words. Be direct and actionable.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    const insights = completion.choices[0]?.message?.content || 'Analysis unavailable';

    res.json({
      success: true,
      stats: { totalUsers, totalOrders, totalProducts, revenue: revenue[0]?.total || 0 },
      topProducts,
      recentOrders,
      aiInsights: insights,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};