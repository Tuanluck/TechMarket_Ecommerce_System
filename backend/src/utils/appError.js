class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Đánh dấu lỗi nghiệp vụ (operational error) để phân biệt với lỗi hệ thống/lỗi code

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
