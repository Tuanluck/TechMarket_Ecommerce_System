const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorMiddleware');
const authRoute = require('./routes/authRoute');

const app = express();

// --- 2. CORS Configuration ---
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error("Không được phép truy cập bởi CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

const path = require('path');
app.use('/images', express.static(path.join(__dirname, '../public/images')));



// --- 5. API Routes ---
app.use('/api/v1/auth', authRoute);

const userRoute = require('./routes/userRoute');
const categoryRoute = require('./routes/categoryRoute');
const brandRoute = require('./routes/brandRoute');
const productRoute = require('./routes/productRoute');
const cartRoute = require('./routes/cartRoute');
const orderRoute = require('./routes/orderRoute');
const paymentRoute = require('./routes/paymentRoute');
const adminRoute = require('./routes/adminRoute');
const voucherRoute = require('./routes/voucherRoute');
const reviewRoute = require('./routes/reviewRoute');
const wishlistRoute = require('./routes/wishlistRoute');
const flashSaleRoute = require('./routes/flashSaleRoute');
const uploadRoute = require('./routes/uploadRoute');

app.use('/api/v1/users', userRoute);
app.use('/api/v1/categories', categoryRoute);
app.use('/api/v1/brands', brandRoute);
app.use('/api/v1/products', productRoute);
app.use('/api/v1/cart', cartRoute);
app.use('/api/v1/orders', orderRoute);
app.use('/api/v1/payments', paymentRoute);
app.use('/api/v1/admin', adminRoute);
app.use('/api/v1/vouchers', voucherRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/wishlist', wishlistRoute);
app.use('/api/v1/flash-sales', flashSaleRoute);
app.use('/api/v1/uploads', uploadRoute);

app.get('/', (req, res) => {
  res.json('Welcome to TechMarket API')
})
app.use((req, res, next) => {
  const error = new Error("Route không tồn tại");
  error.status = 404;
  next(error);
});

app.use(errorHandler)
module.exports = app;