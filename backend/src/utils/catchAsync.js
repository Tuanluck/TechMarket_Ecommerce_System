// Hàm wrapper bọc quanh async functions để tự động bắt lỗi và chuyển tiếp tới Global Error Middleware
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
