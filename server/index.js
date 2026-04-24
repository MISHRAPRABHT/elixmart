const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION. Shutting down.');
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION. Shutting down.');
  console.error(reason);
  process.exit(1);
});

// Middleware
app.use(
  cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use(errorHandler);

// Connect DB & start server only after successful connection
const startServer = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.mongo_uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('Missing required environment variable: MONGO_URI');
    console.error('Tip: set MONGO_URI in Render dashboard Environment settings.');
    process.exit(1);
  }

  if (!process.env.MONGO_URI && process.env.mongo_uri) {
    console.warn('Using lowercase env var mongo_uri. Please rename it to MONGO_URI in Render.');
  }

  if (!process.env.MONGO_URI && process.env.MONGODB_URI) {
    console.warn('Using legacy env var MONGODB_URI. Please rename it to MONGO_URI in Render.');
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed.');
    console.error(err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
