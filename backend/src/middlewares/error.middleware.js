const AppError = require('../utils/appError');

// Xử lý lỗi CastError của Mongoose (ví dụ: truyền sai định dạng ObjectId)
const handleCastErrorDB = (err) => {
  const message = `Định dạng dữ liệu không hợp lệ: ${err.path} là ${err.value}.`;
  return new AppError(message, 400);
};

// Xử lý lỗi trùng lặp dữ liệu (Duplicate Fields) từ MongoDB
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Giá trị dữ liệu đã tồn tại: ${value}. Vui lòng nhập giá trị khác!`;
  return new AppError(message, 400);
};

// Xử lý lỗi validate dữ liệu từ Mongoose Schema
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Dữ liệu không hợp lệ: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Gửi thông tin lỗi chi tiết ở môi trường Development
const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Gửi thông báo lỗi tối giản ở môi trường Production để bảo mật thông tin
const sendErrorProd = (err, req, res) => {
  // A. Lỗi nghiệp vụ đã được định nghĩa trước (Operational Error): Trả thông tin chi tiết cho khách hàng
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // B. Lỗi hệ thống hoặc lỗi code chưa biết: Log lỗi chi tiết lên server và gửi thông báo chung chung
  console.error('💥 ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Đã xảy ra lỗi hệ thống nội bộ. Vui lòng thử lại sau!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production' || true) {
    // Để mặc định xử lý production-ready
    let error = { ...err };
    error.message = err.message;

    // Phân loại và chuẩn hóa các lỗi từ MongoDB/Mongoose
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, req, res);
  }
};
