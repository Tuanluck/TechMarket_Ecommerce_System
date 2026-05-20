const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();


const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép request từ server-to-server hoặc tool không có origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
// Đặt các route ở đây, ví dụ:
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));
app.use((req, res, next) => {
  const error = new Error("Route không tồn tại");
  error.status = 404;
  next(error);
});

module.exports = app;