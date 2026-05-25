const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/error.middleware');

const app = express();

// --- 1. Security Middlewares (Bảo mật nâng cao) ---
app.use(helmet());
app.use(mongoSanitize());

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

// --- 3. Body Parsers ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 4. Request Logging ---
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// --- 5. Health Check Route ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hệ thống TechMarket đang hoạt động ổn định',
    timestamp: new Date()
  });
});

// --- 6. 404 Route Handler (Sử dụng AppError) ---
app.use((req, res, next) => {
  next(new AppError(`Không tìm thấy endpoint: ${req.originalUrl} trên server`, 404));
});

// --- 7. Global Error Handler (Đã chuẩn hóa JSend) ---
app.use(globalErrorHandler);

module.exports = app;