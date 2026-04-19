const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

// Helper: picsum always works — each id always returns an image
const img = (id, w = 600, h = 600) => `https://picsum.photos/id/${id}/${w}/${h}`;

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopverse');
    console.log('Connected to MongoDB');

    await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany()]);
    console.log('Cleared existing data');

    await User.create({ name: 'Admin User', email: 'admin@shopverse.com', password: 'admin123', role: 'admin' });
    await User.create({
      name: 'John Doe', email: 'john@example.com', password: 'user123', role: 'user',
      addresses: [{ fullName: 'John Doe', phone: '9876543210', street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India', isDefault: true }]
    });
    console.log('Created users');

    const categories = await Category.insertMany([
      { name: 'Electronics', slug: 'electronics', description: 'Gadgets and devices', image: img(1) },
      { name: 'Clothing', slug: 'clothing', description: 'Men & women apparel', image: img(2) },
      { name: 'Footwear', slug: 'footwear', description: 'Shoes & sneakers', image: img(21) },
      { name: 'Accessories', slug: 'accessories', description: 'Watches, bags & more', image: img(175) },
      { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home appliances', image: img(164) },
      { name: 'Beauty', slug: 'beauty', description: 'Beauty & personal care', image: img(64) },
      { name: 'Books', slug: 'books', description: 'Books & literature', image: img(24) },
      { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Sports & gym gear', image: img(26) }
    ]);
    console.log('Created categories');
    const [electronics, clothing, footwear, accessories, homeKitchen, beauty, books, sports] = categories;

    const products = [
      // ═══ ELECTRONICS (10) ═══
      { name: 'iPhone 15 Pro Max', description: 'Latest Apple iPhone with A17 Pro chip, titanium design, 48MP camera system, and USB-C. 6.7-inch Super Retina XDR display with ProMotion technology.', price: 134900, mrp: 159900, category: electronics._id, brand: 'Apple', stock: 50, ratings: 4.8, numReviews: 234, isFeatured: true,
        images: [{ url: img(160), public_id: 'p1' }], tags: ['smartphone', 'apple', 'premium'], features: ['A17 Pro Chip', '48MP Camera', 'Titanium Design', 'USB-C'] },

      { name: 'Samsung Galaxy S24 Ultra', description: 'Samsung flagship with Galaxy AI, S Pen, 200MP camera, Snapdragon 8 Gen 3. 6.8-inch Dynamic AMOLED 120Hz display.', price: 129999, mrp: 144999, category: electronics._id, brand: 'Samsung', stock: 45, ratings: 4.7, numReviews: 189, isFeatured: true,
        images: [{ url: img(180), public_id: 'p2' }], tags: ['smartphone', 'samsung', 'premium'], features: ['Galaxy AI', '200MP Camera', 'S Pen'] },

      { name: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise canceling wireless headphones with exceptional sound quality, 30-hour battery life, and multipoint connection.', price: 26990, mrp: 34990, category: electronics._id, brand: 'Sony', stock: 80, ratings: 4.6, numReviews: 456,
        images: [{ url: img(367), public_id: 'p3' }], tags: ['headphones', 'wireless', 'noise-canceling'], features: ['30hr Battery', 'ANC', 'Multipoint'] },

      { name: 'MacBook Air M3 Laptop', description: 'Supercharged by M3 chip. Up to 18 hours battery. 13.6-inch Liquid Retina display. Fanless design in four stunning finishes.', price: 114900, mrp: 129900, category: electronics._id, brand: 'Apple', stock: 30, ratings: 4.9, numReviews: 120, isFeatured: true,
        images: [{ url: img(0), public_id: 'p4' }], tags: ['laptop', 'apple', 'premium'], features: ['M3 Chip', '18hr Battery', 'Liquid Retina'] },

      { name: 'JBL Flip 6 Bluetooth Speaker', description: 'Portable Bluetooth speaker with JBL Original Pro Sound, 12-hour battery, IP67 waterproof and dustproof.', price: 9999, mrp: 14999, category: electronics._id, brand: 'JBL', stock: 90, ratings: 4.5, numReviews: 678,
        images: [{ url: img(225), public_id: 'p5' }], tags: ['speaker', 'bluetooth', 'portable'], features: ['12hr Battery', 'IP67', 'Pro Sound'] },

      { name: 'Canon EOS R50 Camera', description: 'Compact mirrorless with 24.2MP APS-C sensor, 4K video, eye-tracking AF. Perfect for content creators.', price: 69990, mrp: 79990, category: electronics._id, brand: 'Canon', stock: 35, ratings: 4.6, numReviews: 123,
        images: [{ url: img(250), public_id: 'p6' }], tags: ['camera', 'mirrorless', 'photography'], features: ['24.2MP', '4K Video', 'Eye-Tracking AF'] },

      { name: 'iPad Air M2 Tablet', description: 'Powerful 11-inch iPad with M2 chip, Liquid Retina display, Apple Pencil support, and all-day battery life.', price: 69900, mrp: 79900, category: electronics._id, brand: 'Apple', stock: 40, ratings: 4.7, numReviews: 210, isFeatured: true,
        images: [{ url: img(201), public_id: 'p7' }], tags: ['tablet', 'apple', 'ipad'], features: ['M2 Chip', '11" Display', 'Apple Pencil'] },

      { name: 'Samsung 55" 4K Smart TV', description: '55-inch 4K UHD display with Dolby Atmos, Crystal processor, and Smart Hub for streaming.', price: 54990, mrp: 69990, category: electronics._id, brand: 'Samsung', stock: 20, ratings: 4.5, numReviews: 98,
        images: [{ url: img(256), public_id: 'p8' }], tags: ['tv', 'smart-tv', '4k'], features: ['4K UHD', 'Dolby Atmos', 'Smart Hub'] },

      { name: 'AirPods Pro 2nd Generation', description: 'Active Noise Cancellation, Adaptive Transparency, personalized Spatial Audio with H2 chip.', price: 24900, mrp: 26900, category: electronics._id, brand: 'Apple', stock: 100, ratings: 4.7, numReviews: 543,
        images: [{ url: img(3), public_id: 'p9' }], tags: ['earbuds', 'wireless', 'apple'], features: ['ANC', 'H2 Chip', 'Spatial Audio'] },

      { name: 'Logitech MX Master 3S Mouse', description: 'Advanced wireless mouse with 8K DPI sensor, MagSpeed scroll wheel, quiet clicks, USB-C rapid charging.', price: 9995, mrp: 11995, category: electronics._id, brand: 'Logitech', stock: 70, ratings: 4.6, numReviews: 312,
        images: [{ url: img(60), public_id: 'p10' }], tags: ['mouse', 'wireless', 'ergonomic'], features: ['8K DPI', 'MagSpeed', 'USB-C'] },

      // ═══ CLOTHING (10) ═══
      { name: 'Classic White Oxford Shirt', description: 'Premium cotton Oxford shirt with button-down collar. Perfect for office or casual. Slim fit design.', price: 1999, mrp: 3499, category: clothing._id, brand: 'H&M', stock: 150, ratings: 4.4, numReviews: 234,
        images: [{ url: img(334), public_id: 'p11' }], tags: ['shirt', 'formal', 'cotton', 'men'], features: ['100% Cotton', 'Slim Fit', 'Button-Down Collar'] },

      { name: 'Levi\'s 501 Original Jeans', description: 'The original blue jean since 1873. Straight leg, button fly, sits at waist. 100% cotton denim.', price: 3999, mrp: 5999, category: clothing._id, brand: 'Levi\'s', stock: 120, ratings: 4.5, numReviews: 567,
        images: [{ url: img(335), public_id: 'p12' }], tags: ['jeans', 'denim', 'men'], features: ['100% Cotton', 'Straight Fit', 'Button Fly'] },

      { name: 'Floral Summer Midi Dress', description: 'Lightweight floral midi dress with V-neckline and adjustable waist tie. Perfect for summer outings.', price: 2499, mrp: 3999, category: clothing._id, brand: 'Zara', stock: 80, ratings: 4.6, numReviews: 189, isFeatured: true,
        images: [{ url: img(338), public_id: 'p13' }], tags: ['dress', 'summer', 'floral', 'women'], features: ['Lightweight', 'V-Neckline', 'Midi Length'] },

      { name: 'Men\'s Slim Fit Chinos', description: 'Versatile cotton chinos with stretch comfort. Smart-casual essential for any wardrobe.', price: 1799, mrp: 2999, category: clothing._id, brand: 'Allen Solly', stock: 130, ratings: 4.3, numReviews: 345,
        images: [{ url: img(342), public_id: 'p14' }], tags: ['chinos', 'pants', 'men'], features: ['Cotton Blend', 'Stretch', 'Slim Fit'] },

      { name: 'Women\'s Faux Leather Jacket', description: 'Classic biker-style faux leather jacket with zip-up front, quilted shoulders, and satin lining.', price: 4999, mrp: 7999, category: clothing._id, brand: 'Mango', stock: 45, ratings: 4.7, numReviews: 156,
        images: [{ url: img(349), public_id: 'p15' }], tags: ['jacket', 'leather', 'women'], features: ['Faux Leather', 'Zip Front', 'Satin Lining'] },

      { name: 'Casual Graphic T-Shirt', description: 'Soft cotton graphic tee with vintage print. Relaxed fit for everyday comfort. Unisex.', price: 799, mrp: 1499, category: clothing._id, brand: 'Bewakoof', stock: 200, ratings: 4.2, numReviews: 890,
        images: [{ url: img(336), public_id: 'p16' }], tags: ['tshirt', 'casual', 'graphic'], features: ['100% Cotton', 'Relaxed Fit', 'Printed'] },

      { name: 'Wool Blend Winter Overcoat', description: 'Premium wool blend overcoat with notch lapel and double-breasted closure. Tailored silhouette.', price: 6999, mrp: 11999, category: clothing._id, brand: 'Raymond', stock: 30, ratings: 4.6, numReviews: 89,
        images: [{ url: img(346), public_id: 'p17' }], tags: ['coat', 'winter', 'wool', 'men'], features: ['Wool Blend', 'Double-Breasted', 'Tailored'] },

      { name: 'Ethnic Anarkali Kurta Set', description: 'Elegant Anarkali kurta with palazzo pants and dupatta. Embroidered neckline with mirror work.', price: 3499, mrp: 5999, category: clothing._id, brand: 'Biba', stock: 60, ratings: 4.5, numReviews: 312,
        images: [{ url: img(400), public_id: 'p18' }], tags: ['kurta', 'ethnic', 'women', 'indian'], features: ['Embroidered', 'Mirror Work', '3-Piece Set'] },

      { name: 'Classic Denim Jacket', description: 'Timeless trucker-style denim jacket with button closure, chest pockets, and adjustable waist tabs.', price: 2999, mrp: 4499, category: clothing._id, brand: 'Levi\'s', stock: 75, ratings: 4.4, numReviews: 278,
        images: [{ url: img(399), public_id: 'p19' }], tags: ['jacket', 'denim', 'casual'], features: ['100% Cotton', 'Button Closure', 'Chest Pockets'] },

      { name: 'Linen Summer Trousers', description: 'Breathable linen-cotton blend trousers with drawstring waist. Perfect for summer and travel.', price: 1599, mrp: 2499, category: clothing._id, brand: 'Uniqlo', stock: 100, ratings: 4.3, numReviews: 198,
        images: [{ url: img(403), public_id: 'p20' }], tags: ['trousers', 'linen', 'summer'], features: ['Linen Blend', 'Drawstring', 'Breathable'] },

      // ═══ FOOTWEAR (8) ═══
      { name: 'Nike Air Max 270 Sneakers', description: 'Large Max Air unit for maximum comfort during all-day wear. Mesh upper and foam midsole.', price: 12995, mrp: 15995, category: footwear._id, brand: 'Nike', stock: 100, ratings: 4.5, numReviews: 312, isFeatured: true,
        images: [{ url: img(21), public_id: 'p21' }], tags: ['sneakers', 'nike', 'running'], features: ['Max Air Unit', 'Mesh Upper', 'Foam Midsole'] },

      { name: 'Adidas Ultraboost Running Shoes', description: 'Premium running shoes with Boost midsole, Primeknit upper, and Continental rubber outsole.', price: 16999, mrp: 19999, category: footwear._id, brand: 'Adidas', stock: 85, ratings: 4.6, numReviews: 445,
        images: [{ url: img(103), public_id: 'p22' }], tags: ['running', 'adidas', 'sports'], features: ['Boost Midsole', 'Primeknit', 'Continental Rubber'] },

      { name: 'Classic Chelsea Leather Boots', description: 'Genuine leather Chelsea boots with elastic side panels and pull tab. Timeless dressy-casual style.', price: 5499, mrp: 7999, category: footwear._id, brand: 'Clarks', stock: 55, ratings: 4.5, numReviews: 178,
        images: [{ url: img(362), public_id: 'p23' }], tags: ['boots', 'leather', 'chelsea'], features: ['Genuine Leather', 'Elastic Panels', 'Pull Tab'] },

      { name: 'Women\'s Block Heel Sandals', description: 'Elegant block heel sandals with ankle strap and cushioned insole. 3-inch heel. Multiple colors.', price: 2499, mrp: 3999, category: footwear._id, brand: 'Steve Madden', stock: 65, ratings: 4.4, numReviews: 267,
        images: [{ url: img(380), public_id: 'p24' }], tags: ['heels', 'sandals', 'women'], features: ['Block Heel', 'Ankle Strap', 'Cushioned Insole'] },

      { name: 'Converse Chuck Taylor All Star', description: 'The iconic canvas sneaker since 1917. High-top with rubber toe cap and All Star ankle patch.', price: 3999, mrp: 4999, category: footwear._id, brand: 'Converse', stock: 130, ratings: 4.6, numReviews: 890,
        images: [{ url: img(405), public_id: 'p25' }], tags: ['sneakers', 'converse', 'canvas'], features: ['Canvas Upper', 'Rubber Sole', 'High-Top'] },

      { name: 'Birkenstock Arizona Sandals', description: 'Classic two-strap sandal with contoured cork-latex footbed. Anatomically shaped for all-day comfort.', price: 7990, mrp: 9990, category: footwear._id, brand: 'Birkenstock', stock: 50, ratings: 4.7, numReviews: 345,
        images: [{ url: img(325), public_id: 'p26' }], tags: ['sandals', 'comfort', 'casual'], features: ['Cork Footbed', 'Two-Strap', 'Anatomical'] },

      { name: 'Puma RS-X Bold Sneakers', description: 'Retro-inspired chunky sneakers with mesh upper, cushioned midsole, and bold colorway.', price: 8999, mrp: 10999, category: footwear._id, brand: 'Puma', stock: 70, ratings: 4.3, numReviews: 234,
        images: [{ url: img(406), public_id: 'p27' }], tags: ['sneakers', 'puma', 'retro'], features: ['Chunky Sole', 'Mesh Upper', 'Cushioned'] },

      { name: 'Formal Oxford Shoes - Brown', description: 'Handcrafted genuine leather Oxford shoes with brogue detailing. Goodyear welted sole.', price: 6499, mrp: 8999, category: footwear._id, brand: 'Hush Puppies', stock: 40, ratings: 4.5, numReviews: 156,
        images: [{ url: img(341), public_id: 'p28' }], tags: ['formal', 'leather', 'oxford'], features: ['Genuine Leather', 'Brogue Detail', 'Goodyear Welt'] },

      // ═══ ACCESSORIES (7) ═══
      { name: 'Fossil Gen 6 Smartwatch', description: 'Wear OS smartwatch with Snapdragon 4100+, SpO2, heart rate, NFC payments, rapid charging.', price: 22995, mrp: 29995, category: accessories._id, brand: 'Fossil', stock: 55, ratings: 4.3, numReviews: 345, isFeatured: true,
        images: [{ url: img(175), public_id: 'p29' }], tags: ['smartwatch', 'wearable', 'fossil'], features: ['Wear OS', 'SpO2', 'NFC'] },

      { name: 'Ray-Ban Aviator Classic', description: 'Iconic Aviator sunglasses with gold metal frame and green G-15 lenses. UV400 protection since 1937.', price: 7990, mrp: 9990, category: accessories._id, brand: 'Ray-Ban', stock: 70, ratings: 4.7, numReviews: 456,
        images: [{ url: img(376), public_id: 'p30' }], tags: ['sunglasses', 'rayban', 'aviator'], features: ['UV400', 'G-15 Lenses', 'Gold Frame'] },

      { name: 'Titan Classique Analog Watch', description: 'Elegant analog watch with genuine leather strap, sapphire crystal glass, 50m water resistance.', price: 5495, mrp: 7995, category: accessories._id, brand: 'Titan', stock: 60, ratings: 4.4, numReviews: 278,
        images: [{ url: img(188), public_id: 'p31' }], tags: ['watch', 'analog', 'leather'], features: ['Sapphire Crystal', 'Leather Strap', '50m WR'] },

      { name: 'Premium Leather Laptop Bag', description: 'Full-grain leather laptop bag with padded compartment. Fits up to 15.6 inches. Multiple pockets.', price: 3999, mrp: 5999, category: accessories._id, brand: 'Hidesign', stock: 45, ratings: 4.5, numReviews: 198,
        images: [{ url: img(111), public_id: 'p32' }], tags: ['bag', 'laptop', 'leather'], features: ['Full-Grain Leather', 'Padded', 'Fits 15.6"'] },

      { name: 'Sterling Silver Chain Necklace', description: '925 Sterling silver chain necklace with lobster clasp. 18-inch length. Minimalist design.', price: 2499, mrp: 3999, category: accessories._id, brand: 'Giva', stock: 80, ratings: 4.3, numReviews: 167,
        images: [{ url: img(381), public_id: 'p33' }], tags: ['necklace', 'silver', 'jewelry'], features: ['925 Silver', 'Lobster Clasp', '18 inch'] },

      { name: 'Canvas Travel Backpack', description: 'Durable canvas backpack with multiple compartments, laptop sleeve, and water-resistant coating.', price: 1999, mrp: 3499, category: accessories._id, brand: 'Roadster', stock: 90, ratings: 4.4, numReviews: 423,
        images: [{ url: img(116), public_id: 'p34' }], tags: ['backpack', 'canvas', 'travel'], features: ['Water-Resistant', 'Laptop Sleeve', 'Multi-Pocket'] },

      { name: 'Polarized Wayfarer Sunglasses', description: 'Classic wayfarer style with polarized lenses. Lightweight acetate frame with spring hinges.', price: 2999, mrp: 4999, category: accessories._id, brand: 'Vincent Chase', stock: 95, ratings: 4.2, numReviews: 534,
        images: [{ url: img(378), public_id: 'p35' }], tags: ['sunglasses', 'polarized', 'wayfarer'], features: ['Polarized', 'Acetate Frame', 'Spring Hinges'] },

      // ═══ HOME & KITCHEN (5) ═══
      { name: 'Instant Pot Duo 7-in-1 Cooker', description: 'Multi-use: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, warmer. 6 quart.', price: 8999, mrp: 12999, category: homeKitchen._id, brand: 'Instant Pot', stock: 60, ratings: 4.6, numReviews: 890, isFeatured: true,
        images: [{ url: img(164), public_id: 'p36' }], tags: ['cooker', 'kitchen', 'appliance'], features: ['7-in-1', '6 Qt', '13 Programs'] },

      { name: 'Dyson V15 Cordless Vacuum', description: 'Most powerful cordless vacuum with laser dust detection and piezo sensor showing real-time counts.', price: 52900, mrp: 62900, category: homeKitchen._id, brand: 'Dyson', stock: 25, ratings: 4.8, numReviews: 156,
        images: [{ url: img(239), public_id: 'p37' }], tags: ['vacuum', 'cordless', 'cleaning'], features: ['Laser Detect', '60min Battery', 'HEPA'] },

      { name: 'IKEA KALLAX Shelf Unit', description: 'Versatile 8-compartment storage unit. Use as room divider, bookshelf, or TV console.', price: 7990, mrp: 9990, category: homeKitchen._id, brand: 'IKEA', stock: 40, ratings: 4.4, numReviews: 567,
        images: [{ url: img(37), public_id: 'p38' }], tags: ['furniture', 'shelf', 'storage'], features: ['8 Compartments', 'Multi-use', 'Easy Assembly'] },

      { name: 'Nespresso Vertuo Coffee Machine', description: 'Single-serve coffee maker with centrifusion technology. Brews 5 cup sizes from espresso to alto.', price: 14990, mrp: 18990, category: homeKitchen._id, brand: 'Nespresso', stock: 35, ratings: 4.7, numReviews: 234,
        images: [{ url: img(425), public_id: 'p39' }], tags: ['coffee', 'machine', 'kitchen'], features: ['Centrifusion', '5 Cup Sizes', 'One-Touch'] },

      { name: 'Prestige Mixer Grinder 750W', description: '750W mixer grinder with 3 stainless steel jars. Wet/dry grinding, blending, chutney making.', price: 3499, mrp: 4999, category: homeKitchen._id, brand: 'Prestige', stock: 80, ratings: 4.3, numReviews: 678,
        images: [{ url: img(165), public_id: 'p40' }], tags: ['mixer', 'grinder', 'kitchen'], features: ['750W Motor', '3 Jars', 'Stainless Steel'] },

      // ═══ BEAUTY (5) ═══
      { name: 'The Ordinary Niacinamide Serum', description: 'High-strength vitamin and mineral blemish formula. 10% Niacinamide + 1% Zinc. Cruelty-free.', price: 590, mrp: 790, category: beauty._id, brand: 'The Ordinary', stock: 200, ratings: 4.5, numReviews: 1567,
        images: [{ url: img(64), public_id: 'p41' }], tags: ['skincare', 'serum', 'niacinamide'], features: ['10% Niacinamide', 'Zinc Formula', 'Cruelty-Free'] },

      { name: 'Dyson Airwrap Hair Styler', description: 'Complete styling tool that curls, waves, smooths, and dries. Coanda effect technology, no extreme heat.', price: 44900, mrp: 49900, category: beauty._id, brand: 'Dyson', stock: 20, ratings: 4.7, numReviews: 234,
        images: [{ url: img(65), public_id: 'p42' }], tags: ['hair', 'styling', 'dyson'], features: ['Coanda Effect', 'No Extreme Heat', 'Multi Attachments'] },

      { name: 'MAC Ruby Woo Matte Lipstick', description: 'Iconic retro matte lipstick in vivid blue-red shade. Long-wearing, full coverage formula.', price: 1800, mrp: 2100, category: beauty._id, brand: 'MAC', stock: 120, ratings: 4.6, numReviews: 890,
        images: [{ url: img(96), public_id: 'p43' }], tags: ['lipstick', 'mac', 'matte'], features: ['Retro Matte', 'Long-Wearing', 'Full Coverage'] },

      { name: 'Forest Essentials Night Cream', description: 'Ayurvedic night cream with saffron, gold, and papaya. Rejuvenates and tones skin overnight.', price: 2475, mrp: 2750, category: beauty._id, brand: 'Forest Essentials', stock: 50, ratings: 4.4, numReviews: 345,
        images: [{ url: img(152), public_id: 'p44' }], tags: ['skincare', 'night-cream', 'ayurvedic'], features: ['Saffron & Gold', 'Ayurvedic', 'Rejuvenating'] },

      { name: 'Maybelline Fit Me Foundation', description: 'Lightweight foundation with poreless, matte finish. Oil-free, non-comedogenic. 40 shades.', price: 499, mrp: 650, category: beauty._id, brand: 'Maybelline', stock: 150, ratings: 4.3, numReviews: 1234,
        images: [{ url: img(145), public_id: 'p45' }], tags: ['foundation', 'makeup', 'skin'], features: ['Oil-Free', 'Poreless Finish', '40 Shades'] },

      // ═══ BOOKS (5) ═══
      { name: 'Atomic Habits by James Clear', description: '#1 NYT Bestseller. Tiny changes lead to remarkable results. Over 10 million copies sold worldwide.', price: 499, mrp: 799, category: books._id, brand: 'Penguin', stock: 200, ratings: 4.8, numReviews: 2345, isFeatured: true,
        images: [{ url: img(24), public_id: 'p46' }], tags: ['self-help', 'habits', 'bestseller'], features: ['#1 Bestseller', 'Self-Help', '320 Pages'] },

      { name: 'The Psychology of Money', description: '19 short stories on how people think about money. Timeless lessons on wealth, greed and happiness.', price: 399, mrp: 599, category: books._id, brand: 'Harriman House', stock: 180, ratings: 4.7, numReviews: 1890,
        images: [{ url: img(34), public_id: 'p47' }], tags: ['finance', 'self-help', 'money'], features: ['Finance', 'Bestseller', '256 Pages'] },

      { name: 'Rich Dad Poor Dad', description: 'Robert Kiyosaki\'s guide to financial literacy. Challenges conventional beliefs about money and investing.', price: 399, mrp: 599, category: books._id, brand: 'Plata Publishing', stock: 160, ratings: 4.5, numReviews: 3456,
        images: [{ url: img(42), public_id: 'p48' }], tags: ['finance', 'investing', 'bestseller'], features: ['Financial Literacy', 'Classic', '336 Pages'] },

      { name: 'Sapiens by Yuval Noah Harari', description: 'A brief history of humankind. How Homo sapiens became Earth\'s dominant species. 15M+ copies sold.', price: 599, mrp: 899, category: books._id, brand: 'Harper', stock: 140, ratings: 4.6, numReviews: 2100,
        images: [{ url: img(44), public_id: 'p49' }], tags: ['history', 'science', 'non-fiction'], features: ['History', 'Bestseller', '464 Pages'] },

      { name: 'Think and Grow Rich', description: 'Napoleon Hill\'s classic on success principles. Based on 20 years of research on 500+ achievers.', price: 299, mrp: 499, category: books._id, brand: 'Fingerprint', stock: 170, ratings: 4.4, numReviews: 1560,
        images: [{ url: img(36), public_id: 'p50' }], tags: ['self-help', 'success', 'classic'], features: ['Classic', 'Success', '238 Pages'] },

      // ═══ SPORTS & FITNESS (5) ═══
      { name: 'Premium Yoga Mat 6mm', description: 'Extra thick eco-friendly TPE yoga mat with alignment lines. Non-slip surface, carrying strap included.', price: 1499, mrp: 2499, category: sports._id, brand: 'Boldfit', stock: 120, ratings: 4.3, numReviews: 678,
        images: [{ url: img(26), public_id: 'p51' }], tags: ['yoga', 'fitness', 'mat'], features: ['6mm Thick', 'Non-Slip', 'Eco-Friendly'] },

      { name: 'Adjustable Dumbbell Set 20kg', description: 'Professional adjustable dumbbells with anti-slip grip. Quick-change weight from 2.5kg to 20kg.', price: 4999, mrp: 7999, category: sports._id, brand: 'PowerMax', stock: 65, ratings: 4.4, numReviews: 234,
        images: [{ url: img(28), public_id: 'p52' }], tags: ['gym', 'weights', 'strength'], features: ['Adjustable', 'Anti-Slip', '2.5-20kg'] },

      { name: 'Resistance Bands Set (5 Pack)', description: '5 resistance levels from light to extra heavy. Natural latex with handles, door anchor, ankle straps.', price: 999, mrp: 1999, category: sports._id, brand: 'Fitlastics', stock: 150, ratings: 4.2, numReviews: 567,
        images: [{ url: img(15), public_id: 'p53' }], tags: ['bands', 'fitness', 'home-workout'], features: ['5 Levels', 'Natural Latex', 'Full Kit'] },

      { name: 'Speed Skipping Rope Pro', description: 'Ball bearing speed rope with adjustable steel cable. Comfortable foam handles for HIIT and cardio.', price: 599, mrp: 999, category: sports._id, brand: 'Fitkit', stock: 200, ratings: 4.1, numReviews: 456,
        images: [{ url: img(17), public_id: 'p54' }], tags: ['cardio', 'skipping', 'hiit'], features: ['Ball Bearing', 'Steel Cable', 'Foam Handles'] },

      { name: 'Whey Protein Isolate 1kg', description: '90% pure whey protein isolate. 27g protein per serving, low carb, zero sugar. Chocolate flavour.', price: 2499, mrp: 3499, category: sports._id, brand: 'MuscleBlaze', stock: 100, ratings: 4.5, numReviews: 890, isFeatured: true,
        images: [{ url: img(30), public_id: 'p55' }], tags: ['protein', 'supplement', 'fitness'], features: ['90% Isolate', '27g Protein', 'Zero Sugar'] },
    ];

    await Product.insertMany(products);
    console.log(`Created ${products.length} products`);

    console.log('\n✅ Seed completed successfully!');
    console.log(`📦 ${products.length} Products across ${categories.length} Categories`);
    console.log('\n📧 Admin Login: admin@shopverse.com / admin123');
    console.log('📧 User Login: john@example.com / user123\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedData();
